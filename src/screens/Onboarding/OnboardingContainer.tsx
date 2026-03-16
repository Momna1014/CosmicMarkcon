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
    birthTime: '',
    city: '',
    country: '',
  });

  const handleScreen1Continue = (alignment: AlignmentOption) => {
    setOnboardingData(prev => ({...prev, alignment}));
    setCurrentScreen(2);
  };

  const handleScreen2Next = (name: string) => {
    setOnboardingData(prev => ({...prev, name}));
    setCurrentScreen(3);
  };

  const handleScreen3Next = (birthday: Date) => {
    setOnboardingData(prev => ({...prev, birthday}));
    setCurrentScreen(4);
  };

  const handleScreen4Next = () => {
    setCurrentScreen(5);
  };

  const handleScreen5Next = () => {
    setCurrentScreen(6);
  };

  const handleScreen6Next = () => {
    setCurrentScreen(7);
  };

  const handleScreen7Next = () => {
    setCurrentScreen(8);
  };

  const handleScreen8Next = () => {
    setCurrentScreen(9);
  };

  const handleScreen9Next = (birthTime: string, city: string, country: string) => {
    setOnboardingData(prev => ({...prev, birthTime, city, country}));
    setCurrentScreen(10);
  };

  const handleScreen10Complete = () => {
    setCurrentScreen(11);
  };

  const handleScreen11Next = async () => {
    console.log('=== FINAL ONBOARDING DATA ===', onboardingData);
    
    // Mark onboarding as completed
    await setOnboardingCompleted(true);
    
    // Navigate to Paywall screen
    console.log('[OnboardingContainer] 🎬 Navigating to Paywall...');
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Paywall' as never,
          params: {source: 'onboarding_completed'},
        },
      ],
    });
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
