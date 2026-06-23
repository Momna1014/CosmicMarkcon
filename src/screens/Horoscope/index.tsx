import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {selectOnboardingState} from '../../redux/slices/onboardingSlice';
import {styles} from './styles';

// Tab Components
import TodayTab from './TodayTab';
import TomorrowTab from './TomorrowTab';
import WeeklyTab from './WeeklyTab';
import StarfieldAnimation from '../../components/home_components/StarfieldAnimation';
import CosmicLoader from '../../components/CosmicLoader';
import CosmicAlert from '../../components/CosmicAlert';
import {useHoroscopeData} from '../../hooks/useHoroscopeData';

// Analytics
import {trackHoroscopeTabView} from '../../utils/mainScreenAnalytics';
import {useFocusEffect} from '@react-navigation/native';
import {consumeNextFocusSource} from '../../utils/tabNavigationSource';
import {hapticLight} from '../../utils/haptics';

type TabType = 'today' | 'tomorrow' | 'weekly';

// Get zodiac symbol
const getZodiacSymbol = (sign: string): string => {
  const symbols: Record<string, string> = {
    aries: '♈',
    taurus: '♉',
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓',
  };
  return symbols[sign.toLowerCase()] || '♈';
};

// Format date for a given Date object
const formatDate = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dateNum = date.getDate();
  
  const suffix = dateNum === 1 || dateNum === 21 || dateNum === 31 ? 'st' :
                 dateNum === 2 || dateNum === 22 ? 'nd' :
                 dateNum === 3 || dateNum === 23 ? 'rd' : 'th';
  
  return `${day}, ${month} ${dateNum}${suffix}`;
};

// Format week range string
const formatWeekRange = (): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 6);
  return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
};

// Gradient Text Component for Seeker
const GradientText: React.FC<{text: string}> = ({text}) => (
  <MaskedView
    maskElement={<Text style={styles.seekerText}>{text}</Text>}>
    <LinearGradient
      colors={['#EEDF9B', '#DDC560']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}>
      <Text style={[styles.seekerText, {opacity: 0}]}>{text}</Text>
    </LinearGradient>
  </MaskedView>
);

type Props = {
  navigation: any;
};

const HoroscopeScreen: React.FC<Props> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [showQuotaAlert, setShowQuotaAlert] = useState(false);
  const onboardingData = useSelector(selectOnboardingState);
  const {todayData, tomorrowData, weeklyData, loading, isQuotaError} = useHoroscopeData();

  // Show quota alert when API limit is hit
  useEffect(() => {
    if (isQuotaError) {
      setShowQuotaAlert(true);
    }
  }, [isQuotaError]);

  // Entrance animations
  const dateBadgeFadeAnim = useRef(new Animated.Value(0)).current;
  const dateBadgeSlideAnim = useRef(new Animated.Value(20)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(30)).current;
  const zodiacFadeAnim = useRef(new Animated.Value(0)).current;
  const zodiacScaleAnim = useRef(new Animated.Value(0.9)).current;
  const tabBarFadeAnim = useRef(new Animated.Value(0)).current;
  const tabBarSlideAnim = useRef(new Animated.Value(30)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (loading) {
      return;
    }
    // Reset animation values so they can replay
    dateBadgeFadeAnim.setValue(0);
    dateBadgeSlideAnim.setValue(20);
    titleFadeAnim.setValue(0);
    titleSlideAnim.setValue(30);
    zodiacFadeAnim.setValue(0);
    zodiacScaleAnim.setValue(0.9);
    tabBarFadeAnim.setValue(0);
    tabBarSlideAnim.setValue(30);
    contentFadeAnim.setValue(0);
    contentSlideAnim.setValue(40);

    // Staggered entrance animations
    Animated.stagger(100, [
      // Date badge animation
      Animated.parallel([
        Animated.timing(dateBadgeFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(dateBadgeSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Title animation
      Animated.parallel([
        Animated.timing(titleFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Zodiac badge animation
      Animated.parallel([
        Animated.timing(zodiacFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(zodiacScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Tab bar animation
      Animated.parallel([
        Animated.timing(tabBarFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(tabBarSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Content animation
      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlideAnim, {
          toValue: 0,
          friction: 7,
          tension: 35,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const userName = useMemo(() => {
    return onboardingData?.name || 'Seeker';
  }, [onboardingData?.name]);

  const zodiacSign = useMemo(() => {
    return onboardingData?.zodiacSign || 'Pisces';
  }, [onboardingData?.zodiacSign]);

  const displayDate = useMemo(() => {
    if (activeTab === 'tomorrow') {
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      return formatDate(tmrw);
    }
    if (activeTab === 'weekly') {
      return formatWeekRange();
    }
    return formatDate(new Date());
  }, [activeTab]);

  // Analytics - Bottom tab view
  useFocusEffect(
    useCallback(() => {
      if (consumeNextFocusSource() === 'home') { return; }
      trackHoroscopeTabView();
    }, [])
  );

  const handleTabPress = useCallback((tab: TabType) => {
    hapticLight();
    setActiveTab(tab);
  }, []);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return <TodayTab data={todayData} />;
      case 'tomorrow':
        return <TomorrowTab data={tomorrowData} />;
      case 'weekly':
        return <WeeklyTab data={weeklyData} />;
      default:
        return <TodayTab data={todayData} />;
    }
  }, [activeTab, todayData, tomorrowData, weeklyData]);

  // Show loader while fetching horoscope data
  if (loading) {
    return (
      <View style={styles.backgroundFallback}>
        {/* <StarfieldAnimation /> */}
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CosmicLoader visible={true} inline />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.backgroundFallback}>
      {/* Animated Starfield Background */}
      {/* <StarfieldAnimation /> */}
        
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
            
            {/* Date Badge */}
            <Animated.View style={[
              styles.dateBadge,
              {
                opacity: dateBadgeFadeAnim,
                transform: [{translateY: dateBadgeSlideAnim}],
              }
            ]}>
              <Text style={styles.dateText}>{displayDate}</Text>
            </Animated.View>

            {/* Title Section */}
            <Animated.View style={[
              styles.titleSection,
              {
                opacity: titleFadeAnim,
                transform: [{translateY: titleSlideAnim}],
              }
            ]}>
              <Text style={styles.mainTitle}>The Stars for</Text>
              <GradientText text={userName} />
            </Animated.View>

            {/* Zodiac Badge */}
            <Animated.View style={[
              styles.zodiacBadge,
              {
                opacity: zodiacFadeAnim,
                transform: [{scale: zodiacScaleAnim}],
              }
            ]}>
              {/* <Text style={styles.zodiacIcon}>{getZodiacSymbol(zodiacSign)}</Text> */}
              <Text style={styles.zodiacText}>{zodiacSign}</Text>
            </Animated.View>

            {/* Tab Bar */}
            <Animated.View style={[
              styles.tabBar,
              {
                opacity: tabBarFadeAnim,
                transform: [{translateY: tabBarSlideAnim}],
              }
            ]}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'today' && styles.tabItemActive]}
                onPress={() => handleTabPress('today')}
                activeOpacity={0.7}>
                <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>
                  TODAY
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'tomorrow' && styles.tabItemActive]}
                onPress={() => handleTabPress('tomorrow')}
                activeOpacity={0.7}>
                <Text style={[styles.tabText, activeTab === 'tomorrow' && styles.tabTextActive]}>
                  TOMORROW
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'weekly' && styles.tabItemActive]}
                onPress={() => handleTabPress('weekly')}
                activeOpacity={0.7}>
                <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>
                  WEEKLY
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Tab Content */}
            <Animated.View style={{
              opacity: contentFadeAnim,
              transform: [{translateY: contentSlideAnim}],
            }}>
              {renderTabContent()}
            </Animated.View>

          </ScrollView>
        </SafeAreaView>

      {/* Quota Error Alert */}
      <CosmicAlert
        visible={showQuotaAlert}
        title="Cosmiq Signals Busy"
        message="The stars are overloaded right now. You're seeing cached readings — fresh insights will return shortly."
        buttonText="Got It"
        onDismiss={() => setShowQuotaAlert(false)}
      />
    </View>
  );
};

export default HoroscopeScreen;
