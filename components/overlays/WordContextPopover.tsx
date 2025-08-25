import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useWordTranslations } from '@/hooks/useWordTranslations';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View, useWindowDimensions } from 'react-native';


export type WordContextPopoverProps = {
  visible: boolean;
  anchor?: { x: number; y: number; width: number; height: number } | null;
  word: string | null;
  tokenId?: string | null;
  onClose: () => void;
};

export default function WordContextPopover({ visible, anchor, word, tokenId, onClose }: WordContextPopoverProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [input, setInput] = useState('');
  const [showKnownPrompt, setShowKnownPrompt] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { loading, error, getTranslation, saveTranslation, markKnown } = useWordTranslations();

  useEffect(() => {
    let active = true;
    // Prefill existing translation when opening
    (async () => {
      if (visible) {
        setShowKnownPrompt(false);
        if (tokenId) {
          const rec = await getTranslation(tokenId);
          if (!active) return;
          setInput(rec?.translation ?? '');
        } else {
          setInput('');
        }
      } else {
        setInput('');
        setShowKnownPrompt(false);
      }
    })();
    return () => { active = false; };
  }, [visible, tokenId, getTranslation]);

  const dims = useMemo(() => {
    const width = 340;
    const estimatedHeight = 120;
    const margin = 8;

    const a = anchor ?? { x: screenWidth / 2 - 40, y: screenHeight / 2, width: 80, height: 20 };
    const centerX = a.x + a.width / 2;

    let left = Math.round(centerX - width / 2);
    left = Math.max(margin, Math.min(screenWidth - width - margin, left));

    // try above; if not enough space, place below
    let top = Math.round(a.y - estimatedHeight - margin);
    if (top < margin) top = Math.round(a.y + a.height + margin);

    return { width, top, left };
  }, [anchor, screenWidth, screenHeight]);

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* outside click to close */}
      <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

      <View
        style={{
          position: 'absolute',
          top: dims.top,
          left: dims.left,
          width: dims.width,
          backgroundColor: 'white',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        }}
      >
        <View>
          <ThemedText type="subtitle" style={{ marginBottom: 6 }}>{word}</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              placeholder="Enter translation..."
              value={input}
              onChangeText={setInput}
              autoFocus
              style={{ flex: 1, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
            />
            {input.trim().length > 0 ? (
              <Pressable
                onPress={async () => {
                  if (!tokenId || input.trim().length === 0) return;
                  const res = await saveTranslation(tokenId, input.trim());
                  if (res.ok) {
                    setShowKnownPrompt(true);
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                    closeTimer.current = setTimeout(() => {
                      setShowKnownPrompt(false);
                      onClose();
                    }, 1600);
                  }
                }}
                style={{ marginLeft: 8, backgroundColor: '#111827', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={{ color: 'white', fontWeight: '600' }}>{input ? 'Save' : 'Submit'}</ThemedText>
                )}
              </Pressable>
            ) : null}
          </View>

          {/* Inline action to mark as known */}
          <Pressable
            onPress={async () => {
              if (!word) return;
              const res = await markKnown(word);
              if (res.ok) onClose();
            }}
            style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 4 }}
          >
            <IconSymbol name="checkmark.circle.fill" size={16} color="#111827" />
            <ThemedText style={{ marginLeft: 6, fontSize: 12 }}>Mark as known</ThemedText>
          </Pressable>

          {error ? <ThemedText style={{ marginTop: 6, color: '#b91c1c' }}>{error}</ThemedText> : null}

          {showKnownPrompt ? (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(17,24,39,0.06)', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontSize: 12 }}>Saved. Mark this word as known?</ThemedText>
              <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                <Pressable
                  onPress={async () => {
                    if (!word) return;
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                    const res = await markKnown(word);
                    if (res.ok) onClose();
                  }}
                  style={{ backgroundColor: '#111827', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 }}
                >
                  <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Mark</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                    setShowKnownPrompt(false);
                    onClose();
                  }}
                  style={{ marginLeft: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 }}
                >
                  <ThemedText style={{ fontSize: 12 }}>Dismiss</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
