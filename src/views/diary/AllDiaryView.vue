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
            <v-btn
              v-else
              size="small"
              variant="outlined"
              color="#6c757d"
              class="unfollow-btn"
              @click="unfollowUser(post.userId)"
              :disabled="isFollowProcessing(post.userId)"
              :loading="isFollowProcessing(post.userId)"
            >
              언팔로우
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
                :src="post.mediaList[post.currentImageIndex || 0]" 
                class="post-image"
                cover
              ></v-img>
              
              <!-- 이미지 네비게이션 버튼 -->
              <div class="image-navigation">
                <v-btn 
                  icon 
                  class="nav-btn prev-btn"
                  @click="previousImage(post.id)"
                  :disabled="(post.currentImageIndex || 0) === 0"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  class="nav-btn next-btn"
                  @click="nextImage(post.id)"
                  :disabled="(post.currentImageIndex || 0) === post.mediaList.length - 1"
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
                  :class="{ active: index === (post.currentImageIndex || 0) }"
                  @click="setImageIndex(post.id, index)"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 좋아요/댓글 바 -->
        <div class="engagement-bar">
          <div class="engagement-left">
                            <v-btn
                  icon
                  size="x-small"
                  class="like-btn"
                  @click="toggleLike(post.id)"
                  :disabled="isLikeProcessing(post.id)"
                >
                  <v-icon
                    v-if="!isLikeProcessing(post.id)"
                    :color="post.liked ? 'red' : '#1E293B'"
                    size="20"
                  >
                    mdi-heart
                  </v-icon>
                  <v-progress-circular
                    v-else
                    indeterminate
                    size="16"
                    width="2"
                    color="#FF8B8B"
                  ></v-progress-circular>
                </v-btn>
            <span class="like-count">{{ post.likeCount || 0 }}</span>
            <v-btn 
              icon 
              size="x-small" 
              class="comment-btn" 
              @click="goToPostWithComments(post.id)"
            >
              <v-icon color="#1E293B" size="20">mdi-comment-outline</v-icon>
            </v-btn>
            <span class="comment-count">{{ post.commentsCount || 0 }}</span>
          </div>
        </div>

                    <!-- 좋아요 정보 -->
            <div class="likes-info">
              <span 
                class="likes-text clickable" 
                @click="handleLikesTextClick(post.id)"
              >
                {{ getLikeCountText(post) }}
              </span>
            </div>

        <!-- 캡션 -->
        <div class="caption" v-if="post.content">
          <span class="caption-username">{{ post.userName || post.petName }}</span>
          <span class="caption-text">{{ removeHashtags(post.content) }}</span>
        </div>

        <!-- 해시태그 -->
        <div class="hashtags" v-if="post.hashTagList && post.hashTagList.length > 0">
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
              @click="goToPostWithComments(post.id)"
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
                  size="24" 
                  class="comment-avatar"
                  @click="goToUserDiary(comment.replyUserId || comment.userId)"
                >
                  <v-img 
                    :src="comment.profileImage || comment.userImage || '/default-avatar.png'" 
                    alt="User Avatar"
                  />
                </v-avatar>
                <span 
                  class="comment-author clickable"
                  @click="goToUserDiary(comment.replyUserId || comment.userId)"
                >
                  {{ comment.replyUserName || comment.userName || comment.user?.userName || comment.author?.userName || comment.petName || '익명' }}
                </span>
              </div>
              <span class="comment-content">
                <template v-for="(part, index) in formatCommentText(comment.content, comment.mentionUserId)" :key="index">
                  <span 
                    v-if="part.isTag" 
                    class="tag-mention clickable"
                    @click="goToUserDiary(part.userId)"
                  >
                    {{ part.text }}
                  </span>
                  <span v-else>{{ part.text }}</span>
                </template>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="!loading" class="empty-state">
      <v-icon size="64" color="grey">mdi-book-open-variant</v-icon>
      <h3>아직 작성된 일기가 없습니다</h3>
      <p>첫 번째 일기를 작성해보세요!</p>
    </div>

    <!-- 더 로딩 스피너 -->
    <div v-if="loading && posts.length > 0" class="more-loading">
      <v-progress-circular indeterminate color="#FF8B8B" size="32"></v-progress-circular>
      <span>더 많은 일기를 불러오는 중...</span>
    </div>

    <!-- 무한 스크롤 트리거 -->
    <div ref="scrollTrigger" class="scroll-trigger"></div>

    <!-- 좋아요 모달 -->
    <LikesModal 
      v-model="showLikesModal"
      :likes-list="likesList"
      @update:modelValue="handleLikesModalToggle"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { postAPI, userAPI } from '@/services/api'
import LikesModal from '@/components/LikesModal.vue'
import { checkPetExist } from '@/utils/petValidation'

export default {
  name: 'AllPostsView',
  components: {
    LikesModal
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
    
    // 좋아요 모달 관련 상태
    const showLikesModal = ref(false)
    const likesList = ref([])
    const isLoadingLikes = ref(false)
    const currentPostId = ref(null)
    const likeProcessingPosts = ref(new Set()) // 좋아요 처리 중인 포스트 ID들
    const followProcessingUsers = ref(new Set()) // 팔로우 처리 중인 사용자 ID들

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



    // 해시태그 제거
    const removeHashtags = (content) => {
      if (!content) return ''
      // 해시태그와 그 뒤의 공백을 모두 제거
      return content.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim()
    }

    // 좋아요 텍스트 생성
    const getLikesText = (post) => {
      const count = post.likeCount || 0
      if (count === 0) return '좋아요를 눌러보세요'
      if (count === 1) return '1명이 좋아합니다'
      return `${count}명이 좋아합니다`
    }

    // 좋아요 수 텍스트 생성 (숫자만)
    const getLikeCountText = (post) => {
      const count = post.likeCount || 0
      return count > 0 ? `좋아요 ${count}개` : '좋아요 0개'
    }

    // 좋아요 목록 가져오기
    const fetchLikes = async (postId) => {
      try {
        isLoadingLikes.value = true
        console.log('좋아요 목록 조회 시작 - postId:', postId)
        
        const response = await postAPI.getLikes(postId, { page: 0, size: 20 })
        console.log('좋아요 목록 응답:', response)
        
        if (response.data) {
          console.log('좋아요 목록 응답 전체:', response.data)
          
          // 다양한 응답 구조 처리
          let likesData = []
          
          if (response.data.data) {
            // CommonRes 구조: response.data.data
            if (Array.isArray(response.data.data)) {
              likesData = response.data.data
            } else if (response.data.data.content) {
              // Page 구조: response.data.data.content
              likesData = response.data.data.content
            } else {
              likesData = response.data.data
            }
          } else if (Array.isArray(response.data)) {
            // 직접 배열 구조
            likesData = response.data
          }
          
          console.log('추출된 좋아요 데이터:', likesData)
          likesList.value = Array.isArray(likesData) ? likesData : []
          console.log('설정된 좋아요 목록:', likesList.value)
        } else {
          console.log('좋아요 목록 데이터가 없음')
          likesList.value = []
        }
      } catch (error) {
        console.error('좋아요 목록 조회 실패:', error)
        console.error('에러 상세:', error.response?.data || error.message)
        likesList.value = []
      } finally {
        isLoadingLikes.value = false
      }
    }

    // 좋아요 텍스트 클릭 처리
    const handleLikesTextClick = async (postId) => {
      currentPostId.value = postId
      await fetchLikes(postId)
      showLikesModal.value = true
    }

    // 좋아요 모달 토글
    const handleLikesModalToggle = (value) => {
      showLikesModal.value = value
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

    // 언팔로우하기
    const unfollowUser = async (userId) => {
      if (isFollowProcessing(userId)) return
      
      console.log(`언팔로우 시작 - userId: ${userId}`)
      followProcessingUsers.value.add(userId)
      try {
        const response = await userAPI.unfollow(userId)
        console.log('언팔로우 API 응답:', response)
        
        // 모든 포스트의 팔로우 상태 다시 조회
        await fetchAllFollowStatus()
        console.log('언팔로우 후 모든 포스트 팔로우 상태 재조회 완료')
        
      } catch (error) {
        console.error('언팔로우 실패:', error)
        alert('언팔로우에 실패했습니다.')
      } finally {
        followProcessingUsers.value.delete(userId)
        console.log(`언팔로우 처리 완료 - userId: ${userId}`)
      }
    }

    // 신고하기
    const reportPost = (postId) => {
      if (confirm('이 게시글을 신고하시겠습니까?')) {
        // 신고 로직 구현
        console.log('신고된 게시글 ID:', postId)
        alert('신고가 접수되었습니다.')
      }
    }

    // 이미지 네비게이션 함수들
    const previousImage = (postId) => {
      const post = posts.value.find(p => p.id === postId)
      if (post && (post.currentImageIndex || 0) > 0) {
        post.currentImageIndex = (post.currentImageIndex || 0) - 1
      }
    }

    const nextImage = (postId) => {
      const post = posts.value.find(p => p.id === postId)
      if (post && post.mediaList && (post.currentImageIndex || 0) < post.mediaList.length - 1) {
        post.currentImageIndex = (post.currentImageIndex || 0) + 1
      }
    }

    const setImageIndex = (postId, index) => {
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.currentImageIndex = index
      }
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
      showLikesModal,
      likesList,
      isLoadingLikes,
      currentPostId,
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
      unfollowUser,
      isFollowProcessing,
      previousImage,
      nextImage,
      setImageIndex,
      getLikesText,
      getLikeCountText,
      handleLikesTextClick,
      handleLikesModalToggle,
      getDateField,
      formatDate,
      isLikeProcessing,
      fetchAllFollowStatus,
      fetchAllCommentsPreview,
      formatCommentText
    }
  }
}
</script>

<style scoped>
.all-posts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
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
  padding: 16px 0;
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
  padding: 0 16px 12px 16px;
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
}

.profile-avatar {
  border: 2px solid #E5E7EB;
  cursor: pointer;
}

.follow-section {
  margin-right: 4px;
  margin-left: 450px;
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
}

.comment-preview-item {
  display: flex;
  gap: 6px;
  font-size: 0.85rem;
  line-height: 1.4;
  align-items: flex-start;
}

.comment-author {
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
}

.comment-content {
  color: #495057;
  word-break: break-word;
  margin-top: 2px;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
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
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1E293B;
  cursor: pointer;
  text-align: left;
}

.date {
  font-size: 0.8rem;
  color: #6B7280;
}

.clickable:hover {
  opacity: 0.7;
}

/* 이미지 컨테이너 */
.post-image-container {
  margin-bottom: 12px;
}

.single-image {
  width: 100%;
}

.post-image {
  width: 100%;
  max-height: 600px;
  object-fit: cover;
}

.multi-image-slider {
  position: relative;
}

.image-slider {
  position: relative;
}

/* 좋아요/댓글 바 */
.engagement-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px 16px;
}

.engagement-left {
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
.caption {
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

/* 반응형 */
@media (max-width: 768px) {
  .all-posts-container {
    max-width: 100%;
  }
  
  .post-section {
    padding: 12px 0;
  }
  
  .post-header {
    padding: 0 12px 8px 12px;
  }
  
  .engagement-bar {
    padding: 0 12px 8px 12px;
  }
  
  .likes-info {
    padding: 0 12px 8px 12px;
  }
  
  .caption {
    padding: 0 12px 8px 12px;
  }
  
  .hashtags {
    padding: 0 12px 8px 12px;
  }
}
</style>
