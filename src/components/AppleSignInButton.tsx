import React, {useState} from 'react';
import {Platform, Alert} from 'react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import SocialSignInButton from './SocialSignInButton';
import {showSuccessToast, showErrorToast, showInfoToast} from '../utils/toast';

interface AppleSignInButtonProps {
  onSuccess?: (userInfo: any) => void;
  onError?: (error: any) => void;
  text?: string;
}

/**
 * Apple Sign-In Button Component
 * 
 * Features:
 * - Handles Apple Sign-In flow
 * - iOS 13+ support
 * - Android support (via web flow)
 * - Error handling with toasts
 * - Loading states
 * - Reusable with callbacks
 * - Graceful degradation without configuration
 * 
 * Note: Apple Sign-In requires:
 * - iOS 13+
 * - Capability enabled in Xcode
 * - App ID configured in Apple Developer Portal
 */
const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continue with Apple',
}) => {
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  /**
   * Check if Apple Sign-In is supported
   */
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      const supported = appleAuth.isSupported;
      setIsSupported(supported);
      
      if (__DEV__) {
        if (supported) {
          console.log('✅ Apple Sign-In is supported on this device');
        } else {
          console.warn('⚠️ Apple Sign-In requires iOS 13+');
        }
      }
    } else {
      // Android: Would require web flow setup
      if (__DEV__) {
        console.log('ℹ️ Apple Sign-In on Android requires additional web flow setup');
      }
      setIsSupported(false);
    }
  }, []);

  /**
   * Handle Apple Sign-In
   */
  const handleAppleSignIn = async () => {
    // Check if supported
    if (!isSupported) {
      if (Platform.OS === 'ios') {
        showInfoToast(
          'iOS 13+ Required',
          'Apple Sign-In requires iOS 13 or later'
        );
      } else {
        showInfoToast(
          'iOS Only',
          'Apple Sign-In is currently available on iOS only'
        );
      }
      
      if (__DEV__) {
        Alert.alert(
          '⚙️ Apple Sign-In Not Available',
          Platform.OS === 'ios'
            ? 'Apple Sign-In requires iOS 13+\n\nEnsure:\n• iOS 13+ device/simulator\n• "Sign in with Apple" capability in Xcode\n• App ID configured in Apple Developer Portal\n\nSee SOCIAL_SIGNIN_GUIDE.md for details.'
            : 'Apple Sign-In on Android requires additional web flow setup.\n\nSee SOCIAL_SIGNIN_GUIDE.md for details.',
          [{text: 'OK'}]
        );
      }
      return;
    }

    setLoading(true);
    try {
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Get current authentication state
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      // Check if user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        if (__DEV__) {
          console.log('✅ Apple Sign-In successful:', appleAuthRequestResponse);
        }

        showSuccessToast('Signed in with Apple successfully!');

        // Call success callback
        if (onSuccess) {
          onSuccess(appleAuthRequestResponse);
        }

        // You can now send data to your backend
        // Example: await api.post('/auth/apple', {
        //   identityToken: appleAuthRequestResponse.identityToken,
        //   user: appleAuthRequestResponse.user,
        // });
      } else {
        throw new Error('Apple Sign-In was not authorized');
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Apple Sign-In error:', error);
      }

      // Handle specific error codes
      if (error.code === '1001') {
        // User cancelled
        showErrorToast('Sign-in cancelled');
      } else if (error.code === '1000') {
        // Unknown error
        showErrorToast('Failed to sign in with Apple');
      } else {
        showErrorToast('Apple Sign-In failed');
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
      onPress={handleAppleSignIn}
      text={text}
      icon={undefined} // TODO: Add apple-logo.png to src/assets/icons/
      backgroundColor={isSupported ? "#000000" : "#BDBDBD"}
      textColor="#FFFFFF"
      loading={loading}
      disabled={!isSupported}
    />
  );
};

export default AppleSignInButton;
