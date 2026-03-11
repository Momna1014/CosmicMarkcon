/**
 * TimePickerModal Component
 *
 * A reusable time picker modal with smooth wheel scrolling
 * for selecting hour, minute, and AM/PM
 * Auto-selects centered item on scroll end
 */

import React, {memo, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

// Generate hours 1-12
const HOURS = Array.from({length: 12}, (_, i) => i + 1);
// Generate minutes 00-59
const MINUTES = Array.from({length: 60}, (_, i) => i);
// AM/PM options
const AMPM_OPTIONS = ['AM', 'PM'];

interface WheelPickerProps {
  data: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  width?: number;
  formatItem?: (item: string | number) => string;
}

const WheelPicker = memo<WheelPickerProps>(
  ({data, selectedIndex, onSelect, width = 70, formatItem}) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const isUserScrolling = useRef(false);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Scroll to selected item on mount and when selectedIndex changes externally
    useEffect(() => {
      if (!isUserScrolling.current) {
        const timer = setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: selectedIndex * ITEM_HEIGHT,
            animated: false,
          });
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [selectedIndex]);

    // Calculate and select the centered item based on scroll offset
    const calculateSelectedIndex = useCallback(
      (offsetY: number) => {
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
        return clampedIndex;
      },
      [data.length],
    );

    // Handle scroll end - snap to nearest item and select it
    const handleScrollEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const newIndex = calculateSelectedIndex(offsetY);

        // Snap to the exact position
        scrollViewRef.current?.scrollTo({
          y: newIndex * ITEM_HEIGHT,
          animated: true,
        });

        // Update selection
        if (newIndex !== selectedIndex) {
          onSelect(newIndex);
        }

        isUserScrolling.current = false;
      },
      [calculateSelectedIndex, selectedIndex, onSelect],
    );

    // Handle momentum scroll end
    const handleMomentumScrollEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        handleScrollEnd(event);
      },
      [handleScrollEnd],
    );

    // Handle drag end without momentum
    const handleScrollEndDrag = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Extract values immediately before event is recycled
        const offsetY = event.nativeEvent.contentOffset.y;

        // Clear any existing timeout
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }

        // Set a small timeout to check if momentum scroll will happen
        scrollTimeout.current = setTimeout(() => {
          const newIndex = calculateSelectedIndex(offsetY);

          // Snap to the exact position
          scrollViewRef.current?.scrollTo({
            y: newIndex * ITEM_HEIGHT,
            animated: true,
          });

          // Update selection
          if (newIndex !== selectedIndex) {
            onSelect(newIndex);
          }

          isUserScrolling.current = false;
        }, 50);
      },
      [calculateSelectedIndex, selectedIndex, onSelect],
    );

    const handleScrollBegin = useCallback(() => {
      isUserScrolling.current = true;
      // Clear timeout when new scroll begins
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    }, []);

    // Handle item tap
    const handleItemPress = useCallback(
      (index: number) => {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: true,
        });
        onSelect(index);
      },
      [onSelect],
    );

    return (
      <View style={[styles.wheelContainer, {width}]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          bounces={false}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          contentContainerStyle={styles.wheelContentContainer}>
          {data.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleItemPress(index)}
                style={styles.wheelItem}>
                <Text
                  style={[
                    styles.wheelItemText,
                    isSelected && styles.wheelItemTextSelected,
                  ]}>
                  {formatItem ? formatItem(item) : String(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {/* Selection indicator - centered highlight */}
        <View style={styles.selectionIndicator} pointerEvents="none" />
      </View>
    );
  },
);

export interface TimePickerValue {
  hour: number;
  minute: number;
  ampm: 'AM' | 'PM';
}

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: TimePickerValue) => void;
  initialValue?: TimePickerValue;
}

export const TimePickerModal = memo<TimePickerModalProps>(
  ({visible, onClose, onConfirm, initialValue}) => {
    const [hourIndex, setHourIndex] = React.useState(
      initialValue ? HOURS.indexOf(initialValue.hour) : 11,
    );
    const [minuteIndex, setMinuteIndex] = React.useState(
      initialValue?.minute ?? 0,
    );
    const [ampmIndex, setAmpmIndex] = React.useState(
      initialValue?.ampm === 'PM' ? 1 : 0,
    );

    // Reset to initial values when modal opens
    useEffect(() => {
      if (visible) {
        if (initialValue) {
          setHourIndex(HOURS.indexOf(initialValue.hour));
          setMinuteIndex(initialValue.minute);
          setAmpmIndex(initialValue.ampm === 'PM' ? 1 : 0);
        } else {
          // Default to 12:00 AM
          setHourIndex(11);
          setMinuteIndex(0);
          setAmpmIndex(0);
        }
      }
    }, [visible, initialValue]);

    const handleConfirm = useCallback(() => {
      onConfirm({
        hour: HOURS[hourIndex],
        minute: minuteIndex,
        ampm: AMPM_OPTIONS[ampmIndex] as 'AM' | 'PM',
      });
    }, [hourIndex, minuteIndex, ampmIndex, onConfirm]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            style={styles.timePickerContainer}
            onPress={e => e.stopPropagation()}>
            <Text style={styles.timePickerTitle}>Select Birth Time</Text>

            <View style={styles.pickerRow}>
              {/* Hour Picker */}
              <WheelPicker
                data={HOURS}
                selectedIndex={hourIndex}
                onSelect={setHourIndex}
                width={70}
                formatItem={item => String(item).padStart(2, '0')}
              />

              <Text style={styles.pickerColon}>:</Text>

              {/* Minute Picker */}
              <WheelPicker
                data={MINUTES}
                selectedIndex={minuteIndex}
                onSelect={setMinuteIndex}
                width={70}
                formatItem={item => String(item).padStart(2, '0')}
              />

              {/* AM/PM Picker */}
              <WheelPicker
                data={AMPM_OPTIONS}
                selectedIndex={ampmIndex}
                onSelect={setAmpmIndex}
                width={70}
              />
            </View>

            <View style={styles.timePickerButtons}>
              <TouchableOpacity
                style={styles.timePickerCancelButton}
                onPress={onClose}>
                <Text style={styles.timePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerConfirmButton}
                onPress={handleConfirm}>
                <Text style={styles.timePickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: '#1E1E2E',
    borderRadius: radiusScale(20),
    padding: horizontalScale(24),
    width: SCREEN_WIDTH - horizontalScale(48),
    alignItems: 'center',
  },
  timePickerTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.white,
    marginBottom: verticalScale(20),
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
  },
  pickerColon: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(26),
    color: Colors.white,
    marginBottom: verticalScale(4),
  },
  timePickerButtons: {
    flexDirection: 'row',
    marginTop: verticalScale(24),
    gap: horizontalScale(16),
    width: '100%',
  },
  timePickerCancelButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    borderRadius: radiusScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timePickerCancelText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timePickerConfirmButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    borderRadius: radiusScale(12),
    backgroundColor: Colors.white,
  },
  timePickerConfirmText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: Colors.black,
  },
  wheelContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  wheelContentContainer: {
    paddingVertical: ITEM_HEIGHT,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(22),
    color: 'rgba(255, 255, 255, 0.4)',
  },
  wheelItemTextSelected: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(26),
    color: Colors.white,
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    pointerEvents: 'none',
  },
});

export default TimePickerModal;
