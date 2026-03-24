import React, {memo, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../theme';
import CrossIcon from '../../../assets/icons/home_icons/cross.svg';
import GradientText from '../../../components/GradientText';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = memo(({title, subtitle}) => {
  const navigation = useNavigation();

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Top row: Cross button, Title, Spacer */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}>
          <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
        </TouchableOpacity>
        
        <GradientText style={styles.title}>{title}</GradientText>
        
        <View style={styles.spacer} />
      </View>
      
      {/* Subtitle below */}
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
});

ChatHeader.displayName = 'ChatHeader';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 209, 243, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(32),
  },
  subtitle: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(16),
    color: 'rgba(194, 209, 243, 1)',
    marginTop: verticalScale(4),
    fontWeight: '600',
    textAlign: 'center',
  },
  spacer: {
    width: moderateScale(40),
  },
});

export default ChatHeader;
