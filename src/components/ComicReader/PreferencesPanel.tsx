/**
 * PreferencesPanel Component
 * 
 * Bottom sheet panel for reader settings and preferences
 * Includes: Brightness, Scroll Direction, Reading Mode, Background, Toggle Options
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import CrossIcon from '../../assets/icons/cross.svg';
import BrightnessGreyIcon from '../../assets/icons/brightness_grey.svg';
import BrightnessWhiteIcon from '../../assets/icons/brightness_white.svg';
import { ReaderPreferences } from './types';

const HorizontalIcon = require('../../assets/icons/png/horizontal.png');
const VerticalIcon = require('../../assets/icons/png/verticle.png');

interface PreferencesPanelProps {
  preferences: ReaderPreferences;
  onPreferenceChange: (key: keyof ReaderPreferences, value: any) => void;
  onClose: () => void;
  visible: boolean;
}

const PreferencesPanel: React.FC<PreferencesPanelProps> = ({
  preferences,
  onPreferenceChange,
  onClose,
  visible,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + verticalScale(8) }]}>
      {/* Close button - top right corner */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
      </TouchableOpacity>

      {/* Layout Type row */}
      <View style={styles.layoutRow}>
        <Text style={styles.labelText}>Layout Type</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => onPreferenceChange('scrollDirection', 'horizontal')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText,
              { color: preferences.scrollDirection === 'horizontal' ? Colors.white : Colors.light_gray }
            ]}>
              Horizontal
            </Text>
            <Image
              source={HorizontalIcon}
              style={[
                styles.iconImage,
                { tintColor: preferences.scrollDirection === 'horizontal' ? Colors.white : Colors.light_gray }
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => onPreferenceChange('scrollDirection', 'vertical')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText,
              { color: preferences.scrollDirection === 'vertical' ? Colors.white : Colors.light_gray }
            ]}>
              Vertical
            </Text>
            <Image
              source={VerticalIcon}
              style={[
                styles.iconImage,
                { tintColor: preferences.scrollDirection === 'vertical' ? Colors.white : Colors.light_gray }
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Brightness row */}
      <View style={styles.brightnessSection}>
        <Text style={styles.labelText}>Brightness</Text>
        <View style={styles.sliderRow}>
          <BrightnessGreyIcon width={moderateScale(16)} height={moderateScale(16)} />
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={100}
            step={5}
            value={preferences.brightness}
            onValueChange={(value) => onPreferenceChange('brightness', Math.round(value))}
            minimumTrackTintColor="rgba(255, 255, 255, 0.9)"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            thumbTintColor="#FFFFFF"
          />
          <BrightnessWhiteIcon width={moderateScale(18)} height={moderateScale(18)} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: verticalScale(65),
    alignSelf: 'center',
    width: '100%',
    backgroundColor: Colors.background,
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(14),
  },
  closeButton: {
    position: 'absolute',
    top: verticalScale(15),
    right: verticalScale(14),
    zIndex: 10,
  },
  layoutRow: {
    marginTop: verticalScale(8),
  },
  labelText: {
    fontSize: moderateScale(16),
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    color:Colors.light_gray,
    marginBottom: verticalScale(10),
    fontWeight:'500'
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: horizontalScale(24),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },
  optionText: {
    fontSize: moderateScale(16),
    fontFamily: FontFamilies.sfProDisplayMedium,
  },
  iconImage: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: 'contain',
  },
  brightnessSection: {
    marginTop: verticalScale(16),
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  slider: {
    flex: 1,
    height: verticalScale(24),
  },
});

export default memo(PreferencesPanel);
