import { StyleSheet, Dimensions } from 'react-native';
import { Colors, FontFamilies, horizontalScale, verticalScale, moderateScale, BorderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SPACING = horizontalScale(8);
const CARD_WIDTH = (SCREEN_WIDTH - horizontalScale(30) - (CARD_SPACING * 2)) / 3;

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    // borderBottomWidth: 1,
    // borderBottomColor: 'pink',
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor:'pink'
  },
  backIcon: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(36),
    color: Colors.text,
    fontWeight: '500',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(0),
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: CARD_SPACING,
    marginBottom: verticalScale(16),
  },
  mangaCard: {
    width: CARD_WIDTH,
  },
  mangaImage: {
    width: CARD_WIDTH,
    height: verticalScale(180),
    // borderRadius: BorderRadius.sm,
    // backgroundColor: Colors.cardBackground,
  },
  mangaTitle: {
    fontFamily: FontFamilies.montserratSemiBold,
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: Colors.text,
    marginTop: verticalScale(8),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  ratingText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: Colors.ratingText,
    marginLeft: horizontalScale(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(32),
  },
  emptyTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: Colors.inactive,
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
});

/**
 * Hook to get styles
 * Usage: const styles = useStyles();
 */
export const useStyles = () => {
  return createStyles();
};

export default createStyles;
