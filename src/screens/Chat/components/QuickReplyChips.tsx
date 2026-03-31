import React, {memo, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../../theme';
import {QuickReply} from '../chatMockData';

// Heart icon for chips - using heart.png with tint
const HeartIcon = require('../../../assets/icons/horoscope_icons/heart.png');
import {Image} from 'react-native';

interface QuickReplyChipProps {
  reply: QuickReply;
  onPress: (reply: QuickReply) => void;
}

const QuickReplyChip: React.FC<QuickReplyChipProps> = memo(({reply, onPress}) => {
  const handlePress = useCallback(() => {
    onPress(reply);
  }, [reply, onPress]);

  // Get icon color based on the chip type
  const getIconColor = useCallback(() => {
    switch (reply.id) {
      case 'heart':
        return 'rgba(243, 98, 180, 1)';
      case 'head':
        return 'rgba(245, 158, 11, 1)';
      case 'life':
        return 'rgba(98, 173, 243, 1)';
      case 'fate':
        return 'rgba(134, 239, 172, 1)';
      default:
        return 'rgba(243, 98, 180, 1)';
    }
  }, [reply.id]);

  return (
    <TouchableOpacity
      style={styles.chip}
      onPress={handlePress}
      activeOpacity={0.7}>
      <Image
        source={HeartIcon}
        style={[styles.chipIcon, {tintColor: getIconColor()}]}
        resizeMode="contain"
      />
      <Text style={styles.chipLabel}>{reply.label}</Text>
    </TouchableOpacity>
  );
});

QuickReplyChip.displayName = 'QuickReplyChip';

interface QuickReplyChipsProps {
  replies: QuickReply[];
  onReplyPress: (reply: QuickReply) => void;
}

const QuickReplyChips: React.FC<QuickReplyChipsProps> = memo(
  ({replies, onReplyPress}) => {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {replies.map((reply) => (
            <QuickReplyChip key={reply.id} reply={reply} onPress={onReplyPress} />
          ))}
        </ScrollView>
      </View>
    );
  },
);

QuickReplyChips.displayName = 'QuickReplyChips';

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 209, 243, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(12),
    gap: horizontalScale(10),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderRadius: radiusScale(20),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    gap: horizontalScale(6),
  },
  chipIcon: {
    width: moderateScale(16),
    height: moderateScale(16),
  },
  chipLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: '#FFFFFF',
  },
});

export default QuickReplyChips;
