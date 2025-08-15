import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export type RatingSheetProps = {
  visible: boolean;
  title?: string;
  initialRating?: number; // 0..5
  onClose: () => void;
  onSave: (rating: number) => void;
};

export default function RatingSheet({ visible, title = 'Rate', initialRating = 0, onClose, onSave }: RatingSheetProps) {
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 12, marginVertical: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const idx = i + 1;
            const active = idx <= rating;
            return (
              <Pressable key={idx} hitSlop={8} onPress={() => setRating(idx)}>
                <IconSymbol size={28} name="star" color={active ? '#ffffff' : 'rgba(255,255,255,0.35)'} />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.cancel]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.save]}
            onPress={() => {
              onSave(rating);
              onClose();
            }}
          >
            <Text style={[styles.buttonText, { fontWeight: '700' }]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  save: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});
