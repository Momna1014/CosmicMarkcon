/**
 * ZodiacCard Component
 * Displays the user's zodiac sign based on their birthday
 */

import React, {useMemo} from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../theme';
import {getZodiacSign} from './mock/zodiacMockData';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Background image for the zodiac card
const CardBackgroundImage = require('../assets/icons/onboarding_icons/dateback_card.png');

interface ZodiacCardProps {
  birthday: Date;
}

export const ZodiacCard: React.FC<ZodiacCardProps> = ({birthday}) => {
  const {t} = useTranslation();
  const zodiac = getZodiacSign(birthday);
  const signKey = zodiac.name.toLowerCase();
  
  // Get random trait index - memoized so it stays consistent during component lifecycle
  // but changes when user returns to the screen (component remounts)
  const traitIndex = useMemo(() => Math.floor(Math.random() * 5) + 1, []);

  // Get translated values
  const translatedSign = t(`zodiac.western.${signKey}`);
  const prefix = t(`zodiac.traits.${signKey}.trait${traitIndex}.prefix`);
  const highlight = t(`zodiac.traits.${signKey}.trait${traitIndex}.highlight`);
  const description = t(`zodiac.traits.${signKey}.trait${traitIndex}.description`);

  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(500).springify()}
      style={styles.container}>
      <ImageBackground
        source={CardBackgroundImage}
        style={styles.cardBackground}
        imageStyle={styles.cardImage}
        resizeMode="cover">
        <View style={styles.cardContent}>
          {/* YOUR SUN SIGN label */}
          <Animated.Text
            entering={FadeIn.delay(300).duration(400)}
            style={styles.labelText}>
            {t('onboarding.zodiacCard.sunSignLabel')}
          </Animated.Text>
          
          {/* You're a {Sign} */}
          <Animated.Text
            entering={FadeIn.delay(400).duration(400)}
            style={styles.titleText}>
            {t('onboarding.zodiacCard.youreA', {sign: translatedSign})}
          </Animated.Text>
          
          {/* Three words trait with prefix and highlight */}
          <Animated.Text
            entering={FadeIn.delay(500).duration(400)}
            style={styles.threeWordsText}>
            <Animated.Text style={styles.threeWordsNormal}>{prefix} </Animated.Text>
            <Animated.Text style={styles.threeWordsHighlight}>
              {highlight.replace('.', '')}
            </Animated.Text>
            <Animated.Text style={styles.threeWordsNormal}>.</Animated.Text>
          </Animated.Text>
          
          {/* Description */}
          <Animated.Text
            entering={FadeIn.delay(600).duration(400)}
            style={styles.descriptionText}>
            {description}
          </Animated.Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  cardBackground: {
    width: SCREEN_WIDTH - horizontalScale(48),
    height: verticalScale(200),
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  cardImage: {
    borderRadius: radiusScale(20),
  },
  cardContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(12),
    color: Colors.subHeading,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(6),
  },
  titleText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(28),
    color: Colors.white,
    marginBottom: verticalScale(8),
  },
  threeWordsText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    marginBottom: verticalScale(10),
  },
  threeWordsNormal: {
    color: Colors.white,
  },
  threeWordsHighlight: {
    color: Colors.progressBarFilled, // Yellow highlight
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
  },
  descriptionText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(14),
    color: Colors.subHeading,
    lineHeight: fontScale(20),
  },
});

export default ZodiacCard;
