import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {selectOnboardingState} from '../../redux/slices/onboardingSlice';
import {RootStackParamList} from '../../navigation/deepLinking';
import StarfieldAnimation from '../../components/home_components/StarfieldAnimation';
import {styles} from './styles';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  trackHoroscopeChatView,
  trackHoroscopeChatStartTap,
} from '../../utils/mainScreenAnalytics';

// Icons
import OracleStarIcon from '../../assets/icons/horoscope_icons/ask_oracle_star.svg';

const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');
const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Zodiac symbols
const getZodiacSymbol = (sign: string): string => {
  const symbols: Record<string, string> = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
  };
  return symbols[sign?.toLowerCase()] || '✦';
};

// Floating orb component
const FloatingOrb: React.FC<{
  size: number;
  color: string;
  startX: number;
  startY: number;
  delay: number;
}> = ({size, color, startX, startY, delay}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateOrb = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -30,
              duration: 3000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 15 * (Math.random() > 0.5 ? 1 : -1),
              duration: 4000 + Math.random() * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 3000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 4000 + Math.random() * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };
    animateOrb();
  }, [delay, opacity, translateX, translateY]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{translateY}, {translateX}],
      }}
    />
  );
};

const HoroscopeChatScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onboardingData = useSelector(selectOnboardingState);
  const zodiacSign = onboardingData?.zodiacSign || '';
  const zodiacSymbol = getZodiacSymbol(zodiacSign);
  const userName = onboardingData?.name || 'Seeker';

  // Analytics
  useScreenView('HoroscopeChat', {zodiac_sign: zodiacSign});

  useEffect(() => {
    trackHoroscopeChatView(zodiacSign);
    firebaseService.logScreenView('HoroscopeChat', 'HoroscopeChatScreen');
  }, [zodiacSign]);

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(40)).current;
  const orbContainerFade = useRef(new Animated.Value(0)).current;
  const orbContainerScale = useRef(new Animated.Value(0.8)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(headerFade, {toValue: 1, duration: 600, useNativeDriver: true}),
        Animated.spring(headerSlide, {toValue: 0, friction: 8, tension: 40, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(orbContainerFade, {toValue: 1, duration: 800, useNativeDriver: true}),
        Animated.spring(orbContainerScale, {toValue: 1, friction: 6, tension: 30, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {toValue: 1, duration: 600, useNativeDriver: true}),
        Animated.spring(cardSlide, {toValue: 0, friction: 8, tension: 40, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(buttonFade, {toValue: 1, duration: 500, useNativeDriver: true}),
        Animated.spring(buttonScale, {toValue: 1, friction: 5, tension: 40, useNativeDriver: true}),
      ]),
    ]).start();

    // Continuous pulse on the main orb
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [headerFade, headerSlide, orbContainerFade, orbContainerScale, cardFade, cardSlide, buttonFade, buttonScale, pulseAnim]);

  const handleStartChat = () => {
    trackHoroscopeChatStartTap(zodiacSign);
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Chat');
  };

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
        <StarfieldAnimation />
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {opacity: headerFade, transform: [{translateY: headerSlide}]},
            ]}>
            <Text style={styles.title}>Cosmic Oracle</Text>
            <Text style={styles.subtitle}>Your personal AI astrologer awaits</Text>
          </Animated.View>

          {/* Central Orb Area */}
          <View style={styles.centerArea}>
            <Animated.View
              style={[
                styles.orbContainer,
                {
                  opacity: orbContainerFade,
                  transform: [{scale: orbContainerScale}],
                },
              ]}>
              {/* Floating background orbs */}
              <FloatingOrb size={12} color="rgba(221, 197, 96, 0.4)" startX={30} startY={20} delay={0} />
              <FloatingOrb size={8} color="rgba(194, 209, 243, 0.5)" startX={SCREEN_WIDTH * 0.6} startY={40} delay={500} />
              <FloatingOrb size={10} color="rgba(156, 136, 255, 0.4)" startX={50} startY={140} delay={1000} />
              <FloatingOrb size={6} color="rgba(255, 215, 0, 0.5)" startX={SCREEN_WIDTH * 0.7} startY={120} delay={700} />
              <FloatingOrb size={14} color="rgba(147, 197, 253, 0.3)" startX={SCREEN_WIDTH * 0.4} startY={10} delay={300} />

              {/* Main glowing orb */}
              <Animated.View style={[styles.mainOrb, {transform: [{scale: pulseAnim}]}]}>
                <View style={styles.orbGradient}>
                  <View style={styles.orbInner}>
                    <OracleStarIcon width={50} height={50} />
                    {/* <Text style={styles.zodiacSymbol}>{zodiacSymbol}</Text> */}
                  </View>
                </View>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Info Card */}
          {/* <Animated.View
            style={[
              styles.infoCard,
              {opacity: cardFade, transform: [{translateY: cardSlide}]},
            ]}>
            <View style={styles.cardGlassOverlay} />
            <Text style={styles.cardGreeting}>Hello, {userName}</Text>
            <Text style={styles.cardDescription}>
              Ask anything about your horoscope, zodiac compatibility, daily predictions, or cosmic guidance. The stars are ready to speak.
            </Text>

            <View style={styles.featurePills}>
              {['Daily Reading', 'Compatibility', 'Career', 'Love'].map((label, i) => (
                <View key={i} style={styles.pill}>
                  <Text style={styles.pillText}>{label}</Text>
                </View>
              ))}
            </View>
          </Animated.View> */}

          <Animated.View
            style={[
              styles.buttonContainer,
              {opacity: buttonFade, transform: [{scale: buttonScale}]},
            ]}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartChat}
              activeOpacity={0.85}>
              <View style={styles.buttonGlow} />
              <View style={styles.buttonInner}>
                <OracleStarIcon width={20} height={20} />
                <Text style={styles.buttonText}>Start Chat</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default HoroscopeChatScreen;
