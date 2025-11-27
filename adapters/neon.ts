/**
 * Neon-based content source for the reader.
 * Replaces SupabaseContentSource with direct Neon queries.
 */

import { db } from '@/lib/db';
import type { Block, ContentSource } from '@/types/reader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'story-blocks:';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

type CachedBlocksEntry = {
  blocks: Block[];
  cachedAt: number;
};

const memoryCache = new Map<string, CachedBlocksEntry>();

const cacheKeyFor = (storyId: string) => `${CACHE_PREFIX}${storyId}`;

const isFresh = (entry: CachedBlocksEntry) => Date.now() - entry.cachedAt < CACHE_TTL_MS;

async function readPersistedCache(storyId: string): Promise<CachedBlocksEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKeyFor(storyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.blocks) || typeof parsed.cachedAt !== 'number') return null;
    return { blocks: parsed.blocks, cachedAt: parsed.cachedAt };
  } catch {
    return null;
  }
}

async function writePersistedCache(storyId: string, entry: CachedBlocksEntry) {
  try {
    await AsyncStorage.setItem(cacheKeyFor(storyId), JSON.stringify(entry));
  } catch {}
}

export class NeonContentSource implements ContentSource {
  async loadStoryBlocks(storyId: string): Promise<Block[]> {
    // Check memory cache
    const cachedMem = memoryCache.get(storyId);
    if (cachedMem && isFresh(cachedMem)) {
      console.log('[NeonContentSource] Using memory cache for story:', storyId);
      // Check if cached blocks have tokens
      const firstPara = cachedMem.blocks.find(b => b.type === 'paragraph');
      if (firstPara && !(firstPara as any).tokens?.length) {
        console.log('[NeonContentSource] Cache has no tokens, invalidating...');
      } else {
        return cachedMem.blocks;
      }
    }

    // Check persisted cache
    const persisted = await readPersistedCache(storyId);
    if (persisted && isFresh(persisted)) {
      // Check if cached blocks have tokens
      const firstPara = persisted.blocks.find(b => b.type === 'paragraph');
      if (firstPara && !(firstPara as any).tokens?.length) {
        console.log('[NeonContentSource] Persisted cache has no tokens, fetching fresh...');
      } else {
        console.log('[NeonContentSource] Using persisted cache for story:', storyId);
        memoryCache.set(storyId, persisted);
        return persisted.blocks;
      }
    }

    // 1) Get all revisions for this story (desc by rev)
    const revs = await db.getStoryRevisions(storyId);
    if (revs.length === 0) return [];

    const revById = new Map<string, number>();
    const revIds = revs.map((r) => {
      revById.set(r.id, r.rev);
      return r.id;
    });

    // 2) Get chapters for ordering
    const chapters = await db.getChapters(storyId);
    const chapterOrder = new Map<string, number>();
    const chapterTitle = new Map<string, string | null>();
    chapters.forEach((c) => {
      chapterOrder.set(c.id, c.position);
      chapterTitle.set(c.id, c.title);
    });

    // 3) Get segments across all revisions
    const allSegments = await db.getSegmentsByRevisionIds(revIds);

    type Seg = { id: string; chapter_id: string; seg_index: number | null; kind: string | null; story_revision_id: string };
    const byChapterAll = new Map<string, Seg[]>();
    allSegments.forEach((s) => {
      const arr = byChapterAll.get(s.chapter_id) ?? [];
      arr.push(s as Seg);
      byChapterAll.set(s.chapter_id, arr);
    });

    // Choose segments from the latest available revision per chapter
    let segments: Seg[] = [];
    console.log('[NeonContentSource] Revisions available:', Array.from(revById.entries()));
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
      console.log('[NeonContentSource] Chapter', cid, 'using revision', bestRevId, '(rev', bestRevNum, ')');
      const chosen = (bestRevId ? byRev.get(bestRevId) : []) ?? [];
      chosen.sort((a, b) => (a.seg_index ?? 0) - (b.seg_index ?? 0));
      segments = segments.concat(chosen);
    }

    // 4) Get tokens for selected segments
    type Tok = { id: string; text: string; type: string };
    const tokensBySeg = new Map<string, Tok[]>();
    const selectedSegIds = segments.map((s) => s.id);
    
    if (selectedSegIds.length > 0) {
      console.log('[NeonContentSource] Selected segment IDs sample:', selectedSegIds.slice(0, 3));
      let tokens = await db.getTokensBySegmentIds(selectedSegIds);
      console.log('[NeonContentSource] Tokens found for selected segments:', tokens.length);
      
      // If no tokens found for selected segments, fall back to fetching ALL tokens for the story's revisions
      // and use those segment IDs instead
      if (tokens.length === 0) {
        console.log('[NeonContentSource] No tokens for selected segments, fetching all tokens for revisions...');
        // Get all segment IDs that have tokens
        const allSegmentIds = allSegments.map(s => s.id);
        tokens = await db.getTokensBySegmentIds(allSegmentIds);
        console.log('[NeonContentSource] Tokens found for all segments:', tokens.length);
        
        if (tokens.length > 0) {
          // Find which segments actually have tokens and use those
          const segIdsWithTokens = new Set(tokens.map(t => t.segment_id));
          console.log('[NeonContentSource] Segments with tokens:', segIdsWithTokens.size);
          
          // Rebuild segments list to only include those with tokens
          const segmentsWithTokens = allSegments.filter(s => segIdsWithTokens.has(s.id));
          if (segmentsWithTokens.length > 0) {
            segments = segmentsWithTokens as Seg[];
            console.log('[NeonContentSource] Using', segments.length, 'segments that have tokens');
          }
        }
      }
      
      tokens.forEach((t) => {
        const arr = tokensBySeg.get(t.segment_id) ?? [];
        const ttype = (t.token_type ?? 'word').toLowerCase();
        arr.push({ id: t.id, text: t.text ?? '', type: ttype });
        tokensBySeg.set(t.segment_id, arr);
      });
      console.log('[NeonContentSource] tokensBySeg has', tokensBySeg.size, 'segments');
    }

    // Sort segments by (chapter.position, seg_index)
    const sortedSegments = [...segments].sort((a, b) => {
      const ap = chapterOrder.get(a.chapter_id) ?? 1e9;
      const bp = chapterOrder.get(b.chapter_id) ?? 1e9;
      if (ap !== bp) return ap - bp;
      const at = (chapterTitle.get(a.chapter_id) ?? '').toLowerCase();
      const bt = (chapterTitle.get(b.chapter_id) ?? '').toLowerCase();
      if (at !== bt) return at < bt ? -1 : 1;
      if (a.chapter_id !== b.chapter_id) return a.chapter_id < b.chapter_id ? -1 : 1;
      return (a.seg_index ?? 0) - (b.seg_index ?? 0);
    });

    // Build blocks per chapter
    const out: Block[] = [];
    let paraIndex = 0;

    // Group segments by chapter
    const segsByChapter = new Map<string, Seg[]>();
    for (const s of sortedSegments) {
      const arr = segsByChapter.get(s.chapter_id) ?? [];
      arr.push(s);
      segsByChapter.set(s.chapter_id, arr);
    }
    for (const [cid, arr] of segsByChapter) {
      arr.sort((a, b) => (a.seg_index ?? 0) - (b.seg_index ?? 0));
    }

    // Determine chapter order from chapters list
    const sortedChapterIds = [...chapters]
      .sort((a, b) => {
        const ap = chapterOrder.get(a.id) ?? 1e9;
        const bp = chapterOrder.get(b.id) ?? 1e9;
        if (ap !== bp) return ap - bp;
        const at = (a.title ?? '').toLowerCase();
        const bt = (b.title ?? '').toLowerCase();
        if (at !== bt) return at < bt ? -1 : 1;
        return a.id < b.id ? -1 : 1;
      })
      .map((c) => c.id);

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
        const kind = seg.kind || 'paragraph';

        const toks = tokensBySeg.get(seg.id) ?? [];
        let buf = '';
        let prevType: string | null = null;
        let prevText: string | null = null;
        const isWordLike = (t: string | null) => t === 'word' || t === 'number' || t === 'emoji';
        const needsSpaceAfterPunct = (p: string | null) => {
          if (!p) return false;
          return /[\.,;:!\?\)\]\}"'"']$/.test(p);
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
          flushParagraph();
          if (text) out.push({ key: `h-${seg.id}`, type: 'heading', text });
          continue;
        }
        if (kind === 'paragraph') {
          const segTokens = tokensBySeg.get(seg.id) ?? [];
          console.log('[NeonContentSource] Segment', seg.id, 'has', segTokens.length, 'tokens');
          const tokensForBlock = segTokens.length ? segTokens.map((t) => ({ id: t.id, text: t.text, type: t.type })) : undefined;
          flushParagraph();
          if (text) {
            // Log first paragraph's tokens for debugging
            if (paraIndex < 2) {
              console.log('[NeonContentSource] Paragraph', paraIndex, 'tokensForBlock:', tokensForBlock ? tokensForBlock.length : 'undefined');
              if (tokensForBlock) {
                console.log('[NeonContentSource] First tokens:', tokensForBlock.slice(0, 3));
              }
            }
            out.push({ key: `p-${paraIndex++}`, type: 'paragraph', text, tokens: tokensForBlock });
          }
          continue;
        }
        if (text) {
          currentParaParts.push(text);
        }
      }
      flushParagraph();
    }

    // Cache the result
    const entry: CachedBlocksEntry = { blocks: out, cachedAt: Date.now() };
    memoryCache.set(storyId, entry);
    await writePersistedCache(storyId, entry);
    
    return out;
  }
}
