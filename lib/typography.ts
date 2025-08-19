import type { ReaderTypography } from '@/types/reader';

export const defaultTypography: ReaderTypography = {
  fontSize: 16,
  lineHeight: 22,
  avgCharWidth: 8, // fallback if not computed from fontSize
  paraBottomMargin: 12,
  headingMargins: 24, // mt 16 + mb 8
  chapterMargins: 36, // mt 20 + mb 16
};

export function computeAvgCharWidth(fontSize: number): number {
  // Rough heuristic; may be overridden by measurement in the future.
  return Math.max(6, Math.round(fontSize * 0.5));
}

export function resolveTypography(partial?: Partial<ReaderTypography>): ReaderTypography {
  const base = { ...defaultTypography };
  if (!partial) return base;
  const merged: ReaderTypography = {
    ...base,
    ...partial,
  };
  if (!partial.avgCharWidth) {
    merged.avgCharWidth = computeAvgCharWidth(merged.fontSize);
  }
  return merged;
}
