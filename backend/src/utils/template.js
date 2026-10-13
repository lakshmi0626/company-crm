// Replaces {{variable}} placeholders. Unknown variables become empty strings.
function renderTemplate(text, vars) {
  return String(text || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''
  );
}

module.exports = { renderTemplate };
