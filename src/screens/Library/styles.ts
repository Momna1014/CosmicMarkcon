import { StyleSheet, Dimensions } from 'react-native';
import { Colors, FontFamilies, horizontalScale, verticalScale, moderateScale } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: verticalScale(0),
  },
  
  // Header
  header: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: Colors.text,
  },

  // Tab Bar - Reading at start, Saved in center, Download at end
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(22),
    marginBottom: verticalScale(20),
  },
  tabButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    position: 'relative',
    alignItems: 'center',
  },
  tabButtonActive: {},
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
    paddingHorizontal: horizontalScale(16),
    // flex:1,
    // backgroundColor:'pink'
  },
  sectionTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: Colors.text,
    marginBottom: verticalScale(16),
  },
  columnWrapper: {
    gap: horizontalScale(12),
  },

  // Empty State
  emptyContainer: {
    paddingVertical: verticalScale(270),
    alignItems: 'center',
    justifyContent: 'center',

  },
  emptyText: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.inactive,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  emptySubtext: {
    fontFamily: FontFamilies.outfitRegular,
    fontSize: moderateScale(14),
    color: Colors.inactive,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  // Downloaded Episodes List
  downloadListContainer: {
    gap: verticalScale(12),
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
