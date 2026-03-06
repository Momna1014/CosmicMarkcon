/**
 * Comment Service
 *
 * Handles all comment-related API calls for the Manga API
 * Optimized for quick responses with minimal payload
 */

import {MANGA_API_ENDPOINTS} from '../../api/apiEndpoints';
import {mangaApi} from './mangaAxiosInstance';
import {
  AddCommentParams,
  AddCommentResponse,
  DeleteCommentParams,
  DeleteCommentResponse,
  GetMangaCommentsParams,
  GetMangaCommentsResponse,
  LikeCommentParams,
  LikeCommentResponse,
} from './types';

/**
 * Comment Service
 * Provides methods for managing manga comments/reviews
 */
export const CommentService = {
  /**
   * Add a new comment to a manga
   * @param params - AddCommentParams containing manga_id, user_name, user_id, comment
   * @returns Promise<AddCommentResponse> - Response with the created comment
   */
  addComment: async (params: AddCommentParams): Promise<AddCommentResponse> => {
    return mangaApi.post<AddCommentResponse>(
      MANGA_API_ENDPOINTS.COMMENTS.ADD,
      params,
    );
  },

  /**
   * Get all comments for a manga
   * @param params - GetMangaCommentsParams containing manga_id
   * @returns Promise<GetMangaCommentsResponse> - List of comments for the manga
   */
  getComments: async (params: GetMangaCommentsParams): Promise<GetMangaCommentsResponse> => {
    return mangaApi.post<GetMangaCommentsResponse>(
      MANGA_API_ENDPOINTS.COMMENTS.GET,
      params,
    );
  },

  /**
   * Like or unlike a comment
   * @param params - LikeCommentParams containing comment_id, user_id
   * @returns Promise<LikeCommentResponse> - Response with updated like count
   */
  likeComment: async (params: LikeCommentParams): Promise<LikeCommentResponse> => {
    return mangaApi.post<LikeCommentResponse>(
      MANGA_API_ENDPOINTS.COMMENTS.LIKE,
      params,
    );
  },

  /**
   * Delete a comment
   * @param params - DeleteCommentParams containing comment_id, manga_id, user_id
   * @returns Promise<DeleteCommentResponse> - Response with success status
   */
  deleteComment: async (params: DeleteCommentParams): Promise<DeleteCommentResponse> => {
    return mangaApi.post<DeleteCommentResponse>(
      MANGA_API_ENDPOINTS.COMMENTS.DELETE,
      params,
    );
  },
};

export default CommentService;
