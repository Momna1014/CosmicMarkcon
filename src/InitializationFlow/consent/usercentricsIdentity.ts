import type { UsercentricsOptions } from '@usercentrics/react-native-sdk';
import env from '../../config/env';
import type { ConsentIdentity } from '../types';

const DEFAULT_TIMEOUT_MS = 5000;
type IdentityMode = 'auto' | 'ruleset' | 'settings';

let cachedIdentity: ConsentIdentity | null | undefined;

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeIdentityMode(value: unknown): IdentityMode {
  const normalized = normalize(value).toLowerCase();
  if (normalized === 'ruleset' || normalized === 'settings') {
    return normalized;
  }

  return 'auto';
}

function buildRuleSetIdentity(ruleSetId: string): ConsentIdentity | null {
  if (!ruleSetId) {
    return null;
  }

  return {
    type: 'ruleset',
    value: ruleSetId,
    key: `ruleset:${ruleSetId}`,
  };
}

function buildSettingsIdentity(settingsId: string): ConsentIdentity | null {
  if (!settingsId) {
    return null;
  }

  return {
    type: 'settings',
    value: settingsId,
    key: `settings:${settingsId}`,
  };
}

function computeIdentity(): ConsentIdentity | null {
  const ruleSetId = normalize(env.USER_CENTRIC_RULESET_ID);
  const settingsId = normalize(env.USER_CENTRIC_SETTINGS_ID);
  const identityMode = normalizeIdentityMode(env.USER_CENTRIC_IDENTITY_MODE);

  if (identityMode === 'ruleset') {
    return buildRuleSetIdentity(ruleSetId) || buildSettingsIdentity(settingsId);
  }

  if (identityMode === 'settings') {
    return buildSettingsIdentity(settingsId) || buildRuleSetIdentity(ruleSetId);
  }

  // Deterministic default priority requested by product: RuleSetId first, then SettingsId.
  const autoIdentity = buildRuleSetIdentity(ruleSetId) || buildSettingsIdentity(settingsId);
  if (autoIdentity) {
    return autoIdentity;
  }

  return null;
}

export function resolveUsercentricsIdentity(): ConsentIdentity | null {
  if (cachedIdentity !== undefined) {
    return cachedIdentity;
  }

  cachedIdentity = computeIdentity();
  return cachedIdentity;
}

export function buildUsercentricsOptions(
  timeoutMillis: number = DEFAULT_TIMEOUT_MS,
): UsercentricsOptions | null {
  const identity = resolveUsercentricsIdentity();
  if (!identity) {
    return null;
  }

  const options: UsercentricsOptions = {
    loggerLevel: __DEV__ ? 1 : 0,
    timeoutMillis,
  };

  if (identity.type === 'ruleset') {
    options.ruleSetId = identity.value;
  } else {
    options.settingsId = identity.value;
  }

  return options;
}

export function resetUsercentricsIdentityCache(): void {
  cachedIdentity = undefined;
}
