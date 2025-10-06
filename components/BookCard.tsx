import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Book } from '@/types/reader';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import VideoBackground from './VideoBackground';

const DEFAULT_COVER = require('@/assets/images/bookcovers/BookCover_Blank.png');

export const BookCard = ({ book, style, onPress }: { book: Book; style?: any; onPress?: () => void }) => {
  const theme = useColorScheme() ?? 'light';
  const background = Colors[theme].background;
  const text = Colors[theme].text;
  const secondaryText = theme === 'dark' ? 'rgba(236,237,238,0.7)' : '#71717a';
  
  const coverSource = book.cover || DEFAULT_COVER;
  
  return (
    <View style={[styles.outerContainer, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${book.title} by ${book.author}`}
        onPress={onPress}
        style={({ pressed }) => [{
        ...styles.container,
        backgroundColor: background,
        opacity: pressed ? 0.9 : 1
      }]}
      >
        {book.videoCover ? (
          <VideoBackground
            videoCover={book.videoCover}
            cover={coverSource}
            style={styles.coverImage}
            shouldPlay={true}
            loop={book.loopVideo}
          />
        ) : (
          <Image
            source={coverSource}
            style={styles.coverImage}
            contentFit="cover"
          />
        )}
        <View style={styles.textContainer}>
          <Text numberOfLines={2} style={[styles.titleText, { color: text }]}>
            {book.title}
          </Text>
          <Text numberOfLines={2} style={[styles.authorText, { color: secondaryText }]}>
            {book.author}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 4,
    width: 176,
  },
  container: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  coverImage: {
    height: 260,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  textContainer: {
    marginTop: 12
  },
  titleText: {
    fontSize: 14,
    paddingLeft: 15,
    fontWeight: '600'
  },
  authorText: {
    fontSize: 12,
    paddingLeft: 15,
  }
});

export default BookCard;
