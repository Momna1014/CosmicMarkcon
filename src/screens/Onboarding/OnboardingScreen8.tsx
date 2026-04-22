/**
 * Onboarding Screen 8
 * Birthplace selection - Country and City
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import {ICountry, ICity, City} from 'country-state-city';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';
import {hapticLight} from '../../utils/haptics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {trackOnboarding8BirthplaceView} from '../../utils/onboardingAnalytics';
import {OnboardingButton} from '../../components/OnboardingButton';
import {
  CountryPickerModal,
  CityPickerModal,
} from '../../components/pickers';

// Icons
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';

// Icons
// import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';

const HORIZONTAL_PADDING = horizontalScale(16);

interface OnboardingScreen8Props {
  onNext?: (city: string, country: string) => void;
  onGoBack?: () => void;
}

export const OnboardingScreen8: React.FC<OnboardingScreen8Props> = ({
  onNext,
  onGoBack,
}) => {
  
  // State
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [countryHasCities, setCountryHasCities] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  useScreenView('OnboardingScreen8', {
    screen_category: 'onboarding',
    step: 8,
    total_steps: 9,
  });

  const CURRENT_STEP = 8;
  const TOTAL_STEPS = 12;
  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  useEffect(() => {
    trackOnboarding8BirthplaceView();
    firebaseService.logScreenView('onboarding_8_birthplace_selection', 'OnboardingScreen8');

    const targetProgress = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressWidth.value = withDelay(
      300,
      withTiming(targetProgress, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Handlers
  const handleOpenCountryPicker = useCallback(() => {
    hapticLight();
    setShowCountryPicker(true);
  }, []);

  const handleCloseCountryPicker = useCallback(() => {
    setShowCountryPicker(false);
  }, []);

  const handleCountrySelect = useCallback((country: ICountry) => {
    setSelectedCountry(country);
    setSelectedCity(null); // Reset city when country changes
    
    // Check if country has cities
    const cities = City.getCitiesOfCountry(country.isoCode) || [];
    setCountryHasCities(cities.length > 0);
  }, []);

  const handleOpenCityPicker = useCallback(() => {
    if (selectedCountry) {
      hapticLight();
      setShowCityPicker(true);
    }
  }, [selectedCountry]);

  const handleCloseCityPicker = useCallback(() => {
    setShowCityPicker(false);
  }, []);

  const handleCitySelect = useCallback((city: ICity) => {
    setSelectedCity(city);
  }, []);

  const handleContinue = () => {
    // Pass location data to container (can be empty if user didn't select)
    if (selectedCountry) {
      const cityName = selectedCity?.name || '';
      const countryName = selectedCountry.name;
      onNext?.(cityName, countryName);
    } else {
      // User skipped - pass empty strings (location is optional)
      onNext?.('', '');
    }
  };

  const handleBack = () => {
    hapticLight();
    onGoBack?.();
  };

  // Note: We allow users to skip this step entirely
  // No validation needed - continue button is always enabled

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.content}>
          {/* Header: Back + Progress Bar + Step Counter */}
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <BackArrowIcon width={moderateScale(24)} height={moderateScale(24)} />
            </TouchableOpacity>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[styles.progressBarFilled, progressAnimatedStyle]}
                />
              </View>
            </View>

            <Text style={styles.stepCounter}>{CURRENT_STEP}/{TOTAL_STEPS}</Text>
          </Animated.View>

          {/* Main Heading */}
          <Animated.Text
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.mainHeading}>
            Your birthplace holds{'\n'}the key. Where were{'\n'}you born?
          </Animated.Text>

          {/* Subheading */}
          <Animated.Text
            entering={FadeInDown.delay(350).duration(600).springify()}
            style={styles.subHeading}>
            Your location shapes your cosmic{'\n'}blueprint.
          </Animated.Text>

          {/* Country Selection */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(500).springify()}
            style={styles.selectionContainer}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={handleOpenCountryPicker}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.selectionText,
                  !selectedCountry && styles.selectionPlaceholder,
                ]}>
                {selectedCountry?.name || 'Country'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* City Selection - Only show if country is selected and has cities */}
          {selectedCountry && countryHasCities && (
            <Animated.View
              entering={FadeInUp.delay(100).duration(500).springify()}
              style={styles.selectionContainer}>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={handleOpenCityPicker}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.selectionText,
                    !selectedCity && styles.selectionPlaceholder,
                  ]}>
                  {selectedCity?.name || 'City'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Spacer to push button to bottom */}
          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View
            entering={FadeIn.delay(400).duration(400)}
            style={styles.bottomSection}>
            <OnboardingButton
              text="Continue"
              onPress={handleContinue}
            />
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <CountryPickerModal
          visible={showCountryPicker}
          onClose={handleCloseCountryPicker}
          onSelect={handleCountrySelect}
        />
      )}

      {/* City Picker Modal */}
      {showCityPicker && selectedCountry && (
        <CityPickerModal
          visible={showCityPicker}
          countryCode={selectedCountry.isoCode}
          countryName={selectedCountry.name}
          onClose={handleCloseCityPicker}
          onSelect={handleCitySelect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(10),
    marginBottom: verticalScale(24),
  },
  backButton: {
    marginRight: horizontalScale(12),
  },
  progressBarContainer: {
    flex: 1,
    marginRight: horizontalScale(12),
  },
  progressBarBackground: {
    height: verticalScale(6),
    backgroundColor: 'rgba(184, 190, 208, 0.2)',
    borderRadius: radiusScale(6),
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: Colors.newOnboardingProgressFilled,
    borderRadius: radiusScale(6),
  },
  stepCounter: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(14),
    color: Colors.white,
  },
  // Typography
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(28),
    lineHeight: fontScale(32),
    color: Colors.newOnboardingHeading,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subHeading: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    lineHeight: fontScale(20),
    color: Colors.newOnboardingSubheading,
    textAlign: 'center',
    marginBottom: verticalScale(40),
  },
  // Selection Buttons
  selectionContainer: {
    marginBottom: verticalScale(16),
  },
  selectionButton: {
    backgroundColor: '#3a3a3a21',
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    borderWidth: 1,
    borderColor: '#262D3D',
    alignItems: 'center',
  },
  selectionText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: Colors.white,
  },
  selectionPlaceholder: {
    color: Colors.newOnboardingSubheading,
    opacity: 0.6,
  },
  // Spacer
  spacer: {
    flex: 1,
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen8;
