import React, {memo, useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Ellipse,
} from 'react-native-svg';
import {
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

// ─── Custom SVG Horoscope Icons ───

// Crescent Moon — default/idle state
const CrescentMoonIcon: React.FC<{size: number}> = memo(({size}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <LinearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#C2D1F3" stopOpacity={0.9} />
        <Stop offset="100%" stopColor="#7B93C7" stopOpacity={0.7} />
      </LinearGradient>
    </Defs>
    <Path
      d="M38 8C24.745 8 14 18.745 14 32s10.745 24 24 24c5.32 0 10.24-1.73 14.22-4.66A28 28 0 0132 56C16.536 56 4 43.464 4 28S16.536 0 32 0a28 28 0 016 .65A23.88 23.88 0 0038 8z"
      fill="url(#moonGrad)"
    />
    {/* Tiny stars */}
    <Circle cx={48} cy={12} r={1.5} fill="#C2D1F3" opacity={0.6} />
    <Circle cx={54} cy={22} r={1} fill="#C2D1F3" opacity={0.4} />
    <Circle cx={44} cy={6} r={1} fill="#C2D1F3" opacity={0.5} />
  </Svg>
));
CrescentMoonIcon.displayName = 'CrescentMoonIcon';

// Ringed Planet (Saturn) — 1 star (cold, distant)
const RingedPlanetIcon: React.FC<{size: number}> = memo(({size}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <LinearGradient id="saturnBody" x1="20%" y1="0%" x2="80%" y2="100%">
        <Stop offset="0%" stopColor="#8B9CC7" />
        <Stop offset="100%" stopColor="#4A5C80" />
      </LinearGradient>
      <LinearGradient id="saturnRing" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#6B7FAD" stopOpacity={0.1} />
        <Stop offset="30%" stopColor="#8B9CC7" stopOpacity={0.5} />
        <Stop offset="70%" stopColor="#8B9CC7" stopOpacity={0.5} />
        <Stop offset="100%" stopColor="#6B7FAD" stopOpacity={0.1} />
      </LinearGradient>
    </Defs>
    {/* Ring behind planet */}
    <Ellipse cx={32} cy={34} rx={28} ry={8} stroke="url(#saturnRing)" strokeWidth={2.5} fill="none" />
    {/* Planet body */}
    <Circle cx={32} cy={32} r={13} fill="url(#saturnBody)" />
    {/* Surface band */}
    <Path d="M19.5 30c3 -1 8 -1.5 12.5 -1.5s9.5 0.5 12.5 1.5" stroke="#6B7FAD" strokeWidth={1} opacity={0.4} fill="none" />
    <Path d="M20 34c3 1 8 1.5 12 1.5s9-0.5 12-1.5" stroke="#6B7FAD" strokeWidth={0.8} opacity={0.3} fill="none" />
    {/* Highlight */}
    <Circle cx={27} cy={27} r={4} fill="#A8B8DB" opacity={0.2} />
    {/* Ring in front of planet */}
    <Path d="M4 34 Q18 42 32 42 Q46 42 60 34" stroke="url(#saturnRing)" strokeWidth={2.5} fill="none" />
    {/* Tiny stars */}
    <Circle cx={8} cy={12} r={1} fill="#8B9CC7" opacity={0.3} />
    <Circle cx={56} cy={14} r={1.2} fill="#8B9CC7" opacity={0.25} />
  </Svg>
));
RingedPlanetIcon.displayName = 'RingedPlanetIcon';

// Waning Moon — 2 stars (not quite there)
const WaningMoonIcon: React.FC<{size: number}> = memo(({size}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <LinearGradient id="waneLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#B0BFD8" />
        <Stop offset="100%" stopColor="#8B9CC7" />
      </LinearGradient>
      <LinearGradient id="waneDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#3A4A6B" />
        <Stop offset="100%" stopColor="#2A3A55" />
      </LinearGradient>
    </Defs>
    {/* Full moon circle */}
    <Circle cx={32} cy={32} r={22} fill="url(#waneDark)" />
    {/* Lit half — left side */}
    <Path
      d="M32 10 A22 22 0 0 0 32 54 A12 22 0 0 1 32 10Z"
      fill="url(#waneLight)"
    />
    {/* Crater details on lit side */}
    <Circle cx={24} cy={24} r={3.5} fill="#8B9CC7" opacity={0.25} />
    <Circle cx={28} cy={40} r={2.5} fill="#8B9CC7" opacity={0.2} />
    <Circle cx={20} cy={34} r={2} fill="#8B9CC7" opacity={0.15} />
    {/* Subtle terminator glow */}
    <Path
      d="M32 10 A12 22 0 0 0 32 54"
      stroke="#C2D1F3"
      strokeWidth={0.8}
      opacity={0.15}
      fill="none"
    />
    {/* Tiny stars */}
    <Circle cx={56} cy={16} r={1.2} fill="#A8B8DB" opacity={0.35} />
    <Circle cx={52} cy={48} r={1} fill="#8B9CC7" opacity={0.25} />
    <Circle cx={6} cy={20} r={1} fill="#A8B8DB" opacity={0.3} />
  </Svg>
));
WaningMoonIcon.displayName = 'WaningMoonIcon';

// Rising Planet with orbit — 3 stars
const OrbitPlanetIcon: React.FC<{size: number}> = memo(({size}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <LinearGradient id="planetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#C2D1F3" />
        <Stop offset="100%" stopColor="#8B9CC7" />
      </LinearGradient>
    </Defs>
    {/* Orbit ellipse */}
    <Ellipse cx={32} cy={32} rx={28} ry={12} stroke="#C2D1F3" strokeWidth={1} opacity={0.3} />
    {/* Planet */}
    <Circle cx={32} cy={32} r={12} fill="url(#planetGrad)" />
    {/* Planet shading */}
    <Path
      d="M36 22c5.5 2.5 8 8 6 14s-8 9-13.5 6.5"
      stroke="#FFFFFF"
      strokeWidth={0.8}
      opacity={0.2}
      fill="none"
    />
    {/* Orbiting moon */}
    <Circle cx={56} cy={30} r={3} fill="#C2D1F3" opacity={0.7} />
    {/* Stars */}
    <Circle cx={10} cy={14} r={1.5} fill="#C2D1F3" opacity={0.4} />
    <Circle cx={54} cy={50} r={1} fill="#C2D1F3" opacity={0.3} />
  </Svg>
));
OrbitPlanetIcon.displayName = 'OrbitPlanetIcon';

// Shooting Star — 4 stars (great, almost perfect)
const ShootingStarIcon: React.FC<{size: number}> = memo(({size}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <LinearGradient id="shootTail" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#EEDF9B" stopOpacity={0} />
        <Stop offset="100%" stopColor="#EEDF9B" stopOpacity={0.8} />
      </LinearGradient>
      <LinearGradient id="shootCore" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="100%" stopColor="#EEDF9B" />
      </LinearGradient>
    </Defs>
    {/* Main tail */}
    <Path
      d="M4 52 Q20 40 36 28 Q42 24 44 22"
      stroke="url(#shootTail)"
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
    {/* Secondary tail — thinner */}
    <Path
      d="M10 48 Q24 38 38 26 Q42 23 44 22"
      stroke="#EEDF9B"
      strokeWidth={1}
      strokeLinecap="round"
      fill="none"
      opacity={0.3}
    />
    {/* Star head — 4-pointed sparkle */}
    <Path
      d="M46 20L47.5 14L49 20L55 21.5L49 23L47.5 29L46 23L40 21.5Z"
      fill="url(#shootCore)"
    />
    {/* Inner bright core */}
    <Circle cx={47.5} cy={21.5} r={3} fill="#FFFFFF" opacity={0.9} />
    {/* Glow around star */}
    <Circle cx={47.5} cy={21.5} r={7} fill="#EEDF9B" opacity={0.1} />
    {/* Trail sparkle particles */}
    <Circle cx={20} cy={42} r={1.5} fill="#EEDF9B" opacity={0.4} />
    <Circle cx={30} cy={34} r={1.2} fill="#EEDF9B" opacity={0.5} />
    <Circle cx={12} cy={46} r={1} fill="#DDC560" opacity={0.3} />
    <Circle cx={38} cy={28} r={1} fill="#EEDF9B" opacity={0.45} />
    {/* Background stars */}
    <Circle cx={58} cy={42} r={1} fill="#EEDF9B" opacity={0.2} />
    <Circle cx={14} cy={12} r={1.2} fill="#EEDF9B" opacity={0.25} />
    <Circle cx={54} cy={52} r={0.8} fill="#DDC560" opacity={0.2} />
  </Svg>
));
ShootingStarIcon.displayName = 'ShootingStarIcon';

// Supernova burst — 5 stars (perfect)
const SupernovaIcon: React.FC<{size: number}> = memo(({size}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <LinearGradient id="novaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="50%" stopColor="#EEDF9B" />
        <Stop offset="100%" stopColor="#DDC560" />
      </LinearGradient>
      <LinearGradient id="novaRay" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#EEDF9B" stopOpacity={0.7} />
        <Stop offset="100%" stopColor="#EEDF9B" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    {/* Outer rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <Line
        key={i}
        x1={32}
        y1={32}
        x2={32 + 28 * Math.cos((angle * Math.PI) / 180)}
        y2={32 + 28 * Math.sin((angle * Math.PI) / 180)}
        stroke="#EEDF9B"
        strokeWidth={i % 2 === 0 ? 1.5 : 0.8}
        opacity={i % 2 === 0 ? 0.5 : 0.25}
      />
    ))}
    {/* Inner glow ring */}
    <Circle cx={32} cy={32} r={14} stroke="#EEDF9B" strokeWidth={1} opacity={0.3} />
    {/* Core */}
    <Circle cx={32} cy={32} r={9} fill="url(#novaGrad)" />
    {/* Center sparkle */}
    <Path d="M32 24L33.5 30.5L40 32L33.5 33.5L32 40L30.5 33.5L24 32L30.5 30.5Z" fill="#FFFFFF" opacity={0.9} />
    {/* Scattered particles */}
    <Circle cx={14} cy={14} r={1.5} fill="#EEDF9B" opacity={0.5} />
    <Circle cx={50} cy={12} r={2} fill="#EEDF9B" opacity={0.4} />
    <Circle cx={52} cy={50} r={1.5} fill="#EEDF9B" opacity={0.45} />
    <Circle cx={12} cy={48} r={1} fill="#EEDF9B" opacity={0.35} />
    <Circle cx={22} cy={54} r={1.5} fill="#EEDF9B" opacity={0.3} />
    <Circle cx={46} cy={8} r={1} fill="#EEDF9B" opacity={0.3} />
  </Svg>
));
SupernovaIcon.displayName = 'SupernovaIcon';

// Horoscope icon selector
const HoroscopeIcon: React.FC<{rating: number; size: number}> = memo(
  ({rating, size}) => {
    switch (rating) {
      case 1:
        return <RingedPlanetIcon size={size} />;
      case 2:
        return <WaningMoonIcon size={size} />;
      case 3:
        return <OrbitPlanetIcon size={size} />;
      case 4:
        return <ShootingStarIcon size={size} />;
      case 5:
        return <SupernovaIcon size={size} />;
      default:
        return <CrescentMoonIcon size={size} />;
    }
  },
);
HoroscopeIcon.displayName = 'HoroscopeIcon';

// ─── Floating Particle ───
const FloatingParticle: React.FC<{
  delay: number;
  startY: number;
  x: number;
  size: number;
}> = memo(({delay, startY, x, size}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 2400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1600,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay, translateY, opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: startY,
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#EEDF9B',
        opacity,
        transform: [{translateY}],
      }}
    />
  );
});
FloatingParticle.displayName = 'FloatingParticle';

// ─── Star Rating ───
interface StarIconProps {
  filled: boolean;
  size?: number;
  onPress?: () => void;
  animatedScale?: Animated.Value;
}

const RatingStar: React.FC<StarIconProps> = memo(
  ({filled, size = 40, onPress, animatedScale}) => {
    const starPath =
      'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z';

    const animatedStyle = animatedScale
      ? {transform: [{scale: animatedScale}]}
      : {};

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{top: 10, bottom: 10, left: 5, right: 5}}>
        <Animated.View style={animatedStyle}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            {filled ? (
              <>
                <Defs>
                  <LinearGradient
                    id={`starFill${size}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="100%" stopColor="#EEDF9B" />
                  </LinearGradient>
                </Defs>
                <Path
                  d={starPath}
                  fill={`url(#starFill${size})`}
                  stroke="#EEDF9B"
                  strokeWidth={0.5}
                />
              </>
            ) : (
              <Path
                d={starPath}
                fill="transparent"
                stroke="rgba(194, 209, 243, 0.2)"
                strokeWidth={1.5}
              />
            )}
          </Svg>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

RatingStar.displayName = 'RatingStar';

// ─── Main Component ───
interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitRating: (rating: number) => void;
}

const RatingModal: React.FC<RatingModalProps> = memo(
  ({visible, onClose, onSubmitRating}) => {
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [starScales] = useState<Animated.Value[]>(() =>
      Array.from({length: 5}, () => new Animated.Value(1)),
    );
    const iconScale = useRef(new Animated.Value(0.8)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.85)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    // Pulsating glow
    useEffect(() => {
      if (visible) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 0.8,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    }, [visible, glowAnim]);

    // Modal entrance
    useEffect(() => {
      if (visible) {
        contentOpacity.setValue(0);
        iconScale.setValue(0.8);
        Animated.sequence([
          Animated.parallel([
            Animated.spring(modalScale, {
              toValue: 1,
              friction: 7,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.timing(modalOpacity, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
              toValue: 1,
              friction: 5,
              tension: 80,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        modalScale.setValue(0.85);
        modalOpacity.setValue(0);
        contentOpacity.setValue(0);
      }
    }, [visible, modalScale, modalOpacity, contentOpacity, iconScale]);

    // Icon transition on rating change
    useEffect(() => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(iconScale, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(iconRotate, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(iconRotate, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [selectedRating, iconScale, iconRotate]);

    const handleStarPress = useCallback(
      (rating: number) => {
        if (selectedRating === rating) {
          setSelectedRating(rating - 1);
          return;
        }
        setSelectedRating(rating);

        const starIndex = rating - 1;
        Animated.sequence([
          Animated.timing(starScales[starIndex], {
            toValue: 1.4,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.spring(starScales[starIndex], {
            toValue: 1,
            friction: 4,
            tension: 120,
            useNativeDriver: true,
          }),
        ]).start();
      },
      [starScales, selectedRating],
    );

    const handleSubmit = useCallback(() => {
      if (selectedRating > 0) {
        onSubmitRating(selectedRating);
        setSelectedRating(0);
      }
    }, [selectedRating, onSubmitRating]);

    const handleClose = useCallback(() => {
      setSelectedRating(0);
      onClose();
    }, [onClose]);

    const getTitle = () => {
      switch (selectedRating) {
        case 0:
          return 'Enjoying the App?';
        case 1:
          return 'Oh No, Sorry!';
        case 2:
          return 'We Can Do Better';
        case 3:
          return 'Not Bad, Right?';
        case 4:
          return 'Glad You Like It!';
        case 5:
          return 'You\'re Amazing!';
        default:
          return 'Enjoying the App?';
      }
    };


    const spin = iconRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '15deg'],
    });

    const isHighRating = selectedRating >= 4;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent>
        <View style={styles.overlay}>
          {Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={30}
              reducedTransparencyFallbackColor="rgba(8, 20, 42, 0.95)"
            />
          ) : (
            <Pressable
              style={[StyleSheet.absoluteFill, styles.androidBlur]}
              onPress={handleClose}
            />
          )}

          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{scale: modalScale}],
                opacity: modalOpacity,
              },
              isHighRating && styles.modalContainerGlow,
            ]}>
            {/* Floating particles for high rating */}
            {isHighRating && (
              <>
                <FloatingParticle delay={0} startY={120} x={30} size={3} />
                <FloatingParticle delay={600} startY={140} x={80} size={2} />
                <FloatingParticle delay={300} startY={100} x={200} size={2.5} />
                <FloatingParticle delay={900} startY={160} x={260} size={2} />
                <FloatingParticle delay={450} startY={130} x={150} size={3} />
              </>
            )}

            {/* Top accent line */}
            <View style={styles.topAccent} />

            {/* Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Animated.View
              style={[styles.content, {opacity: contentOpacity}]}>
              {/* SVG Icon */}
              <View style={styles.iconContainer}>
                <Animated.View
                  style={[
                    styles.iconGlow,
                    {
                      opacity: glowAnim,
                      backgroundColor: isHighRating
                        ? 'rgba(238, 223, 155, 0.15)'
                        : 'rgba(194, 209, 243, 0.1)',
                    },
                  ]}
                />
                <Animated.View
                  style={{
                    transform: [{scale: iconScale}, {rotate: spin}],
                  }}>
                  <HoroscopeIcon
                    rating={selectedRating}
                    size={moderateScale(64)}
                  />
                </Animated.View>
              </View>

              {/* Title */}
              <Text
                style={[
                  styles.title,
                  isHighRating && styles.titleGold,
                ]}>
                {getTitle()}
              </Text>

              {/* Subtitle */}
              {/* <Text style={styles.subtitle}>{getSubtitle()}</Text> */}

              {/* Stars row */}
              <View style={styles.starsWrapper}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <RatingStar
                      key={star}
                      filled={star <= selectedRating}
                      size={moderateScale(36)}
                      onPress={() => handleStarPress(star)}
                      animatedScale={starScales[star - 1]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.tapHint,
                    isHighRating && styles.tapHintGold,
                  ]}>
                  {selectedRating > 0
                    ? `${selectedRating} of 5 Stars`
                    : 'Tap a star to rate'}
                </Text>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  selectedRating === 0 && styles.submitButtonDisabled,
                  isHighRating && styles.submitButtonActive,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={selectedRating === 0}>
                <Text
                  style={[
                    styles.submitButtonText,
                    isHighRating && styles.submitButtonTextDark,
                  ]}>
                  Submit
                </Text>
              </TouchableOpacity>

              {/* Skip */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleClose}
                hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
                <Text style={styles.skipText}>Maybe later</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

RatingModal.displayName = 'RatingModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(24),
  },
  androidBlur: {
    backgroundColor: 'rgba(4, 10, 22, 0.96)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: moderateScale(340),
    borderRadius: moderateScale(28),
    overflow: 'hidden',
    backgroundColor: '#08142a91',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.1)',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.5,
    shadowRadius: 40,
    // elevation: 24,
  },
  modalContainerGlow: {
    borderColor: 'rgba(238, 223, 155, 0.2)',
    shadowColor: '#EEDF9B',
    shadowOpacity: 0.15,
  },
  topAccent: {
    height: 2,
    backgroundColor: 'rgba(194, 209, 243, 0.15)',
  },
  content: {
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(28),
    paddingHorizontal: horizontalScale(28),
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: moderateScale(16),
    right: moderateScale(16),
    zIndex: 10,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: moderateScale(14),
    color: 'rgba(194, 209, 243, 0.5)',
    fontWeight: '500',
  },
  iconContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  iconGlow: {
    position: 'absolute',
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: moderateScale(25),
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: moderateScale(36),
    marginBottom: verticalScale(10),
  },
  titleGold: {
    color: '#EEDF9B',
  },
  subtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: moderateScale(14),
    color: '#C2D1F3',
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: verticalScale(28),
    lineHeight: moderateScale(20),
  },
  starsWrapper: {
    alignItems: 'center',
    marginBottom: verticalScale(28),
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(12),
    marginBottom: verticalScale(12),
  },
  tapHint: {
    fontFamily: FontFamilies.interMedium,
    fontSize: moderateScale(13),
    color: 'rgba(194, 209, 243, 0.4)',
    letterSpacing: 0.5,
  },
  tapHintGold: {
    color: 'rgba(238, 223, 155, 0.6)',
  },
  submitButton: {
    width: '100%',
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.15)',
  },
  submitButtonDisabled: {
    opacity: 0.35,
  },
  submitButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  submitButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: moderateScale(15),
    color: '#FFFFFF',
  },
  submitButtonTextDark: {
    color: '#0A1628',
  },
  skipButton: {
    paddingVertical: verticalScale(8),
  },
  skipText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: moderateScale(13),
    color: 'rgba(194, 209, 243, 0.35)',
  },
});

export default RatingModal;
