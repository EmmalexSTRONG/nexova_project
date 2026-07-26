// Escapes text before it's interpolated into an HTML email/SMS template —
// every caller-supplied string (customer name, order number, item names,
// etc.) must pass through this before reaching a template literal that
// produces HTML, since none of these email builders use a templating engine
// with automatic escaping.
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
