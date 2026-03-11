/**
 * DatePicker Component
 * Custom date picker using react-native-calendars
 * Provides full calendar with month/year navigation on both platforms
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../theme';
import CalendarIcon from '../assets/icons/onboarding_icons/calendar.svg';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

// Format date to YYYY-MM-DD for react-native-calendars
const formatDateForCalendar = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for display MM/DD/YYYY
const formatDateForDisplay = (date: Date | null, placeholder: string): string => {
  if (!date) return placeholder;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  minimumDate,
  maximumDate,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  // Current displayed month/year in calendar
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) return value.getMonth();
    return new Date().getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    if (value) return value.getFullYear();
    return 2000; // Default to year 2000 for birthday selection
  });

  // Generate years array (from min to max date)
  const minYear = minimumDate ? minimumDate.getFullYear() : 1900;
  const maxYear = maximumDate ? maximumDate.getFullYear() : new Date().getFullYear();
  const years = Array.from({length: maxYear - minYear + 1}, (_, i) => maxYear - i);

  const handlePress = () => {
    // Reset to selected value or default to year 2000
    if (value) {
      setCurrentMonth(value.getMonth());
      setCurrentYear(value.getFullYear());
    } else {
      setCurrentMonth(0); // January
      setCurrentYear(2000);
    }
    setShowCalendar(true);
  };

  const handleDayPress = useCallback((day: DateData) => {
    const selectedDate = new Date(day.year, day.month - 1, day.day);
    onChange(selectedDate);
    setShowCalendar(false);
  }, [onChange]);

  const handleClose = () => {
    setShowCalendar(false);
    setShowMonthPicker(false);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setShowYearPicker(false);
  };

  const handleMonthChange = (date: DateData) => {
    setCurrentMonth(date.month - 1);
    setCurrentYear(date.year);
  };

  // Current date string for calendar
  const currentDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;

  // Get marked dates for selected date
  const markedDates = value
    ? {
        [formatDateForCalendar(value)]: {
          selected: true,
          selectedColor: Colors.progressBarFilled,
          selectedTextColor: Colors.black,
        },
      }
    : {};

  // Calendar theme matching cosmic design
  const calendarTheme = {
    backgroundColor: Colors.cosmicBackground,
    calendarBackground: Colors.cosmicBackground,
    textSectionTitleColor: Colors.subHeading,
    selectedDayBackgroundColor: Colors.progressBarFilled,
    selectedDayTextColor: Colors.black,
    todayTextColor: Colors.progressBarFilled,
    dayTextColor: Colors.white,
    textDisabledColor: 'rgba(255, 255, 255, 0.3)',
    dotColor: Colors.progressBarFilled,
    selectedDotColor: Colors.black,
    arrowColor: Colors.white,
    disabledArrowColor: 'rgba(255, 255, 255, 0.3)',
    monthTextColor: Colors.white,
    indicatorColor: Colors.progressBarFilled,
    textDayFontFamily: FontFamilies.interRegular,
    textMonthFontFamily: FontFamilies.interSemiBold,
    textDayHeaderFontFamily: FontFamilies.interSemiBold,
    textDayFontSize: fontScale(16),
    textMonthFontSize: fontScale(18),
    textDayHeaderFontSize: fontScale(13),
  };

  // Custom header with month/year pickers
  const renderCustomHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setShowMonthPicker(true)}>
        <Text style={styles.headerButtonText}>{MONTHS[currentMonth]}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setShowYearPicker(true)}>
        <Text style={styles.headerButtonText}>{currentYear}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}>
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {formatDateForDisplay(value, placeholder)}
        </Text>
        <CalendarIcon
          width={horizontalScale(24)}
          height={verticalScale(24)}
        />
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={handleClose}>
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable style={styles.calendarContainer} onPress={e => e.stopPropagation()}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Month/Year Picker Header */}
            {renderCustomHeader()}

            <Calendar
              key={currentDateString}
              current={currentDateString}
              onDayPress={handleDayPress}
              onMonthChange={handleMonthChange}
              markedDates={markedDates}
              minDate={minimumDate ? formatDateForCalendar(minimumDate) : undefined}
              maxDate={maximumDate ? formatDateForCalendar(maximumDate) : undefined}
              theme={calendarTheme}
              enableSwipeMonths
              hideExtraDays={false}
              firstDay={0}
              hideArrows={false}
              renderHeader={() => null}
              style={styles.calendar}
            />
          </Pressable>
        </Pressable>

        {/* Month Picker Modal */}
        {showMonthPicker && (
          <Pressable 
            style={styles.pickerOverlay} 
            onPress={() => setShowMonthPicker(false)}>
            <Pressable style={styles.pickerContainer} onPress={e => e.stopPropagation()}>
              <Text style={styles.pickerTitle}>Select Month</Text>
              <View style={styles.monthGrid}>
                {MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthItem,
                      currentMonth === index && styles.selectedItem,
                    ]}
                    onPress={() => handleMonthSelect(index)}>
                    <Text
                      style={[
                        styles.monthItemText,
                        currentMonth === index && styles.selectedItemText,
                      ]}>
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Pressable>
        )}

        {/* Year Picker Modal */}
        {showYearPicker && (
          <Pressable 
            style={styles.pickerOverlay} 
            onPress={() => setShowYearPicker(false)}>
            <Pressable style={styles.yearPickerContainer} onPress={e => e.stopPropagation()}>
              <Text style={styles.pickerTitle}>Select Year</Text>
              <ScrollView 
                style={styles.yearScrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.yearScrollContent}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearItem,
                      currentYear === year && styles.selectedItem,
                    ]}
                    onPress={() => handleYearSelect(year)}>
                    <Text
                      style={[
                        styles.yearItemText,
                        currentYear === year && styles.selectedItemText,
                      ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(22),
    paddingHorizontal: horizontalScale(15),
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  dateText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: Colors.white,
  },
  placeholderText: {
    color: Colors.subHeading,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  calendarContainer: {
    backgroundColor: Colors.cosmicBackground,
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.white,
  },
  closeButton: {
    width: horizontalScale(32),
    height: verticalScale(32),
    borderRadius: radiusScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fontScale(16),
    color: Colors.white,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    gap: horizontalScale(20),
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    borderRadius: radiusScale(10),
    gap: horizontalScale(8),
  },
  headerButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: Colors.white,
  },
  dropdownArrow: {
    fontSize: fontScale(10),
    color: Colors.subHeading,
  },
  calendar: {
    paddingBottom: verticalScale(10),
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(30),
  },
  pickerContainer: {
    backgroundColor: Colors.cosmicBackground,
    borderRadius: radiusScale(16),
    padding: horizontalScale(20),
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  yearPickerContainer: {
    backgroundColor: Colors.cosmicBackground,
    borderRadius: radiusScale(16),
    padding: horizontalScale(20),
    width: '100%',
    maxHeight: verticalScale(400),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pickerTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.white,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: horizontalScale(8),
  },
  monthItem: {
    width: '30%',
    paddingVertical: verticalScale(12),
    borderRadius: radiusScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  monthItemText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: Colors.white,
  },
  yearScrollView: {
    maxHeight: verticalScale(300),
  },
  yearScrollContent: {
    paddingBottom: verticalScale(10),
  },
  yearItem: {
    paddingVertical: verticalScale(14),
    borderRadius: radiusScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  yearItemText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: Colors.white,
  },
  selectedItem: {
    backgroundColor: Colors.progressBarFilled,
  },
  selectedItemText: {
    color: Colors.black,
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
  },
});

export default DatePicker;
