import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, I18nManager } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeProvider';
import {
  AppTheme,
  moderateScale,
  verticalScale,
  horizontalScale,
} from '../theme';

interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
  onInfoPress?: () => void;
  /** Custom right icon name (e.g., 'cog' for settings, default is info 'i') */
  rightIconName?: string;
  /** Show info icon (i) - default behavior */
  showInfoIcon?: boolean;
  /** Whether to show the back button (default: true if onBackPress is provided) */
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Learn Qaida',
  onBackPress,
  onInfoPress,
  rightIconName,
  showInfoIcon = false,
  showBackButton = true,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
    const isRTL = I18nManager.isRTL;
  
  // Only show back button if showBackButton is true and onBackPress is provided
  const shouldShowBackButton = showBackButton && !!onBackPress;
  
  // Animation values for pulsing info icon
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation when info icon is shown
  useEffect(() => {
    if (showInfoIcon) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 1000,
              easing: Easing.bezier(0.4, 0.0, 0.6, 1),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 1000,
              easing: Easing.bezier(0.4, 0.0, 0.6, 1),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.bezier(0.4, 0.0, 0.6, 1),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.bezier(0.4, 0.0, 0.6, 1),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseAnimation.start();
      
      return () => {
        pulseAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [showInfoIcon, pulseAnim, opacityAnim]);

  // Determine which right icon to show
  const renderRightIcon = () => {
    if (!onInfoPress) {
      return <View style={styles.placeholderButton} />;
    }

    // Custom icon (e.g., settings cog)
    if (rightIconName) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onInfoPress}
          activeOpacity={0.7}
        >
          <Icon
            name={rightIconName}
            size={moderateScale(24)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      );
    }

    // Default info icon (i)
    if (showInfoIcon) {
      return (
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          }}
        >
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onInfoPress}
            activeOpacity={0.7}
          >
            <View style={styles.infoIcon}>
              <Text style={styles.infoText}>i</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return <View style={styles.placeholderButton} />;
  };

  return (
    <View style={styles.container}>
      {/* Left Button - conditionally rendered */}
      {shouldShowBackButton ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Icon
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={moderateScale(28)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderButton} />
      )}

      {/* Title - Centered */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right Button */}
      {renderRightIcon()}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      // backgroundColor: theme.dark
      //   ? theme.colors.headerBgDark
      //   : theme.colors.headerBg,
    },
    iconButton: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      // backgroundColor: theme.dark
      //   ? theme.colors.qaidaLearning.lessonCardBgDark
      //   : theme.colors.qaidaLearning.lessonCardBg,
      justifyContent: 'center',
      alignItems: 'center',
      // ...theme.shadows.sm,
    },
    placeholderButton: {
      width: moderateScale(40),
      height: moderateScale(40),
    },
    titleContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: theme.fonts.sizes.lg,
      // fontFamily: theme.fonts.families.poppinsBold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    infoIcon: {
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(12),
      borderWidth: moderateScale(2),
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '15', // Slight background tint
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
    infoText: {
      fontSize: theme.fonts.sizes.md,
      // fontFamily: theme.fonts.families.poppinsBold,
      color: theme.colors.primary,
    },
  });

export default Header;
