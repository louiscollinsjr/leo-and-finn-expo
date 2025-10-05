import { ImageProps } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';
import VideoBackground from './VideoBackground';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Story = {
  id: string;
  title: string;
  description?: string;
  cover?: ImageProps['source'];
  videoCover?: string;
  posterImage?: ImageProps['source'];
  accentColors?: string[] | [string, string];
  loopVideo?: boolean;
};

export const FeaturedStory = ({ story }: { story: Story & { loopVideo?: boolean } }) => {
  // Default gradient colors if not provided
  const colors = (story.accentColors || ['#ef4444', '#b91c1c']) as unknown as readonly [string, string];
  const pixelRatio = PixelRatio.get();

  const StoryContent = (
    <>
      <View style={styles.contentContainer}>
        {/* Top headline */}
        <View style={styles.topContent}>
          <Text style={styles.headlineText} numberOfLines={2}>
            Leo & Finn
          </Text>
        </View>

        {/* Center content - now always text */}
        <View style={styles.centerContent}>
          {/* <Text style={styles.logoText}>{story.title}</Text> */}
        </View>
      </View>

      {/* Bottom caption/CTA */}
      <View style={styles.bottomContent}>
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1 })}>
          <Text style={styles.logoText}>{story.title}</Text>
          {/* <Text style={styles.ctaText}>Try Leo & Finn</Text> */}
          {story.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {story.description}
            </Text>
          ) : null}
        </Pressable>
      </View>
    </>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {story.videoCover || story.cover ? (
          <VideoBackground
            videoCover={story.videoCover}
            posterImage={story.posterImage}
            cover={story.cover}
            style={styles.gradient}
            imageStyle={{ borderRadius: 16 }}
            shouldPlay={true}
            loop={story.loopVideo}
            muted={true}
            showPosterOverlay={false}
          >
            {/* <LinearGradient
              colors={story.videoCover 
                ? ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'] 
                : ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.gradient}
            >
              {StoryContent}
            </LinearGradient> */}
            {StoryContent}
          </VideoBackground>
        ) : (
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.gradient}
          >
            {StoryContent}
          </LinearGradient>
        )}
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
