import React, {memo} from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {styles} from '../../screens/Home/styles';
import {DailyEnergyBackground} from './constants';
import {moderateScale} from '../../theme';

// Icons
import DailyMoonIcon from '../../assets/icons/home_icons/daily_moon.svg';
import ReadHoroscopeIcon from '../../assets/icons/home_icons/right_arroq_with_background.svg';

interface DailyEnergyCardProps {
  zodiacSign: string;
  dailyMessage: string;
  onReadHoroscope: () => void;
}

const DailyEnergyCard: React.FC<DailyEnergyCardProps> = memo(
  ({zodiacSign, dailyMessage, onReadHoroscope}) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.dailyEnergyCard}>
        <ImageBackground
          source={DailyEnergyBackground}
          style={styles.dailyEnergyBackground}
          imageStyle={styles.dailyEnergyImageStyle}
          resizeMode="cover">
          <View style={styles.dailyEnergyContent}>
            {/* Header */}
            <View style={styles.dailyEnergyHeader}>
              <View style={styles.dailyEnergyLeft}>
                <DailyMoonIcon
                  width={moderateScale(24)}
                  height={moderateScale(24)}
                  style={styles.dailyMoonIcon}
                />
                <Text style={styles.dailyEnergyLabel}>DAILY ENERGY</Text>
              </View>
              <View style={styles.zodiacBadge}>
                <Text style={styles.zodiacText}>{zodiacSign}</Text>
              </View>
            </View>

            {/* Message */}
            <Text style={styles.dailyEnergyMessage}>{dailyMessage}</Text>

            {/* Read Horoscope Button */}
            <TouchableOpacity
              style={styles.readHoroscopeButton}
              onPress={onReadHoroscope}
              activeOpacity={0.7}>
              <Text style={styles.readHoroscopeText}>READ HOROSCOPE</Text>
              <ReadHoroscopeIcon
                width={moderateScale(40)}
                height={moderateScale(40)}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Animated.View>
    );
  },
);

DailyEnergyCard.displayName = 'DailyEnergyCard';

export default DailyEnergyCard;
