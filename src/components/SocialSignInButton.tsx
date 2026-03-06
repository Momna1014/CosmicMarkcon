import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Image,
} from 'react-native';

interface SocialSignInButtonProps {
  onPress: () => void;
  text: string;
  icon: any; // Image source
  backgroundColor: string;
  textColor: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Reusable Social Sign-In Button Component
 * 
 * Features:
 * - Rounded corners (little curves)
 * - Icon + Text layout
 * - Loading state
 * - Disabled state
 * - Customizable colors
 * - Press feedback
 */
const SocialSignInButton: React.FC<SocialSignInButtonProps> = ({
  onPress,
  text,
  icon,
  backgroundColor,
  textColor,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {backgroundColor},
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}
          <Text style={[styles.text, {color: textColor}, textStyle]}>
            {text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8, // Little curves
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SocialSignInButton;
