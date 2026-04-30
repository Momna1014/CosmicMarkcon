import { setupSentryAnonymous } from '../sdks/setupSentry';

export async function initEssentials(): Promise<void> {
  await Promise.allSettled([
    setupSentryAnonymous(),
  ]);
}
