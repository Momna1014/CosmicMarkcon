/**
 * CosmicLoader - Reusable full-screen loader component
 *
 * Features:
 * - Lottie animation (loader1)
 * - BlurView background for iOS
 * - Dark overlay background for Android
 * - Optional loading text
 *
 * Usage:
 * <CosmicLoader visible={isLoading} />
 * <CosmicLoader visible={isLoading} text="Loading your chart..." />
 */

import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import LottieView from 'lottie-react-native';
import {FontFamilies, moderateScale, verticalScale} from '../../theme';

// Import loader animation
const LoaderAnimation = require('../../assets/lottie/loader2.json');

interface CosmicLoaderProps {
  /** Whether the loader is visible */
  visible: boolean;
  /** Optional loading text to display below the animation */
  text?: string;
  /** Whether to show the loader without a modal (inline) */
  inline?: boolean;
  /** Size of the Lottie animation (default: 200) */
  size?: number;
}

const CosmicLoader: React.FC<CosmicLoaderProps> = memo(
  ({visible, text, inline = false, size = moderateScale(900)}) => {
    if (!visible) {
      return null;
    }

    const loaderContent = (
      <View style={styles.content}>
        <LottieView
          source={LoaderAnimation}
          autoPlay
          loop
          style={{
            width: moderateScale(size),
            height: moderateScale(size),
          }}
        />
        {/* {text && <Text style={styles.text}>{text}</Text>} */}
      </View>
    );

    // Inline mode - no modal, no blur
    if (inline) {
      return <View style={styles.inlineContainer}>{loaderContent}</View>;
    }

    // Full-screen mode with blur/overlay
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.container}>
          {Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.9)"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidBlur]} />
          )}
          {loaderContent}
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamilies.interMedium,
    fontSize: moderateScale(16),
    color: 'rgba(194, 209, 243, 0.9)',
    textAlign: 'center',
    marginTop: verticalScale(16),
    paddingHorizontal: moderateScale(24),
  },
});

export default CosmicLoader;
