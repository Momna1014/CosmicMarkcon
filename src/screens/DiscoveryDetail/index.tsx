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
import FastImage from 'react-native-fast-image';
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { useStyles } from './styles';
import StarIcon from '../../assets/icons/svgicons/HomeSvgIcons/star.svg';
import RightArrowIcon from '../../assets/icons/svgicons/HomeSvgIcons/right_arrow.svg';
import { moderateScale, Colors } from '../../theme';
import { DiscoveryDetailContentSkeleton } from '../../components/Skeleton';
import { MangaService, Manga, MangaByCategoryResponse } from '../../services/mangaApi';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';

// Analytics imports
import { trackContentView } from '../../utils/facebookEvents';
import firebaseService from '../../services/firebase/FirebaseService';
import { logMangaPressed } from '../../utils/mangaAnalytics';

type Props = {
  navigation: any;
  route?: any;
};

const DiscoveryDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const styles = useStyles();
  const categoryId = route?.params?.categoryId || '1';
  const categoryName = route?.params?.categoryName || 'Action';
  
  // State for API manga data
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [_error, setError] = useState<string | null>(null);

  // ===== Analytics: Track screen view =====
  useScreenView('DiscoveryDetailScreen', {
    screen_category: 'discovery_detail',
    category_id: categoryId,
    category_name: categoryName,
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [DiscoveryDetailScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [DiscoveryDetailScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('DiscoveryDetailScreen', 'DiscoveryDetailScreen');
    logFirebaseEvent('discovery_detail_screen_viewed', {
      category_id: categoryId,
      category_name: categoryName,
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent, categoryId, categoryName]);

  /**
   * Fetch manga list by category from API
   * @param isRefresh - Whether this is a pull-to-refresh action
   */
  const fetchMangaByCategory = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response: MangaByCategoryResponse = await MangaService.getMangaByCategory({
        category_id: parseInt(categoryId, 10),
      });
      
      // Log the full response to console
      console.log('📖 Manga by Category API Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        setMangas(response.data.mangas);
        console.log(`✅ Successfully fetched ${response.data.total_mangas} mangas for category: ${response.data.category.name}`);
      } else {
        setError(response.message);
        console.error('❌ API returned success: false', response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch manga';
      setError(errorMessage);
      console.error('❌ Failed to fetch manga:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchMangaByCategory();
  }, [fetchMangaByCategory]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    fetchMangaByCategory(true);
  }, [fetchMangaByCategory]);

  // Track screen view automatically
  // (Moved to top of component)

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleMangaPress = useCallback((item: Manga) => {
    console.log('📚 [DiscoveryDetailScreen] Manga pressed:', item.title);
    logFirebaseEvent('discovery_manga_pressed', {
      manga_id: item.id.toString(),
      manga_title: item.title,
      manga_rating: item.rating,
      category_id: categoryId,
      category_name: categoryName,
      screen: 'DiscoveryDetailScreen',
    });
    // Log manga name-based event: {manga_name}_pressed
    logMangaPressed(item.title, item.id, {
      screen: 'DiscoveryDetailScreen',
      category: categoryName,
      rating: item.rating,
    });
    // Track Facebook content view
    trackContentView('article', item.id.toString(), item.title, categoryName);
    
    navigation.navigate('HomeDetail', { mangaId: item.id });
  }, [navigation, logFirebaseEvent, categoryId, categoryName]);

  const renderMangaItem: ListRenderItem<Manga> = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.mangaCard}
      onPress={() => handleMangaPress(item)}
      activeOpacity={0.8}
    >
      <ImagePlaceholder
        source={{
          uri: item.image,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
        }}
        style={styles.mangaImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.mangaTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.ratingContainer}>
        <StarIcon width={moderateScale(14)} height={moderateScale(14)} />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  ), [handleMangaPress, styles]);

  const keyExtractor = useCallback((item: Manga) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={2}
        >
          <RightArrowIcon width={moderateScale(16)} height={moderateScale(16)} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Manga Grid */}
      {isLoading ? (
        <DiscoveryDetailContentSkeleton cardCount={9} />
      ) : mangas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Manga Found</Text>
          <Text style={styles.emptySubtitle}>There are no manga available in this category yet.</Text>
        </View>
      ) : (
        <FlatList
          data={mangas}
          renderItem={renderMangaItem}
          keyExtractor={keyExtractor}
          numColumns={3}
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

export default DiscoveryDetailScreen;
