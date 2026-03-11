/**
 * LocationPickerModal Component
 *
 * A reusable location picker modal for selecting country and city
 * with lazy loading and keyboard handling
 */

import React, {memo, useCallback, useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Country, City, ICountry, ICity} from 'country-state-city';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';

// Lazy load countries only when needed
let cachedCountries: ICountry[] | null = null;
const getCountries = () => {
  if (!cachedCountries) {
    cachedCountries = Country.getAllCountries();
  }
  return cachedCountries;
};

interface CountryItemProps {
  item: ICountry;
  onSelect: (country: ICountry) => void;
}

const CountryItem = memo<CountryItemProps>(({item, onSelect}) => {
  const handlePress = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={handlePress}
      activeOpacity={0.7}>
      <Text style={styles.pickerItemFlag}>{item.flag}</Text>
      <Text style={styles.pickerItemText}>{item.name}</Text>
    </TouchableOpacity>
  );
});

interface CityItemProps {
  item: ICity;
  onSelect: (city: ICity) => void;
}

const CityItem = memo<CityItemProps>(({item, onSelect}) => {
  const handlePress = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={handlePress}
      activeOpacity={0.7}>
      <Text style={styles.pickerItemText}>{item.name}</Text>
      {item.stateCode && (
        <Text style={styles.pickerItemSubtext}>, {item.stateCode}</Text>
      )}
    </TouchableOpacity>
  );
});

// Country Picker Modal
interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: ICountry) => void;
}

export const CountryPickerModal = memo<CountryPickerModalProps>(
  ({visible, onClose, onSelect}) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [countries, setCountries] = useState<ICountry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load countries only when modal is visible
    useEffect(() => {
      if (visible && countries.length === 0) {
        // Use InteractionManager to avoid blocking the main thread
        const timer = setTimeout(() => {
          setCountries(getCountries());
          setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [visible, countries.length]);

    // Reset search when modal closes
    useEffect(() => {
      if (!visible) {
        setSearchQuery('');
      }
    }, [visible]);

    const filteredCountries = useMemo(() => {
      if (!searchQuery) return countries;
      const query = searchQuery.toLowerCase();
      return countries.filter(country =>
        country.name.toLowerCase().includes(query),
      );
    }, [countries, searchQuery]);

    const handleSelect = useCallback(
      (country: ICountry) => {
        onSelect(country);
        onClose();
      },
      [onSelect, onClose],
    );

    const renderItem = useCallback(
      ({item}: {item: ICountry}) => (
        <CountryItem item={item} onSelect={handleSelect} />
      ),
      [handleSelect],
    );

    const keyExtractor = useCallback((item: ICountry) => item.isoCode, []);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.fullScreenModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <StatusBar barStyle="light-content" />
          <View style={[styles.modalHeader, {paddingTop: insets.top + 10}]}>
            <Text style={styles.pickerTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.pickerCloseButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.pickerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
              returnKeyType="search"
              autoCorrect={false}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading countries...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCountries}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.pickerList}
              contentContainerStyle={{paddingBottom: insets.bottom + 20}}
              showsVerticalScrollIndicator={false}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              updateCellsBatchingPeriod={50}
              windowSize={10}
              removeClippedSubviews={true}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            />
          )}
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

// City Picker Modal
interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: ICity) => void;
  countryCode: string;
  countryName: string;
}

export const CityPickerModal = memo<CityPickerModalProps>(
  ({visible, onClose, onSelect, countryCode, countryName}) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [cities, setCities] = useState<ICity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cities only when modal is visible
    useEffect(() => {
      if (visible && countryCode) {
        setIsLoading(true);
        // Use timeout to avoid blocking main thread
        const timer = setTimeout(() => {
          const citiesData = City.getCitiesOfCountry(countryCode) || [];
          setCities(citiesData);
          setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [visible, countryCode]);

    // Reset search when modal closes
    useEffect(() => {
      if (!visible) {
        setSearchQuery('');
      }
    }, [visible]);

    const filteredCities = useMemo(() => {
      if (!searchQuery) return cities;
      const query = searchQuery.toLowerCase();
      return cities.filter(city => city.name.toLowerCase().includes(query));
    }, [cities, searchQuery]);

    const handleSelect = useCallback(
      (city: ICity) => {
        onSelect(city);
        onClose();
      },
      [onSelect, onClose],
    );

    const renderItem = useCallback(
      ({item}: {item: ICity}) => (
        <CityItem item={item} onSelect={handleSelect} />
      ),
      [handleSelect],
    );

    const keyExtractor = useCallback(
      (item: ICity, index: number) => `${item.name}-${index}`,
      [],
    );

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.fullScreenModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <StatusBar barStyle="light-content" />
          <View style={[styles.modalHeader, {paddingTop: insets.top + 10}]}>
            <Text style={styles.pickerTitle}>Select City</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.pickerCloseButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.pickerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search city..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
              returnKeyType="search"
              autoCorrect={false}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading cities...</Text>
            </View>
          ) : filteredCities.length > 0 ? (
            <FlatList
              data={filteredCities}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.pickerList}
              contentContainerStyle={{paddingBottom: insets.bottom + 20}}
              showsVerticalScrollIndicator={false}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              updateCellsBatchingPeriod={50}
              windowSize={10}
              removeClippedSubviews={true}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No cities found for {countryName}
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.white,
  },
  pickerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCloseText: {
    fontSize: fontScale(18),
    color: Colors.white,
  },
  searchContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radiusScale(12),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerList: {
    flex: 1,
    paddingHorizontal: horizontalScale(10),
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  pickerItemFlag: {
    fontSize: fontScale(24),
    marginRight: horizontalScale(12),
  },
  pickerItemText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(16),
    color: Colors.white,
  },
  pickerItemSubtext: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default {CountryPickerModal, CityPickerModal};
