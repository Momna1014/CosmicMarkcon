import { RemoteConfigService } from '../../services/firebase/RemoteConfigService';

export async function setupRemoteConfig(): Promise<void> {
  // Keep debug reasonably fresh without forcing a network fetch every launch.
  const fetchInterval = __DEV__ ? 300 : 3600;
  await RemoteConfigService.initialize({}, fetchInterval);
}
