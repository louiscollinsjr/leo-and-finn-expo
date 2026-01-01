// ReaderSettingsSheet: Unified opaque bottom sheet for all reader settings
// Includes reading modes, typography, and appearance controls
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { QuickThemeSwatches } from '@/constants/Colors';
import { AVAILABLE_FONTS, type FontFamily } from '@/lib/fonts';
import { LANG_LABELS, listGuidesForBookLang } from '@/lib/pronunciation';
import { useReaderPrefs, useReaderUI, type ReadingMode, type ThemeMode } from '@/providers/ReaderProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import React, { forwardRef, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface ReaderSettingsSheetProps {
  onClose: () => void;
}

export const ReaderSettingsSheet = forwardRef<TrueSheet, ReaderSettingsSheetProps>(
  ({ onClose }, ref) => {
    const { prefs, setPrefs, resetPrefs } = useReaderPrefs();
    const { readingMode, setReadingMode, pronunciationLang, setPronunciationLang } = useReaderUI();

    // Get available reader languages for the current book language
    const availableReaderLangs = useMemo(() => {
      return listGuidesForBookLang(pronunciationLang.bookLang);
    }, [pronunciationLang.bookLang]);

    const adjustFont = (delta: number) => {
      const nextFont = Math.max(0.7, Math.min(1.6, (prefs.fontScale ?? 1) + delta));
      setPrefs({ fontScale: nextFont });
    };

    const adjustLineHeight = (delta: number) => {
      const next = Math.max(0.8, Math.min(2.0, (prefs.lineHeightScale ?? 1) + delta));
      setPrefs({ lineHeightScale: next });
    };

    const adjustMargins = (delta: number) => {
      const next = Math.max(0.5, Math.min(2.0, (prefs.marginScale ?? 1) + delta));
      setPrefs({ marginScale: next });
    };

    return (
      <TrueSheet
        ref={ref}
        detents={['auto', 1]}
        maxHeight={480}
        cornerRadius={24}
        onDidDismiss={onClose}
        scrollable
        backgroundColor="#FFFFFF"
      >
        <View style={styles.container}>
          {/* Close Button */}
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={8}
          >
            <IconSymbol name="xmark" size={20} color="#000" style={styles.closeIcon} />
          </Pressable>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {/* Reading Modes */}
          <View style={styles.section}>
            <View style={styles.modeGrid}>
              <ModeButton
                icon="menu-book"
                mode="normal"
                activeMode={readingMode}
                onPress={() => setReadingMode('normal')}
                label="Read"
              />
              <ModeButton
                icon="center-focus-strong"
                mode="focused"
                activeMode={readingMode}
                onPress={() => setReadingMode('focused')}
                label="Focus"
              />
              <ModeButton
                icon="record-voice-over"
                mode="pronunciation"
                activeMode={readingMode}
                onPress={() => setReadingMode('pronunciation')}
                label="Pronounce"
              />
              <ModeButton
                icon="translate"
                mode="translations"
                activeMode={readingMode}
                onPress={() => setReadingMode('translations')}
                label="Translate"
              />
            </View>
          </View>

          {/* Pronunciation Mode Settings */}
          {readingMode === 'pronunciation' && (
            <>
              {/* Reader's Native Language Selector */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Your Native Language</ThemedText>
                <View style={styles.langGrid}>
                  {availableReaderLangs.map(({ readerLang, label }) => {
                    const isSelected = pronunciationLang.readerLang === readerLang;
                    return (
                      <Pressable
                        key={readerLang}
                        style={[styles.langButton, isSelected && styles.langButtonActive]}
                        onPress={() => setPronunciationLang({ readerLang })}
                      >
                        <ThemedText
                          style={[
                            styles.langLabel,
                            isSelected && styles.langLabelActive,
                          ]}
                          numberOfLines={1}
                        >
                          {label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Font Selector */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Pronunciation Font</ThemedText>
                <View style={styles.fontGrid}>
                  {(Object.keys(AVAILABLE_FONTS) as FontFamily[]).map((fontKey) => {
                    const font = AVAILABLE_FONTS[fontKey];
                    const isSelected = prefs.pronunciationFont === fontKey;
                    return (
                      <Pressable
                        key={fontKey}
                        style={[styles.fontButton, isSelected && styles.fontButtonActive]}
                        onPress={() => setPrefs({ pronunciationFont: fontKey })}
                      >
                        <ThemedText
                          style={[
                            styles.fontLabel,
                            isSelected && styles.fontLabelActive,
                            { fontFamily: font.regular }
                          ]}
                          numberOfLines={1}
                        >
                          {font.displayName}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* Text Size Controls */}
          <View style={styles.textSizeSection}>
            <View style={styles.textSizeButtons}>
              <Pressable
                style={styles.textSizeButton}
                onPress={() => adjustFont(-0.1)}
              >
                <ThemedText style={styles.textSizeButtonText}>A</ThemedText>
              </Pressable>
              <Pressable
                style={styles.textSizeButton}
                onPress={() => adjustFont(0.1)}
              >
                <ThemedText style={styles.textSizeButtonTextLarge}>A</ThemedText>
              </Pressable>
            </View>
            <IconSymbol name="sun.max" size={20} color="#000" style={styles.brightnessIcon} />
          </View>

          {/* Theme Presets */}
          <View style={styles.themeSection}>
            <View style={styles.themeGrid}>
              {(Object.keys(QuickThemeSwatches) as ThemeMode[]).map((themeKey) => {
                const swatch = QuickThemeSwatches[themeKey];
                const selected = prefs.theme === themeKey;
                return (
                  <Pressable
                    key={themeKey}
                    style={[styles.themeCard, selected && styles.themeCardSelected]}
                    onPress={() => setPrefs({ theme: themeKey })}
                  >
                    <View
                      style={[
                        styles.themePreview,
                        { backgroundColor: swatch.background },
                      ]}
                    >
                      <View
                        style={[
                          styles.themeLine,
                          { backgroundColor: swatch.text, opacity: 0.9 },
                        ]}
                      />
                      <View
                        style={[
                          styles.themeLine,
                          { backgroundColor: swatch.text, opacity: 0.6 },
                        ]}
                      />
                    </View>
                    <ThemedText style={styles.themeName}>{swatch.label}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Customize Button */}
          <Pressable style={styles.customizeButton}>
            <IconSymbol name="gearshape" size={20} color="#000" style={{ opacity: 0.7 }} />
            <ThemedText style={styles.customizeButtonText}>Customize</ThemedText>
          </Pressable>

          {/* Reset Button (Dev Tool) */}
          <Pressable
            style={styles.resetButton}
            onPress={() => {
              resetPrefs();
              onClose();
            }}
          >
            <ThemedText style={styles.resetButtonText}>Reset to Defaults</ThemedText>
          </Pressable>
        </ScrollView>
        </View>
      </TrueSheet>
    );
  }
);

ReaderSettingsSheet.displayName = 'ReaderSettingsSheet';

function ModeButton({
  icon,
  mode,
  activeMode,
  onPress,
  label,
}: {
  icon: any;
  mode: ReadingMode;
  activeMode: ReadingMode;
  onPress: () => void;
  label: string;
}) {
  const isActive = mode === activeMode;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.modeButton, isActive && styles.modeButtonActive]}
    >
      <MaterialIcons
        name={icon}
        size={28}
        color={isActive ? '#007AFF' : '#000'}
        style={{ opacity: isActive ? 1 : 0.5 }}
      />
      <ThemedText style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: {
    opacity: 0.7,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  fontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(118,118,128,0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  fontButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  fontLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  fontLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(118,118,128,0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
  },
  langButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  langLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  langLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  textSizeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(118,118,128,0.12)',
    borderRadius: 10,
    marginBottom: 20,
  },
  textSizeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  textSizeButton: {
    width: 110,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  textSizeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  textSizeButtonTextLarge: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000',
  },
  brightnessIcon: {
    opacity: 0.6,
  },
  themeSection: {
    marginBottom: 20,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  themeCardSelected: {
    borderColor: '#007AFF',
  },
  themePreview: {
    height: 80,
    padding: 16,
    justifyContent: 'center',
    gap: 8,
  },
  themeLine: {
    height: 4,
    borderRadius: 2,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '500',
    padding: 8,
    textAlign: 'center',
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    backgroundColor: 'rgba(118,118,128,0.12)',
    borderRadius: 10,
    marginTop: 8,
  },
  customizeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
  },
  modeLabelActive: {
    opacity: 1,
    color: '#007AFF',
    fontWeight: '600',
  },
  resetButton: {
    paddingVertical: 12,
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
