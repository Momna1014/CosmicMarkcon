/**
 * ForceUpdateModal.tsx
 * 
 * Blocking modal that forces users to update the app.
 * Cannot be dismissed - user must update to continue.
 * 
 * Features:
 * - Full screen blocking overlay
 * - Beautiful UI with app icon
 * - Update button redirects to appropriate store
 * - Theme-aware styling
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';
import {
  AppTheme,
  moderateScale,
  verticalScale,
  horizontalScale,
  fontScale,
} from '../../theme';
import { UpdateState } from '../../services/appUpdate/AppUpdateService';

// App icon - using quran icon as app icon
const APP_ICON = require('../../assets/AppLogo/app_logo.png');

interface ForceUpdateModalProps {
  visible: boolean;
  updateState: UpdateState;
  onUpdate: () => void;
  /** Called when close button is pressed (only available if update is optional) */
  onClose?: () => void;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  visible,
  updateState,
  onUpdate,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  if (!visible || !updateState) {
    return null;
  }

  // Determine if this is a blocking (force) update or optional update
  const isForceUpdate = !updateState.isOptional;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Allow back button to close modal only if update is optional
        if (!isForceUpdate && onClose) {
          onClose();
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close (X) icon - Only shown for optional updates */}
          {!isForceUpdate && onClose && (
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          )}

          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={APP_ICON}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {t('forceUpdate.title', 'Update Required')}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {updateState.message || t('forceUpdate.message', 'A new version of the app is available with exciting features and improvements!')}
          </Text>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionLabel}>
              {t('forceUpdate.currentVersion', 'Current Version')}: {updateState.currentVersion}
            </Text>
            <Text style={styles.versionLabel}>
              {t('forceUpdate.latestVersion', 'Latest Version')}: {updateState.latestVersion}
            </Text>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>
              {Platform.OS === 'ios'
                ? t('forceUpdate.updateAppStore', 'Update on App Store')
                : t('forceUpdate.updatePlayStore', 'Update on Play Store')}
            </Text>
          </TouchableOpacity>

          {/* Note */}
          <Text style={styles.note}>
            {isForceUpdate
              ? t('forceUpdate.note', 'Please update to continue using the app')
              : t('forceUpdate.optionalNote', 'You can dismiss this notification and update later')}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: horizontalScale(24),
    },
    container: {
      width: '100%',
      maxWidth: moderateScale(340),
      backgroundColor: theme.dark ? '#1E1E1E' : '#FFFFFF',
      borderRadius: moderateScale(20),
      paddingVertical: verticalScale(32),
      paddingHorizontal: horizontalScale(24),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
    },
    iconContainer: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(16),
      backgroundColor: theme.dark ? '#2A2A2A' : '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(20),
      overflow: 'hidden',
    },
    appIcon: {
      width: moderateScale(60),
      height: moderateScale(60),
    },
    title: {
      fontSize: fontScale(22),
      color: theme.dark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: verticalScale(12),
      textAlign: 'center',
    },
    message: {
      fontSize: fontScale(15),
      color: theme.dark ? '#B0B0B0' : '#666666',
      textAlign: 'center',
      lineHeight: fontScale(22),
      marginBottom: verticalScale(20),
    },
    versionContainer: {
      backgroundColor: theme.dark ? '#2A2A2A' : '#F8F8F8',
      borderRadius: moderateScale(10),
      paddingVertical: verticalScale(12),
      paddingHorizontal: horizontalScale(16),
      width: '100%',
      marginBottom: verticalScale(24),
    },
    versionLabel: {
      fontSize: fontScale(13),
      color: theme.dark ? '#999999' : '#888888',
      textAlign: 'center',
      marginVertical: verticalScale(2),
    },
    updateButton: {
      width: '100%',
      paddingVertical: verticalScale(16),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    updateButtonText: {
      fontSize: fontScale(16),
      color: '#FFFFFF',
    },
    note: {
      fontSize: fontScale(12),
      color: theme.dark ? '#777777' : '#999999',
      textAlign: 'center',
    },
    closeIconButton: {
      position: 'absolute',
      top: verticalScale(12),
      right: horizontalScale(12),
      width: moderateScale(28),
      height: moderateScale(28),
      borderRadius: moderateScale(14),
      backgroundColor: theme.dark ? '#333333' : '#EEEEEE',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    closeIconText: {
      fontSize: fontScale(14),
      color: theme.dark ? '#AAAAAA' : '#666666',
      lineHeight: fontScale(16),
    },
  });

export default ForceUpdateModal;
