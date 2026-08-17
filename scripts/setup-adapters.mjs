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
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error('Could not determine git repository root.');
  }
  return result.stdout.trim();
}

export function getAgentTargets(homeDir = os.homedir(), repoRoot = getRepoRoot()) {
  const sourcePath = path.join(repoRoot, '.agents', 'skills', 'remember');
  return [
    {
      name: 'Agents (Codex / Antigravity / Gemini standard)',
      linkPath: path.join(homeDir, '.agents', 'skills', 'remember'),
      sourcePath,
    },
    {
      name: 'Claude Code',
      linkPath: path.join(homeDir, '.claude', 'skills', 'remember'),
      sourcePath,
    },
    {
      name: 'Gemini CLI',
      linkPath: path.join(homeDir, '.gemini', 'skills', 'remember'),
      sourcePath,
    },
  ];
}

export function inspectTarget(target) {
  if (!fs.existsSync(target.linkPath) && !fs.lstatSync(target.linkPath, { throwIfNoEntry: false })) {
    return { status: 'missing', current: null };
  }

  const stat = fs.lstatSync(target.linkPath);
  if (!stat.isSymbolicLink()) {
    return { status: 'not-a-symlink', current: target.linkPath };
  }

  const realTarget = fs.readlinkSync(target.linkPath);
  const resolvedTarget = path.resolve(path.dirname(target.linkPath), realTarget);
  if (resolvedTarget === path.resolve(target.sourcePath)) {
    return { status: 'linked', current: resolvedTarget };
  }

  return { status: 'different-target', current: resolvedTarget };
}

export function linkTarget(target, { dryRun = false } = {}) {
  const parentDir = path.dirname(target.linkPath);
  const state = inspectTarget(target);

  if (state.status === 'linked') {
    return { action: 'already-linked', target };
  }

  if (dryRun) {
    return { action: 'would-link', target, from: state.current, to: target.sourcePath };
  }

  fs.mkdirSync(parentDir, { recursive: true });

  if (state.status === 'different-target' || state.status === 'not-a-symlink') {
    fs.rmSync(target.linkPath, { recursive: true, force: true });
  }

  fs.symlinkSync(target.sourcePath, target.linkPath);
  return { action: 'linked', target };
}

export function setupAdapters({ homeDir = os.homedir(), repoRoot = getRepoRoot(), dryRun = false } = {}) {
  const targets = getAgentTargets(homeDir, repoRoot);
  const results = [];

  for (const target of targets) {
    results.push(linkTarget(target, { dryRun }));
  }

  return results;
}

function usage() {
  console.log(`Usage:
  setup-adapters.mjs [--status] [--dry-run]

Options:
  --status, -s    Check the link status for all Agent platforms
  --dry-run, -d   Simulate creating symlinks without modifying the filesystem
  --help, -h      Show this help message`);
}

function main() {
  const args = process.argv.slice(2);
  const isStatus = args.includes('--status') || args.includes('-s');
  const isDryRun = args.includes('--dry-run') || args.includes('-d');
  const isHelp = args.includes('--help') || args.includes('-h');

  if (isHelp) {
    usage();
    process.exit(0);
  }

  const repoRoot = getRepoRoot();
  const homeDir = os.homedir();
  const targets = getAgentTargets(homeDir, repoRoot);

  if (isStatus) {
    console.log(`Agent Adapter Status for ${repoRoot}:`);
    for (const target of targets) {
      const state = inspectTarget(target);
      const icon = state.status === 'linked' ? '✓' : '✗';
      console.log(`  [${icon}] ${target.name}`);
      console.log(`      Path:   ${target.linkPath}`);
      console.log(`      Status: ${state.status} (points to: ${state.current || 'none'})`);
    }
    return;
  }

  const results = setupAdapters({ homeDir, repoRoot, dryRun: isDryRun });
  for (const res of results) {
    if (res.action === 'already-linked') {
      console.log(`✓ ${res.target.name} already correctly linked to ${res.target.sourcePath}`);
    } else if (res.action === 'would-link') {
      console.log(`* [dry-run] Would link ${res.target.linkPath} -> ${res.target.sourcePath}`);
    } else {
      console.log(`✓ Linked ${res.target.name}: ${res.target.linkPath} -> ${res.target.sourcePath}`);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(`setup-adapters: ${error.message}`);
    process.exit(1);
  }
}
