import { StyleSheet, Dimensions } from 'react-native';
import { Colors, FontFamilies, horizontalScale, verticalScale, moderateScale, BorderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: verticalScale(10),
  },

  // Header Section
  headerSection: {
    position: 'relative',
    // backgroundColor:'red',
    // bottom:10
  },
  backButton: {
    position: 'absolute',
    top: verticalScale(16),
    left: horizontalScale(16),
    zIndex: 10,
    width: horizontalScale(40),
    height: horizontalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcons: {
    position: 'absolute',
    top: verticalScale(19),
    right: horizontalScale(8),
    zIndex: 10,
    alignItems: 'center',
    gap: verticalScale(12),
  },
  iconButton: {
    width: horizontalScale(43),
    height: horizontalScale(43),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#1E1E21'
  },

  // Cover Image
  coverImageContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(20),
    position: 'relative',
  },
  coverImage: {
    width: moderateScale(260),
    height: moderateScale(392),
    // borderRadius: BorderRadius.lg,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(220),
  },

  // Badge - Positioned over the image
  badgeContainer: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: horizontalScale(16),
    zIndex: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CE3B2',
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(6),
    // borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: Colors.black,
  },

  // Title Section
  titleSection: {
    paddingHorizontal: horizontalScale(16),
    // marginTop: verticalScale(12),
    bottom:moderateScale(15)
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(25),
    fontWeight: '700',
    color: Colors.text,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    marginTop: verticalScale(0),
    gap: horizontalScale(18),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(7),
  },
  statText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: Colors.text,
  },

  // Reading Button
  readingButtonContainer: {
    paddingHorizontal: horizontalScale(16),
    marginTop: verticalScale(20),
  },
  readingButton: {
    backgroundColor: '#FF3E57',
    paddingVertical: verticalScale(14),
    // borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingButtonText: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.black,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(30),
    marginTop: verticalScale(24),
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    position: 'relative',
    alignItems: 'center',
  },
  tabButtonText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.inactive,
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: Colors.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: horizontalScale(-8),
    right: horizontalScale(-8),
    height: 2,
    backgroundColor: Colors.light_blue,
  },

  // Tab Content
  tabContent: {
    // paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(20),
  },

  // ========== CHAPTERS TAB ==========
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  latestChaptersTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.text,
  },
  downloadAllText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#2DD4BF',
  },
  chapterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: verticalScale(16),
    gap: horizontalScale(8),
  },
  chapterDropdownText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: Colors.text,
  },
  episodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeLabel: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(12),
    color: Colors.inactive,
    marginBottom: verticalScale(4),
  },
  episodeTitle: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: Colors.text,
  },

  // ========== ABOUT TAB ==========
  synopsisTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: verticalScale(12),
  },
  synopsisText: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(14),
    color: Colors.text,
    lineHeight: moderateScale(22),
  },
  readMoreText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#2DD4BF',
    marginTop: verticalScale(8),
  },
  aboutStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: verticalScale(24),
    paddingTop: verticalScale(24),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  aboutStatItem: {
    alignItems: 'center',
  },
  aboutStatLabel: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(12),
    color: Colors.inactive,
    marginBottom: verticalScale(4),
  },
  aboutStatValue: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.text,
  },
  aboutStatValueTeal: {
    color: '#2DD4BF',
  },

  // ========== REVIEWS TAB ==========
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  userReviewsTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.text,
  },
  viewAllText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#2DD4BF',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.base,
    padding: horizontalScale(16),
    marginBottom: verticalScale(12),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  reviewUsername: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: Colors.text,
  },
  reviewTime: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(12),
    color: Colors.inactive,
  },
  reviewText: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(14),
    color: Colors.text,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },
  reviewLikes: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(13),
    color: Colors.inactive,
  },
});

export const useStyles = () => {
  return createStyles();
};

export default createStyles;
