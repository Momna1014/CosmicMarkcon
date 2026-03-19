import {StyleSheet} from 'react-native';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';

export const styles = StyleSheet.create({
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

  // Date Badge
  dateBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(194, 209, 243, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.16)',
    borderRadius: radiusScale(20),
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(6),
    marginTop: verticalScale(10),
  },
  dateText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginTop: verticalScale(22),
    marginBottom: verticalScale(8),
  },
  mainTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(40),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: verticalScale(4),
  },
  seekerText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(40),
    textAlign: 'center',
  },

  // Zodiac Badge
  zodiacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(194, 209, 243, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.16)',
    borderRadius: radiusScale(20),
    paddingHorizontal: horizontalScale(17),
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(12),
    gap: horizontalScale(6),
  },
  zodiacIcon: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
  },
  zodiacText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderRadius: radiusScale(100),
    paddingHorizontal: moderateScale(6),
    paddingVertical:verticalScale(6),
    marginTop: verticalScale(30),
    marginBottom: verticalScale(4),
    borderWidth:1,
    borderColor:'rgba(194, 209, 243, 0.2)'
  },
  tabItem: {
    flex: 1,
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    borderRadius: radiusScale(100),
  },
  tabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  tabText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(12),
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#000000',
  },

  // Cosmic Overview Card - Special styling
  cosmicOverviewCard: {
    // backgroundColor: 'rgba(255, 165, 0, 0.08)',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 165, 0, 0.25)',
    borderRadius: radiusScale(16),
    padding: moderateScale(16),
    marginTop: verticalScale(16),
  },
  cosmicOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(12),
    marginBottom: verticalScale(14),
  },
  cosmicOverviewIconWrapper: {
    // width: moderateScale(32),
    // height: moderateScale(32),
    // // backgroundColor: 'rgba(255, 165, 0, 0.2)',
    // borderRadius: radiusScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cosmicOverviewTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: 'rgba(255, 165, 0, 1)',
    fontWeight: '600',
  },
  cosmicOverviewDescription: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: 'rgba(255, 255, 255, 1)',
    lineHeight: fontScale(20),
    fontWeight: '400',
  },

  // Section Card
  sectionCard: {
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    borderRadius: radiusScale(28),
    paddingHorizontal: moderateScale(20),
    marginTop: verticalScale(20),
    paddingVertical:verticalScale(25)
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    marginBottom: verticalScale(15),
  },
  sectionIconWrapper: {
    // width: moderateScale(28),
    // height: moderateScale(28),
    // borderRadius: radiusScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    fontWeight: '600',
  },
  sectionDescription: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: 'rgba(255, 255, 255, 1)',
    lineHeight: fontScale(20),
    fontWeight: '400',
  },

  // Lucky Elements Section
  luckyElementsTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: verticalScale(30),
    marginBottom: verticalScale(17),
    fontWeight: '600',
  },
  luckyElementsRow: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  luckyElementCard: {
    flex: 1,
    borderRadius: radiusScale(24),
    overflow: 'hidden',
    borderWidth: 1,
    // height: verticalScale(120),
    // paddingVertical:20
  },
  luckyElementBackground: {
    flex: 1,
    padding: moderateScale(12),
    justifyContent: 'flex-end',
    // backgroundColor:'red'
    paddingVertical:verticalScale(30),
    // borderWidth:2
  },
  luckyElementTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(15),
  },
  luckyElementList: {
    gap: verticalScale(7),
  },
  luckyElementItem: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginLeft:horizontalScale(5)
  },
  bulletPoint: {
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Celestial Alignment Section
  celestialTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: verticalScale(30),
    marginBottom: verticalScale(17),
    fontWeight: '600',
  },
  celestialRow: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  celestialCard: {
    flex: 1,
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.16)',
    borderRadius: radiusScale(24),
    padding: moderateScale(12),
    paddingVertical: verticalScale(26),
    alignItems: 'center',
  },
  celestialIconWrapper: {
    marginBottom: verticalScale(10),
  },
  celestialLabel: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: verticalScale(10),
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  celestialValue: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
