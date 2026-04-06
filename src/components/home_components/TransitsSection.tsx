import React, {memo, useCallback, useState, useMemo} from 'react';
import {View, ScrollView, Text, TouchableOpacity} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {styles} from '../../screens/Home/styles';
import {TransitData} from './types';
import {moderateScale} from '../../theme';
import TransitDetailModal from './TransitDetailModal';
import {TransitResponse} from '../../services/ConversationService';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TransitsSectionProps {
  transits: TransitData[];
  dynamicTransits?: TransitResponse[];
}

interface TransitItemProps {
  item: TransitData;
  index: number;
  onPress: (transit: TransitData) => void;
}

// Internal Transit Item - not exported
const TransitItem = memo(({item, index, onPress}: TransitItemProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, {damping: 15});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15});
  }, [scale]);

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const IconComponent = item.Icon;

  return (
    <Animated.View
      entering={FadeInRight.delay(100 + index * 80).springify()}
      style={styles.transitItem}>
      <AnimatedTouchable
        style={[styles.transitIconContainer, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.8}>
        <IconComponent width={moderateScale(48)} height={moderateScale(48)} />
      </AnimatedTouchable>
      <Text style={styles.transitName}>{item.name}</Text>
      <Text style={styles.transitSubtext}>{item.subtext}</Text>
    </Animated.View>
  );
});

TransitItem.displayName = 'TransitItem';

const TransitsSection: React.FC<TransitsSectionProps> = memo(({transits, dynamicTransits}) => {
  const [selectedTransit, setSelectedTransit] = useState<TransitData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Merge dynamic ChatGPT transit data with static icon data
  const mergedTransits = useMemo(() => {
    if (!dynamicTransits || dynamicTransits.length === 0) return transits;
    return transits.map(staticItem => {
      const dynamic = dynamicTransits.find(d => d.id === staticItem.id);
      if (dynamic) {
        return {
          ...staticItem,
          subtext: dynamic.subtext,
          description: dynamic.description,
        };
      }
      return staticItem;
    });
  }, [transits, dynamicTransits]);

  const handleTransitPress = useCallback((transit: TransitData) => {
    setSelectedTransit(transit);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedTransit(null);
  }, []);

  return (
    <View style={styles.sectionContainer}>
      <Animated.Text
        entering={FadeInDown.delay(250).springify()}
        style={styles.sectionTitle}>
        Todays Transits
      </Animated.Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.transitsContainer}
        style={styles.transitsScrollView}>
        {mergedTransits.map((item, index) => (
          <TransitItem
            key={item.id}
            item={item}
            index={index}
            onPress={handleTransitPress}
          />
        ))}
      </ScrollView>

      {/* Transit Detail Modal */}
      <TransitDetailModal
        visible={modalVisible}
        transit={selectedTransit}
        onClose={handleCloseModal}
      />
    </View>
  );
});

TransitsSection.displayName = 'TransitsSection';

export default TransitsSection;
