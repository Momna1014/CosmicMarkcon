import { revenueCatService } from '../../services/RevenueCatService';

export async function setupRevenueCat(attributionEnabled: boolean): Promise<void> {
  await revenueCatService.initialize(undefined, {
    enableAttribution: attributionEnabled,
  });
}
