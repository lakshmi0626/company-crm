const test = require('node:test');
const assert = require('node:assert');
const { renderTemplate } = require('../src/utils/template');

test('replaces known variables', () => {
  assert.strictEqual(renderTemplate('Hi {{first_name}} at {{ company }}', { first_name: 'Asha', company: 'Acme' }), 'Hi Asha at Acme');
});

test('unknown or missing variables become empty', () => {
  assert.strictEqual(renderTemplate('Hi {{first_name}}{{nope}}', { first_name: null }), 'Hi ');
});
