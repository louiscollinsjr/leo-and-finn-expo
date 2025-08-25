import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useWordTranslations } from '@/hooks/useWordTranslations';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [step, setStep] = useState<'menu' | 'form'>('menu');
  const [input, setInput] = useState('');
  const { loading, error, saveTranslation, markKnown } = useWordTranslations();

  useEffect(() => {
    if (visible) {
      setStep('menu');
      setInput('');
    }
  }, [visible, word, tokenId]);

  const dims = useMemo(() => {
    const menuWidth = 260;
    const formWidth = 340;
    const width = step === 'menu' ? menuWidth : formWidth;
    const estimatedHeight = step === 'menu' ? 44 : 110;
    const margin = 8;

    const a = anchor ?? { x: screenWidth / 2 - 40, y: screenHeight / 2, width: 80, height: 20 };
    const centerX = a.x + a.width / 2;

    let left = Math.round(centerX - width / 2);
    left = Math.max(margin, Math.min(screenWidth - width - margin, left));

    // try above; if not enough space, place below
    let top = Math.round(a.y - estimatedHeight - margin);
    if (top < margin) top = Math.round(a.y + a.height + margin);

    return { width, top, left };
  }, [anchor, screenWidth, screenHeight, step]);

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
        {step === 'menu' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Pressable onPress={() => setStep('form')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingHorizontal: 0 }}>
              <IconSymbol name="square.and.pencil" size={16} color="#111827" />
              <ThemedText style={{ marginLeft: 8, fontWeight: '400', fontSize: 10, letterSpacing: 0.2 }}>Add Translation</ThemedText>
            </Pressable>
            <View style={{ width: 1, height: 12, backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <Pressable
              onPress={async () => {
                if (!word) return;
                const res = await markKnown(word);
                if (res.ok) onClose();
              }}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingHorizontal: 0, justifyContent: 'flex-end' }}
            >
              <IconSymbol name="checkmark.circle.fill" size={16} color="#111827" />
              <ThemedText style={{ marginLeft: 8, fontWeight: '400', fontSize: 10, letterSpacing: 0.2 }}>Got this one!</ThemedText>
            </Pressable>
          </View>
        ) : (
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
                    if (res.ok) onClose();
                  }}
                  style={{ marginLeft: 8, backgroundColor: '#111827', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={{ color: 'white', fontWeight: '600' }}>Submit</ThemedText>
                  )}
                </Pressable>
              ) : null}
            </View>
            {error ? <ThemedText style={{ marginTop: 6, color: '#b91c1c' }}>{error}</ThemedText> : null}
          </View>
        )}
      </View>
    </View>
  );
}
