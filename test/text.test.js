import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellToText } from '../frontend/text.js';
import { checkDraft } from '../frontend/lib/index.js';

test('long text: each non-empty line is a paragraph', () => {
  assert.equal(cellToText('First line.\r\n\r\n  Second line.  \nThird'), 'First line.\n\nSecond line.\n\nThird');
  assert.equal(cellToText(null), '');
  assert.equal(cellToText(''), '');
});

test('rich text Markdown: headings, lists, quotes, code and emphasis are cleaned', () => {
  const md = [
    '## The role of sleep',
    'Sleep is **central** to *learning* (Walker, 2017).',
    '> A quoted line with `code`.',
    '### References',
    '- Walker, M. (2017). *Why we sleep*. Scribner.',
    '1. Lee, K. (2019). __Planning essays__.',
    '- [x] Done item',
    'snake_case_name and 2 * 3 * 4 stay as they are.',
  ].join('\n');
  assert.equal(cellToText(md), [
    '# The role of sleep',
    'Sleep is central to learning (Walker, 2017).',
    'A quoted line with code.',
    '# References',
    'Walker, M. (2017). Why we sleep. Scribner.',
    'Lee, K. (2019). Planning essays.',
    'Done item',
    'snake_case_name and 2 * 3 * 4 stay as they are.',
  ].join('\n\n'));
});

test('the cleaned text finds citation issues', () => {
  const codes = checkDraft(cellToText('Text is is here (Smith, 2020).\n## References\n- Lee, K. (2019). *Planning*.')).issues.map((i) => i.code);
  assert.ok(codes.includes('repeated-word'));
  assert.ok(codes.includes('citation-no-reference'));
  assert.ok(codes.includes('reference-not-cited'));
});
