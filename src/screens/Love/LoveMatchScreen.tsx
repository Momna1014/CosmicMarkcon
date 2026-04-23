import React, {memo, useEffect, useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import {
  FontFamilies,
  Colors,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';
import {LoveMatchData, CompatibilityMetric} from './loveMatchMockData';
import {conversationService, LoveMatchResult} from '../../services/ConversationService';
import LoveLoader from '../../components/LoveLoader';
import CosmicAlert from '../../components/CosmicAlert';

// Analytics
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  trackLoveMatchView,
  trackLoveMatchAskOracleTap,
  trackLoveMatchDismiss,
} from '../../utils/mainScreenAnalytics';

// Import icons
import CosmicInsightIcon from '../../assets/icons/horoscope_icons/cosmic_insight.svg';
import AskOracleStarIcon from '../../assets/icons/horoscope_icons/ask_oracle_star.svg';
import CrossIcon from '../../assets/icons/home_icons/cross.svg';

const HeartIcon = require('../../assets/icons/horoscope_icons/heart.png');

type Props = {
  route: {
    params: {
      yourSign: string;
      theirSign: string;
    };
  };
};

// Animated Circle component for the progress ring
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circular Progress Component with Gradient
const CircularProgress = memo(
  ({percentage, size = 180}: {percentage: number; size?: number}) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, [percentage, animatedValue]);

    const strokeDashoffset = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [circumference, 0],
    });

    return (
      <View style={[circularStyles.container, {width: size, height: size}]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="22.07%" stopColor="#F2E9BE" />
              <Stop offset="95.67%" stopColor="#E6D27E" />
            </LinearGradient>
          </Defs>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={circularStyles.textContainer}>
          {/* <GradientText style={circularStyles.percentageText}>
            {`${percentage}%`}
          </GradientText> */}
          <Text style={circularStyles.percentageText}>{`${percentage}%`}</Text>
        </View>
      </View>
    );
  },
);

const circularStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(47),
    fontWeight: '400',
    color:'#F5F2EA'
  },
});

// Metric Item Component
const MetricItem = memo(
  ({metric, index}: {metric: CompatibilityMetric; index: number}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const delay = index * 200;

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: metric.percentage,
          duration: 1200,
          delay: delay + 300,
          useNativeDriver: false,
        }),
      ]).start();
    }, [index, fadeAnim, slideAnim, progressAnim, metric.percentage]);

    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <Animated.View
        style={[
          metricStyles.container,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={metricStyles.header}>
          <View style={metricStyles.labelContainer}>
            <Image
              source={HeartIcon}
              style={[metricStyles.heartIcon, {tintColor: metric.iconColor}]}
              resizeMode="contain"
            />
            <Text style={[metricStyles.label, {color: metric.iconColor}]}>
              {metric.label}
            </Text>
          </View>
          <Text style={metricStyles.percentage}>{metric.percentage}%</Text>
        </View>
        <View style={metricStyles.progressBackground}>
          <Animated.View
            style={[
              metricStyles.progressFill,
              {
                width: progressWidth,
              },
            ]}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id={`gradient-${metric.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={metric.gradientColors[0]} />
                  <Stop offset="100%" stopColor={metric.gradientColors[1]} />
                </LinearGradient>
              </Defs>
              <Circle
                cx="50%"
                cy="50%"
                r="1000"
                fill={`url(#gradient-${metric.id})`}
              />
            </Svg>
          </Animated.View>
        </View>
      </Animated.View>
    );
  },
);

const metricStyles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  label: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    fontWeight: 'bold',
    letterSpacing: 0.5,
    // lineHeight:verticalScale(30)
  },
  percentage: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  progressBackground: {
    height: verticalScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radiusScale(100),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radiusScale(100),
    overflow: 'hidden',
  },
  heartIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
});

// Cosmic Insight Card Component
const CosmicInsightCard = memo(({title, description}: {title: string; description: string}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[insightStyles.container, {opacity: fadeAnim}]}>
      <View style={insightStyles.header}>
        <CosmicInsightIcon width={moderateScale(40)} height={moderateScale(40)} />
        <Text style={insightStyles.title}>{title}</Text>
      </View>
      <Text style={insightStyles.description}>{description}</Text>
    </Animated.View>
  );
});

const insightStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(194, 209, 243, 0)',
    borderRadius: radiusScale(24),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    paddingHorizontal: moderateScale(20),
    paddingVertical:verticalScale(24),
    marginTop: verticalScale(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    marginBottom: verticalScale(12),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: 'rgba(245, 158, 11, 1)',
    fontWeight: '600',
  },
  description: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 1)',
    lineHeight: fontScale(22),
  },
});

// Ask Oracle Button Component
const AskOracleButton = memo(({onPress}: {onPress: () => void}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 1200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View
      style={[
        oracleStyles.container,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        style={oracleStyles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <AskOracleStarIcon width={moderateScale(21)} height={moderateScale(21)} />
        <Text style={oracleStyles.buttonText}>ASK ORACLE FOR DEEPER INSIGHT</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const oracleStyles = StyleSheet.create({
  container: {
    marginTop: verticalScale(30),
    // marginBottom: verticalScale(30),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(125, 211, 252, 0.36)',
    borderRadius: radiusScale(30),
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 1)',
    paddingVertical: verticalScale(17),
    paddingHorizontal: horizontalScale(24),
    gap: horizontalScale(10),
  },
  buttonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

const LoveMatchScreen: React.FC<Props> = ({route}) => {
  const {yourSign, theirSign} = route.params;
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [matchData, setMatchData] = useState<LoveMatchData | null>(null);
  const [showQuotaAlert, setShowQuotaAlert] = useState(false);

  // Build LoveMatchData from ChatGPT result
  const buildMatchData = useCallback(
    (result: LoveMatchResult): LoveMatchData => ({
      overallScore: result.overallScore,
      yourSign,
      theirSign,
      alignmentText: result.alignmentText,
      metrics: [
        {
          id: 'love',
          label: 'LOVE & ROMANCE',
          percentage: result.lovePercentage,
          iconColor: 'rgba(243, 98, 180, 1)',
          gradientColors: ['#F5265D', '#F362B4'],
        },
        {
          id: 'communication',
          label: 'COMMUNICATION',
          percentage: result.communicationPercentage,
          iconColor: 'rgba(98, 173, 243, 1)',
          gradientColors: ['#2656F5', '#62ADF3'],
        },
        {
          id: 'passion',
          label: 'PASSION & ENERGY',
          percentage: result.passionPercentage,
          iconColor: 'rgba(245, 135, 38, 1)',
          gradientColors: ['#F58726', '#F3AB62'],
        },
      ],
      cosmicInsight: result.cosmicInsight,
    }),
    [yourSign, theirSign],
  );

  // Fetch love match data from ChatGPT
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const result = await conversationService.getLoveMatchData(yourSign, theirSign);
        if (!cancelled) {
          setMatchData(buildMatchData(result));
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('⚠️ [LoveMatch] ChatGPT failed, using fallback:', err.message);
        if (!cancelled) {
          // Detect quota/rate-limit errors
          const msg = (err?.message || '').toLowerCase();
          const code = err?.response?.data?.error?.code || '';
          const status = err?.response?.status;
          const isQuota = status === 429 || msg.includes('429') || msg.includes('quota') || code === 'insufficient_quota';
          if (isQuota) {
            setShowQuotaAlert(true);
          }
          // Fallback to basic mock data
          const {generateLoveMatchData} = require('./loveMatchMockData');
          setMatchData(generateLoveMatchData(yourSign, theirSign));
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [yourSign, theirSign, buildMatchData]);

  // Analytics - Screen View
  useScreenView('LoveMatch', {
    screen_category: 'love',
    your_sign: yourSign,
    their_sign: theirSign,
  });

  // Analytics - Track screen view on mount
  useEffect(() => {
    if (matchData) {
      trackLoveMatchView(yourSign, theirSign, matchData.overallScore);
    }
    firebaseService.logScreenView('LoveMatch', 'LoveMatchScreen');
  }, [yourSign, theirSign, matchData]);

  const handleClose = useCallback(() => {
    trackLoveMatchDismiss(yourSign, theirSign);
    navigation.goBack();
  }, [navigation, yourSign, theirSign]);

  const handleAskOracle = useCallback(() => {
    trackLoveMatchAskOracleTap(yourSign, theirSign);
    const summary = matchData
      ? `My sign: ${yourSign}\nPartner's sign: ${theirSign}\nOverall compatibility: ${matchData.overallScore}%\nAlignment: ${matchData.alignmentText}\n${matchData.metrics.map(m => `${m.label}: ${m.percentage}%`).join('\n')}\nCelestial Insight: ${matchData.cosmicInsight.description}`
      : `My sign: ${yourSign}, Partner's sign: ${theirSign}`;
    navigation.navigate('Chat', {
      source: 'love',
      yourSign,
      theirSign,
      loveMatchSummary: summary,
    });
  }, [navigation, yourSign, theirSign, matchData]);

  // Show loader while loading
  if (isLoading || !matchData) {
    return (
      <View style={styles.backgroundFallback}>
        <View style={styles.loaderContainer}>
          <LoveLoader visible={true} text="Calculating your compatibility..." inline />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.backgroundFallback}>
      <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          
          {/* Header with Cross Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}>
              <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Circular Progress */}
            <View style={styles.circularContainer}>
              <CircularProgress percentage={matchData.overallScore} size={moderateScale(180)} />
            </View>

            {/* Alignment Text */}
            <Text style={styles.alignmentText}>{matchData.alignmentText}</Text>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Metrics */}
            <View style={styles.metricsContainer}>
              {matchData.metrics.map((metric, index) => (
                <MetricItem key={metric.id} metric={metric} index={index} />
              ))}
            </View>

            {/* Cosmic Insight Card */}
            <CosmicInsightCard
              title={matchData.cosmicInsight.title}
              description={matchData.cosmicInsight.description}
            />

            {/* Ask Oracle Button */}
            <AskOracleButton onPress={handleAskOracle} />
          </ScrollView>
        </SafeAreaView>

      {/* Quota Error Alert */}
      <CosmicAlert
        visible={showQuotaAlert}
        title="Cosmiq Signals Busy"
        message="The love oracle is overwhelmed with celestial energy right now. You're seeing estimated compatibility — a personalized reading will be available shortly."
        buttonText="Got It"
        onDismiss={() => setShowQuotaAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(25),
    paddingTop: verticalScale(10),
    // paddingBottom: verticalScale(10),
  },
  closeButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(40),
  },
  circularContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(24),
  },
  alignmentText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(15),
    color: 'rgba(194, 209, 243, 1)',
    textAlign: 'center',
    lineHeight: fontScale(22),
    paddingHorizontal: horizontalScale(10),
    fontWeight:'600'
  },
  separator: {
    // height: 1,
    // backgroundColor: 'rgba(194, 209, 243, 0.2)',
    marginVertical: verticalScale(24),
  },
  metricsContainer: {
    marginBottom: verticalScale(10),
  },
});

export default LoveMatchScreen;
