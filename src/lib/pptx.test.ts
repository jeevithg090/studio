import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { decodeXmlEntities, extractSlideText, extractTextFromPptx } from './pptx';

const slideXml = (...paragraphs: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody>${paragraphs.join('')}</p:txBody></p:sp></p:spTree></p:cSld></p:sld>`;

const para = (...runs: string[]) =>
  `<a:p><a:pPr algn="l"/>${runs.map((r) => `<a:r><a:rPr lang="en-US"/><a:t>${r}</a:t></a:r>`).join('')}</a:p>`;

async function buildPptx(slides: Record<string, string>): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<Types/>');
  zip.file('ppt/presentation.xml', '<p:presentation/>');
  for (const [name, xml] of Object.entries(slides)) zip.file(`ppt/slides/${name}`, xml);
  zip.file('ppt/slides/_rels/slide1.xml.rels', '<Relationships/>');
  return zip.generateAsync({ type: 'uint8array' });
}

describe('decodeXmlEntities', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeXmlEntities('Q&amp;A &lt;b&gt; &quot;x&quot; &apos;y&apos; &#8364; &#x1F600;')).toBe(
      'Q&A <b> "x" \'y\' € 😀'
    );
  });

  it('leaves unknown entities alone', () => {
    expect(decodeXmlEntities('&nbsp; &#xZZ;')).toBe('&nbsp; &#xZZ;');
  });
});

describe('extractSlideText', () => {
  it('joins runs within a paragraph and puts paragraphs on separate lines', () => {
    const xml = slideXml(para('Quarterly ', 'Review'), para('Revenue &amp; growth'), '<a:p><a:endParaRPr/></a:p>');
    expect(extractSlideText(xml)).toEqual(['Quarterly Review', 'Revenue & growth']);
  });

  it('turns <a:br/> into a line break and handles attributes on <a:t>', () => {
    const xml = slideXml(
      '<a:p><a:r><a:t xml:space="preserve">Line one</a:t></a:r><a:br/><a:r><a:t>Line two</a:t></a:r></a:p>'
    );
    expect(extractSlideText(xml)).toEqual(['Line one\nLine two']);
  });

  it('does not confuse <a:pPr> or <a:tab> with paragraphs and text', () => {
    const xml = slideXml('<a:p><a:pPr/><a:r><a:t>Only</a:t></a:r><a:tab/></a:p>');
    expect(extractSlideText(xml)).toEqual(['Only']);
  });
});

describe('extractTextFromPptx', () => {
  it('extracts slides in numeric order, numbering by position and skipping empty slides', async () => {
    const file = await buildPptx({
      'slide10.xml': slideXml(para('Tenth')),
      'slide2.xml': slideXml(para('Second')),
      'slide1.xml': slideXml(para('Title slide'), para('Subtitle')),
      'slide3.xml': slideXml(),
    });
    expect(await extractTextFromPptx(file)).toBe('Slide 1\nTitle slide\nSubtitle\n\nSlide 2\nSecond\n\nSlide 4\nTenth');
  });

  it('follows the slide order declared in presentation.xml', async () => {
    const zip = new JSZip();
    zip.file(
      'ppt/presentation.xml',
      '<p:presentation><p:sldIdLst><p:sldId id="257" r:id="rId3"/><p:sldId id="256" r:id="rId2"/></p:sldIdLst></p:presentation>'
    );
    zip.file(
      'ppt/_rels/presentation.xml.rels',
      '<Relationships><Relationship Id="rId1" Type="theme" Target="theme/theme1.xml"/><Relationship Id="rId2" Type="slide" Target="slides/slide1.xml"/><Relationship Id="rId3" Type="slide" Target="slides/slide2.xml"/></Relationships>'
    );
    zip.file('ppt/slides/slide1.xml', slideXml(para('Originally first')));
    zip.file('ppt/slides/slide2.xml', slideXml(para('Moved to front')));
    const file = await zip.generateAsync({ type: 'uint8array' });
    expect(await extractTextFromPptx(file)).toBe('Slide 1\nMoved to front\n\nSlide 2\nOriginally first');
  });

  it('returns an empty string when no slide has text', async () => {
    expect(await extractTextFromPptx(await buildPptx({ 'slide1.xml': slideXml() }))).toBe('');
  });

  it('rejects files that are not zip archives', async () => {
    await expect(extractTextFromPptx(new TextEncoder().encode('not a zip'))).rejects.toThrow('not a valid .pptx');
  });

  it('rejects zip files without slides', async () => {
    const zip = new JSZip();
    zip.file('word/document.xml', '<w:document/>');
    await expect(extractTextFromPptx(await zip.generateAsync({ type: 'uint8array' }))).rejects.toThrow(
      'not a valid .pptx'
    );
  });
});
