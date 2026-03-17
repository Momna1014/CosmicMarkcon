/**
 * Onboarding Container
 *
 * Manages onboarding flow and state between screens
 */

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../theme';
import {useApp} from '../../contexts/AppContext';
import {getZodiacSign} from '../../components/mock/zodiacMockData';
import {showPaywall} from '../../utils/showPaywall';

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
  name: string;
  birthday: Date | null;
  zodiacSign: string | null;
  birthTime: string;
  city: string;
  country: string;
}

export const OnboardingContainer: React.FC = () => {
  const navigation = useNavigation();
  const {setOnboardingCompleted} = useApp();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    alignment: null,
    name: '',
    birthday: null,
    zodiacSign: null,
    birthTime: '',
    city: '',
    country: '',
  });

  const handleScreen1Continue = (alignment: AlignmentOption) => {
    console.log('\n🔵 [Screen 1] Life Alignment Selected:', alignment);
    setOnboardingData(prev => {
      const updated = {...prev, alignment};
      console.log('📦 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
      return updated;
    });
    setCurrentScreen(2);
  };

  const handleScreen2Next = (name: string) => {
    console.log('\n🔵 [Screen 2] Name Entered:', name);
    setOnboardingData(prev => {
      const updated = {...prev, name};
      console.log('📦 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
      return updated;
    });
    setCurrentScreen(3);
  };

  const handleScreen3Next = (birthday: Date) => {
    const zodiacData = getZodiacSign(birthday);
    const zodiacSign = zodiacData?.name || null;
    console.log('\n🔵 [Screen 3] Birthday Selected:', birthday.toISOString());
    console.log('🔵 [Screen 3] Zodiac Sign Calculated:', zodiacSign);
    setOnboardingData(prev => {
      const updated = {...prev, birthday, zodiacSign};
      console.log('📦 [OnboardingData] Current state:', JSON.stringify(updated, null, 2));
      return updated;
    });
    setCurrentScreen(4);
  };

  const handleScreen4Next = () => {
    console.log('\n🔵 [Screen 4] Cosmic Insight Viewed - Auto navigating...');
    console.log('📦 [OnboardingData] Passing forward:', JSON.stringify(onboardingData, null, 2));
    setCurrentScreen(5);
  };

  const handleScreen5Next = () => {
    console.log('\n🔵 [Screen 5] Zodiac Signs Info Viewed');
    console.log('📦 [OnboardingData] Passing forward:', JSON.stringify(onboardingData, null, 2));
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
    
    // Mark onboarding as completed
    await setOnboardingCompleted(true);
    
    // Navigate to Paywall screen using showPaywall utility
    console.log('[OnboardingContainer] 🎬 Navigating to Paywall...');
    showPaywall('onboarding_start_reading', navigation);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return <OnboardingScreen1 onContinue={handleScreen1Continue} />;
      case 2:
        return (
          <OnboardingScreen2
            onNext={handleScreen2Next}
            alignment={onboardingData.alignment}
          />
        );
      case 3:
        return (
          <OnboardingScreen3
            onNext={handleScreen3Next}
            name={onboardingData.name}
          />
        );
      case 4:
        return (
          <OnboardingScreen4
            onNext={handleScreen4Next}
            birthday={onboardingData.birthday!}
          />
        );
      case 5:
        return <OnboardingScreen5 onNext={handleScreen5Next} />;
      case 6:
        return <OnboardingScreen6 onNext={handleScreen6Next} />;
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
