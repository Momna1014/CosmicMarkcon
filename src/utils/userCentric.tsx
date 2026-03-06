import { NativeModules } from 'react-native';
import { useEffect } from 'react';
import {
  Usercentrics,
  UsercentricsOptions,
  UsercentricsUserInteraction,
} from '@usercentrics/react-native-sdk';
import { isFirstLaunch, markFirstLaunchCompleted } from './firstLaunchHelper';
import { consentManager } from '../services/ConsentManager';
import { requestTrackingPermissions } from '../services/TrackingService';
import { requestNotificationPermissions } from '../config/initializers/notificationInitializer';

/**
 * Request notification permissions with a delay
 * This ensures a smooth UX by spacing out permission requests
 */
const requestNotificationPermissionsWithDelay = async (): Promise<void> => {
  // Wait a bit before requesting notification permissions
  // This gives the user time to process the previous permissions
  setTimeout(async () => {
    try {
      console.log('[UserCentric] Requesting notification permissions after delay...');
      await requestNotificationPermissions();
    } catch (error) {
      console.error('[UserCentric] Failed to request notification permissions:', error);
    }
  }, 2000); // 2 second delay after consent/ATT flow
};

/**
 * Initialize Usercentrics programmatically (non-hook version)
 * Can be called from anywhere, not just React components
 * 
 * This function handles the complete first-launch flow:
 * 1. Checks if it's the first launch
 * 2. Checks if User Centric is required in the user's region
 * 3. Shows consent dialog if required
 * 4. Handles Accept/Deny responses
 * 5. Integrates with ATT (App Tracking Transparency)
 * 6. Conditionally initializes SDKs based on consent
 * 7. Requests notification permissions AFTER consent flow
 * 
 * @param options - Usercentrics configuration options
 */
export const initializeUserCentric = async (options?: UsercentricsOptions): Promise<void> => {
  try {
    // Configure Usercentrics
    if (options) {
      try {
        Usercentrics.configure(options);
        console.log('[UserCentric] Configured successfully');
      } catch (cfgErr) {
        console.log('[UserCentric] Configure error:', cfgErr);
      }
    }

    // Get User Centric status
    const status = await Usercentrics.status();
    console.log('[UserCentric] Status retrieved:', JSON.stringify({
      shouldCollectConsent: status?.shouldCollectConsent,
      bannerRequiredAtLocation: status?.geolocationRuleset?.bannerRequiredAtLocation,
      hasGeolocationRuleset: !!status?.geolocationRuleset,
    }));

    // Check if this is the first launch
    const isFirst = await isFirstLaunch();
    console.log('[UserCentric] First launch:', isFirst);

    // Check if banner is required at this location (e.g., EU regions)
    // IMPORTANT: Only use bannerRequiredAtLocation to determine if consent is required.
    // Do NOT rely on shouldCollectConsent as it becomes false after banner is shown once,
    // even if user killed app without making a decision.
    const bannerAtLocation = status?.geolocationRuleset?.bannerRequiredAtLocation;
    const bannerRequired = bannerAtLocation !== false;
    console.log('[UserCentric] Banner required at location:', bannerRequired, 
      '(bannerAtLocation:', bannerAtLocation, ')');

    // If banner is NOT required (user outside EU/required regions)
    if (!bannerRequired) {
      console.log('[UserCentric] Banner not required at this location (non-EU region)');
      
      // Initialize all SDKs automatically
      await consentManager.handleAutomaticConsent('region-not-required');
      
      // Request notification permissions AFTER consent is handled
      await requestNotificationPermissionsWithDelay();
      
      // Mark first launch as completed
      if (isFirst) {
        await markFirstLaunchCompleted();
      }
      
      return;
    }

    // If banner is required (EU region), we need EXPLICIT user consent
    // Check if user has already given EXPLICIT consent (not 'not-determined')
    const consentState = consentManager.getConsentState();
    
    // Only consider consent as "already given" if it's explicitly 'accepted' or 'denied'
    // If it's still 'not-determined', user never made an explicit decision
    // (e.g., killed app during consent dialog)
    const hasExplicitDecision = consentState === 'accepted' || consentState === 'denied';
    
    if (!isFirst && hasExplicitDecision) {
      console.log('[UserCentric] Not first launch - using explicit user consent from previous session:', consentState);
      
      if (consentState === 'accepted' && !consentManager.areSdksInitialized()) {
        // User previously accepted, but SDKs not initialized yet
        console.log('[UserCentric] Re-initializing SDKs based on previous consent');
        await consentManager.handleAccept();
      }
      
      return;
    }

    // First launch OR user never explicitly consented - show consent dialog
    // IMPORTANT: Always show banner in EU region if user hasn't explicitly consented
    // Do NOT rely on shouldCollectConsent as it becomes false after banner is shown once,
    // even if user killed app without making a decision
    console.log('[UserCentric] EU region requires explicit consent - showing consent dialog...');
    console.log('[UserCentric] isFirst:', isFirst, ', consentState:', consentState, ', hasExplicitDecision:', hasExplicitDecision);

    try {
      console.log('[UserCentric] Showing consent dialog...');
      
      // Use showFirstLayer() to show the initial banner with Accept/Deny buttons
      // This provides a clearer UX with explicit Accept and Deny options
      // Keep showing banner until user makes an explicit decision (acceptAll, denyAll, or granular)
      // This prevents users from dismissing the banner via Android back button without consent
      let userMadeDecision = false;
      
      while (!userMadeDecision) {
        const userResponse = await Usercentrics.showFirstLayer();
        console.log('[UserCentric] User response:', userResponse);

        // Handle user interaction
        // userResponse.userInteraction can be: acceptAll, denyAll, granular, noInteraction
        if (userResponse?.userInteraction === UsercentricsUserInteraction.acceptAll) {
          console.log('[UserCentric] ✅ User accepted consent');
          userMadeDecision = true;
          
          // Request ATT permission (iOS only)
          console.log('[UserCentric] Requesting ATT permission...');
          const attStatus = await requestTrackingPermissions();
          console.log('[UserCentric] ATT Status:', attStatus);
          
          // Handle consent acceptance (will check ATT and conditionally init SDKs)
          await consentManager.handleAccept();
          
        } else if (userResponse?.userInteraction === UsercentricsUserInteraction.denyAll) {
          console.log('[UserCentric] ❌ User denied consent');
          userMadeDecision = true;
          
          // Handle consent denial (no SDKs will be initialized)
          await consentManager.handleDeny();
          
        } else if (userResponse?.userInteraction === UsercentricsUserInteraction.granular) {
          // User gave granular consent
          console.log('[UserCentric] User gave granular consent');
          userMadeDecision = true;
          
          // Check if user consented to specific services
          const hasConsents = userResponse?.consents?.some((c: any) => c.status);
          if (hasConsents) {
            await consentManager.handleAccept();
          } else {
            await consentManager.handleDeny();
          }
        } else {
          // User dismissed via back button or no interaction
          // Re-show the banner - user MUST make a decision in EU regions
          console.log('[UserCentric] ⚠️ User dismissed without decision - re-showing banner...');
          userMadeDecision = false;
        }
      }

      // Mark first launch as completed
      await markFirstLaunchCompleted();
      
      // Request notification permissions AFTER consent and ATT flow
      await requestNotificationPermissionsWithDelay();
        
      } catch (showErr) {
        console.log('[UserCentric] Error showing consent layer:', showErr);
        
        // On error, don't initialize SDKs (safer)
        await consentManager.handleDeny();
        
        // Still mark first launch as completed to avoid showing again
        await markFirstLaunchCompleted();
      }
  } catch (error) {
    console.log('[UserCentric] Error initializing:', error);
    
    // On error, mark first launch as completed to avoid infinite loop
    const isFirst = await isFirstLaunch();
    if (isFirst) {
      await markFirstLaunchCompleted();
    }
  }
};

/**
 * Reusable hook to initialize Usercentrics and optionally show consent layers.
 *
 * Usage:
 *   useUserCentric({ ruleSetId: '8IUuz2vdeMsjUu' });
 *
 * The hook runs once on mount and will:
 *  - configure Usercentrics if options provided
 *  - fetch status and, if needed, show the second layer
 */
export function useUserCentric(options?: UsercentricsOptions) {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await initializeUserCentric(options);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [options ? JSON.stringify(options) : null]);
}

// Keep old export for backward compatibility (as hook)
export function userCentric(options?: UsercentricsOptions) {
  return useUserCentric(options);
}

export default useUserCentric;
