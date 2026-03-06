/**
 * Facebook Analytics Card Component
 * 
 * Displays Facebook Analytics status and provides testing functionality
 * Includes buttons to test various event types
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { facebookAnalytics, FacebookEventName } from '../services/FacebookAnalyticsService';

const FacebookAnalyticsCard: React.FC = () => {
  const theme = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [anonymousID, setAnonymousID] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsInitialized(facebookAnalytics.getInitializationStatus());
    setIsEnabled(facebookAnalytics.isAnalyticsEnabled());
    
    const id = await facebookAnalytics.getAnonymousID();
    setAnonymousID(id);
  };

  const handleToggleAnalytics = () => {
    const newState = !isEnabled;
    facebookAnalytics.setEnabled(newState);
    setIsEnabled(newState);
    Alert.alert(
      'Facebook Analytics',
      `Analytics ${newState ? 'enabled' : 'disabled'}`
    );
  };

  const handleTestEvent = async (eventType: string) => {
    try {
      switch (eventType) {
        case 'screen':
          await facebookAnalytics.logScreenView('Settings Screen', {
            feature: 'analytics_testing',
          });
          break;
        
        case 'button':
          await facebookAnalytics.logButtonClick(
            'Test Button',
            'Settings',
            { test: 'true' }
          );
          break;
        
        case 'content':
          await facebookAnalytics.logViewContent(
            'demo_product',
            'DEMO_123',
            { category: 'electronics', price: 99.99 }
          );
          break;
        
        case 'cart':
          await facebookAnalytics.logAddToCart(
            'product',
            'DEMO_PRODUCT_456',
            'USD',
            49.99,
            { quantity: 1 }
          );
          break;
        
        case 'purchase':
          await facebookAnalytics.logPurchase({
            amount: 149.99,
            currency: 'USD',
            contentType: 'product',
            contentId: 'DEMO_ORDER_789',
            numItems: 3,
          });
          break;
        
        case 'search':
          await facebookAnalytics.logSearch('demo search query', {
            results_count: 42,
          });
          break;
        
        case 'registration':
          await facebookAnalytics.logCompleteRegistration('email', {
            platform: Platform.OS,
          });
          break;
        
        case 'custom':
          await facebookAnalytics.logCustomEvent('demo_custom_event', {
            custom_param: 'demo_value',
            timestamp: Date.now(),
          });
          break;
        
        default:
          break;
      }
      
      Alert.alert('Success', `${eventType} event logged successfully!`);
    } catch (error) {
      Alert.alert('Error', `Failed to log ${eventType} event`);
    }
  };

  const getStatusColor = () => {
    if (!isInitialized) return theme.colors.error;
    if (!isEnabled) return theme.colors.warning || '#FFA500';
    return theme.colors.success;
  };

  const getStatusText = () => {
    if (!isInitialized) return 'Not Initialized';
    if (!isEnabled) return 'Disabled';
    return 'Active';
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: getStatusColor(),
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    infoContainer: {
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.text + '80',
    },
    infoValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    buttonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    testButton: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    testButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    toggleButton: {
      backgroundColor: isEnabled ? theme.colors.error : theme.colors.success,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    toggleButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Facebook Analytics</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>{Platform.OS}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Initialized</Text>
          <Text style={styles.infoValue}>{isInitialized ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Enabled</Text>
          <Text style={styles.infoValue}>{isEnabled ? 'Yes' : 'No'}</Text>
        </View>
        {anonymousID && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Anonymous ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {anonymousID.substring(0, 16)}...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Test Events Section */}
      <Text style={styles.sectionTitle}>Test Events</Text>
      <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('screen')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>Screen View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('button')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>Button Click</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('content')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>View Content</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('cart')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('purchase')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>Purchase</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('search')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('registration')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>Registration</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestEvent('custom')}
            disabled={!isEnabled}
          >
            <Text style={styles.testButtonText}>Custom Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleToggleAnalytics}
      >
        <Text style={styles.toggleButtonText}>
          {isEnabled ? 'Disable Analytics' : 'Enable Analytics'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FacebookAnalyticsCard;
