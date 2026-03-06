/**
 * ReaderHeader Component
 * 
 * Header for the PDF reader showing title, chapter info, and progress
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import RightArrowSvg from '../../assets/icons/right_arrow.svg';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
  fontScale,
} from '../../theme';

interface ReaderHeaderProps {
  title: string;
  chapterTitle: string;
  progress: string; // e.g., "0%" or "45%"
  onBack: () => void;
  visible?: boolean;
}

const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  title,
  chapterTitle,
  progress,
  onBack,
  visible = true,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor={Colors.background}
        />
      ) : (
        <View style={styles.androidBackground} />
      )}
      <View style={[styles.headerContent, { paddingTop: insets.top }]}>
        {/* Row with icon and title */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <RightArrowSvg
              width={moderateScale(50)}
              height={moderateScale(50)}
            />
          </TouchableOpacity>

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{progress}</Text>
          </View>
        </View>

        {/* Chapter title below, aligned with title */}
        <Text style={styles.chapterTitle} numberOfLines={1}>
          {chapterTitle}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 11, 12, 0.95)',
  },
  headerContent: {
    paddingHorizontal: horizontalScale(8),
    paddingBottom: verticalScale(12),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: horizontalScale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: fontScale(16),
    fontFamily: FontFamilies.jetBrainsMonoExtraBold,
    color: Colors.white,
    marginLeft: horizontalScale(4),
  },
  chapterTitle: {
    fontSize: fontScale(14),
    fontFamily: FontFamilies.sfProDisplayMedium,
    color: Colors.inactive,
    // marginTop: verticalScale(2),
    marginLeft: horizontalScale(44), // Align with title (backButton width + margin)
  },
  progressContainer: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
  },
  progressText: {
    fontSize: fontScale(16),
    fontFamily: FontFamilies.jetBrainsMonoExtraBold,
    color: Colors.inactive,
  },
});

export default memo(ReaderHeader);
