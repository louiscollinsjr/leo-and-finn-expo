import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Story = {
  id: string;
  title: string;
  description?: string;
  cover: string;
  accentColors?: [string, string]; // Optional gradient colors
};

export const FeaturedStory = ({ story }: { story: Story }) => {
  // Default gradient colors if not provided
  const colors = story.accentColors || ['#ef4444', '#b91c1c'];
  const pixelRatio = PixelRatio.get();
  
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            {/* Top headline */}
            <View style={styles.topContent}>
              <Text style={styles.headlineText} numberOfLines={2}>
                Leo & Finn
              </Text>
            </View>

            {/* Center content - could be a logo */}
            <View style={styles.centerContent}>
              {story.cover ? (
                <Image source={{ uri: story.cover }} style={styles.coverImage} contentFit="contain" />
              ) : (
                <Text style={styles.logoText}>{story.title}</Text>
              )}
            </View>
          </View>
          
          {/* Bottom caption/CTA */}
          <View style={styles.bottomContent}>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1 })}>
              <Text style={styles.ctaText}>Try Leo & Finn</Text>
              {story.description ? (
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {story.description}
                </Text>
              ) : null}
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 24,
    width: '100%',
    
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    height: 480, 
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#ef4444',
  },
  gradient: {
    borderRadius: 16,
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
    display: 'flex',
  },
  contentContainer: {
    flex: 1,
  },
  topContent: {
    padding: 20,
    paddingTop: 24,
  },
  headlineText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    fontFamily: 'Mansalva',
    letterSpacing: -0.5, 
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'flex-start', 
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },
  coverImage: {
    width: 180,
    height: 60,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 50, 
    fontWeight: '700',
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  ctaText: {
    color: '#ffffff', 
    fontSize: 16,
    fontWeight: '700',
  },
  descriptionText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'left',
  }
});

export default FeaturedStory;
