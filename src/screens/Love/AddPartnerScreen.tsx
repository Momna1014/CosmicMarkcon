/**
 * AddPartnerScreen
 * 
 * Multi-step screen to add a partner for Deep Bond compatibility
 * Step 1: Name input
 * Step 2: Birthday selection
 * Step 3: City/Country (optional)
 */

import React, {useState, useEffect, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';
import {DatePicker} from '../../components/DatePicker';
import {CountryPickerModal, CityPickerModal, TimePickerModal, TimePickerValue} from '../../components/pickers';
import {addPartner} from '../../redux/slices/partnersSlice';
import {getZodiacSign} from '../../components/mock/zodiacMockData';
import {hapticLight} from '../../utils/haptics';
import {ICountry, ICity, City} from 'country-state-city';

// Analytics
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  trackAddPartnerView,
  trackAddPartnerStep,
  trackAddPartnerComplete,
  trackAddPartnerDismiss,
} from '../../utils/mainScreenAnalytics';

// Icons
import CloseIcon from '../../assets/icons/home_icons/cross.svg';
import ClockIcon from '../../assets/icons/onboarding_icons/watch.svg';
import ArrowRightIcon from '../../assets/icons/home_icons/right_arrow.svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const BackgroundImageSource = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type StepType = 'name' | 'birthday' | 'location';

interface AddPartnerScreenProps {
  navigation: any;
}




// Step configuration
const STEP_CONFIG = {
  name: {
    heading: 'How are you know to\nthe universe?',
    subheading: 'Your Celestial identifier',
    placeholder: 'Your Name',
  },
  birthday: {
    heading: 'When did your\njourney begin?',
    subheading: 'The Alignment of your stars',
    placeholder: 'MM/DD/YY',
  },
  location: {
    heading: 'Where did you draw\nyour first breath?',
    subheading: 'City and Time of arrival (OPYTIONAL)',
    placeholder: 'e.g. New York',
  },
};

const AddPartnerScreen: React.FC<AddPartnerScreenProps> = ({navigation}) => {
  const dispatch = useDispatch();
  
  // Form state
  const [currentStep, setCurrentStep] = useState<StepType>('name');
  const [partnerName, setPartnerName] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [birthTime, setBirthTime] = useState<TimePickerValue | null>(null);
  const [countryHasCities, setCountryHasCities] = useState(false);
  
  // Modal state
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Animation values
  const progressWidth = useSharedValue(33);
  const buttonScale = useSharedValue(1);

  // Analytics - Screen View
  useScreenView('AddPartner', {
    screen_category: 'love',
  });

  // Analytics - Track screen view on mount
  useEffect(() => {
    trackAddPartnerView();
    firebaseService.logScreenView('AddPartner', 'AddPartnerScreen');
  }, []);

  // Update progress bar based on step
  useEffect(() => {
    const stepProgress = {
      name: 33,
      birthday: 66,
      location: 100,
    };
    progressWidth.value = withTiming(stepProgress[currentStep], {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    // Track step changes
    trackAddPartnerStep(currentStep);
  }, [currentStep, progressWidth]);


  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Get step index for progress dots
  const getStepIndex = () => {
    const steps: StepType[] = ['name', 'birthday', 'location'];
    return steps.indexOf(currentStep);
  };

  // Handle close
  const handleClose = () => {
    hapticLight();
    trackAddPartnerDismiss(currentStep);
    navigation.goBack();
  };

  // Handle continue
  const handleContinue = useCallback(() => {
    hapticLight();
    buttonScale.value = withSequence(
      withTiming(1.02, {duration: 100}),
      withTiming(1, {duration: 100}),
    );

    setTimeout(() => {
      if (currentStep === 'name') {
        setCurrentStep('birthday');
      } else if (currentStep === 'birthday') {
        setCurrentStep('location');
      } else if (currentStep === 'location') {
        // Save partner to Redux
        if (birthday) {
          const zodiacSign = getZodiacSign(birthday);
          trackAddPartnerComplete(zodiacSign.name, selectedCity !== null);
          dispatch(addPartner({
            name: partnerName.trim(),
            birthday: birthday.toISOString(),
            zodiacSign: zodiacSign.name,
            city: selectedCity?.name,
            country: selectedCountry?.name,
          }));
          navigation.goBack();
        }
      }
    }, 150);
  }, [currentStep, birthday, partnerName, selectedCity, selectedCountry, dispatch, navigation, buttonScale]);

  // Check if continue is enabled
  const isContinueEnabled = () => {
    if (currentStep === 'name') {
      return partnerName.trim().length > 0;
    }
    if (currentStep === 'birthday') {
      return birthday !== null;
    }
    // Location step requires country, city (if available), and time
    if (currentStep === 'location') {
      const hasCountry = selectedCountry !== null;
      const hasCity = countryHasCities ? selectedCity !== null : true;
      const hasTime = birthTime !== null;
      return hasCountry && hasCity && hasTime;
    }
    return true;
  };

  // Handle country selection
  const handleCountrySelect = useCallback((country: ICountry) => {
    setSelectedCountry(country);
    setSelectedCity(null);
    // Check if country has cities
    const cities = City.getCitiesOfCountry(country.isoCode);
    setCountryHasCities(!!cities && cities.length > 0);
  }, []);

  // Handle time selection
  const handleTimeSelect = useCallback((time: TimePickerValue) => {
    setBirthTime(time);
    setShowTimePicker(false);
  }, []);

  // Format time for display
  const formatTime = (time: TimePickerValue) => {
    const hour = time.hour.toString();
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute} ${time.ampm}`;
  };

  // Handle city selection
  const handleCitySelect = useCallback((city: ICity) => {
    setSelectedCity(city);
  }, []);

  // Calculate date limits
  const maxDate = new Date(2016, 11, 31);
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);

  const stepConfig = STEP_CONFIG[currentStep];

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImageSource}
        style={styles.container}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          {/* Twinkling Stars Overlay
          {STARS_CONFIG.map((star, index) => (
            <TwinklingStar
              key={index}
              size={star.size}
              top={star.top}
              left={star.left}
              delay={star.delay}
              intensity={star.intensity}
            />
          ))} */}

          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              
              {/* Header with Close and Progress */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}>
                  <CloseIcon width={moderateScale(40)} height={moderateScale(40)} />
                </TouchableOpacity>

                {/* Progress Dots */}
                <View style={styles.progressDots}>
                  {[0, 1, 2].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.progressDot,
                        index <= getStepIndex() && styles.progressDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Content based on step */}
              <View style={styles.contentContainer}>
                {/* Heading */}
                <Animated.Text
                  entering={FadeInDown.delay(200).duration(600).springify()}
                  key={`heading-${currentStep}`}
                  style={styles.mainHeading}>
                  {stepConfig.heading}
                </Animated.Text>

                {/* Subheading */}
                <Animated.Text
                  entering={FadeInDown.delay(350).duration(600).springify()}
                  key={`subheading-${currentStep}`}
                  style={styles.subHeading}>
                  {stepConfig.subheading}
                </Animated.Text>

                {/* Step Content */}
                <View style={styles.inputSection}>
                  {currentStep === 'name' && (
                    <Animated.View
                      entering={FadeInUp.delay(400).duration(500)}
                      style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        placeholder={stepConfig.placeholder}
                        placeholderTextColor="rgba(194, 209, 243, 0.4)"
                        value={partnerName}
                        onChangeText={setPartnerName}
                        autoFocus
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          if (partnerName.trim().length > 0) {
                            handleContinue();
                          }
                        }}
                      />
                      <View style={styles.inputUnderline} />
                    </Animated.View>
                  )}

                  {currentStep === 'birthday' && (
                    <Animated.View
                      entering={FadeInUp.delay(400).duration(500)}
                      style={styles.datePickerContainer}>
                      <DatePicker
                        value={birthday}
                        onChange={setBirthday}
                        minimumDate={minDate}
                        maximumDate={maxDate}
                      />
                    </Animated.View>
                  )}

                  {currentStep === 'location' && (
                    <Animated.View
                      entering={FadeInUp.delay(400).duration(500)}
                      style={styles.locationContainer}>
                      {/* Country Input */}
                      <TouchableOpacity
                        style={styles.locationInput}
                        onPress={() => setShowCountryPicker(true)}
                        activeOpacity={0.7}>
                        <Text style={[
                          styles.locationText,
                          !selectedCountry && styles.locationPlaceholder,
                        ]}>
                          {selectedCountry?.name || 'Select Country'}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.inputUnderline} />

                      {/* City Input - only show if country has cities */}
                      {countryHasCities && (
                        <>
                          <TouchableOpacity
                            style={styles.locationInput}
                            onPress={() => setShowCityPicker(true)}
                            activeOpacity={0.7}>
                            <Text style={[
                              styles.locationText,
                              !selectedCity && styles.locationPlaceholder,
                            ]}>
                              {selectedCity?.name || 'Select City'}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.inputUnderline} />
                        </>
                      )}

                      {/* Time Input */}
                      <TouchableOpacity
                        style={styles.timeInputContainer}
                        onPress={() => setShowTimePicker(true)}
                        activeOpacity={0.7}>
                        <Text style={[
                          styles.timeText,
                          !birthTime && styles.locationPlaceholder,
                        ]}>
                          {birthTime ? formatTime(birthTime) : 'Time of Birth'}
                        </Text>
                        <ClockIcon width={24} height={24} />
                      </TouchableOpacity>
                      <View style={styles.inputUnderline} />
                    </Animated.View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Section with Continue Button */}
            <Animated.View
              entering={FadeInUp.delay(600).duration(500)}
              style={styles.bottomSection}>
              <AnimatedTouchable
                style={[
                  styles.continueButton,
                  !isContinueEnabled() && styles.continueButtonDisabled,
                  buttonAnimatedStyle,
                ]}
                disabled={!isContinueEnabled()}
                onPress={handleContinue}
                activeOpacity={0.8}>
                <Text style={styles.continueButtonText}>Continue</Text>
                <ArrowRightIcon width={20} height={20} />
              </AnimatedTouchable>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      {/* Pickers */}
      <CountryPickerModal
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(country) => {
          handleCountrySelect(country);
          setShowCountryPicker(false);
        }}
      />

      {selectedCountry && (
        <CityPickerModal
          visible={showCityPicker}
          onClose={() => setShowCityPicker(false)}
          onSelect={(city) => {
            handleCitySelect(city);
            setShowCityPicker(false);
          }}
          countryCode={selectedCountry.isoCode}
          countryName={selectedCountry.name}
        />
      )}

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={handleTimeSelect}
        initialValue={birthTime || undefined}
      />
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
    elevation: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(10),
    marginBottom: verticalScale(40),
  },
  closeButton: {
    // width: 44,
    // height: 44,
    // borderRadius: 22,
    // backgroundColor: 'rgba(194, 209, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: horizontalScale(8),
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(194, 209, 243, 0.3)',
  },
  progressDotActive: {
    backgroundColor: Colors.white,
  },
  contentContainer: {
    flex: 1,
    paddingTop: verticalScale(20),
  },
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(36),
    lineHeight: fontScale(43),
    color: Colors.white,
    marginBottom: verticalScale(18),
    textAlign: 'center',
  },
  subHeading: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    lineHeight: fontScale(16),
    color: Colors.subHeading,
    marginBottom: verticalScale(60),
    textAlign: 'center',
  },
  inputSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: verticalScale(30),
  },
  textInput: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(28),
    color: 'white',
    paddingVertical: verticalScale(12),
  },
  inputUnderline: {
    height: 1,
    backgroundColor: 'rgba(194, 209, 243, 0.2)',
  },
  datePickerContainer: {
    marginBottom: verticalScale(30),
  },
  locationContainer: {
    marginBottom: verticalScale(30),
  },
  locationInput: {
    paddingVertical: verticalScale(16),
  },
  locationText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(28),
    color: 'rgba(221, 197, 96, 1)',
  },
  locationPlaceholder: {
    color: 'rgba(194, 209, 243, 0.4)',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(20),
  },
  timeText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(28),
    color: 'rgba(194, 209, 243, 0.4)',
  },
  bottomSection: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(30),
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(18),
    gap: horizontalScale(8),
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.black,
  },
});

export default AddPartnerScreen;
