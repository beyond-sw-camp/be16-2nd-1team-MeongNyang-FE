<template>
  <div class="market-detail-page">
    <!-- 헤더 섹션 -->
    <div class="back-btn-wrapper">
  <button @click="$router.push('/market')" class="back-btn">
    <v-icon icon="mdi-arrow-left" size="20" />
    목록으로
  </button>
</div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>거래글을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchPostDetail" class="retry-btn">다시 시도</button>
    </div>

    <!-- 상세 내용 -->
    <div v-else-if="post" class="detail-content">
      <!-- 이미지 섹션 -->
      <div class="image-section">
        <div class="image-container">
          <img 
            :src="currentImage" 
            :alt="post.title"
            class="main-image"
          />
          
          <!-- 상태 뱃지 (좌상단) -->
          <div class="status-badge" :class="post.saleStatus.toLowerCase()">
            {{ getStatusLabel(post.saleStatus) }}
          </div>
          
          <!-- 찜하기 버튼 (우상단) -->
          <button 
            class="like-btn"
            @click="toggleLike"
            :class="{ liked: post.isLiked }"
          >
            <v-icon 
              :icon="post.isLiked ? 'mdi-heart' : 'mdi-heart-outline'" 
              size="20"
            />
          </button>
          
          <!-- 이미지 네비게이션 -->
          <div class="image-nav">
            <button 
              class="nav-btn prev"
              @click="previousImage"
              :disabled="currentImageIndex === 0"
            >
              <v-icon icon="mdi-chevron-left" size="24" />
            </button>
            <button 
              class="nav-btn next"
              @click="nextImage"
              :disabled="currentImageIndex === (post.images?.length || 1) - 1"
            >
              <v-icon icon="mdi-chevron-right" size="24" />
            </button>
          </div>
          
          <!-- 이미지 인덱스 표시 -->
          <div v-if="post.images && post.images.length > 1" class="image-counter">
            {{ currentImageIndex + 1 }} / {{ post.images.length }}
          </div>
        </div>
        
        <!-- 이미지 썸네일 -->
        <div v-if="post.images && post.images.length > 1" class="thumbnails">
          <div 
            v-for="(image, index) in post.images" 
            :key="index"
            class="thumbnail"
            :class="{ active: index === currentImageIndex }"
            @click="setCurrentImage(index)"
          >
            <img :src="image" :alt="`${post.title} ${index + 1}`" />
          </div>
        </div>
        <!-- 판매자 정보 -->
        <div class="seller-info">
          <div class="seller-header">
            <h3>판매자 정보</h3>
          </div>
          <div class="seller-profile">
            <div class="profile-image-container">
              <img 
                :src="post.pet?.petProfileUrl || '/default-profile.png'" 
                :alt="post.pet?.nickname || '판매자'"
                class="profile-image"
              />
              <!-- <div class="online-indicator"></div> -->
            </div>
            <div class="seller-details">
              <div class="seller-name">{{ post.pet?.nickname || '판매자' }}</div>
              <!-- 위치정보와 별점 삭제 -->
            </div>
          </div>
        </div>
        <!-- 채팅하기 버튼 -->
        <div class="action-section">
          <button class="chat-btn primary">
            <v-icon icon="mdi-chat" size="20" />
            채팅하기
          </button>
        </div>
      </div>

      <!-- 정보 섹션 -->
      <div class="info-section">
        <!-- 제목 및 카테고리 -->
        <div class="post-header">
          <div class="title-row">
            <h2 class="post-title">{{ post.title }}</h2>
            <span class="category-badge">{{ getCategoryLabel(post.category) }}</span>
          </div>
          <div class="post-meta">
            <span class="date">
              <v-icon icon="mdi-calendar" size="16" />
              {{ formatDate(post.createdAt) }}
            </span>
          </div>
        </div>

        <!-- 가격 및 상태 -->
        <div class="price-section">
          <div class="price-info">
            <div class="price">{{ formatPrice(post.price) }}</div>
          </div>
        </div>


        <!-- 본문 -->
        <div class="post-description">
          <div class="description-header">
            <h3>상품 설명</h3>
          </div>
          <div class="description-content">
            <p>{{ post.description || '상품 설명이 없습니다.' }}</p>
          </div>
        </div>

        <!-- 거래 위치 -->
        <div class="location-section">
          <div class="location-header">
            <h3>거래 위치</h3>
            <span class="location-detail">{{ formatLocation(post.region) }}</span>
          </div>
          <div class="map-container" ref="mapContainer">
            <div class="map-placeholder">
              <v-icon icon="mdi-map-marker" size="48" color="#E87D7D" />
              <p>지도 로딩 중...</p>
              <small>위치 정보를 확인하려면 클릭하세요</small>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MarketDetailView',
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    // 반응형 데이터
    const post = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const currentImageIndex = ref(0)
    const mapContainer = ref(null)
    
    // 카테고리 라벨
    const categoryLabels = {
      'FEED': '사료',
      'CLOTH': '의류', 
      'TOY': '장난감',
      'OTHER': '기타'
    }
    
    // 현재 이미지 (썸네일을 첫 번째 이미지로 설정)
    const currentImage = computed(() => {
      if (!post.value) return ''
      if (post.value.images && post.value.images.length > 0) {
        return post.value.images[currentImageIndex.value]
      }
      return post.value.thumbnailUrl || ''
    })
    
    // 거래글 상세 조회
    const fetchPostDetail = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await axios.get(`http://localhost:8080/markets/posts/${route.params.id}`)
        if (response.data && response.data.isSuccess) {
          post.value = response.data.data
          console.log('거래글 상세:', post.value)
          
          // 썸네일을 첫 번째 이미지로 설정
          if (post.value.images && post.value.images.length > 0) {
            currentImageIndex.value = 0
          }
          // 현재 로그인한 유저의 찜 상태 확인
          await checkUserLikeStatus()
        } else {
          error.value = '거래글을 불러올 수 없습니다.'
        }
      } catch (err) {
        console.error('거래글 상세 조회 오류:', err)
        error.value = '거래글을 불러오는 중 오류가 발생했습니다.'
      } finally {
        loading.value = false
      }
    }

    // 현재 유저의 찜 상태 확인
    const checkUserLikeStatus = async () => {
      try {
        const token = authStore.getToken()
        if (!token) return
        
        const response = await axios.get(`http://localhost:8080/markets/posts/likes/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.data && response.data.isSuccess) {
          const likedPosts = response.data.data
          // 현재 거래글이 찜한 목록에 있는지 확인
          post.value.isLiked = likedPosts.some(likedPost => likedPost.id === post.value.id)
        }
      } catch (err) {
        console.error('찜 상태 확인 오류:', err)
        post.value.isLiked = false
      }
    }
    
    // 찜하기 토글
    const toggleLike = async () => {
      try {
        const token = authStore.getToken()
        if (!token) {
          alert('로그인이 필요합니다.')
          return
        }
        
        const postId = post.value.id
        const isLiked = post.value.isLiked
        
        if (isLiked) {
          // 찜 취소
          await axios.delete(`http://localhost:8080/markets/${postId}/like`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        } else {
          // 찜하기
          await axios.post(`http://localhost:8080/markets/${postId}/like`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        }
        
        // 상태 토글
        post.value.isLiked = !isLiked
        
        // 찜 개수 업데이트 (백엔드에서 받아온 데이터 사용)
        if (post.value.likeCount !== undefined) {
          post.value.likeCount += isLiked ? -1 : 1
        }
        
      } catch (err) {
        console.error('찜하기 토글 오류:', err)
        alert('찜하기 처리 중 오류가 발생했습니다.')
      }
    }
    
    // 이미지 네비게이션
    const previousImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--
      }
    }
    
    const nextImage = () => {
      if (post.value?.images && currentImageIndex.value < post.value.images.length - 1) {
        currentImageIndex.value++
      }
    }
    
    const setCurrentImage = (index) => {
      currentImageIndex.value = index
    }
    
    // 유틸리티 함수
    const getCategoryLabel = (category) => {
      return categoryLabels[category] || category
    }
    
    const getStatusLabel = (status) => {
      return status === 'SALE' ? '판매중' : '판매완료'
    }
    
    const formatPrice = (price) => {
      return `₩${price.toLocaleString()}`
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ko-KR')
    }
    
    const formatLocation = (region) => {
      if (!region) return '위치 정보 없음'
      return region
    }
    
    onMounted(() => {
      fetchPostDetail()
    })
    
    return {
      post,
      loading,
      error,
      currentImageIndex,
      currentImage,
      mapContainer,
      fetchPostDetail,
      toggleLike,
      previousImage,
      nextImage,
      setCurrentImage,
      getCategoryLabel,
      getStatusLabel,
      formatPrice,
      formatDate,
      formatLocation
    }
  }
}
</script>

<style scoped>
.market-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFFDF6 0%, #FAF9F6 100%);
  padding: 20px 0;
}



.header-content {
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.9rem;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.image-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 20px;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.status-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.status-badge.sale {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.status-badge.sold {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.like-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #e9ecef;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.like-btn:hover {
  background: white;
  transform: scale(1.1);
  border-color: #E87D7D;
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.3);
}

.like-btn.liked {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-color: #E87D7D;
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.like-btn:not(.liked) {
  color: #6c757d;
}

.image-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover:not(:disabled) {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.thumbnails {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: #E87D7D;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.post-header {
  margin-bottom: 25px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.post-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  text-align: ;
}

.category-badge {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

.back-btn-wrapper {
  max-width: 1200px;   /* detail-content와 맞추기 */
  margin: 0 auto 20px; /* 가운데 정렬 + 아래 여백 */
  padding: 0 20px;     /* 양 옆 여백 */
  display: flex;
  align-items: center;
}

.post-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #E87D7D;
}

.status-badge-info {
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.status-badge-info.sale {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.status-badge-info.sold {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

.seller-info {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
}

.seller-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-image-container {
  position: relative;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #E87D7D;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

/* .online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: #28a745;
  border: 2px solid white;
  border-radius: 50%;
} */

.seller-details {
  flex: 1;
}

.seller-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0; /* 마진 제거 */
  font-size: 1.1rem;
  text-align: left;
}

.seller-location {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.seller-rating {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-description {
  margin-bottom: 25px;
}

.description-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  text-align: left;
}

.description-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
  text-align: left;
}

.description-content p {
  color: #495057;
  line-height: 1.7;
  margin: 0;
  font-size: 0.95rem;
}

.location-section {
  margin-bottom: 25px;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.location-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.location-detail {
  color: #6c757d;
  font-size: 0.9rem;
  background: #e9ecef;
  padding: 6px 12px;
  border-radius: 12px;
}

.map-container {
  height: 200px;
  background: #f8f9fa;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dee2e6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.map-container:hover {
  border-color: #E87D7D;
  background: #f1f3f4;
}

.map-placeholder {
  text-align: center;
  color: #6c757d;
}

.map-placeholder p {
  margin: 10px 0 5px 0;
  font-size: 0.9rem;
}

.map-placeholder small {
  color: #adb5bd;
  font-size: 0.8rem;
}

.action-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.chat-btn {
  display: flex;              /* 아이콘 + 글자를 가로로 배치 */
  align-items: center;        /* 세로 중앙 정렬 */
  justify-content: center;    /* 가로 중앙 정렬 */
  gap: 6px;                   /* 아이콘과 글자 사이 간격 */
  padding: 10px 18px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.chat-btn.primary {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  flex: 2;
}

.chat-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.4);
}

.chat-btn.secondary {
  background: white;
  color: #6c757d;
  border: 2px solid #e9ecef;
  flex: 1;
}

.chat-btn.secondary:hover {
  background: #f8f9fa;
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-2px);
}

.loading-container,
.error-container {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #E87D7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
}

/* 반응형 */
@media (max-width: 768px) {
  .detail-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .chat-btn.primary,
  .chat-btn.secondary {
    flex: 1;
  }
}
</style>