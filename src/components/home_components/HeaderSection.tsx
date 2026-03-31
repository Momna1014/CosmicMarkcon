import React, {memo} from 'react';
import {View, Text} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {styles} from '../../screens/Home/styles';
import {moderateScale} from '../../theme';

// Welcome Icon
import WelcomeStarIcon from '../../assets/icons/home_icons/welcome_star.svg';

interface HeaderSectionProps {
  userName: string;
  title?: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = memo(({userName, title = 'ASTRABOND'}) => {
  return (
    <>
      {/* Welcome Section */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.welcomeSection}>
        <WelcomeStarIcon
          width={moderateScale(24)}
          height={moderateScale(24)}
          style={styles.welcomeIcon}
        />
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeLabel}>WELCOME,</Text>
          <Text style={styles.welcomeName}>{userName}</Text>
        </View>
      </Animated.View>

      {/* Title Section */}
      <Animated.View
        entering={FadeInDown.delay(150).springify()}
        style={styles.titleSection}>
        <Text style={styles.mainTitle}>{title}</Text>
      </Animated.View>
    </>
  );
});

HeaderSection.displayName = 'HeaderSection';

export default HeaderSection;
