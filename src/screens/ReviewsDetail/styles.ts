import { StyleSheet, Dimensions } from 'react-native';
import { Colors, FontFamilies, horizontalScale, verticalScale, moderateScale, BorderRadius, fontScale } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: verticalScale(100),
  },

  // Header
  header: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: horizontalScale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: horizontalScale(4),
  },
  headerTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: moderateScale(14),
    color: Colors.inactive,
    marginTop: verticalScale(2),
    marginLeft: horizontalScale(44), // Align with title (backButton width + margin)
  },

  // Reviews List
  reviewsContainer: {
    paddingBottom: verticalScale(16),
  },
  reviewCard: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(8),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  reviewUsername: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: fontScale(16),
    fontWeight: '700',
    color: Colors.text,
  },
  reviewTime: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: fontScale(14),
    color: Colors.inactive,
  },
  reviewText: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: fontScale(16),
    color: Colors.light_gray,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  reviewFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(8),
    marginLeft: horizontalScale(-8),
    marginVertical: verticalScale(-8),
  },
  deleteButton: {
    padding: moderateScale(4),
  },
  reviewLikes: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: moderateScale(14),
    color: Colors.inactive,
  },
  reviewLikesActive: {
    color: '#FF4757',
  },

  // Comment Input
  commentInputWrapper: {
    backgroundColor: Colors.background,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Colors.background,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    // borderRadius: BorderRadius.sm,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(15),
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: fontScale(16),
    color: Colors.text,
    marginRight: horizontalScale(12),
    borderWidth:1,
    borderColor:"#2A2A2C"
  },
  postButton: {
    backgroundColor: Colors.light_blue,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    // borderRadius: BorderRadius.sm,
  },
  postButtonText: {
    fontFamily: FontFamilies.sfProDisplayBold,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.black,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(32),
    paddingVertical: verticalScale(60),
    // backgroundColor:'red'
  },
  emptyText: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: fontScale(16),
    color: Colors.inactive,
    textAlign: 'center',
  },
});

export const useStyles = () => {
  return createStyles();
};

export default createStyles;
