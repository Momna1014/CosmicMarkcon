import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {styles} from '../../screens/Home/styles';
import {moderateScale} from '../../theme';

// Welcome Icon
import WelcomeStarIcon from '../../assets/icons/home_icons/welcome_star.svg';

// Profile Icon
import ProfileIcon from '../../assets/icons/bottomtab_icons/profile.svg';

interface HeaderSectionProps {
  userName: string;
  title?: string;
  onProfilePress?: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = memo(({userName, title = 'ASTRABOND', onProfilePress}) => {
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
          {userName ? (
            <>
              <Text style={styles.welcomeLabel}>WELCOME,</Text>
              <Text style={styles.welcomeName} numberOfLines={1}  >{userName}</Text>
            </>
          ) : (
            <Text style={styles.welcomeLabel}>WELCOME</Text>
          )}
        </View>
        {onProfilePress && (
          <TouchableOpacity
            onPress={onProfilePress}
            activeOpacity={0.7}
            style={styles.profileButton}
            hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
            >
            <ProfileIcon width={moderateScale(32)} height={moderateScale(32)} />
          </TouchableOpacity>
        )}
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
