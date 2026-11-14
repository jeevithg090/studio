import JSZip from 'jszip';

const SLIDE_PATH = /^ppt\/slides\/slide(\d+)\.xml$/;

const XML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** Decodes the predefined XML entities plus numeric character references. */
export function decodeXmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] === '#') {
      const codePoint = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
    }
    return XML_ENTITIES[body.toLowerCase()] ?? entity;
  });
}

/**
 * Extracts the visible text of one slide's DrawingML XML. Each `<a:p>`
 * paragraph becomes one line; `<a:t>` runs inside it are concatenated and
 * `<a:br/>` becomes a line break.
 */
export function extractSlideText(xml: string): string[] {
  const lines: string[] = [];
  const paragraphs = xml.match(/<a:p[\s>][\s\S]*?<\/a:p>/g) ?? [];
  for (const paragraph of paragraphs) {
    let line = '';
    const tokens = paragraph.match(/<a:t(?:\s[^>]*)?>[\s\S]*?<\/a:t>|<a:br\s*\/?>/g) ?? [];
    for (const token of tokens) {
      if (token.startsWith('<a:br')) {
        line += '\n';
      } else {
        line += decodeXmlEntities(token.replace(/^<a:t(?:\s[^>]*)?>/, '').replace(/<\/a:t>$/, ''));
      }
    }
    const trimmed = line.trim();
    if (trimmed) lines.push(trimmed);
  }
  return lines;
}

/**
 * Returns slide part paths in presentation order, as listed in
 * `ppt/presentation.xml` (`<p:sldIdLst>`) and resolved through its
 * relationships file. Returns `null` if that metadata is missing.
 */
async function slideOrderFromPresentation(zip: JSZip): Promise<string[] | null> {
  const presentation = await zip.file('ppt/presentation.xml')?.async('string');
  const rels = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  if (!presentation || !rels) return null;

  const targets = new Map<string, string>();
  for (const rel of rels.match(/<Relationship\s[^>]*>/g) ?? []) {
    const id = /\sId="([^"]+)"/.exec(rel)?.[1];
    const target = /\sTarget="([^"]+)"/.exec(rel)?.[1];
    if (id && target) targets.set(id, target.startsWith('/') ? target.slice(1) : `ppt/${target}`);
  }

  const order: string[] = [];
  for (const sldId of presentation.match(/<p:sldId\s[^>]*>/g) ?? []) {
    const relId = /\sr:id="([^"]+)"/.exec(sldId)?.[1];
    const path = relId ? targets.get(relId) : undefined;
    if (path && SLIDE_PATH.test(path) && zip.file(path)) order.push(path);
  }
  return order.length > 0 ? order : null;
}

/** Fallback ordering: slide part number (`slide2.xml` before `slide10.xml`). */
function slideOrderFromFileNames(zip: JSZip): string[] {
  return Object.keys(zip.files)
    .map((path) => ({ path, match: SLIDE_PATH.exec(path) }))
    .filter((entry): entry is { path: string; match: RegExpExecArray } => entry.match !== null)
    .sort((a, b) => Number(a.match[1]) - Number(b.match[1]))
    .map(({ path }) => path);
}

/**
 * Extracts the text of every slide in a `.pptx` file in presentation order.
 * Slides without text are skipped (numbering still reflects their position).
 * Throws if the file is not a PowerPoint Open XML package.
 */
export async function extractTextFromPptx(data: ArrayBuffer | Uint8Array): Promise<string> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new Error('The file is not a valid .pptx presentation.');
  }

  const slides = (await slideOrderFromPresentation(zip)) ?? slideOrderFromFileNames(zip);
  if (slides.length === 0) {
    throw new Error('The file is not a valid .pptx presentation.');
  }

  const sections: string[] = [];
  for (const [position, path] of slides.entries()) {
    const lines = extractSlideText(await zip.file(path)!.async('string'));
    if (lines.length > 0) sections.push(`Slide ${position + 1}\n${lines.join('\n')}`);
  }
  return sections.join('\n\n');
}
