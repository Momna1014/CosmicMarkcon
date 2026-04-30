import RNBootSplash from 'react-native-bootsplash';

export async function hideSplash(): Promise<void> {
  try {
    await RNBootSplash.hide({ fade: true });
  } catch (error) {
    console.warn('[InitializationFlow] Failed to hide splash:', error);
  }
}
