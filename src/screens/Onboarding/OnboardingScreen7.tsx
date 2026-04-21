/**
 * Onboarding Screen 7
 * Birthday input with animated zodiac half wheel
 */

import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SharedValue,
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
import {hapticLight} from '../../utils/haptics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {trackOnboarding7BirthdayView} from '../../utils/onboardingAnalytics';
import {OnboardingButton} from '../../components/OnboardingButton';
import {getZodiacSign} from '../../components/mock/zodiacMockData';

import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';
import AriesIcon from '../../assets/icons/new_onboarding/zodix_signs/aries.svg';
import TaurusIcon from '../../assets/icons/new_onboarding/zodix_signs/taurus.svg';
import GeminiIcon from '../../assets/icons/new_onboarding/zodix_signs/gemini.svg';
import CancerIcon from '../../assets/icons/new_onboarding/zodix_signs/cancer.svg';
import LeoIcon from '../../assets/icons/new_onboarding/zodix_signs/leo.svg';
import VirgoIcon from '../../assets/icons/new_onboarding/zodix_signs/virgo.svg';
import LibraIcon from '../../assets/icons/new_onboarding/zodix_signs/libra.svg';
import ScorpioIcon from '../../assets/icons/new_onboarding/zodix_signs/scorpio.svg';
import SagittariusIcon from '../../assets/icons/new_onboarding/zodix_signs/sagittarius.svg';
import CapricornIcon from '../../assets/icons/new_onboarding/zodix_signs/capricon.svg';
import AquariusIcon from '../../assets/icons/new_onboarding/zodix_signs/aquarius.svg';
import PiscesIcon from '../../assets/icons/new_onboarding/zodix_signs/pisces.svg';

const HORIZONTAL_PADDING = horizontalScale(16);
const {width: SCREEN_WIDTH} = Dimensions.get('window');

type ZodiacSignKey =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

type SignItem = {
  key: ZodiacSignKey;
  label: string;
  glyph: string;
};

type SegmentItem = {
  sign: SignItem;
  start: number;
  path: string;
  glyphX: number;
  glyphY: number;
};

const SIGNS: SignItem[] = [
  {key: 'aries', label: 'Aries', glyph: '♈'},
  {key: 'taurus', label: 'Taurus', glyph: '♉'},
  {key: 'gemini', label: 'Gemini', glyph: '♊'},
  {key: 'cancer', label: 'Cancer', glyph: '♋'},
  {key: 'leo', label: 'Leo', glyph: '♌'},
  {key: 'virgo', label: 'Virgo', glyph: '♍'},
  {key: 'libra', label: 'Libra', glyph: '♎'},
  {key: 'scorpio', label: 'Scorpio', glyph: '♏'},
  {key: 'sagittarius', label: 'Sagittarius', glyph: '♐'},
  {key: 'capricorn', label: 'Capricorn', glyph: '♑'},
  {key: 'aquarius', label: 'Aquarius', glyph: '♒'},
  {key: 'pisces', label: 'Pisces', glyph: '♓'},
];

const ZODIAC_ICON_MAP: Record<ZodiacSignKey, React.FC<any>> = {
  aries: AriesIcon,
  taurus: TaurusIcon,
  gemini: GeminiIcon,
  cancer: CancerIcon,
  leo: LeoIcon,
  virgo: VirgoIcon,
  libra: LibraIcon,
  scorpio: ScorpioIcon,
  sagittarius: SagittariusIcon,
  capricorn: CapricornIcon,
  aquarius: AquariusIcon,
  pisces: PiscesIcon,
};

const SIGN_INDEX: Record<ZodiacSignKey, number> = {
  aries: 0,
  taurus: 1,
  gemini: 2,
  cancer: 3,
  leo: 4,
  virgo: 5,
  libra: 6,
  scorpio: 7,
  sagittarius: 8,
  capricorn: 9,
  aquarius: 10,
  pisces: 11,
};

const ZODIAC_NAME_MAP: Record<string, ZodiacSignKey> = {
  Aries: 'aries',
  Taurus: 'taurus',
  Gemini: 'gemini',
  Cancer: 'cancer',
  Leo: 'leo',
  Virgo: 'virgo',
  Libra: 'libra',
  Scorpio: 'scorpio',
  Sagittarius: 'sagittarius',
  Capricorn: 'capricorn',
  Aquarius: 'aquarius',
  Pisces: 'pisces',
};

const WHEEL_SIZE = moderateScale(320);
const CENTER = WHEEL_SIZE / 2;
const OUTER_RADIUS = moderateScale(148);
const INNER_RADIUS = moderateScale(92);
const GLYPH_RADIUS = moderateScale(121);
const SEGMENT_DEG = 30;

// Use current date as default
const INITIAL_BIRTHDAY = (() => {
  const today = new Date();
  // Set to a reasonable default age (e.g., 25 years old)
  const defaultDate = new Date();
  defaultDate.setFullYear(today.getFullYear() - 25);
  return defaultDate;
})();

interface OnboardingScreen7Props {
  onNext?: (birthday: Date) => void;
  onGoBack?: () => void;
}

const degToRad = (deg: number): number => (deg * Math.PI) / 180;

const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) => {
  const rad = degToRad(angleDeg - 90);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const createDonutSegmentPath = (
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) => {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ');
};

const toZodiacKey = (name: string): ZodiacSignKey => ZODIAC_NAME_MAP[name] || 'aries';

const getTargetRotation = (sign: ZodiacSignKey): number => {
  const index = SIGN_INDEX[sign];
  const signCenterAngle = index * SEGMENT_DEG + SEGMENT_DEG / 2;
  return -signCenterAngle;
};

const ZodiacIcon: React.FC<{
  item: SegmentItem;
  selectedSign: ZodiacSignKey;
  rotation: SharedValue<number>;
}> = ({item, selectedSign, rotation}) => {
  const isActive = item.sign.key === selectedSign;
  const IconComponent = ZODIAC_ICON_MAP[item.sign.key];
  const iconSize = isActive ? moderateScale(28) : moderateScale(24);
  const iconOpacity = isActive ? 1 : 0.72;

  // Counter-rotate to keep icons upright
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${-rotation.value}deg`}],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: item.glyphX - iconSize / 2,
          top: item.glyphY - iconSize / 2,
          width: iconSize,
          height: iconSize,
          opacity: iconOpacity,
        },
        iconAnimatedStyle,
      ]}>
      <IconComponent width={iconSize} height={iconSize} />
    </Animated.View>
  );
};

const ZodiacWheelSvg: React.FC<{
  selectedSign: ZodiacSignKey;
  rotation: SharedValue<number>;
}> = ({selectedSign, rotation}) => {
  const segments = useMemo(() => {
    return SIGNS.map((sign, index) => {
      const start = index * SEGMENT_DEG;
      const end = start + SEGMENT_DEG;
      const middle = start + SEGMENT_DEG / 2;
      const glyphPos = polarToCartesian(CENTER, CENTER, GLYPH_RADIUS, middle);

      return {
        sign,
        start,
        path: createDonutSegmentPath(
          CENTER,
          CENTER,
          OUTER_RADIUS,
          INNER_RADIUS,
          start,
          end,
        ),
        glyphX: glyphPos.x,
        glyphY: glyphPos.y,
      };
    });
  }, []);

  return (
    <View style={{width: WHEEL_SIZE, height: WHEEL_SIZE}}>
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
        <Defs>
        <SvgLinearGradient id="segmentGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#3A4152" />
          <Stop offset="48%" stopColor="#202635" />
          <Stop offset="100%" stopColor="#0E1220" />
        </SvgLinearGradient>
        <SvgLinearGradient id="activeSegmentGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#5A6278" />
          <Stop offset="45%" stopColor="#343C52" />
          <Stop offset="100%" stopColor="#1D2334" />

        </SvgLinearGradient>
        <SvgLinearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </SvgLinearGradient>
      </Defs>

      <Circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER_RADIUS}
        fill="none"
        stroke="rgba(255, 255, 255, 0.26)"
        strokeWidth={4}
      />

      {segments.map((item, index) => {
        const isActive = item.sign.key === selectedSign;

        return (
          <Path
            key={item.sign.key}
            d={item.path}
            fill={isActive ? 'url(#activeSegmentGrad)' : 'url(#segmentGrad)'}
            opacity={isActive ? 0.96 : index % 2 === 0 ? 0.92 : 0.8}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        );
      })}

      {segments.map(item => {
        const outer = polarToCartesian(CENTER, CENTER, OUTER_RADIUS, item.start);
        const inner = polarToCartesian(CENTER, CENTER, INNER_RADIUS, item.start);

        return (
          <Path
            key={`${item.sign.key}-divider`}
            d={`M ${outer.x} ${outer.y} L ${inner.x} ${inner.y}`}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        );
      })}

      <Path
          d={createDonutSegmentPath(
            CENTER,
            CENTER,
            OUTER_RADIUS + 2,
            OUTER_RADIUS - 5,
            0,
            360,
          )}
          fill="url(#rimGrad)"
          opacity={0.5}
        />
      </Svg>
      
      {segments.map(item => (
        <ZodiacIcon
          key={`${item.sign.key}-icon`}
          item={item}
          selectedSign={selectedSign}
          rotation={rotation}
        />
      ))}
    </View>
  );
};

export const OnboardingScreen7: React.FC<OnboardingScreen7Props> = ({
  onNext,
  onGoBack,
}) => {
  const [birthday, setBirthdayState] = useState<Date>(INITIAL_BIRTHDAY);
  const [hasTrackedBirthday, setHasTrackedBirthday] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  useScreenView('OnboardingScreen7', {
    screen_category: 'onboarding',
    step: 7,
    total_steps: 9,
  });

  const CURRENT_STEP = 6;
  const TOTAL_STEPS = 9;
  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  const selectedZodiac = useMemo(() => getZodiacSign(birthday), [birthday]);
  const selectedSignKey = useMemo(
    () => toZodiacKey(selectedZodiac.name),
    [selectedZodiac.name],
  );

  const wheelRotation = useSharedValue(getTargetRotation(selectedSignKey));

  useEffect(() => {
    trackOnboarding7BirthdayView();
    firebaseService.logScreenView('onboarding_7_birthday_zodiac', 'OnboardingScreen7');

    const targetProgress = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressWidth.value = withDelay(
      300,
      withTiming(targetProgress, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    wheelRotation.value = withTiming(getTargetRotation(selectedSignKey), {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectedSignKey, wheelRotation]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${wheelRotation.value}deg`}],
  }));

  const handleDateChange = (_event: any, date?: Date) => {
    // On Android, hide picker after selection or cancel
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setBirthdayState(date);

      if (!hasTrackedBirthday) {
        setHasTrackedBirthday(true);
      }
    }
  };

  const handleOpenDatePicker = () => {
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    }
  };

  const handleBack = () => {
    hapticLight();
    onGoBack?.();
  };

  const handleContinue = () => {
    const zodiac = getZodiacSign(birthday);
    
    // Pass birthday to container, don't save to Redux yet
    onNext?.(birthday);
  };

  const minDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    return date;
  }, []);

  const maxDate = useMemo(() => new Date(), []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.content}>
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <BackArrowIcon
                width={moderateScale(24)}
                height={moderateScale(24)}
              />
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

          <Animated.Text
            entering={FadeInDown.delay(220).duration(600).springify()}
            style={styles.mainHeading}>
            Your birth date reveals{"\n"}your true self and{"\n"}connections.
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(330).duration(650).springify()}
            style={styles.wheelViewport}>
            <Animated.View style={[styles.wheelAbsolute, wheelAnimatedStyle]}>
              <ZodiacWheelSvg selectedSign={selectedSignKey} rotation={wheelRotation} />
            </Animated.View>

            <View pointerEvents="none" style={styles.pointerWrap}>
              <View style={styles.pointerTriangle} />
              {/* <View style={styles.pointerGlow} /> */}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(450).duration(520).springify()}
            style={styles.pickerSection}>
            <View style={styles.datePickerWrapper}>
              {/* <View pointerEvents="none" style={styles.datePickerHighlight} /> */}

              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={birthday}
                  onChange={handleDateChange}
                  mode="date"
                  display="spinner"
                  maximumDate={maxDate}
                  minimumDate={minDate}
                  textColor={Colors.newOnboardingHeading}
                  themeVariant="dark"
                  style={styles.datePicker}
                />
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleOpenDatePicker}
                    style={styles.androidDateButton}
                    activeOpacity={0.7}>
                    <Text style={styles.androidDateText}>
                      {birthday.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={birthday}
                      onChange={handleDateChange}
                      mode="date"
                      display="default"
                      maximumDate={maxDate}
                      minimumDate={minDate}
                    />
                  )}
                </>
              )}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(500).duration(400)}
            style={styles.bottomSection}>
            <OnboardingButton text="Continue" onPress={handleContinue} />
          </Animated.View>
        </View>
      </SafeAreaView>
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
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '700',
    fontSize: fontScale(32),
    lineHeight: fontScale(38),
    color: Colors.newOnboardingHeading,
    textAlign: 'center',
    marginBottom: verticalScale(30),
    marginHorizontal: horizontalScale(6),
  },
  wheelViewport: {
    width: '100%',
    height: verticalScale(220),
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    marginBottom: verticalScale(16),
  },
  wheelAbsolute: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    position: 'absolute',
    top: verticalScale(11),
  },
  pointerWrap: {
    position: 'absolute',
    top: verticalScale(25),
    alignItems: 'center',
    zIndex: moderateScale(10),
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: horizontalScale(33),
    borderRightWidth: horizontalScale(33),
    borderTopWidth: verticalScale(195),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  pointerGlow: {
    position: 'absolute',
    top: 0,
    width: horizontalScale(72),
    height: verticalScale(104),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: radiusScale(54),
    borderBottomRightRadius: radiusScale(54),
  },
  pickerSection: {
    marginBottom: verticalScale(24),
    alignItems: 'center',
    // backgroundColor:"red",
    flex:1,
    justifyContent:'center'
    
  },
  datePickerWrapper: {
    width: '100%',
    height: verticalScale(190),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  datePickerHighlight: {
    position: 'absolute',
    left: horizontalScale(2),
    right: horizontalScale(2),
    top: '50%',
    height: verticalScale(44),
    marginTop: -verticalScale(22),
    borderRadius: radiusScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  datePicker: {
    width: SCREEN_WIDTH - (HORIZONTAL_PADDING * 2),
    height: verticalScale(220),
    backgroundColor: 'transparent',
  },
  androidDateButton: {
    width: '80%',
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(24),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radiusScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidDateText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.newOnboardingHeading,
    textAlign: 'center',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingBottom: verticalScale(22),
  },
});

export default OnboardingScreen7;
