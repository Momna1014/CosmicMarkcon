import {StyleSheet, Dimensions} from 'react-native';
import {
  FontFamilies,
  Colors,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(120),
    paddingTop:moderateScale(30)
  },

  // Glass Card - Transparent with blur
  glassCard: {
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    backgroundColor: 'rgba(194, 209, 243, 0.06)',
  },
  absoluteBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: '#eaf0ff16',
  },

  // Form Styles
  formContent: {
    padding: horizontalScale(20),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(24),
  },
  fieldContainer: {
    marginBottom: verticalScale(20),
  },
  fieldLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: '#C2D1F3',
    letterSpacing: 1.2,
    marginBottom: verticalScale(10),
    fontWeight:'bold'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radiusScale(12),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(4),
    backgroundColor: 'transparent',
  },
  textInput: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(15),
    color: '#FFFFFF',
    paddingVertical: verticalScale(12),
    flex: 1,
  },
  inputFlex: {
    flex: 1,
  },
  inputIcon: {
    fontSize: fontScale(16),
    opacity: 0.5,
    marginLeft: horizontalScale(8),
  },
  inputText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(15),
    color: '#FFFFFF',
    paddingVertical: verticalScale(12),
    flex: 1,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radiusScale(30),
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(12),
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(15),
    color: '#000000',
    marginRight: horizontalScale(8),
  },
  checkIcon: {
    fontSize: fontScale(14),
    color: '#000000',
  },

  // Profile Card Styles
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: horizontalScale(20),
    paddingVertical: verticalScale(20),
  },
  profileIcon: {
    width: horizontalScale(52),
    height: horizontalScale(52),
    borderRadius: horizontalScale(26),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(16),
  },
  profileIconText: {
    fontSize: fontScale(24),
  },
  avatarText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(22),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
    justifyContent:'space-between'
  },
  profileName: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(18),
    color: '#FFFFFF',
    marginRight: horizontalScale(10),
    maxWidth:moderateScale(150)
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacBadge: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(11),
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1.5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: horizontalScale(10),
  },
  locationText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Edit Button
  editButton: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: radiusScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  editButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Saved Souls Section
  savedSoulsSection: {
    marginTop: verticalScale(32),
  },
  savedSoulsTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(18),
    color: '#FFFFFF',
    marginBottom: verticalScale(16),
  },

  // Notification Card Styles
  notificationCard: {
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    backgroundColor: 'rgba(194, 209, 243, 0.06)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: horizontalScale(18),
    paddingVertical: verticalScale(18),
  },
  notificationIconContainer: {
    width: horizontalScale(48),
    height: horizontalScale(48),
    borderRadius: horizontalScale(24),
    backgroundColor: 'rgba(194, 209, 243, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(14),
  },
  notificationIconText: {
    fontSize: fontScale(22),
    color:'white'
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
  },
  notificationSubtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Premium Card Styles
  premiumCard: {
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    backgroundColor: 'rgba(194, 209, 243, 0.06)',
  },
  premiumCardActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: horizontalScale(18),
    paddingVertical: verticalScale(18),
  },
  premiumIconContainer: {
    width: horizontalScale(48),
    height: horizontalScale(48),
    borderRadius: horizontalScale(24),
    backgroundColor: 'rgba(194, 209, 243, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(14),
  },
  premiumIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
  },
  premiumTitleActive: {
    color: '#FFFFFF',
  },
  premiumSubtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(255, 255, 255, 0.6)',
  },
  premiumButton: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    borderRadius: radiusScale(20),
    backgroundColor: '#FFFFFF',
  },
  premiumButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(13),
    color: '#0A1628',
  },
  premiumBadge: {
    width: horizontalScale(32),
    height: horizontalScale(32),
    borderRadius: horizontalScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadgeText: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Section Heading
  sectionHeading: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: 'rgba(194, 209, 243, 0.55)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(10),
    marginLeft: horizontalScale(4),
  },

  // Legal Card Styles
  legalCard: {
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    backgroundColor: 'rgba(194, 209, 243, 0.06)',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(16),
  },
  legalRowIconContainer: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(20),
    backgroundColor: 'rgba(194, 209, 243, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(14),
  },
  legalRowEmoji: {
    fontSize: fontScale(18),
  },
  legalRowTextContainer: {
    flex: 1,
  },
  legalRowTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(15),
    color: '#FFFFFF',
    marginBottom: verticalScale(2),
  },
  legalRowSubtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(12),
    color: 'rgba(255, 255, 255, 0.5)',
  },
  legalRowArrow: {
    opacity: 0.5,
    marginLeft: horizontalScale(8),
  },
  legalDivider: {
    height: 1,
    marginHorizontal: horizontalScale(18),
    backgroundColor: 'rgba(194, 209, 243, 0.12)',
  },
});
