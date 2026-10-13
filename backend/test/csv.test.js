const test = require('node:test');
const assert = require('node:assert');
const { toCSV, parseCSV } = require('../src/utils/csv');

test('parseCSV reads headers and rows', () => {
  const rows = parseCSV('First_Name,Email\nAsha,asha@x.com\nRavi,ravi@x.com\n');
  assert.deepStrictEqual(rows, [
    { first_name: 'Asha', email: 'asha@x.com' },
    { first_name: 'Ravi', email: 'ravi@x.com' },
  ]);
});

test('parseCSV handles quotes, commas and CRLF', () => {
  const rows = parseCSV('name,note\r\n"Acme, Inc","said ""hi"""\r\n');
  assert.deepStrictEqual(rows, [{ name: 'Acme, Inc', note: 'said "hi"' }]);
});

test('parseCSV returns empty for header-only input', () => {
  assert.deepStrictEqual(parseCSV('a,b\n'), []);
});

test('toCSV escapes special characters', () => {
  const out = toCSV([{ a: 'x,y', b: 'say "hi"', c: null }], ['a', 'b', 'c']);
  assert.strictEqual(out, 'a,b,c\n"x,y","say ""hi""",');
});
