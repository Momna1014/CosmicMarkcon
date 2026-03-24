import React, {useState, useCallback, useMemo} from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {selectOnboardingState} from '../../redux/slices/onboardingSlice';
import {styles} from './styles';

// Tab Components
import TodayTab from './TodayTab';
import TomorrowTab from './TomorrowTab';
import WeeklyTab from './WeeklyTab';
import StarfieldAnimation from '../../components/home_components/StarfieldAnimation';

const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

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

// Format current date
const formatDate = (): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const date = new Date();
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dateNum = date.getDate();
  
  // Add ordinal suffix
  const suffix = dateNum === 1 || dateNum === 21 || dateNum === 31 ? 'st' :
                 dateNum === 2 || dateNum === 22 ? 'nd' :
                 dateNum === 3 || dateNum === 23 ? 'rd' : 'th';
  
  return `${day}, ${month} ${dateNum}${suffix}`;
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
  const onboardingData = useSelector(selectOnboardingState);

  const userName = useMemo(() => {
    return onboardingData?.name || 'Seeker';
  }, [onboardingData?.name]);

  const zodiacSign = useMemo(() => {
    return onboardingData?.zodiacSign || 'Pisces';
  }, [onboardingData?.zodiacSign]);

  const currentDate = useMemo(() => formatDate(), []);

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return <TodayTab />;
      case 'tomorrow':
        return <TomorrowTab />;
      case 'weekly':
        return <WeeklyTab />;
      default:
        return <TodayTab />;
    }
  }, [activeTab]);

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
        {/* Animated Starfield Background */}
        <StarfieldAnimation />
        
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
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>The Stars for</Text>
              <GradientText text={userName} />
            </View>

            {/* Zodiac Badge */}
            <View style={styles.zodiacBadge}>
              {/* <Text style={styles.zodiacIcon}>{getZodiacSymbol(zodiacSign)}</Text> */}
              <Text style={styles.zodiacText}>{zodiacSign}</Text>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
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
            </View>

            {/* Tab Content */}
            {renderTabContent()}

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default HoroscopeScreen;
