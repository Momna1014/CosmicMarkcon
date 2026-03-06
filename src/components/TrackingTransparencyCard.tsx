/**
 * Tracking Transparency Component
 * 
 * Displays current tracking permission status
 * Allows users to request tracking permission
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  getTrackingPermissionStatus,
  requestTrackingPermissions,
  isTrackingAuthorized,
} from '../services/TrackingService';
import { TrackingStatus } from 'react-native-tracking-transparency';
import NavigationConfig from '../navigation/NavigationConfig';

export const TrackingTransparencyCard: React.FC = () => {
  const [status, setStatus] = useState<TrackingStatus>('not-determined');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const currentStatus = await getTrackingPermissionStatus();
    setStatus(currentStatus);
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const newStatus = await requestTrackingPermissions();
      setStatus(newStatus);
      
      if (newStatus === 'authorized') {
        Alert.alert(
          'Permission Granted',
          'Thank you! Tracking is now enabled.',
          [{ text: 'OK' }]
        );
      } else if (newStatus === 'denied') {
        Alert.alert(
          'Permission Denied',
          'You have denied tracking permission. You can change this in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openSettings },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'authorized':
        return {
          text: 'Authorized',
          color: '#34C759',
          emoji: '✅',
          description: 'Tracking is enabled',
        };
      case 'denied':
        return {
          text: 'Denied',
          color: '#FF3B30',
          emoji: '❌',
          description: 'Tracking is disabled',
        };
      case 'restricted':
        return {
          text: 'Restricted',
          color: '#FF9500',
          emoji: '⚠️',
          description: 'Tracking is restricted by device settings',
        };
      case 'not-determined':
        return {
          text: 'Not Determined',
          color: '#8E8E93',
          emoji: '❓',
          description: 'Permission not yet requested',
        };
      case 'unavailable':
      default:
        return {
          text: 'Unavailable',
          color: '#8E8E93',
          emoji: 'ℹ️',
          description: Platform.OS === 'ios' 
            ? 'Requires iOS 14.5+' 
            : 'Android automatically handles AD_ID',
        };
    }
  };

  // Don't show if tracking is disabled in config
  if (!NavigationConfig.tracking.enabled) {
    return null;
  }

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{statusInfo.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>App Tracking Transparency</Text>
          <Text style={styles.subtitle}>
            {Platform.OS === 'ios' ? 'iOS' : 'Android'} Privacy Settings
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </View>

      <Text style={styles.description}>{statusInfo.description}</Text>

      {Platform.OS === 'ios' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {status === 'authorized'
              ? 'This app can track your activity across other apps and websites for personalized ads and analytics.'
              : 'This permission allows apps to track your activity for personalized advertising.'}
          </Text>
        </View>
      )}

      {Platform.OS === 'android' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Android automatically manages advertising ID permissions. 
            The AD_ID permission is declared in the app manifest.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {Platform.OS === 'ios' && status === 'not-determined' && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRequestPermission}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Requesting...' : 'Request Permission'}
            </Text>
          </TouchableOpacity>
        )}

        {Platform.OS === 'ios' && (status === 'denied' || status === 'authorized') && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={openSettings}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Open Settings
            </Text>
          </TouchableOpacity>
        )}

        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={openSettings}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Open App Settings
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {__DEV__ && (
        <TouchableOpacity
          style={styles.debugButton}
          onPress={loadStatus}>
          <Text style={styles.debugButtonText}>🔄 Refresh Status</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actions: {
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  debugButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default TrackingTransparencyCard;
