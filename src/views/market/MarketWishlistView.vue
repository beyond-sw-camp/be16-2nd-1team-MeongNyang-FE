<template>
  <div class="market-page">
    <v-container class="market-container">
      <!-- 페이지 헤더 -->
      <div class="market-header">
        <h1 class="page-title">찜목록</h1>
        <p class="page-subtitle">내가 찜한 거래글을 확인해보세요 💖</p>
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
               placeholder="찜한 거래글을 검색해보세요"
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
                         <div class="dropdown-container" :class="{ active: showSortDropdown }">
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
            <span class="total-count">총 {{ totalElements }}개의 찜한 거래글</span>
            <span class="category-info" v-if="selectedCategory !== 'all'">
              • {{ getCategoryLabel(selectedCategory) }}
            </span>
          </div>
          <div class="header-buttons">
            <button class="back-btn" @click="navigateToMarket">
              <v-icon icon="mdi-arrow-left" size="18" />
              목록으로
            </button>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>찜한 거래글을 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <v-icon icon="mdi-alert-circle" size="48" color="#e74c3c" />
          <h3>오류가 발생했습니다</h3>
          <p>{{ error }}</p>
          <button @click="fetchWishlistPosts" class="retry-btn">다시 시도</button>
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
                 class="post-thumbnail"
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
               @click.stop="toggleLike(post.id, post.isLiked)"
               :class="{ liked: post.isLiked }"
             >
               <v-icon 
                 :icon="post.isLiked ? 'mdi-heart' : 'mdi-heart-outline'" 
                 size="20"
               />
             </button>
             
                         <!-- 거리 정보 표시 -->
            <div v-if="selectedSort === 'distance' && post.distance !== null && post.distance !== undefined" class="distance-info">
              <span class="distance-text">{{ formatDistance(post.distance) }}</span>  
            </div>
           </div>
         </div>

        <!-- 빈 상태 -->
        <div v-else class="empty-container">
          <v-icon icon="mdi-heart-outline" size="64" color="#bdc3c7" />
          <h3>찜한 거래글이 없습니다</h3>
          <p>마음에 드는 거래글을 찜해보세요!</p>
          <button class="explore-btn" @click="navigateToMarket">
            거래글 둘러보기
          </button>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination-container">
          <div class="pagination">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <v-icon icon="mdi-chevron-left" />
            </button>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-btn', { active: page === currentPage }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            
            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <v-icon icon="mdi-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script>
import { marketAPI } from '@/services/api'

export default {
  name: 'MarketWishlistView',
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
         async fetchWishlistPosts() {
       this.loading = true
       this.error = null
       
       try {
         const pageable = {
           page: this.currentPage - 1,
           size: this.itemsPerPage,
           sort: 'id,desc'
         }

         // 카테고리 필터링 파라미터 추가
         if (this.selectedCategory && this.selectedCategory !== 'all') {
           pageable.category = this.selectedCategory
           console.log('카테고리 필터링 적용:', this.selectedCategory)
         }

         // 검색어 파라미터 추가
         if (this.searchQuery && this.searchQuery.trim()) {
           pageable.search = this.searchQuery.trim()
           console.log('검색어 필터링 적용:', this.searchQuery.trim())
         }

         // 정렬 옵션에 따른 정렬 설정
         if (this.selectedSort === 'latest') {
           pageable.sort = 'id,desc'
         } else if (this.selectedSort === 'price-low') {
           // 가격 낮은순은 클라이언트 사이드에서 처리하므로 기본 정렬로 요청
           pageable.sort = 'id,desc'
         } else if (this.selectedSort === 'price-high') {
           // 가격 높은순은 클라이언트 사이드에서 처리하므로 기본 정렬로 요청
           pageable.sort = 'id,desc'
         } else if (this.selectedSort === 'popular') {
           // 백엔드에서 likeCount 정렬이 안되므로 기본 정렬로 요청
           pageable.sort = 'id,desc'
         } else if (this.selectedSort === 'distance') {
           // 거리순은 클라이언트 사이드에서 처리하므로 기본 정렬로 요청
           pageable.sort = 'id,desc'
         }
         
         console.log('선택된 정렬:', this.selectedSort, '→ pageable.sort:', pageable.sort)

         console.log('Fetching wishlist posts with pageable:', pageable)
         const response = await marketAPI.getLikes(pageable)
         console.log('API Response:', response)
         console.log('Response data:', response.data)
         console.log('Response status:', response.status)
         
         // 백엔드 응답 구조 확인
         let fetchedPosts = []
         let totalElements = 0
         let totalPages = 0
         
         if (response.data) {
           // 응답이 isSuccess로 래핑된 경우
           if (response.data.isSuccess && response.data.data) {
             fetchedPosts = response.data.data.content || []
             totalElements = response.data.data.totalElements || 0
             totalPages = response.data.data.totalPages || 0
           }
           // 응답이 직접 Page 객체인 경우
           else if (response.data.content !== undefined) {
             fetchedPosts = response.data.content || []
             totalElements = response.data.totalElements || 0
             totalPages = response.data.totalPages || 0
           }
           // 응답이 다른 구조인 경우
           else {
             console.log('Unknown response structure:', response.data)
             // 빈 배열로 처리하여 오류 방지
             fetchedPosts = Array.isArray(response.data) ? response.data : []
           }
         }
         
                           console.log('Parsed data:', { fetchedPosts, totalElements, totalPages })
          
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
         
         // 가격 낮은순 정렬은 클라이언트 사이드에서 처리
         if (this.selectedSort === 'price-low') {
           console.log('가격 낮은순 정렬 적용 (클라이언트 사이드)')
           fetchedPosts.sort((a, b) => (a.price || 0) - (b.price || 0))
           console.log('Sorted by price (low to high):', fetchedPosts.map(p => ({ id: p.id, price: p.price })))
         }
         
         // 가격 높은순 정렬은 클라이언트 사이드에서 처리
         if (this.selectedSort === 'price-high') {
           console.log('가격 높은순 정렬 적용 (클라이언트 사이드)')
           fetchedPosts.sort((a, b) => (b.price || 0) - (a.price || 0))
           console.log('Sorted by price (high to low):', fetchedPosts.map(p => ({ id: p.id, price: p.price })))
         }
         
         // 인기순 정렬은 클라이언트 사이드에서 처리
         if (this.selectedSort === 'popular') {
           console.log('인기순 정렬 적용 (클라이언트 사이드)')
           fetchedPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
           console.log('Sorted by likeCount:', fetchedPosts.map(p => ({ id: p.id, likeCount: p.likeCount })))
         }
         
         // 거리순 정렬 처리
         if (this.selectedSort === 'distance') {
           console.log('거리순 정렬 적용 (클라이언트 사이드)')
           if (this.userLocation) {
             console.log('사용자 위치:', this.userLocation)
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
             
                         // 거리순으로 정렬 (가까운 순)
            fetchedPosts.sort((a, b) => {
              if ((a.distance === null || a.distance === undefined) && 
                  (b.distance === null || b.distance === undefined)) return 0
              if (a.distance === null || a.distance === undefined) return 1
              if (b.distance === null || b.distance === undefined) return -1
              return a.distance - b.distance
            })
             
             console.log('Sorted by distance:', fetchedPosts.map(p => ({ id: p.id, distance: p.distance })))
           } else {
             console.log('사용자 위치 정보 없음, 기본 정렬로 변경')
             // 위치 정보가 없으면 기본 정렬로 변경
             this.selectedSort = 'latest'
             alert('거리순 정렬을 위해 위치 정보가 필요합니다.')
           }
         }
          
         // 찜목록에 있는 모든 게시글은 찜한 상태로 설정
         fetchedPosts.forEach(post => {
           post.isLiked = true
           console.log(`게시글 ${post.id} 찜 상태 설정:`, post.isLiked)
         })
         
         this.posts = fetchedPosts
         this.totalElements = totalElements
         this.totalPages = totalPages
         
         console.log('Wishlist posts loaded:', {
           posts: this.posts.length,
           totalElements: this.totalElements,
           totalPages: this.totalPages
         })
       } catch (error) {
         console.error('Error fetching wishlist posts:', error)
         this.error = error.response?.data?.message || error.message || '찜목록을 불러오는데 실패했습니다.'
         alert('찜목록을 불러오는데 실패했습니다: ' + this.error)
       } finally {
         this.loading = false
       }
     },

    handleCategorySelect(category) {
      this.selectedCategory = category
      this.currentPage = 1
      this.fetchWishlistPosts()
    },

    handleSearch() {
      // 검색어 입력 시 디바운싱 적용
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchWishlistPosts()
      }, 500)
    },

    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown
      console.log('드롭다운 토글:', this.showSortDropdown)
    },

    async selectSort(sort) {
      console.log('정렬 선택:', sort)
      this.selectedSort = sort
      this.showSortDropdown = false
      this.currentPage = 1
      
      // 거리순 정렬 선택 시 위치 정보 확인
      if (sort === 'distance') {
        if (!this.userLocation && this.locationPermission === 'prompt') {
          await this.getUserLocation()
        }
      }
      
      console.log('정렬 적용 후 데이터 다시 로드')
      this.fetchWishlistPosts()
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

    getStatusClass(status) {
      const statusMap = {
        'SALE': 'status-sale',
        'RESERVED': 'status-reserved',
        'SOLD': 'status-sold'
      }
      return statusMap[status] || 'status-sale'
    },

    getStatusText(status) {
      const statusMap = {
        'SALE': '판매중',
        'RESERVED': '예약중',
        'SOLD': '판매완료'
      }
      return statusMap[status] || '판매중'
    },

    // 거리 계산 함수들
    toRadians(degrees) {
      return degrees * (Math.PI / 180)
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
      // 유효하지 않은 좌표값 체크
      if (!lat1 || !lon1 || !lat2 || !lon2 || 
          isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        return null
      }
      
      const R = 6371 // 지구 반지름 (km)
      const dLat = this.toRadians(lat2 - lat1)
      const dLon = this.toRadians(lon2 - lon1)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      return distance
    },

    // 거리 포맷팅 (km/m 표시)
    formatDistance(distance) {
      if (!distance || isNaN(distance)) {
        return '0m'
      }
      if (distance < 1) {
        return `${Math.round(distance * 1000)}m`
      } else {
        return `${distance.toFixed(2)}km`
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

    // 찜하기 토글
        async toggleLike(postId, isLiked) {
      try {
        if (isLiked) {
          // 찜하기 취소 - 찜목록에서 완전히 제거
          await marketAPI.unlikeMarket(postId)
          
          // 찜목록 페이지에서는 찜을 취소한 게시글을 목록에서 제거
          this.posts = this.posts.filter(post => post.id !== postId)
          this.totalElements = Math.max(0, this.totalElements - 1)
          
          // 페이지네이션 업데이트
          this.totalPages = Math.ceil(this.totalElements / this.itemsPerPage)
          
          // 현재 페이지가 마지막 페이지를 초과하면 이전 페이지로 이동
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages
            // 새로운 페이지 데이터 로드
            this.fetchWishlistPosts()
          }
          
          alert('찜목록에서 제거되었습니다.')
        } else {
          // 찜하기 (찜목록 페이지에서는 일반적으로 발생하지 않음)
          await marketAPI.likeMarket(postId)
          alert('찜목록에 추가되었습니다.')
        }
      } catch (error) {
        console.error('Error toggling like:', error)
        alert('찜하기 처리 중 오류가 발생했습니다.')
      }
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchWishlistPosts()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    navigateToMarket() {
      this.$router.push('/market')
    },

         navigateToPost(postId) {
       this.$router.push(`/market/${postId}`)
     },

     // 이미지 로드 오류 처리
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
  },

  mounted() {
    // 초기 데이터 로드 (백엔드에서 liked 필드 포함)
    this.fetchWishlistPosts()
    
    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-container')) {
        this.showSortDropdown = false
      }
    })
  },

  beforeUnmount() {
    // 이벤트 리스너 정리
    document.removeEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-container')) {
        this.showSortDropdown = false
      }
    })
  }
}
</script>

<style scoped>
/* 전체 페이지 스타일 */
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

/* 정렬 드롭다운 */
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

/* 목록으로 버튼 */
.back-btn {
  background: linear-gradient(135deg, #E87D7D 0%, #d65a5a 100%);
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
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #E87D7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
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
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
}

.error-container h3 {
  margin: 16px 0 8px 0;
  color: #e74c3c;
}

.error-container p {
  margin-bottom: 24px;
  color: #95a5a6;
}

.retry-btn {
  background: #E87D7D;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #d65a5a;
  transform: translateY(-2px);
}

/* 빈 상태 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-container h3 {
  margin: 24px 0 12px 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.empty-container p {
  margin-bottom: 32px;
  color: #95a5a6;
  font-size: 1.1rem;
}

.explore-btn {
  background: linear-gradient(135deg, #E87D7D 0%, #d65a5a 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(232, 125, 125, 0.3);
}

/* 거래글 그리드 (3x3) */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

/* 거래글 카드 */
.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 이미지 */
.post-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 12px;
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

/* 판매상태 배지 */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  color: #2c3e50;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 10;
}

.status-sale {
  background-color: #4CAF50; /* 판매중 */
  color: white;
}

.status-reserved {
  background-color: #FF9800; /* 예약중 */
  color: white;
}

.status-sold {
  background-color: #F44336; /* 판매완료 */
  color: white;
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

/* 모바일에서 찜버튼 위치 조정 */
@media (max-width: 768px) {
  .like-btn {
    bottom: 12px;
    right: 60px;
    width: 40px;
    height: 40px;
  }
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

/* 거래글 내용 */
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

/* 페이지네이션 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-2px);
}

.page-btn.active {
  background: #E87D7D;
  border-color: #E87D7D;
  color: white;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

  .back-btn {
    width: 100%;
    justify-content: center;
  }

  .posts-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 6px;
  }

  .page-btn {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
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

  .post-content {
    padding: 20px;
  }

  .post-title {
    font-size: 1rem;
  }

  .post-price {
    font-size: 1.25rem;
  }
}
</style>
