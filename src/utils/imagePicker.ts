/**
 * Image Picker Utility
 * 
 * Provides camera and gallery access for both iOS and Android
 * Uses react-native-image-picker library
 * 
 * NOTE: You need to install react-native-image-picker:
 * yarn add react-native-image-picker
 * 
 * iOS additional setup (Info.plist):
 * - NSCameraUsageDescription
 * - NSPhotoLibraryUsageDescription
 * 
 * Android additional setup (AndroidManifest.xml):
 * - android.permission.CAMERA
 * - android.permission.READ_EXTERNAL_STORAGE (for Android < 13)
 * - android.permission.READ_MEDIA_IMAGES (for Android 13+)
 */

import {Platform, Alert, PermissionsAndroid} from 'react-native';

export interface ImagePickerResult {
  uri: string;
  type: string;
  fileName: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

export interface ImagePickerOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  includeBase64?: boolean;
  mediaType?: 'photo' | 'video' | 'mixed';
}

const DEFAULT_OPTIONS: ImagePickerOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  includeBase64: false,
  mediaType: 'photo',
};

/**
 * Request camera permission for Android
 */
const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to take photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

/**
 * Request photo library permission for Android
 */
const requestGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const androidVersion = Platform.Version;
    
    // Android 13+ uses READ_MEDIA_IMAGES
    if (androidVersion >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Photo Library Permission',
          message: 'This app needs access to your photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    
    // Android < 13 uses READ_EXTERNAL_STORAGE
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Photo Library Permission',
        message: 'This app needs access to your photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Gallery permission error:', err);
    return false;
  }
};

/**
 * Launch camera to take a photo
 */
export const launchCamera = async (
  options: ImagePickerOptions = {},
): Promise<ImagePickerResult | null> => {
  const hasPermission = await requestCameraPermission();
  
  if (!hasPermission) {
    Alert.alert(
      'Permission Required',
      'Camera permission is required to take photos. Please enable it in settings.',
    );
    return null;
  }

  try {
    // Dynamic import to handle case where library might not be installed
    const ImagePicker = require('react-native-image-picker');
    
    const mergedOptions = {...DEFAULT_OPTIONS, ...options};
    
    return new Promise((resolve) => {
      ImagePicker.launchCamera(
        {
          mediaType: mergedOptions.mediaType,
          maxWidth: mergedOptions.maxWidth,
          maxHeight: mergedOptions.maxHeight,
          quality: mergedOptions.quality,
          includeBase64: mergedOptions.includeBase64,
          saveToPhotos: false,
        },
        (response: any) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            console.error('Camera error:', response.errorMessage);
            Alert.alert('Error', 'Failed to capture image. Please try again.');
            resolve(null);
          } else if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            resolve({
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              fileName: asset.fileName || `photo_${Date.now()}.jpg`,
              fileSize: asset.fileSize,
              width: asset.width,
              height: asset.height,
            });
          } else {
            resolve(null);
          }
        },
      );
    });
  } catch (error) {
    console.error('Camera launch error:', error);
    Alert.alert(
      'Camera Not Available',
      'Please install react-native-image-picker to use camera functionality.',
    );
    return null;
  }
};

/**
 * Launch image library to select a photo
 */
export const launchImageLibrary = async (
  options: ImagePickerOptions = {},
): Promise<ImagePickerResult | null> => {
  const hasPermission = await requestGalleryPermission();
  
  if (!hasPermission) {
    Alert.alert(
      'Permission Required',
      'Photo library permission is required to select photos. Please enable it in settings.',
    );
    return null;
  }

  try {
    // Dynamic import to handle case where library might not be installed
    const ImagePicker = require('react-native-image-picker');
    
    const mergedOptions = {...DEFAULT_OPTIONS, ...options};
    
    return new Promise((resolve) => {
      ImagePicker.launchImageLibrary(
        {
          mediaType: mergedOptions.mediaType,
          maxWidth: mergedOptions.maxWidth,
          maxHeight: mergedOptions.maxHeight,
          quality: mergedOptions.quality,
          includeBase64: mergedOptions.includeBase64,
          selectionLimit: 1,
        },
        (response: any) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            console.error('Gallery error:', response.errorMessage);
            Alert.alert('Error', 'Failed to select image. Please try again.');
            resolve(null);
          } else if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            resolve({
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              fileName: asset.fileName || `photo_${Date.now()}.jpg`,
              fileSize: asset.fileSize,
              width: asset.width,
              height: asset.height,
            });
          } else {
            resolve(null);
          }
        },
      );
    });
  } catch (error) {
    console.error('Gallery launch error:', error);
    Alert.alert(
      'Gallery Not Available',
      'Please install react-native-image-picker to use gallery functionality.',
    );
    return null;
  }
};

/**
 * Show action sheet to choose between camera and gallery
 */
export const showImagePickerOptions = (
  onCameraSelect: () => void,
  onGallerySelect: () => void,
): void => {
  Alert.alert(
    'Choose Image Source',
    'Select where you want to pick the image from',
    [
      {
        text: 'Camera',
        onPress: onCameraSelect,
      },
      {
        text: 'Photo Library',
        onPress: onGallerySelect,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
    {cancelable: true},
  );
};

export default {
  launchCamera,
  launchImageLibrary,
  showImagePickerOptions,
};
