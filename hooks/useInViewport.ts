import { useState, useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';

export const useInViewport = (threshold: number = 0.8) => {
  const [isInViewport, setIsInViewport] = useState(false);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    const checkViewport = () => {
      if (viewRef.current) {
        viewRef.current.measureInWindow((x, y, width, height) => {
          const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
          
          // Calculate visible area more accurately
          const visibleTop = Math.max(0, y);
          const visibleBottom = Math.min(screenHeight, y + height);
          const visibleLeft = Math.max(0, x);
          const visibleRight = Math.min(screenWidth, x + width);
          
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const visibleWidth = Math.max(0, visibleRight - visibleLeft);
          const visibleArea = visibleHeight * visibleWidth;
          const totalArea = height * width;
          
          const visibilityRatio = totalArea > 0 ? visibleArea / totalArea : 0;
          const inView = visibilityRatio >= threshold;
          
          setIsInViewport(inView);
        });
      }
    };

    // Check after a brief delay to ensure layout is complete
    const timeoutId = setTimeout(checkViewport, 100);

    // Set up interval to check periodically (for scroll events)
    const interval = setInterval(checkViewport, 200);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [threshold]);

  return { isInViewport, viewRef };
};
