import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StatusBar,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {ICountry, ICity, City, Country} from 'country-state-city';
import {useApp} from '../../contexts/AppContext';

// Analytics
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  trackProfileView,
  trackProfileEditTap,
  trackProfileSave,
  trackProfileSubscriptionTap,
} from '../../utils/mainScreenAnalytics';

// Icons
import StarIcon from '../../assets/icons/home_icons/welcome_star.svg';
import {
  selectOnboardingState,
  saveOnboardingData,
} from '../../redux/slices/onboardingSlice';
import {AppDispatch} from '../../redux/store';
import {DatePicker} from '../../components/DatePicker';
import {
  TimePickerModal,
  TimePickerValue,
  CountryPickerModal,
  CityPickerModal,
} from '../../components/pickers';
import {getZodiacSign} from '../../components/mock/zodiacMockData';
import {styles} from './styles';

const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

type Props = {
  navigation: any;
};

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingData = useSelector(selectOnboardingState);
  const {isPremium} = useApp();

  // Form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState<TimePickerValue | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [countryHasCities, setCountryHasCities] = useState(false);
  // Show profile card initially if user has completed onboarding (has name)
  const [showProfileCard, setShowProfileCard] = useState(!!onboardingData.name);

  // Entrance animations
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(40)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.95)).current;

  // Analytics - Screen View
  useScreenView('Profile', {
    screen_category: 'main',
    zodiac_sign: onboardingData?.zodiacSign || '',
  });

  // Analytics - Track screen view on mount
  useEffect(() => {
    trackProfileView(onboardingData?.zodiacSign || '');
    firebaseService.logScreenView('Profile', 'ProfileScreen');
  }, [onboardingData?.zodiacSign]);

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(120, [
      // Header animation
      Animated.parallel([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Card animation
      Animated.parallel([
        Animated.timing(cardFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          friction: 7,
          tension: 35,
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Picker visibility
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Calculate zodiac sign dynamically based on current birth date
  const calculatedZodiacSign = useMemo(() => {
    if (birthDate) {
      const zodiacData = getZodiacSign(birthDate);
      return zodiacData?.name || null;
    }
    return onboardingData.zodiacSign;
  }, [birthDate, onboardingData.zodiacSign]);

  // Initialize form with Redux data on mount
  useEffect(() => {
    if (onboardingData.name) {
      setName(onboardingData.name);
    }
    if (onboardingData.birthday) {
      setBirthDate(new Date(onboardingData.birthday));
    }
    if (onboardingData.birthTime) {
      // Parse time string like "10:30 AM" back to TimePickerValue
      const timeParts = onboardingData.birthTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeParts) {
        setTimeValue({
          hour: parseInt(timeParts[1], 10),
          minute: parseInt(timeParts[2], 10),
          ampm: timeParts[3].toUpperCase() as 'AM' | 'PM',
        });
      }
    }
    if (onboardingData.country) {
      // Find country by name
      const countries = Country.getAllCountries();
      const foundCountry = countries.find(c => c.name === onboardingData.country);
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        const cities = City.getCitiesOfCountry(foundCountry.isoCode) || [];
        setCountryHasCities(cities.length > 0);

        // Set city if available
        if (onboardingData.city && cities.length > 0) {
          const foundCity = cities.find(c => c.name === onboardingData.city);
          if (foundCity) {
            setSelectedCity(foundCity);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format time value for display
  const formatTimeDisplay = (time: TimePickerValue | null): string => {
    if (!time) return '--:-- --';
    const hourStr = String(time.hour).padStart(2, '0');
    const minuteStr = String(time.minute).padStart(2, '0');
    return `${hourStr}:${minuteStr} ${time.ampm}`;
  };

  // Format time value for storage
  const formatTimeForStorage = (time: TimePickerValue | null): string => {
    if (!time) return '';
    const hourStr = String(time.hour).padStart(2, '0');
    const minuteStr = String(time.minute).padStart(2, '0');
    return `${hourStr}:${minuteStr} ${time.ampm}`;
  };

  const handleSaveIdentity = () => {
    if (!name.trim()) return;

    // Track which fields changed
    const changedFields: string[] = [];
    if (name.trim() !== onboardingData.name) changedFields.push('name');
    if (birthDate && birthDate.toISOString() !== onboardingData.birthday) changedFields.push('birthday');
    if (timeValue && formatTimeForStorage(timeValue) !== onboardingData.birthTime) changedFields.push('birthTime');
    if (selectedCity?.name !== onboardingData.city) changedFields.push('city');
    if (selectedCountry?.name !== onboardingData.country) changedFields.push('country');
    
    trackProfileSave(changedFields);

    dispatch(
      saveOnboardingData({
        alignment: onboardingData.alignment,
        name: name.trim(),
        birthday: birthDate ? birthDate.toISOString() : onboardingData.birthday,
        birthTime: formatTimeForStorage(timeValue) || onboardingData.birthTime,
        city: selectedCity?.name || onboardingData.city,
        country: selectedCountry?.name || onboardingData.country || '',
        zodiacSign: calculatedZodiacSign || undefined, // Use calculated zodiac sign
      }),
    );
    setShowProfileCard(true);
    console.log('✅ Identity saved! Zodiac:', calculatedZodiacSign);
  };

  const handleEditProfile = () => {
    trackProfileEditTap();
    setShowProfileCard(false);
  };

  const handlePremiumPress = useCallback(() => {
    if (!isPremium) {
      trackProfileSubscriptionTap();
      navigation.navigate('Paywall', {source: 'profile_screen'});
    }
  }, [isPremium, navigation]);

  // Time picker handlers
  const handleOpenTimePicker = useCallback(() => {
    setShowTimePicker(true);
  }, []);

  const handleCloseTimePicker = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  const handleTimeConfirm = useCallback((value: TimePickerValue) => {
    setTimeValue(value);
    setShowTimePicker(false);
  }, []);

  // Country picker handlers
  const handleOpenCountryPicker = useCallback(() => {
    setShowCountryPicker(true);
  }, []);

  const handleCloseCountryPicker = useCallback(() => {
    setShowCountryPicker(false);
  }, []);

  const handleCountrySelect = useCallback((country: ICountry) => {
    setSelectedCountry(country);
    setSelectedCity(null); // Reset city when country changes
    const cities = City.getCitiesOfCountry(country.isoCode) || [];
    setCountryHasCities(cities.length > 0);
  }, []);

  // City picker handlers
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
  }, []);

  const renderForm = () => (
    <View style={styles.glassCard}>
      {/* <BlurView
        style={styles.absoluteBlur}
        blurType="dark"
        blurAmount={25}
        reducedTransparencyFallbackColor="transparent"
      /> */}
      <View style={styles.glassOverlay} />
      <View style={styles.formContent}>
        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>NAME</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Your Name"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Birth Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>BIRTH DATE</Text>
          <DatePicker
            value={birthDate}
            onChange={setBirthDate}
            placeholder="MM/DD/YYYY"
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        </View>

        {/* Time Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>TIME (OPT)</Text>
          <TouchableOpacity style={styles.inputBox} onPress={handleOpenTimePicker}>
            <Text
              style={[
                styles.inputText,
                !timeValue && styles.placeholderText,
              ]}>
              {formatTimeDisplay(timeValue)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Country Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>COUNTRY</Text>
          <TouchableOpacity style={styles.inputBox} onPress={handleOpenCountryPicker}>
            <Text
              style={[
                styles.inputText,
                !selectedCountry && styles.placeholderText,
              ]}>
              {selectedCountry?.name || 'Select Country'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* City Field - Only show when country is selected and has cities */}
        {selectedCountry && countryHasCities && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>CITY</Text>
            <TouchableOpacity style={styles.inputBox} onPress={handleOpenCityPicker}>
              <Text
                style={[
                  styles.inputText,
                  !selectedCity && styles.placeholderText,
                ]}>
                {selectedCity?.name || 'Select City'}
              </Text>
              <Text style={styles.inputIcon}>🏙️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
          onPress={handleSaveIdentity}
          disabled={!name.trim()}>
          <Text style={styles.saveButtonText}>Save Identity</Text>
          <Text style={styles.checkIcon}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileCard = () => {
    // Get first letter of name for avatar
    const displayName = name || onboardingData.name || '';
    const firstLetter = displayName.charAt(0).toUpperCase();
    
    return (
      <View style={styles.glassCard}>
        {/* <BlurView
          style={styles.absoluteBlur}
          blurType="dark"
          blurAmount={25}
          reducedTransparencyFallbackColor="transparent"
        /> */}
        <View style={styles.glassOverlay} />
        <View style={styles.profileContent}>
          {/* Profile Avatar */}
          <View style={styles.profileIcon}>
            <Text style={styles.avatarText}>{firstLetter || '?'}</Text>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{name || onboardingData.name}</Text>
              {/* Edit Button - in row with name */}
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleEditProfile}
                activeOpacity={0.7}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.zodiacBadge}>
                {calculatedZodiacSign?.toUpperCase() || 'UNKNOWN'}
              </Text>
              {(selectedCity?.name || onboardingData.city) && (
                <>
                  <View style={styles.dot} />
                  <Text style={styles.locationText}>
                    {selectedCity?.name || onboardingData.city}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Header */}
            <Animated.View style={[
              styles.header,
              {
                opacity: headerFadeAnim,
                transform: [{translateY: headerSlideAnim}],
              }
            ]}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>Your Celestial Identity</Text>
            </Animated.View>

            {/* Form or Profile Card */}
            <View>
              {showProfileCard ? renderProfileCard() : renderForm()}
            </View>

            {/* Premium Card */}
            <TouchableOpacity
              style={[styles.premiumCard, isPremium && styles.premiumCardActive]}
              onPress={handlePremiumPress}
              activeOpacity={isPremium ? 1 : 0.8}>
              <View style={styles.glassOverlay} />
              <View style={styles.premiumContent}>
                <View style={[styles.premiumIconContainer, isPremium && styles.premiumIconActive]}>
                  <StarIcon width={28} height={28} />
                </View>
                <View style={styles.premiumTextContainer}>
                  <Text style={[styles.premiumTitle, isPremium && styles.premiumTitleActive]}>
                    {isPremium ? 'Premium Active' : 'Unlock Premium'}
                  </Text>
                  <Text style={styles.premiumSubtitle}>
                    {isPremium 
                      ? 'Enjoy unlimited cosmic insights'
                      : 'Get unlimited readings & features'
                    }
                  </Text>
                </View>
                {!isPremium && (
                  <View style={styles.premiumButton}>
                    <Text style={styles.premiumButtonText}>Upgrade</Text>
                  </View>
                )}
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={handleCloseTimePicker}
        onConfirm={handleTimeConfirm}
        initialValue={timeValue || undefined}
      />

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={showCountryPicker}
        onClose={handleCloseCountryPicker}
        onSelect={handleCountrySelect}
      />

      {/* City Picker Modal */}
      {selectedCountry && (
        <CityPickerModal
          visible={showCityPicker}
          onClose={handleCloseCityPicker}
          onSelect={handleCitySelect}
          countryCode={selectedCountry.isoCode}
          countryName={selectedCountry.name}
        />
      )}
    </View>
  );
};

export default ProfileScreen;
