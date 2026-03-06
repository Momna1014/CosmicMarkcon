// src/theme/index.ts
import { Dimensions } from 'react-native';
import { Theme as NavigationTheme } from '@react-navigation/native';

// =============================================
// SCALING UTILITIES
// =============================================
const { width, height } = Dimensions.get('window');

// Reference: https://github.com/nirsky/react-native-size-matters/tree/68c63b021c7e9abcb3e2e5442eb2414f02e6223d/examples/BlogPost#method-3-scaling-utils
// Guideline sizes based on standard ~5" screen mobile device
const guidelineBaseWidth: number = 428;
const guidelineBaseHeight: number = 926;

const _horizontalScale = (size: number): number =>
  (width / guidelineBaseWidth) * size;
const _verticalScale = (size: number): number =>
  (height / guidelineBaseHeight) * size;

const moderateScale = (size: number, factor: number = 0.5): number =>
  size + ((_horizontalScale(size) + _verticalScale(size)) / 2 - size) * factor;

const horizontalScale = (size: number, factor: number = 0.5): number =>
  size + (_horizontalScale(size) - size) * factor;

const verticalScale = (size: number, factor: number = 1): number =>
  size + (_verticalScale(size) - size) * factor;

const radiusScale = (size: number) => verticalScale(size);
const borderWidthScale = (size: number) => horizontalScale(size);
const fontScale = (size: number) => moderateScale(size);
const scaleSize = (size: number) => moderateScale(size);

// Screen dimensions and device detection
const screenData = {
  width,
  height,
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
  isTablet: width >= 768,
};

// =============================================
// RESPONSIVE UTILITIES
// =============================================

/**
 * Responsive theme utilities for consistent scaling across different screen sizes
 */

// Device-specific utilities
export const device = {
  ...screenData,
  // Helper functions for conditional rendering
  isSmall: () => screenData.isSmallDevice,
  isMedium: () => screenData.isMediumDevice,
  isLarge: () => screenData.isLargeDevice,
  isTablet: () => screenData.isTablet,

  // Conditional values
  select: <T>(values: {
    small?: T;
    medium?: T;
    large?: T;
    tablet?: T;
    default: T;
  }) => {
    if (screenData.isTablet && values.tablet) return values.tablet;
    if (screenData.isSmallDevice && values.small) return values.small;
    if (screenData.isMediumDevice && values.medium) return values.medium;
    if (screenData.isLargeDevice && values.large) return values.large;
    return values.default;
  },
};

// Utility function to create responsive styles
export const createResponsiveStyle = <T extends Record<string, any>>(
  baseStyle: T,
  responsiveOverrides?: {
    small?: Partial<T>;
    medium?: Partial<T>;
    large?: Partial<T>;
    tablet?: Partial<T>;
  }
): T => {
  if (!responsiveOverrides) return baseStyle;

  let responsiveStyle = { ...baseStyle };

  if (screenData.isTablet && responsiveOverrides.tablet) {
    responsiveStyle = { ...responsiveStyle, ...responsiveOverrides.tablet };
  } else if (screenData.isSmallDevice && responsiveOverrides.small) {
    responsiveStyle = { ...responsiveStyle, ...responsiveOverrides.small };
  } else if (screenData.isMediumDevice && responsiveOverrides.medium) {
    responsiveStyle = { ...responsiveStyle, ...responsiveOverrides.medium };
  } else if (screenData.isLargeDevice && responsiveOverrides.large) {
    responsiveStyle = { ...responsiveStyle, ...responsiveOverrides.large };
  }

  return responsiveStyle;
};

// Additional responsive helpers
export const getResponsiveValue = <T>(small: T, medium?: T, large?: T): T => {
  if (screenData.isTablet && large !== undefined) return large;
  if (screenData.isLargeDevice && large !== undefined) return large;
  if (screenData.isMediumDevice && medium !== undefined) return medium;
  return small;
};

// =============================================
// DESIGN TOKENS
// =============================================

// Colors
export const Colors = {
  // Basic colors
  black: '#000000',
  white: '#FFFFFF',
  background: '#0B0B0C',
  // Theme colors
  primary: '#FF3E57',
  card: '#FF3E57',
  text: '#FFFFFF',
  border: '#FF823E',
  notification: '#4CE3B2',
  // Additional colors
  rating: '#FF8E3C',
  inactive: '#7B7B80',
  cardBackground: '#1E1E21',
  // Gradient colors
  gradientStart: '#E60076',
  gradientEnd: '#C27AFF',
  ratingText:"#737373",
  light_blue:"#49A3FF",
  light_gray:"#B5B5BA"
} as const;

// Typography
export const FontSizes = {
  xs: fontScale(12),
  sm: fontScale(14),
  md: fontScale(16),
  base: fontScale(16),
  lg: fontScale(18),
  xl: fontScale(20),
  xxl: fontScale(24),
  '3xl': fontScale(30),
  '4xl': fontScale(36),
  '5xl': fontScale(48),
  '6xl': fontScale(60),
} as const;

export const FontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const FontFamilies = {
  // Poppins
  poppinsThin: 'Poppins-Thin',
  poppinsThinItalic: 'Poppins-ThinItalic',
  poppinsExtraLight: 'Poppins-ExtraLight',
  poppinsExtraLightItalic: 'Poppins-ExtraLightItalic',
  poppinsLight: 'Poppins-Light',
  poppinsLightItalic: 'Poppins-LightItalic',
  poppinsRegular: 'Poppins-Regular',
  poppinsItalic: 'Poppins-Italic',
  poppinsMedium: 'Poppins-Medium',
  poppinsMediumItalic: 'Poppins-MediumItalic',
  poppinsSemiBold: 'Poppins-SemiBold',
  poppinsSemiBoldItalic: 'Poppins-SemiBoldItalic',
  poppinsBold: 'Poppins-Bold',
  poppinsBoldItalic: 'Poppins-BoldItalic',
  poppinsExtraBold: 'Poppins-ExtraBold',
  poppinsExtraBoldItalic: 'Poppins-ExtraBoldItalic',
  poppinsBlack: 'Poppins-Black',
  poppinsBlackItalic: 'Poppins-BlackItalic',

  // Montserrat
  montserratThin: 'Montserrat-Thin',
  montserratThinItalic: 'Montserrat-ThinItalic',
  montserratExtraLight: 'Montserrat-ExtraLight',
  montserratExtraLightItalic: 'Montserrat-ExtraLightItalic',
  montserratLight: 'Montserrat-Light',
  montserratLightItalic: 'Montserrat-LightItalic',
  montserratRegular: 'Montserrat-Regular',
  montserratItalic: 'Montserrat-Italic',
  montserratMedium: 'Montserrat-Medium',
  montserratMediumItalic: 'Montserrat-MediumItalic',
  montserratSemiBold: 'Montserrat-SemiBold',
  montserratSemiBoldItalic: 'Montserrat-SemiBoldItalic',
  montserratBold: 'Montserrat-Bold',
  montserratBoldItalic: 'Montserrat-BoldItalic',
  montserratExtraBold: 'Montserrat-ExtraBold',
  montserratExtraBoldItalic: 'Montserrat-ExtraBoldItalic',
  montserratBlack: 'Montserrat-Black',
  montserratBlackItalic: 'Montserrat-BlackItalic',

  // JetBrainsMono
  jetBrainsMonoThin: 'JetBrainsMono-Thin',
  jetBrainsMonoThinItalic: 'JetBrainsMono-ThinItalic',
  jetBrainsMonoExtraLight: 'JetBrainsMono-ExtraLight',
  jetBrainsMonoExtraLightItalic: 'JetBrainsMono-ExtraLightItalic',
  jetBrainsMonoLight: 'JetBrainsMono-Light',
  jetBrainsMonoLightItalic: 'JetBrainsMono-LightItalic',
  jetBrainsMonoRegular: 'JetBrainsMono-Regular',
  jetBrainsMonoItalic: 'JetBrainsMono-Italic',
  jetBrainsMonoMedium: 'JetBrainsMono-Medium',
  jetBrainsMonoMediumItalic: 'JetBrainsMono-MediumItalic',
  jetBrainsMonoSemiBold: 'JetBrainsMono-SemiBold',
  jetBrainsMonoSemiBoldItalic: 'JetBrainsMono-SemiBoldItalic',
  jetBrainsMonoBold: 'JetBrainsMono-Bold',
  jetBrainsMonoBoldItalic: 'JetBrainsMono-BoldItalic',
  jetBrainsMonoExtraBold: 'JetBrainsMono-ExtraBold',
  jetBrainsMonoExtraBoldItalic: 'JetBrainsMono-ExtraBoldItalic',

  // Outfit
  outfitThin: 'Outfit-Thin',
  outfitExtraLight: 'Outfit-ExtraLight',
  outfitLight: 'Outfit-Light',
  outfitRegular: 'Outfit-Regular',
  outfitMedium: 'Outfit-Medium',
  outfitSemiBold: 'Outfit-SemiBold',
  outfitBold: 'Outfit-Bold',
  outfitExtraBold: 'Outfit-ExtraBold',
  outfitBlack: 'Outfit-Black',

  // SF Pro Display
  sfProDisplayRegular: 'SFProDisplay-Regular',
  sfProDisplayMedium: 'SFProDisplay-Medium',
  sfProDisplayBold: 'SFProDisplay-Bold',
  sfProDisplayThinItalic: 'SFProDisplay-ThinItalic',
  sfProDisplayUltralightItalic: 'SFProDisplay-UltralightItalic',
  sfProDisplayLightItalic: 'SFProDisplay-LightItalic',
  sfProDisplaySemiboldItalic: 'SFProDisplay-SemiboldItalic',
  sfProDisplayHeavyItalic: 'SFProDisplay-HeavyItalic',
  sfProDisplayBlackItalic: 'SFProDisplay-BlackItalic',
} as const;

// Spacing (base values)
const BaseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  '3xl': 64,
} as const;

// Responsive Spacing (scaled values)
export const Spacing = {
  xs: verticalScale(BaseSpacing.xs),
  sm: verticalScale(BaseSpacing.sm),
  md: verticalScale(BaseSpacing.md),
  lg: verticalScale(BaseSpacing.lg),
  xl: verticalScale(BaseSpacing.xl),
  xxl: verticalScale(BaseSpacing.xxl),
  '3xl': verticalScale(BaseSpacing['3xl']),
} as const;

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: radiusScale(4),
  base: radiusScale(8),
  md: radiusScale(12),
  lg: radiusScale(16),
  xl: radiusScale(20),
  '2xl': radiusScale(24),
  '3xl': radiusScale(32),
  r28: radiusScale(28),
  full: 9999,
} as const;

// Shadows
export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: verticalScale(2),
    elevation: 1,
  },
  base: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: verticalScale(4),
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.15,
    shadowRadius: verticalScale(8),
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.2,
    shadowRadius: verticalScale(12),
    elevation: 8,
  },
} as const;

// =============================================
// THEME CONFIGURATION
// =============================================

export interface AppTheme extends Omit<NavigationTheme, 'fonts'> {
  colors: NavigationTheme['colors'] & {
    // Basic colors
    white: string;
    black: string;
    // Additional colors
    rating: string;
    inactive: string;
  };
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  fonts: {
    sizes: typeof FontSizes;
    weights: typeof FontWeights;
    families: typeof FontFamilies;
  };
}

export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    // Navigation theme colors (required by React Navigation)
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.notification,
    // Basic colors
    white: Colors.white,
    black: Colors.black,
    // Additional colors
    rating: Colors.rating,
    inactive: Colors.inactive,
  },
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  fonts: {
    sizes: FontSizes,
    weights: FontWeights,
    families: FontFamilies,
  },
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    // Navigation theme colors (required by React Navigation)
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.notification,
    // Basic colors
    white: Colors.white,
    black: Colors.black,
    // Additional colors
    rating: Colors.rating,
    inactive: Colors.inactive,
  },
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  fonts: {
    sizes: FontSizes,
    weights: FontWeights,
    families: FontFamilies,
  },
};

// =============================================
// EXPORTS
// =============================================

// Export all scaling functions for advanced use cases
export {
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  borderWidthScale,
  moderateScale,
  scaleSize,
  screenData,
  // Export raw scaling functions for advanced use cases
  _horizontalScale,
  _verticalScale,
};

// Default export with everything
export default {
  // Design tokens
  Colors,
  FontSizes,
  FontWeights,
  FontFamilies,
  Spacing,
  BorderRadius,
  Shadows,

  // Responsive utilities
  device,
  createResponsiveStyle,
  getResponsiveValue,

  // Theme configurations
  lightTheme,
  darkTheme,

  // All scaling functions
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  borderWidthScale,
  moderateScale,
  scaleSize,
  screenData,
  _horizontalScale,
  _verticalScale,
};
