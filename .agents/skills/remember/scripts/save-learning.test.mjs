import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  slugify,
  uniquePath,
  agentLabel,
  formatNote,
  formatCommitMessage,
  parseArgs,
  saveLearning,
} from './save-learning.mjs';

test('slugify converts titles properly', () => {
  assert.equal(slugify('Hello World!'), 'hello-world');
  assert.equal(slugify('Docker 镜像拉取与代理设置'), 'docker-镜像拉取与代理设置');
  assert.equal(slugify('---Special---Chars---@@@'), 'special-chars');
  assert.equal(slugify(''), 'learning');
});

test('agentLabel strips email angle brackets', () => {
  assert.equal(agentLabel('Antigravity <antigravity@google.com>'), 'Antigravity');
  assert.equal(agentLabel('Claude Code <claude-code@anthropic.com>'), 'Claude Code');
  assert.equal(agentLabel('SoloName'), 'SoloName');
});

test('formatNote and formatCommitMessage output correct structure', () => {
  const note = formatNote('Test Title', '2026-08-18', 'Antigravity <antigravity@google.com>', '## Note Content');
  assert.match(note, /^# Test Title/);
  assert.match(note, /Date: 2026-08-18/);
  assert.match(note, /Agent: Antigravity/);
  assert.match(note, /## Note Content/);

  const commitMsg = formatCommitMessage('Test Title', 'Antigravity <antigravity@google.com>');
  assert.equal(commitMsg, 'Add learning: Test Title\n\nCo-authored-by: Antigravity <antigravity@google.com>\n');
});

test('parseArgs correctly parses flags', () => {
  const parsed = parseArgs(['--title', 'Foo', '--agent', 'Bar <bar@example.com>', '--commit', '--push', '--dry-run']);
  assert.deepEqual(parsed, {
    title: 'Foo',
    agent: 'Bar <bar@example.com>',
    commit: true,
    push: true,
    dryRun: true,
  });
});

test('uniquePath increments counter on collisions', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-learnings-'));
  try {
    const p1 = uniquePath(tempDir, '2026-08-18', 'demo-topic');
    assert.equal(p1.filename, '2026-08-18-demo-topic.md');
    fs.writeFileSync(p1.filePath, 'content');

    const p2 = uniquePath(tempDir, '2026-08-18', 'demo-topic');
    assert.equal(p2.filename, '2026-08-18-demo-topic-2.md');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('saveLearning in dryRun mode computes correct paths without writing', () => {
  const result = saveLearning({
    title: 'Dry Run Topic',
    agent: 'Tester <tester@example.com>',
    body: 'Sample body',
    dryRun: true,
  });

  assert.equal(result.dryRun, true);
  assert.match(result.filename, /dry-run-topic\.md$/);
  assert.match(result.commitMessage, /Co-authored-by: Tester <tester@example.com>/);
});

test('saveLearning throws on empty title or body', () => {
  assert.throws(() => saveLearning({ title: '', agent: 'Tester', body: 'body' }), /Title is required/);
  assert.throws(() => saveLearning({ title: 'Topic', agent: '', body: 'body' }), /Agent is required/);
  assert.throws(() => saveLearning({ title: 'Topic', agent: 'Tester', body: '' }), /Note body is empty/);
});
