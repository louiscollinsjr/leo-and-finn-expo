import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Book } from '@/types/reader';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import VideoBackground from './VideoBackground';

export const BookCard = ({ book, style, onPress }: { book: Book; style?: any; onPress?: () => void }) => {
  const theme = useColorScheme() ?? 'light';
  const background = Colors[theme].background;
  const text = Colors[theme].text;
  const secondaryText = theme === 'dark' ? 'rgba(236,237,238,0.7)' : '#71717a';
  
  // Default gradient colors if not provided (similar to FeaturedStory)
  const colors = book.accentColors || ['#7F9CF5', '#5A67D8'];
  
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
        {book.videoCover || book.cover || book.posterImage ? (
          <VideoBackground
            videoCover={book.videoCover}
            posterImage={book.posterImage}
            cover={book.cover}
            style={styles.coverImage}
            shouldPlay={true}
            loop={book.loopVideo}
          />
        ) : (
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.initialContainer}>
              <Text style={styles.initialText}>{book.title.charAt(0)}</Text>
            </View>
          </LinearGradient>
        )}
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={[styles.titleText, { color: text }]}>
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
    height: 240,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  gradient: {
    height: 240,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  initialContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold'
  },
  textContainer: {
    marginTop: 12
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600'
  },
  authorText: {
    fontSize: 12
  }
});

export default BookCard;
