/**
 * Onboarding Container
 *
 * Manages onboarding flow and state between screens
 */

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation, CommonActions} from '@react-navigation/native';
import {Colors} from '../../theme';
import {useApp} from '../../contexts/AppContext';

import OnboardingScreen1, {AlignmentOption} from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';
import OnboardingScreen4 from './OnboardingScreen4';
import OnboardingScreen5 from './OnboardingScreen5';
import OnboardingScreen6 from './OnboardingScreen6';
import OnboardingScreen7 from './OnboardingScreen7';
import OnboardingScreen8 from './OnboardingScreen8';
import OnboardingScreen9 from './OnboardingScreen9';
import OnboardingScreen10 from './OnboardingScreen10';
import OnboardingScreen11 from './OnboardingScreen11';

// Re-export for external use
export type {AlignmentOption};

export interface OnboardingData {
  alignment: AlignmentOption;
  seeking: string[];
  clarity: string[];
  gender: string | null;
  name: string;
  birthday: Date | null;
  zodiacSign: string | null;
  birthTime: string;
  city: string;
  country: string;
}

export const OnboardingContainer: React.FC = () => {
  const navigation = useNavigation();
  const {setOnboardingCompleted, isPremium} = useApp();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    alignment: null,
    seeking: [],
    clarity: [],
    gender: null,
    name: '',
    birthday: null,
    zodiacSign: null,
    birthTime: '',
    city: '',
    country: '',
  });

  const handleScreen1Continue = () => {
    console.log('\n\ud83d\udd35 [Screen 1] Continue pressed - navigating to Screen 2');
    setCurrentScreen(2);
  };

  const handleGoBack = () => {
    if (currentScreen > 1) {
      console.log(`\n\ud83d\udd35 [Screen ${currentScreen}] Going back to Screen ${currentScreen - 1}`);
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleScreen2Next = (seeking: string[]) => {
    if (seeking.length > 0) {
      console.log('\n\ud83d\udd35 [Screen 2] Seeking Selected:', seeking);
      setOnboardingData(prev => {
        const updated = {...prev, seeking};
        console.log('\ud83d\udce6 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
        return updated;
      });
    } else {
      console.log('\n\ud83d\udd35 [Screen 2] No seeking selected - moving forward');
    }
    setCurrentScreen(3);
  };

  const handleScreen3Next = (clarity: string[]) => {
    if (clarity.length > 0) {
      console.log('\n\ud83d\udd35 [Screen 3] Clarity Selected:', clarity);
      setOnboardingData(prev => {
        const updated = {...prev, clarity};
        console.log('\ud83d\udce6 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
        return updated;
      });
    } else {
      console.log('\n\ud83d\udd35 [Screen 3] No clarity selected - moving forward');
    }
    setCurrentScreen(4);
  };

  const handleScreen4Next = (gender: string | null) => {
    if (gender) {
      console.log('\n\ud83d\udd35 [Screen 4] Gender Selected:', gender);
      setOnboardingData(prev => {
        const updated = {...prev, gender};
        console.log('\ud83d\udce6 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
        return updated;
      });
    } else {
      console.log('\n\ud83d\udd35 [Screen 4] No gender selected - moving forward');
    }
    setCurrentScreen(5);
  };

  const handleScreen5Next = (name: string) => {
    if (name) {
      console.log('\n\ud83d\udd35 [Screen 5] Name Entered:', name);
      setOnboardingData(prev => {
        const updated = {...prev, name};
        console.log('\ud83d\udce6 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
        return updated;
      });
    } else {
      console.log('\n\ud83d\udd35 [Screen 5] No name entered - moving forward');
    }
    setCurrentScreen(6);
  };

  const handleScreen6Next = () => {
    console.log('\n🔵 [Screen 6] Unlock Analysis Info Viewed');
    console.log('📦 [OnboardingData] Passing forward:', JSON.stringify(onboardingData, null, 2));
    setCurrentScreen(7);
  };

  const handleScreen7Next = () => {
    console.log('\n🔵 [Screen 7] Personalized Insights Info Viewed');
    console.log('📦 [OnboardingData] Passing forward:', JSON.stringify(onboardingData, null, 2));
    setCurrentScreen(8);
  };

  const handleScreen8Next = () => {
    console.log('\n🔵 [Screen 8] Chart Preview Viewed');
    console.log('📦 [OnboardingData] Passing forward:', JSON.stringify(onboardingData, null, 2));
    setCurrentScreen(9);
  };

  const handleScreen9Next = (birthTime: string, city: string, country: string) => {
    console.log('\n🔵 [Screen 9] Birth Details Entered:');
    console.log('   - Birth Time:', birthTime);
    console.log('   - City:', city);
    console.log('   - Country:', country);
    setOnboardingData(prev => {
      const updated = {...prev, birthTime, city, country};
      console.log('📦 [OnboardingData] COMPLETE DATA for Screen 10:', JSON.stringify(updated, null, 2));
      return updated;
    });
    setCurrentScreen(10);
  };

  const handleScreen10Complete = () => {
    console.log('\n🔵 [Screen 10] Loading Complete - Data Saved to Redux');
    console.log('📦 [OnboardingData] Final state:', JSON.stringify(onboardingData, null, 2));
    setCurrentScreen(11);
  };

  const handleScreen11Next = async () => {
    console.log('\n========================================');
    console.log('🎉 [Screen 11] ONBOARDING COMPLETE!');
    console.log('========================================');
    console.log('📦 FINAL ONBOARDING DATA:', JSON.stringify(onboardingData, null, 2));
    console.log('========================================\n');
    
    // Determine where to navigate based on premium status
    const targetScreen = isPremium ? 'MainApp' : 'Paywall';
    console.log('[OnboardingContainer] 🎬 isPremium:', isPremium, '-> navigating to:', targetScreen);
    
    // IMPORTANT: Reset navigation FIRST, then save onboarding state
    // This prevents race condition where component unmounts before navigation completes
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: targetScreen,
            params: targetScreen === 'Paywall' ? {source: 'onboarding_complete'} : undefined,
          },
        ],
      }),
    );
    
    // Mark onboarding as completed AFTER navigation reset
    // Use setTimeout to ensure navigation completes before state change
    // This prevents race condition where StackNavigator re-renders and removes Onboarding screen
    setTimeout(() => {
      setOnboardingCompleted(true);
    }, 300);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return <OnboardingScreen1 onContinue={handleScreen1Continue} />;
      case 2:
        return (
          <OnboardingScreen2
            onNext={handleScreen2Next}
            onGoBack={handleGoBack}
          />
        );
      case 3:
        return (
          <OnboardingScreen3
            onNext={handleScreen3Next}
            onGoBack={handleGoBack}
          />
        );
      case 4:
        return (
          <OnboardingScreen4
            onNext={handleScreen4Next}
            onGoBack={handleGoBack}
          />
        );
      case 5:
        return (
          <OnboardingScreen5
            onNext={handleScreen5Next}
            onGoBack={handleGoBack}
          />
        );
      case 6:
        return (
          <OnboardingScreen6
            onNext={handleScreen6Next}
            onGoBack={handleGoBack}
          />
        );
      case 7:
        return (
          <OnboardingScreen7
            onNext={handleScreen7Next}
            onboardingData={onboardingData}
          />
        );
      case 8:
        return (
          <OnboardingScreen8
            onNext={handleScreen8Next}
            onboardingData={onboardingData}
          />
        );
      case 9:
        return (
          <OnboardingScreen9
            onNext={handleScreen9Next}
            onboardingData={onboardingData}
          />
        );
      case 10:
        return (
          <OnboardingScreen10
            onComplete={handleScreen10Complete}
            onboardingData={onboardingData}
          />
        );
      case 11:
        return (
          <OnboardingScreen11
            onNext={handleScreen11Next}
            onboardingData={onboardingData}
          />
        );
      default:
        return <OnboardingScreen1 onContinue={handleScreen1Continue} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cosmicBackground,
  },
});

export default OnboardingContainer;

/**
 * Onboarding Container
 *
 * Simple wrapper for the onboarding screen
 */

// import React from 'react';
// import OnboardingScreen1 from './OnboardingScreen1';

// export const OnboardingContainer: React.FC = () => {
//   return <OnboardingScreen1 />;
// };

// export default OnboardingContainer;
