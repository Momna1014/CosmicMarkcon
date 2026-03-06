import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { useStyles } from './styles';
import { CategoryService, MangaCategory, CategoryListResponse } from '../../services/mangaApi';

// Analytics imports
import firebaseService from '../../services/firebase/FirebaseService';

import RomanceIcon from '../../assets/icons/svgicons/HomeSvgIcons/Romance.svg';
import ComedyIcon from '../../assets/icons/svgicons/HomeSvgIcons/Comedy.svg';
import ActionIcon from '../../assets/icons/svgicons/HomeSvgIcons/Action.svg';
import DramaIcon from '../../assets/icons/svgicons/HomeSvgIcons/darama.svg';
import FantasyIcon from '../../assets/icons/svgicons/HomeSvgIcons/fantasy.svg';
import HorrorIcon from '../../assets/icons/svgicons/HomeSvgIcons/Horror.svg';
import MysteryIcon from '../../assets/icons/svgicons/HomeSvgIcons/mystery.svg';
import FireIcon from '../../assets/icons/svgicons/HomeSvgIcons/fire.svg';
import { moderateScale, Colors } from '../../theme';
import { DiscoverContentSkeleton } from '../../components/Skeleton';

type IconComponent = React.FC<{ width: number; height: number }>;

/**
 * Icon mapping based on category name
 * Maps API category names to local SVG icons
 */
const CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  'action': ActionIcon,
  'romance': RomanceIcon,
  'comedy': ComedyIcon,
  'drama': DramaIcon,
  'fantasy': FantasyIcon,
  'horror': HorrorIcon,
  'mystery': MysteryIcon,
  'adventure': ActionIcon,
  'science fiction': MysteryIcon,
  'school life': ComedyIcon,
  'sports': FireIcon,
  'films': FireIcon,
};

/**
 * Get icon component for a category based on its name
 * Falls back to FireIcon if no matching icon found
 */
const getCategoryIcon = (categoryName: string): IconComponent => {
  const normalizedName = categoryName.toLowerCase().trim();
  return CATEGORY_ICON_MAP[normalizedName] || FireIcon;
};

type Props = {
  navigation: any;
  route?: any;
};

const DiscoverScreen: React.FC<Props> = ({ navigation, route }) => {
  // Get dynamic styles based on current theme
  const styles = useStyles();
  
  // State for API categories
  const [categories, setCategories] = useState<MangaCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [_error, setError] = useState<string | null>(null);

  // ===== Analytics: Track screen view =====
  useScreenView('DiscoverScreen', {
    screen_category: 'discover',
    previous_screen: route?.params?.from || 'unknown',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [DiscoverScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [DiscoverScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('DiscoverScreen', 'DiscoverScreen');
    logFirebaseEvent('discover_screen_viewed', {
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent]);

  /**
   * Fetch categories from API
   * @param isRefresh - Whether this is a pull-to-refresh action
   */
  const fetchCategories = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response: CategoryListResponse = await CategoryService.getCategories();
      
      // Log the full response to console
      console.log('📚 Category API Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        setCategories(response.data);
        console.log(`✅ Successfully fetched ${response.count} categories`);
      } else {
        setError(response.message);
        console.error('❌ API returned success: false', response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('❌ Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  // Track screen view automatically
  // (Moved to top of component)

  const handleCategoryPress = useCallback((category: MangaCategory) => {
    // Log analytics event
    console.log('📂 [DiscoverScreen] Category pressed:', category.name);
    logFirebaseEvent('discover_category_pressed', {
      category_id: category.id.toString(),
      category_name: category.name,
      category_slug: category.slug,
      screen: 'DiscoverScreen',
    });
    
    navigation.navigate('DiscoveryDetail', { 
      categoryId: category.id.toString(),
      categoryName: category.name,
      categorySlug: category.slug,
    });
  }, [navigation, logFirebaseEvent]);

  const renderCategory: ListRenderItem<MangaCategory> = useCallback(({ item }) => {
    const IconComponent = getCategoryIcon(item.name);
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryIcon}>
          <IconComponent width={moderateScale(32)} height={moderateScale(32)} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }, [handleCategoryPress, styles]);

  const keyExtractor = useCallback((item: MangaCategory) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.header}>
        <Text style={styles.title}>Explore Categories</Text>
        <Text style={styles.subtitle}>Discover amazing stories</Text>
      </View>
      
      {isLoading ? (
        <DiscoverContentSkeleton cardCount={10} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default DiscoverScreen;
