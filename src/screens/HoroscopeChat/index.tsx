import React, {useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/deepLinking';
import {styles} from './styles';
import {trackChatTabView} from '../../utils/mainScreenAnalytics';

// Icons
import CosmicOracleChatIcon from '../../assets/icons/chat_icons/cosmic_oracle_chat.svg';
import { moderateScale } from '../../theme';

const StarsBackground = require('../../assets/icons/chat_icons/stars_bckground.png');
const StarIcon = require('../../assets/icons/chat_icons/star.png');

const HoroscopeChatScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Analytics - Bottom tab view
  useFocusEffect(
    useCallback(() => {
      trackChatTabView();
    }, [])
  );

  // Animations
  const badgeFade = useRef(new Animated.Value(0)).current;
  const iconFade = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(badgeFade, {toValue: 1, duration: 500, useNativeDriver: true}),
      Animated.parallel([
        Animated.timing(iconFade, {toValue: 1, duration: 600, useNativeDriver: true}),
        Animated.spring(iconScale, {toValue: 1, friction: 6, tension: 30, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(textFade, {toValue: 1, duration: 500, useNativeDriver: true}),
        Animated.spring(textSlide, {toValue: 0, friction: 8, tension: 40, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(buttonFade, {toValue: 1, duration: 500, useNativeDriver: true}),
        Animated.spring(buttonSlide, {toValue: 0, friction: 8, tension: 40, useNativeDriver: true}),
      ]),
    ]).start();
  }, [badgeFade, iconFade, iconScale, textFade, textSlide, buttonFade, buttonSlide]);

  const handleStartChat = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Chat');
  };

  return (
    <View style={styles.backgroundFallback}>
      {/* Stars background image */}
      <Image
        source={StarsBackground}
        style={styles.starsBackground}
        resizeMode="cover"
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Guided by the stars badge */}
        <Animated.View style={[styles.badgeContainer, {opacity: badgeFade}]}>
          <View style={styles.badge}>
            <Image source={StarIcon} style={styles.badgeStarIcon} />
            <Text style={styles.badgeText}>GUIDED BY THE STARS</Text>
          </View>
        </Animated.View>

        {/* Center content */}
        <View style={styles.centerContent}>
          {/* Cosmiq Oracle Icon */}
          <Animated.View style={[{opacity: iconFade, transform: [{scale: iconScale}]}, styles.iconContainer]}>
            <CosmicOracleChatIcon width={moderateScale(190)} height={moderateScale(190)} />
          </Animated.View>

          {/* Title and subtitle */}
          <Animated.View style={[{opacity: textFade, transform: [{translateY: textSlide}]}]}>
            <Text style={styles.title}>Cosmiq Oracle</Text>
            <Text style={styles.subtitle}>Your personal AI astrologer awaits</Text>
          </Animated.View>
        </View>

        {/* Start Chat Button */}
        <Animated.View style={[styles.buttonContainer, {opacity: buttonFade, transform: [{translateY: buttonSlide}]}]}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartChat}
            activeOpacity={0.85}>
            <View style={styles.buttonInner}>
              <Image source={StarIcon} style={styles.buttonStarIcon} />
              <Text style={styles.buttonText}>Start Chat</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default HoroscopeChatScreen;
