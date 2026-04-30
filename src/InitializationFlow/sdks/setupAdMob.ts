// @feature:admob:start
import { adMobService } from '../../services/AdMob/AdMobService';
import type { AdsMode } from '../types';

export async function setupAdMob(mode: AdsMode): Promise<void> {
  adMobService.setAdsEnabled(true);
  adMobService.setPersonalizedAds(mode === 'personalized');
  await adMobService.initialize();
}

export async function disableAdMob(): Promise<void> {
  adMobService.setPersonalizedAds(false);
  adMobService.setAdsEnabled(false);
}
// @feature:admob:end
