<template>
  <div class="diary-detail-page">
                <div class="diary-container">
              <!-- 로딩 상태 -->
              <div v-if="isLoading" class="loading-container">
                <v-progress-circular indeterminate color="#FF8B8B" size="64"></v-progress-circular>
                <p class="loading-text">로딩 중...</p>
              </div>
              
              <!-- 메인 포스트 섹션 -->
              <div v-else class="post-section">
        <!-- 포스트 헤더 -->
        <div class="post-header">
                                  <div class="profile-info">
                          <v-avatar size="40" class="profile-avatar">
                            <v-img 
                              :src="postData?.petImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center&q=90'" 
                              cover
                            ></v-img>
                          </v-avatar>
                          <div class="user-info">
                            <span class="username">{{ postData?.petName || '로딩 중...' }}</span>
                            <span class="date">{{ postData?.date || '로딩 중...' }}</span>
                          </div>
                        </div>
                                <v-menu offset-y>
                        <template v-slot:activator="{ props }">
                          <v-btn icon size="x-small" class="options-btn" v-bind="props">
                            <v-icon color="#1E293B" size="18">mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list class="options-menu">
                          <v-list-item @click="editPost" class="menu-item">
                            <v-list-item-title class="menu-text">수정</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="showDeleteConfirm = true" class="menu-item">
                            <v-list-item-title class="menu-text delete-text">삭제</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="reportPost" class="menu-item" v-if="!isMyPost">
                            <v-list-item-title class="menu-text">신고</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
        </div>

        <!-- 메인 이미지 -->
        <div class="post-image-container">
          <v-img 
            :src="postData?.mediaList?.[0] || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop&crop=center'" 
            class="post-image"
            cover
          ></v-img>
        </div>

        <!-- 좋아요/댓글 바 -->
        <div class="engagement-bar">
          <div class="engagement-left">
            <v-btn icon size="x-small" class="like-btn" @click="toggleLike">
              <v-icon :color="isLiked ? 'red' : '#1E293B'" size="20">mdi-heart</v-icon>
            </v-btn>
                                    <span class="like-count">{{ postData?.likeCount || 0 }}</span>
            <v-btn icon size="x-small" class="comment-btn" @click="toggleCommentsModal">
              <v-icon color="#1E293B" size="20">mdi-comment-outline</v-icon>
            </v-btn>
            <span class="comment-count">{{ commentsCount }}</span>
          </div>
        </div>

        <!-- 좋아요 정보 -->
        <div class="likes-info">
          <span class="likes-text" @click="showLikesModal = true">{{ likesText }}</span>
        </div>

        <!-- 캡션 -->
        <div class="caption" v-if="postData?.title">
          <span class="caption-username">{{ postData?.petName }}</span>
          <span class="caption-text">{{ postData?.title }}</span>
        </div>
        <div class="caption" v-if="postData?.content">
          <span class="caption-text">{{ postData?.content }}</span>
        </div>

        <!-- 해시태그 -->
        <div class="hashtags" v-if="postData?.hashTagList && postData.hashTagList.length > 0">
          <span 
            v-for="tag in postData.hashTagList" 
            :key="tag" 
            class="hashtag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 좋아요 모달 -->
    <LikesModal 
      v-model="showLikesModal"
      :likes-list="likesList"
    />

                    <!-- 댓글 모달 -->
                <CommentsModal 
                  v-model="showCommentsModal"
                  :comments-list="commentsList"
                  @add-comment="handleAddComment"
                />

                <!-- 삭제 확인 다이얼로그 -->
                <v-dialog v-model="showDeleteConfirm" max-width="400">
                  <v-card class="delete-dialog">
                    <v-card-title class="dialog-title">
                      삭제 확인
                    </v-card-title>
                    <v-card-text class="dialog-content">
                      정말로 이 게시물을 삭제하시겠습니까?
                    </v-card-text>
                    <v-card-actions class="dialog-actions">
                      <v-btn 
                        variant="outlined" 
                        @click="showDeleteConfirm = false"
                        class="cancel-btn"
                      >
                        취소
                      </v-btn>
                      <v-btn 
                        color="error" 
                        @click="deletePost"
                        class="delete-btn"
                      >
                        삭제
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
  </div>
</template>

<script>
            import { ref, computed, onMounted } from 'vue'
            import { useRouter, useRoute } from 'vue-router'
            import { postAPI } from '@/services/api'
            import LikesModal from '@/components/LikesModal.vue'
            import CommentsModal from '@/components/CommentsModal.vue'

export default {
  name: 'DiaryDetailView',
  components: {
    LikesModal,
    CommentsModal
  },
                setup() {
                const $router = useRouter()
                const $route = useRoute()
                
                // 모달 상태
                const showLikesModal = ref(false)
                const showCommentsModal = ref(false)
                const showDeleteConfirm = ref(false)
                
                // 포스트 데이터
                const postData = ref(null)
                const isLoading = ref(true)
    
    // 좋아요 상태
    const isLiked = ref(false)
    const likesCount = ref(50)
    
    // 더미 데이터
    const likesList = ref([
      { id: 1, username: 'mycat_', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' },
      { id: 2, username: 'cutecat_', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' },
      { id: 3, username: 'lovely_kitty', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' },
      { id: 4, username: 'soo12', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' },
      { id: 5, username: 'yoon', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' },
      { id: 6, username: 'meongnyang', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' }
    ])
    
    const commentsList = ref([
      { id: 1, username: 'mycat_', text: '냥냥이 너무 귀엽네요', time: '15:02', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' },
      { id: 2, username: 'cutecat_', text: '@mycat_ 낭낭이 너무 귀엽네요', time: '15:02', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' },
      { id: 3, username: 'cutecat_', text: '@mycat. 남남이 너무 귀엽네요', time: '15:00', profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center' }
    ])
    
    const commentsCount = ref(commentsList.value.length)
    
    // 계산된 속성
    const likesText = computed(() => {
      const count = postData.value?.likeCount || 0
      if (count === 0) return '좋아요를 눌러보세요'
      if (count === 1) return '1명이 좋아합니다'
      return `${count}명이 좋아합니다`
    })
    
    // 메서드
    const toggleLike = () => {
      isLiked.value = !isLiked.value
      if (isLiked.value) {
        likesCount.value++
      } else {
        likesCount.value--
      }
    }
    
    const toggleCommentsModal = () => {
      showCommentsModal.value = !showCommentsModal.value
    }
    
                    const handleAddComment = (commentText) => {
                  const newComment = {
                    id: commentsList.value.length + 1,
                    username: '현재사용자',
                    text: commentText,
                    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center'
                  }
                  commentsList.value.unshift(newComment)
                  commentsCount.value++
                }

                // 더보기 메뉴 메서드들
                const isMyPost = ref(true) // 실제로는 현재 사용자와 포스트 작성자 비교

                const editPost = () => {
                  // 수정 페이지로 이동
                  console.log('수정 페이지로 이동')
                }

                // 포스트 데이터 가져오기
                const fetchPostData = async () => {
                  try {
                    isLoading.value = true
                    const postId = $route.params.id
                    const response = await postAPI.getDetail(postId)
                    if (response.data && response.data.data) {
                      postData.value = response.data.data
                    }
                  } catch (error) {
                    console.error('포스트 데이터 조회 실패:', error)
                    // 에러 시 목록 페이지로 이동
                    $router.push('/diary')
                  } finally {
                    isLoading.value = false
                  }
                }

                const deletePost = async () => {
                  try {
                    const postId = $route.params.id
                    await postAPI.delete(postId)
                    showDeleteConfirm.value = false
                    // 삭제 후 목록 페이지로 이동
                    $router.push('/diary')
                  } catch (error) {
                    console.error('포스트 삭제 실패:', error)
                    showDeleteConfirm.value = false
                  }
                }

                const reportPost = () => {
                  // 신고 로직 구현
                  console.log('게시물 신고')
                }

                    // 컴포넌트 마운트 시 데이터 가져오기
                onMounted(() => {
                  fetchPostData()
                })

                return {
                  showLikesModal,
                  showCommentsModal,
                  showDeleteConfirm,
                  postData,
                  isLoading,
                  isLiked,
                  commentsCount,
                  likesList,
                  commentsList,
                  likesText,
                  isMyPost,
                  toggleLike,
                  toggleCommentsModal,
                  handleAddComment,
                  editPost,
                  deletePost,
                  reportPost
                }
  }
}
</script>

<style scoped>
.diary-detail-page {
  background: linear-gradient(135deg, #FFFAF0 0%, #FFF7EC 100%);
  min-height: 100vh;
  padding: 32px;
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

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  border: 2px solid #FF8B8B;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
  overflow: hidden;
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
  font-size: 0.95rem;
  color: #1a1a1a;
}

.date {
  font-size: 0.8rem;
  color: #666;
}

.options-btn {
  color: #1E293B;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  padding: 4px;
}

.options-btn:hover {
  background: transparent !important;
  transform: scale(1.05);
  color: #FF8B8B;
}

.post-image-container {
  position: relative;
  border: 2px solid #e3f2fd;
  border-radius: 8px;
  margin: 16px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 500px;
}

.engagement-bar {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.engagement-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.like-btn, .comment-btn {
  color: #1E293B;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  padding: 4px;
}

.like-btn:hover, .comment-btn:hover {
  background: transparent !important;
  transform: scale(1.05);
  color: #FF8B8B;
}

.like-count, .comment-count {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  margin-right: 20px;
}

.likes-info {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.likes-text {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
}

.likes-text:hover {
  color: #FF8B8B;
}

.caption {
  padding: 8px 20px;
  display: flex;
  gap: 8px;
}

.caption-username {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a1a;
}

.caption-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
}

.hashtags {
  padding: 8px 20px 20px 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hashtag {
  color: #FF8B8B;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 더보기 메뉴 스타일 */
            .options-menu {
              border-radius: 16px;
              background: rgba(255, 255, 255, 0.98);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 12px 40px rgba(15, 23, 42, 0.15);
              min-width: 120px;
              padding: 8px 0;
            }

            .menu-item {
              padding: 12px 20px;
              transition: all 0.3s ease;
              text-align: center;
              justify-content: center;
            }

            .menu-item:hover {
              background: linear-gradient(135deg, rgba(255, 139, 139, 0.08) 0%, rgba(255, 193, 193, 0.08) 100%);
              transform: translateY(-1px);
            }

            .menu-text {
              font-size: 0.9rem;
              color: #1E293B;
              font-weight: 500;
              text-align: center;
              width: 100%;
            }

            .delete-text {
              color: #EF4444 !important;
              font-weight: 600;
            }

/* 삭제 확인 다이얼로그 스타일 */
.delete-dialog {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  padding: 24px 24px 0 24px;
  color: #1E293B;
}

.dialog-content {
  padding: 16px 24px;
  text-align: center;
  color: #64748B;
  font-size: 0.9rem;
}

.dialog-actions {
  padding: 0 24px 24px 24px;
  justify-content: center;
  gap: 12px;
}

.cancel-btn {
  border-color: #CBD5E1;
  color: #64748B;
  font-weight: 500;
}

            .delete-btn {
              background: #EF4444 !important;
              color: white !important;
              font-weight: 600;
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
