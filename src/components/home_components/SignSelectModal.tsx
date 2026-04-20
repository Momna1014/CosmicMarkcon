import React, {memo, useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import {useSelector} from 'react-redux';
import {selectPartners, Partner} from '../../redux/slices/partnersSlice';
import {BlurView} from '@react-native-community/blur';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';

// Import zodiac sign SVGs
import GeminisIcon from '../../assets/icons/horoscope_icons/geminis.svg';
import TauroIcon from '../../assets/icons/horoscope_icons/tauro.svg';
import AriesIcon from '../../assets/icons/horoscope_icons/aries.svg';
import CancerIcon from '../../assets/icons/horoscope_icons/cancer.svg';
import CapricornioIcon from '../../assets/icons/horoscope_icons/capricornio.svg';
import VirgoIcon from '../../assets/icons/horoscope_icons/virgo.svg';
import PiscisIcon from '../../assets/icons/horoscope_icons/piscis.svg';
import AcuarioIcon from '../../assets/icons/horoscope_icons/acuario.svg';
import EscorpioIcon from '../../assets/icons/horoscope_icons/escorpio.svg';
import SagitarioIcon from '../../assets/icons/horoscope_icons/sagitario.svg';
import LeoIcon from '../../assets/icons/horoscope_icons/leo.svg';
import LibraIcon from '../../assets/icons/horoscope_icons/libra.svg';

export interface ZodiacSignItem {
  id: string;
  name: string;
  displayName: string;
}

// Zodiac signs data
const ZODIAC_SIGNS: ZodiacSignItem[] = [
  {id: 'gemini', name: 'Gemini', displayName: 'Gemini'},
  {id: 'taurus', name: 'Taurus', displayName: 'Taurus'},
  {id: 'aries', name: 'Aries', displayName: 'Aries'},
  {id: 'cancer', name: 'Cancer', displayName: 'Cancer'},
  {id: 'capricorn', name: 'Capricorn', displayName: 'Capricorn'},
  {id: 'virgo', name: 'Virgo', displayName: 'Virgo'},
  {id: 'pisces', name: 'Pisces', displayName: 'Pisces'},
  {id: 'aquarius', name: 'Aquarius', displayName: 'Aquarius'},
  {id: 'scorpio', name: 'Scorpio', displayName: 'Scorpio'},
  {id: 'sagittarius', name: 'Sagittarius', displayName: 'Sagittarius'},
  {id: 'leo', name: 'Leo', displayName: 'Leo'},
  {id: 'libra', name: 'Libra', displayName: 'Libra'},
];

// Icon size
const ICON_SIZE = moderateScale(64);

// Get zodiac icon component
const getZodiacIcon = (id: string): React.ReactElement | null => {
  const props = {width: ICON_SIZE, height: ICON_SIZE};

  switch (id) {
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
      return null;
  }
};

interface SignSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSign: (sign: ZodiacSignItem) => void;
}

// Zodiac sign item component
const ZodiacSignItemComponent = memo(
  ({
    item,
    onSelect,
  }: {
    item: ZodiacSignItem;
    onSelect: (sign: ZodiacSignItem) => void;
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.85,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [scaleValue, opacityValue]);

    const handlePressOut = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [scaleValue, opacityValue]);

    const handlePress = useCallback(() => {
      onSelect(item);
    }, [item, onSelect]);

    return (
      <TouchableOpacity
        style={styles.signItem}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <Animated.View
          style={[
            styles.signIconContainer,
            {transform: [{scale: scaleValue}], opacity: opacityValue},
          ]}>
          {getZodiacIcon(item.id)}
        </Animated.View>
        <Text style={styles.signName}>{item.displayName}</Text>
      </TouchableOpacity>
    );
  },
);

// Connection grid item — same layout as zodiac sign items (icon + name + sign)
const ConnectionGridItem = memo(
  ({
    partner,
    onSelect,
  }: {
    partner: Partner;
    onSelect: (sign: ZodiacSignItem) => void;
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.85,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [scaleValue, opacityValue]);

    const handlePressOut = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [scaleValue, opacityValue]);

    const handlePress = useCallback(() => {
      const signId = partner.zodiacSign.toLowerCase();
      onSelect({
        id: signId,
        name: partner.zodiacSign,
        displayName: partner.zodiacSign,
      });
    }, [partner, onSelect]);

    const signId = partner.zodiacSign.toLowerCase();

    return (
      <TouchableOpacity
        style={styles.signItem}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <Animated.View
          style={[
            styles.signIconContainer,
            {transform: [{scale: scaleValue}], opacity: opacityValue},
          ]}>
          {getZodiacIcon(signId)}
        </Animated.View>
        <Text style={styles.connectionItemName} numberOfLines={1}>{partner.name}</Text>
        <Text style={styles.connectionItemSign}>{partner.zodiacSign}</Text>
      </TouchableOpacity>
    );
  },
);

type ModalTab = 'signs' | 'connections';

const SignSelectModal: React.FC<SignSelectModalProps> = memo(
  ({visible, onClose, onSelectSign}) => {
    const partners = useSelector(selectPartners);
    const [activeTab, setActiveTab] = useState<ModalTab>('signs');
    const tabSlideAnim = useRef(new Animated.Value(0)).current;

    const hasConnections = partners.length > 0;

    const handleTabPress = useCallback((tab: ModalTab) => {
      setActiveTab(tab);
      Animated.spring(tabSlideAnim, {
        toValue: tab === 'signs' ? 0 : 1,
        useNativeDriver: false,
        speed: 15,
        bounciness: 8,
      }).start();
    }, [tabSlideAnim]);

    const tabIndicatorLeft = tabSlideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '50%'],
    });

    const renderSignItem = useCallback(
      ({item}: {item: ZodiacSignItem}) => (
        <ZodiacSignItemComponent item={item} onSelect={onSelectSign} />
      ),
      [onSelectSign],
    );

    const renderConnectionItem = useCallback(
      ({item}: {item: Partner}) => (
        <ConnectionGridItem partner={item} onSelect={onSelectSign} />
      ),
      [onSelectSign],
    );

    const signKeyExtractor = useCallback(
      (item: ZodiacSignItem) => item.id,
      [],
    );

    const connectionKeyExtractor = useCallback(
      (item: Partner) => item.id,
      [],
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.9)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBlur]} />
        )}
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Select a Sign</Text>
                <Text style={styles.subtitle}>READ FOR SOMEONE ELSE</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Bar — only shown when user has connections */}
            {hasConnections && (
              <View style={styles.modalTabBar}>
                <Animated.View
                  style={[styles.modalTabIndicator, {left: tabIndicatorLeft}]}
                />
                <TouchableOpacity
                  style={styles.modalTabItem}
                  onPress={() => handleTabPress('signs')}
                  activeOpacity={0.7}>
                  <Text style={[
                    styles.modalTabText,
                    activeTab === 'signs' && styles.modalTabTextActive,
                  ]}>
                    Signs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalTabItem}
                  onPress={() => handleTabPress('connections')}
                  activeOpacity={0.7}>
                  <Text style={[
                    styles.modalTabText,
                    activeTab === 'connections' && styles.modalTabTextActive,
                  ]}>
                    Connections
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tab Content — scrollable, fixed height from modal */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContainer}
              style={styles.gridScroll}>
              {activeTab === 'signs' ? (
                <FlatList
                  data={ZODIAC_SIGNS}
                  renderItem={renderSignItem}
                  keyExtractor={signKeyExtractor}
                  numColumns={3}
                  columnWrapperStyle={styles.row}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              ) : (
                <FlatList
                  data={partners}
                  renderItem={renderConnectionItem}
                  keyExtractor={connectionKeyExtractor}
                  numColumns={3}
                  columnWrapperStyle={styles.rowLeft}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.17)',
    borderRadius: radiusScale(36),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(20),
    width: '90%',
    maxWidth: horizontalScale(380),
    height:"70%"
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 1)',
    marginTop: verticalScale(6),
    letterSpacing: 1,
  },
  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: radiusScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fontScale(16),
    color: 'rgba(255, 255, 255, 0.6)',
  },
  gridScroll: {
    flex: 1,
  },
  gridContainer: {
    paddingBottom: verticalScale(10),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  rowLeft: {
    justifyContent: 'flex-start',
    marginBottom: verticalScale(10),
  },
  signItem: {
    alignItems: 'center',
    width: '33.33%',
  },
  signIconContainer: {
    // width: moderateScale(75),
    height: moderateScale(85),
    // backgroundColor: 'rgba(194, 209, 243, 0.08)',
    // borderRadius: radiusScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: verticalScale(),
  },
  signName: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(193, 171, 117, 1)',
    textAlign: 'center',
  },
  // Modal tab bar
  modalTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderRadius: radiusScale(100),
    padding: moderateScale(4),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.15)',
    position: 'relative',
  },
  modalTabIndicator: {
    position: 'absolute',
    top: moderateScale(4),
    bottom: moderateScale(4),
    width: '48%',
    backgroundColor: 'rgba(221, 197, 96, 0.25)',
    borderRadius: radiusScale(100),
    borderWidth: 1,
    borderColor: 'rgba(221, 197, 96, 0.4)',
    marginLeft: moderateScale(4),
  },
  modalTabItem: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: radiusScale(100),
    zIndex: 1,
  },
  modalTabText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: 'rgba(194, 209, 243, 0.5)',
    fontWeight: '600',
  },
  modalTabTextActive: {
    color: '#FFFFFF',
  },
  // Connection grid item styles (matching sign items)
  connectionItemName: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: moderateScale(85),
  },
  connectionItemSign: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(11),
    color: 'rgba(193, 171, 117, 1)',
    textAlign: 'center',
    marginTop: verticalScale(2),
  },
});

export default SignSelectModal;
export {ZODIAC_SIGNS, getZodiacIcon};
