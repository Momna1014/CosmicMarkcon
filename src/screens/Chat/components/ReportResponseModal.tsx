import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../../theme';

export type ReportReasonId = 'offensive' | 'misleading' | 'inappropriate';

export interface ReportReason {
  id: ReportReasonId;
  label: string;
  description: string;
  icon: string;
}

const REASONS: ReportReason[] = [
  {
    id: 'offensive',
    label: 'Offensive or harmful',
    description: 'Hate, harassment, or unsafe advice',
    icon: 'alert-octagon-outline',
  },
  {
    id: 'misleading',
    label: 'Misleading or inaccurate',
    description: 'Wrong facts or invented details',
    icon: 'help-circle-outline',
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate content',
    description: 'Adult, graphic, or off-topic',
    icon: 'eye-off-outline',
  },
];

interface ReportResponseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reasons: ReportReasonId[]) => void;
}

const ReportResponseModal: React.FC<ReportResponseModalProps> = memo(
  ({visible, onClose, onSubmit}) => {
    const [selected, setSelected] = useState<ReportReasonId[]>([]);

    const backdropAnim = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;
    const flagBounce = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        setSelected([]);
        Animated.parallel([
          Animated.timing(backdropAnim, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.spring(cardAnim, {
            toValue: 1,
            tension: 70,
            friction: 9,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(150),
            Animated.spring(flagBounce, {
              toValue: 1,
              tension: 120,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        backdropAnim.setValue(0);
        cardAnim.setValue(0);
        flagBounce.setValue(0);
      }
    }, [visible, backdropAnim, cardAnim, flagBounce]);

    const toggleReason = useCallback((id: ReportReasonId) => {
      setSelected(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
      );
    }, []);

    const handleSubmit = useCallback(() => {
      if (selected.length === 0) return;
      onSubmit(selected);
    }, [selected, onSubmit]);

    const cardTransform = useMemo(
      () => ({
        opacity: cardAnim,
        transform: [
          {
            scale: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
          {
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }),
      [cardAnim],
    );

    const flagTransform = useMemo(
      () => ({
        transform: [
          {
            scale: flagBounce.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
          {
            rotate: flagBounce.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: ['-20deg', '8deg', '0deg'],
            }),
          },
        ],
      }),
      [flagBounce],
    );

    const isSubmitDisabled = selected.length === 0;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}>
        <Animated.View style={[styles.backdrop, {opacity: backdropAnim}]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <Animated.View style={[styles.card, cardTransform]}>
            {/* Decorative top accent */}
            <View style={styles.topAccent} />

            <Animated.View style={[styles.flagBadge, flagTransform]}>
              <View style={styles.flagBadgeRing}>
                <MaterialCommunityIcon
                  name="flag-variant"
                  size={moderateScale(28)}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.flagBadgeGlow} />
            </Animated.View>

            <Text style={styles.title}>Report this response</Text>
            <Text style={styles.subtitle}>Why are you reporting this?</Text>
            <Text style={styles.helperText}>Select one or more reasons</Text>

            <View style={styles.reasonsList}>
              {REASONS.map(reason => {
                const isActive = selected.includes(reason.id);
                return (
                  <TouchableOpacity
                    key={reason.id}
                    style={[styles.reasonRow, isActive && styles.reasonRowActive]}
                    activeOpacity={0.85}
                    onPress={() => toggleReason(reason.id)}>
                    <View
                      style={[
                        styles.reasonIconWrap,
                        isActive && styles.reasonIconWrapActive,
                      ]}>
                      <MaterialCommunityIcon
                        name={reason.icon}
                        size={moderateScale(20)}
                        color={
                          isActive ? '#FFFFFF' : 'rgba(194, 209, 243, 0.7)'
                        }
                      />
                    </View>
                    <View style={styles.reasonTextWrap}>
                      <Text
                        style={[
                          styles.reasonLabel,
                          isActive && styles.reasonLabelActive,
                        ]}>
                        {reason.label}
                      </Text>
                      <Text style={styles.reasonDescription}>
                        {reason.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isActive && styles.checkboxActive,
                      ]}>
                      {isActive ? (
                        <MaterialCommunityIcon
                          name="check"
                          size={moderateScale(14)}
                          color="#0A0F1F"
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.85}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitDisabled && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
                activeOpacity={0.85}>
                <MaterialCommunityIcon
                  name="flag-variant"
                  size={moderateScale(15)}
                  color="#0A0F1F"
                />
                <Text style={styles.submitButtonText}>
                  Report{selected.length > 0 ? ` (${selected.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  },
);

ReportResponseModal.displayName = 'ReportResponseModal';

export const REPORT_REASONS = REASONS;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 17, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(24),
  },
  card: {
    width: '100%',
    maxWidth: moderateScale(380),
    backgroundColor: 'rgba(20, 25, 45, 0.98)',
    borderRadius: radiusScale(28),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.18)',
    paddingHorizontal: horizontalScale(22),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(20),
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.45,
        shadowRadius: 30,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: verticalScale(3),
    backgroundColor: 'rgba(194, 209, 243, 0.35)',
    borderBottomLeftRadius: radiusScale(20),
    borderBottomRightRadius: radiusScale(20),
  },
  flagBadge: {
    position: 'absolute',
    top: -moderateScale(34),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBadgeRing: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: 'rgba(35, 42, 70, 1)',
    borderWidth: 2,
    borderColor: 'rgba(194, 209, 243, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  flagBadgeGlow: {
    position: 'absolute',
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: 'rgba(194, 209, 243, 0.18)',
    zIndex: 1,
  },
  title: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(19),
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  subtitle: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.85)',
    textAlign: 'center',
    marginTop: verticalScale(6),
  },
  helperText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(11),
    color: 'rgba(194, 209, 243, 0.5)',
    textAlign: 'center',
    marginTop: verticalScale(4),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  reasonsList: {
    marginTop: verticalScale(18),
    gap: verticalScale(10),
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(12),
    borderRadius: radiusScale(16),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.14)',
    backgroundColor: 'rgba(194, 209, 243, 0.04)',
  },
  reasonRowActive: {
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  reasonIconWrap: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(12),
  },
  reasonIconWrapActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  reasonTextWrap: {
    flex: 1,
    paddingRight: horizontalScale(8),
  },
  reasonLabel: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: verticalScale(2),
  },
  reasonLabelActive: {
    color: '#FFFFFF',
  },
  reasonDescription: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(11.5),
    color: 'rgba(194, 209, 243, 0.55)',
  },
  checkbox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(7),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: horizontalScale(10),
    marginTop: verticalScale(20),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: radiusScale(30),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cancelButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.85)',
  },
  submitButton: {
    flex: 1.2,
    flexDirection: 'row',
    paddingVertical: verticalScale(14),
    borderRadius: radiusScale(30),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(6),
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(14),
    color: '#0A0F1F',
  },
});

export default ReportResponseModal;
