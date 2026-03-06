/**
 * CachedImage Component
 * 
 * High-performance image component with caching and optimized loading.
 * Uses react-native-fast-image for aggressive caching and faster loading.
 * 
 * Features:
 * - Automatic caching of network images
 * - Priority loading (high priority for visible images)
 * - Placeholder support while loading
 * - Error handling with fallback
 */

import React, { memo, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ImageStyle,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import FastImage, { Source, ResizeMode, Priority } from 'react-native-fast-image';
import { Colors } from '../../theme';

export interface CachedImageProps {
  /** Image source - can be URI or local require() */
  source: ImageSourcePropType | Source;
  /** Style for the image */
  style?: StyleProp<ImageStyle>;
  /** Container style */
  containerStyle?: StyleProp<ViewStyle>;
  /** Resize mode */
  resizeMode?: ResizeMode;
  /** Loading priority */
  priority?: Priority;
  /** Show loading indicator */
  showLoading?: boolean;
  /** Placeholder color while loading */
  placeholderColor?: string;
  /** Fallback image on error */
  fallbackSource?: ImageSourcePropType;
  /** Called when image loads successfully */
  onLoad?: () => void;
  /** Called when image fails to load */
  onError?: () => void;
}

/**
 * Convert ImageSourcePropType to FastImage Source
 */
const normalizeSource = (source: ImageSourcePropType | Source): Source | number => {
  if (typeof source === 'number') {
    // Local require() image
    return source;
  }
  
  if (typeof source === 'object' && 'uri' in source && source.uri) {
    // Network image with uri
    return {
      uri: source.uri,
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
    };
  }
  
  // Fallback
  return source as Source;
};

const CachedImage: React.FC<CachedImageProps> = memo(({
  source,
  style,
  containerStyle,
  resizeMode = FastImage.resizeMode.cover,
  priority = FastImage.priority.high,
  showLoading = false,
  placeholderColor = Colors.cardBackground,
  fallbackSource,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Determine the source to use
  let imageSource = normalizeSource(source);
  
  // Apply priority if it's a network image
  if (typeof imageSource === 'object' && 'uri' in imageSource) {
    imageSource = {
      ...imageSource,
      priority,
      cache: FastImage.cacheControl.immutable,
    };
  }

  // Use fallback if there was an error
  if (hasError && fallbackSource) {
    imageSource = normalizeSource(fallbackSource);
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <FastImage
        source={imageSource}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
      />
      {showLoading && isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: placeholderColor }]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
});

CachedImage.displayName = 'CachedImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CachedImage;

/**
 * Preload images for faster display
 * Call this when you have image URLs before they're displayed
 */
export const preloadImages = (urls: string[]): void => {
  const sources = urls.map(uri => ({
    uri,
    priority: FastImage.priority.high,
  }));
  FastImage.preload(sources);
};

/**
 * Clear image cache
 * Useful for freeing up storage
 */
export const clearImageCache = (): Promise<void> => {
  return FastImage.clearMemoryCache()
    .then(() => FastImage.clearDiskCache());
};
