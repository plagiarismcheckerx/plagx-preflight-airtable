// Turns an Airtable text cell into the paragraph text Plagx Preflight expects.
// Long text is plain text; rich text comes back as Markdown, so list markers, quotes and
// emphasis are removed and every heading becomes "# Heading".

const EMPHASIS = /(^|[\s(["'])(\*\*|__|\*|_)(\S(?:.*?\S)?)\2(?=[\s)\]"'.,;:!?]|$)/g;

function cleanLine(line) {
  let text = line.trim();
  if (!text) return '';
  const heading = /^#{1,6}\s+(.*)$/.exec(text);
  if (heading) return `# ${heading[1].trim()}`;
  text = text
    .replace(/^>\s?/, '')
    .replace(/^(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/, '')
    .replace(/`([^`]*)`/g, '$1');
  for (let i = 0; i < 2; i++) text = text.replace(EMPHASIS, '$1$3');
  return text.trim();
}

/** Each non-empty line becomes its own paragraph. */
export function cellToText(value) {
  if (value == null) return '';
  return String(value).split(/\r?\n/).map(cleanLine).filter(Boolean).join('\n\n');
}
