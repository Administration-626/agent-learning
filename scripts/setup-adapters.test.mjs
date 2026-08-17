import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  getAgentTargets,
  inspectTarget,
  linkTarget,
  setupAdapters,
} from './setup-adapters.mjs';

test('getAgentTargets returns targets for agents, claude, and gemini', () => {
  const fakeHome = '/fake/home';
  const fakeRoot = '/fake/repo';
  const targets = getAgentTargets(fakeHome, fakeRoot);

  assert.equal(targets.length, 3);
  assert.equal(targets[0].linkPath, '/fake/home/.agents/skills/remember');
  assert.equal(targets[1].linkPath, '/fake/home/.claude/skills/remember');
  assert.equal(targets[2].linkPath, '/fake/home/.gemini/skills/remember');
  assert.equal(targets[0].sourcePath, '/fake/repo/.agents/skills/remember');
});

test('inspectTarget identifies missing, linked, and different targets', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-adapters-'));
  try {
    const fakeHome = path.join(tempDir, 'home');
    const fakeRepo = path.join(tempDir, 'repo');
    const fakeSource = path.join(fakeRepo, '.agents', 'skills', 'remember');
    fs.mkdirSync(fakeSource, { recursive: true });

    const target = {
      name: 'Test Agent',
      linkPath: path.join(fakeHome, '.agents', 'skills', 'remember'),
      sourcePath: fakeSource,
    };

    // 1. Missing
    assert.equal(inspectTarget(target).status, 'missing');

    // 2. Link correctly
    linkTarget(target);
    assert.equal(inspectTarget(target).status, 'linked');

    // 3. Dry-run when already linked
    const dryResult = linkTarget(target, { dryRun: true });
    assert.equal(dryResult.action, 'already-linked');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('setupAdapters creates all symlinks safely in dry-run and live run', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-setup-'));
  try {
    const fakeHome = path.join(tempDir, 'home');
    const fakeRepo = path.join(tempDir, 'repo');
    const fakeSource = path.join(fakeRepo, '.agents', 'skills', 'remember');
    fs.mkdirSync(fakeSource, { recursive: true });

    // Dry run first
    const dryResults = setupAdapters({ homeDir: fakeHome, repoRoot: fakeRepo, dryRun: true });
    assert.equal(dryResults.length, 3);
    assert.equal(dryResults[0].action, 'would-link');

    // Live run
    const liveResults = setupAdapters({ homeDir: fakeHome, repoRoot: fakeRepo, dryRun: false });
    assert.equal(liveResults.length, 3);
    assert.equal(liveResults[0].action, 'linked');
    assert.equal(liveResults[1].action, 'linked');
    assert.equal(liveResults[2].action, 'linked');

    // Verify all targets are now 'linked'
    const targets = getAgentTargets(fakeHome, fakeRepo);
    for (const t of targets) {
      assert.equal(inspectTarget(t).status, 'linked');
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
