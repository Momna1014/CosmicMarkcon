/**
 * OnboardingScreen9 - Birth Time & Place Screen
 *
 * Allows user to select birth time (AM/PM) and birth place (City, Country)
 * For calculating Rising sign and exact sky map
 *
 * Optimized for performance with separate memoized components
 */

import React, {memo, useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  withDelay,
} from 'react-native-reanimated';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';
import {ICountry, ICity, City} from 'country-state-city';
import {OnboardingData} from './OnboardingContainer';
import {
  TimePickerModal,
  TimePickerValue,
  CountryPickerModal,
  CityPickerModal,
} from '../../components/pickers';

// SVG Icons
import WatchIcon from '../../assets/icons/onboarding_icons/watch.svg';
import PolicyIcon from '../../assets/icons/onboarding_icons/policy.svg';
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding9View,
  trackOnboarding9TimeSelected,
  trackOnboarding9CountrySelected,
  trackOnboarding9CitySelected,
  trackOnboarding9Continue,
} from '../../utils/onboardingAnalytics';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Background image - same as other onboarding screens
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Memoized Twinkling Star Component
interface TwinklingStarProps {
  size: number;
  top: number;
  left: number;
  delay: number;
  intensity: 'low' | 'medium' | 'high';
}

const TwinklingStar = memo<TwinklingStarProps>(
  ({size, top, left, delay, intensity}) => {
    const opacity = useSharedValue(0.3);
    const scale = useSharedValue(0.8);

    const opacityRange = useMemo(
      () => ({
        low: {min: 0.2, max: 0.5},
        medium: {min: 0.3, max: 0.7},
        high: {min: 0.4, max: 1.0},
      }),
      [],
    );

    const scaleRange = useMemo(
      () => ({
        low: {min: 0.8, max: 1.0},
        medium: {min: 0.7, max: 1.1},
        high: {min: 0.6, max: 1.2},
      }),
      [],
    );

    const durationRange = useMemo(
      () => ({
        low: 3000,
        medium: 2500,
        high: 2000,
      }),
      [],
    );

    useEffect(() => {
      const range = opacityRange[intensity];
      const scaleR = scaleRange[intensity];
      const duration = durationRange[intensity];

      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(range.max, {
              duration,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(range.min, {
              duration,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        ),
      );

      scale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(scaleR.max, {
              duration: duration * 0.8,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(scaleR.min, {
              duration: duration * 0.8,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        ),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{scale: scale.value}],
    }));

    return (
      <Animated.View
        style={[
          styles.star,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top,
            left,
          },
          animatedStyle,
        ]}
      />
    );
  },
);

// Memoized Birth Time Card
interface BirthTimeCardProps {
  timeValue: TimePickerValue | null;
  onPress: () => void;
}

const BirthTimeCard = memo<BirthTimeCardProps>(({timeValue, onPress}) => {
  const {t} = useTranslation();

  const formatTimeDisplay = useCallback(() => {
    if (!timeValue) {
      return null;
    }
    const hour = String(timeValue.hour).padStart(2, '0');
    const minute = String(timeValue.minute).padStart(2, '0');
    return `${hour}:${minute} ${timeValue.ampm}`;
  }, [timeValue]);

  const displayTime = formatTimeDisplay();

  return (
    <Animated.View
      entering={FadeInUp.delay(500).duration(500).springify()}
      style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>{t('onboarding.screen9.birthTime')}</Text>
          <WatchIcon width={24} height={24} />
        </View>
        <View style={styles.timeDisplayContainer}>
          {displayTime ? (
            <Text style={styles.timeDisplay}>{displayTime}</Text>
          ) : (
            <Text style={styles.timePlaceholder}>--:-- --</Text>
          )}
        </View>
        <Text style={styles.cardHint}>
          {t('onboarding.screen9.timeHint')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Memoized Birth Place Card
interface BirthPlaceCardProps {
  selectedCountry: ICountry | null;
  selectedCity: ICity | null;
  countryHasCities: boolean;
  onCountryPress: () => void;
  onCityPress: () => void;
}

const BirthPlaceCard = memo<BirthPlaceCardProps>(
  ({selectedCountry, selectedCity, countryHasCities, onCountryPress, onCityPress}) => {
    const {t} = useTranslation();

    return (
      <Animated.View
        entering={FadeInUp.delay(600).duration(500).springify()}
        style={styles.card}>
        <Text style={styles.cardLabelPurple}>{t('onboarding.screen9.birthPlace')}</Text>

        {/* Country Picker Button - Always show first */}
        <TouchableOpacity
          style={styles.locationPickerButton}
          onPress={onCountryPress}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.locationPickerText,
              !selectedCountry && styles.locationPickerPlaceholder,
            ]}>
            {selectedCountry?.name || t('onboarding.screen9.selectCountry')}
          </Text>
        </TouchableOpacity>

        {/* City Picker Button - Only show when country is selected AND has cities */}
        {selectedCountry && countryHasCities && (
          <TouchableOpacity
            style={styles.locationPickerButton}
            onPress={onCityPress}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.locationPickerText,
                !selectedCity && styles.locationPickerPlaceholder,
              ]}>
              {selectedCity?.name || t('onboarding.screen9.selectCity')}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.cardHintSmall}>
          {countryHasCities ? t('onboarding.screen9.cardHintWithCity') : t('onboarding.screen9.cardHintNoCity')}
        </Text>
      </Animated.View>
    );
  },
);

// Stars configuration - moved outside component to prevent recreation
const STARS_CONFIG = [
  {
    size: 6,
    top: SCREEN_HEIGHT * 0.08,
    left: SCREEN_WIDTH * 0.15,
    delay: 0,
    intensity: 'high' as const,
  },
  {
    size: 4,
    top: SCREEN_HEIGHT * 0.12,
    left: SCREEN_WIDTH * 0.75,
    delay: 300,
    intensity: 'medium' as const,
  },
  {
    size: 8,
    top: SCREEN_HEIGHT * 0.05,
    left: SCREEN_WIDTH * 0.5,
    delay: 600,
    intensity: 'high' as const,
  },
  {
    size: 3,
    top: SCREEN_HEIGHT * 0.1,
    left: SCREEN_WIDTH * 0.9,
    delay: 150,
    intensity: 'low' as const,
  },
  {
    size: 5,
    top: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.3,
    delay: 450,
    intensity: 'medium' as const,
  },
  {
    size: 7,
    top: SCREEN_HEIGHT * 0.2,
    left: SCREEN_WIDTH * 0.85,
    delay: 200,
    intensity: 'high' as const,
  },
  {
    size: 4,
    top: SCREEN_HEIGHT * 0.22,
    left: SCREEN_WIDTH * 0.1,
    delay: 800,
    intensity: 'medium' as const,
  },
  {
    size: 6,
    top: SCREEN_HEIGHT * 0.25,
    left: SCREEN_WIDTH * 0.6,
    delay: 100,
    intensity: 'high' as const,
  },
  {
    size: 3,
    top: SCREEN_HEIGHT * 0.18,
    left: SCREEN_WIDTH * 0.45,
    delay: 550,
    intensity: 'low' as const,
  },
  {
    size: 5,
    top: SCREEN_HEIGHT * 0.75,
    left: SCREEN_WIDTH * 0.2,
    delay: 300,
    intensity: 'medium' as const,
  },
  {
    size: 6,
    top: SCREEN_HEIGHT * 0.78,
    left: SCREEN_WIDTH * 0.65,
    delay: 100,
    intensity: 'high' as const,
  },
  {
    size: 5,
    top: SCREEN_HEIGHT * 0.82,
    left: SCREEN_WIDTH * 0.9,
    delay: 550,
    intensity: 'medium' as const,
  },
  {
    size: 7,
    top: SCREEN_HEIGHT * 0.85,
    left: SCREEN_WIDTH * 0.4,
    delay: 200,
    intensity: 'high' as const,
  },
];

interface OnboardingScreen9Props {
  onNext?: (birthTime: string, city: string, country: string) => void;
  onboardingData: OnboardingData;
}

export const OnboardingScreen9: React.FC<OnboardingScreen9Props> = ({
  onNext,
  onboardingData: _onboardingData,
}) => {
  const {t} = useTranslation();

  // State - Deferred loading for modals
  const [isReady, setIsReady] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeValue, setTimeValue] = useState<TimePickerValue | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [countryHasCities, setCountryHasCities] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Progress bar animation - start from previous screen's value (73%)
  const progressWidth = useSharedValue(73);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  // Defer heavy operations to after mount using requestAnimationFrame
  useEffect(() => {
    // Track screen view
    trackOnboarding9View();
    
    // Use requestAnimationFrame as a lightweight alternative to InteractionManager
    const frameId = requestAnimationFrame(() => {
      setIsReady(true);
    });

    // Animate progress bar on mount - Screen 9 of 11 (82%)
    progressWidth.value = withDelay(
      300,
      withTiming(82, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );

    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Handlers - memoized to prevent re-renders
  const handleNext = useCallback(() => {
    hapticLight();
    buttonScale.value = withSequence(
      withTiming(1.02, {duration: 100}),
      withTiming(1, {duration: 100}),
    );

    const timeString = timeValue
      ? `${timeValue.hour}:${String(timeValue.minute).padStart(2, '0')} ${timeValue.ampm}`
      : '';

    // Track completion with location data
    trackOnboarding9Continue(
      Boolean(timeString),
      Boolean(selectedCountry?.name),
      Boolean(selectedCity?.name),
    );

    setTimeout(() => {
      onNext?.(
        timeString,
        selectedCity?.name || '',
        selectedCountry?.name || '',
      );
    }, 150);
  }, [timeValue, selectedCity, selectedCountry, onNext, buttonScale]);

  const handleOpenTimePicker = useCallback(() => {
    setShowTimePicker(true);
  }, []);

  const handleCloseTimePicker = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  const handleTimeConfirm = useCallback((value: TimePickerValue) => {
    setTimeValue(value);
    setShowTimePicker(false);
    // Track time selection with AM/PM
    trackOnboarding9TimeSelected(value.ampm);
  }, []);

  const handleOpenCountryPicker = useCallback(() => {
    setShowCountryPicker(true);
  }, []);

  const handleCloseCountryPicker = useCallback(() => {
    setShowCountryPicker(false);
  }, []);

  const handleCountrySelect = useCallback((country: ICountry) => {
    setSelectedCountry(country);
    setSelectedCity(null); // Reset city when country changes
    
    // Track country selection
    trackOnboarding9CountrySelected(country.name);
    
    // Check if country has cities
    const cities = City.getCitiesOfCountry(country.isoCode) || [];
    setCountryHasCities(cities.length > 0);
  }, []);

  const handleOpenCityPicker = useCallback(() => {
    if (selectedCountry) {
      setShowCityPicker(true);
    }
  }, [selectedCountry]);

  const handleCloseCityPicker = useCallback(() => {
    setShowCityPicker(false);
  }, []);

  const handleCitySelect = useCallback((city: ICity) => {
    setSelectedCity(city);
    // Track city selection
    trackOnboarding9CitySelected(city.name);
  }, []);

  // Check if all fields are filled
  // City is only required if the country has cities
  const isFormComplete = useMemo(() => {
    if (!timeValue || !selectedCountry) return false;
    // If country has cities, require city selection; otherwise just country is enough
    return countryHasCities ? Boolean(selectedCity) : true;
  }, [timeValue, selectedCountry, selectedCity, countryHasCities]);

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImageSource}
        style={styles.container}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          {/* Twinkling Stars Overlay */}
          {STARS_CONFIG.map((star, index) => (
            <TwinklingStar
              key={index}
              size={star.size}
              top={star.top}
              left={star.left}
              delay={star.delay}
              intensity={star.intensity}
            />
          ))}

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Progress Bar */}
            <Animated.View
              entering={FadeIn.delay(100).duration(400)}
              style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[styles.progressBarFilled, progressAnimatedStyle]}
                />
              </View>
            </Animated.View>

            {/* Main Heading */}
            <Animated.Text
              entering={FadeInDown.delay(200).duration(600).springify()}
              style={styles.mainHeading}>
              {t('onboarding.screen9.heading')}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(300).duration(600).springify()}
              style={styles.subHeadingYellow}>
              {t('onboarding.screen9.emphasis')}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(400).duration(600).springify()}
              style={styles.description}>
              {t('onboarding.screen9.subheading')}
            </Animated.Text>

            {/* Birth Time Card */}
            <BirthTimeCard
              timeValue={timeValue}
              onPress={handleOpenTimePicker}
            />

            {/* Birth Place Card */}
            <BirthPlaceCard
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              countryHasCities={countryHasCities}
              onCountryPress={handleOpenCountryPicker}
              onCityPress={handleOpenCityPicker}
            />

            {/* Privacy Notice */}
            <Animated.View
              entering={FadeInUp.delay(700).duration(500)}
              style={styles.privacyContainer}>
              <PolicyIcon width={16} height={16} />
              <Text style={styles.privacyText}>
                {t('onboarding.screen9.privacy')}
              </Text>
            </Animated.View>

            {/* Completion Text - Only visible when form is complete */}
            {isFormComplete && (
              <Animated.View
                entering={FadeIn.duration(400)}
                style={styles.completionContainer}>
                <Text style={styles.completionText}>
                  {t('onboarding.screen9.completionPart1')}
                  <Text style={styles.completionTextHighlight}>
                    {t('onboarding.screen9.completionHighlight')}
                  </Text>
                  {t('onboarding.screen9.completionPart2')}
                </Text>
              </Animated.View>
            )}

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Bottom Section */}
            <Animated.View
              entering={FadeInUp.delay(800).duration(500)}
              style={styles.bottomSection}>
              <AnimatedTouchable
                style={[
                  styles.nextButton,
                  buttonAnimatedStyle,
                  !isFormComplete && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                activeOpacity={0.8}
                disabled={!isFormComplete}>
                <Text
                  style={[
                    styles.nextButtonText,
                    !isFormComplete && styles.nextButtonTextDisabled,
                  ]}>
                  {t('onboarding.screen9.button')}
                </Text>
              </AnimatedTouchable>
            </Animated.View>
          </View>

          {/* Modals - Only render when ready to avoid blocking navigation */}
          {isReady && (
            <>
              <TimePickerModal
                visible={showTimePicker}
                onClose={handleCloseTimePicker}
                onConfirm={handleTimeConfirm}
                initialValue={timeValue || undefined}
              />

              <CountryPickerModal
                visible={showCountryPicker}
                onClose={handleCloseCountryPicker}
                onSelect={handleCountrySelect}
              />

              {selectedCountry && (
                <CityPickerModal
                  visible={showCityPicker}
                  onClose={handleCloseCityPicker}
                  onSelect={handleCitySelect}
                  countryCode={selectedCountry.isoCode}
                  countryName={selectedCountry.name}
                />
              )}
            </>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: Colors.cosmicBackground,
  },
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  safeArea: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: Colors.white,
    shadowColor: Colors.white,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
  },
  progressBarContainer: {
    marginBottom: verticalScale(24),
  },
  progressBarBackground: {
    height: verticalScale(8),
    backgroundColor: Colors.progressBarBackground,
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  progressBarFilled: {
    width: '90%',
    height: '100%',
    backgroundColor: Colors.progressBarFilled,
    borderRadius: radiusScale(2),
  },
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(36),
    lineHeight: fontScale(50),
    color: Colors.white,
  },
  subHeadingYellow: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(36),
    lineHeight: fontScale(43),
    color: '#C6A6FE',
    marginBottom: verticalScale(12),
  },
  description: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '600',
    fontSize: fontScale(16),
    lineHeight: fontScale(20),
    color: '#C2D1F3',
    marginBottom: verticalScale(24),
  },
  card: {
    backgroundColor: 'rgba(190, 190, 190, 0.09)',
    borderRadius: radiusScale(24),
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor:'rgba(185, 185, 185, 0.75)',
    top:verticalScale(60)
  
  
    // flex:1
  },
  cardTouchable: {
    // flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  cardLabel: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: '#6287FF',
    letterSpacing: 1,
  },
  cardLabelPurple: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: '#6287FF',
    letterSpacing: 1,
    marginBottom: verticalScale(12),
  },
  timeDisplayContainer: {
    marginBottom: verticalScale(8),
  },
  timeDisplay: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(17),
    color: Colors.white,
    // letterSpacing: 2,
  },
  timePlaceholder: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(20),
    color: Colors.white,
    letterSpacing: 4,
  },
  cardHint: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '600',
    fontSize: fontScale(14),
    lineHeight: fontScale(16),
    color: '#C2D1F3',
  },
  cardHintSmall: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(12),
    color: '#C2D1F3',
    marginTop: verticalScale(8),
    marginStart:horizontalScale(4)
  },
  locationPickerButton: {
    backgroundColor: 'rgba(144, 144, 144, 0.09)',
    borderRadius: radiusScale(8),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  locationPickerText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: Colors.white,
  },
  locationPickerPlaceholder: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
    marginTop: verticalScale(70),
  },
  privacyText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(14),
    color: '#6287FF',
  },
  completionContainer: {
    marginTop: verticalScale(25),
    alignItems: 'center',
  },
  completionText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: '#C2D1F3',
    textAlign: 'center',
  },
  completionTextHighlight: {
    color: Colors.white,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: verticalScale(10),
  },
  nextButton: {
    backgroundColor: Colors.white,
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.black,
  },
  nextButtonTextDisabled: {
    opacity: 0.7,
  },
});

export default OnboardingScreen9;
