import React, {useState} from 'react';
import {Alert, Platform} from 'react-native';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {GOOGLE_WEB_CLIENT_ID} from '@env';
import SocialSignInButton from './SocialSignInButton';
import {showSuccessToast, showErrorToast, showInfoToast} from '../utils/toast';

interface GoogleSignInButtonProps {
  onSuccess?: (userInfo: any) => void;
  onError?: (error: any) => void;
  text?: string;
}

/**
 * Google Sign-In Button Component
 * 
 * Features:
 * - Handles Google Sign-In flow
 * - Works on both Android and iOS
 * - Error handling with toasts
 * - Loading states
 * - Reusable with callbacks
 * - Graceful degradation without configuration
 */
const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continue with Google',
}) => {
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  /**
   * Initialize Google Sign-In
   */
  React.useEffect(() => {
    try {
      // Check if GOOGLE_WEB_CLIENT_ID is configured
      if (!GOOGLE_WEB_CLIENT_ID || GOOGLE_WEB_CLIENT_ID === '') {
        if (__DEV__) {
          console.warn('⚠️ GOOGLE_WEB_CLIENT_ID not configured. Google Sign-In disabled.');
          console.warn('📖 See SOCIAL_SIGNIN_GUIDE.md for setup instructions.');
        }
        setIsConfigured(false);
        return;
      }

      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
        accountName: '',
        iosClientId: '', // Optional: iOS-specific client ID
      });

      setIsConfigured(true);

      if (__DEV__) {
        console.log('✅ Google Sign-In configured successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Google Sign-In configuration error:', error);
      }
      setIsConfigured(false);
    }
  }, []);

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    // Check if configured
    if (!isConfigured) {
      showInfoToast(
        'Setup Required',
        'Google Sign-In is not configured. See SOCIAL_SIGNIN_GUIDE.md'
      );
      if (__DEV__) {
        Alert.alert(
          '⚙️ Configuration Required',
          'Google Sign-In requires:\n\n1. GOOGLE_WEB_CLIENT_ID in .env\n2. OAuth Client ID from Google Cloud Console\n3. SHA-1 fingerprint configured\n\nSee SOCIAL_SIGNIN_GUIDE.md for details.',
          [{text: 'OK'}]
        );
      }
      return;
    }

    setLoading(true);
    try {
      // Check if device supports Google Play Services (Android)
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Get user info
      const userInfo = await GoogleSignin.signIn();

      if (__DEV__) {
        console.log('✅ Google Sign-In successful:', userInfo);
      }

      showSuccessToast('Signed in with Google successfully!');

      // Call success callback
      if (onSuccess) {
        onSuccess(userInfo);
      }

      // You can now send userInfo to your backend
      // Example: await api.post('/auth/google', { idToken: userInfo.idToken });
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Google Sign-In error:', error);
      }

      // Handle specific error codes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showErrorToast('Sign-in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showErrorToast('Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showErrorToast('Google Play Services not available');
      } else {
        showErrorToast('Failed to sign in with Google');
      }

      // Call error callback
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SocialSignInButton
      onPress={handleGoogleSignIn}
      text={text}
      icon={undefined} // TODO: Add google-logo.png to src/assets/icons/
      backgroundColor={isConfigured ? "#FFFFFF" : "#F5F5F5"}
      textColor={isConfigured ? "#1F1F1F" : "#9E9E9E"}
      loading={loading}
      disabled={!isConfigured}
      style={styles.googleButton}
    />
  );
};

const styles = {
  googleButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
};

export default GoogleSignInButton;
