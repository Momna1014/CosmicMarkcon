import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

// Heart Icon Component - accepts isLiked prop
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
  isLiked?: boolean;
  isOwn?: boolean;
}

interface ReviewsTabProps {
  reviews: Review[];
  onViewAll?: () => void;
  onLikePress?: (review: Review) => void;
  onDeletePress?: (review: Review) => void;
  likingCommentId?: string | null;
  deletingCommentId?: string | null;
}

const ReviewsTab: React.FC<ReviewsTabProps> = memo(({
  reviews,
  onViewAll,
  onLikePress,
  onDeletePress,
  likingCommentId,
  deletingCommentId,
}) => {
  const handleLikePress = useCallback((review: Review) => {
    onLikePress?.(review);
  }, [onLikePress]);

  const handleDeletePress = useCallback((review: Review) => {
    onDeletePress?.(review);
  }, [onDeletePress]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.userReviewsTitle}>User Reviews</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>
            {reviews.length > 0 ? 'View All' : 'Add Review'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No comments yet</Text>
        </View>
      ) : (
        /* Reviews List */
        reviews.map((review) => {
          const isLiking = likingCommentId === review.id;
          const isDeleting = deletingCommentId === review.id;
          
          return (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUsername}>{review.username}</Text>
                <Text style={styles.reviewTime}>{review.timeAgo}</Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
              <View style={styles.reviewFooterRow}>
                <TouchableOpacity 
                  style={styles.reviewFooter}
                  onPress={() => handleLikePress(review)}
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
                    onPress={() => handleDeletePress(review)}
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
        })
      )}
    </View>
  );
});

ReviewsTab.displayName = 'ReviewsTab';

const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
        paddingHorizontal:horizontalScale(16)
  },
  emptyContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(16),
    color: Colors.inactive,
    textAlign: 'center',
  },
  userReviewsTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.text,

  },
  viewAllText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color:Colors.light_blue,
  },
  reviewCard: {
    backgroundColor: Colors.cardBackground,
    // borderRadius: BorderRadius.base,
    padding: horizontalScale(16),
    marginBottom: verticalScale(12),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  reviewUsername: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.text,
  },
  reviewTime: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(14),
    color: Colors.inactive,
  },
  reviewText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(16),
    color: Colors.light_gray,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  reviewFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(8),
    marginLeft: horizontalScale(-8),
    marginVertical: verticalScale(-8),
  },
  reviewLikes: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: moderateScale(14),
    color: Colors.inactive,
  },
  reviewLikesActive: {
    color: '#FF4757',
  },
  deleteButton: {
    padding: horizontalScale(8),
  },
});

export default ReviewsTab;