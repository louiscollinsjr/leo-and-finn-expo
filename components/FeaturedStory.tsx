import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
            style={[StyleSheet.absoluteFillObject, styles.gradient]}
          >
        <Pressable
          style={({ pressed }) => ([
            styles.pressable,
            { opacity: pressed ? 0.96 : 1 }
          ])}
        >
         

          {/* Top headline */}
          <View style={styles.topContent}>
            <Text style={styles.headlineText} numberOfLines={2}>
              {story.title}
            </Text>
          </View>

          {/* Center content - could be a logo */}
          <View style={styles.centerContent}>
            {story.cover ? (
              <Image source={{ uri: story.cover }} style={styles.coverImage} contentFit="contain" />
            ) : (
              <Text style={styles.logoText}>Leo & Finn</Text>
            )}
          </View>

          {/* Bottom caption/CTA */}
          <View style={styles.bottomContent}>
            <Text style={styles.ctaText}>Try Leo & Finn</Text>
            {story.description ? (
              <Text style={styles.descriptionText} numberOfLines={2}>
                {story.description}
              </Text>
            ) : null}
          </View>
          
        </Pressable>
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
    height: 510, 
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#ef4444',
  },
  gradient: {
    borderRadius: 16, 
  },
  pressable: {
    flex: 1,
  },
  topContent: {
    padding: 20,
    paddingTop: 16,
  },
  headlineText: {
    color: '#ffffff',
    fontSize: 28, 
    fontWeight: '700',
    letterSpacing: -0.5, 
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start', 
    paddingHorizontal: 20,
    minHeight: 120, 
  },
  coverImage: {
    width: 180,
    height: 60,
  },
  logoText: {
    color: '#000000',
    fontSize: 36, 
    fontWeight: '600',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'flex-start', 
  },
  ctaText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  descriptionText: {
    color: 'rgba(000,000,000,0.9)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'left',
  }
});

export default FeaturedStory;
