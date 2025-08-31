import { useRef, useEffect } from 'react';

// Global video manager to ensure only one video plays at a time
class VideoManager {
  private activeVideoId: string | null = null;
  private callbacks = new Map<string, () => void>();

  setActiveVideo(videoId: string, pauseCallback: () => void) {
    // Pause the currently active video if it's different
    if (this.activeVideoId && this.activeVideoId !== videoId) {
      const currentCallback = this.callbacks.get(this.activeVideoId);
      currentCallback?.();
    }
    
    this.activeVideoId = videoId;
    this.callbacks.set(videoId, pauseCallback);
  }

  clearActiveVideo(videoId: string) {
    if (this.activeVideoId === videoId) {
      this.activeVideoId = null;
    }
    this.callbacks.delete(videoId);
  }
}

const videoManager = new VideoManager();

export const useVideoManager = (videoId: string) => {
  const pauseCallbackRef = useRef<(() => void) | null>(null);

  const registerVideo = (pauseCallback: () => void) => {
    pauseCallbackRef.current = pauseCallback;
  };

  const requestPlay = () => {
    if (pauseCallbackRef.current) {
      videoManager.setActiveVideo(videoId, pauseCallbackRef.current);
      return true;
    }
    return false;
  };

  useEffect(() => {
    return () => {
      videoManager.clearActiveVideo(videoId);
    };
  }, [videoId]);

  return { registerVideo, requestPlay };
};
