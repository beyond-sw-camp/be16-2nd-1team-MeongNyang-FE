<template>
  <div class="market-page">
    <v-container class="market-container">
      <!-- 페이지 헤더 -->
      <div class="market-header">
        <h1 class="page-title">멍냥거래</h1>
        <p class="page-subtitle">안쓰는 애완용품을 거래해보세요 🐱🐶</p>
      </div>

      <!-- 검색 및 필터 섹션 -->
      <div class="search-filter-section">
        <div class="filter-controls">
          <!-- 검색창 -->
          <div class="search-container">
            <v-icon icon="mdi-magnify" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="찾고 싶은 물건을 검색해보세요"
              class="search-input"
              @input="handleSearch"
            />
          </div>

          <!-- 카테고리 버튼들 -->
          <div class="category-buttons">
            <button
              v-for="category in categories"
              :key="category.value"
              :class="['category-btn', { active: selectedCategory === category.value }]"
              @click="handleCategorySelect(category.value)"
            >
              {{ category.label }}
            </button>
          </div>

          
          <!-- 정렬 선택 -->
          <div class="filter-group">
            <div class="dropdown-container">
              <button class="dropdown-btn" @click="toggleSortDropdown">
                <span>{{ getSelectedSortLabel() }}</span>
                <v-icon icon="mdi-chevron-down" class="dropdown-icon" />
              </button>
              <div v-if="showSortDropdown" class="dropdown-menu">
                <div
                  v-for="sort in sortOptions"
                  :key="sort.value"
                  :class="['dropdown-item', { active: selectedSort === sort.value }]"
                  @click="selectSort(sort.value)"
                >
                  {{ sort.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 거래글 목록 -->
      <div class="market-content">
        <!-- 목록 정보 및 작성 버튼 -->
        <div class="list-header">
          <div class="list-info">
            <span class="total-count">총 {{ totalElements }}개의 거래글</span>
            <span class="category-info" v-if="selectedCategory !== 'all'">
              • {{ getCategoryLabel(selectedCategory) }}
            </span>
          </div>
          <div class="header-buttons">
            <button class="my-trade-btn" @click="navigateToMyTrade">
              <v-icon icon="mdi-format-list-bulleted" size="18" />
              거래내역
            </button>
            <button class="wishlist-btn" @click="navigateToWishlist">
              <v-icon icon="mdi-heart" size="18" />
              찜목록
            </button>
          <button class="create-post-btn" @click="navigateToCreate">
            <v-icon icon="mdi-plus" size="18" />
              판매하기
          </button>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>거래글을 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button @click="fetchMarketPosts" class="retry-btn">다시 시도</button>
        </div>

        <!-- 거래글 그리드 (3x3) -->
        <div v-else-if="posts.length > 0" class="posts-grid">
          <div
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            @click="navigateToPost(post.id)"
          >
            <!-- 이미지 -->
            <div class="post-image">
              <img 
                v-if="post.thumbnailUrl"
                :src="post.thumbnailUrl" 
                :alt="post.title"
                @error="handleImageError"
              />
              <!-- 이미지가 없는 경우 기본 이미지 표시 -->
              <div v-else class="default-image">
                <v-icon icon="mdi-image-off" size="48" color="#E87D7D" />
                <span class="default-image-text">이미지 없음</span>
              </div>
            </div>

            <!-- 내용 -->
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <div class="post-price">{{ formatPrice(post.price) }}</div>
            </div>

            <!-- 판매상태 배지 -->
            <div class="status-badge" :class="getStatusClass(post.saleStatus)">
              {{ getStatusText(post.saleStatus) }}
            </div>
            
            <!-- 찜하기 버튼 -->
              <button 
                class="like-btn"
                @click.stop="toggleLike(post.id)"
                :class="{ liked: post.isLiked }"
              >
                <v-icon 
                  :icon="post.isLiked ? 'mdi-heart' : 'mdi-heart-outline'" 
                  size="20"
                />
              </button>
            
            <!-- 거리 정보 표시 -->
            <div v-if="selectedSort === 'distance' && post.distance !== null" class="distance-info">
              <span class="distance-text">{{ formatDistance(post.distance) }}</span>  
            </div>
          </div>
        </div>
        

        <!-- 빈 상태 -->
        <div v-else class="empty-container">
          <p>등록된 거래글이 없습니다.</p>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            class="page-btn prev" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <v-icon icon="mdi-chevron-left" size="18" />
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-btn', { active: page === currentPage }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            class="page-btn next" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            <v-icon icon="mdi-chevron-right" size="18" />
          </button>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script>
import { marketAPI } from '@/services/api'

export default {
  name: 'MarketListView',
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
      selectedSort: 'latest',
      showSortDropdown: false,
      currentPage: 1,
      itemsPerPage: 9,
      posts: [],
      loading: false,
      error: null,
      totalElements: 0,
      totalPages: 0,
      // 백엔드 Category enum 기반으로 수정
      categories: [
        { label: '전체', value: 'all' },
        { label: '사료', value: 'FEED' },
        { label: '의류', value: 'CLOTH' },
        { label: '장난감', value: 'TOY' },
        { label: '기타', value: 'OTHER' }
      ],
      sortOptions: [
        { title: '최신순', value: 'latest' },
        { title: '인기순', value: 'popular' },
        { title: '가격 낮은순', value: 'price-low' },
        { title: '가격 높은순', value: 'price-high' },
        { title: '📍 거리순', value: 'distance' }
      ],

      
      // 위치 관련 상태
      userLocation: null, // 사용자 현재 위치 { lat, lng }
      locationPermission: 'prompt', // 'granted', 'denied', 'prompt'
      isLocationLoading: false,
      
      // 검색 디바운싱
      searchTimeout: null,
    }
  },
  computed: {
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  methods: {
    // 거리 계산 함수 (Haversine 공식)
    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371 // 지구 반지름 (km)
      const dLat = this.toRadians(lat2 - lat1)
      const dLon = this.toRadians(lon2 - lon1)
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c
      return Math.round(distance * 100) / 100 // 소수점 둘째 자리까지
    },

    // 도를 라디안으로 변환
    toRadians(degrees) {
      return degrees * (Math.PI / 180)
    },

    // 거리 포맷팅 (km/m 표시)
    formatDistance(distance) {
      if (distance < 1) {
        return `${Math.round(distance * 1000)}m`
      } else {
        return `${distance}km`
      }
    },

    // 사용자 위치 가져오기
    async getUserLocation() {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser.')
        return null
      }

      return new Promise((resolve, reject) => {
        this.isLocationLoading = true
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.isLocationLoading = false
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            this.userLocation = location
            this.locationPermission = 'granted'
            console.log('사용자 위치 획득:', location)
            resolve(location)
          },
          (error) => {
            this.isLocationLoading = false
            this.locationPermission = 'denied'
            console.error('위치 정보 획득 실패:', error)
            
            let errorMessage = '위치 정보를 가져올 수 없습니다.'
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = '위치 권한이 거부되었습니다.'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = '위치 정보를 사용할 수 없습니다.'
                break
              case error.TIMEOUT:
                errorMessage = '위치 정보 요청 시간이 초과되었습니다.'
                break
            }
            
            reject(new Error(errorMessage))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5분
          }
        )
      })
    },

    async fetchMarketPosts() {
      this.loading = true
      this.error = null
      
      try {
        const pageable = {
          page: this.currentPage - 1,
          size: this.itemsPerPage,
          sort: 'id,desc' // 기본 정렬
        }

        // 카테고리 필터링 파라미터 추가
        if (this.selectedCategory && this.selectedCategory !== 'all') {
          // Spring Boot에서 일반적으로 사용하는 파라미터 이름
          pageable.category = this.selectedCategory
          console.log('카테고리 필터링 적용:', this.selectedCategory)
        }

        // 검색어 파라미터 추가
        if (this.searchQuery && this.searchQuery.trim()) {
          pageable.search = this.searchQuery.trim()
          console.log('검색어 필터링 적용:', this.searchQuery.trim())
        }

        // 정렬 옵션에 따른 정렬 설정
        if (this.selectedSort === 'price-low') {
          pageable.sort = 'price,asc'
        } else if (this.selectedSort === 'price-high') {
          pageable.sort = 'price,desc'
        } else if (this.selectedSort === 'popular') {
          // 백엔드에서 likeCount 정렬이 안되므로 기본 정렬로 요청
          pageable.sort = 'id,desc'
        }

        console.log('Fetching market posts with pageable:', pageable)
        const response = await marketAPI.getList(pageable)
        console.log('API Response:', response)
        
        if (response.data && response.data.isSuccess) {
          let fetchedPosts = response.data.data?.content || []
          
          // 백엔드에서 필터링이 지원되지 않는 경우 클라이언트 사이드에서 필터링
          
          // 카테고리 필터링
          if (this.selectedCategory && this.selectedCategory !== 'all') {
            const originalLength = fetchedPosts.length
            fetchedPosts = fetchedPosts.filter(post => post.category === this.selectedCategory)
            console.log(`카테고리 필터링: ${originalLength}개 → ${fetchedPosts.length}개 (${this.selectedCategory})`)
          }
          
          // 검색어 필터링
          if (this.searchQuery && this.searchQuery.trim()) {
            const originalLength = fetchedPosts.length
            const searchTerm = this.searchQuery.toLowerCase().trim()
            fetchedPosts = fetchedPosts.filter(post => 
              post.title.toLowerCase().includes(searchTerm) ||
              (post.description && post.description.toLowerCase().includes(searchTerm))
            )
            console.log(`검색어 필터링: ${originalLength}개 → ${fetchedPosts.length}개 ("${searchTerm}")`)
          }
          
          // 인기순 정렬은 클라이언트 사이드에서 처리
          if (this.selectedSort === 'popular') {
            fetchedPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
            console.log('Sorted by likeCount:', fetchedPosts.map(p => ({ id: p.id, likeCount: p.likeCount })))
          }
          
          // 거리순 정렬 처리
          if (this.selectedSort === 'distance') {
            if (this.userLocation) {
              // 각 포스트에 거리 정보 추가
              fetchedPosts.forEach(post => {
                if (post.latitude && post.longitude) {
                  post.distance = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lng,
                    post.latitude,
                    post.longitude
                  )
                } else {
                  post.distance = null // 위치 정보가 없는 경우
                }
              })
              
              // 거리순으로 정렬 (위치 정보가 있는 것만, 가까운 순)
              fetchedPosts.sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0
                if (a.distance === null) return 1
                if (b.distance === null) return -1
                return a.distance - b.distance
              })
              
              console.log('Sorted by distance:', fetchedPosts.map(p => ({ 
                id: p.id, 
                distance: p.distance,
                title: p.title 
              })))
            } else {
              // 사용자 위치가 없으면 위치 요청
              try {
                await this.getUserLocation()
                // 위치 획득 후 다시 정렬
                if (this.userLocation) {
                  fetchedPosts.forEach(post => {
                    if (post.latitude && post.longitude) {
                      post.distance = this.calculateDistance(
                        this.userLocation.lat,
                        this.userLocation.lng,
                        post.latitude,
                        post.longitude
                      )
                    } else {
                      post.distance = null
                    }
                  })
                  
                  fetchedPosts.sort((a, b) => {
                    if (a.distance === null && b.distance === null) return 0
                    if (a.distance === null) return 1
                    if (b.distance === null) return -1
                    return a.distance - b.distance
                  })
                }
              } catch (error) {
                console.warn('위치 정보를 가져올 수 없어 거리순 정렬을 할 수 없습니다:', error.message)
                // 위치 정보가 없으면 기본 정렬로 변경
                this.selectedSort = 'latest'
              }
            }
          }
          
          this.posts = fetchedPosts
          this.totalElements = response.data.data?.totalElements || 0
          this.totalPages = response.data.data?.totalPages || 0
          
          // 각 포스트에 isLiked 속성 추가 (백엔드에서 받은 liked 필드 사용)
          this.posts.forEach(post => {
            // 백엔드의 'liked' 필드를 'isLiked'로 매핑
            if (post.liked !== undefined) {
              post.isLiked = post.liked
              console.log(`게시글 ${post.id} liked 필드를 isLiked로 매핑:`, post.liked, '→', post.isLiked)
            } else {
              // 백엔드에서 liked 필드가 없는 경우 기본값 false
              post.isLiked = false
              console.log(`게시글 ${post.id} liked 필드 없음, 기본값 false 설정`)
            }
            
            if (!post.createdAt) {
              post.createdAt = new Date().toISOString()
            }
          })
        } else {
          this.error = response.data?.status?.message || '거래글 목록을 불러오는데 실패했습니다.'
          console.error('API Error:', response.data)
        }
      } catch (error) {
        console.error('거래글 목록 조회 오류:', error)
        this.error = '거래글 목록을 불러오는데 실패했습니다. 다시 시도해주세요.'
      } finally {
        this.loading = false
      }
    },

    async toggleLike(postId) {
      try {
        const post = this.posts.find(p => p.id === postId)
        if (!post) return

        console.log('찜하기 토글 시작 - postId:', postId, '현재 상태:', post.isLiked)

        if (post.isLiked) {
          // 찜 취소
          console.log('찜 취소 시도...')
          await marketAPI.unlikeMarket(postId)
          console.log('찜 취소 성공')
          post.likeCount = Math.max(0, (post.likeCount || 0) - 1)
        } else {
          // 찜하기
          console.log('찜하기 시도...')
          await marketAPI.likeMarket(postId)
          console.log('찜하기 성공')
          post.likeCount = (post.likeCount || 0) + 1
        }
        
        // 상태 토글 (DB 기반)
        post.isLiked = !post.isLiked
        console.log('찜 상태 업데이트 완료:', post.isLiked)
        
      } catch (error) {
        console.error('찜하기/취소 오류:', error)
        // 에러 발생 시 사용자에게 알림
        this.$emit('show-snackbar', {
          message: '찜하기 처리에 실패했습니다.',
          type: 'error'
        })
      }
    },

    handleCategorySelect(category) {
      this.selectedCategory = category
      this.currentPage = 1
      this.fetchMarketPosts()
    },

    handleSearch() {
      // 검색어 입력 시 디바운싱 적용
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchMarketPosts()
      }, 500)
    },

    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown
    },

    async selectSort(sort) {
      this.selectedSort = sort
      this.showSortDropdown = false
      this.currentPage = 1
      
      // 거리순 선택 시 위치 권한 요청
      if (sort === 'distance') {
        if (!this.userLocation && this.locationPermission !== 'denied') {
          try {
            await this.getUserLocation()
          } catch (error) {
            console.warn('위치 정보를 가져올 수 없습니다:', error.message)
            // 위치 정보가 없으면 기본 정렬로 변경
            this.selectedSort = 'latest'
            alert('위치 정보를 가져올 수 없어 최신순으로 정렬합니다.')
          }
        } else if (this.locationPermission === 'denied') {
          // 위치 권한이 거부된 경우
          this.selectedSort = 'latest'
          alert('위치 권한이 필요합니다. 브라우저 설정에서 위치 권한을 허용해주세요.')
        }
      }
      
      this.fetchMarketPosts()
    },

    getSelectedSortLabel() {
      const sort = this.sortOptions.find(s => s.value === this.selectedSort)
      return sort ? sort.title : '최신순'
    },

    getCategoryLabel(categoryValue) {
      const category = this.categories.find(c => c.value === categoryValue)
      return category ? category.label : '기타'
    },

    formatPrice(price) {
      if (!price) return ''
      return price.toLocaleString() + '원'
    },

    getStatusText(status) {
      // 백엔드 SaleStatus enum 기반으로 수정
      const statusMap = {
        'SALE': '판매중',
        'SOLD': '판매완료',
        'RESERVED': '예약중'
      }
      return statusMap[status] || '판매중'
    },

    getStatusClass(status) {
      const classMap = {
        'SALE': 'status-sale',
        'SOLD': 'status-sold',
        'RESERVED': 'status-reserved'
      }
      return classMap[status] || 'status-default'
    },

    isNewPost(createdAt) {
      if (!createdAt) return false
      const createdDate = new Date(createdAt)
      const now = new Date()
      const diffTime = Math.abs(now - createdDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 // 7일 이내면 NEW 표시
    },

    handleImageError(event) {
      // 이미지 로드 실패 시 기본 이미지로 대체
      const postImage = event.target.parentElement
      if (postImage) {
        // 기존 이미지 숨기기
        event.target.style.display = 'none'
        
        // 기본 이미지 표시
        const defaultImage = postImage.querySelector('.default-image')
        if (defaultImage) {
          defaultImage.style.display = 'flex'
        }
      }
      
    },

    changePage(page) {
      this.currentPage = page
      this.fetchMarketPosts()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    navigateToCreate() {
      this.$router.push('/market/new')
    },

    navigateToMyTrade() {
      this.$router.push('/market/my-trade')
    },

    navigateToWishlist() {
      this.$router.push('/market/wishlist')
    },

    navigateToPost(postId) {
      this.$router.push(`/market/${postId}`)
    },






  },

  mounted() {
    // 초기 데이터 로드 (백엔드에서 liked 필드 포함)
    this.fetchMarketPosts()

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-container')) {
        this.showSortDropdown = false
      }
    })
  },

  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 정리
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
/* 기존 CSS 스타일은 그대로 유지 */
.market-page {
  min-height: 100vh;
  background: var(--v-theme-surface-light);
}

.market-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

/* 페이지 헤더 */
.market-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
}

/* 검색 및 필터 섹션 */
.search-filter-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 32px; /* 간격 증가 */
  flex-wrap: wrap;
}

/* 검색창 */
.search-container {
  position: relative;
  flex: 1;
  max-width: 400px; /* 최대 너비 증가 */
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #E87D7D;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  font-size: 1rem;
  background: #f8f9fa;
  transition: all 0.3s ease;
  box-sizing: border-box;
  color: #2c3e50;
}

.search-input:focus {
  outline: none;
  border-color: #E87D7D;
  background: white;
  box-shadow: 0 0 0 4px rgba(232, 125, 125, 0.1);
}

.search-input::placeholder {
  color: #adb5bd;
}

/* 카테고리 버튼들 */
.category-buttons {
  display: flex;
  gap: 16px; /* 간격 증가 */
  flex-wrap: wrap;
}

.category-btn {
  padding: 12px 18px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.category-btn:hover {
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.15);
}

.category-btn.active {
  background: #E87D7D;
  color: white;
  border-color: #E87D7D;
}

/* 필터 그룹 */
.filter-group {
  display: flex;
  align-items: center;
  margin-left: auto; /* 오른쪽 정렬 */
}

.dropdown-container {
  position: relative;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 130px;
  justify-content: space-between;
}

.dropdown-btn:hover {
  border-color: #E87D7D;
  box-shadow: 0 2px 8px rgba(232, 125, 125, 0.1);
}

.dropdown-icon {
  transition: transform 0.3s ease;
  color: #6c757d;
}

.dropdown-container.active .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  margin-top: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000; /* 판매상태 배지보다 위에 표시 */
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
  color: #2c3e50;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: #E87D7D;
  color: white;
}

/* 거래글 목록 */
.market-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 목록 헤더 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.list-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-count {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

.category-info {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* 거래글 작성 버튼 */
.create-post-btn {
  background: linear-gradient(135deg, #ff8a8a 0%, #ff6b6b 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 138, 138, 0.2);
}

.create-post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 138, 138, 0.3);
}

/* 내 거래내역 버튼 */
.my-trade-btn {
  background: linear-gradient(135deg, #ff8a8a 0%, #ff6b6b 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 138, 138, 0.2);
}

.my-trade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 138, 138, 0.3);
}

/* 찜목록 버튼 */
.wishlist-btn {
  background: linear-gradient(135deg, #ff8a8a 0%, #ff6b6b 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 138, 138, 0.2);
}

.wishlist-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 138, 138, 0.3);
}

/* 거래글 그리드 (3x3) */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.post-card {
  background: white;
  border: 2px solid #f1f3f4;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #E87D7D;
}

/* 이미지 */
.post-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .post-image img {
  transform: scale(1.05);
}

/* 판매상태 배지 */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  color: #2c3e50;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 10;
}

.status-sale {
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border-color: rgba(76, 175, 80, 0.3);
}

.status-sold {
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border-color: rgba(244, 67, 54, 0.3);
}

.status-reserved {
  background: rgba(255, 152, 0, 0.9);
  color: white;
  border-color: rgba(255, 152, 0, 0.3);
}

.status-default {
  background: rgba(158, 158, 158, 0.9);
  color: white;
  border-color: rgba(158, 158, 158, 0.3);
}

/* 내용 */
.post-content {
  padding: 20px;
}

.post-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #E87D7D;
  margin-bottom: 8px;
}

.post-status {
  margin-bottom: 12px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.status-sale {
  background-color: #4CAF50; /* 판매중 */
}

.status-sold {
  background-color: #F44336; /* 판매완료 */
}

/* 찜하기 버튼 (좌하단) */
.like-btn {
  position: absolute;
  bottom: 16px; /* 좌하단으로 이동 */
  left: 16px; /* 좌하단으로 이동 */
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #e9ecef; /* 동그라미 테두리 */
  border-radius: 50%;
  width: 44px; /* 크기 증가 */
  height: 44px; /* 크기 증가 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.like-btn:hover {
  background: white;
  transform: scale(1.1);
  border-color: #E87D7D;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

.like-btn.liked {
  background: #E87D7D;
  color: white;
  border-color: #E87D7D;
}

.like-btn:not(.liked) {
  color: #6c757d;
}

/* 기존 우상단 찜하기 버튼 스타일 제거 */
.like-button-top {
  display: none;
}

/* 기존 하단 찜하기 버튼 스타일 제거 */
.like-button-inline {
  display: none;
}

/* 기존 NEW 배지 스타일 제거 */
.post-badge {
  display: none;
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #E87D7D;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 상태 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #E87D7D;
}

.error-message {
  font-size: 1.125rem;
  margin-bottom: 20px;
  text-align: center;
}

.retry-btn {
  background: linear-gradient(135deg, #E87D7D 0%, #d65a5a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(232, 125, 125, 0.3);
}

/* 빈 상태 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.empty-container p {
  font-size: 1.125rem;
  margin-bottom: 20px;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #E87D7D;
  color: #E87D7D;
}

.page-btn.active {
  background: #E87D7D;
  color: white;
  border-color: #E87D7D;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .market-container {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .search-filter-section {
    padding: 24px;
  }

  .filter-controls {
    flex-direction: column;
    gap: 24px; /* 모바일에서 간격 조정 */
    align-items: stretch;
  }

  .search-container {
    max-width: none;
  }

  .category-buttons {
    justify-content: center;
    gap: 12px; /* 모바일에서 간격 조정 */
  }

  .category-btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .market-content {
    padding: 24px;
  }

  .list-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-buttons {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .create-post-btn {
    width: 100%;
    justify-content: center;
  }

  .my-trade-btn {
    width: 100%;
    justify-content: center;
  }

  .wishlist-btn {
    width: 100%;
    justify-content: center;
  }

  .posts-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .search-filter-section {
    padding: 20px;
  }

  .market-content {
    padding: 20px;
  }

  .category-buttons {
    gap: 8px;
  }

  .category-btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
}

/* 찜하기 버튼 */
.like-btn {
  position: absolute;
  bottom: 12px;
  right: 60px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #e9ecef;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.like-btn:hover {
  background: white;
  transform: scale(1.1);
  border-color: #E87D7D;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

.like-btn.liked {
  background: #E87D7D;
  color: white;
  border-color: #E87D7D;
}

.like-btn:not(.liked) {
  color: #6c757d;
}

/* 거리 정보 */
.distance-info {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(232, 125, 125, 0.2);
  transition: all 0.2s ease;
  z-index: 10;
}

.distance-info:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(232, 125, 125, 0.3);
}

.distance-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #E87D7D;
  white-space: nowrap;
}

/* 기존 찜하기 관련 스타일 제거 */
.post-likes {
  display: none;
}

.like-button-top,
.like-button-inline {
  display: none;
}

/* 기본 이미지 스타일 */
.default-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  color: #6c757d;
  min-height: 200px;
}

.default-image-text {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
}

/* 포스트 이미지 컨테이너 */
.post-image {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
}
</style>
