import { useEvent } from 'expo';
import { Image, ImageProps } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

type VideoBackgroundProps = {
  videoCover?: string;
  posterImage?: ImageProps['source'];
  cover?: ImageProps['source'];
  style?: ViewStyle;
  imageStyle?: ViewStyle;
  children?: React.ReactNode;
  shouldPlay?: boolean; // Controls video playback
  loop?: boolean; // Controls whether video should loop
  muted?: boolean; // Controls whether video should be muted
  showPosterOverlay?: boolean; // Controls whether to show poster image overlay
  onVideoReady?: () => void;
  onVideoError?: (error: string) => void;
};

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoCover,
  posterImage,
  cover,
  style,
  imageStyle,
  children,
  shouldPlay = false,
  loop = false,
  muted = true,
  showPosterOverlay = false,
  onVideoReady,
  onVideoError,
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start with image visible
  const viewRef = useRef(null);
  
  // Determine which image to show as fallback/poster
  const displayImage = posterImage || cover;
  
  // Initialize video player if we have a video source
  const player = videoCover ? useVideoPlayer(videoCover, player => {
    player.loop = loop;
    player.muted = muted;
    player.volume = muted ? 0 : 0.5;
  }) : null;

  // Auto-play when video is ready and shouldPlay is true
  useEffect(() => {
    if (player && shouldPlay && videoLoaded && !videoError) {
      try {
        player.play();
      } catch (error) {
        console.log('Error auto-playing video:', error);
      }
    }
  }, [player, shouldPlay, videoLoaded, videoError]);

  // Update loop property when it changes
  useEffect(() => {
    if (player) {
      player.loop = loop;
    }
  }, [player, loop]);
  
  // Use event hook to track playing state
  const { isPlaying } = player ? useEvent(player, 'playingChange', { isPlaying: player.playing }) : { isPlaying: false };
  
  const pauseVideo = useCallback(() => {
    try {
      if (player && player.playing) {
        player.pause();
      }
    } catch (error) {
      console.log('Error pausing video:', error);
    }
  }, [player]);

  const playVideo = useCallback(() => {
    try {
      if (player && videoLoaded) {
        player.play();
      }
    } catch (error) {
      console.log('Error playing video:', error);
    }
  }, [player, videoLoaded]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (player && player.playing) {
          player.pause();
        }
      } catch (error) {
        console.log('Error during cleanup:', error);
      }
    };
  }, [player]);

  // Handle errors
  useEffect(() => {
    if (player) {
      let errorSubscription;
      try {
        errorSubscription = player.addListener('error', (event) => {
          setVideoError(true);
          onVideoError?.(event.error.message);
        });
      } catch (error) {
        console.log('Error adding error listener:', error);
      }
      
      return () => {
        try {
          if (errorSubscription) {
            errorSubscription.remove();
          }
        } catch (error) {
          console.log('Error removing error subscription:', error);
        }
      };
    }
  }, [player, onVideoError]);

  // Reset states when video source changes
  useEffect(() => {
    if (videoCover) {
      setVideoLoaded(false);
      setVideoError(false);
      fadeAnim.setValue(1);
    }
  }, [videoCover, fadeAnim]);

  // Only show video if we have a video source, player is initialized, and no error occurred
  const showVideo = videoCover && player && !videoError;
  

  return (
    <View ref={viewRef} style={[styles.container, style]}>
      {/* Video Layer */}
      {showVideo && (
        <VideoView
          style={[styles.media, imageStyle]}
          player={player}
          contentFit="cover"
          nativeControls={false}
          onFirstFrameRender={() => {
            if (!videoLoaded) {
              setVideoLoaded(true);
              onVideoReady?.();
              if (shouldPlay) {
                try {
                  player.play();
                } catch (error) {
                  console.log('Error playing on first frame:', error);
                }
              }
              if (!showPosterOverlay) {
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }
            }
          }}
          onError={event => {
            console.log('Error in VideoBackground:', event);
            setVideoError(true);
          }}
        />
      )}
      
      {/* Poster/Image Layer - show if we have an image and either showPosterOverlay is true or video isn't loaded yet */}
      {displayImage && (showPosterOverlay || !videoLoaded || videoError) && (
        <Animated.View style={[styles.imageOverlay, { opacity: showPosterOverlay ? 1 : fadeAnim }]}>
          <Image
            source={displayImage}
            style={[styles.media, imageStyle]}
            contentFit={videoCover ? 'cover' : 'contain'}
          />
        </Animated.View>
      )}
      
      
      {/* Content Layer */}
      <View style={styles.contentLayer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  contentLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
});

export default VideoBackground;
