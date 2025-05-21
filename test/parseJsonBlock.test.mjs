import test from 'node:test';
import assert from 'node:assert/strict';
import parseJsonBlock from '../lib/parseJsonBlock.mjs';

test('extracts fenced JSON', () => {
  const text = 'some text\n```json\n{\n  "a": 1\n}\n```';
  assert.equal(parseJsonBlock(text), '{\n  "a": 1\n}');
});

test('returns null when not found', () => {
  assert.equal(parseJsonBlock('no fences'), null);
});
