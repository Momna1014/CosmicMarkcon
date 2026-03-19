import React, {useCallback, useMemo} from 'react';
import {View, StatusBar, ImageBackground, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {selectOnboardingState} from '../../redux/slices/onboardingSlice';
import {styles} from './styles';
import {RootStackParamList, MainTabParamList} from '../../navigation/deepLinking';

// Home Components
import {
  HeaderSection,
  DailyEnergyCard,
  TransitsSection,
  FeatureCardsSection,
  CosmicGuidesSection,
  TRANSITS_DATA,
  COSMIC_GUIDES_DATA,
} from '../../components/home_components';

// Background Image
const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

// Daily horoscope message constant
const DAILY_MESSAGE = "The cosmos aligns in your favor. Trust your intuition.";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const onboardingData = useSelector(selectOnboardingState);

  // Memoized user name - prevents recalculation on every render
  const userName = useMemo(() => {
    return onboardingData?.name?.toUpperCase() || 'ALI';
  }, [onboardingData?.name]);

  // Memoized zodiac sign - prevents recalculation on every render
  const zodiacSign = useMemo(() => {
    return onboardingData?.zodiacSign?.toUpperCase() || 'ARIES';
  }, [onboardingData?.zodiacSign]);

  // Memoized callback handlers - prevents child component re-renders
  const handleReadHoroscope = useCallback(() => {
    navigation.navigate('Horoscope');
  }, [navigation]);

  const handleSynastryPress = useCallback(() => {
    // Navigation to Synastry screen
  }, []);

  const handleChiromancyPress = useCallback(() => {
    navigation.navigate('Chiromancy');
  }, [navigation]);

  const handleCosmicGuidePress = useCallback((guideId: string) => {
    navigation.navigate('CosmicGuideDetail', {guideId});
  }, [navigation]);

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
            showsVerticalScrollIndicator={false}>
            {/* Header Section (Welcome + Title) */}
            <HeaderSection userName={userName} />

            {/* Daily Energy Card */}
            <DailyEnergyCard
              zodiacSign={zodiacSign}
              dailyMessage={DAILY_MESSAGE}
              onReadHoroscope={handleReadHoroscope}
            />

            {/* Today's Transits Section */}
            <TransitsSection transits={TRANSITS_DATA} />

            {/* Feature Cards (Synastry & Chiromancy) */}
            <FeatureCardsSection
              onSynastryPress={handleSynastryPress}
              onChiromancyPress={handleChiromancyPress}
            />

            {/* Cosmic Guides Section */}
            <CosmicGuidesSection 
              guides={COSMIC_GUIDES_DATA} 
              onGuidePress={handleCosmicGuidePress}
            />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default HomeScreen;
