<template>
  <div class="search-results-component">
    <!-- 검색 결과 헤더 -->
    <div class="search-results-header">
      <h2 class="search-results-title">
        '{{ searchKeyword }}'에 대한 검색결과 <span class="result-count">{{ results.length }}</span>건
      </h2>
    </div>
    
    <!-- 검색 결과 목록 -->
    <div v-if="results.length > 0" class="main-content">
      <!-- 왼쪽: 일기 목록 -->
      <div class="posts-list">
        <div
          v-for="post in results"
          :key="post.id"
          class="post-section"
        >
          <!-- 포스트 헤더 -->
          <PostDetailHeader
            :post-data="post"
            :current-user-id="currentUserId"
            :follow-processing="isFollowProcessing(post.userId)"
            @go-to-user-diary="goToUserDiary"
            @follow-user="followUser(post.userId)"
            @unfollow-user="unfollowUser(post.userId)"
            @edit-post="editPost(post.id)"
            @show-delete-confirm="deletePost(post.id)"
            @report-post="reportPost(post.id)"
          />

          <!-- 메인 이미지 -->
          <PostMediaDisplay :media-list="post.mediaList" />

          <!-- 좋아요/댓글 바 -->
          <PostEngagementBar
            :like-count="post.likeCount"
            :comments-count="post.commentsCount"
            :is-liked="post.liked"
            :is-like-processing="isLikeProcessing(post.id)"
            @toggle-like="toggleLike(post.id)"
            @toggle-comments-modal="openCommentsModal(post.id)"
            @handle-likes-text-click="handleLikesTextClick(post.id)"
          />

          <!-- 캡션 -->
          <div class="caption" v-if="post.content">
            <span class="caption-username">{{ post.userName || post.petName }}</span>
            <span class="caption-text">{{ removeHashtags(post.content) }}</span>
          </div>

          <!-- 해시태그 -->
          <PostHashtags :hash-tag-list="post.hashTagList" @search-by-hashtag="searchByHashtag" />

          <!-- 댓글 미리보기 -->
          <PostCommentsPreview
            :comments-count="post.commentsCount"
            :preview-comments="post.previewComments"
            @toggle-comments-modal="openCommentsModal(post.id)"
            @go-to-user-diary="goToUserDiary"
          />
        </div>
      </div>

      <!-- 오른쪽: 인기 해시태그 -->
      <div class="sidebar">
        <TrendingHashtags @search="handleSearch" />
      </div>
    </div>
    
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-section">
      <v-progress-circular
        indeterminate
        color="#FF8B8B"
        size="40"
      ></v-progress-circular>
      <p class="loading-text">검색 중...</p>
    </div>
    
    <!-- 결과가 없을 때 -->
    <div v-if="results.length === 0 && !isLoading" class="no-results">
      <div class="no-results-icon">
        <v-icon size="64" color="#FF8B8B">mdi-magnify</v-icon>
      </div>
      <p class="no-results-text">검색 결과가 없습니다.</p>
      <p class="no-results-subtext">다른 검색어를 시도해보세요.</p>
    </div>

    <!-- 좋아요 모달 -->
    <LikesModal 
      v-model="showLikesModal"
      :likes-list="likesList"
      @update:modelValue="handleLikesModalToggle"
    />

    <!-- 댓글 모달 -->
    <CommentsModal
      v-model="showCommentsModal"
      :comments-list="commentsList"
      :post-id="currentPostId"
      @add-comment="handleAddComment"
      @add-reply="handleAddReply"
      @edit-comment="handleEditComment"
      @delete-comment="handleDeleteComment"
      @edit-reply="handleEditReply"
      @delete-reply="handleDeleteReply"
      @refresh-comments="handleRefreshComments"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { postAPI, userAPI } from '@/services/api'

// Import AllDiaryView components
import PostDetailHeader from '@/components/diary/PostDetailHeader.vue'
import PostMediaDisplay from '@/components/diary/PostMediaDisplay.vue'
import PostEngagementBar from '@/components/diary/PostEngagementBar.vue'
import PostHashtags from '@/components/diary/PostHashtags.vue'
import PostCommentsPreview from '@/components/diary/PostCommentsPreview.vue'
import TrendingHashtags from '@/components/common/TrendingHashtags.vue'
import LikesModal from '@/components/LikesModal.vue'
import CommentsModal from '@/components/CommentsModal.vue'

export default {
  name: 'SearchResultsComponent',
  components: {
    PostDetailHeader,
    PostMediaDisplay,
    PostEngagementBar,
    PostHashtags,
    PostCommentsPreview,
    TrendingHashtags,
    LikesModal,
    CommentsModal,
  },
  props: {
    searchKeyword: {
      type: String,
      default: ''
    },
    searchType: {
      type: String,
      default: 'TITLE'
    },
    showResults: {
      type: Boolean,
      default: false
    },
    searchResults: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: true
    }
  },
  emits: ['result-click'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // 현재 사용자 ID
    const currentUserId = computed(() => {
      return authStore.user?.userId || authStore.user?.id
    })

    // 좋아요 모달 관련 상태
    const showLikesModal = ref(false)
    const likesList = ref([])
    const isLoadingLikes = ref(false)
    const currentPostId = ref(null)
    const likeProcessingPosts = ref(new Set()) // 좋아요 처리 중인 포스트 ID들
    const followProcessingUsers = ref(new Set()) // 팔로우 처리 중인 사용자 ID들

    // 댓글 모달 관련 상태
    const showCommentsModal = ref(false)
    const commentsList = ref([])
    const isLoadingComments = ref(false)

    // 좋아요 처리 중인지 확인하는 함수
    const isLikeProcessing = (postId) => {
      return likeProcessingPosts.value?.has(postId) || false
    }

    // 팔로우 처리 중인지 확인하는 함수
    const isFollowProcessing = (userId) => {
      return followProcessingUsers.value?.has(userId) || false
    }

    const results = computed(() => {
      return props.searchResults
    })

    // 사용자 다이어리로 이동하는 메서드
    const goToUserDiary = (userId) => {
      if (userId) {
        router.push(`/diarys/${userId}`)
      }
    }

    // 해시태그 제거 함수
    const removeHashtags = (content) => {
      if (!content) return ''
      return content.replace(/#\w+/g, '').trim()
    }

    // 해시태그 검색
    const searchByHashtag = (hashtag) => {
      router.push({ 
        path: '/search', 
        query: { 
          searchType: 'HASHTAG', 
          keyword: hashtag 
        } 
      })
    }

    // 좋아요 토글
    const toggleLike = async (postId) => {
      if (likeProcessingPosts.value.has(postId)) return

      likeProcessingPosts.value.add(postId)
      try {
        const response = await postAPI.toggleLike(postId)
        const isLiked = response.data.data.isLiked
        const likeCount = response.data.data.likeCount

        // 검색 결과에서 해당 포스트 업데이트
        const postIndex = results.value.findIndex(post => post.id === postId)
        if (postIndex !== -1) {
          results.value[postIndex].liked = isLiked
          results.value[postIndex].likeCount = likeCount
        }
      } catch (error) {
        console.error('좋아요 토글 실패:', error)
      } finally {
        likeProcessingPosts.value.delete(postId)
      }
    }

    // 팔로우
    const followUser = async (userId) => {
      if (followProcessingUsers.value.has(userId)) return

      followProcessingUsers.value.add(userId)
      try {
        await userAPI.follow(userId)
        // 검색 결과에서 해당 사용자의 팔로우 상태 업데이트
        results.value.forEach(post => {
          if (post.userId === userId) {
            post.isFollowing = true
          }
        })
      } catch (error) {
        console.error('팔로우 실패:', error)
      } finally {
        followProcessingUsers.value.delete(userId)
      }
    }

    // 언팔로우
    const unfollowUser = async (userId) => {
      if (followProcessingUsers.value.has(userId)) return

      followProcessingUsers.value.add(userId)
      try {
        await userAPI.unfollow(userId)
        // 검색 결과에서 해당 사용자의 팔로우 상태 업데이트
        results.value.forEach(post => {
          if (post.userId === userId) {
            post.isFollowing = false
          }
        })
      } catch (error) {
        console.error('언팔로우 실패:', error)
      } finally {
        followProcessingUsers.value.delete(userId)
      }
    }

    // 댓글 모달 열기
    const openCommentsModal = async (postId) => {
      currentPostId.value = postId
      showCommentsModal.value = true
      
      try {
        isLoadingComments.value = true
        const response = await postAPI.getComments(postId)
        commentsList.value = response.data.data || []
      } catch (error) {
        console.error('댓글 조회 실패:', error)
        commentsList.value = []
      } finally {
        isLoadingComments.value = false
      }
    }

    // 좋아요 모달 열기
    const handleLikesTextClick = async (postId) => {
      currentPostId.value = postId
      showLikesModal.value = true
      
      try {
        isLoadingLikes.value = true
        const response = await postAPI.getLikes(postId)
        likesList.value = response.data.data || []
      } catch (error) {
        console.error('좋아요 목록 조회 실패:', error)
        likesList.value = []
      } finally {
        isLoadingLikes.value = false
      }
    }

    // 좋아요 모달 토글
    const handleLikesModalToggle = (value) => {
      showLikesModal.value = value
    }

    // 댓글 관련 핸들러들
    const handleAddComment = async (commentData) => {
      try {
        const response = await postAPI.addComment(currentPostId.value, commentData)
        const newComment = response.data.data
        commentsList.value.unshift(newComment)
        
        // 검색 결과에서 댓글 수 업데이트
        const postIndex = results.value.findIndex(post => post.id === currentPostId.value)
        if (postIndex !== -1) {
          results.value[postIndex].commentsCount = (results.value[postIndex].commentsCount || 0) + 1
        }
      } catch (error) {
        console.error('댓글 추가 실패:', error)
      }
    }

    const handleAddReply = async (replyData) => {
      try {
        const response = await postAPI.addReply(currentPostId.value, replyData)
        const newReply = response.data.data
        // 댓글 목록 업데이트 로직
        const commentIndex = commentsList.value.findIndex(comment => comment.id === replyData.parentCommentId)
        if (commentIndex !== -1) {
          if (!commentsList.value[commentIndex].replies) {
            commentsList.value[commentIndex].replies = []
          }
          commentsList.value[commentIndex].replies.push(newReply)
        }
      } catch (error) {
        console.error('답글 추가 실패:', error)
      }
    }

    const handleEditComment = async (commentData) => {
      try {
        const response = await postAPI.editComment(currentPostId.value, commentData.commentId, commentData.content)
        const updatedComment = response.data.data
        const commentIndex = commentsList.value.findIndex(comment => comment.id === commentData.commentId)
        if (commentIndex !== -1) {
          commentsList.value[commentIndex] = updatedComment
        }
      } catch (error) {
        console.error('댓글 수정 실패:', error)
      }
    }

    const handleDeleteComment = async (commentId) => {
      try {
        await postAPI.deleteComment(currentPostId.value, commentId)
        commentsList.value = commentsList.value.filter(comment => comment.id !== commentId)
        
        // 검색 결과에서 댓글 수 업데이트
        const postIndex = results.value.findIndex(post => post.id === currentPostId.value)
        if (postIndex !== -1) {
          results.value[postIndex].commentsCount = Math.max(0, (results.value[postIndex].commentsCount || 0) - 1)
        }
      } catch (error) {
        console.error('댓글 삭제 실패:', error)
      }
    }

    const handleEditReply = async (replyData) => {
      try {
        const response = await postAPI.editReply(currentPostId.value, replyData.replyId, replyData.content)
        const updatedReply = response.data.data
        // 답글 업데이트 로직
        commentsList.value.forEach(comment => {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex(reply => reply.id === replyData.replyId)
            if (replyIndex !== -1) {
              comment.replies[replyIndex] = updatedReply
            }
          }
        })
      } catch (error) {
        console.error('답글 수정 실패:', error)
      }
    }

    const handleDeleteReply = async (replyId) => {
      try {
        await postAPI.deleteReply(currentPostId.value, replyId)
        // 답글 삭제 로직
        commentsList.value.forEach(comment => {
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== replyId)
          }
        })
      } catch (error) {
        console.error('답글 삭제 실패:', error)
      }
    }

    const handleRefreshComments = async () => {
      if (!currentPostId.value) return
      
      try {
        isLoadingComments.value = true
        const response = await postAPI.getComments(currentPostId.value)
        commentsList.value = response.data.data || []
      } catch (error) {
        console.error('댓글 새로고침 실패:', error)
      } finally {
        isLoadingComments.value = false
      }
    }

    // 포스트 편집/삭제/신고
    const editPost = (postId) => {
      router.push(`/diarys/edit/${postId}`)
    }

    const deletePost = (postId) => {
      // 삭제 확인 모달 표시 로직
      if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        // 삭제 API 호출
        postAPI.deletePost(postId).then(() => {
          // 검색 결과에서 해당 포스트 제거
          const postIndex = results.value.findIndex(post => post.id === postId)
          if (postIndex !== -1) {
            results.value.splice(postIndex, 1)
          }
        }).catch(error => {
          console.error('게시글 삭제 실패:', error)
        })
      }
    }

    const reportPost = (postId) => {
      // 신고 로직
      console.log('게시글 신고:', postId)
    }

    // 검색 처리
    const handleSearch = (searchData) => {
      router.push({ 
        path: '/search', 
        query: { 
          searchType: searchData.searchType, 
          keyword: searchData.keyword 
        } 
      })
    }

    return {
      currentUserId,
      results,
      showLikesModal,
      likesList,
      isLoadingLikes,
      currentPostId,
      showCommentsModal,
      commentsList,
      isLoadingComments,
      goToUserDiary,
      removeHashtags,
      searchByHashtag,
      toggleLike,
      followUser,
      unfollowUser,
      openCommentsModal,
      handleLikesTextClick,
      handleLikesModalToggle,
      handleAddComment,
      handleAddReply,
      handleEditComment,
      handleDeleteComment,
      handleEditReply,
      handleDeleteReply,
      handleRefreshComments,
      editPost,
      deletePost,
      reportPost,
      handleSearch,
      isLikeProcessing,
      isFollowProcessing,
    }
  }
}
</script>

<style scoped>
.search-results-component {
  margin-top: 32px;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.search-results-header {
  margin-bottom: 32px;
  width: 100%;
  max-width: 1200px;
  text-align: center;
}

.search-results-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

.result-count {
  color: white;
  background: #FF8B8B;
  padding: 4px 12px;
  border-radius: 16px;
  margin-left: 8px;
  font-size: 1.4rem;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
}

/* 메인 콘텐츠 영역 */
.main-content {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.post-section {
  width: 700px;
  margin: 0 auto;
  border-bottom: 1px solid #E5E7EB;
  padding: 16px 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.post-section:last-child {
  border-bottom: none;
}

/* 사이드바 */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  height: fit-content;
}

/* 캡션 스타일 */
.caption {
  padding: 12px 20px 8px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caption-username {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a1a;
  margin-right: 8px;
}

.caption-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
  word-break: break-word;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.no-results-icon {
  margin-bottom: 24px;
  padding: 20px;
  background: #FF8B8B;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.2);
}

.no-results-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 12px 0;
}

.no-results-subtext {
  font-size: 1rem;
  color: #64748B;
  margin: 0;
  font-weight: 500;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  width: 100%;
  max-width: 900px;
}

.loading-text {
  margin-top: 20px;
  font-size: 1rem;
  color: #64748B;
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 1200px) {
  .search-results-component {
    padding: 0 20px;
  }
  
  .search-results-header {
    max-width: 1000px;
  }
  
  .main-content {
    max-width: 1000px;
  }
  
  .sidebar {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .search-results-component {
    padding: 0 16px;
    margin-top: 24px;
  }
  
  .search-results-header {
    margin-bottom: 24px;
  }
  
  .search-results-title {
    font-size: 1.4rem;
  }
  
  .result-count {
    font-size: 1.2rem;
    padding: 3px 10px;
  }
  
  .main-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .sidebar {
    width: 100%;
    position: static;
  }
  
  .post-section {
    width: 100%;
    border-radius: 12px;
  }
  
  .no-results {
    padding: 60px 20px;
    border-radius: 16px;
  }
  
  .no-results-icon {
    padding: 16px;
  }
  
  .no-results-text {
    font-size: 1.2rem;
  }
  
  .no-results-subtext {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .search-results-component {
    padding: 0 12px;
    margin-top: 20px;
  }
  
  .search-results-header {
    margin-bottom: 20px;
  }
  
  .search-results-title {
    font-size: 1.2rem;
  }
  
  .result-count {
    font-size: 1.1rem;
    padding: 2px 8px;
  }
  
  .post-section {
    border-radius: 10px;
  }
  
  .no-results {
    padding: 40px 16px;
    border-radius: 14px;
  }
  
  .no-results-icon {
    padding: 12px;
  }
  
  .no-results-text {
    font-size: 1.1rem;
  }
  
  .no-results-subtext {
    font-size: 0.9rem;
  }
}
</style>
