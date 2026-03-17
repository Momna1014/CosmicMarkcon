import {StyleSheet, Dimensions} from 'react-native';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  backgroundImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
  },
  header: {
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(24),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(32),
    color: '#D4AF37',
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Glass Card - Transparent with blur
  glassCard: {
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  absoluteBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eaf0ff16',
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
    backgroundColor: 'rgba(100, 140, 200, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(16),
  },
  profileIconText: {
    fontSize: fontScale(24),
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(18),
    color: '#FFFFFF',
    marginBottom: verticalScale(6),
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacBadge: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(11),
    color: '#D4AF37',
    letterSpacing: 1.5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
    marginHorizontal: horizontalScale(10),
  },
  locationText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(255, 255, 255, 0.6)',
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
});
