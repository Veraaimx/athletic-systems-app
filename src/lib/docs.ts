import fs from "fs";
import path from "path";

const DOC_FILES = [
  "01-athletic-systems-manifesto.md",
  "02-athletic-systems-engine.md",
  "03-coach-behavior.md",
  "04-athlete-profile.md",
  "05-programming-engine.md",
];

// Docs are vendored into src/docs (synced from athletic-systems/docs via
// `npm run sync-docs`) so they ship with the deployed bundle on Vercel,
// instead of being read from outside the app/ project root.
const DOCS_DIR = path.join(process.cwd(), "src", "docs");

let cachedContext: string | null = null;

export function getDocsContext(): string {
  if (cachedContext) return cachedContext;

  const sections = DOC_FILES.map((file) => {
    const fullPath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    return `--- ${file} ---\n${content}`;
  });

  cachedContext = sections.join("\n\n");
  return cachedContext;
}
