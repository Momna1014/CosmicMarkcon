import { facebookAnalytics } from '../../services/FacebookAnalyticsService';

export async function setupFacebook(
  trackingAllowed: boolean,
  consentGranted: boolean,
): Promise<void> {
  facebookAnalytics.setConsentGranted(consentGranted);

  if (!consentGranted) {
    facebookAnalytics.setEnabled(false);
    return;
  }

  await facebookAnalytics.initialize(trackingAllowed);
  facebookAnalytics.setEnabled(true);
}
