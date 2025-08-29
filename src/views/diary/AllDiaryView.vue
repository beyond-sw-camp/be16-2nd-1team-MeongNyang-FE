<template>
  <div class="all-posts-container">
    <!-- 로딩 스피너 -->
    <div v-if="loading && posts.length === 0" class="loading-container">
      <v-progress-circular indeterminate color="#FF8B8B" size="64"></v-progress-circular>
      <p class="loading-text">일기를 불러오는 중...</p>
    </div>

    <!-- 일기 목록 -->
    <div v-else-if="posts.length > 0" class="posts-list">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-section"
      >
        <!-- 포스트 헤더 -->
        <div class="post-header">
          <div class="profile-info">
            <v-avatar 
              size="40" 
              class="profile-avatar clickable"
              @click="goToUserDiary(post.userId)"
            >
              <v-img 
                :src="post.petImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center&q=90'" 
                cover
              ></v-img>
            </v-avatar>
            <div class="user-info">
                              <span class="username clickable" @click="goToUserDiary(post.userId)">{{ post.userName || post.petName || '익명' }}</span>
              <span class="date">{{ getDateField(post) ? formatDate(getDateField(post)) : '날짜 없음' }}</span>
            </div>
          </div>
          <!-- 팔로우/언팔로우 버튼 (내 게시글이 아닌 경우에만) -->
          <div v-if="post.userId !== currentUserId" class="follow-section">
            <v-btn
              v-if="!post.isFollowing"
              size="small"
              variant="filled"
              color="#FF8B8B"
              class="follow-btn"
              @click="followUser(post.userId)"
              :disabled="isFollowProcessing(post.userId)"
              :loading="isFollowProcessing(post.userId)"
            >
              팔로우
            </v-btn>
          </div>
          <!-- 더보기 메뉴 -->
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn icon size="x-small" class="options-btn" v-bind="props">
                <v-icon color="#1E293B" size="18">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list class="options-menu">
              <!-- 내 게시글이면 수정/삭제 옵션만 표시 -->
              <template v-if="post.userId === currentUserId">
                <v-list-item @click="editPost(post.id)" class="menu-item">
                  <v-list-item-title class="menu-text">수정</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deletePost(post.id)" class="menu-item">
                  <v-list-item-title class="menu-text delete-text">삭제</v-list-item-title>
                </v-list-item>
              </template>
              <!-- 다른 사용자 게시글이면 신고 옵션만 표시 -->
              <template v-else>
                <v-list-item @click="reportPost(post.id)" class="menu-item">
                  <v-list-item-title class="menu-text report-text">신고</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
            <!-- 디버깅용 로그 -->
            <div style="display: none;">
              {{ console.log('post.userId:', post.userId, 'currentUserId:', currentUserId, 'isMyPost:', post.userId === currentUserId, 'isFollowing:', post.isFollowing) }}
            </div>
          </v-menu>
        </div>

        <!-- 메인 이미지 -->
        <div class="post-image-container">

          
          <!-- 단일 이미지인 경우 -->
          <div v-if="!post.mediaList || post.mediaList.length <= 1" class="single-image">
            <v-img 
              :src="post.mediaList?.[0] || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop&crop=center'" 
              class="post-image"
              cover
            ></v-img>
          </div>
          
          <!-- 다중 이미지인 경우 -->
          <div v-else class="multi-image-slider">
            <div class="image-slider">
              <v-img 
                :src="post.mediaList[currentImageIndex[post.id] || 0]" 
                class="post-image"
                cover
              ></v-img>
              
              <!-- 이미지 네비게이션 버튼 -->
              <div class="image-navigation">
                <v-btn 
                  icon 
                  class="nav-btn prev-btn"
                  @click="prevImage(post.id)"
                  :disabled="(currentImageIndex[post.id] || 0) === 0"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  class="nav-btn next-btn"
                  @click="nextImage(post.id)"
                  :disabled="(currentImageIndex[post.id] || 0) === post.mediaList.length - 1"
                >
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
              
              <!-- 이미지 인디케이터 -->
              <div class="image-indicators">
                <div 
                  v-for="(image, index) in post.mediaList" 
                  :key="index"
                  class="indicator"
                  :class="{ active: (currentImageIndex[post.id] || 0) === index }"
                  @click="setImageIndex(post.id, index)"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 좋아요/댓글 바 -->
        <div class="action-bar">
          <div class="action-buttons">
                            <v-btn
                  icon
              size="small" 
                  class="like-btn"
                  @click="toggleLike(post.id)"
              :disabled="likeProcessingPosts.has(post.id)"
              :loading="likeProcessingPosts.has(post.id)"
                >
                  <v-icon
                :color="post.liked ? '#FF8B8B' : '#1E293B'" 
                    size="20"
                  >
                {{ post.liked ? 'mdi-heart' : 'mdi-heart-outline' }}
                  </v-icon>
                </v-btn>
            <span class="like-count">{{ post.likeCount || 0 }}</span>
            
            <v-btn 
              icon 
              size="small" 
              class="comment-btn" 
              @click="openCommentsModal(post.id)"
            >
              <v-icon color="#1E293B" size="20">mdi-comment-outline</v-icon>
            </v-btn>
            <span class="comment-count">{{ post.commentsCount || 0 }}</span>
          </div>
          
          <div class="post-actions">

          </div>
        </div>

                    <!-- 좋아요 정보 -->
            <div class="likes-info">
              <span 
                class="likes-text clickable" 
            @click="openLikesModal(post.id)"
              >
            {{ getLikesText(post.likeCount) }}
              </span>
            </div>

        <!-- 캡션 -->
        <div class="post-caption">
          <span class="caption-username">{{ post.userName || post.petName || '익명' }}</span>
          <span class="caption-text">{{ removeHashtags(post.content) }}</span>
        </div>

        <!-- 해시태그 -->
        <div class="hashtags" v-if="post.hashTagList && post.hashTagList.length > 0">
          <!-- 디버깅용 로그 -->
          <div style="display: none;">
            {{ console.log('포스트', post.id, '해시태그 리스트:', post.hashTagList, '길이:', post.hashTagList?.length) }}
          </div>
          <span 
            v-for="tag in post.hashTagList" 
            :key="tag" 
            class="hashtag"
            @click="searchByHashtag(tag)"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- 댓글 미리보기 -->
        <div v-if="post.previewComments && post.previewComments.length > 0" class="comments-preview">
          <div class="comments-preview-header">
            <span class="comments-preview-title">댓글 {{ post.commentsCount || 0 }}개</span>
            <span 
              v-if="post.commentsCount > 5" 
              class="view-all-comments"
              @click="openCommentsModal(post.id)"
            >
              모두 보기
            </span>
          </div>
          
          <div class="comments-preview-list">
            <div 
              v-for="comment in post.previewComments.slice(0, 5)"
              :key="comment.id"
              class="comment-preview-item"
            >
              <div class="comment-user-info">
                <v-avatar 
                  size="20" 
                  class="comment-avatar"
                  @click="goToUserDiary(comment.replyUserId || comment.userId)"
                >
                  <v-img 
                    :src="comment.profileImage || comment.userImage || '/default-avatar.png'"
                    cover
                  ></v-img>
                </v-avatar>
                <span 
                  class="comment-author clickable"
                  @click="goToUserDiary(comment.replyUserId || comment.userId)"
                  :title="comment.replyUserName || comment.userName || comment.user?.userName || comment.author?.userName || comment.petName || '익명'"
                >
                  {{ comment.replyUserName || comment.userName || comment.user?.userName || comment.author?.userName || comment.petName || '익명' }}
                </span>
              </div>
              <div class="comment-content">
                <template v-for="(part, index) in formatCommentText(comment.content, comment.mentionUserId)" :key="index">
                  <span 
                    v-if="part.isTag" 
                    class="tag-mention clickable"
                    @click="goToUserDiary(part.userId)"
                  >
                    {{ part.text }}
                  </span>
                  <span v-else class="comment-text">{{ part.text }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <v-icon size="64" color="#CBD5E1">mdi-post-outline</v-icon>
      <p class="empty-text">아직 공유된 일기가 없습니다.</p>
    </div>

    <!-- 좋아요 모달 -->
    <LikesModal 
      v-if="showLikesModal"
      v-model="showLikesModal"
      :likes-list="likesList"
      :sidebar-mode="false"
      @update:modelValue="closeLikesModal"
    />

    <!-- 댓글 모달 -->
    <CommentsModal
      v-if="showCommentsModal"
      v-model="showCommentsModal"
      :comments-list="commentsList"
      :post-id="selectedPostId"
      :sidebar-mode="false"
      @close="closeCommentsModal"
      @comment-added="handleCommentAdded"
      @comment-updated="handleCommentUpdated"
      @comment-deleted="handleCommentDeleted"
      @add-comment="handleAddComment"
      @add-reply="handleAddReply"
      @edit-comment="handleEditComment"
      @delete-comment="handleDeleteComment"
      @edit-reply="handleEditReply"
      @delete-reply="handleDeleteReply"
      @refresh-comments="fetchComments"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { postAPI, userAPI } from '@/services/api'
import CommentsModal from '@/components/CommentsModal.vue' // 댓글 모달 컴포넌트 추가
import LikesModal from '@/components/LikesModal.vue' // 좋아요 모달 컴포넌트 추가
import { checkPetExist } from '@/utils/petValidation'
import { handleApiError } from '@/utils/errorHandler'

export default {
  name: 'AllPostsView',
  components: {
    CommentsModal, // 댓글 모달 컴포넌트 등록
    LikesModal // 좋아요 모달 컴포넌트 등록
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const posts = ref([])
    const loading = ref(false)
    const hasMore = ref(true)
    const currentPage = ref(0)
    const scrollTrigger = ref(null)
    
    const likeProcessingPosts = ref(new Set()) // 좋아요 처리 중인 포스트 ID들
    const followProcessingUsers = ref(new Set()) // 팔로우 처리 중인 사용자 ID들

    // 이미지 인덱스 관리
    const currentImageIndex = ref({}) // 각 포스트별 현재 이미지 인덱스

    // 댓글 모달 관련 상태
    const showCommentsModal = ref(false)
    const selectedPostId = ref(null)
    const commentsList = ref([])
    
    // 좋아요 모달 관련 상태
    const showLikesModal = ref(false)
    const selectedLikesPostId = ref(null)
    const likesList = ref([])
    const isLoadingLikes = ref(false)

    // 현재 사용자 ID
    const currentUserId = computed(() => {
      console.log('authStore.user:', authStore.user)
      console.log('authStore.isLoggedIn:', authStore.isLoggedIn)
      return authStore.user?.userId || authStore.user?.id
    })

    // 좋아요 처리 중인지 확인하는 함수
    const isLikeProcessing = (postId) => {
      return likeProcessingPosts.value?.has(postId) || false
    }

    // 모든 포스트의 팔로우 상태 가져오기
    const fetchAllFollowStatus = async () => {
      try {
        console.log('=== 모든 포스트 팔로우 상태 조회 시작 ===')
        
        // 현재 로그인한 사용자가 있는 경우에만 실행
        if (!currentUserId.value) {
          console.log('로그인한 사용자가 없어 팔로우 상태 조회 건너뜀')
          return
        }
        
        // 현재 로드된 모든 포스트에 대해 팔로우 상태 조회
        const promises = posts.value.map(async (post) => {
          // 내 게시글이면 팔로우 상태 조회 불필요
          if (post.userId === currentUserId.value) {
            return { postId: post.id, isFollowing: null }
          }
          
          try {
            console.log(`=== 포스트 ${post.id} 팔로우 상태 조회 ===`)
            console.log('post 객체:', post)
            console.log('post.userId:', post.userId, '타입:', typeof post.userId)
            console.log('post.userId 값이 유효한지:', post.userId && post.userId > 0)
            
            if (!post.userId || post.userId <= 0) {
              console.error(`포스트 ${post.id}의 userId가 유효하지 않음:`, post.userId)
              post.isFollowing = false
              return { postId: post.id, isFollowing: false }
            }
            
            console.log(`API 호출 시작: userAPI.checkFollowStatus(${post.userId})`)
            const response = await userAPI.checkFollowStatus(post.userId)
            console.log(`포스트 ${post.id} 팔로우 상태 API 응답:`, response)
            console.log(`포스트 ${post.id} 팔로우 상태 API 응답 데이터:`, response.data)
            console.log(`포스트 ${post.id} 팔로우 상태 API 응답 전체 구조:`, JSON.stringify(response, null, 2))
            
            const isFollowing = response.data?.data?.isFollowing || false
            console.log(`포스트 ${post.id} 팔로우 상태 추출:`, isFollowing)
            console.log(`response.data?.data?.isFollowing 값:`, response.data?.data?.isFollowing)
            
            // 포스트 객체에 팔로우 상태 업데이트
            post.isFollowing = isFollowing
            console.log(`포스트 ${post.id} 객체 업데이트 후:`, post.isFollowing)
            return { postId: post.id, isFollowing }
          } catch (error) {
            console.error(`포스트 ${post.id} 팔로우 상태 조회 실패:`, error)
            post.isFollowing = false
            return { postId: post.id, isFollowing: false }
          }
        })
        
        const results = await Promise.all(promises)
        console.log('=== 모든 포스트 팔로우 상태 조회 완료 ===', results)
        
      } catch (error) {
        console.error('전체 팔로우 상태 조회 실패:', error)
      }
    }

    // 모든 포스트의 댓글 미리보기 가져오기
    const fetchAllCommentsPreview = async () => {
      try {
        console.log('=== 모든 포스트 댓글 미리보기 조회 시작 ===')
        
        // 현재 로드된 모든 포스트에 대해 댓글 미리보기 조회
        const promises = posts.value.map(async (post) => {
          try {
            console.log(`포스트 ${post.id} 댓글 미리보기 조회 시작`)
            const response = await postAPI.getComments(post.id, { page: 0, size: 10 })
            console.log(`포스트 ${post.id} 댓글 API 응답:`, response.data)
            
            if (response.data && response.data.data) {
              let commentsData = []
              
              if (Array.isArray(response.data.data)) {
                commentsData = response.data.data
              } else if (response.data.data.content) {
                commentsData = response.data.data.content
              } else {
                commentsData = response.data.data
              }
              
              console.log(`포스트 ${post.id} 추출된 댓글 데이터:`, commentsData)
              
              // 댓글과 답글을 모두 포함하여 미리보기 생성
              let allComments = []
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
                  })
                  
                  // 댓글 추가
                  allComments.push(comment)
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
                      })
                    })
                    allComments.push(...comment.replies)
                  }
                })
              }
              
              // 최대 5개까지만 미리보기로 설정
              post.previewComments = allComments.slice(0, 5)
              console.log(`포스트 ${post.id} 댓글 미리보기 설정 완료:`, post.previewComments)
              
              return { postId: post.id, previewCount: post.previewComments.length }
            }
            
            console.log(`포스트 ${post.id} 댓글 데이터 없음`)
            post.previewComments = []
            return { postId: post.id, previewCount: 0 }
          } catch (error) {
            console.error(`포스트 ${post.id} 댓글 미리보기 조회 실패:`, error)
            post.previewComments = []
            return { postId: post.id, previewCount: 0 }
          }
        })
        
        const results = await Promise.all(promises)
        console.log('=== 모든 포스트 댓글 미리보기 조회 완료 ===', results)
        
      } catch (error) {
        console.error('전체 댓글 미리보기 조회 실패:', error)
      }
    }

    // 모든 포스트의 댓글 수 가져오기
    const fetchAllCommentsCount = async () => {
      try {
        console.log('=== 모든 포스트 댓글 수 조회 시작 ===')
        
        // 현재 로드된 모든 포스트에 대해 댓글 수 조회
        const promises = posts.value.map(async (post) => {
          try {
            console.log(`포스트 ${post.id} 댓글 수 조회 시작`)
            const response = await postAPI.getComments(post.id, { page: 0, size: 1000 })
            console.log(`포스트 ${post.id} 댓글 API 응답:`, response.data)
            
            if (response.data && response.data.data) {
              let commentsData = []
              
              if (Array.isArray(response.data.data)) {
                commentsData = response.data.data
              } else if (response.data.data.content) {
                commentsData = response.data.data.content
              } else {
                commentsData = response.data.data
              }
              
              // 댓글과 답글 모두 카운트
              let totalCount = 0
              if (Array.isArray(commentsData)) {
                commentsData.forEach(comment => {
                  // 댓글 카운트
                  totalCount++
                  // 답글도 카운트 (replies 배열이 있다면)
                  if (comment.replies && Array.isArray(comment.replies)) {
                    totalCount += comment.replies.length
                  }
                })
              }
              
              console.log(`포스트 ${post.id} 댓글+답글 수 계산 완료:`, totalCount)
              
              // 포스트 객체에 댓글 수 업데이트
              post.commentsCount = totalCount
              return { postId: post.id, count: totalCount }
            }
            
            console.log(`포스트 ${post.id} 댓글 데이터 없음`)
            post.commentsCount = 0
            return { postId: post.id, count: 0 }
          } catch (error) {
            console.error(`포스트 ${post.id} 댓글 수 조회 실패:`, error)
            post.commentsCount = 0
            return { postId: post.id, count: 0 }
          }
        })
        
        const results = await Promise.all(promises)
        console.log('=== 모든 포스트 댓글 수 조회 완료 ===', results)
        
      } catch (error) {
        console.error('전체 댓글 수 조회 실패:', error)
      }
    }

    // 일기 목록 가져오기
    const fetchPosts = async (page = 0, append = false) => {
      if (loading.value || (!append && !hasMore.value)) return

      loading.value = true
      try {
        const response = await postAPI.getAllPosts({ page, size: 9 })
        
        if (response.data && response.data.data) {
          const newPosts = response.data.data.content || []
          
          console.log('가져온 포스트 목록:', newPosts)
          
          // 첫 번째 포스트의 전체 구조 확인
          if (newPosts.length > 0) {
            console.log('첫 번째 포스트 전체 구조:', JSON.stringify(newPosts[0], null, 2))
            console.log('첫 번째 포스트 사용자 관련 필드들:', {
              userId: newPosts[0].userId,
              userName: newPosts[0].userName,
              petName: newPosts[0].petName,
              author: newPosts[0].author,
              user: newPosts[0].user
            })
          }
          
                    // 각 포스트의 미디어 리스트에서 빈 URL 필터링 (URL 배열 형태)
          newPosts.forEach(post => {
            if (post.mediaList && Array.isArray(post.mediaList)) {
              post.mediaList = post.mediaList.filter(url => {
                const hasValidUrl = url && typeof url === 'string' && url.trim() !== ''
                if (!hasValidUrl) {
                  console.log(`포스트 ${post.id}에서 빈 URL 필터링됨:`, url)
                }
                return hasValidUrl
              })
            }
            
            console.log(`포스트 ${post.id} 초기 상태:`, {
              liked: post.liked,
              likeCount: post.likeCount,
              commentCount: post.commentCount,
              commentsCount: post.commentsCount,
              mediaCount: post.mediaList?.length || 0
            })
          })
          
          if (append) {
            posts.value.push(...newPosts)
            // 새로 추가된 포스트들의 댓글 수 조회
            await fetchAllCommentsCount()
          } else {
            posts.value = newPosts
            // 전체 포스트의 댓글 수 조회
            await fetchAllCommentsCount()
          }
          
          hasMore.value = !response.data.data.last
          currentPage.value = page
        }
      } catch (error) {
        console.error('일기 목록 조회 실패:', error)
      } finally {
        loading.value = false
      }
    }

    // 무한 스크롤 처리
    const handleScroll = () => {
      if (!scrollTrigger.value || loading.value || !hasMore.value) return

      const rect = scrollTrigger.value.getBoundingClientRect()
      if (rect.top <= window.innerHeight + 100) {
        fetchPosts(currentPage.value + 1, true)
      }
    }

    // 일기 상세 페이지로 이동
    const goToPost = (postId) => {
      router.push(`/diary/${postId}`)
    }

    // 댓글창과 함께 일기 상세 페이지로 이동
    const goToPostWithComments = (postId) => {
      router.push(`/diary/${postId}?showComments=true`)
    }

    // 사용자 일기로 이동
    const goToUserDiary = (userId) => {
      if (userId) {
        router.push(`/diarys/${userId}`)
      }
    }

    // 좋아요 토글
    const toggleLike = async (postId) => {
      // 이미 처리 중이면 무시
      if (likeProcessingPosts.value.has(postId)) {
        console.log(`포스트 ${postId}의 좋아요 처리 중입니다. 요청을 무시합니다.`)
        return
      }
      
      const post = posts.value.find(p => p.id === postId)
      if (!post) {
        console.error(`포스트 ${postId}를 찾을 수 없습니다.`)
        return
      }
      
      try {
        // 펫 등록 여부 확인
        const hasPet = await checkPetExist()
        if (!hasPet) return
        
        likeProcessingPosts.value.add(postId)
        
        console.log(`좋아요 토글 시작 - 포스트 ${postId}`)
        console.log('현재 포스트 상태:', {
          id: post.id,
          liked: post.liked,
          likeCount: post.likeCount
        })
        
        // 즉시 UI 상태 변경 (낙관적 업데이트)
        const previousLikedState = post.liked
        post.liked = !post.liked
        console.log('즉시 UI 상태 변경:', {
          postId: post.id,
          previous: previousLikedState,
          new: post.liked
        })
        
        let response
        if (previousLikedState) {
          // 좋아요 취소 (백엔드에서 멱등성 보장)
          console.log('좋아요 취소 요청 시작')
          response = await postAPI.unlike(postId)
          console.log('좋아요 취소 응답:', response)
          console.log('좋아요 취소 성공')
        } else {
          // 좋아요 추가 (백엔드에서 중복 방지)
          console.log('좋아요 추가 요청 시작')
          response = await postAPI.like(postId)
          console.log('좋아요 추가 응답:', response)
          console.log('좋아요 추가 성공')
        }
        
        // 백엔드 응답 구조 확인
        console.log('좋아요 API 응답:', response.data)
        
        if (response.data && response.data.isSuccess) {
          console.log('좋아요 처리 성공, 상세 정보 재조회')
          
          // 좋아요 처리 후 상세 정보를 다시 조회하여 정확한 개수 반영
          try {
            const detailResponse = await postAPI.getDetail(postId)
            if (detailResponse.data && detailResponse.data.isSuccess) {
              const updatedPost = detailResponse.data.data
              console.log('상세 정보 재조회 성공:', updatedPost)
              
              // 좋아요 개수만 업데이트 (상태는 이미 변경됨)
              post.likeCount = updatedPost.likeCount
              
              console.log('좋아요 정보 업데이트 완료:', {
                postId: postId,
                likeCount: updatedPost.likeCount,
                isLiked: updatedPost.isLiked
              })
            }
          } catch (error) {
            console.error('상세 정보 재조회 실패:', error)
            // 재조회 실패 시 수동 계산으로 폴백
            if (previousLikedState) {
              post.likeCount = Math.max(0, (post.likeCount || 0) - 1)
            } else {
              post.likeCount = (post.likeCount || 0) + 1
            }
          }
        } else {
          console.log('좋아요 처리 실패, 상태 복원')
          // 실패 시 상태 복원
          const post = posts.value.find(p => p.id === postId)
          if (post) {
            post.liked = !post.liked
            console.log(`에러로 인한 상태 복원 - 포스트 ${postId}:`, post.liked)
          }
        }
        console.log('좋아요 처리 완료')
        
        console.log(`좋아요 토글 완료 - 포스트 ${postId}`)
      } catch (error) {
        console.error('좋아요 토글 실패:', error)
        console.error('에러 상세:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
        
        // 에러 시 상태 복원
        const post = posts.value.find(p => p.id === postId)
        if (post) {
          post.liked = !post.liked
          console.log(`에러로 인한 상태 복원 - 포스트 ${postId}:`, post.liked)
        }
        
        // 에러 메시지 표시
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('좋아요 처리에 실패했습니다.')
        }
      } finally {
        likeProcessingPosts.value.delete(postId)
      }
    }

    // 댓글 모달 열기
    const openCommentsModal = async (postId) => {
      console.log('=== 댓글 모달 열기 시도 ===')
      console.log('전달받은 postId:', postId)
      console.log('postId 타입:', typeof postId)
      console.log('postId 값 검증:', postId === null ? 'null' : postId === undefined ? 'undefined' : postId)
      console.log('현재 showCommentsModal 상태:', showCommentsModal.value)
      console.log('현재 selectedPostId 상태:', selectedPostId.value)
      
      // postId 유효성 검사
      if (!postId) {
        console.error('postId가 없어서 모달을 열 수 없습니다.')
        return
      }
      
      // 숫자 변환 시도
      const numericPostId = Number(postId)
      console.log('숫자 변환 결과:', numericPostId)
      console.log('변환 후 유효성:', !isNaN(numericPostId))
      
      if (isNaN(numericPostId)) {
        console.error('postId가 유효한 숫자가 아닙니다.')
        return
      }
      
      console.log('=== 상태 변경 시작 ===')
      selectedPostId.value = numericPostId
      console.log('selectedPostId 설정 완료:', selectedPostId.value)
      
      showCommentsModal.value = true
      console.log('showCommentsModal 설정 완료:', showCommentsModal.value)
      
      // 모달이 열린 후 댓글 목록 로드
      await fetchComments()
      
      // 모달 열릴 때 해당 게시글의 댓글 목록을 가져와 전달
      const post = posts.value.find(p => p.id === numericPostId)
      if (post) {
        console.log('해당 게시글 찾음:', post)
        console.log('게시글 ID:', post.id)
        console.log('게시글 제목/내용:', post.content?.substring(0, 50) + '...')
      } else {
        console.warn('해당 게시글을 찾을 수 없음:', numericPostId)
        console.log('현재 posts 배열:', posts.value.map(p => ({ id: p.id, content: p.content?.substring(0, 30) })))
      }
      
      console.log('=== 댓글 모달 열기 완료 ===')
      console.log('최종 selectedPostId:', selectedPostId.value)
      console.log('최종 showCommentsModal:', showCommentsModal.value)
    }

    // 댓글 모달 닫기
    const closeCommentsModal = () => {
      showCommentsModal.value = false
      selectedPostId.value = null
      commentsList.value = [] // 모달 닫을 때 댓글 목록 초기화
    }

    // 좋아요 모달 열기
    const openLikesModal = async (postId) => {
      console.log('=== 좋아요 모달 열기 시도 ===')
      console.log('전달받은 postId:', postId)
      
      if (!postId) {
        console.error('postId가 없어서 좋아요 모달을 열 수 없습니다.')
        return
      }
      
      const numericPostId = Number(postId)
      if (isNaN(numericPostId)) {
        console.error('postId가 유효한 숫자가 아닙니다.')
        return
      }
      
      selectedLikesPostId.value = numericPostId
      showLikesModal.value = true
      
      // 좋아요 목록 가져오기
      await fetchLikes(numericPostId)
    }

    // 좋아요 모달 닫기
    const closeLikesModal = () => {
      showLikesModal.value = false
      selectedLikesPostId.value = null
      likesList.value = []
    }

    // 좋아요 목록 가져오기
    const fetchLikes = async (postId) => {
      try {
        isLoadingLikes.value = true
        console.log('좋아요 목록 가져오기 시작:', postId)
        
        const response = await postAPI.getLikes(postId, { page: 0, size: 50 })
        console.log('좋아요 API 응답:', response)
        
        if (response.data && response.data.isSuccess) {
          let likesData = []
          
          if (response.data.data) {
            if (Array.isArray(response.data.data)) {
              likesData = response.data.data
            } else if (response.data.data.content) {
              likesData = response.data.data.content
            } else {
              likesData = response.data.data
            }
          }
          
          likesList.value = likesData || []
          console.log('좋아요 목록 설정 완료:', likesList.value.length)
        } else {
          console.log('좋아요 API 응답이 성공이 아님:', response.data)
          likesList.value = []
        }
      } catch (error) {
        console.error('좋아요 목록 가져오기 실패:', error)
        likesList.value = []
      } finally {
        isLoadingLikes.value = false
      }
    }

    // 댓글 추가 시 호출될 함수
    const handleCommentAdded = (newComment) => {
      console.log('댓글 추가 완료:', newComment)
      // 댓글 목록 새로고침
      fetchComments()
      // 댓글 카운트 업데이트
      updateCommentCount(selectedPostId.value, 1)
    }

    // 댓글 수정 시 호출될 함수
    const handleCommentUpdated = (updatedComment) => {
      console.log('댓글 수정 완료:', updatedComment)
      // 댓글 목록 새로고침
      fetchComments()
    }

    // 댓글 삭제 시 호출될 함수
    const handleCommentDeleted = (commentId) => {
      console.log('댓글 삭제 완료:', commentId)
      // 댓글 목록 새로고침
      fetchComments()
      // 댓글 카운트 업데이트
      updateCommentCount(selectedPostId.value, -1)
    }

    // 댓글 카운트 업데이트 함수
    const updateCommentCount = (postId, change) => {
      console.log('댓글 카운트 업데이트:', postId, change)
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.commentsCount = Math.max(0, (post.commentsCount || 0) + change)
        console.log('업데이트된 댓글 카운트:', post.commentsCount)
      }
    }

    // 댓글 추가
    const handleAddComment = async (content) => {
      try {
        // 펫 등록 여부 확인
        const hasPet = await checkPetExist()
        if (!hasPet) return
        
        console.log('=== 댓글 추가 시작 ===')
        console.log('댓글 내용:', content)
        console.log('선택된 포스트 ID:', selectedPostId.value)
        
        await postAPI.createComment(selectedPostId.value, content)
        console.log('댓글 추가 성공')
        
        // 댓글 카운트 업데이트
        updateCommentCount(selectedPostId.value, 1)
        
        // 댓글 목록 새로고침
        await fetchComments()
        
        // 댓글 미리보기 업데이트
        await fetchAllCommentsPreview()
      } catch (error) {
        console.error('댓글 추가 실패:', error)
        handleApiError(error, router, '댓글 작성에 실패했습니다.')
        throw error
      }
    }

    // 답글 추가
    const handleAddReply = async (replyData) => {
      try {
        // 펫 등록 여부 확인
        const hasPet = await checkPetExist()
        if (!hasPet) return
        
        console.log('=== 답글 추가 시작 ===')
        console.log('답글 데이터:', replyData)
        
        await postAPI.createReply(replyData.commentId, replyData.content, replyData.mentionUserId)
        console.log('답글 추가 성공')
        
        // 댓글 카운트 업데이트 (답글도 댓글 카운트에 포함)
        updateCommentCount(selectedPostId.value, 1)
        
        // 댓글 목록 새로고침
        await fetchComments()
        
        // 댓글 미리보기 업데이트
        await fetchAllCommentsPreview()
      } catch (error) {
        console.error('답글 추가 실패:', error)
        handleApiError(error, router, '답글 작성에 실패했습니다.')
        throw error
      }
    }

    // 댓글 수정
    const handleEditComment = async (commentData) => {
      try {
        console.log('=== 댓글 수정 시작 ===')
        console.log('댓글 수정 데이터:', commentData)
        
        await postAPI.updateComment(commentData.commentId, commentData.content)
        console.log('댓글 수정 성공')
        
        // 댓글 목록 새로고침
        await fetchComments()
      } catch (error) {
        console.error('댓글 수정 실패:', error)
        handleApiError(error, router, '댓글 수정에 실패했습니다.')
        throw error
      }
    }

    // 댓글 삭제
    const handleDeleteComment = async (commentData) => {
      try {
        console.log('=== 댓글 삭제 시작 ===')
        console.log('댓글 삭제 데이터:', commentData)
        
        await postAPI.deleteComment(commentData.commentId)
        console.log('댓글 삭제 성공')
        
        // 댓글 카운트 업데이트
        updateCommentCount(selectedPostId.value, -1)
        
        // 댓글 목록 새로고침
        await fetchComments()
      } catch (error) {
        console.error('댓글 삭제 실패:', error)
        handleApiError(error, router, '댓글 삭제에 실패했습니다.')
        throw error
      }
    }

    // 답글 수정
    const handleEditReply = async (replyData) => {
      try {
        console.log('=== 답글 수정 시작 ===')
        console.log('답글 수정 데이터:', replyData)
        
        await postAPI.updateComment(replyData.replyId, replyData.content)
        console.log('답글 수정 성공')
        
        // 댓글 목록 새로고침
        await fetchComments()
      } catch (error) {
        console.error('답글 수정 실패:', error)
        handleApiError(error, router, '답글 수정에 실패했습니다.')
        throw error
      }
    }

    // 답글 삭제
    const handleDeleteReply = async (replyData) => {
      try {
        console.log('=== 답글 삭제 시작 ===')
        console.log('답글 삭제 데이터:', replyData)
        
        await postAPI.deleteComment(replyData.replyId)
        console.log('답글 삭제 성공')
        
        // 댓글 카운트 업데이트 (답글도 댓글 카운트에 포함)
        updateCommentCount(selectedPostId.value, -1)
        
        // 댓글 목록 새로고침
        await fetchComments()
      } catch (error) {
        console.error('답글 삭제 실패:', error)
        throw error
      }
    }

    // 댓글 목록 새로고침
    const fetchComments = async () => {
      try {
        console.log('=== 댓글 목록 새로고침 시작 ===')
        console.log('선택된 포스트 ID:', selectedPostId.value)
        
        if (!selectedPostId.value) {
          console.warn('선택된 포스트 ID가 없어 댓글 목록 새로고침 건너뜀')
          return
        }
        
        // 댓글 목록 API 호출
        const response = await postAPI.getComments(selectedPostId.value, { page: 0, size: 50 })
        console.log('댓글 목록 API 응답:', response)
        
        if (response.data && response.data.data) {
          console.log('댓글 목록 응답 전체:', response.data)
          
          // 다양한 응답 구조 처리
          let commentsData = []
          
          if (response.data.data.content) {
            // Page 구조: response.data.data.content
            commentsData = response.data.data.content
          } else if (Array.isArray(response.data.data)) {
            // 직접 배열 구조
            commentsData = response.data.data
          } else {
            commentsData = response.data.data
          }
          
          console.log('추출된 댓글 데이터:', commentsData)
          commentsList.value = Array.isArray(commentsData) ? commentsData : []
          console.log('commentsList 업데이트됨:', commentsList.value.length)
        } else {
          console.log('댓글 목록 데이터가 없음')
          commentsList.value = []
        }
        
        // 댓글 미리보기 업데이트
        await fetchAllCommentsPreview()
      } catch (error) {
        console.error('댓글 목록 새로고침 실패:', error)
      }
    }


    // 해시태그 제거
    const removeHashtags = (content) => {
      if (!content) return ''
      // 해시태그와 그 뒤의 공백을 모두 제거
      return content.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim()
    }

    // 좋아요 텍스트 생성
    const getLikesText = (count) => {
      if (count === 0) return '좋아요를 눌러보세요'
      if (count === 1) return '1명이 좋아합니다'
      return `${count}명이 좋아합니다`
    }

    // 댓글 텍스트 포맷팅 (태그 추출)
    const formatCommentText = (text, mentionUserId = null) => {
      if (!text) return []
      
      const parts = []
      // @username 패턴을 더 정확하게 매칭 (한글, 영문, 숫자, 언더스코어 포함)
      const tagRegex = /@([a-zA-Z0-9가-힣_]+)/g
      let lastIndex = 0
      let match
      
      while ((match = tagRegex.exec(text)) !== null) {
        // 태그 이전 텍스트
        if (match.index > lastIndex) {
          parts.push({
            text: text.slice(lastIndex, match.index),
            isTag: false
          })
        }
        
        // 태그 부분
        parts.push({
          text: match[0], // @username
          isTag: true,
          userId: mentionUserId || match[1] // mentionUserId가 있으면 사용, 없으면 username 사용
        })
        
        lastIndex = match.index + match[0].length
      }
      
      // 마지막 텍스트
      if (lastIndex < text.length) {
        parts.push({
          text: text.slice(lastIndex),
          isTag: false
        })
      }
      
      return parts
    }

    // 해시태그 검색
    const searchByHashtag = (tag) => {
      console.log('해시태그 검색 호출:', tag, typeof tag)
      router.push(`/search?searchType=HASHTAG&keyword=${encodeURIComponent(tag)}`)
    }

    // 게시글 수정
    const editPost = (postId) => {
      console.log('수정 페이지로 이동:', postId)
      router.push(`/diary/${postId}/edit`)
    }

    // 게시글 삭제
    const deletePost = async (postId) => {
      if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        try {
          await postAPI.delete(postId)
          alert('게시글이 삭제되었습니다.')
          // 삭제된 게시글을 목록에서 제거
          posts.value = posts.value.filter(post => post.id !== postId)
        } catch (error) {
          console.error('게시글 삭제 실패:', error)
          alert('게시글 삭제에 실패했습니다.')
        }
      }
    }

    // 팔로우 처리 중인지 확인하는 함수
    const isFollowProcessing = (userId) => {
      return followProcessingUsers.value?.has(userId) || false
    }

    // 팔로우하기
    const followUser = async (userId) => {
      if (isFollowProcessing(userId)) return
      
      console.log(`팔로우 시작 - userId: ${userId}`)
      followProcessingUsers.value.add(userId)
      try {
        const response = await userAPI.follow(userId)
        console.log('팔로우 API 응답:', response)
        
        // 모든 포스트의 팔로우 상태 다시 조회
        await fetchAllFollowStatus()
        console.log('팔로우 후 모든 포스트 팔로우 상태 재조회 완료')
        
      } catch (error) {
        console.error('팔로우 실패:', error)
        alert('팔로우에 실패했습니다.')
      } finally {
        followProcessingUsers.value.delete(userId)
        console.log(`팔로우 처리 완료 - userId: ${userId}`)
      }
    }

    // 언팔로우 기능은 AllDiaryView에서 제공하지 않음
    // const unfollowUser = async (userId) => {
    //   if (isFollowProcessing(userId)) return
    //   
    //   console.log(`언팔로우 시작 - userId: ${userId}`)
    //   followProcessingUsers.value.add(userId)
    //   try {
    //     const response = await userAPI.unfollow(userId)
    //     console.log('언팔로우 API 응답:', response)
    //     
    //     // 모든 포스트의 팔로우 상태 다시 조회
    //     await fetchAllFollowStatus()
    //     console.log('언팔로우 후 모든 포스트 팔로우 상태 재조회 완료')
    //     
    //   } catch (error) {
    //     console.error('언팔로우 실패:', error)
    //     alert('언팔로우에 실패했습니다.')
    //   } finally {
    //     followProcessingUsers.value.delete(userId)
    //     console.log(`언팔로우 처리 완료 - userId: ${userId}`)
    //   }
    // }

    // 신고하기
    const reportPost = (postId) => {
      if (confirm('이 게시글을 신고하시겠습니까?')) {
        // 신고 로직 구현
        console.log('신고된 게시글 ID:', postId)
        alert('신고가 접수되었습니다.')
      }
    }

    // 이미지 네비게이션 함수들
    const prevImage = (postId) => {
      const currentIndex = currentImageIndex.value[postId] || 0
      if (currentIndex > 0) {
        currentImageIndex.value[postId] = currentIndex - 1
      }
    }

    const nextImage = (postId) => {
      const post = posts.value.find(p => p.id === postId)
      const currentIndex = currentImageIndex.value[postId] || 0
      if (post && post.mediaList && currentIndex < post.mediaList.length - 1) {
        currentImageIndex.value[postId] = currentIndex + 1
      }
    }

    const setImageIndex = (postId, index) => {
      currentImageIndex.value[postId] = index
    }



    // 날짜 필드 추출
    const getDateField = (post) => {
      // 백엔드에서 이미 포맷된 한국어 날짜를 보내므로 바로 반환
      return post.date || null
    }

    // 날짜 포맷팅 (백엔드에서 이미 포맷된 날짜를 보내므로 그대로 반환)
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return dateString
    }

    // 라우트 변경 감지
    watch(() => route.path, async (newPath, oldPath) => {
      if (newPath === '/diarys' && oldPath !== newPath) {
        console.log('AllDiaryView로 이동 감지, 댓글 수와 팔로우 상태 새로고침')
        await Promise.all([
          fetchAllCommentsCount(),
          fetchAllFollowStatus(),
          fetchAllCommentsPreview()
        ])
      }
    })

    onMounted(async () => {
      console.log('=== AllDiaryView onMounted ===')
      console.log('authStore.user:', authStore.user)
      console.log('authStore.isLoggedIn:', authStore.isLoggedIn)
      
      await fetchPosts(0, false)
      // 포스트 로딩 완료 후 댓글 수, 팔로우 상태, 댓글 미리보기 조회
      await Promise.all([
        fetchAllCommentsCount(),
        fetchAllFollowStatus(),
        fetchAllCommentsPreview()
      ])
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      posts,
      loading,
      hasMore,
      scrollTrigger,
      currentUserId,
      currentImageIndex,
      likeProcessingPosts,
      goToPost,
      goToPostWithComments,
      goToUserDiary,
      toggleLike,
      removeHashtags,
      searchByHashtag,
      editPost,
      deletePost,
      reportPost,
      followUser,
      isFollowProcessing,
      prevImage,
      nextImage,
      setImageIndex,
      getDateField,
      formatDate,
      isLikeProcessing,
      fetchAllFollowStatus,
      fetchAllCommentsPreview,
      formatCommentText,
      showCommentsModal,
      selectedPostId,
      commentsList,
      openCommentsModal,
      closeCommentsModal,
      handleCommentAdded,
      handleCommentUpdated,
      handleCommentDeleted,
      handleAddComment,
      handleAddReply,
      handleEditComment,
      handleDeleteComment,
      handleEditReply,
      handleDeleteReply,
      fetchComments,
      updateCommentCount,
      showLikesModal,
      selectedLikesPostId,
      likesList,
      isLoadingLikes,
      openLikesModal,
      closeLikesModal,
      fetchLikes,
      getLikesText,

      // selectedPostComments // 댓글 모달에 전달할 댓글 목록 반환 // 이 변수는 제거되었으므로 직접 사용
    }
  }
}
</script>

<style scoped>
.all-posts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.loading-text {
  margin-top: 16px;
  color: #6B7280;
  font-size: 1rem;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-section {
  border-bottom: 1px solid #E5E7EB;
  padding: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.post-section:last-child {
  border-bottom: none;
}

/* 포스트 헤더 */
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px 16px;
  gap: 12px;
}

.options-btn {
  color: #1E293B;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  padding: 4px;
}

.options-menu {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.menu-item {
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-text {
  font-size: 0.9rem;
  color: #1E293B;
}

.report-text {
  color: #dc3545;
}



/* 다중 이미지 슬라이더 스타일 */
.multi-image-slider {
  position: relative;
  width: 100%;
}

.image-slider {
  position: relative;
  width: 100%;
}

.image-navigation {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;
  z-index: 10;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.7) !important;
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.profile-avatar {
  border: 2px solid #E5E7EB;
  cursor: pointer;
}

.follow-section {
  margin-left: auto;
  margin-right: 8px;
}

.follow-btn {
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 20px;
  text-transform: none;
  color: white !important;
  background-color: #FF8B8B !important;
}

.follow-btn :deep(.v-btn__content) {
  color: white !important;
}

.unfollow-btn {
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 20px;
  text-transform: none;
}

/* 댓글 미리보기 스타일 */
.comments-preview {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  max-width: 100%;
  overflow: hidden;
}

.comments-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comments-preview-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1E293B;
}

.view-all-comments {
  font-size: 0.8rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.2s ease;
}

.view-all-comments:hover {
  color: #FF8B8B;
}

.comments-preview-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
  overflow: hidden;
  align-items: flex-start; /* 좌측 정렬 */
}

.comment-preview-item {
  display: flex;
  gap: 6px;
  font-size: 0.85rem;
  line-height: 1.4;
  align-items: flex-start;
  justify-content: flex-start; /* 좌측 정렬 */
  min-width: 0; /* flex 아이템이 축소될 수 있도록 */
}

.comment-author {
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px; /* 사용자명 최대 너비 제한 */
}

.comment-content {
  color: #495057;
  word-break: break-word;
  overflow-wrap: break-word;
  word-wrap: break-word;
  margin-top: 2px;
  flex: 1;
  min-width: 0; /* flex 아이템이 축소될 수 있도록 */
  max-width: 100%; /* 최대 너비 제한 */
  text-align: left; /* 좌측 정렬 */
}

.comment-text {
  word-break: break-word;
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: pre-wrap; /* 줄바꿈 유지 */
  text-align: left; /* 좌측 정렬 */
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0; /* 사용자 정보는 축소되지 않도록 */
  min-width: 0; /* flex 아이템이 축소될 수 있도록 */
  justify-content: flex-start; /* 좌측 정렬 */
}

.comment-avatar {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.comment-avatar:hover {
  opacity: 0.8;
}

.comment-author.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.comment-author.clickable:hover {
  color: #FF8B8B;
}

.tag-mention {
  font-weight: 700;
  color: #FF8B8B;
  word-break: keep-all; /* 태그는 단어 단위로만 줄바꿈 */
  white-space: nowrap; /* 태그는 줄바꿈 방지 */
}

.tag-mention.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.tag-mention.clickable:hover {
  color: #e67e7e;
  text-decoration: underline;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  text-align: left;
  min-width: 0;
  flex: 1;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1E293B;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.date {
  font-size: 0.8rem;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.clickable:hover {
  opacity: 0.7;
}

/* 이미지 컨테이너 */
.post-image-container {
  margin: 0 16px 12px 16px;
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
}

.single-image {
  width: 100%;
  height: 100%;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.multi-image-slider {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-slider {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 좋아요/댓글 바 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px 16px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.like-btn, .comment-btn {
  background: transparent !important;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.like-btn:hover, .comment-btn:hover {
  background: transparent !important;
  transform: scale(1.05);
  color: #FF8B8B;
}

.like-btn:focus, .comment-btn:focus {
  background: transparent !important;
  box-shadow: none !important;
}

.like-count, .comment-count {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1E293B;
}

.post-actions {
  margin-left: auto;
}

.share-btn {
  background: transparent !important;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.share-btn:hover {
  background: transparent !important;
  transform: scale(1.05);
  color: #1E293B;
}

.share-btn:focus {
  background: transparent !important;
  box-shadow: none !important;
}

/* 좋아요 정보 */
.likes-info {
  padding: 0 16px 8px 16px;
  text-align: left;
}

.likes-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1E293B;
  text-align: left;
  margin: 0;
  cursor: default;
}

.likes-text.clickable {
  cursor: pointer;
  transition: color 0.3s ease;
}

.likes-text.clickable:hover {
  color: #FF8B8B;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

/* 캡션 */
.post-caption {
  padding: 0 16px 8px 16px;
  line-height: 1.4;
  text-align: left;
  margin: 0;
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
}

/* 해시태그 */
.hashtags {
  padding: 0 16px 16px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.hashtag {
  color: #FF8B8B;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 139, 139, 0.05);
  border: 1px solid rgba(255, 139, 139, 0.1);
}

.hashtag:hover {
  background: rgba(255, 139, 139, 0.1);
  border-color: rgba(255, 139, 139, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #6B7280;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.empty-text {
  color: #6B7280;
  font-size: 1rem;
  margin-top: 8px;
}

.more-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #6B7280;
}

.scroll-trigger {
  height: 20px;
}

/* 댓글 모달 관련 스타일 */
.comments-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comments-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 반응형 */
@media (max-width: 768px) {
  .all-posts-container {
    max-width: 100%;
  }
  
  .post-section {
    padding: 0;
  }
  
  .post-header {
    padding: 12px 12px 8px 12px;
    gap: 8px;
  }
  
  .username, .date {
    max-width: 150px;
  }
  
  .post-image-container {
    height: 400px;
    margin: 0 12px 12px 12px;
  }
  
  .action-bar {
    padding: 0 12px 8px 12px;
  }
  
  .likes-info {
    padding: 0 12px 8px 12px;
  }
  
  .post-caption {
    padding: 0 12px 8px 12px;
  }
  
  .hashtags {
    padding: 0 12px 16px 12px;
  }
  
  .comments-preview {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .post-header {
    gap: 6px;
  }
  
  .username, .date {
    max-width: 120px;
  }
  
  .post-image-container {
    height: 300px;
    margin: 0 8px 12px 8px;
  }
}
</style>
