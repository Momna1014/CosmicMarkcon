import { StyleSheet } from 'react-native';
import { Colors, FontFamilies, horizontalScale, verticalScale, moderateScale, BorderRadius } from '../../theme';

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(20),
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: Colors.text,
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: moderateScale(16),
    fontWeight: '400',
    color: Colors.inactive,
    lineHeight: moderateScale(20),
    letterSpacing: 0,
  },
  contentContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(100),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  categoryCard: {
    width: '48%',
    height: verticalScale(97),
    backgroundColor: Colors.cardBackground,
    // borderRadius: BorderRadius.base,
    padding: horizontalScale(16),
    position: 'relative',
  },
  categoryName: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(18),
    fontWeight: '500',
    color: Colors.text,
    position: 'absolute',
    bottom: horizontalScale(16),
    left: horizontalScale(16),
  },
  categoryIcon: {
    position: 'absolute',
    top: horizontalScale(16),
    right: horizontalScale(16),
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
