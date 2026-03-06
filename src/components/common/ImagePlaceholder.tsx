/**
 * ImagePlaceholder Component
 * 
 * Shows a placeholder with the MV logo while images are loading.
 * Used to provide a better UX on first app launch when image cache is empty.
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import FastImage, { Source, ResizeMode, ImageStyle } from 'react-native-fast-image';
import { Colors } from '../../theme';

// Import the logo for placeholder
const logoPlaceholder = require('../../assets/icons/png/logo.png');

export interface ImagePlaceholderProps {
  /** Image source - URI object */
  source: Source | number;
  /** Style for the image */
  style?: StyleProp<ImageStyle>;
  /** Container style */
  containerStyle?: StyleProp<ViewStyle>;
  /** Resize mode for the actual image */
  resizeMode?: ResizeMode;
  /** Background color for placeholder */
  placeholderColor?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = memo(({
  source,
  style,
  containerStyle,
  resizeMode = FastImage.resizeMode.cover,
  placeholderColor = Colors.cardBackground,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Normalize source to ensure high priority and caching
  const normalizedSource = typeof source === 'number' 
    ? source 
    : {
        ...source,
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.immutable,
      };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Placeholder - shows while loading or on error */}
      {(isLoading || hasError) && (
        <View style={[styles.placeholder, { backgroundColor: placeholderColor }, style]}>
          <FastImage
            source={logoPlaceholder}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      )}
      
      {/* Actual Image */}
      <FastImage
        source={normalizedSource}
        style={[styles.image, style, (isLoading || hasError) && styles.hiddenImage]}
        resizeMode={resizeMode}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
});

ImagePlaceholder.displayName = 'ImagePlaceholder';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: '40%',
    height: '40%',
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    opacity: 0,
  },
});

export default ImagePlaceholder;
