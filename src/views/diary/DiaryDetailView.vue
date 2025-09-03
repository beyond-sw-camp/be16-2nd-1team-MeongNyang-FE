<template>
  <div class="diary-detail-page" :class="{ 'comments-open': showCommentsModal }">
    <div class="diary-container">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-container">
        <v-progress-circular indeterminate color="#FF8B8B" size="64"></v-progress-circular>
        <p class="loading-text">로딩 중...</p>
      </div>
      
      <!-- 메인 포스트 섹션 -->
      <div v-else class="post-section">
        <!-- 포스트 헤더 -->
        <PostDetailHeader
          :post-data="postData"
          :current-user-id="currentUserId"
          :follow-processing="followProcessing"
          @go-to-user-diary="goToUserDiary"
          @follow-user="followUser"
          @unfollow-user="unfollowUser"
          @edit-post="editPost"
          @show-delete-confirm="showDeleteConfirm = true"
          @report-post="reportPost"
        />

        <!-- 메인 이미지 -->
        <PostMediaDisplay :media-list="postData?.mediaList" />

        <!-- 좋아요/댓글 바 -->
        <PostEngagementBar
          :like-count="postData?.likeCount"
          :comments-count="commentsCount"
          :is-liked="isLiked"
          :is-like-processing="isLikeProcessing"
          @toggle-like="toggleLike"
          @toggle-comments-modal="toggleCommentsModal"
          @handle-likes-text-click="handleLikesTextClick"
        />

        <!-- 캡션 -->
        <div class="caption" v-if="postData?.content">
          <div class="caption-content">
            <span 
              ref="captionTextRef"
              class="caption-text"
              :class="{ 'expanded': isContentExpanded }"
            >
              {{ removeHashtags(postData?.content) }}
            </span>
            <button 
              v-if="showMoreBtn"
              @click="toggleContentExpansion"
              class="more-btn"
            >
              {{ isContentExpanded ? '접기' : '더보기' }}
            </button>
          </div>
        </div>

        <!-- 해시태그 -->
        <PostHashtags :hash-tag-list="postData?.hashTagList" @search-by-hashtag="searchByHashtag" />

        <!-- 댓글 미리보기 -->
        <PostCommentsPreview
          :comments-count="commentsCount"
          :preview-comments="postData?.previewComments"
          @toggle-comments-modal="toggleCommentsModal"
          @go-to-user-diary="goToUserDiary"
        />
      </div>
    </div>

    <!-- 좋아요 모달 -->
    <LikesModal 
      v-model="showLikesModal"
      :likes-list="likesList"
      @update:modelValue="handleLikesModalToggle"
      @follow-toggle="handleFollowToggle"
    />

    <!-- 댓글 모달 -->
    <CommentsModal 
      v-model="showCommentsModal"
      :comments-list="commentsList"
      :post-id="$route.params.id"
      @add-comment="handleAddComment"
      @add-reply="handleAddReply"
      @edit-comment="handleEditComment"
      @delete-comment="handleDeleteComment"
      @edit-reply="handleEditReply"
      @delete-reply="handleDeleteReply"
      @refresh-comments="fetchComments"
    />

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog 
      v-model="showDeleteConfirm" 
      max-width="420"
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card class="delete-confirm-card">
        <!-- 아이콘 섹션 -->
        <div class="delete-icon-section">
          <div class="delete-icon-wrapper">
            <v-icon size="48" color="#FF6B6B">mdi-delete-outline</v-icon>
          </div>
        </div>
        
        <!-- 제목 -->
        <v-card-title class="delete-confirm-title">
          일기를 삭제하시겠습니까?
        </v-card-title>
        
        <!-- 설명 -->
        <v-card-text class="delete-confirm-text">
          이 작업은 되돌릴 수 없습니다. 정말로 이 일기를 삭제하시겠습니까?
        </v-card-text>
        
        <!-- 버튼 섹션 -->
        <v-card-actions class="delete-confirm-actions">
          <v-btn 
            variant="outlined"
            size="large"
            @click="showDeleteConfirm = false"
            class="cancel-btn"
          >
            취소
          </v-btn>
          <v-btn 
            color="#FF6B6B"
            size="large"
            @click="deletePost"
            class="confirm-btn"
            :loading="isDeleting"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { postAPI, userAPI } from '@/services/api';
import LikesModal from '@/components/LikesModal.vue';
import CommentsModal from '@/components/CommentsModal.vue';
import { handleApiError } from '@/utils/errorHandler';
import { useAuthStore } from '@/stores/auth';
import { checkPetExist } from '@/utils/petValidation';

// Import new components
import PostDetailHeader from '@/components/diary/PostDetailHeader.vue';
import PostMediaDisplay from '@/components/diary/PostMediaDisplay.vue';
import PostEngagementBar from '@/components/diary/PostEngagementBar.vue';
import PostHashtags from '@/components/diary/PostHashtags.vue';
import PostCommentsPreview from '@/components/diary/PostCommentsPreview.vue';

export default {
  name: 'DiaryDetailView',
  components: {
    LikesModal,
    CommentsModal,
    PostDetailHeader,
    PostMediaDisplay,
    PostEngagementBar,
    PostHashtags,
    PostCommentsPreview,
  },
  setup() {
    const $router = useRouter();
    const $route = useRoute();
    const authStore = useAuthStore();
    
    // 상태 관리
    const postData = ref(null);
    const isLoading = ref(true);
    const isLiked = ref(false);
    const commentsCount = ref(0);
    const showLikesModal = ref(false);
    const showCommentsModal = ref(false);
    const showDeleteConfirm = ref(false);
    const isDeleting = ref(false);
    const likesList = ref([]);
    const commentsList = ref([]);
    const isLoadingLikes = ref(false);
    const isLoadingComments = ref(false);
    const isLikeProcessing = ref(false); // 좋아요 처리 중 상태
    const followProcessing = ref(false); // 팔로우 처리 중 상태
    const isContentExpanded = ref(false); // 컨텐츠 확장 상태
    const showMoreBtn = ref(false); // 더보기 버튼 표시 여부
    const captionTextRef = ref(null); // 캡션 텍스트 요소 참조
    
    // 현재 사용자 정보
    const currentUser = computed(() => authStore.user);
    const currentUserId = computed(() => authStore.user?.userId || authStore.user?.id);
    
    // 로그인 여부 확인
    const isLoggedIn = computed(() => {
      return !!currentUser.value;
    });
    
    // 좋아요 토글 메서드
    const toggleLike = async () => {
      // 이미 처리 중이면 무시
      if (isLikeProcessing.value) {
        console.log('좋아요 처리 중입니다. 요청을 무시합니다.');
        return;
      }
      
      try {
        // 펫 등록 여부 확인
        const hasPet = await checkPetExist();
        if (!hasPet) return;
        
        isLikeProcessing.value = true;
        const postId = $route.params.id;
        
        console.log('좋아요 토글 시작');
        console.log('현재 포스트 상태:', {
          id: postId,
          isLiked: isLiked.value,
          likeCount: postData.value?.likeCount
        });
        
        // 즉시 UI 상태 변경 (낙관적 업데이트)
        const previousLikedState = isLiked.value;
        isLiked.value = !isLiked.value;
        console.log('즉시 UI 상태 변경:', {
          previous: previousLikedState,
          new: isLiked.value
        });
        
        let response;
        if (previousLikedState) {
          // 좋아요 취소 (백엔드에서 멱등성 보장)
          console.log(`좋아요 취소 요청 시작 - DELETE /posts/${postId}/like`);
          response = await postAPI.unlikePost(postId);
          console.log('좋아요 취소 응답:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            success: response.data?.isSuccess
          });
        } else {
          // 좋아요 추가 (백엔드에서 중복 방지)
          console.log(`좋아요 추가 요청 시작 - POST /posts/${postId}/like`);
          response = await postAPI.likePost(postId);
          console.log('좋아요 추가 응답:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            success: response.data?.isSuccess
          });
        }
        
        // 백엔드 응답 구조 확인
        console.log('좋아요 API 응답:', response.data);
        
        if (response.data && response.data.isSuccess) {
          console.log('좋아요 처리 성공');
          
          // 수동으로 좋아요 개수 업데이트 (즉시 반영)
          if (previousLikedState) {
            // 좋아요 취소: 개수 감소
            postData.value.likeCount = Math.max(0, (postData.value.likeCount || 0) - 1);
            console.log('좋아요 취소 - 개수 감소:', postData.value.likeCount);
          } else {
            // 좋아요 추가: 개수 증가
            postData.value.likeCount = (postData.value.likeCount || 0) + 1;
            console.log('좋아요 추가 - 개수 증가:', postData.value.likeCount);
          }
          
          console.log('좋아요 처리 완료 - 즉시 반영:', {
            likeCount: postData.value.likeCount,
            isLiked: isLiked.value
          });
        } else {
          console.log('좋아요 처리 실패, 상태 복원');
          // 실패 시 상태 복원
          isLiked.value = previousLikedState;
          alert(response.data?.message || '좋아요 처리에 실패했습니다.');
        }
        
        console.log('좋아요 토글 완료');
      } catch (error) {
        console.error('좋아요 토글 실패:', error);
        console.error('에러 상세:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // 에러 시 상태 복원
        isLiked.value = !isLiked.value;
        console.log('에러로 인한 상태 복원:', isLiked.value);
        
        // 에러 메시지 표시
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          handleApiError(error, $router, '좋아요 처리에 실패했습니다.');
        }
      } finally {
        isLikeProcessing.value = false;
      }
    };

    
    // 좋아요 목록 가져오기
    const fetchLikes = async () => {
      try {
        isLoadingLikes.value = true;
        const postId = $route.params.id;
        console.log('좋아요 목록 조회 시작 - postId:', postId);
        
        const response = await postAPI.getLikes(postId, { page: 0, size: 20 });
        console.log('좋아요 목록 응답:', response);
        
        if (response.data) {
          console.log('좋아요 목록 응답 전체:', response.data);
          
          // 다양한 응답 구조 처리
          let likesData = [];
          
          if (response.data.data) {
            // CommonRes 구조: response.data.data
            if (Array.isArray(response.data.data)) {
              likesData = response.data.data;
            } else if (response.data.data.content) {
              // Page 구조: response.data.data.content
              likesData = response.data.data.content;
            } else {
              likesData = response.data.data;
            }
          } else if (Array.isArray(response.data)) {
            // 직접 배열 구조
            likesData = response.data;
          }
          
          console.log('추출된 좋아요 데이터:', likesData);
          likesList.value = Array.isArray(likesData) ? likesData : [];
          console.log('설정된 좋아요 목록:', likesList.value);
        } else {
          console.log('좋아요 목록 데이터가 없음');
          likesList.value = [];
        }
      } catch (error) {
        console.error('좋아요 목록 조회 실패:', error);
        console.error('에러 상세:', error.response?.data || error.message);
        likesList.value = [];
        handleApiError(error, $router, '좋아요 목록을 불러오는데 실패했습니다.');
      } finally {
        isLoadingLikes.value = false;
      }
    };
    
    // 좋아요 텍스트 클릭 처리
    const handleLikesTextClick = async () => {
      if (!isLoggedIn.value) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      console.log('좋아요 텍스트 클릭됨');
      showLikesModal.value = true;
      console.log('좋아요 목록 가져오기 시작');
      await fetchLikes();
      console.log('좋아요 목록 가져오기 완료');
    };
    
    // 좋아요 모달 토글 처리
    const handleLikesModalToggle = async (value) => {
      console.log('좋아요 모달 토글:', value);
      showLikesModal.value = value;
      if (value) {
        // 모달이 열릴 때 좋아요 목록 새로고침
        console.log('좋아요 목록 가져오기 시작');
        await fetchLikes();
        console.log('좋아요 목록 가져오기 완료');
      }
    };

    // 좋아요 모달에서 팔로우 토글 처리
    const handleFollowToggle = async ({ userId, isFollowing }) => {
      if (followProcessing.value) return;

      console.log(`팔로우 토글 - 사용자 ID: ${userId}, 현재 상태: ${isFollowing}`);
      followProcessing.value = true;

      try {
        if (isFollowing) {
          await userAPI.unfollow(userId);
        } else {
          await userAPI.follow(userId);
        }

        // likesList에서 해당 유저의 팔로우 상태 업데이트
        const likedUser = likesList.value.find(u => u.userId === userId);
        if (likedUser) {
          likedUser.isFollowing = !isFollowing;
        }

        // 현재 보고 있는 포스트 작성자의 팔로우 상태 업데이트
        if (postData.value.userId === userId) {
          postData.value.isFollowing = !isFollowing;
        }

      } catch (error) {
        console.error('팔로우 토글 실패:', error);
        alert('팔로우 상태 변경에 실패했습니다.');
      } finally {
        followProcessing.value = false;
      }
    };
    
    const toggleCommentsModal = async () => {
      showCommentsModal.value = !showCommentsModal.value;
      if (showCommentsModal.value) {
        // 모달이 열릴 때 댓글 목록 새로고침
        console.log('댓글 모달 열림 - 댓글 목록 새로고침');
        console.log('현재 댓글 목록:', commentsList.value);
        console.log('현재 댓글 개수:', commentsCount.value);
        await fetchComments();
        console.log('댓글 목록 새로고침 완료');
        console.log('새로운 댓글 목록:', commentsList.value);
        console.log('새로운 댓글 개수:', commentsCount.value);
      }
    };
    
    // 댓글 목록 가져오기
    const fetchComments = async () => {
      try {
        isLoadingComments.value = true;
        const postId = $route.params.id;
        console.log('댓글 목록 조회 시작 - postId:', postId);
        
        const response = await postAPI.getComments(postId, { page: 0, size: 20 });
        console.log('댓글 목록 응답:', response);
        
        if (response.data && response.data.data) {
          console.log('댓글 목록 응답 전체:', response.data);
          
          // 다양한 응답 구조 처리
          let commentsData = [];
          
          if (response.data.data.content) {
            // Page 구조: response.data.data.content
            commentsData = response.data.data.content;
          } else if (Array.isArray(response.data.data)) {
            // 직접 배열 구조
            commentsData = response.data.data;
          } else {
            commentsData = response.data.data;
          }
          
          console.log('추출된 댓글 데이터:', commentsData);
          commentsList.value = Array.isArray(commentsData) ? commentsData : [];
          
          // 댓글과 답글 모두 카운트
          let totalCount = 0;
          if (Array.isArray(commentsData)) {
            commentsData.forEach(comment => {
              // 댓글 카운트
              totalCount++;
              // 답글도 카운트 (replies 배열이 있다면)
              if (comment.replies && Array.isArray(comment.replies)) {
                totalCount += comment.replies.length;
              }
            });
          }
          commentsCount.value = totalCount;
          console.log('설정된 댓글 목록:', commentsList.value);
          console.log('댓글+답글 총 개수:', totalCount);
        } else {
          console.log('댓글 목록 데이터가 없음');
          commentsList.value = [];
          commentsCount.value = 0;
        }
      } catch (error) {
        console.error('댓글 목록 조회 실패:', error);
        console.error('에러 상세:', error.response?.data || error.message);
        commentsList.value = [];
        commentsCount.value = 0;
        handleApiError(error, $router, '댓글 목록을 불러오는데 실패했습니다.');
      } finally {
        isLoadingComments.value = false;
      }
    };
    
    // 댓글 미리보기 가져오기
    const fetchCommentsPreview = async () => {
      try {
        const postId = $route.params.id;
        console.log('댓글 미리보기 조회 시작 - postId:', postId);
        
        const response = await postAPI.getComments(postId, { page: 0, size: 10 });
        console.log('댓글 미리보기 응답:', response);
        
        if (response.data && response.data.data) {
          let commentsData = [];
          
          if (response.data.data.content) {
            commentsData = response.data.data.content;
          } else if (Array.isArray(response.data.data)) {
            commentsData = response.data.data;
          } else {
            commentsData = response.data.data;
          }
          
          // 댓글과 답글을 모두 포함하여 미리보기 생성
          let allComments = [];
          if (Array.isArray(commentsData)) {
            commentsData.forEach(comment => {
              // 댓글 추가
              allComments.push(comment);
              // 답글도 추가 (replies 배열이 있다면)
              if (comment.replies && Array.isArray(comment.replies)) {
                allComments.push(...comment.replies);
              }
            });
          }
          
          // 최대 5개까지만 미리보기로 설정
          postData.value.previewComments = allComments.slice(0, 5);
          console.log('댓글 미리보기 설정 완료:', postData.value.previewComments);
        } else {
                                postData.value.previewComments = [];
                    }
                  } catch (error) {
                    console.error('댓글 미리보기 조회 실패:', error);
                    postData.value.previewComments = [];
                  }
    };
    
    // 댓글 추가
    const handleAddComment = async (content) => {
      try {
        // 펫 등록 여부 확인
        const hasPet = await checkPetExist();
        if (!hasPet) return;
        
        console.log('=== 댓글 추가 시작 ===');
        console.log('댓글 내용:', content);
        
        await postAPI.createComment($route.params.id, content);
        console.log('댓글 추가 성공');
        
        // 댓글 목록 새로고침
        await fetchComments();
        
        // 댓글 미리보기 업데이트
        await fetchCommentsPreview();
      } catch (error) {
        console.error('댓글 추가 실패:', error);
        handleApiError(error, $router, '댓글 작성에 실패했습니다.');
        throw error;
      }
    };

    // 답글 추가
    const handleAddReply = async (replyData) => {
      try {
        // 펫 등록 여부 확인
        const hasPet = await checkPetExist();
        if (!hasPet) return;
        
        console.log('=== 답글 추가 시작 ===');
        console.log('답글 데이터:', replyData);
        
        await postAPI.createReply(replyData.commentId, replyData.content, replyData.mentionUserId);
        console.log('답글 추가 성공');
        
        // 댓글 목록 새로고침
        await fetchComments();
        
        // 댓글 미리보기 업데이트
        await fetchCommentsPreview();
      } catch (error) {
        console.error('답글 추가 실패:', error);
        handleApiError(error, $router, '답글 작성에 실패했습니다.');
        throw error;
      }
    };

    // 댓글 수정
    const handleEditComment = async (commentData) => {
      try {
        console.log('=== 댓글 수정 시작 ===');
        console.log('댓글 수정 데이터:', commentData);
        
        await postAPI.updateComment(commentData.commentId, commentData.content);
        console.log('댓글 수정 성공');
        
        // 댓글 목록 새로고침
        await fetchComments();
      } catch (error) {
        console.error('댓글 수정 실패:', error);
        handleApiError(error, $router, '댓글 수정에 실패했습니다.');
        throw error;
      }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentData) => {
      try {
        console.log('=== 댓글 삭제 시작 ===');
        console.log('댓글 삭제 데이터:', commentData);
        
        await postAPI.deleteComment(commentData.commentId);
        console.log('댓글 삭제 성공');
        
        // 댓글 목록 새로고침
        await fetchComments();
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        handleApiError(error, $router, '댓글 삭제에 실패했습니다.');
        throw error;
      }
    };

    // 답글 수정
    const handleEditReply = async (replyData) => {
      try {
        console.log('=== 답글 수정 시작 ===');
        console.log('답글 수정 데이터:', replyData);
        
        await postAPI.updateComment(replyData.replyId, replyData.content);
        console.log('답글 수정 성공');
        
        // 댓글 목록 새로고침
        await fetchComments();
      } catch (error) {
        console.error('답글 수정 실패:', error);
        handleApiError(error, $router, '답글 수정에 실패했습니다.');
        throw error;
      }
    };

    // 답글 삭제
    const handleDeleteReply = async (replyData) => {
      try {
        console.log('=== 답글 삭제 시작 ===');
        console.log('답글 삭제 데이터:', replyData);
        
        await postAPI.deleteComment(replyData.replyId);
        console.log('답글 삭제 성공');
        
        // 댓글 목록 새로고침
        await fetchComments();
      } catch (error) {
        console.error('답글 삭제 실패:', error);
        handleApiError(error, $router, '답글 삭제에 실패했습니다.');
        throw error;
      }
    };

                // 더보기 메뉴 메서드들
                const isMyPost = ref(true); // 실제로는 현재 사용자와 포스트 작성자 비교

                const editPost = () => {
                  // 수정 페이지로 이동
                  const postId = $route.params.id;
                  $router.push(`/diary/${postId}/edit`);
                };

                // 포스트 데이터 가져오기
                const fetchPostData = async () => {
                  try {
                    isLoading.value = true;
                    const postId = $route.params.id;
                    const response = await postAPI.getDetail(postId);
                    if (response.data && response.data.data) {
                      const rawPostData = response.data.data;
                      
                      // 빈 URL을 가진 미디어 필터링 (URL 배열 형태)
                      if (rawPostData.mediaList && Array.isArray(rawPostData.mediaList)) {
                        console.log('원본 미디어 리스트:', rawPostData.mediaList);
                        rawPostData.mediaList = rawPostData.mediaList.filter(url => {
                          const hasValidUrl = url && typeof url === 'string' && url.trim() !== '';
                          if (!hasValidUrl) {
                            console.log('빈 URL 필터링됨:', url);
                          }
                          return hasValidUrl;
                        });
                        console.log('필터링된 미디어 URL 리스트:', rawPostData.mediaList);
                        console.log('필터링 후 미디어 개수:', rawPostData.mediaList.length);
                      }
                      
                      postData.value = rawPostData;
                      // 백엔드에서 liked 필드로 반환
                      isLiked.value = rawPostData.liked || false;
                      console.log('포스트 데이터 로드 완료, 좋아요 상태:', {
                        liked: rawPostData.liked,
                        finalStatus: isLiked.value
                      });
                      
                      // 팔로우 상태 조회 (내 게시글이 아닌 경우에만)
                      if (rawPostData.userId !== currentUserId.value) {
                        try {
                          const followStatusResponse = await userAPI.checkFollowStatus(rawPostData.userId);
                          const isFollowing = followStatusResponse.data?.data?.isFollowing || false;
                          postData.value.isFollowing = isFollowing;
                          console.log('팔로우 상태 조회 완료:', isFollowing);
                        } catch (error) {
                          console.error('팔로우 상태 조회 실패:', error);
                          postData.value.isFollowing = false;
                        }
                      }
                      
                      // 댓글 미리보기 조회
                      try {
                        const commentsResponse = await postAPI.getComments(postId, { page: 0, size: 10 });
                        console.log('댓글 미리보기 API 응답:', commentsResponse.data);
                        
                        if (commentsResponse.data && commentsResponse.data.data) {
                          let commentsData = [];
                          
                          if (Array.isArray(commentsResponse.data.data)) {
                            commentsData = commentsResponse.data.data;
                          } else if (commentsResponse.data.data.content) {
                            commentsData = commentsResponse.data.data.content;
                          } else {
                            commentsData = commentsResponse.data.data;
                          }
                          
                          console.log('추출된 댓글 데이터:', commentsData);
                          
                          // 댓글과 답글을 모두 포함하여 미리보기 생성
                          let allComments = [];
                          if (Array.isArray(commentsData)) {
                            commentsData.forEach(comment => {
                              console.log(`댓글 ${comment.id} 상세 정보:`, {
                                id: comment.id,
                                content: comment.content,
                                petName: comment.petName,
                                userName: comment.userName,
                                userId: comment.userId,
                                userImage: comment.userImage,
                                user: comment.user,
                                author: comment.author
                              });
                              
                              // 댓글 추가
                              allComments.push(comment);
                              // 답글도 추가 (replies 배열이 있다면)
                              if (comment.replies && Array.isArray(comment.replies)) {
                                comment.replies.forEach(reply => {
                                  console.log(`답글 ${reply.id} 상세 정보:`, {
                                    id: reply.id,
                                    content: reply.content,
                                    petName: reply.petName,
                                    userName: reply.userName,
                                    replyUserName: reply.replyUserName,
                                    replyUserId: reply.replyUserId,
                                    mentionUserName: reply.mentionUserName,
                                    profileImage: reply.profileImage,
                                    user: reply.user,
                                    author: reply.author
                                  });
                                });
                                allComments.push(...comment.replies);
                              }
                            });
                          }
                          
                          // 최대 5개까지만 미리보기로 설정
                          postData.value.previewComments = allComments.slice(0, 5);
                          console.log('댓글 미리보기 설정 완료:', postData.value.previewComments);
                        }
                      } catch (error) {
                        console.error('댓글 미리보기 조회 실패:', error);
                        postData.value.previewComments = [];
                      }
                    }
                  } catch (error) {
                    console.error('포스트 데이터 조회 실패:', error);
                    handleApiError(error, $router, '포스트를 불러오는데 실패했습니다.');
                    // 에러 시 목록 페이지로 이동
                    $router.push('/diarys');
                  } finally {
                    isLoading.value = false;
                    // 텍스트 오버플로우 확인
                    nextTick(() => {
                      checkTextOverflow();
                    });
                  }
                };

                // 포스트 삭제
                const deletePost = async () => {
                  try {
                    // 펫 등록 여부 확인
                    const hasPet = await checkPetExist();
                    if (!hasPet) {
                      $router.back();
                      return;
                    }
                    
                    console.log('=== 포스트 삭제 시작 ===');
                    const postId = $route.params.id;
                    console.log('삭제할 포스트 ID:', postId);
                    
                    await postAPI.delete(postId);
                    console.log('포스트 삭제 성공');
                    
                    alert('포스트가 삭제되었습니다.');
                    $router.push('/diarys');
                  } catch (error) {
                    console.error('포스트 삭제 실패:', error);
                    handleApiError(error, $router, '포스트 삭제에 실패했습니다.');
                  }
                };

                // 팔로우하기
                const followUser = async () => {
                  if (followProcessing.value || !postData.value?.userId) return;
                  
                  followProcessing.value = true;
                  try {
                    const response = await userAPI.follow(postData.value.userId);
                    console.log('팔로우 API 응답:', response);
                    
                    // 팔로우 상태 다시 조회
                    const followStatusResponse = await userAPI.checkFollowStatus(postData.value.userId);
                    const isFollowing = followStatusResponse.data?.data?.isFollowing || false;
                    
                    // 포스트 상태 업데이트
                    postData.value.isFollowing = isFollowing;
                    console.log('팔로우 상태 업데이트:', postData.value.isFollowing);
                  } catch (error) {
                    console.error('팔로우 실패:', error);
                    alert('팔로우에 실패했습니다.');
                  } finally {
                    followProcessing.value = false;
                  }
                };

                // 언팔로우하기
                const unfollowUser = async () => {
                  if (followProcessing.value || !postData.value?.userId) return;
                  
                  followProcessing.value = true;
                  try {
                    const response = await userAPI.unfollow(postData.value.userId);
                    console.log('언팔로우 API 응답:', response);
                    
                    // 팔로우 상태 다시 조회
                    const followStatusResponse = await userAPI.checkFollowStatus(postData.value.userId);
                    const isFollowing = followStatusResponse.data?.data?.isFollowing || false;
                    
                    // 포스트 상태 업데이트
                    postData.value.isFollowing = isFollowing;
                    console.log('언팔로우 상태 업데이트:', postData.value.isFollowing);
                  } catch (error) {
                    console.error('언팔로우 실패:', error);
                    alert('언팔로우에 실패했습니다.');
                  } finally {
                    followProcessing.value = false;
                  }
                };

                const reportPost = () => {
                  // 신고 로직 구현
                  console.log('게시물 신고');
                };
                
                // 해시태그 제거 메서드
                const removeHashtags = (text) => {
                  if (!text) return '';
                  // 해시태그와 그 뒤의 공백을 모두 제거
                  return text.replace(/#\S+/g, '').replace(/[ \t]+/g, ' ').trim();
                };
                
                // 해시태그 검색 메서드
                const searchByHashtag = (tag) => {
                  console.log('해시태그 검색:', tag, typeof tag);
                  // 검색 페이지로 이동하면서 해시태그를 쿼리 파라미터로 전달
                  $router.push({
                    path: '/search',
                    query: {
                      keyword: tag,
                      searchType: 'HASHTAG'
                    }
                  });
                };
                
                // 사용자 다이어리로 이동하는 메서드
                const goToUserDiary = (userId) => {
                  if (userId === currentUserId.value) {
                    $router.push(`/diarys`);
                  } else {
                    $router.push(`/diarys/${userId}`);
                  }
                };

                // 텍스트 오버플로우 확인 (실제 DOM 높이 기반)
                const checkTextOverflow = () => {
                  if (!captionTextRef.value) return;

                  // 2줄 높이 계산 (line-height 1.5 * font-size * 2줄)
                  const computedStyle = window.getComputedStyle(captionTextRef.value);
                  const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.5;
                  const twoLineHeight = lineHeight * 2;

                  // 실제 스크롤 높이와 비교
                  const actualHeight = captionTextRef.value.scrollHeight;
                  
                  // 실제 높이가 2줄 높이보다 크면 더보기 버튼 표시
                  showMoreBtn.value = actualHeight > twoLineHeight + 2; // 2px 여유
                };

                // 더보기/접기 토글
                const toggleContentExpansion = () => {
                  isContentExpanded.value = !isContentExpanded.value;
                };

                    // 컴포넌트 마운트 시 데이터 가져오기
                onMounted(() => {
                  fetchPostData();
                  fetchLikes();
                  fetchComments();
                  
                  // URL 쿼리 파라미터에서 showComments 확인
                  if ($route.query.showComments === 'true') {
                    // 댓글창 자동으로 열기
                    showCommentsModal.value = true;
                  }
                });

                                  return {
                    showLikesModal,
                    showCommentsModal,
                    showDeleteConfirm,
                    isDeleting,
                    postData,
                    isLoading,
                    isLiked,
                    isLoadingLikes,
                    commentsCount,
                    likesList,
                    commentsList,
                    isMyPost,
                    toggleLike,
                    fetchLikes,
                    handleLikesTextClick,
                    handleLikesModalToggle,
                    handleFollowToggle,
                    toggleCommentsModal,
                    fetchComments,
                    fetchCommentsPreview,
                    handleAddComment,
                    handleAddReply,
                    handleEditComment,
                    handleDeleteComment,
                    handleEditReply,
                    handleDeleteReply,
                    editPost,
                    deletePost,
                    reportPost,
                    followUser,
                    unfollowUser,
                    followProcessing,
                    currentUserId,
                    removeHashtags,
                    searchByHashtag,
                    goToUserDiary,
                    isLoggedIn,
                    isContentExpanded,
                    showMoreBtn,
                    captionTextRef,
                    checkTextOverflow,
                    toggleContentExpansion,
                  };
  }
};
</script>

<style scoped>
.diary-detail-page {
  background: linear-gradient(135deg, #FFFAF0 0%, #FFF7EC 100%);
  min-height: 100vh;
  padding: 32px;
  transition: padding-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.diary-detail-page.comments-open {
  padding-right: 432px; /* 400px(댓글창) + 32px(기존 패딩) */
}

.diary-detail-page.comments-open .diary-container {
  max-width: 600px; /* 댓글창 공간만큼 너비 줄임 */
  margin: 0 auto;
}

.diary-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 메인 포스트 섹션 */
.post-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.caption {
  padding: 0 16px 8px 16px;
  line-height: 1.4;
  text-align: left;
  margin: 0;
}

.caption-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.caption-username {
  font-weight: 600;
  color: #1E293B;
  margin-right: 8px;
}

.caption-text {
  color: #374151;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.caption-text.expanded {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}

.more-btn {
  background: none;
  border: none;
  color: #FF8B8B;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.more-btn:hover {
  color: #FF6B6B;
  text-decoration: underline;
}

/* 삭제 확인 다이얼로그 스타일 */
.delete-confirm-card {
  border-radius: 20px !important;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15) !important;
  overflow: hidden !important;
}

.delete-icon-section {
  display: flex;
  justify-content: center;
  padding: 32px 24px 16px 24px;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(255, 139, 139, 0.08) 100%);
}

.delete-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 139, 139, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 107, 107, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

.delete-confirm-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  text-align: center !important;
  padding: 24px 24px 16px 24px !important;
  color: #1E293B !important;
  line-height: 1.4 !important;
}

.delete-confirm-text {
  padding: 0 24px 24px 24px !important;
  text-align: center !important;
  color: #64748B !important;
  font-size: 0.95rem !important;
  line-height: 1.6 !important;
  font-weight: 400 !important;
}

.delete-confirm-actions {
  padding: 0 24px 32px 24px !important;
  justify-content: center !important;
  gap: 16px !important;
}

.cancel-btn {
  border-color: #E2E8F0 !important;
  color: #64748B !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 12px !important;
  padding: 12px 24px !important;
  transition: all 0.3s ease !important;
}

.cancel-btn:hover {
  border-color: #CBD5E1 !important;
  background: rgba(203, 213, 225, 0.1) !important;
  transform: translateY(-1px) !important;
}

.confirm-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8B8B 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 12px !important;
  padding: 12px 24px !important;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3) !important;
  transition: all 0.3s ease !important;
}

.confirm-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4) !important;
}

.confirm-btn:disabled {
  opacity: 0.7 !important;
  transform: none !important;
}

            /* 로딩 스타일 */
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              gap: 16px;
            }

            .loading-text {
              color: #64748B;
              font-size: 1rem;
              font-weight: 500;
            }
            
            /* 반응형 */
@media (max-width: 768px) {
  .diary-detail-page {
    padding: 16px;
  }
  
  .diary-detail-page.comments-open {
    padding-right: 16px; /* 모바일에서는 댓글창이 오버레이로 표시되므로 패딩 제거 */
  }
  
  .post-image {
    height: 400px;
  }
  
  .post-header,
  .engagement-bar,
  .likes-info,
  .caption,
  .hashtags {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
