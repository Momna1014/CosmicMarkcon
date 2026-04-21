import {StyleSheet, Dimensions} from 'react-native';
import {
  FontFamilies,
  Colors,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    paddingHorizontal: horizontalScale(24),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(36),
    color: '#D4AF37',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.7)',
    textAlign: 'center',
  },

  // Center orb area
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainOrb: {
    width: SCREEN_WIDTH * 0.38,
    height: SCREEN_WIDTH * 0.38,
    borderRadius: SCREEN_WIDTH * 0.19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(221, 197, 96, 0.3)',
  },
  orbGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(221, 197, 96, 0.12)',
  },
  orbInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacSymbol: {
    fontFamily: FontFamilies.interLight,
    fontSize: fontScale(22),
    color: 'rgba(194, 209, 243, 0.8)',
    marginTop: verticalScale(4),
  },

  // Info Card
  infoCard: {
    marginHorizontal: horizontalScale(20),
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.15)',
    backgroundColor: 'rgba(194, 209, 243, 0.06)',
    padding: horizontalScale(20),
    paddingVertical: verticalScale(20),
  },
  cardGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 22, 40, 0.3)',
    borderRadius: radiusScale(20),
  },
  cardGreeting: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(18),
    color: '#EEDF9B',
    marginBottom: verticalScale(8),
  },
  cardDescription: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: fontScale(20),
    marginBottom: verticalScale(14),
  },

  // Feature pills
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radiusScale(20),
    borderWidth: 1,
    borderColor: 'rgba(221, 197, 96, 0.3)',
    backgroundColor: 'rgba(221, 197, 96, 0.08)',
  },
  pillText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(11),
    color: '#DDC560',
    letterSpacing: 0.5,
  },

  // Start Button
  buttonContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(100),
    paddingTop: verticalScale(16),
  },
  startButton: {
    borderRadius: radiusScale(16),
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DDC560',
    backgroundColor: 'rgba(221, 197, 96, 0.08)',
    elevation: 8,
    shadowColor: '#DDC560',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(221, 197, 96, 0.06)',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    gap: 10,
  },
  buttonText: {
    fontFamily: FontFamilies.interBold,
    fontSize: fontScale(16),
    color: '#DDC560',
    letterSpacing: 1,
  },
  buttonArrow: {
    fontSize: fontScale(18),
    color: '#DDC560',
    marginLeft: 4,
  },
});
