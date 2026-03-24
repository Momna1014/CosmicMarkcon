import React, {useState, useCallback, useRef, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import GradientText from '../../components/GradientText';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';

// Import camera icon
import CameraIcon from '../../assets/icons/chat_icons/camera.svg';

const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

type TabType = 'leftHand' | 'rightHand';

type Props = {
  navigation: any;
};

// Tab Bar Component with Animation
const TabBar = memo(
  ({
    activeTab,
    onTabPress,
  }: {
    activeTab: TabType;
    onTabPress: (tab: TabType) => void;
  }) => {
    const slideAnim = useRef(new Animated.Value(activeTab === 'leftHand' ? 0 : 1)).current;

    useEffect(() => {
      Animated.spring(slideAnim, {
        toValue: activeTab === 'leftHand' ? 0 : 1,
        useNativeDriver: false,
        speed: 15,
        bounciness: 8,
      }).start();
    }, [activeTab, slideAnim]);

    const indicatorLeft = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '50%'],
    });

    return (
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {left: indicatorLeft},
          ]}
        />
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabPress('leftHand')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'leftHand' && styles.tabTextActive,
            ]}>
            LEFT HAND
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabPress('rightHand')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'rightHand' && styles.tabTextActive,
            ]}>
            RIGHT HAND
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

// Scan Palm Card Component
const ScanPalmCard = memo(({handType, onPress}: {handType: TabType; onPress: () => void}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [handType, fadeAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
    <Animated.View style={[styles.cardContainer, {opacity: fadeAnim}]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}>
        <Animated.View style={[styles.cardContent, {transform: [{scale: scaleAnim}]}]}>
          {/* Camera Icon Circle */}
          <View style={styles.cameraIconContainer}>
            <View style={styles.cameraCircle}>
              <CameraIcon width={moderateScale(80)} height={moderateScale(80)} />
            </View>
          </View>

          {/* Scan Palm Text */}
          <Text style={styles.scanPalmTitle}>
            Scan {handType === 'leftHand' ? 'Left' : 'Right'} Palm
          </Text>

          {/* Use Camera Text */}
          <Text style={styles.useCameraText}>USE CAMERA</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const ChiromancyScreen: React.FC<Props> = ({navigation}) => {
  const [activeTab, setActiveTab] = useState<TabType>('leftHand');

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleScanPress = useCallback(() => {
    // TODO: Open camera to scan palm
    console.log('Open camera for', activeTab);
  }, [activeTab]);

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
            {/* Title */}
            <View style={styles.titleContainer}>
              <GradientText style={styles.mainTitle}>AI Palmistry</GradientText>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Capture an image of your palm and let the{'\n'}Cosmic Whoop decode the map written on your hands.
            </Text>

            {/* Tab Bar */}
            <TabBar activeTab={activeTab} onTabPress={handleTabPress} />

            {/* Scan Palm Card */}
            <ScanPalmCard handType={activeTab} onPress={handleScanPress} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(120),
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: verticalScale(30),
  },
  mainTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(40),
    fontWeight: '400',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: 'rgba(194, 209, 243, 1)',
    textAlign: 'center',
    marginTop: verticalScale(24),
    lineHeight: fontScale(20),
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderRadius: radiusScale(100),
    paddingHorizontal: moderateScale(6),
    paddingVertical: verticalScale(6),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(4),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: verticalScale(6),
    bottom: verticalScale(6),
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: radiusScale(100),
    marginLeft: moderateScale(6),
  },
  tabItem: {
    flex: 1,
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    borderRadius: radiusScale(100),
    zIndex: 1,
  },
  tabText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#000000',
  },
  cardContainer: {
    marginTop: verticalScale(40),
  },
  card: {
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderRadius: radiusScale(32),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    overflow: 'hidden',
  },
  cardContent: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    marginBottom: verticalScale(24),
  },
  cameraCircle: {
    // width: moderateScale(100),
    // height: moderateScale(100),
    // borderRadius: moderateScale(50),
    // backgroundColor: 'rgba(194, 209, 243, 0.15)',
    // borderWidth: 2,
    // borderColor: 'rgba(194, 209, 243, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanPalmTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(32),
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  useCameraText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.7)',
    fontWeight: '600',
    // letterSpacing: 1,
    textAlign: 'center',
  },
});

export default ChiromancyScreen;
