import { Platform, StyleSheet } from 'react-native';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
  BorderRadius,
} from '../../theme';

const createStyles = () =>
  StyleSheet.create({
    // Container
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: verticalScale(24),
      paddingBottom: verticalScale(0),
    },

    // Header
    title: {
      fontFamily: FontFamilies.jetBrainsMonoBold,
      fontSize: moderateScale(24),
      fontWeight: '700',
      color: Colors.text,
      marginBottom: verticalScale(5),
      paddingHorizontal: horizontalScale(16),
    },

    // Premium Card
    premiumCardContainer: {
      marginBottom: Platform.OS==='ios' ? verticalScale(32):null,
      // paddingHorizontal: horizontalScale(6),
    },
        premiumCardContainerAndroid: {
      marginBottom: verticalScale(10),
      paddingHorizontal: horizontalScale(15),
    },
    premiumCard: {
      // borderRadius: BorderRadius.base,
      paddingVertical: verticalScale(16),
      paddingHorizontal: horizontalScale(16),
      marginBottom:moderateScale(8)
    },
    
    premiumContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      // backgroundColor:'red',
      // padding:
    },
    premiumIconContainer: {
      marginRight: horizontalScale(12),
      marginTop: verticalScale(2),
    },
    premiumTextContainer: {
      flex: 1,
    },
    premiumTitle: {
      fontFamily: FontFamilies.jetBrainsMonoBold,
      fontSize: moderateScale(18),
      fontWeight: '700',
      color: Colors.white,
      marginBottom: verticalScale(4),
    },
    premiumSubtitle: {
      fontFamily: FontFamilies.jetBrainsMonoRegular,
      fontSize: moderateScale(13),
      fontWeight: '500',
      color: Colors.black,
    },

    // Section
    section: {
      marginBottom: verticalScale(32),
    },
    sectionTitle: {
      fontFamily: FontFamilies.jetBrainsMonoMedium,
      fontSize: moderateScale(16),
      fontWeight: '500',
      color: Colors.inactive,
      marginBottom: verticalScale(16),
      paddingHorizontal: horizontalScale(16),
    },

    // Settings
    settingsContainer: {
      backgroundColor: Colors.cardBackground,
      paddingHorizontal: horizontalScale(16),
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(16),
    },
    settingContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      width: horizontalScale(32),
      height: horizontalScale(32),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: horizontalScale(6),
    },
    settingTitle: {
      fontFamily: FontFamilies.jetBrainsMonoBold,
      fontSize: moderateScale(16),
      fontWeight: '700',
      color: Colors.text,
    },

    // Support
    supportContainer: {
      backgroundColor: Colors.cardBackground,
      paddingHorizontal: horizontalScale(16),
      marginBottom:moderateScale(5)
    },
    supportItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(16),
    },
    supportContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    supportIcon: {
      width: horizontalScale(32),
      height: horizontalScale(32),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: horizontalScale(16),
    },
    supportText: {
      flex: 1,
    },
    supportTitle: {
      fontFamily: FontFamilies.jetBrainsMonoMedium,
      fontSize: moderateScale(16),
      fontWeight: '500',
      color: Colors.text,
      marginBottom: verticalScale(2),
    },
    supportSubtitle: {
      fontFamily: FontFamilies.jetBrainsMonoRegular,
      fontSize: moderateScale(14),
      fontWeight: '400',
      color: Colors.inactive,
    },

    // Logout
    logoutButton: {
      backgroundColor: '#ff3e581d',
      // borderRadius: BorderRadius.base,
      paddingVertical: verticalScale(16),
      alignItems: 'center',
      marginTop: verticalScale(24),
      marginHorizontal: horizontalScale(16),
      bottom:moderateScale(40)
      // flex:1
    },
    logoutText: {
      fontFamily: FontFamilies.jetBrainsMonoMedium,
      fontSize: moderateScale(16),
      fontWeight: '500',
      color: '#FF3E57',
    },
  });

/**
 * Hook to get styles for the Me/Settings screen
 */
export const useStyles = () => createStyles();

export default createStyles;
