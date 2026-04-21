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
  starsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    opacity: 0.5,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(24),
  },

  // Guided by the stars badge
  badgeContainer: {
    marginTop: verticalScale(50),
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: radiusScale(100),
    backgroundColor: 'rgba(194, 209, 243, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
  },
  badgeStarIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
    tintColor: 'rgba(194, 209, 243, 0.8)',
  },
  badgeText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: 'rgba(194, 209, 243, 0.8)',
    letterSpacing: 1,
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    // marginBottom: verticalScale(28),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(36),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.7)',
    textAlign: 'center',
  },

  // Start Button
  buttonContainer: {
    width: '100%',
    paddingBottom: verticalScale(90),
  },
  startButton: {
    borderRadius: radiusScale(100),
    backgroundColor: '#F5F2EA',
    overflow: 'hidden',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    gap: 10,
  },
  buttonStarIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    tintColor: '#000000',
  },
  buttonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(16),
    color: '#000000',
    letterSpacing: 0.5,
    fontWeight:'700'
  },
});
