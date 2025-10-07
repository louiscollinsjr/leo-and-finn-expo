import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Simple, pluggable storage adapter so apps can use AsyncStorage, SecureStore, etc.
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createInMemoryStorageAdapter(): StorageAdapter {
  const map = new Map<string, string>();
  return {
    async getItem(key) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

export type ThemeMode = 'system' | 'light' | 'dark' | 'sepia';
export type PageMode = 'scroll' | 'slide' | 'curl' | 'fast-fade';
export type Typeface = 'system' | 'serif' | 'sans' | 'inter' | 'tisa';

export type ReaderPrefs = {
  fontScale: number; // 1.0 = base size
  lineHeightScale: number; // 1.0 = base line-height
  marginScale: number; // horizontal margin multiplier
  theme: ThemeMode;
  typeface: Typeface;
  // New visual prefs for advanced customization
  brightness: number; // 0..1 UI brightness multiplier (app level, not system)
  boldText: boolean; // prefer bolder text weight for body
  charSpacing: number; // letter spacing in px (applied to Text.letterSpacing)
  wordSpacing: number; // reserved for future custom renderer; currently approximated
  pageMode: PageMode; // reading page transition mode
};

const DEFAULT_PREFS: ReaderPrefs = {
  fontScale: 1.0,
  lineHeightScale: 1.0,
  marginScale: 1.0,
  theme: 'system',
  typeface: 'system',
  brightness: 1.0,
  boldText: false,
  charSpacing: 0,
  wordSpacing: 0,
  pageMode: 'scroll',
};

const STORAGE_KEY = 'reader:prefs:v1';

type ReaderProviderProps = {
  children: React.ReactNode;
  storage?: StorageAdapter;
};

type ReaderPrefsContextValue = {
  prefs: ReaderPrefs;
  setPrefs: (next: Partial<ReaderPrefs>) => void;
  resetPrefs: () => void;
};

export type WordAnchor = { x: number; y: number; width: number; height: number };

type WordContextValue = {
  word: string | null;
  tokenId: string | null;
  anchor: WordAnchor | null;
};

export type WordContextPayload = {
  word: string | null;
  tokenId?: string | null;
  anchor?: WordAnchor | null;
};

type ReaderUIContextValue = {
  overlayVisible: boolean;
  setOverlayVisible: (visible: boolean) => void;
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  themePopoverVisible: boolean;
  setThemePopoverVisible: (visible: boolean) => void;
  settingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  wordContext: WordContextValue;
  openWordContext: (payload: WordContextPayload) => void;
  closeWordContext: () => void;
};

const ReaderPrefsContext = createContext<ReaderPrefsContextValue | undefined>(undefined);
const ReaderUIContext = createContext<ReaderUIContextValue | undefined>(undefined);

export function ReaderProvider({ children, storage }: ReaderProviderProps) {
  const storageRef = useRef<StorageAdapter>(storage ?? createInMemoryStorageAdapter());
  const [prefs, setPrefsState] = useState<ReaderPrefs>(DEFAULT_PREFS);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [themePopoverVisible, setThemePopoverVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [wordContext, setWordContext] = useState<WordContextValue>({ word: null, tokenId: null, anchor: null });
  const loadedRef = useRef(false);

  // Load on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await storageRef.current.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
          setPrefsState({ ...DEFAULT_PREFS, ...parsed });
        }
      } catch (e) {
        // ignore
      } finally {
        loadedRef.current = true;
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist on change (after initial load)
  useEffect(() => {
    if (!loadedRef.current) return;
    storageRef.current.setItem(STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs]);

  const setPrefs = (next: Partial<ReaderPrefs>) => {
    setPrefsState((prev) => ({ ...prev, ...next }));
  };

  const resetPrefs = () => setPrefsState(DEFAULT_PREFS);

  const openWordContext = useCallback(({ word, tokenId = null, anchor = null }: WordContextPayload) => {
    setWordContext({ word, tokenId, anchor });
  }, []);

  const closeWordContext = useCallback(() => {
    setWordContext({ word: null, tokenId: null, anchor: null });
  }, []);

  const prefsValue = useMemo<ReaderPrefsContextValue>(
    () => ({ prefs, setPrefs, resetPrefs }),
    [prefs]
  );

  const uiValue = useMemo<ReaderUIContextValue>(
    () => ({
      overlayVisible,
      setOverlayVisible,
      menuVisible,
      setMenuVisible,
      themePopoverVisible,
      setThemePopoverVisible,
      settingsVisible,
      setSettingsVisible,
      wordContext,
      openWordContext,
      closeWordContext,
    }),
    [
      overlayVisible,
      menuVisible,
      themePopoverVisible,
      settingsVisible,
      wordContext,
      openWordContext,
      closeWordContext,
    ]
  );

  return (
    <ReaderPrefsContext.Provider value={prefsValue}>
      <ReaderUIContext.Provider value={uiValue}>{children}</ReaderUIContext.Provider>
    </ReaderPrefsContext.Provider>
  );
}

export function useReaderPrefs() {
  const ctx = useContext(ReaderPrefsContext);
  if (!ctx) throw new Error('useReaderPrefs must be used within <ReaderProvider>');
  return ctx;
}

export function useReaderOverlay() {
  const ctx = useContext(ReaderUIContext);
  if (!ctx) throw new Error('useReaderOverlay must be used within <ReaderProvider>');
  const { overlayVisible, setOverlayVisible } = ctx;
  return { overlayVisible, setOverlayVisible };
}

export function useReaderUI() {
  const ctx = useContext(ReaderUIContext);
  if (!ctx) throw new Error('useReaderUI must be used within <ReaderProvider>');
  return ctx;
}
