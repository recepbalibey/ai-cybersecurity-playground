// privacyHighlight.ts
// Shared helpers for rendering the document as a privacy heatmap.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const SEVERITY_CLASS: Record<string, string> = {
  Critical: "privacy-hl privacy-critical",
  High: "privacy-hl privacy-high",
  Medium: "privacy-hl privacy-medium",
  Low: "privacy-hl privacy-low",
  Informational: "privacy-hl privacy-info",
};
