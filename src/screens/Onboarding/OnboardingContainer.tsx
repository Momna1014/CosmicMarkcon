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
import {getZodiacSign} from '../../components/mock/zodiacMockData';

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
import OnboardingScreen12 from './OnboardingScreen12';

// Re-export for external use
export type {AlignmentOption};

export interface OnboardingData {
  seeking: string[]; // Collected but not saved to Redux
  clarity: string[]; // Collected but not saved to Redux
  gender: string | null;
  name: string;
  birthday: Date | null;
  zodiacSign: string | null;
  city: string;
  country: string;
}

export const OnboardingContainer: React.FC = () => {
  const navigation = useNavigation();
  const {setOnboardingCompleted, isPremium} = useApp();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    seeking: [],
    clarity: [],
    gender: null,
    name: '',
    birthday: null,
    zodiacSign: null,
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
    console.log('\n🔵 [Screen 4] Gender Selected:', gender);
    setOnboardingData(prev => {
      const updated = {...prev, gender};
      console.log('📦 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
      return updated;
    });
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

  const handleScreen7Next = (birthday: Date) => {
    const zodiacSign = getZodiacSign(birthday).name;
    console.log('\n🔵 [Screen 7] Birthday Selected:', birthday.toISOString());
    console.log('🔮 [Screen 7] Zodiac Sign:', zodiacSign);
    setOnboardingData(prev => {
      const updated = {...prev, birthday, zodiacSign};
      console.log('📦 [OnboardingData] Passing forward:', JSON.stringify(updated, null, 2));
      return updated;
    });
    setCurrentScreen(8);
  };

  const handleScreen8Next = () => {
    console.log('\n🔵 [Screen 8] Chart Preview Viewed');
    console.log('📦 [OnboardingData] Passing forward:', JSON.stringify(onboardingData, null, 2));
    setCurrentScreen(9);
  };

  const handleScreen9Next = () => {
    console.log('\n🔵 [Screen 9] Insights Preview Complete');
    setCurrentScreen(10);
  };

  const handleScreen10Next = () => {
    console.log('\n🔵 [Screen 10] Video Complete');
    setCurrentScreen(11);
  };

  const handleScreen11Next = () => {
    console.log('\n🔵 [Screen 11] Video Complete');
    setCurrentScreen(12);
  };

  const handleScreen12Next = async () => {
    console.log('\n========================================')
    console.log('🎉 [Screen 12] ONBOARDING COMPLETE!');
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
            gender={onboardingData.gender}
          />
        );
      case 5:
        return (
          <OnboardingScreen5
            onNext={handleScreen5Next}
            onGoBack={handleGoBack}
            gender={onboardingData.gender}
          />
        );
      case 6:
        return (
          <OnboardingScreen6
            onNext={handleScreen6Next}
            onGoBack={handleGoBack}
            gender={onboardingData.gender}
          />
        );
      case 7:
        return (
          <OnboardingScreen7
            onNext={handleScreen7Next}
            onGoBack={handleGoBack}
          />
        );
      case 8:
        return (
          <OnboardingScreen8
            onNext={handleScreen8Next}
            onGoBack={handleGoBack}
          />
        );
      case 9:
        return (
          <OnboardingScreen9
            onNext={handleScreen9Next}
            onGoBack={handleGoBack}
            onboardingData={onboardingData}
          />
        );
      case 10:
        return (
          <OnboardingScreen10
            onContinue={handleScreen10Next}
          />
        );
      case 11:
        return (
          <OnboardingScreen11
            onContinue={handleScreen11Next}
          />
        );
      case 12:
        return (
          <OnboardingScreen12
            onContinue={handleScreen12Next}
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
