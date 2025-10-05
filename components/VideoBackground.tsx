import { Image, ImageProps } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';

type VideoBackgroundProps = {
  videoCover?: string;
  posterImage?: ImageProps['source'];
  cover?: ImageProps['source'];
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  children?: React.ReactNode;
  shouldPlay?: boolean; // Controls video playback
  loop?: boolean; // Controls whether video should loop
  muted?: boolean; // Controls whether video should be muted
  showPosterOverlay?: boolean; // Controls whether to show poster image overlay
  onVideoReady?: () => void;
  onVideoError?: (error: string) => void;
};

type VideoPlayerLayerProps = {
  source: string;
  loop: boolean;
  muted: boolean;
  shouldPlay: boolean;
  showPosterOverlay: boolean;
  fadeAnim: Animated.Value;
  imageStyle?: ImageStyle;
  shouldAnimatePoster: boolean;
  onVideoReady?: () => void;
  onVideoError?: (error: string) => void;
  setVideoLoaded: (value: boolean) => void;
  reportError: () => void;
  clearError: () => void;
};

function VideoPlayerLayer({
  source,
  loop,
  muted,
  shouldPlay,
  showPosterOverlay,
  fadeAnim,
  imageStyle,
  shouldAnimatePoster,
  onVideoReady,
  setVideoLoaded,
  reportError,
  clearError,
  onVideoError,
}: VideoPlayerLayerProps) {
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = loop;
    instance.muted = muted;
    instance.volume = muted ? 0 : 0.5;
  });

  useEffect(() => {
    player.loop = loop;
  }, [player, loop]);

  useEffect(() => {
    player.muted = muted;
    player.volume = muted ? 0 : 0.5;
  }, [player, muted]);

  useEffect(() => {
    try {
      if (shouldPlay) {
        player.play();
      } else if (player.playing) {
        player.pause();
      }
    } catch (error) {
      console.log('Error controlling video playback:', error);
      reportError();
      onVideoError?.((error as Error)?.message ?? 'Unable to control playback');
    }
  }, [player, shouldPlay, reportError, onVideoError]);

  useEffect(() => {
    return () => {
      try {
        if (player.playing) {
          player.pause();
        }
      } catch (error) {
        console.log('Error pausing video on cleanup:', error);
      }
    };
  }, [player]);

  useEffect(() => {
    const subscription = (player as any).addListener?.('error', (event: any) => {
      reportError();
      const message = event?.error?.message ?? event?.nativeEvent?.error ?? 'Video playback error';
      onVideoError?.(message);
    });
    return () => subscription?.remove?.();
  }, [player, reportError, onVideoError]);

  return (
    <VideoView
      style={[styles.media, imageStyle]}
      player={player}
      contentFit="cover"
      nativeControls={false}
      onFirstFrameRender={() => {
        setVideoLoaded(true);
        clearError();
        onVideoReady?.();
        if (shouldPlay) {
          try {
            player.play();
          } catch (error) {
            console.log('Error playing on first frame:', error);
            reportError();
            onVideoError?.((error as Error)?.message ?? 'Unable to play video');
          }
        }
        if (shouldAnimatePoster && !showPosterOverlay) {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      }}
    />
  );
}

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

  const displayImage = posterImage || cover;

  const resetState = useCallback(() => {
    setVideoLoaded(false);
    setVideoError(false);
    fadeAnim.setValue(1);
  }, [fadeAnim]);

  useEffect(() => {
    resetState();
  }, [videoCover, resetState]);

  return (
    <View style={[styles.container, style]}>
      {videoCover ? (
        <VideoPlayerLayer
          source={videoCover}
          loop={loop}
          muted={muted}
          shouldPlay={shouldPlay}
          showPosterOverlay={showPosterOverlay}
          fadeAnim={fadeAnim}
          imageStyle={imageStyle}
          shouldAnimatePoster={Boolean(displayImage)}
          onVideoReady={onVideoReady}
          setVideoLoaded={setVideoLoaded}
          reportError={() => setVideoError(true)}
          clearError={() => setVideoError(false)}
          onVideoError={onVideoError}
        />
      ) : null}

      {displayImage && (showPosterOverlay || !videoLoaded || videoError) && (
        <Animated.View style={[styles.imageOverlay, { opacity: showPosterOverlay ? 1 : fadeAnim }]}> 
          <Image
            source={displayImage}
            style={[styles.media, imageStyle]}
            contentFit={videoCover ? 'cover' : 'contain'}
          />
        </Animated.View>
      )}

      <View style={styles.contentLayer}>{children}</View>
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
