/**
 * Onboarding Container
 *
 * Manages onboarding flow and state between screens
 */

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Colors} from '../../theme';

import OnboardingScreen1, {AlignmentOption} from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';
import OnboardingScreen4 from './OnboardingScreen4';
import OnboardingScreen5 from './OnboardingScreen5';

// Re-export for external use
export type {AlignmentOption};

export interface OnboardingData {
  alignment: AlignmentOption;
  name: string;
  birthday: Date | null;
}

export const OnboardingContainer: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    alignment: null,
    name: '',
    birthday: null,
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
    // TODO: Complete onboarding and navigate to main app
    console.log('Onboarding complete:', onboardingData);
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
