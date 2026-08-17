#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getRepoRoot(startDir = __dirname) {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: startDir,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error('Could not determine git repository root.');
  }
  return result.stdout.trim();
}

export function parseLearningFile(filePath, repoRoot = '') {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const filename = path.basename(filePath);

  let title = '';
  let date = '';
  let agent = '';
  const bodyLines = [];

  // Match date from filename fallback (YYYY-MM-DD-slug.md)
  const fileDateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  if (fileDateMatch) {
    date = fileDateMatch[1];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!title && line.startsWith('# ')) {
      title = line.slice(2).trim();
      continue;
    }

    const dateMatch = line.match(/^(?:Date|日期)\s*[:：]\s*(.+)$/i);
    if (dateMatch) {
      date = dateMatch[1].trim();
      continue;
    }

    const agentMatch = line.match(/^Agent\s*[:：]\s*(.+)$/i);
    if (agentMatch) {
      agent = agentMatch[1].trim();
      continue;
    }

    bodyLines.push(lines[i]);
  }

  const body = bodyLines.join('\n').trim();

  // Extract a clean summary snippet (skip headers, find first substantive text)
  let snippet = '';
  for (const bLine of bodyLines) {
    const trimmed = bLine.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```') && trimmed.length > 10) {
      snippet = trimmed.replace(/[*_`]/g, '').slice(0, 160);
      if (trimmed.length > 160) snippet += '...';
      break;
    }
  }

  return {
    filename,
    filePath,
    relativePath: repoRoot ? path.relative(repoRoot, filePath) : filename,
    title: title || filename.replace(/\.md$/, ''),
    date: date || 'unknown',
    agent: agent || 'unknown',
    snippet: snippet || '(No preview available)',
    body,
  };
}

export function loadAllLearnings(learningsDir, repoRoot = '') {
  if (!fs.existsSync(learningsDir)) return [];
  const entries = fs.readdirSync(learningsDir, { withFileTypes: true });
  const learnings = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'INDEX.md') {
      const fullPath = path.join(learningsDir, entry.name);
      learnings.push(parseLearningFile(fullPath, repoRoot));
    }
  }

  // Sort by date descending
  return learnings.sort((a, b) => b.date.localeCompare(a.date));
}

export function scoreLearning(learning, terms) {
  if (!terms || terms.length === 0) return 1;

  let score = 0;
  const titleLower = learning.title.toLowerCase();
  const filenameLower = learning.filename.toLowerCase();
  const agentLower = learning.agent.toLowerCase();
  const bodyLower = learning.body.toLowerCase();

  for (const term of terms) {
    const termLower = term.toLowerCase();
    if (!termLower) continue;

    if (titleLower.includes(termLower)) {
      score += 15;
    }
    if (filenameLower.includes(termLower)) {
      score += 8;
    }
    if (agentLower.includes(termLower)) {
      score += 5;
    }

    // Body occurrence matches
    if (bodyLower.includes(termLower)) {
      const occurrences = bodyLower.split(termLower).length - 1;
      score += Math.min(occurrences * 2, 10);
    }
  }

  return score;
}

export function searchLearnings(learnings, query = '', { agent = '' } = {}) {
  const terms = query.trim().split(/\s+/).filter(Boolean);

  const matched = [];
  for (const item of learnings) {
    if (agent && !item.agent.toLowerCase().includes(agent.toLowerCase())) {
      continue;
    }

    const score = scoreLearning(item, terms);
    if (terms.length === 0 || score > 0) {
      matched.push({
        ...item,
        score,
      });
    }
  }

  return matched.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.date.localeCompare(a.date);
  });
}

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateIndexMarkdown(learnings) {
  const total = learnings.length;
  const agents = new Set(learnings.map(l => l.agent)).size;

  let md = `# Knowledge Index

> Total Learnings: **${total}** | Agents: **${agents}** | Last updated: **${localDateString()}**

| Date | Title | Agent | Summary |
| :--- | :--- | :--- | :--- |
`;

  for (const item of learnings) {
    const titleLink = `[${item.title.replace(/\|/g, '\\|')}](./${item.filename})`;
    const cleanSnippet = item.snippet.replace(/\|/g, '\\|');
    md += `| \`${item.date}\` | ${titleLink} | \`${item.agent}\` | ${cleanSnippet} |\n`;
  }

  return md;
}

export function updateIndexFile(repoRoot = getRepoRoot()) {
  const learningsDir = path.join(repoRoot, 'learnings');
  const learnings = loadAllLearnings(learningsDir, repoRoot);
  const indexContent = generateIndexMarkdown(learnings);
  const indexPath = path.join(learningsDir, 'INDEX.md');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  return { indexPath, total: learnings.length };
}

function usage() {
  console.log(`Usage:
  query-learning.mjs [query...] [options]

Options:
  --json          Output matching results as JSON
  --list, -l      List all learnings ordered by date
  --index, -i     Rebuild and update learnings/INDEX.md
  --agent <name>  Filter results by agent name
  --help, -h      Show this help message

Examples:
  node scripts/query-learning.mjs docker
  node scripts/query-learning.mjs "ebpf" --json
  node scripts/query-learning.mjs --index`);
}

function main() {
  const args = process.argv.slice(2);
  let isJson = false;
  let isList = false;
  let isIndex = false;
  let filterAgent = '';
  const queryTerms = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      isJson = true;
    } else if (arg === '--list' || arg === '-l') {
      isList = true;
    } else if (arg === '--index' || arg === '-i') {
      isIndex = true;
    } else if (arg === '--agent') {
      filterAgent = args[++i] || '';
    } else if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else {
      queryTerms.push(arg);
    }
  }

  const repoRoot = getRepoRoot();
  const learningsDir = path.join(repoRoot, 'learnings');

  if (isIndex) {
    const { indexPath, total } = updateIndexFile(repoRoot);
    console.log(`✓ Updated ${indexPath} (${total} learnings indexed).`);
    return;
  }

  const allLearnings = loadAllLearnings(learningsDir, repoRoot);
  const query = queryTerms.join(' ');
  const results = isList
    ? allLearnings
    : searchLearnings(allLearnings, query, { agent: filterAgent });

  if (isJson) {
    const jsonOutput = results.map(r => ({
      title: r.title,
      date: r.date,
      agent: r.agent,
      filename: r.filename,
      relativePath: r.relativePath,
      snippet: r.snippet,
      score: r.score,
    }));
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log(`No learnings found matching query: "${query}"${filterAgent ? ` (agent: ${filterAgent})` : ''}`);
    return;
  }

  console.log(`Found ${results.length} learning(s):\n`);
  for (const item of results) {
    console.log(`• [${item.date}] ${item.title}`);
    console.log(`  File:   ${item.relativePath}`);
    console.log(`  Agent:  ${item.agent}`);
    console.log(`  Snippet: ${item.snippet}\n`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(`query-learning: ${error.message}`);
    process.exit(1);
  }
}
