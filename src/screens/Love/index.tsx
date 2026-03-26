import React, {useState, useCallback, useMemo, memo, useRef, useEffect} from 'react';
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
import {useSelector, useDispatch} from 'react-redux';
import {selectOnboardingState} from '../../redux/slices/onboardingSlice';
import {selectPartners, removePartner, Partner} from '../../redux/slices/partnersSlice';
import {useAlert} from '../../contexts/AlertContext';
import GradientText from '../../components/GradientText';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';
import SignSelectModal, {ZodiacSignItem, getZodiacIcon} from '../../components/home_components/SignSelectModal';

// Import SVG icons
import AddThemIcon from '../../assets/icons/horoscope_icons/add_them.svg';
import AddLineIcon from '../../assets/icons/horoscope_icons/add_line.svg';
import CancerIcon from '../../assets/icons/horoscope_icons/cancer.svg';
import HeartIcon from '../../assets/icons/horoscope_icons/heart.svg';
import AddPartnerIcon from '../../assets/icons/horoscope_icons/add_partner.svg';
import AddThemSmallIcon from '../../assets/icons/horoscope_icons/add_them.svg';
import DeleteIcon from '../../assets/icons/horoscope_icons/delete.svg';

// Import zodiac sign SVGs for user's sign
import GeminisIcon from '../../assets/icons/horoscope_icons/geminis.svg';
import TauroIcon from '../../assets/icons/horoscope_icons/tauro.svg';
import AriesIcon from '../../assets/icons/horoscope_icons/aries.svg';
import CapricornioIcon from '../../assets/icons/horoscope_icons/capricornio.svg';
import VirgoIcon from '../../assets/icons/horoscope_icons/virgo.svg';
import PiscisIcon from '../../assets/icons/horoscope_icons/piscis.svg';
import AcuarioIcon from '../../assets/icons/horoscope_icons/acuario.svg';
import EscorpioIcon from '../../assets/icons/horoscope_icons/escorpio.svg';
import SagitarioIcon from '../../assets/icons/horoscope_icons/sagitario.svg';
import LeoIcon from '../../assets/icons/horoscope_icons/leo.svg';
import LibraIcon from '../../assets/icons/horoscope_icons/libra.svg';

const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

type TabType = 'quickMatch' | 'deepBond';

type Props = {
  navigation: any;
};

// Get user zodiac icon based on sign name
const getUserZodiacIcon = (sign: string, size: number): React.ReactElement => {
  const signLower = sign?.toLowerCase() || '';
  const props = {width: size, height: size};

  switch (signLower) {
    case 'gemini':
      return <GeminisIcon {...props} />;
    case 'taurus':
      return <TauroIcon {...props} />;
    case 'aries':
      return <AriesIcon {...props} />;
    case 'cancer':
      return <CancerIcon {...props} />;
    case 'capricorn':
      return <CapricornioIcon {...props} />;
    case 'virgo':
      return <VirgoIcon {...props} />;
    case 'pisces':
      return <PiscisIcon {...props} />;
    case 'aquarius':
      return <AcuarioIcon {...props} />;
    case 'scorpio':
      return <EscorpioIcon {...props} />;
    case 'sagittarius':
      return <SagitarioIcon {...props} />;
    case 'leo':
      return <LeoIcon {...props} />;
    case 'libra':
      return <LibraIcon {...props} />;
    default:
      return <CancerIcon {...props} />;
  }
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
    const slideAnim = useRef(new Animated.Value(activeTab === 'quickMatch' ? 0 : 1)).current;

    useEffect(() => {
      Animated.spring(slideAnim, {
        toValue: activeTab === 'quickMatch' ? 0 : 1,
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
          onPress={() => onTabPress('quickMatch')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'quickMatch' && styles.tabTextActive,
            ]}>
            QUICK MATCH
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabPress('deepBond')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'deepBond' && styles.tabTextActive,
            ]}>
            DEEP BOND
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

// Sign Circle Component
const SignCircle = memo(
  ({
    type,
    signName,
    signId,
    onPress,
  }: {
    type: 'you' | 'them';
    signName: string;
    signId?: string;
    onPress?: () => void;
  }) => {
    const isYou = type === 'you';
    const iconSize = moderateScale(50);
    const addIconSize = moderateScale(30);

    return (
      <TouchableOpacity
        style={styles.signCircleContainer}
        onPress={onPress}
        disabled={isYou}
        activeOpacity={0.7}>
        <View
          style={[
            styles.signCircle,
            isYou ? styles.signCircleYou : styles.signCircleThem,
          ]}>
          {isYou ? (
            getUserZodiacIcon(signName, iconSize)
          ) : signId ? (
            getZodiacIcon(signId)
          ) : (
            <AddThemIcon width={addIconSize} height={addIconSize} />
          )}
        </View>
        <Text style={styles.signLabel}>{isYou ? 'YOU' : 'THEM'}</Text>
        <Text style={styles.signName}>{signName}</Text>
      </TouchableOpacity>
    );
  },
);

const LoveScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch();
  const {showWarningAlert} = useAlert();
  const [activeTab, setActiveTab] = useState<TabType>('quickMatch');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSign, setSelectedSign] = useState<ZodiacSignItem | null>(null);
  const onboardingData = useSelector(selectOnboardingState);
  const partners = useSelector(selectPartners);

  // Entrance animations
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(30)).current;
  const tabBarFadeAnim = useRef(new Animated.Value(0)).current;
  const tabBarSlideAnim = useRef(new Animated.Value(30)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleSlideAnim = useRef(new Animated.Value(30)).current;
  const signsFadeAnim = useRef(new Animated.Value(0)).current;
  const signsSlideAnim = useRef(new Animated.Value(40)).current;
  const signsScaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(100, [
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
      // Subtitle animation
      Animated.parallel([
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Sign selector animation
      Animated.parallel([
        Animated.timing(signsFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(signsSlideAnim, {
          toValue: 0,
          friction: 7,
          tension: 35,
          useNativeDriver: true,
        }),
        Animated.spring(signsScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userZodiacSign = useMemo(() => {
    return onboardingData?.zodiacSign || 'Aries';
  }, [onboardingData?.zodiacSign]);

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSelectSign = useCallback((sign: ZodiacSignItem) => {
    setSelectedSign(sign);
    setModalVisible(false);
    // Navigate to LoveMatch screen with both signs
    navigation.navigate('LoveMatch', {
      yourSign: onboardingData?.zodiacSign || 'Aries',
      theirSign: sign.name,
    });
  }, [navigation, onboardingData?.zodiacSign]);

  const handleAddPartner = useCallback(() => {
    navigation.navigate('AddPartner');
  }, [navigation]);

  const handleDeletePartner = useCallback((partner: Partner) => {
    showWarningAlert(
      'Delete Partner',
      `Are you sure you want to remove ${partner.name} from your connections?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removePartner(partner.id));
          },
        },
      ],
    );
  }, [dispatch, showWarningAlert]);

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
            <Animated.View style={[
              styles.titleContainer,
              {
                opacity: titleFadeAnim,
                transform: [{translateY: titleSlideAnim}],
              }
            ]}>
              <GradientText style={styles.mainTitle}>Cosmic Synastry</GradientText>
            </Animated.View>

            {/* Tab Bar */}
            <Animated.View style={{
              opacity: tabBarFadeAnim,
              transform: [{translateY: tabBarSlideAnim}],
            }}>
              <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
            </Animated.View>

            {/* Subtitle */}
            <Animated.Text style={[
              styles.subtitle,
              {
                opacity: subtitleFadeAnim,
                transform: [{translateY: subtitleSlideAnim}],
              }
            ]}>
              {activeTab === 'quickMatch'
                ? 'Discover the energetic resonance between\nyour sign and others.'
                : 'Add a specific person for a deeply personalized\ncompatibility reading'}
            </Animated.Text>

            {activeTab === 'quickMatch' ? (
              /* Sign Selector Section */
              <Animated.View style={[
                styles.signSelectorContainer,
                {
                  opacity: signsFadeAnim,
                  transform: [
                    {translateY: signsSlideAnim},
                    {scale: signsScaleAnim},
                  ],
                }
              ]}>
                {/* You Sign */}
                <SignCircle type="you" signName={userZodiacSign} />

                {/* Add Line Icon */}
                <View style={styles.addIconContainer}>
                  <AddLineIcon
                    width={moderateScale(24)}
                    height={moderateScale(24)}
                  />
                </View>

                {/* Them Sign */}
                <SignCircle
                  type="them"
                  signName={selectedSign?.name || 'Select Sign'}
                  signId={selectedSign?.id}
                  onPress={handleOpenModal}
                />
              </Animated.View>
            ) : (
              /* Deep Bond Section */
              <Animated.View style={[
                styles.deepBondContainer,
                {
                  opacity: signsFadeAnim,
                  transform: [
                    {translateY: signsSlideAnim},
                    {scale: signsScaleAnim},
                  ],
                }
              ]}>
                {/* Your Connections Header with Add Button */}
                <View style={styles.connectionsHeaderRow}>
                  <Text style={styles.connectionsHeader}>Your Connections</Text>
                  {partners.length > 0 && (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleAddPartner}
                      activeOpacity={0.7}>
                      <AddThemSmallIcon width={moderateScale(24)} height={moderateScale(24)} />
                      <Text style={styles.addButtonText}>ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {partners.length === 0 ? (
                  <>
                    {/* Heart Icon Circle */}
                    <View style={styles.heartIconContainer}>
                      <HeartIcon width={moderateScale(80)} height={moderateScale(80)} />
                    </View>

                    {/* Empty State Text */}
                    <Text style={styles.emptyStateText}>
                      You haven't added any cosmic connections yet.
                    </Text>

                    {/* Add Partner Button */}
                    <TouchableOpacity
                      style={styles.addPartnerButton}
                      onPress={handleAddPartner}
                      activeOpacity={0.7}>
                      <Text style={styles.addPartnerText}>Add a Partner</Text>
                      <AddPartnerIcon width={moderateScale(18)} height={moderateScale(18)} />
                    </TouchableOpacity>
                  </>
                ) : (
                  /* Partner Cards */
                  <View style={styles.partnersList}>
                    {partners.map((partner) => (
                      <View key={partner.id} style={styles.partnerCard}>
                        <View style={styles.partnerAvatar}>
                          <Text style={styles.partnerAvatarText}>
                            {partner.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.partnerInfo}>
                          <Text style={styles.partnerName}>{partner.name}</Text>
                          <Text style={styles.partnerSign}>{partner.zodiacSign.toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeletePartner(partner)}
                          activeOpacity={0.7}>
                          <DeleteIcon width={22} height={22} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </Animated.View>
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Sign Select Modal */}
      <SignSelectModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSelectSign={handleSelectSign}
      />
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
  subtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: 'rgba(194, 209, 243, 1)',
    textAlign: 'center',
    marginTop: verticalScale(24),
    lineHeight: fontScale(20),
  },
  signSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: verticalScale(70),
    paddingHorizontal: horizontalScale(10),
  },
  signCircleContainer: {
    alignItems: 'center',
    width: horizontalScale(130),
  },
  signCircle: {
    width: moderateScale(130),
    height: moderateScale(130),
    borderRadius: radiusScale(100),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  signCircleYou: {
    backgroundColor: 'rgba(238, 223, 155, 0.16)',
    borderColor: 'rgba(221, 197, 96, 1)',
  borderStyle: 'dashed',
  },
  signCircleThem: {
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  signLabel: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.56)',
    marginTop: verticalScale(20),
    letterSpacing: 1,
  },
  signName: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: verticalScale(8),
  },
  addIconContainer: {
    marginTop: moderateScale(48),
    paddingHorizontal: horizontalScale(10),
  },
  // Deep Bond styles
  deepBondContainer: {
    alignItems: 'center',
    marginTop: verticalScale(30),
    width: '100%',
  },
  connectionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: verticalScale(30),
  },
  connectionsHeader: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },
  addButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 1)',
    letterSpacing: 1,
    fontWeight:'700'
  },
  heartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  emptyStateText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.56)',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  addPartnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(27),
    borderRadius: radiusScale(100),
    borderWidth: 1,
    borderColor: 'rgba(221, 197, 96, 1)',
    backgroundColor: 'transparent',
    gap: horizontalScale(8),
  },
  addPartnerText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(16),
    color: 'rgba(221, 197, 96, 1)',
    fontWeight: '600',
  },
  // Partner List styles
  partnersList: {
    width: '100%',
    gap: verticalScale(12),
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderRadius: radiusScale(16),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
  },
  partnerAvatar: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: radiusScale(22),
    backgroundColor: 'rgba(194, 209, 243, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(14),
  },
  partnerAvatarText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  partnerSign: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(12),
    color: 'rgba(221, 197, 96, 1)',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: moderateScale(8),
  },
  deleteIcon: {
    fontSize: fontScale(18),
  },
});

export default LoveScreen;
