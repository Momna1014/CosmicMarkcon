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

import {Platform, Alert, PermissionsAndroid, Linking} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

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

type PermissionStatus = 'granted' | 'denied' | 'never_ask_again';

const DEFAULT_OPTIONS: ImagePickerOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  includeBase64: false,
  mediaType: 'photo',
};

/**
 * Open app settings
 */
const openAppSettings = (): void => {
  Linking.openSettings();
};

/**
 * Show permission denied alert with option to open settings
 */
const showPermissionDeniedAlert = (
  permissionType: 'Camera' | 'Photo Library',
  isPermanentlyDenied: boolean,
): void => {
  if (isPermanentlyDenied) {
    Alert.alert(
      `${permissionType} Access Required`,
      `${permissionType} permission has been denied. Please enable it in your device settings to use this feature.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: openAppSettings,
        },
      ],
    );
  } else {
    Alert.alert(
      'Permission Required',
      `${permissionType} permission is required to continue. Please grant access when prompted.`,
    );
  }
};

/**
 * Check and request iOS permission
 */
const checkAndRequestIOSPermission = async (
  permission: Permission,
): Promise<PermissionStatus> => {
  try {
    // First check current status
    const currentStatus = await check(permission);
    
    if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
      return 'granted';
    }
    
    if (currentStatus === RESULTS.BLOCKED) {
      return 'never_ask_again';
    }
    
    if (currentStatus === RESULTS.UNAVAILABLE) {
      return 'denied';
    }
    
    // If denied or not determined, request permission
    const requestResult = await request(permission);
    
    if (requestResult === RESULTS.GRANTED || requestResult === RESULTS.LIMITED) {
      return 'granted';
    } else if (requestResult === RESULTS.BLOCKED) {
      return 'never_ask_again';
    }
    return 'denied';
  } catch (err) {
    console.warn('iOS permission error:', err);
    return 'denied';
  }
};

/**
 * Request camera permission for both platforms
 */
const requestCameraPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'ios') {
    return checkAndRequestIOSPermission(PERMISSIONS.IOS.CAMERA);
  }

  // Android handling
  try {
    // First check if permission was already granted
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    
    if (hasPermission) {
      return 'granted';
    }

    // Request permission
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
    
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'never_ask_again';
    }
    return 'denied';
  } catch (err) {
    console.warn('Camera permission error:', err);
    return 'denied';
  }
};

/**
 * Request photo library permission for both platforms
 */
const requestGalleryPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'ios') {
    return checkAndRequestIOSPermission(PERMISSIONS.IOS.PHOTO_LIBRARY);
  }

  // Android handling
  try {
    const androidVersion = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
    const permission = androidVersion >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    // First check if permission was already granted
    const hasPermission = await PermissionsAndroid.check(permission);
    
    if (hasPermission) {
      return 'granted';
    }

    // Request permission
    const granted = await PermissionsAndroid.request(
      permission,
      {
        title: 'Photo Library Permission',
        message: 'This app needs access to your photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'never_ask_again';
    }
    return 'denied';
  } catch (err) {
    console.warn('Gallery permission error:', err);
    return 'denied';
  }
};

/**
 * Launch camera to take a photo
 */
export const launchCamera = async (
  options: ImagePickerOptions = {},
): Promise<ImagePickerResult | null> => {
  const permissionStatus = await requestCameraPermission();
  
  if (permissionStatus !== 'granted') {
    showPermissionDeniedAlert('Camera', permissionStatus === 'never_ask_again');
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
            // Handle permission error from iOS
            if (response.errorCode === 'camera_unavailable' || response.errorCode === 'permission') {
              showPermissionDeniedAlert('Camera', true);
              resolve(null);
              return;
            }
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
  const permissionStatus = await requestGalleryPermission();
  
  if (permissionStatus !== 'granted') {
    showPermissionDeniedAlert('Photo Library', permissionStatus === 'never_ask_again');
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
            // Handle permission error from iOS
            if (response.errorCode === 'permission') {
              showPermissionDeniedAlert('Photo Library', true);
              resolve(null);
              return;
            }
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
