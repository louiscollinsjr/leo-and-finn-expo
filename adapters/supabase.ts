import { supabase } from '@/lib/supabase';
import type { Block, ContentSource } from '@/types/reader';

export class SupabaseContentSource implements ContentSource {
  async loadStoryBlocks(storyId: string): Promise<Block[]> {
    // 1) all revisions for this story (desc by rev)
    const { data: revs, error: revErr } = await supabase
      .from('story_revisions')
      .select('id, rev')
      .eq('story_id', storyId)
      .order('rev', { ascending: false });
    if (revErr) throw revErr;
    if (!revs || revs.length === 0) return [];

    const revById = new Map<string, number>();
    const revIds = revs.map((r: any) => {
      const rv = typeof r.rev === 'number' ? r.rev : 0;
      revById.set(r.id as string, rv);
      return r.id as string;
    });

    // 2) chapters for ordering
    const { data: chapters, error: chErr } = await supabase
      .from('chapters')
      .select('id, title, position')
      .eq('story_id', storyId);
    if (chErr) throw chErr;
    const chapterOrder = new Map<string, number>();
    const chapterTitle = new Map<string, string | null>();
    (chapters ?? []).forEach((c: any) => {
      const pos = typeof c.position === 'number' ? c.position : 1e9;
      chapterOrder.set(c.id, pos);
      chapterTitle.set(c.id, c.title ?? null);
    });

    // 3) segments across all revisions (pick latest per chapter)
    const { data: allSegments, error: segErr } = await supabase
      .from('segments')
      .select('id, chapter_id, seg_index, kind, story_revision_id')
      .in('story_revision_id', revIds);
    if (segErr) throw segErr;

    type Seg = { id: string; chapter_id: string; seg_index: number | null; kind: string | null; story_revision_id: string };
    const byChapterAll = new Map<string, Seg[]>();
    (allSegments ?? []).forEach((s: any) => {
      const arr = byChapterAll.get(s.chapter_id) ?? [];
      arr.push(s as Seg);
      byChapterAll.set(s.chapter_id, arr);
    });

    // choose segments from the latest available revision per chapter
    let segments: Seg[] = [];
    for (const [cid, arr] of byChapterAll) {
      const byRev = new Map<string, Seg[]>();
      for (const s of arr) {
        const a = byRev.get(s.story_revision_id) ?? [];
        a.push(s);
        byRev.set(s.story_revision_id, a);
      }
      let bestRevId: string | null = null;
      let bestRevNum = -Infinity;
      for (const rid of byRev.keys()) {
        const rv = revById.get(rid) ?? -Infinity;
        if (rv > bestRevNum) {
          bestRevNum = rv;
          bestRevId = rid;
        }
      }
      const chosen = (bestRevId ? byRev.get(bestRevId) : []) ?? [];
      chosen.sort((a, b) => (a.seg_index ?? 0) - (b.seg_index ?? 0));
      segments = segments.concat(chosen);
    }

    // 4) tokens only for selected segments
    type Tok = { text: string; type: string };
    const tokensBySeg = new Map<string, Tok[]>();
    const selectedSegIds = segments.map((s) => s.id);
    if (selectedSegIds.length > 0) {
      const { data: tokens, error: tokErr } = await supabase
        .from('tokens')
        .select('segment_id, tok_index, text, token_type')
        .in('segment_id', selectedSegIds)
        .order('segment_id', { ascending: true })
        .order('tok_index', { ascending: true });
      if (tokErr) throw tokErr;
      (tokens ?? []).forEach((t: any) => {
        const arr = tokensBySeg.get(t.segment_id) ?? [];
        const ttype = (t.token_type ?? 'word').toString().toLowerCase();
        arr.push({ text: t.text ?? '', type: ttype });
        tokensBySeg.set(t.segment_id, arr);
      });
    }

    // sort segments by (chapter.position, seg_index)
    const sortedSegments = [...(segments ?? [])].sort((a: any, b: any) => {
      const ap = chapterOrder.get(a.chapter_id) ?? 1e9;
      const bp = chapterOrder.get(b.chapter_id) ?? 1e9;
      if (ap !== bp) return ap - bp;
      const at = (chapterTitle.get(a.chapter_id) ?? '').toString().toLowerCase();
      const bt = (chapterTitle.get(b.chapter_id) ?? '').toString().toLowerCase();
      if (at !== bt) return at < bt ? -1 : 1;
      if (a.chapter_id !== b.chapter_id) return a.chapter_id < b.chapter_id ? -1 : 1;
      return (a.seg_index ?? 0) - (b.seg_index ?? 0);
    });

    // build blocks per chapter to ensure all chapters render (even with no segments)
    const out: Block[] = [];
    let paraIndex = 0;

    // Group segments by chapter
    const segsByChapter = new Map<string, any[]>();
    for (const s of sortedSegments) {
      const arr = segsByChapter.get(s.chapter_id) ?? [];
      arr.push(s);
      segsByChapter.set(s.chapter_id, arr);
    }
    for (const [cid, arr] of segsByChapter) {
      arr.sort((a, b) => (a.seg_index ?? 0) - (b.seg_index ?? 0));
    }

    // Determine chapter order from chapters list
    const sortedChapterIds = [...(chapters ?? [])]
      .sort((a: any, b: any) => {
        const ap = chapterOrder.get(a.id) ?? 1e9;
        const bp = chapterOrder.get(b.id) ?? 1e9;
        if (ap !== bp) return ap - bp;
        const at = (a.title ?? '').toString().toLowerCase();
        const bt = (b.title ?? '').toString().toLowerCase();
        if (at !== bt) return at < bt ? -1 : 1;
        return a.id < b.id ? -1 : 1;
      })
      .map((c: any) => c.id as string);

    for (const chId of sortedChapterIds) {
      const ct = chapterTitle.get(chId) || null;
      if (ct) out.push({ key: `ch-${chId}`, type: 'chapter', text: ct });

      let currentParaParts: string[] = [];
      const flushParagraph = () => {
        const text = currentParaParts.join(' ').replace(/\s+/g, ' ').trim();
        if (text) out.push({ key: `p-${paraIndex++}`, type: 'paragraph', text });
        currentParaParts = [];
      };

      const segs = segsByChapter.get(chId) ?? [];
      for (const seg of segs) {
        const kind = (seg.kind as string) || 'paragraph';

        // reconstruct text with spacing for this segment
        const toks = tokensBySeg.get(seg.id) ?? [];
        let buf = '';
        let prevType: string | null = null;
        let prevText: string | null = null;
        const isWordLike = (t: string | null) => t === 'word' || t === 'number' || t === 'emoji';
        const needsSpaceAfterPunct = (p: string | null) => {
          if (!p) return false;
          return /[\.,;:!\?\)\]\}”’"']$/.test(p);
        };
        const isAlphaNumEnd = (s: string | null) => !!s && /[A-Za-z0-9]$/.test(s);
        const isAlphaNumStart = (s: string | null) => !!s && /^[A-Za-z0-9]/.test(s);
        for (const tk of toks) {
          const ttype = tk.type;
          const ttext = tk.text ?? '';
          if (ttype === 'space') {
            if (buf && !buf.endsWith(' ')) buf += ' ';
          } else if (isWordLike(ttype)) {
            if (buf) {
              if (isWordLike(prevType)) {
                if (!buf.endsWith(' ')) buf += ' ';
              } else if (prevType === 'punct' && needsSpaceAfterPunct(prevText)) {
                if (!buf.endsWith(' ')) buf += ' ';
              } else if (isAlphaNumEnd(prevText) && isAlphaNumStart(ttext)) {
                if (!buf.endsWith(' ')) buf += ' ';
              }
            }
            buf += ttext;
          } else if (ttype === 'punct') {
            buf += ttext;
          } else {
            if (buf && isAlphaNumEnd(prevText) && isAlphaNumStart(ttext) && !buf.endsWith(' ')) {
              buf += ' ';
            }
            buf += ttext;
          }
          prevText = ttext;
          prevType = ttype;
        }
        const text = buf.replace(/\s+/g, ' ').trim();

        if (kind === 'heading') {
          // Close any open paragraph before a heading and emit heading text if present
          flushParagraph();
          if (text) out.push({ key: `h-${seg.id}`, type: 'heading', text });
          continue;
        }
        if (kind === 'paragraph') {
          // Treat paragraph kind as a boundary; if it carries text, emit it as its own paragraph
          flushParagraph();
          if (text) out.push({ key: `p-${paraIndex++}`, type: 'paragraph', text });
          continue;
        }
        if (text) {
          // sentence or other content contributes to current paragraph
          currentParaParts.push(text);
        }
      }
      flushParagraph();
    }

    return out;
  }
}
