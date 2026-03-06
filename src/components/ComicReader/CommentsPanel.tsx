/**
 * CommentsPanel Component
 * 
 * Bottom sheet panel showing comments and allowing users to add new comments
 */

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ReaderComment } from './types';

interface CommentsPanelProps {
  comments: ReaderComment[];
  onLikeComment: (commentId: string | number) => void;
  onAddComment: (text: string) => void;
  onClose: () => void;
  visible: boolean;
}

const CommentItem = memo<{
  comment: ReaderComment;
  onLike: () => void;
}>(({ comment, onLike }) => {
  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.commentItem}>
      <Image
        source={{
          uri: comment.userAvatar || 'https://via.placeholder.com/40x40/333/fff?text=U',
        }}
        style={styles.avatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{comment.userName}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(comment.timestamp)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <TouchableOpacity style={styles.likeButton} onPress={onLike}>
          <Icon
            name={comment.isLiked ? 'heart' : 'heart-outline'}
            size={moderateScale(16)}
            color={comment.isLiked ? Colors.primary : Colors.inactive}
          />
          <Text style={[styles.likeCount, comment.isLiked && styles.likedText]}>
            {comment.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

CommentItem.displayName = 'CommentItem';

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  comments,
  onLikeComment,
  onAddComment,
  onClose,
  visible,
}) => {
  const insets = useSafeAreaInsets();
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = useCallback(() => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  }, [newComment, onAddComment]);

  const renderComment = useCallback(
    ({ item }: { item: ReaderComment }) => (
      <CommentItem
        comment={item}
        onLike={() => onLikeComment(item.id)}
      />
    ),
    [onLikeComment]
  );

  const keyExtractor = useCallback(
    (item: ReaderComment) => String(item.id),
    []
  );

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingBottom: insets.bottom + verticalScale(70) }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comments ({comments.length})</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={moderateScale(24)} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="comment-outline" size={moderateScale(48)} color={Colors.inactive} />
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          placeholderTextColor={Colors.inactive}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim()}
        >
          <Icon
            name="send"
            size={moderateScale(20)}
            color={newComment.trim() ? Colors.white : Colors.inactive}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.white,
  },
  closeButton: {
    padding: moderateScale(4),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    flexGrow: 1,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: verticalScale(12),
  },
  avatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.cardBackground,
  },
  commentContent: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  userName: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.white,
  },
  timestamp: {
    fontSize: moderateScale(11),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.inactive,
  },
  commentText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.light_gray,
    lineHeight: moderateScale(20),
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  likeCount: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.inactive,
    marginLeft: horizontalScale(4),
  },
  likedText: {
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.white,
    marginTop: verticalScale(12),
  },
  emptySubtext: {
    fontSize: moderateScale(13),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.inactive,
    marginTop: verticalScale(4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Colors.cardBackground,
  },
  input: {
    flex: 1,
    minHeight: verticalScale(40),
    maxHeight: verticalScale(100),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.white,
  },
  sendButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(8),
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default memo(CommentsPanel);
