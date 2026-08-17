#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getRepoRoot(startDir = __dirname) {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: startDir,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    throw new Error('Could not determine git repository root.');
  }
  return result.stdout.trim();
}

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function slugify(title) {
  const slug = title
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');

  return slug || 'learning';
}

export function uniquePath(targetDir, date, slug) {
  let filename = `${date}-${slug}.md`;
  let filePath = path.join(targetDir, filename);
  let counter = 2;

  while (fs.existsSync(filePath)) {
    filename = `${date}-${slug}-${counter}.md`;
    filePath = path.join(targetDir, filename);
    counter += 1;
  }

  return { filename, filePath };
}

export function agentLabel(agent) {
  return agent.replace(/\s*<[^>]+>\s*$/, '').trim() || agent;
}

export function formatNote(title, date, agent, body) {
  return `# ${title}

Date: ${date}
Agent: ${agentLabel(agent)}

${body}
`;
}

export function formatCommitMessage(title, agent) {
  return `Add learning: ${title}

Co-authored-by: ${agent}
`;
}

export function parseArgs(argv) {
  const options = {
    title: '',
    agent: '',
    commit: false,
    push: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--title') {
      options.title = argv[++i] || '';
    } else if (arg === '--agent') {
      options.agent = argv[++i] || '';
    } else if (arg === '--commit') {
      options.commit = true;
    } else if (arg === '--push') {
      options.push = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      return null;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function usage() {
  console.error(`Usage:
  save-learning.mjs --title "Title" --agent "Name <email>" [--commit] [--push] [--dry-run]

The note body is read from stdin.`);
}

export function runGit(args, repoRoot, options = {}) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  });

  if (result.status !== 0) {
    const detail = result.stderr || result.stdout || `git ${args.join(' ')} failed`;
    throw new Error(detail.trim());
  }

  return result.stdout.trim();
}

export function saveLearning({ title, agent, body, repoRoot, commit = false, push = false, dryRun = false }) {
  if (!title) throw new Error('Title is required.');
  if (!agent) throw new Error('Agent is required.');

  const trimmedBody = (body || '').trim();
  if (!trimmedBody && !dryRun) {
    throw new Error('Note body is empty. Provide Markdown content on stdin.');
  }

  const resolvedRoot = repoRoot || getRepoRoot();
  const learningsDir = path.join(resolvedRoot, 'learnings');
  const date = localDateString();
  const slug = slugify(title);
  const { filename, filePath } = uniquePath(learningsDir, date, slug);
  const relativePath = path.relative(resolvedRoot, filePath);
  const noteContent = formatNote(title, date, agent, trimmedBody);
  const commitMessage = formatCommitMessage(title, agent);

  if (dryRun) {
    return {
      dryRun: true,
      filename,
      filePath,
      relativePath,
      noteContent,
      commitMessage,
    };
  }

  fs.mkdirSync(learningsDir, { recursive: true });
  fs.writeFileSync(filePath, noteContent);

  if (!commit) {
    return {
      committed: false,
      filename,
      filePath,
      relativePath,
    };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remember-commit-'));
  const messagePath = path.join(tempDir, 'message.txt');
  fs.writeFileSync(messagePath, commitMessage);

  try {
    runGit(['add', '--', relativePath], resolvedRoot);
    runGit(['commit', '-F', messagePath, '--', relativePath], resolvedRoot, { stdio: 'inherit' });

    const commitHash = runGit(['rev-parse', '--short', 'HEAD'], resolvedRoot);

    if (push) {
      const remote = spawnSync('git', ['remote', 'get-url', 'origin'], {
        cwd: resolvedRoot,
        encoding: 'utf8',
      });

      if (remote.status !== 0) {
        console.log('No origin remote configured; skipped push.');
      } else {
        runGit(['push', 'origin', 'HEAD'], resolvedRoot, { stdio: 'inherit' });
      }
    }

    return {
      committed: true,
      commitHash,
      filename,
      filePath,
      relativePath,
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options || !options.title || !options.agent) {
    usage();
    process.exit(1);
  }

  const body = fs.readFileSync(0, 'utf8');
  const result = saveLearning({
    ...options,
    body,
  });

  if (result.dryRun) {
    console.log(`Would write: ${result.filePath}`);
    console.log(`Would commit with message:\n${result.commitMessage}`);
  } else {
    console.log(`Saved ${result.relativePath}`);
    if (result.committed) {
      console.log(`Commit ${result.commitHash}`);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(`remember: ${error.message}`);
    process.exit(1);
  }
}
