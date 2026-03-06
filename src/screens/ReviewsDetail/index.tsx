import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';
import { Colors, moderateScale } from '../../theme';
import { RootState } from '../../redux/store';
import { CommentService, MangaComment } from '../../services/mangaApi';
import { UserStorage } from '../../utils/userStorage';
import { getRelativeTime } from '../../utils/timeUtils';
import { useAlert } from '../../contexts/AlertContext';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { trackComment } from '../../utils/facebookEvents';
import firebaseService from '../../services/firebase/FirebaseService';
import { logMangaReviewPosted, logMangaReviewLiked } from '../../utils/mangaAnalytics';

// Back Icon
import BackIcon from '../../assets/icons/svgicons/MeSvgIcons/right_arrow.svg';

// Heart Icon Component - now accepts isLiked prop
const HeartIcon: React.FC<{ width?: number; height?: number; isLiked?: boolean }> = ({ 
  width = 18, 
  height = 18,
  isLiked = false,
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={isLiked ? '#FF4757' : 'none'}>
    <Path
      d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z"
      stroke={isLiked ? '#FF4757' : Colors.inactive}
      strokeWidth={2}
    />
  </Svg>
);

// Trash Icon Component for delete
const TrashIcon: React.FC<{ width?: number; height?: number }> = ({ 
  width = 18, 
  height = 18,
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7"
      stroke={Colors.inactive}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface Review {
  id: string;
  username: string;
  timeAgo: string;
  text: string;
  likes: number;
  isLiked: boolean;
  isOwn: boolean;
}

/**
 * Convert API comment to Review format
 * Uses user_liked from API if available, falls back to local storage
 */
const convertToReview = (
  comment: MangaComment, 
  likedCommentIds: Set<string>,
  currentUserId: string | null,
): Review => ({
  id: comment.id.toString(),
  username: comment.user_name,
  timeAgo: getRelativeTime(comment.created_at),
  text: comment.comment,
  likes: comment.likes || 0,
  // Prefer API's user_liked flag, fallback to local storage
  isLiked: comment.user_liked !== undefined 
    ? comment.user_liked 
    : likedCommentIds.has(comment.id.toString()),
  isOwn: currentUserId ? comment.user_id === currentUserId : false,
});

interface ReviewCardProps {
  review: Review;
  onLikePress: (review: Review) => void;
  onDeletePress: (review: Review) => void;
  styles: ReturnType<typeof useStyles>;
  isLiking: boolean;
  isDeleting: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = memo(({ 
  review, 
  onLikePress, 
  onDeletePress, 
  styles, 
  isLiking, 
  isDeleting,
}) => {
  if (__DEV__) {
    console.log('🗑️ ReviewCard delete check:', {
      reviewId: review.id,
      isOwn: review.isOwn,
    });
  }
  
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewUsername}>{review.username}</Text>
        <Text style={styles.reviewTime}>{review.timeAgo}</Text>
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
      <View style={styles.reviewFooterRow}>
        <TouchableOpacity 
          style={styles.reviewFooter}
          onPress={() => onLikePress(review)}
          disabled={isLiking}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <HeartIcon isLiked={review.isLiked} />
          <Text style={[styles.reviewLikes, review.isLiked && styles.reviewLikesActive]}>
            {review.likes}
          </Text>
        </TouchableOpacity>

        {review.isOwn && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDeletePress(review)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.inactive} />
            ) : (
              <TrashIcon />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

ReviewCard.displayName = 'ReviewCard';

type Props = {
  navigation: any;
  route?: any;
};

const ReviewsDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const styles = useStyles();
  const { showErrorAlert, showWarningAlert } = useAlert();
  const [comment, setComment] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  // Get userId from Redux
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Get data from route params
  const mangaTitle = route?.params?.mangaTitle || "Manga";
  const mangaId = route?.params?.mangaId;

  // ===== Analytics: Track screen view =====
  useScreenView('ReviewsDetailScreen', {
    screen_category: 'reviews',
    manga_id: mangaId?.toString() || 'unknown',
    manga_title: mangaTitle,
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [ReviewsDetailScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [ReviewsDetailScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('ReviewsDetailScreen', 'ReviewsDetailScreen');
    logFirebaseEvent('reviews_screen_viewed', {
      manga_id: mangaId?.toString() || 'unknown',
      manga_title: mangaTitle,
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent, mangaId, mangaTitle]);

  if (__DEV__) {
    console.log('📋 ReviewsDetail params:', { mangaTitle, mangaId, userId });
  }

  // State for API data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Use ref for liked comment IDs to avoid re-render loops
  const likedCommentIdsRef = useRef<Set<string>>(new Set());

  /**
   * Generate anonymous username from userId
   * Format: "Anonymous" + first 4 characters of userId
   */
  const getAnonymousUsername = useCallback((uid: string): string => {
    const prefix = uid.slice(0, 4);
    return `Anonymous${prefix}`;
  }, []);

  /**
   * Fetch comments from API
   */
  const fetchComments = useCallback(async (showRefreshIndicator = false) => {
    if (!mangaId) {
      if (__DEV__) {
        console.warn('⚠️ ReviewsDetail: mangaId is missing, cannot fetch comments');
      }
      setIsLoading(false);
      return;
    }

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      // Pass user_id to get user_liked status for each comment
      const response = await CommentService.getComments({ 
        manga_id: mangaId,
        user_id: userId || undefined,
      });
      
      if (__DEV__) {
        console.log('📝 Comments API Response:', JSON.stringify(response, null, 2));
      }

      if (response.success) {
        // Sort by created_at descending (latest first) before converting
        const sortedData = [...response.data].sort((a, b) => {
          // Parse dates for comparison (format: "2026-02-12 13:29")
          const dateA = a.created_at.replace(' ', 'T');
          const dateB = b.created_at.replace(' ', 'T');
          return dateB.localeCompare(dateA);
        });
        
        // Sync local storage with API's user_liked data if available
        if (userId) {
          sortedData.forEach((c) => {
            if (c.user_liked !== undefined) {
              const commentId = c.id.toString();
              if (c.user_liked) {
                likedCommentIdsRef.current.add(commentId);
              } else {
                likedCommentIdsRef.current.delete(commentId);
              }
            }
          });
          // Persist synced data to storage
          UserStorage.saveLikedComments(userId, likedCommentIdsRef.current);
        }
        
        // Use user_id from API to determine ownership
        const convertedReviews = sortedData.map((c) => convertToReview(
          c, 
          likedCommentIdsRef.current, 
          userId,
        ));
        setReviews(convertedReviews);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to fetch comments:', error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mangaId, userId]);

  /**
   * Load liked comments from storage and then fetch comments
   */
  const initializeData = useCallback(async () => {
    if (userId) {
      // Load liked comments from storage
      const storedLikedComments = await UserStorage.getLikedComments(userId);
      likedCommentIdsRef.current = storedLikedComments;
      
      if (__DEV__) {
        console.log('📖 Loaded liked comments from storage:', Array.from(storedLikedComments));
      }
    }
    
    // Fetch comments
    await fetchComments();
  }, [userId, fetchComments]);

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Handle keyboard events for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        (e) => {
          setKeyboardVisible(true);
          Animated.timing(keyboardPadding, {
            toValue: e.endCoordinates.height,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
          Animated.timing(keyboardPadding, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, [keyboardPadding]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * Handle like/unlike press
   * API toggles the like state - we wait for response instead of optimistic update
   * This handles cases where local state is out of sync (e.g., after app reinstall)
   */
  const handleLikePress = useCallback(async (review: Review) => {
    if (!userId) return;

    setLikingCommentId(review.id);
    
    // Log like intent
    console.log('❤️ [ReviewsDetailScreen] Like button pressed for review:', review.id);

    try {
      const response = await CommentService.likeComment({
        comment_id: parseInt(review.id, 10),
        user_id: userId,
      });

      if (__DEV__) {
        console.log('❤️ Like/Unlike response:', JSON.stringify(response, null, 2));
      }

      if (response.success) {
        const isNowLiked = response.data.user_like === 'like';
        
        // Log analytics event
        logFirebaseEvent(isNowLiked ? 'review_liked' : 'review_unliked', {
          manga_id: mangaId?.toString() || 'unknown',
          review_id: review.id,
          likes_count: response.data.likes,
          screen: 'ReviewsDetailScreen',
        });
        // Log manga name-based event if liked: {manga_name}_review_liked
        if (isNowLiked) {
          logMangaReviewLiked(mangaTitle, mangaId || '', review.id, {
            screen: 'ReviewsDetailScreen',
          });
        }
        
        // Update with actual state from server
        setReviews(prev => prev.map(r => 
          r.id === review.id 
            ? { ...r, likes: response.data.likes, isLiked: isNowLiked }
            : r
        ));
        
        // Sync local storage with server state
        if (isNowLiked) {
          likedCommentIdsRef.current.add(review.id);
          UserStorage.addLikedComment(userId, review.id);
        } else {
          likedCommentIdsRef.current.delete(review.id);
          UserStorage.removeLikedComment(userId, review.id);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to toggle like:', error);
      }
      logFirebaseEvent('review_like_error', {
        manga_id: mangaId?.toString() || 'unknown',
        review_id: review.id,
        error: String(error),
      });
      // On error, just refresh to get accurate state
      await fetchComments();
    } finally {
      setLikingCommentId(null);
    }
  }, [userId, fetchComments, logFirebaseEvent, mangaId]);

  /**
   * Handle delete press - only for own comments
   * Shows confirmation alert before deleting
   */
  const handleDeletePress = useCallback((review: Review) => {
    if (!userId || !mangaId) return;

    console.log('🗑️ [ReviewsDetailScreen] Delete button pressed for review:', review.id);

    showWarningAlert(
      'Delete Comment',
      'Are you sure you want to delete your comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setDeletingCommentId(review.id);

            // Log analytics event
            logFirebaseEvent('review_deleted', {
              manga_id: mangaId?.toString() || 'unknown',
              review_id: review.id,
              screen: 'ReviewsDetailScreen',
            });

            // Optimistic update - remove comment immediately
            setReviews(prev => prev.filter(r => r.id !== review.id));

            try {
              const response = await CommentService.deleteComment({
                comment_id: parseInt(review.id, 10),
                manga_id: mangaId,
                user_id: userId,
              });

              if (__DEV__) {
                console.log('🗑️ Delete comment response:', JSON.stringify(response, null, 2));
              }

              if (!response.success) {
                // Refresh to get accurate data on failure
                await fetchComments();
              }
            } catch (error) {
              if (__DEV__) {
                console.error('❌ Failed to delete comment:', error);
              }
              logFirebaseEvent('review_delete_error', {
                manga_id: mangaId?.toString() || 'unknown',
                review_id: review.id,
                error: String(error),
              });
              // Rollback on error - refresh comments
              await fetchComments();
            } finally {
              setDeletingCommentId(null);
            }
          },
        },
      ]
    );
  }, [userId, mangaId, fetchComments, showWarningAlert, logFirebaseEvent]);

  /**
   * Post comment to API with optimistic update
   * Username is automatically generated as Anonymous + first 4 chars of userId
   */
  const postComment = useCallback(async (commentText: string) => {
    if (!mangaId || !userId) return;

    // Generate anonymous username
    const username = getAnonymousUsername(userId);
    
    // Log comment post attempt
    console.log('📝 [ReviewsDetailScreen] Posting comment...');
    logFirebaseEvent('review_post_started', {
      manga_id: mangaId?.toString() || 'unknown',
      manga_title: mangaTitle,
      comment_length: commentText.length,
      screen: 'ReviewsDetailScreen',
    });
    // Track Facebook comment event
    trackComment(mangaId?.toString() || '', 'manga', commentText.length);

    setIsPosting(true);
    Keyboard.dismiss();

    // Optimistic update - add comment immediately
    const optimisticReview: Review = {
      id: `temp_${Date.now()}`,
      username: username,
      timeAgo: 'Just now',
      text: commentText,
      likes: 0,
      isLiked: false,
      isOwn: true,
    };
    
    setReviews(prev => [optimisticReview, ...prev]);
    setComment('');

    try {
      const response = await CommentService.addComment({
        manga_id: mangaId,
        user_name: username,
        user_id: userId,
        comment: commentText,
      });

      if (__DEV__) {
        console.log('✅ Comment posted:', JSON.stringify(response, null, 2));
      }

      if (response.success && response.data?.id) {
        // Log successful post
        console.log('✅ [ReviewsDetailScreen] Comment posted successfully');
        logFirebaseEvent('review_posted', {
          manga_id: mangaId?.toString() || 'unknown',
          manga_title: mangaTitle,
          comment_length: commentText.length,
          review_id: response.data.id?.toString() || 'unknown',
          screen: 'ReviewsDetailScreen',
        });
        // Log manga name-based event: {manga_name}_review_posted
        logMangaReviewPosted(mangaTitle, mangaId || '', {
          screen: 'ReviewsDetailScreen',
          comment_length: commentText.length,
        });
        // Refresh comments to get accurate data (API will have user_id set)
        await fetchComments();
      } else {
        // Rollback optimistic update on failure
        setReviews(prev => prev.filter(r => r.id !== optimisticReview.id));
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Failed to post comment:', error);
      }
      // Log error
      logFirebaseEvent('review_post_error', {
        manga_id: mangaId?.toString() || 'unknown',
        error: error?.message || 'unknown_error',
        screen: 'ReviewsDetailScreen',
      });
      // Rollback optimistic update on error
      setReviews(prev => prev.filter(r => r.id !== optimisticReview.id));
      
      // Show error alert for 422 validation error
      if (error?.response?.status === 422) {
        const errorData = error?.response?.data;
        const errorMessage = errorData?.message || 'Validation error';
        showErrorAlert('Comment Failed', errorMessage);
      } else {
        showErrorAlert('Comment Failed', 'Failed to post comment. Please try again.');
      }
    } finally {
      setIsPosting(false);
    }
  }, [mangaId, userId, fetchComments, getAnonymousUsername, showErrorAlert, logFirebaseEvent, mangaTitle]);

  /**
   * Handle post button press - posts directly with anonymous username
   */
  const handlePostComment = useCallback(() => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;
    postComment(trimmedComment);
  }, [comment, postComment]);

  const handleInputFocus = useCallback(() => {
    // Scroll to top when input is focused (reviews are at top)
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchComments(true);
  }, [fetchComments]);

  const renderReview = useCallback(({ item }: { item: Review }) => (
    <ReviewCard 
      review={item} 
      onLikePress={handleLikePress}
      onDeletePress={handleDeletePress}
      styles={styles} 
      isLiking={likingCommentId === item.id}
      isDeleting={deletingCommentId === item.id}
    />
  ), [handleLikePress, handleDeletePress, styles, likingCommentId, deletingCommentId]);

  const keyExtractor = useCallback((item: Review) => item.id, []);

  // Header JSX (fixed, outside FlatList)
  const headerJSX = (
    <View style={styles.header}>
      {/* Row with back button and title */}
      <View style={styles.headerTopRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackIcon width={moderateScale(50)} height={moderateScale(50)} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Reviews</Text>
        </View>
      </View>
      {/* Subtitle below, aligned with title */}
      <Text style={styles.headerSubtitle}>{mangaTitle}</Text>
    </View>
  );

  const ListEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No reviews yet. Be the first to comment!</Text>
    </View>
  ), [styles]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={reviews}
        renderItem={renderReview}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.reviewsContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    );
  };

  // Comment input JSX (inline to avoid component definition in render)
  const commentInputJSX = (
    <SafeAreaView edges={['bottom']} style={styles.commentInputWrapper}>
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor={Colors.inactive}
          value={comment}
          onChangeText={setComment}
          multiline={false}
          onFocus={handleInputFocus}
          returnKeyType="send"
          onSubmitEditing={handlePostComment}
          blurOnSubmit={false}
          editable={!isPosting}
        />
        <TouchableOpacity 
          style={[styles.postButton, isPosting && styles.postButtonDisabled]}
          onPress={handlePostComment}
          activeOpacity={0.8}
          disabled={isPosting || !comment.trim()}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Fixed Header */}
      {headerJSX}
      
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={moderateScale(50)}
        >
          {renderContent()}
          {commentInputJSX}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>
          {renderContent()}
          <Animated.View style={{ paddingBottom: keyboardVisible ? keyboardPadding : 0 }}>
            {commentInputJSX}
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReviewsDetailScreen;