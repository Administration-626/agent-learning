import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  parseLearningFile,
  scoreLearning,
  searchLearnings,
  generateIndexMarkdown,
} from './query-learning.mjs';

test('parseLearningFile parses markdown headers and snippet correctly', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-query-'));
  try {
    const filePath = path.join(tempDir, '2026-08-18-sample-note.md');
    fs.writeFileSync(
      filePath,
      `# Sample Note Title

Date: 2026-08-18
Agent: TestAgent

## Background
This is a sample background description explaining the core problem.
`,
      'utf8'
    );

    const parsed = parseLearningFile(filePath, tempDir);
    assert.equal(parsed.title, 'Sample Note Title');
    assert.equal(parsed.date, '2026-08-18');
    assert.equal(parsed.agent, 'TestAgent');
    assert.match(parsed.snippet, /This is a sample background description/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('scoreLearning prioritizes title and filename over body', () => {
  const note1 = {
    title: 'Docker Proxy Configuration',
    filename: 'docker-proxy.md',
    agent: 'Antigravity',
    body: 'Some generic details',
  };

  const note2 = {
    title: 'General Network Tips',
    filename: 'network.md',
    agent: 'Antigravity',
    body: 'Here we mention docker once.',
  };

  const score1 = scoreLearning(note1, ['docker']);
  const score2 = scoreLearning(note2, ['docker']);

  assert.ok(score1 > score2, `Expected note1 score (${score1}) to be higher than note2 (${score2})`);
});

test('searchLearnings filters and orders results properly', () => {
  const mockLearnings = [
    {
      title: 'Docker Hub Mirroring',
      date: '2026-07-09',
      agent: 'Antigravity',
      filename: 'docker.md',
      body: 'Mirroring docker containers.',
    },
    {
      title: 'eBPF Kernel Probes',
      date: '2026-06-20',
      agent: 'Gemini',
      filename: 'ebpf.md',
      body: 'Tracing syscalls with ebpf.',
    },
  ];

  const results = searchLearnings(mockLearnings, 'docker');
  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'Docker Hub Mirroring');

  const agentFiltered = searchLearnings(mockLearnings, '', { agent: 'Gemini' });
  assert.equal(agentFiltered.length, 1);
  assert.equal(agentFiltered[0].title, 'eBPF Kernel Probes');
});

test('generateIndexMarkdown generates valid markdown table', () => {
  const mockLearnings = [
    {
      title: 'Note A',
      date: '2026-08-18',
      agent: 'Agent A',
      filename: '2026-08-18-note-a.md',
      snippet: 'Snippet A',
    },
  ];

  const md = generateIndexMarkdown(mockLearnings);
  assert.match(md, /# Knowledge Index/);
  assert.match(md, /Total Learnings: \*\*1\*\*/);
  assert.match(md, /\| `2026-08-18` \| \[Note A\]\(\.\/2026-08-18-note-a\.md\) \| `Agent A` \| Snippet A \|/);
});
