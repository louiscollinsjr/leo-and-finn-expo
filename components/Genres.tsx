import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Genre = {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
};

const genresList: Genre[] = [
  { id: '1', name: 'Fiction & Literature', icon: 'book.closed.fill' },
  { id: '2', name: 'Mysteries & Thrillers', icon: 'magnifyingglass' },
  { id: '3', name: 'Nonfiction', icon: 'chart.bar.fill' },
  { id: '4', name: 'Romance', icon: 'heart.fill' },
  { id: '5', name: 'Health, Mind & Body', icon: 'brain.head.profile' },
  { id: '6', name: 'All Genres', icon: 'line.3.horizontal' },
];

interface GenresProps {
  onGenrePress?: (genre: Genre) => void;
  theme?: 'light' | 'dark';
}

export default function Genres(props?: GenresProps) {
  const { onGenrePress, theme = 'light' } = props || {};
  const cardBackground = theme === 'dark' ? 'rgba(28,28,30,1)' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const separatorColor = theme === 'dark' ? 'rgba(84,84,88,0.65)' : 'rgba(198,198,200,1)';

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: textColor }]}>Genres</Text>
      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        {genresList.map((genre, index) => (
          <React.Fragment key={genre.id}>
            <Pressable
              style={({ pressed }) => [styles.itemContainer, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => onGenrePress?.(genre)}
            >
              <IconSymbol name={genre.icon} size={22} color={theme === 'dark' ? '#34c759' : '#34c759'} />
              <Text style={[styles.itemText, { color: textColor }]}>{genre.name}</Text>
              <IconSymbol name="chevron.right" size={16} color="#8e8e93" style={{ marginRight: 8 }} />
            </Pressable>
            {index < genresList.length - 1 && <View style={[styles.separator, { backgroundColor: separatorColor }]} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 48,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemText: {
    flex: 1,
    fontSize: 17,
    marginLeft: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54, // Align with text
  },
});