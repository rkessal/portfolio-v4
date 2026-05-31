export function render(template, data) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => data[key] ?? '')
}