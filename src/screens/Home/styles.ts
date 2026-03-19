import {StyleSheet, Dimensions} from 'react-native';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Background & Container
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
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(120),
    top:moderateScale(10)
  },

  // Welcome Section
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  welcomeIcon: {
    width: horizontalScale(16),
    height: horizontalScale(16),
    marginRight: horizontalScale(6),
  },
  welcomeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(16),
    color: '#C2D1F3',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight:'bold'
  },
  welcomeName: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(16),
    color: '#C2D1F3',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight:'bold',
    marginLeft: horizontalScale(4),
  },

  // Title Section
  titleSection: {
    marginTop: verticalScale(15),
    marginBottom: verticalScale(20),
  },
  mainTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(36),
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  // Daily Energy Card
  dailyEnergyCard: {
    borderRadius: radiusScale(36),
    overflow: 'hidden',
    marginBottom: verticalScale(24),
    borderWidth:1,
    borderColor:'#C2D1F333'

  },
  dailyEnergyBackground: {
    width: '100%',
    borderRadius: radiusScale(36),
    overflow: 'hidden',
    // backgroundColor:'red'

  },
  dailyEnergyContent: {
    padding: horizontalScale(20),
    paddingVertical: verticalScale(20),
  },
  dailyEnergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  dailyEnergyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderColor:'#C2D1F329',
    borderRadius:radiusScale(100),
    paddingHorizontal:moderateScale(10),
    paddingVertical:verticalScale(5)
  },
  dailyMoonIcon: {
    // width: horizontalScale(18),
    // height: horizontalScale(18),
    marginRight: horizontalScale(8),
  },
  dailyEnergyLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(12),
    color: '#C2D1F3',
    // letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight:'bold'
  },
  zodiacBadge: {
    // backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radiusScale(12),
  },
  zodiacText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    // letterSpacing: 1.2,
  },
  dailyEnergyMessage: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    lineHeight: fontScale(32),
    marginBottom: verticalScale(16),
  },
  readHoroscopeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readHoroscopeText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(12),
    color: '#FBBF24',
    // letterSpacing: 0.5,
    marginRight: horizontalScale(8),
    fontWeight:'700'
  },
  readHoroscopeIcon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
  },

  // Today's Transits Section
  sectionContainer: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    marginBottom: verticalScale(16),
  },
  transitsScrollView: {
    marginHorizontal: horizontalScale(-20),
    paddingHorizontal: horizontalScale(20),
  },
  transitsContainer: {
    flexDirection: 'row',
    gap: horizontalScale(16),
  },
  transitItem: {
    alignItems: 'center',
    // width: horizontalScale(65),
    marginHorizontal:moderateScale(5)
  },
  transitIconContainer: {
    // width: horizontalScale(52),
    // height: horizontalScale(52),
    // borderRadius: horizontalScale(26),
    // backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(15),

  },
  transitIcon: {
    // width: horizontalScale(24),
    // height: horizontalScale(24),
  },
  transitName: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(7),
  },
  transitSubtext: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(12),
    color: '#C2D1F3',
    textAlign: 'center',
  },

  // Feature Cards (Synastry & Chiromancy)
  featureCardsContainer: {
    flexDirection: 'row',
    gap: horizontalScale(12),
    marginBottom: verticalScale(24),
  },
  featureCard: {
    flex: 1,
    borderRadius: radiusScale(24),
    overflow: 'hidden',
    // height: verticalScale(150),
    borderWidth: 1.5,
    borderColor: '#C2D1F333',
  },
  featureCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  featureCardContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: horizontalScale(20),
    paddingVertical:verticalScale(15)
  },
  featureCardIcon: {
    width: horizontalScale(28),
    height: horizontalScale(28),
    marginBottom: verticalScale(8),
  },
  featureCardTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: verticalScale(6),
    marginTop:verticalScale(29)
  },
  featureCardSubtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: '#C2D1F3',
    textAlign: 'left',
    textTransform: 'uppercase',
    fontWeight:'700'
    // letterSpacing: 0.5,
  },

  // Cosmic Guides Section
  cosmicGuidesContainer: {
    gap: verticalScale(12),
  },
  guideCard: {
    borderRadius: radiusScale(16),
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: '#C2D1F333',
  },
  guideCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  guideIconContainer: {
    // width: horizontalScale(40),
    // height: horizontalScale(40),
    // borderRadius: horizontalScale(20),
    // backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(14),
  },
  guideIcon: {
    width: horizontalScale(22),
    height: horizontalScale(22),
  },
  guideTextContainer: {
    flex: 1,
  },
  guideTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(16),
    color: '#FFFFFF',
  },
  guideArrow: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    opacity: 0.5,
  },

  // Additional utility styles
  flexOne: {
    flex: 1,
  },
  featureCardImageStyle: {
    borderRadius: radiusScale(24),
  },
  dailyEnergyImageStyle: {
    borderRadius: radiusScale(36),
  },
});

// Transit icon colors for gradient effect
export const TRANSIT_COLORS = {
  mercury: '#FFE4B5',
  venus: '#E6C3A5',
  mars: '#FF6B6B',
  jupiter: '#FFD700',
  saturn: '#C9B037',
  uranus: '#87CEEB',
  neptune: '#9370DB',
  pluto: '#DDA0DD',
};

// Guide icon background colors
export const GUIDE_ICON_COLORS = {
  understanding_transit: 'rgba(255, 200, 87, 0.15)',
  moon_phases: 'rgba(157, 192, 255, 0.15)',
  retrograde: 'rgba(255, 107, 107, 0.15)',
  human_design: 'rgba(255, 215, 0, 0.15)',
};
