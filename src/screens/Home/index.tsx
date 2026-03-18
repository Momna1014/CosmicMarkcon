import React, {useCallback, useMemo, memo} from 'react';
import {
  View,
  Text,
  StatusBar,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {BlurView} from '@react-native-community/blur';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {selectOnboardingState} from '../../redux/slices/onboardingSlice';
import {styles, TRANSIT_COLORS, GUIDE_ICON_COLORS} from './styles';

// Background Image
const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

// Home Icons (SVG)
import WelcomeStarIcon from '../../assets/icons/home_icons/welcome_star.svg';
import DailyMoonIcon from '../../assets/icons/home_icons/daily_moon.svg';
import ReadHoroscopeIcon from '../../assets/icons/home_icons/right_arroq_with_background.svg';
import RightArrowIcon from '../../assets/icons/home_icons/right_arrow.svg';

// Transit Icons (SVG)
import MercuryIcon from '../../assets/icons/home_icons/mercury.svg';
import VenusIcon from '../../assets/icons/home_icons/venus.svg';
import MarsIcon from '../../assets/icons/home_icons/mars.svg';
import JupiterIcon from '../../assets/icons/home_icons/jupiter.svg';
import SaturnIcon from '../../assets/icons/home_icons/saturn.svg';
import UranusIcon from '../../assets/icons/home_icons/uranus.svg';
import NeptuneIcon from '../../assets/icons/home_icons/neptune.svg';
import PlutoIcon from '../../assets/icons/home_icons/pluto.svg';

// Feature Card Icons (SVG)
import SynastryHeartIcon from '../../assets/icons/home_icons/synastry_heart.svg';
import ChiromancyHandIcon from '../../assets/icons/home_icons/chiromancy_hand.svg';

// Feature Card Backgrounds
const SynastryBackground = require('../../assets/icons/home_icons/synastry_background.png');
const ChiromancyBackground = require('../../assets/icons/home_icons/chiromancy_background.png');
const DailyEnergyBackground = require('../../assets/icons/home_icons/daily_energy_background.png');

// Cosmic Guide Icons (SVG)
import UnderstandingTransitIcon from '../../assets/icons/home_icons/understanding_transit.svg';
import MoonPhases101Icon from '../../assets/icons/home_icons/Moon_pjase_101.svg';
import RetrogradeSurvivalIcon from '../../assets/icons/home_icons/restograde_survival.svg';
import HumanDesignIntroIcon from '../../assets/icons/home_icons/human_design_intro.svg';
import { moderateScale } from '../../theme';

// Transit data
const TRANSITS_DATA = [
  {id: 'mercury', name: 'Mercury', subtext: 'In Sagittarius', Icon: MercuryIcon, color: TRANSIT_COLORS.mercury},
  {id: 'venus', name: 'Venus', subtext: 'In Capricorn', Icon: VenusIcon, color: TRANSIT_COLORS.venus},
  {id: 'mars', name: 'Mars', subtext: 'In Pisces', Icon: MarsIcon, color: TRANSIT_COLORS.mars},
  {id: 'jupiter', name: 'Jupiter', subtext: 'In Cancer', Icon: JupiterIcon, color: TRANSIT_COLORS.jupiter},
  {id: 'saturn', name: 'Saturn', subtext: 'In Aquarius', Icon: SaturnIcon, color: TRANSIT_COLORS.saturn},
  {id: 'uranus', name: 'Uranus', subtext: 'In Taurus', Icon: UranusIcon, color: TRANSIT_COLORS.uranus},
  {id: 'neptune', name: 'Neptune', subtext: 'In Pisces', Icon: NeptuneIcon, color: TRANSIT_COLORS.neptune},
  {id: 'pluto', name: 'Pluto', subtext: 'In Aquarius', Icon: PlutoIcon, color: TRANSIT_COLORS.pluto},
];

// Cosmic guides data
const COSMIC_GUIDES_DATA = [
  {id: 'understanding_transit', title: 'Understanding Transit', Icon: UnderstandingTransitIcon, bgColor: GUIDE_ICON_COLORS.understanding_transit},
  {id: 'moon_phases', title: 'Moon Phases 101', Icon: MoonPhases101Icon, bgColor: GUIDE_ICON_COLORS.moon_phases},
  {id: 'retrograde', title: 'Retrograde Survival', Icon: RetrogradeSurvivalIcon, bgColor: GUIDE_ICON_COLORS.retrograde},
  {id: 'human_design', title: 'Human Design Intro', Icon: HumanDesignIntroIcon, bgColor: GUIDE_ICON_COLORS.human_design},
];

// Animated Touchable
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type Props = {
  navigation: any;
};

// Transit Item Component
const TransitItem = memo(({item, index}: {item: typeof TRANSITS_DATA[0]; index: number}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, {damping: 15});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15});
  }, [scale]);

  return (
    <Animated.View
      entering={FadeInRight.delay(100 + index * 80).springify()}
      style={styles.transitItem}>
      <AnimatedTouchable
        style={[styles.transitIconContainer, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}>
        <item.Icon width={moderateScale(48)} height={moderateScale(48)} />
      </AnimatedTouchable>
      <Text style={styles.transitName}>{item.name}</Text>
      <Text style={styles.transitSubtext}>{item.subtext}</Text>
    </Animated.View>
  );
});

// Cosmic Guide Card Component
const CosmicGuideCard = memo(({item, index}: {item: typeof COSMIC_GUIDES_DATA[0]; index: number}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, {damping: 15});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15});
  }, [scale]);

  return (
    <Animated.View entering={FadeInDown.delay(400 + index * 100).springify()}>
      <AnimatedTouchable
        style={[styles.guideCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}>
        <View style={styles.guideCardContent}>
          <View style={[styles.guideIconContainer]}>
            <item.Icon width={moderateScale(40)} height={moderateScale(40)} />
          </View>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>{item.title}</Text>
          </View>
          <RightArrowIcon width={moderateScale(20)} height={moderateScale(20)} />
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
});

// Feature Card Component
const FeatureCard = memo(({
  title,
  subtitle,
  Icon,
  backgroundImage,
  index,
  onPress,
}: {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{width: number; height: number}>;
  backgroundImage: any;
  index: number;
  onPress?: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, {damping: 15});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15});
  }, [scale]);

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 100).springify()}
      style={styles.featureCard}>
      <AnimatedTouchable
        style={[styles.flexOne, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}>
        <ImageBackground
          source={backgroundImage}
          style={styles.featureCardBackground}
          resizeMode="cover"
        />
        <View style={styles.featureCardContent}>
          <Icon width={moderateScale(40)} height={moderateScale(40)} />
          <Text style={styles.featureCardTitle}>{title}</Text>
          <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
});

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const onboardingData = useSelector(selectOnboardingState);

  // Get user's name, default to 'ALI' if not set
  const userName = useMemo(() => {
    return onboardingData?.name?.toUpperCase() || 'ALI';
  }, [onboardingData?.name]);

  // Get zodiac sign
  const zodiacSign = useMemo(() => {
    return onboardingData?.zodiacSign?.toUpperCase() || 'ARIES';
  }, [onboardingData?.zodiacSign]);

  // Daily horoscope message
  const dailyMessage = "The cosmos aligns in your favor. Trust your intuition.";

  // Handle read horoscope press
  const handleReadHoroscope = useCallback(() => {
    navigation?.navigate('Horoscope');
  }, [navigation]);

  // Handle feature card presses
  const handleSynastryPress = useCallback(() => {
    // Navigation to Synastry screen
  }, []);

  const handleChiromancyPress = useCallback(() => {
    navigation?.navigate('Chiromancy');
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
            
            {/* Welcome Section */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.welcomeSection}>
              <WelcomeStarIcon width={moderateScale(24)} height={moderateScale(24)} style={styles.welcomeIcon} />
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeLabel}>WELCOME,</Text>
                <Text style={styles.welcomeName}>{userName}</Text>
              </View>
            </Animated.View>

            {/* Title Section */}
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={styles.titleSection}>
              <Text style={styles.mainTitle}>ASTRABOND</Text>
            </Animated.View>

            {/* Daily Energy Card */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.dailyEnergyCard}>
              <ImageBackground
                source={DailyEnergyBackground}
                style={styles.dailyEnergyBackground}
                imageStyle={styles.dailyEnergyImageStyle}
                resizeMode="cover">
                <View style={styles.dailyEnergyContent}>
                  {/* Header */}
                  <View style={styles.dailyEnergyHeader}>
                    <View style={styles.dailyEnergyLeft}>
                      <DailyMoonIcon width={moderateScale(24)} height={moderateScale(24)} style={styles.dailyMoonIcon} />
                      <Text style={styles.dailyEnergyLabel}>DAILY ENERGY</Text>
                    </View>
                    <View style={styles.zodiacBadge}>
                      <Text style={styles.zodiacText}>{zodiacSign}</Text>
                    </View>
                  </View>

                  {/* Message */}
                  <Text style={styles.dailyEnergyMessage}>{dailyMessage}</Text>

                  {/* Read Horoscope Button */}
                  <TouchableOpacity
                    style={styles.readHoroscopeButton}
                    onPress={handleReadHoroscope}
                    activeOpacity={0.7}>
                    <Text style={styles.readHoroscopeText}>READ HOROSCOPE</Text>
                    <ReadHoroscopeIcon width={moderateScale(40)} height={moderateScale(40)} />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </Animated.View>

            {/* Today's Transits Section */}
            <View style={styles.sectionContainer}>
              <Animated.Text
                entering={FadeInDown.delay(250).springify()}
                style={styles.sectionTitle}>
                Todays Transits
              </Animated.Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.transitsContainer}
                style={styles.transitsScrollView}>
                {TRANSITS_DATA.map((item, index) => (
                  <TransitItem key={item.id} item={item} index={index} />
                ))}
              </ScrollView>
            </View>

            {/* Feature Cards (Synastry & Chiromancy) */}
            <View style={styles.featureCardsContainer}>
              <FeatureCard
                title="Synastry"
                subtitle="COMPATIBILITY"
                Icon={SynastryHeartIcon}
                backgroundImage={SynastryBackground}
                index={0}
                onPress={handleSynastryPress}
              />
              <FeatureCard
                title="Chiromancy"
                subtitle="PALM READING"
                Icon={ChiromancyHandIcon}
                backgroundImage={ChiromancyBackground}
                index={1}
                onPress={handleChiromancyPress}
              />
            </View>

            {/* Cosmic Guides Section */}
            <View style={styles.sectionContainer}>
              <Animated.Text
                entering={FadeInDown.delay(350).springify()}
                style={styles.sectionTitle}>
                Cosmic Guides
              </Animated.Text>
              <View style={styles.cosmicGuidesContainer}>
                {COSMIC_GUIDES_DATA.map((item, index) => (
                  <CosmicGuideCard key={item.id} item={item} index={index} />
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default HomeScreen;
