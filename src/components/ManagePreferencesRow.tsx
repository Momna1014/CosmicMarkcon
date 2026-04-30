/**
 * ManagePreferencesRow
 *
 * Reusable EU-only "Manage Preferences" entry point.
 * Opens the Usercentrics second layer pre-populated with the user's current
 * selections. On change → applyUpdatedConsent → reconfigures SDKs at runtime.
 *
 * Used in: Profile tab, Settings screen.
 *
 * Region detection (cheapest first):
 *   1. in-memory `getConsentResult()` — set by `startApp()` after consent
 *   2. live `checkRegion()` (Usercentrics.status())  — fallback
 *
 * No MMKV cache: Usercentrics SDK is the single source of truth for consent.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { applyUpdatedConsent, getConsentResult } from '../InitializationFlow';
import { checkRegion, openConsentPreferences } from '../InitializationFlow/consent';
import { showErrorToast, showInfoToast, showSuccessToast } from '../utils/toast';

export default function ManagePreferencesRow(): React.ReactElement | null {
  const { t } = useTranslation();
  const [isEUUser, setIsEUUser] = useState(false);
  const [isCheckingRegion, setIsCheckingRegion] = useState(true);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  const refreshRegionVisibility = useCallback(async () => {
    setIsCheckingRegion(true);
    try {
      // In SettingsId mode the SDK has no geolocation data, so
      // `getConsentResult().region` is always 'eu' — we cannot trust an
      // 'eu' value from the runtime cache. Trust only an explicit 'non-eu'
      // value (set by RuleSet mode when the SDK knows the location is
      // outside the configured ruleset). For everything else, fall through
      // to `checkRegion()`, which combines RuleSet geolocation (when
      // available) with a device-country fallback (EU/EEA/UK list).
      const runtimeConsent = getConsentResult();
      if (runtimeConsent?.region === 'non-eu') {
        setIsEUUser(false);
        return;
      }
      const region = await checkRegion();
      setIsEUUser(region === 'eu');
    } catch {
      // Privacy-safe default: show row on error so EU users always have access.
      setIsEUUser(true);
    } finally {
      setIsCheckingRegion(false);
    }
  }, []);

  useEffect(() => {
    void refreshRegionVisibility();
  }, [refreshRegionVisibility]);

  useFocusEffect(
    useCallback(() => {
      void refreshRegionVisibility();
      return undefined;
    }, [refreshRegionVisibility]),
  );

  const handlePress = useCallback(async () => {
    if (isUpdatingPreferences) return;
    setIsUpdatingPreferences(true);
    try {
      const previous = getConsentResult();
      const result = await openConsentPreferences(previous);
      setIsEUUser(result.consent.region === 'eu');

      if (result.outcome === 'not-eu') {
        showInfoToast(t('settings.managePreferences.notAvailable'));
        return;
      }
      if (!result.changed) {
        showInfoToast(t('settings.managePreferences.noChanges'));
        return;
      }

      await applyUpdatedConsent(result.consent);
      showSuccessToast(t('settings.managePreferences.updated'));
    } catch (error) {
      console.error('[ManagePreferencesRow] Failed to update preferences:', error);
      showErrorToast(t('settings.managePreferences.error'));
    } finally {
      setIsUpdatingPreferences(false);
    }
  }, [isUpdatingPreferences, t]);

  if (isCheckingRegion) {
    return (
      <View style={styles.section}>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#8E8E93" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!isEUUser) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('settings.privacySectionTitle')}</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={handlePress}
        disabled={isUpdatingPreferences}
        activeOpacity={0.75}
      >
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('settings.managePreferences.title')}</Text>
          <Text style={styles.subtitle}>{t('settings.managePreferences.subtitle')}</Text>
        </View>
        {isUpdatingPreferences ? (
          <ActivityIndicator size="small" color="#8E8E93" />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },
  chevron: {
    fontSize: 24,
    color: '#8E8E93',
    marginTop: -2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});
