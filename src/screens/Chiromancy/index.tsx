import React from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

type Props = {
  navigation: any;
};

const ChiromancyScreen: React.FC<Props> = () => {
  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <View style={styles.content}>
            <Text style={styles.title}>Chiromancy</Text>
            <Text style={styles.subtitle}>Read your palm lines</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  backgroundImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ChiromancyScreen;
