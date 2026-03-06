import React, { useCallback, useMemo, memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ListRenderItem,
  Platform,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { useSelector, useDispatch } from 'react-redux';
import FastImage from 'react-native-fast-image';
import {
  Colors,
  FontFamilies,
  verticalScale,
  moderateScale,
} from '../../theme';
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import HomeSection, { MangaItem } from '../../components/HomeSection/HomeSection';
import ExploreByGenre from '../../components/ExploreByGenre/ExploreByGenre';
import FeaturedBanner, { FeaturedItem } from '../../components/FeaturedBanner/FeaturedBanner';
import RisingStars from '../../components/RisingStars/RisingStars';
import { RisingStarItem } from '../../components/RisingStars/RisingStarCard';
import { GenreItem } from '../../components/GenreCard/GenreCard';
import { HomeScreenSkeleton } from '../../components/Skeleton';
import { RootState, AppDispatch } from '../../redux/store';
import { saveManga, removeSavedManga } from '../../redux/slices/savedMangaSlice';
import { logMangaPressed, logMangaSaved, logMangaUnsaved } from '../../utils/mangaAnalytics';
import {
  DashboardService,
  DashboardData,
  DashboardResponse,
  DashboardTrendingItem,
  DashboardRecommendedItem,
  DashboardCompletedItem,
  DashboardNewlyOnAppItem,
  DashboardRisingStarItem,
  DashboardGenreItem,
} from '../../services/mangaApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { useRating } from '../../contexts/RatingContext';
import RatingModal from '../../components/RatingModal';

// Types for sections
interface HomeSectionData {
  id: string;
  title: string;
  subtitle?: string;
  showFireIcon?: boolean;
  showNumbering?: boolean;
  showRating?: boolean;
  variant?: 'trending' | 'recommended';
  data: MangaItem[];
}

// Define content item types for the main FlatList
type ContentItemType = 
  | { type: 'section'; data: HomeSectionData }
  | { type: 'featured'; data: FeaturedItem }
  | { type: 'genres'; data: GenreItem[] }
  | { type: 'risingStars'; data: RisingStarItem[] };

// Header height constant
const HEADER_HEIGHT = verticalScale(62);

// Glass Header Component
const GlassHeader = memo(() => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.glassHeaderContainer, { paddingTop: insets.top }]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={moderateScale(5)}
          reducedTransparencyFallbackColor={Colors.background}
        />
      ) : (
        <View style={styles.androidBlurFallback} />
      )}
      <View style={styles.headerContent}>
        <Text style={styles.appTitle}>MangaVerse</Text>
      </View>
    </View>
  );
});

GlassHeader.displayName = 'GlassHeader';

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  // Track screen view automatically
  useScreenView('Home Screen', {
    tab: 'home',
    feature: 'main_feed',
  });

  const dispatch = useDispatch<AppDispatch>();

  // Get userId from Redux
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Get saved manga from Redux for bookmark status
  const savedManga = useSelector((state: RootState) => {
    if (!userId) return {};
    return state.savedManga?.users?.[userId] || {};
  });

  // State for API data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [_error, setError] = useState<string | null>(null);
  
  // Notification Context - for requesting permission with default system dialog
  const {
    hasShownFirstPrompt,
    permissionStatus,
    isLoading: isNotificationLoading,
    requestPermission,
    markFirstPromptShown,
  } = useNotifications();

  // Rating Context - for app rating modal
  const {
    isRatingModalVisible,
    isLoading: isRatingLoading,
    showRatingModal,
    hideRatingModal,
    submitRating,
    checkShouldShowRating,
    incrementSessionCount,
  } = useRating();

  /**
   * Request notification permission with default system dialog after initial load
   */
  useEffect(() => {
    // Wait for dashboard data to load and notification context to initialize
    if (isLoading || isNotificationLoading) {
      return;
    }

    // Only request permission if:
    // 1. First prompt hasn't been shown yet
    // 2. Permission hasn't been determined yet
    if (!hasShownFirstPrompt && permissionStatus === 'not-determined') {
      console.log('[HomeScreen] 🔔 Will request notification permission with system dialog...');
      
      // Delay permission request to let user see the content first
      const task = InteractionManager.runAfterInteractions(() => {
        setTimeout(async () => {
          console.log('[HomeScreen] 🔔 Requesting notification permission now (system dialog)');
          await markFirstPromptShown();
          const granted = await requestPermission();
          console.log('[HomeScreen] 📋 Permission result:', granted ? 'GRANTED' : 'DENIED');
        }, 2000); // 2 second delay after content loads
      });

      return () => task.cancel();
    } else {
      console.log('[HomeScreen] 📋 Skipping notification permission request:', {
        hasShownFirstPrompt,
        permissionStatus,
      });
    }
  }, [isLoading, isNotificationLoading, hasShownFirstPrompt, permissionStatus, requestPermission, markFirstPromptShown]);

  /**
   * Increment session count on mount (once per app session)
   * This tracks how many times the user has opened the app
   */
  useEffect(() => {
    if (!isRatingLoading) {
      incrementSessionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRatingLoading]); // Only run once when rating context is ready

  /**
   * Show rating modal after dashboard loads
   * 
   * Conditions checked by checkShouldShowRating:
   * - User hasn't rated before
   * - Minimum session count reached (3 sessions)
   * - Enough time since last prompt (7 days)
   */
  useEffect(() => {
    // Wait for:
    // 1. Dashboard data to load
    // 2. Rating context to initialize
    // 3. Notification flow to complete (don't show both at once)
    if (isLoading || isRatingLoading || isNotificationLoading) {
      return;
    }

    // Don't show rating modal if notification prompt is pending
    if (!hasShownFirstPrompt && permissionStatus === 'not-determined') {
      return;
    }

    // Check if we should show rating modal
    const checkRating = async () => {
      const shouldShow = await checkShouldShowRating();
      if (shouldShow) {
        console.log('[HomeScreen] ⭐ Will show rating modal...');
        
        // Delay to let user see the content first (after notification prompt)
        const task = InteractionManager.runAfterInteractions(() => {
          setTimeout(() => {
            console.log('[HomeScreen] ⭐ Showing rating modal now');
            showRatingModal();
          }, 4000); // 4 second delay (after notification prompt which has 2s delay)
        });

        return () => task.cancel();
      }
    };

    checkRating();
  }, [isLoading, isRatingLoading, isNotificationLoading, hasShownFirstPrompt, permissionStatus, checkShouldShowRating, showRatingModal]);

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response: DashboardResponse = await DashboardService.getDashboardData({
        user_id: userId || 'guest',
      });

      console.log('📊 Dashboard API Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        setDashboardData(response.data);
        console.log('✅ Successfully fetched dashboard data');
      } else {
        setError(response.message);
        console.error('❌ API returned success: false', response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      setError(errorMessage);
      console.error('❌ Failed to fetch dashboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Preload images when dashboard data is available
  useEffect(() => {
    if (dashboardData) {
      const imageUrls: string[] = [];
      
      // Collect all image URLs
      dashboardData.trending_now.forEach(item => imageUrls.push(item.image));
      dashboardData.recommended_for_you.forEach(item => imageUrls.push(item.image));
      dashboardData.newly_on_app.forEach(item => imageUrls.push(item.image));
      dashboardData.completed.forEach(item => imageUrls.push(item.image));
      dashboardData.rising_stars.forEach(item => imageUrls.push(item.image));
      if (dashboardData.featured) {
        imageUrls.push(dashboardData.featured.image);
      }
      
      // Preload all images with high priority
      const sources = imageUrls.map(uri => ({
        uri,
        priority: FastImage.priority.high,
      }));
      
      FastImage.preload(sources);
      console.log(`🖼️ Preloading ${imageUrls.length} images`);
    }
  }, [dashboardData]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Transform API data to component format
  const transformedData = useMemo(() => {
    if (!dashboardData) return null;

    // Transform trending data
    const trendingData: MangaItem[] = dashboardData.trending_now.map((item: DashboardTrendingItem) => ({
      id: String(item.id),
      title: item.title,
      image: { uri: item.image },
      rating: item.rating,
    }));

    // Transform recommended data
    const recommendedData: MangaItem[] = dashboardData.recommended_for_you.map((item: DashboardRecommendedItem) => ({
      id: String(item.id),
      title: item.title,
      image: { uri: item.image },
      rating: item.rating,
    }));

    // Transform newly on app data
    const newlyOnAppData: MangaItem[] = dashboardData.newly_on_app.map((item: DashboardNewlyOnAppItem) => ({
      id: String(item.id),
      title: item.title,
      image: { uri: item.image },
      rating: 0,
    }));

    // Transform completed data
    const completedData: MangaItem[] = dashboardData.completed.map((item: DashboardCompletedItem) => ({
      id: String(item.id),
      title: item.title,
      image: { uri: item.image },
      rating: item.rating,
    }));

    // Transform genres data - limit to 4 items
    const genresData: GenreItem[] = dashboardData.genres.slice(0, 4).map((item: DashboardGenreItem) => ({
      id: String(item.id),
      name: item.name,
    }));

    // Transform rising stars data with bookmark status
    const risingStarsData: RisingStarItem[] = dashboardData.rising_stars.map((item: DashboardRisingStarItem) => ({
      id: String(item.id),
      title: item.title,
      genre: 'Manga', // API doesn't provide genre, using default
      image: { uri: item.image },
      isBookmarked: !!savedManga[String(item.id)],
      rating: item.rating,
      coverImage: item.image,
    }));

    // Transform featured data
    const featuredItem: FeaturedItem | null = dashboardData.featured ? {
      id: String(dashboardData.featured.id),
      title: dashboardData.featured.title,
      image: { uri: dashboardData.featured.image },
      rating: dashboardData.featured.rating,
      genres: dashboardData.featured.categories?.map(cat => cat.name) || dashboardData.featured.genres || [],
    } : null;

    // Build sections
    const sectionsBeforeFeatured: HomeSectionData[] = [
      {
        id: 'trending',
        title: 'Trending Now',
        subtitle: 'Top This Week',
        showFireIcon: true,
        showNumbering: true,
        showRating: false,
        variant: 'trending',
        data: trendingData,
      },
      {
        id: 'recommended',
        title: 'Recommended For You',
        showFireIcon: false,
        showNumbering: false,
        showRating: true,
        variant: 'recommended',
        data: recommendedData,
      },
      {
        id: 'newly',
        title: 'Newly On App',
        showFireIcon: false,
        showNumbering: false,
        showRating: true,
        variant: 'recommended',
        data: newlyOnAppData,
      },
    ];

    const sectionsAfterFeatured: HomeSectionData[] = [
      {
        id: 'completed',
        title: 'Completed Stories',
        showFireIcon: false,
        showNumbering: false,
        showRating: true,
        variant: 'recommended',
        data: completedData,
      },
    ];

    return {
      sectionsBeforeFeatured,
      sectionsAfterFeatured,
      featuredItem,
      genresData,
      risingStarsData,
    };
  }, [dashboardData, savedManga]);

  // Build the content list with proper ordering
  const contentList = useMemo<ContentItemType[]>(() => {
    if (!transformedData) return [];

    const items: ContentItemType[] = [
      // Sections before featured (Trending, Recommended, Newly On App)
      ...transformedData.sectionsBeforeFeatured.map(section => ({ type: 'section' as const, data: section })),
    ];

    // Featured Banner (only if available)
    if (transformedData.featuredItem) {
      items.push({ type: 'featured', data: transformedData.featuredItem });
    }

    // Sections after featured (Completed Stories)
    items.push(...transformedData.sectionsAfterFeatured.map(section => ({ type: 'section' as const, data: section })));

    // Explore By Genre
    if (transformedData.genresData.length > 0) {
      items.push({ type: 'genres', data: transformedData.genresData });
    }

    // Rising Stars
    if (transformedData.risingStarsData.length > 0) {
      items.push({ type: 'risingStars', data: transformedData.risingStarsData });
    }

    return items;
  }, [transformedData]);

  const handleItemPress = useCallback((item: MangaItem) => {
    console.log('Item pressed:', item.title);
    // Log manga name-based event: {manga_name}_pressed
    logMangaPressed(item.title, item.id, {
      screen: 'HomeScreen',
      section: 'home_section',
      rating: item.rating,
    });
    navigation.navigate('HomeDetail', { mangaId: item.id });
  }, [navigation]);

  const handleSeeAll = useCallback((sectionId: string) => {
    console.log('See all pressed for:', sectionId);
    // navigation.navigate('SeeAll', { sectionId });
  }, []);

  const handleGenrePress = useCallback((genre: GenreItem) => {
    console.log('Genre pressed:', genre.name);
    navigation.navigate('DiscoveryDetail', {
      categoryId: genre.id,
      categoryName: genre.name,
    });
  }, [navigation]);

  const handleGenreSeeMorePress = useCallback(() => {
    console.log('See More pressed - navigating to Discover tab');
    navigation.navigate('Discover');
  }, [navigation]);

  const handleFeaturedPress = useCallback((item: FeaturedItem) => {
    console.log('Featured pressed:', item.title);
    // Log manga name-based event: {manga_name}_pressed
    logMangaPressed(item.title, item.id, {
      screen: 'HomeScreen',
      section: 'featured_banner',
      rating: item.rating,
    });
    navigation.navigate('HomeDetail', { mangaId: item.id });
  }, [navigation]);

  const handleRisingStarPress = useCallback((item: RisingStarItem) => {
    console.log('Rising Star pressed:', item.title);
    // Log manga name-based event: {manga_name}_pressed
    logMangaPressed(item.title, item.id, {
      screen: 'HomeScreen',
      section: 'rising_stars',
      rating: item.rating,
    });
    navigation.navigate('HomeDetail', { mangaId: item.id });
  }, [navigation]);

  const handleBookmarkPress = useCallback((item: RisingStarItem) => {
    if (!userId) {
      console.log('User not logged in');
      return;
    }

    if (item.isBookmarked) {
      // Remove from saved
      dispatch(removeSavedManga({
        userId,
        mangaId: item.id,
      }));
      // Log manga name-based event: {manga_name}_unsaved
      logMangaUnsaved(item.title, item.id, {
        screen: 'HomeScreen',
        section: 'rising_stars',
      });
      console.log('Removed from saved:', item.title);
    } else {
      // Add to saved
      dispatch(saveManga({
        userId,
        mangaId: item.id,
        title: item.title,
        coverImage: item.coverImage || '',
        rating: item.rating || 0,
      }));
      // Log manga name-based event: {manga_name}_saved
      logMangaSaved(item.title, item.id, {
        screen: 'HomeScreen',
        section: 'rising_stars',
        rating: item.rating,
      });
      console.log('Saved:', item.title);
    }
  }, [userId, dispatch]);

  const renderItem: ListRenderItem<ContentItemType> = useCallback(({ item }) => {
    switch (item.type) {
      case 'section':
        return (
          <HomeSection
            title={item.data.title}
            subtitle={item.data.subtitle}
            showFireIcon={item.data.showFireIcon}
            showNumbering={item.data.showNumbering}
            showRating={item.data.showRating}
            variant={item.data.variant}
            data={item.data.data}
            onItemPress={handleItemPress}
            onSeeAll={() => handleSeeAll(item.data.id)}
          />
        );
      
      case 'featured':
        return (
          <FeaturedBanner
            item={item.data}
            onPress={handleFeaturedPress}
          />
        );
      
      case 'genres':
        return (
          <ExploreByGenre
            title="Explore By Genre"
            genres={item.data}
            onGenrePress={handleGenrePress}
            onSeeMorePress={handleGenreSeeMorePress}
          />
        );
      
      case 'risingStars':
        return (
          <RisingStars
            title="Rising Stars"
            data={item.data}
            onItemPress={handleRisingStarPress}
            onBookmarkPress={handleBookmarkPress}
          />
        );
      
      default:
        return null;
    }
  }, [handleItemPress, handleSeeAll, handleFeaturedPress, handleGenrePress, handleGenreSeeMorePress, handleRisingStarPress, handleBookmarkPress]);

  const keyExtractor = useCallback((item: ContentItemType, index: number) => {
    switch (item.type) {
      case 'section':
        return `section-${item.data.id}`;
      case 'featured':
        return `featured-${item.data.id}`;
      case 'genres':
        return 'genres';
      case 'risingStars':
        return 'risingStars';
      default:
        return `item-${index}`;
    }
  }, []);

  const insets = useSafeAreaInsets();

  // Show skeleton while loading
  if (isLoading) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <HomeScreenSkeleton />
        <GlassHeader />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <FlatList
        data={contentList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + HEADER_HEIGHT + verticalScale(20) },
        ]}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            progressViewOffset={insets.top + HEADER_HEIGHT}
            progressBackgroundColor={Colors.cardBackground}
          />
        }
      />
      <GlassHeader />
      
      {/* Rating Modal */}
      <RatingModal
        visible={isRatingModalVisible}
        onClose={hideRatingModal}
        onSubmitRating={submitRating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glassHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor:'red'
        // backgroundColor: Colors.background,
  },
  androidBlurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 11, 12, 0.85)',
  },
  headerContent: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: verticalScale(0), // Extra padding for bottom tab bar
  },
  appTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
  },
});

