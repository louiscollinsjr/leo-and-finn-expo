// Shared reader types for open-source friendly modularization

// Minimal Block union used by the current reader. Extend as needed (e.g., image, quote, code).
export type Token = {
  id: string;
  text: string;
  type?: string; // e.g., 'word' | 'punct' | 'space' | 'number' | 'emoji'
};

export type Block =
  | { key: string; type: 'chapter'; text: string }
  | { key: string; type: 'heading'; text: string }
  | { key: string; type: 'paragraph'; text: string; tokens?: Token[] };

// Book type for the app
export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  videoCover?: any;
  posterImage?: any;
  accentColors?: string[] | [string, string];
  loopVideo?: boolean;
}

// Optional future-facing types (not yet used by the app). Left here for contributors.
export interface ReaderConfig {
  marginX?: number;
  marginY?: number;
  typography?: Partial<ReaderTypography>;
}

export interface ReaderTypography {
  fontSize: number;
  lineHeight: number;
  avgCharWidth?: number; // if omitted, defaults to fontSize * 0.5
  paraBottomMargin: number;
  headingMargins: number; // combined vertical margins for heading block
  chapterMargins: number; // combined vertical margins for chapter block
}

// ContentSource allows different backends (Supabase, local JSON, CMS) to provide blocks
export interface ContentSource {
  loadStoryBlocks(storyId: string): Promise<Block[]>;
}
