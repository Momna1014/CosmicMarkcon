import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Switch,
  AppState,
  Linking,
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

// Notifications
import {useNotifications} from '../../contexts/NotificationContext';

// Icons
import StarIcon from '../../assets/icons/home_icons/welcome_star.svg';
import NotificationBellIcon from '../../assets/icons/horoscope_icons/notification_bell.svg';
import AvatarDefaultIcon from '../../assets/icons/horoscope_icons/avatar_default.svg';
import GoRightIcon from '../../assets/icons/home_icons/right_arrow.svg';
import TermsIcon from '../../assets/icons/profile_icons/terms_conditions.svg';
import PrivacyIcon from '../../assets/icons/profile_icons/privacy_policy.svg';

const PRIVACY_URL = 'https://whoop.myappsstudio.com/privacy-policy.html';
const TERMS_URL = 'https://whoop.myappsstudio.com/terms-and-conditions.html';

// Chat Header (same as Chat screen)
import {ChatHeader} from '../Chat/components';
import {
  selectOnboardingState,
  saveOnboardingData,
} from '../../redux/slices/onboardingSlice';
import {clearCosmicData} from '../../redux/slices/cosmicDataSlice';
import {clearHoroscopeBundle} from '../../redux/slices/horoscopeSlice';
import {useAlert} from '../../contexts/AlertContext';
import {AppDispatch} from '../../redux/store';
import {DatePicker} from '../../components/DatePicker';
import {
  CountryPickerModal,
  CityPickerModal,
} from '../../components/pickers';
import {getZodiacSign} from '../../components/mock/zodiacMockData';
import {styles} from './styles';

type Props = {
  navigation: any;
};

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingData = useSelector(selectOnboardingState);
  const {isPremium} = useApp();
  const {showAlert} = useAlert();
  const {
    notificationsEnabled,
    permissionStatus,
    openNotificationSettings,
    checkPermissionStatus,
  } = useNotifications();

  // Form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [countryHasCities, setCountryHasCities] = useState(false);
  // Show profile card initially if user has saved their birthday
  const [showProfileCard, setShowProfileCard] = useState(!!onboardingData.birthday);

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

  // Re-check notification permission when returning from Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkPermissionStatus();
      }
    });
    return () => subscription.remove();
  }, [checkPermissionStatus]);

  // Picker visibility
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

  const handleSaveIdentity = () => {
    // Only require birthDate to save
    if (!birthDate) return;

    // Track which fields changed
    const changedFields: string[] = [];
    if (name.trim() && name.trim() !== onboardingData.name) changedFields.push('name');
    if (birthDate && birthDate.toISOString() !== onboardingData.birthday) changedFields.push('birthday');
    if (selectedCity?.name !== onboardingData.city) changedFields.push('city');
    if (selectedCountry?.name !== onboardingData.country) changedFields.push('country');

    const signChanged = calculatedZodiacSign !== onboardingData.zodiacSign;
    if (signChanged) changedFields.push('zodiacSign');

    trackProfileSave(changedFields);

    dispatch(
      saveOnboardingData({
        name: name.trim(), // pass empty string to allow clearing saved name
        birthday: birthDate.toISOString(),
        city: selectedCity?.name || undefined,
        country: selectedCountry?.name || undefined,
        zodiacSign: calculatedZodiacSign || undefined, // Use calculated zodiac sign
      }),
    );

    // Clear cached data so Home & Horoscope refetch with updated profile
    if (changedFields.length > 0) {
      dispatch(clearCosmicData());
      dispatch(clearHoroscopeBundle());
    }

    setShowProfileCard(true);

    // Show appropriate alert
    if (signChanged) {
      showAlert({
        type: 'info',
        title: 'Zodiac Sign Changed ✨',
        message: `Your sign updated to ${calculatedZodiacSign}. Your cosmiq readings will refresh with your new celestial identity.`,
        buttons: [{text: 'OK', style: 'default'}],
        hideIcon: true,
      });
    } else if (changedFields.length > 0) {
      showAlert({
        type: 'success',
        title: 'Identity Saved ✅',
        message: 'Your profile has been updated. Cosmiq readings will refresh with your new details.',
        buttons: [{text: 'OK', style: 'default'}],
        hideIcon: true,
      });
    }

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
          <Text style={styles.fieldLabel}>NAME (optional)</Text>
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
          <Text style={styles.fieldLabel}>BIRTH DATE *</Text>
          <DatePicker
            value={birthDate}
            onChange={setBirthDate}
            placeholder="MM/DD/YYYY"
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        </View>

        {/* Country Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>COUNTRY (optional)</Text>
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
            <Text style={styles.fieldLabel}>CITY (optional)</Text>
            <TouchableOpacity style={styles.inputBox} onPress={handleOpenCityPicker}>
              <Text
                style={[
                  styles.inputText,
                  !selectedCity && styles.placeholderText,
                ]}>
                {selectedCity?.name || 'Select City'}
              </Text>
              {/* <Text style={styles.inputIcon}>🏙️</Text> */}
            </TouchableOpacity>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, !birthDate && styles.saveButtonDisabled]}
          onPress={handleSaveIdentity}
          disabled={!birthDate}>
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
    const hasName = !!(name || onboardingData.name);
    
    // Format birth date for display
    const formatBirthDate = () => {
      const date = birthDate || (onboardingData.birthday ? new Date(onboardingData.birthday) : null);
      if (!date) return '';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
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
            {firstLetter
              ? <Text style={styles.avatarText}>{firstLetter}</Text>
              : <AvatarDefaultIcon width={28} height={28} />}
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            {hasName ? (
              // Show name-based layout
              <>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
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
              </>
            ) : (
              // Show date/sign layout when no name
              <>
                <View style={styles.nameRow}>
                  <View>
                    <Text style={styles.profileName}>{formatBirthDate()}</Text>
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
                  {/* Edit Button */}
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={handleEditProfile}
                    activeOpacity={0.7}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.backgroundFallback}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <ChatHeader title="Profile" subtitle="Your Celestial Identity" />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* SECTION: Your Profile */}
            <Text style={styles.sectionHeading}>Your Profile</Text>

            {/* Form or Profile Card */}
            <View>
              {showProfileCard ? renderProfileCard() : renderForm()}
            </View>

            {/* SECTION: Notifications */}
            <Text style={styles.sectionHeading}>Notifications</Text>

            {/* Notification Toggle Card */}
            <View style={styles.notificationCard}>
              <View style={styles.glassOverlay} />
              <View style={styles.notificationContent}>
                <View style={styles.notificationIconContainer}>
                  <NotificationBellIcon width={24} height={24} />
                </View>
                <View style={styles.notificationTextContainer}>
                  <Text style={styles.notificationTitle}>Notifications</Text>
                  <Text style={styles.notificationSubtitle}>
                    {notificationsEnabled
                      ? 'Daily horoscope at 8:00 PM'
                      : 'Enable for cosmiq insights'}
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={openNotificationSettings}
                  trackColor={{false: 'rgba(255,255,255,0.15)', true: 'rgba(255, 255, 255, 0.4)'}}
                  thumbColor={notificationsEnabled ? '#FFFFFF' : '#888'}
                />
              </View>
            </View>

            {/* SECTION: Premium Access */}
            <Text style={styles.sectionHeading}>Premium Access</Text>

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
                      ? 'Enjoy unlimited cosmiq insights'
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
            {/* SECTION: Legal */}
            <Text style={styles.sectionHeading}>Legal</Text>

            {/* Legal Card */}
            <View style={styles.legalCard}>
              <View style={styles.glassOverlay} />

              {/* Terms & Conditions */}
              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => Linking.openURL(TERMS_URL)}
                activeOpacity={0.7}>
                <View style={styles.legalRowIconContainer}>
                  <TermsIcon width={22} height={22} />
                </View>
                <View style={styles.legalRowTextContainer}>
                  <Text style={styles.legalRowTitle}>Terms & Conditions</Text>
                  <Text style={styles.legalRowSubtitle}>Review our terms of use</Text>
                </View>
                <GoRightIcon
                  width={16}
                  height={16}
                  style={styles.legalRowArrow}
                />
              </TouchableOpacity>

              <View style={styles.legalDivider} />

              {/* Privacy Policy */}
              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => Linking.openURL(PRIVACY_URL)}
                activeOpacity={0.7}>
                <View style={styles.legalRowIconContainer}>
                  <PrivacyIcon width={22} height={22} />
                </View>
                <View style={styles.legalRowTextContainer}>
                  <Text style={styles.legalRowTitle}>Privacy Policy</Text>
                  <Text style={styles.legalRowSubtitle}>How we handle your data</Text>
                </View>
                <GoRightIcon
                  width={16}
                  height={16}
                  style={styles.legalRowArrow}
                />
              </TouchableOpacity>
            </View>

          </ScrollView>
        </SafeAreaView>

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
