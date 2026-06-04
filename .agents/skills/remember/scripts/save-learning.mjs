#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const repoRoot = '/home/tan/agent-learning';
const learningsDir = path.join(repoRoot, 'learnings');

function usage() {
  console.error(`Usage:
  save-learning.mjs --title "Title" --agent "Name <email>" [--commit] [--push] [--dry-run]

The note body is read from stdin.`);
}

function parseArgs(argv) {
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
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function slugify(title) {
  const slug = title
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');

  return slug || 'learning';
}

function uniquePath(date, slug) {
  let filename = `${date}-${slug}.md`;
  let filePath = path.join(learningsDir, filename);
  let counter = 2;

  while (fs.existsSync(filePath)) {
    filename = `${date}-${slug}-${counter}.md`;
    filePath = path.join(learningsDir, filename);
    counter += 1;
  }

  return { filename, filePath };
}

function runGit(args, options = {}) {
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

function agentLabel(agent) {
  return agent.replace(/\s*<[^>]+>\s*$/, '').trim() || agent;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.title || !options.agent) {
    usage();
    process.exit(1);
  }

  const body = fs.readFileSync(0, 'utf8').trim();
  if (!body && !options.dryRun) {
    throw new Error('Note body is empty. Provide Markdown content on stdin.');
  }

  const date = localDateString();
  const slug = slugify(options.title);
  const { filename, filePath } = uniquePath(date, slug);
  const relativePath = path.relative(repoRoot, filePath);
  const note = `# ${options.title}

Date: ${date}
Agent: ${agentLabel(options.agent)}

${body}
`;

  const commitMessage = `Add learning: ${options.title}

Co-authored-by: ${options.agent}
`;

  if (options.dryRun) {
    console.log(`Would write: ${filePath}`);
    console.log(`Would commit with message:\n${commitMessage}`);
    return;
  }

  fs.mkdirSync(learningsDir, { recursive: true });
  fs.writeFileSync(filePath, note);

  if (!options.commit) {
    console.log(`Saved ${relativePath}`);
    return;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remember-commit-'));
  const messagePath = path.join(tempDir, 'message.txt');
  fs.writeFileSync(messagePath, commitMessage);

  try {
    runGit(['add', '--', relativePath]);
    runGit(['commit', '-F', messagePath, '--', relativePath], { stdio: 'inherit' });

    const commitHash = runGit(['rev-parse', '--short', 'HEAD']);
    console.log(`Saved ${relativePath}`);
    console.log(`Commit ${commitHash}`);

    if (options.push) {
      const remote = spawnSync('git', ['remote', 'get-url', 'origin'], {
        cwd: repoRoot,
        encoding: 'utf8',
      });

      if (remote.status !== 0) {
        console.log('No origin remote configured; skipped push.');
      } else {
        runGit(['push', 'origin', 'HEAD'], { stdio: 'inherit' });
      }
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`remember: ${error.message}`);
  process.exit(1);
}
