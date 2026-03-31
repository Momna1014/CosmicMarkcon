import React, {memo} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import {TransitData} from './types';
import CrossIcon from '../../assets/icons/home_icons/cross.svg';

interface TransitDetailModalProps {
  visible: boolean;
  transit: TransitData | null;
  onClose: () => void;
}

const TransitDetailModal: React.FC<TransitDetailModalProps> = memo(
  ({visible, transit, onClose}) => {
    if (!transit) return null;

    const IconComponent = transit.Icon;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.85)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBlur]} />
        )}

        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <CrossIcon
                width={moderateScale(28)}
                height={moderateScale(28)}
                // fill="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>

            {/* Icon Container */}
            <View style={styles.iconWrapper}>
              <View
                style={[
                  styles.iconBackground,
                //   {backgroundColor: `${transit.color}20`},
                ]}>
                <IconComponent
                  width={moderateScale(56)}
                  height={moderateScale(56)}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{transit.name}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{transit.subtext.toUpperCase()}</Text>

            {/* Description */}
            <Text style={styles.description}>{transit.description}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

TransitDetailModal.displayName = 'TransitDetailModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalContainer: {
    width: '100%',
    // maxWidth: moderateScale(320),
    backgroundColor: 'rgba(8, 20, 42, 1)',
    borderRadius: moderateScale(36),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(24),
    paddingHorizontal: horizontalScale(20),
    alignItems: 'flex-start',
    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 2,
    // Border
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: moderateScale(20),
    right: moderateScale(20),
    zIndex: 10,
    padding: moderateScale(4),
    opacity: 0.6,
  },
  iconWrapper: {
    marginBottom: verticalScale(16),
  },
  iconBackground: {
    // width: moderateScale(56),
    // height: moderateScale(56),
    // borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: moderateScale(24),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: moderateScale(14),
    color: 'rgba(194, 209, 243, 1)',
    letterSpacing: 0.5,
    marginBottom: verticalScale(12),
  },
  description: {
    fontFamily: FontFamilies.interRegular,
    fontSize: moderateScale(16),
    color: 'rgba(255, 255, 255, 1)',
    lineHeight: moderateScale(22),
  },
});

export default TransitDetailModal;
