import { Platform } from 'react-native';
import { SyncStorage, TypedStorage } from '../../redux/storage';
import type { ConsentSource, ConsentStatus } from '../types';

const STORAGE_KEY = '@init_flow_uc_popup_metrics_v1';
const MAX_ENTRIES = 30;

export type RuntimeBuildMode = 'debug' | 'release';
export type RuntimePlatform = 'ios' | 'android' | 'unknown';
export type ConsentPopupOutcome =
  | ConsentStatus
  | 'init-failure'
  | 'popup-error'
  | 'skipped';

export type ConsentPopupMetric = {
  timestamp: number;
  platform: RuntimePlatform;
  buildMode: RuntimeBuildMode;
  source: ConsentSource | 'popup-error';
  popupShown: boolean;
  popupShownAt?: number;
  popupResolvedAt?: number;
  popupVisibleMs?: number;
  checkpointsReachedSec?: number[];
  outcome: ConsentPopupOutcome;
  details?: string;
};

function readMetrics(): ConsentPopupMetric[] {
  const data = TypedStorage.getObject<ConsentPopupMetric[]>(STORAGE_KEY);
  return Array.isArray(data) ? data : [];
}

export function getRuntimeBuildMode(): RuntimeBuildMode {
  return __DEV__ ? 'debug' : 'release';
}

export function getRuntimePlatform(): RuntimePlatform {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }
  return 'unknown';
}

export function saveConsentPopupMetric(metric: ConsentPopupMetric): void {
  const next = [metric, ...readMetrics()].slice(0, MAX_ENTRIES);
  TypedStorage.setObject(STORAGE_KEY, next);
}

export function getConsentPopupMetrics(limit: number = MAX_ENTRIES): ConsentPopupMetric[] {
  if (!Number.isFinite(limit) || limit <= 0) {
    return [];
  }
  return readMetrics().slice(0, Math.floor(limit));
}

export function getLatestConsentPopupMetric(): ConsentPopupMetric | null {
  const metrics = readMetrics();
  return metrics.length > 0 ? metrics[0] : null;
}

export function clearConsentPopupMetrics(): void {
  SyncStorage.removeItem(STORAGE_KEY);
}
