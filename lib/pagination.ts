import { Block } from '@/types/reader';

// Pure pagination with current heuristics. No RN dependencies.
// TODO: allow injecting metrics via a config param in a later refactor.
export function paginateBlocks(blocks: Block[], width: number, height: number, sidePadding: number): Block[][] {
  const pages: Block[][] = [];
  const pagePaddingV = 16; // matches container paddingVertical: 8 on each side
  const availableHeight = Math.max(0, height - pagePaddingV);

  const lineHeight = 22; // matches render style
  const fontSize = 16; // assumed typical body size for estimation
  const avgCharWidth = fontSize * 0.5; // rough average
  const charsPerLine = Math.max(8, Math.floor((width - sidePadding * 2) / avgCharWidth)); // account for horizontal margins

  const paraBottomMargin = 12;
  const headingMargins = 16 + 8; // mt 16, mb 8
  const chapterMargins = 20 + 16; // mt 20, mb 16

  const estimateParagraphHeight = (text: string, lines?: number) => {
    const ln = lines ?? Math.max(1, Math.ceil(text.length / charsPerLine));
    return ln * lineHeight + paraBottomMargin;
  };

  const estimateHeadingHeight = (_text: string) => {
    // single-line-ish bold text
    return lineHeight + headingMargins;
  };

  const estimateChapterHeight = (_text: string) => {
    // subtitle style, likely one line
    return lineHeight + chapterMargins;
  };

  const splitParagraphIntoChunks = (
    key: string,
    text: string,
    maxLinesFirstChunk: number,
    remainingHeight: () => number
  ): Block[] => {
    const result: Block[] = [];
    let idx = 0;
    let remaining = text;
    let first = true;
    while (remaining.length > 0) {
      let remH = remainingHeight();
      if (remH <= 0) break; // caller should start a new page
      // compute max lines that fit now
      const maxLines = Math.max(0, Math.floor((remH - paraBottomMargin) / lineHeight));
      const useLines = Math.max(0, first ? Math.min(maxLines, maxLinesFirstChunk) : maxLines);
      if (useLines <= 0) break;

      const approxChars = Math.max(8, Math.floor(useLines * charsPerLine));
      if (approxChars >= remaining.length) {
        result.push({ key: `${key}-part${idx++}`, type: 'paragraph', text: remaining });
        remaining = '';
        break;
      }
      // Try to break on whitespace near approxChars
      const window = 40;
      const sliceEnd = Math.min(remaining.length - 1, approxChars + window);
      const soft = remaining.lastIndexOf(' ', sliceEnd);
      const cut = soft >= 0 && soft >= approxChars - window ? soft : approxChars;
      const chunk = remaining.slice(0, cut).trimEnd();
      result.push({ key: `${key}-part${idx++}`, type: 'paragraph', text: chunk });
      remaining = remaining.slice(cut).trimStart();
      first = false;
    }
    return result;
  };

  let current: Block[] = [];
  let used = 0;

  const pushPage = () => {
    pages.push(current);
    current = [];
    used = 0;
  };

  for (const b of blocks) {
    if (b.type === 'chapter') {
      const h = estimateChapterHeight(b.text);
      // Always start a new page for a new chapter (if anything is already on the page)
      if (used > 0) pushPage();
      current.push(b);
      used += h;
      continue;
    }
    if (b.type === 'heading') {
      const h = estimateHeadingHeight(b.text);
      if (used > 0 && used + h > availableHeight) pushPage();
      current.push(b);
      used += h;
      continue;
    }
    // paragraph with potential split
    const fullH = estimateParagraphHeight(b.text);
    if (fullH <= availableHeight - used) {
      current.push(b);
      used += fullH;
      continue;
    }

    // Not enough space on this page; slice across pages
    let remainingPara = b.text;
    while (remainingPara.length > 0) {
      if (used >= availableHeight) pushPage();
      const remH = availableHeight - used;
      const maxLinesNow = Math.max(0, Math.floor((remH - paraBottomMargin) / lineHeight));
      if (maxLinesNow <= 0) {
        pushPage();
        continue;
      }
      const chunks = splitParagraphIntoChunks(b.key, remainingPara, maxLinesNow, () => availableHeight - used);
      if (chunks.length === 0) break;
      // place as many chunks as fit on this page, then continue
      for (const c of chunks) {
        const ch = estimateParagraphHeight(c.text);
        if (ch > availableHeight - used && current.length > 0) {
          pushPage();
        }
        if (ch > availableHeight) {
          // extremely long single word: hard cut
          const linesFit = Math.max(1, Math.floor((availableHeight - paraBottomMargin) / lineHeight));
          const hardChars = Math.max(8, Math.floor(linesFit * charsPerLine));
          const hardChunk = c.text.slice(0, hardChars);
          const remainder = c.text.slice(hardChars);
          current.push({ key: `${c.key}-hard`, type: 'paragraph', text: hardChunk });
          used = availableHeight; // force page break
          remainingPara = remainder;
        } else {
          current.push(c);
          used += ch;
          remainingPara = remainingPara.slice(c.text.length).trimStart();
        }
      }
    }
  }

  if (current.length) pages.push(current);
  return pages;
}
