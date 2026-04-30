// @feature:admob:start
/**
 * App Open Ad — re-exports from centralized AdMobService
 *
 * App Open ads are shown once per cold start via
 * adMobService.showAppOpenAd() called from RootNavigator.
 *
 * Direct usage (if needed):
 *   import { adMobService } from './AdMobService';
 *   adMobService.showAppOpenAd();
 */

export { adMobService } from './AdMobService';
// @feature:admob:end
