// WordActionSheet: Legacy lightweight translation editor bottom sheet offering
// quick lookup, save, and "I know this word" actions for the selected token.
// Prefetches existing translations and expands on open, then closes when done.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ThemedText } from '@/components/ThemedText';
import { useWordTranslations } from '@/hooks/useWordTranslations';

export type WordActionSheetProps = {
  visible: boolean;
  word: string | null;
  tokenId?: string | null;
  onClose: () => void;
};

export default function WordActionSheet({ visible, word, tokenId, onClose }: WordActionSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%', '55%'], []);

  const { loading, error, getTranslation, saveTranslation, markKnown } = useWordTranslations();
  const [input, setInput] = useState('');

  // When opening for a word, prefetch existing translation
  useEffect(() => {
    let active = true;
    (async () => {
      if (visible && word) {
        bottomSheetRef.current?.expand();
        const rec = tokenId ? await getTranslation(tokenId) : null;
        if (!active) return;
        setInput(rec?.translation ?? '');
      } else {
        bottomSheetRef.current?.close();
        setInput('');
      }
    })();
    return () => { active = false; };
  }, [visible, word, tokenId, getTranslation]);

  const onSave = async () => {
    if (!tokenId) return;
    const res = await saveTranslation(tokenId, input.trim());
    if (res.ok) onClose();
  };

  const onKnown = async () => {
    if (!word) return;
    const res = await markKnown(word);
    if (res.ok) onClose();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
      )}
      onChange={(idx) => { if (idx === -1) onClose(); }}
    >
      <View style={{ flex: 1, padding: 16 }}>
        <ThemedText type="subtitle">{word || ''}</ThemedText>
        <TextInput
          placeholder="Your translation"
          value={input}
          onChangeText={setInput}
          style={{ marginTop: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
        />

        <Pressable
          onPress={onSave}
          style={{ marginTop: 16, backgroundColor: '#111827', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
        >
          <ThemedText style={{ color: 'white', fontWeight: '600' }}>{input ? 'Update Translation' : 'Save Translation'}</ThemedText>
        </Pressable>

        <Pressable
          onPress={onKnown}
          style={{ marginTop: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
        >
          <ThemedText>Mark as Known</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => bottomSheetRef.current?.close()}
          style={{ marginTop: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
        >
          <ThemedText>Close</ThemedText>
        </Pressable>

        {loading ? (
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator />
            <ThemedText style={{ marginLeft: 8, opacity: 0.6 }}>Working…</ThemedText>
          </View>
        ) : null}
        {error ? <ThemedText style={{ marginTop: 8, color: '#b91c1c' }}>{error}</ThemedText> : null}
      </View>
    </BottomSheet>
  );
}
