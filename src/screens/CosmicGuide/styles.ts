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
    paddingBottom: verticalScale(40),
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  closeButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    // backgroundColor: 'rgba(194, 209, 243, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonCounter: {
    fontFamily: FontFamilies.interBold,
    fontSize: fontScale(11),
    color: '#C2D1F3',
    // letterSpacing: 1,
    fontWeight:'bold'
  },
  headerSpacer: {
    width: moderateScale(40),
  },

  // Title Section
  titleContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  guideTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(32),
    lineHeight: fontScale(38),
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: '#C2D1F3',
    textAlign: 'center',
    marginTop: verticalScale(10),
    fontWeight:'600'
  },

  // Guide Icon Section
  iconSection: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  lessonsCount: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(15),
    color: 'rgba(255, 255, 255, 1)',
    // letterSpacing: 1.5,
    marginTop: verticalScale(13),
    fontWeight:'600'
  },

  // Lesson Card
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    borderRadius: radiusScale(16),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(20),
    marginBottom: verticalScale(15),
  },
  lessonNumberContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(14),
  },
  lessonNumber: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: '#C2D1F3',
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
  },
  lessonReadTime: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(12),
    color: 'rgba(194, 209, 243, 0.56)',
    // letterSpacing: 0.5,
    fontWeight:'600'
  },
  lessonArrow: {
    marginLeft: horizontalScale(12),
  },

  // =====================
  // Lesson Detail Styles
  // =====================

  // Content Card
  contentCard: {
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    borderRadius: radiusScale(24),
    paddingHorizontal: horizontalScale(20),
    paddingVertical:verticalScale(25),
    marginHorizontal: horizontalScale(20),
    marginTop: verticalScale(16),
  },
  mainText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: '#FFFFFF',
    lineHeight: fontScale(30),
    marginBottom: verticalScale(16),
  },
  subText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 1)',
    lineHeight: fontScale(22),
    marginBottom: verticalScale(20),
    
  },

  // Key Takeaway Card
  keyTakeawayCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    borderRadius: radiusScale(24),
    paddingHorizontal: horizontalScale(20),
    paddingVertical:verticalScale(25)
  },
  keyTakeawayLabel: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: 'rgba(125, 211, 252, 1)',
    marginBottom: verticalScale(15),
  },
  keyTakeawayText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 1)',
    lineHeight: fontScale(22),
  },

  // Complete Button
  completeButtonContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(50),
    paddingBottom: verticalScale(40),
  },
  completeButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    borderRadius: radiusScale(50),
    paddingVertical: verticalScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  completeButtonCompleted: {
    backgroundColor: 'rgba(125, 211, 252, 0.36)',
    borderColor: 'rgba(125, 211, 252, 1)',
  },
  completeButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  checkIcon: {
    marginLeft: horizontalScale(8),
  },
  checkIconText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    marginLeft: horizontalScale(8),
  },
});
