// Minimal, safe syntax highlighter for the code review editor.
// Tokenizes source and returns HTML-safe spans. Not a parser - good
// enough to make the editor feel professional.

const KEYWORDS = new Set([
  "return", "if", "else", "elif", "for", "while", "do", "switch", "case",
  "break", "continue", "def", "import", "from", "class", "const", "let",
  "var", "function", "async", "await", "public", "private", "protected",
  "static", "void", "int", "string", "bool", "float", "double", "char",
  "true", "false", "null", "package", "func", "go", "use", "fn", "mut",
  "new", "throw", "try", "catch", "finally", "in", "is", "of", "select",
  "where", "insert", "update", "delete", "into", "values", "and", "or",
  "not", "this", "self", "super", "interface", "struct", "enum", "echo",
  "require", "using", "namespace", "endswith", "None", "True", "False",
]);

const TOKEN_REGEX =
  /(\/\/[^\n]*)|(#[^\n]*)|(\/\*[\s\S]*?\*\/)|((?:\/\*)|(?:\/\/))|("[^"\n\\]*(?:\\.[^"\n\\]*)*"|'[^'\n\\]*(?:\\.[^'\n\\]*)*')|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_][a-zA-Z0-9_]*)/g;

export interface HighlightToken {
  text: string;
  cls: string;
}

export function tokenize(code: string): HighlightToken[] {
  const out: HighlightToken[] = [];
  let last = 0;
  TOKEN_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_REGEX.exec(code)) !== null) {
    if (m.index > last) {
      out.push({ text: code.slice(last, m.index), cls: "plain" });
    }
    const [full] = m;
    if (m[1]) out.push({ text: full, cls: "comment" });
    else if (m[2]) out.push({ text: full, cls: "comment" });
    else if (m[3]) out.push({ text: full, cls: "comment" });
    else if (m[4]) out.push({ text: full, cls: "comment" });
    else if (m[5]) out.push({ text: full, cls: "string" });
    else if (m[6]) out.push({ text: full, cls: "number" });
    else if (m[7]) out.push({ text: full, cls: KEYWORDS.has(full) ? "keyword" : "plain" });
    else out.push({ text: full, cls: "plain" });
    last = m.index + full.length;
  }
  if (last < code.length) {
    out.push({ text: code.slice(last), cls: "plain" });
  }
  return out;
}

export function highlightHtml(code: string): string {
  return tokenize(code)
    .map((t) => {
      if (t.cls === "plain") return escapeHtml(t.text);
      return `<span class="code-${t.cls}">${escapeHtml(t.text)}</span>`;
    })
    .join("");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const HIGHLIGHT_CSS = `
.code-comment { color: #64748b; font-style: italic; }
.code-string { color: #86efac; }
.code-number { color: #fbbf24; }
.code-keyword { color: #f472b6; }
`;
