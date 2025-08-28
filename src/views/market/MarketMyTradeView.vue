<template>
  <div class="market-page">
    <v-container class="market-container">
      <!-- 페이지 헤더 -->
      <div class="market-header">
        <h1 class="page-title">거래내역</h1>
        <p class="page-subtitle">내가 구매하고 판매한 거래글을 확인해보세요 📋</p>
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
              placeholder="거래내역을 검색해보세요"
              class="search-input"
              @input="handleSearch"
            />
          </div>

          <!-- 거래내역 타입 버튼들 -->
          <div class="category-buttons">
            <button
              v-for="tradeType in tradeTypes"
              :key="tradeType.value"
              :class="['category-btn', { active: selectedTradeType === tradeType.value }]"
              @click="handleTradeTypeSelect(tradeType.value)"
            >
              {{ tradeType.label }}
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

      <!-- 거래내역 목록 -->
      <div class="market-content">
        <!-- 목록 정보 및 목록으로 버튼 -->
        <div class="list-header">
          <div class="list-info">
            <span class="total-count">총 {{ totalElements }}개의 거래내역</span>
            <span class="category-info" v-if="selectedTradeType !== 'all'">
              • {{ getTradeTypeLabel(selectedTradeType) }}
            </span>
          </div>
          <div class="header-buttons">
            <button class="list-btn" @click="navigateToMarket">
              <v-icon icon="mdi-arrow-left" size="18" />
              목록으로
            </button>
          </div>
        </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>거래내역을 불러오는 중...</p>
      </div>

      <!-- 거래내역 목록 -->
      <div v-else-if="posts.length > 0" class="posts-grid">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="navigateToPost(post.id)"
        >
          <div class="post-image">
            <img
              v-if="post.thumbnailUrl"
              :src="post.thumbnailUrl"
              :alt="post.title"
              class="post-thumbnail"
              @error="handleImageError"
            />
            <div v-else class="default-image">
              <v-icon icon="mdi-image-off" size="48" color="#E87D7D" />
              <span class="default-image-text">이미지 없음</span>
            </div>
          </div>

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
        <v-icon icon="mdi-format-list-bulleted" size="64" color="#bdc3c7" />
        <h3>거래내역이 없습니다</h3>
        <p>아직 거래한 내역이 없어요!</p>
        <button class="explore-btn" @click="navigateToMarket">
          <v-icon icon="mdi-store" size="18" />
          거래글 둘러보기
        </button>
      </div>

              <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <v-icon icon="mdi-chevron-left" size="18" />
            이전
          </button>

          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-number', { active: page === currentPage }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            다음
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
  name: 'MarketMyTradeView',
  data() {
    return {
      
      posts: [],
      loading: false,
      currentPage: 1,
      totalPages: 0,
      totalElements: 0,
      itemsPerPage: 20,
      searchQuery: '',
      searchTimeout: null,
      selectedTradeType: 'all',
      selectedSort: 'latest',
      showSortDropdown: false,
      userLocation: null,
      
      // 거래내역 타입 옵션
      tradeTypes: [
        { label: '전체', value: 'all' },
        { label: '구매내역', value: 'purchase' },
        { label: '판매내역', value: 'sale' }
      ],

      // 정렬 옵션
      sortOptions: [
        { title: '최신순', value: 'latest' },
        { title: '가격 낮은순', value: 'price-low' },
        { title: '가격 높은순', value: 'price-high' },
        { title: '인기순', value: 'popular' },
        { title: '📍 거리순', value: 'distance' }
      ]
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

  async mounted() {
    // 인증 상태 확인
    const accessToken = localStorage.getItem('accessToken')
    console.log('=== 페이지 로드 시 인증 상태 확인 ===')
    console.log('accessToken 존재:', !!accessToken)
    console.log('accessToken 길이:', accessToken ? accessToken.length : 0)
    
    if (!accessToken) {
      console.warn('로그인이 필요합니다.')
      alert('로그인이 필요합니다.')
      this.$router.push('/login')
      return
    }
    
    await this.fetchMyTradePosts()
    
    if (this.selectedSort === 'distance') {
      await this.getUserLocation()
    }
  },

  methods: {
    // 내 거래내역 조회
    async fetchMyTradePosts() {
      this.loading = true
      try {
        // API 호출 전 인증 상태 재확인
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          throw new Error('로그인이 필요합니다.')
        }
        
        const pageable = {
          page: this.currentPage - 1,
          size: this.itemsPerPage,
          sort: this.getSortParam(),
          search: this.searchQuery || undefined
        }

        console.log('내 거래내역 조회 요청:', pageable)

        let response
        if (this.selectedTradeType === 'purchase') {
          response = await marketAPI.getPurchases(pageable)
        } else if (this.selectedTradeType === 'sale') {
          response = await marketAPI.getSales(pageable)
        } else {
          // 전체인 경우 구매목록과 판매목록을 모두 가져와서 합치기
          const [purchaseResponse, salesResponse] = await Promise.all([
            marketAPI.getPurchases(pageable),
            marketAPI.getSales(pageable)
          ])
          
          // 두 응답을 합치기
          const purchaseData = purchaseResponse.data.isSuccess ? purchaseResponse.data.data : purchaseResponse.data
          const salesData = salesResponse.data.isSuccess ? salesResponse.data.data : salesResponse.data
          
          const combinedContent = [
            ...(purchaseData.content || []),
            ...(salesData.content || [])
          ]
          
          // 합친 데이터로 응답 객체 생성
          response = {
            data: {
              isSuccess: true,
              data: {
                content: combinedContent,
                totalElements: (purchaseData.totalElements || 0) + (salesData.totalElements || 0),
                totalPages: Math.max(purchaseData.totalPages || 0, salesData.totalPages || 0)
              }
            }
          }
        }
        
        console.log('내 거래내역 응답:', response.data)
        
        // 응답 데이터 구조 상세 로깅
        if (response.data && response.data.isSuccess && response.data.data) {
          console.log('거래내역 데이터 상세:', response.data.data)
          if (response.data.data.content && response.data.data.content.length > 0) {
            console.log('첫 번째 게시글 데이터:', response.data.data.content[0])
            console.log('첫 번째 게시글 isLiked 값:', response.data.data.content[0].isLiked)
          }
        }

        // 백엔드 응답 구조 확인
        let fetchedPosts = []
        let totalElements = 0
        let totalPages = 0

        if (response.data) {
          if (response.data.isSuccess && response.data.data) {
            fetchedPosts = response.data.data.content || []
            totalElements = response.data.data.totalElements || 0
            totalPages = response.data.data.totalPages || 0
          } else if (response.data.content !== undefined) {
            fetchedPosts = response.data.content || []
            totalElements = response.data.totalElements || 0
            totalPages = response.data.totalPages || 0
          } else {
            fetchedPosts = Array.isArray(response.data) ? response.data : []
          }
        }

        // 전체 거래내역인 경우 클라이언트 사이드에서 정렬
        if (this.selectedTradeType === 'all') {
          // 거리순 정렬인 경우 거리 계산
          if (this.selectedSort === 'distance' && this.userLocation) {
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
          } else if (this.selectedSort === 'distance') {
            console.log('사용자 위치 정보 없음, 기본 정렬로 변경')
            // 위치 정보가 없으면 기본 정렬로 변경
            this.selectedSort = 'latest'
          }

          // 클라이언트 사이드 정렬
          if (this.selectedSort === 'price-low') {
            console.log('가격 낮은순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (a.price || 0) - (b.price || 0))
            console.log('Sorted by price (low to high):', fetchedPosts.map(p => ({ id: p.id, price: p.price })))
          } else if (this.selectedSort === 'price-high') {
            console.log('가격 높은순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (b.price || 0) - (a.price || 0))
            console.log('Sorted by price (high to low):', fetchedPosts.map(p => ({ id: p.id, price: p.price })))
          } else if (this.selectedSort === 'popular') {
            console.log('인기순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
            console.log('Sorted by popularity:', fetchedPosts.map(p => ({ id: p.id, likeCount: p.likeCount })))
          } else if (this.selectedSort === 'latest') {
            console.log('최신순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (b.id || 0) - (a.id || 0))
            console.log('Sorted by latest:', fetchedPosts.map(p => ({ id: p.id })))
          }
        } else {
          // 개별 거래내역(구매/판매)인 경우 클라이언트 사이드 정렬 처리
          if (this.selectedSort === 'price-low') {
            console.log('가격 낮은순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (a.price || 0) - (b.price || 0))
          } else if (this.selectedSort === 'price-high') {
            console.log('가격 높은순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (b.price || 0) - (a.price || 0))
          } else if (this.selectedSort === 'popular') {
            console.log('인기순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
          } else if (this.selectedSort === 'latest') {
            console.log('최신순 정렬 적용 (클라이언트 사이드)')
            fetchedPosts.sort((a, b) => (b.id || 0) - (a.id || 0))
          }
          
          // 거리순 정렬은 distance가 선택되었을 때만 실행
          if (this.selectedSort === 'distance' && this.userLocation) {
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
          } else if (this.selectedSort === 'distance') {
            console.log('사용자 위치 정보 없음, 기본 정렬로 변경')
            // 위치 정보가 없으면 기본 정렬로 변경
            this.selectedSort = 'latest'
          }
        }

        // 백엔드 응답의 isLiked 값을 확인하고, 없는 경우 기본값 설정
        console.log('=== 백엔드 isLiked 상태 확인 및 설정 ===')
        fetchedPosts.forEach(post => {
          console.log(`게시글 ${post.id} - 백엔드 응답 isLiked: ${post.isLiked}`)
          
          // 백엔드에서 isLiked 값이 명확하지 않은 경우 기본값 설정
          if (post.isLiked === undefined || post.isLiked === null) {
            // 백엔드에서 liked 필드로 전달되는 경우도 확인
            if (post.liked !== undefined) {
              post.isLiked = post.liked
              console.log(`게시글 ${post.id} - liked 필드를 isLiked로 매핑: ${post.liked}`)
            } else {
              // 기본적으로 false로 설정 (사용자가 찜하지 않은 상태)
              post.isLiked = false
              console.log(`게시글 ${post.id} - isLiked 기본값 설정: false`)
            }
          }
        })
        console.log('=== 백엔드 isLiked 상태 확인 및 설정 완료 ===')

        // 찜 상태 설정 후 posts에 할당
        this.posts = fetchedPosts
        this.totalElements = totalElements
        this.totalPages = totalPages
        
        // posts 할당 후 찜 상태 확인
        console.log('=== posts 할당 후 찜 상태 확인 ===')
        this.posts.forEach(post => {
          console.log(`게시글 ${post.id} - 최종 isLiked 상태: ${post.isLiked}`)
        })
        console.log('=== 찜 상태 확인 완료 ===')

        console.log(`내 거래내역 로드 완료: ${fetchedPosts.length}개`)
      } catch (error) {
        console.error('내 거래내역 조회 실패:', error)
        alert('내 거래내역을 불러오는데 실패했습니다.')
        this.posts = []
        this.totalElements = 0
        this.totalPages = 0
      } finally {
        this.loading = false
      }
    },

    // 정렬 파라미터 생성
    getSortParam() {
      if (this.selectedSort === 'latest') {
        return 'id,desc'
      } else if (this.selectedSort === 'price-low') {
        return 'id,desc' // Client-side sort
      } else if (this.selectedSort === 'price-high') {
        return 'id,desc' // Client-side sort
      } else if (this.selectedSort === 'popular') {
        return 'id,desc' // Client-side sort
      } else if (this.selectedSort === 'distance') {
        return 'id,desc' // Client-side sort
      }
      return 'id,desc'
    },

    // 거래내역 타입 선택
    handleTradeTypeSelect(tradeType) {
      this.selectedTradeType = tradeType
      this.currentPage = 1
      this.fetchMyTradePosts()
    },

    // 검색 처리
    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchMyTradePosts()
      }, 500)
    },

    // 정렬 드롭다운 토글
    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown
    },

    // 정렬 선택
    async selectSort(sortValue) {
      this.selectedSort = sortValue
      this.showSortDropdown = false
      this.currentPage = 1

      if (sortValue === 'distance') {
        await this.getUserLocation()
      }
      
      this.fetchMyTradePosts()
    },

    // 선택된 정렬 라벨 가져오기
    getSelectedSortLabel() {
      const sort = this.sortOptions.find(s => s.value === this.selectedSort)
      return sort ? sort.title : '최신순'
    },

    // 거래내역 타입 라벨 가져오기
    getTradeTypeLabel(tradeTypeValue) {
      const tradeType = this.tradeTypes.find(t => t.value === tradeTypeValue)
      return tradeType ? tradeType.label : '전체'
    },

    // 페이지 이동
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.fetchMyTradePosts()
      }
    },

    // 찜하기 토글
    async toggleLike(postId, isLiked) {
      try {
        console.log(`=== 찜하기 토글 시작 - 게시글 ${postId}, 현재 상태: ${isLiked} ===`)
        
        // 인증 토큰 확인
        const accessToken = localStorage.getItem('accessToken')
        console.log('현재 accessToken:', accessToken ? '존재함' : '없음')
        
        // 찜 상태에 따른 처리
        if (isLiked) {
          // 이미 찜한 상태: 찜 취소
          console.log(`게시글 ${postId} 찜 취소 시도...`)
          await marketAPI.unlikeMarket(postId)
          console.log(`게시글 ${postId} 찜 취소 완료`)
          alert('찜목록에서 제거되었습니다.')
          
          // UI 업데이트
          const post = this.posts.find(p => p.id === postId)
          if (post) {
            post.isLiked = false
            console.log(`거래내역 게시글 ${postId} 찜 상태 업데이트: ${post.
            isLiked}`)
          }
        } else {
          // 찜하지 않은 상태: 찜하기
          
          
          // 찜하기 시도
          console.log(`게시글 ${postId} 찜하기 시도...`)
          await marketAPI.likeMarket(postId)
          console.log(`게시글 ${postId} 찜하기 완료`)
          alert('찜목록에 추가되었습니다.')
          
          // UI 업데이트
          const post = this.posts.find(p => p.id === postId)
          if (post) {
            post.isLiked = true
            console.log(`거래내역 게시글 ${postId} 찜 상태 업데이트: ${post.isLiked}`)
          }
        }
        
        console.log(`=== 찜하기 토글 완료 - 게시글 ${postId} ===`)
      } catch (error) {
        console.error('찜하기 처리 실패:', error)
        console.error('에러 상세 정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
        
        if (error.response?.status === 403) {
          // 403 에러의 구체적인 원인 확인
          const errorMessage = error.response?.data?.message || ''
          if (errorMessage.includes('이미 찜한 거래글입니다')) {
            // 이미 찜한 상태이므로 UI를 찜한 상태로 업데이트
            const post = this.posts.find(p => p.id === postId)
            if (post) {
              post.isLiked = true
              console.log(`게시글 ${postId} - 이미 찜한 상태로 UI 업데이트`)
            }
            alert('이미 찜한 거래글입니다.')
          } else {
            alert('권한이 없습니다. 로그인 상태를 확인해주세요.')
          }
        } else if (error.response?.status === 401) {
          alert('로그인이 필요합니다.')
        } else {
          alert('찜하기 처리에 실패했습니다.')
        }
      }
    },





    // 거래글 상세보기
    navigateToPost(postId) {
      this.$router.push(`/market/${postId}`)
    },

    // 거래글 목록으로 이동
    navigateToMarket() {
      this.$router.push('/market')
    },

    // 이미지 에러 처리
    handleImageError(event) {
      const postImage = event.target.parentElement
      if (postImage) {
        event.target.style.display = 'none'
        const defaultImage = postImage.querySelector('.default-image')
        if (defaultImage) {
          defaultImage.style.display = 'flex'
        }
      }
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
        return
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            console.log('사용자 위치:', this.userLocation)
            resolve(this.userLocation)
          },
          (error) => {
            console.error('위치 정보를 가져올 수 없습니다:', error)
            alert('위치 정보를 가져올 수 없어 거리순 정렬을 사용할 수 없습니다.')
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        )
      })
    },

    // 가격 포맷팅
    formatPrice(price) {
      if (!price) return ''
      return price.toLocaleString() + '원'
    },

    // 판매상태 클래스
    getStatusClass(status) {
      const statusMap = {
        'SALE': 'status-sale',
        'RESERVED': 'status-reserved',
        'SOLD': 'status-sold'
      }
      return statusMap[status] || 'status-sale'
    },

    // 판매상태 텍스트
    getStatusText(status) {
      const statusMap = {
        'SALE': '판매중',
        'RESERVED': '예약중',
        'SOLD': '판매완료'
      }
      return statusMap[status] || '판매중'
    }
  }
}
</script>

<style scoped>
/* 거래글 목록 */
.market-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 기본 스타일 */
.market-page {
  background: var(--v-theme-surface-light);
  min-height: 100vh;
  padding: 20px 0;
}

.market-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* 검색 및 필터 섹션 */
.search-filter-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* 검색창 */
.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
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
  gap: 16px;
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
  margin-left: auto;
}

/* 드롭다운 */
.dropdown-container {
  position: relative;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
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
  color: #6c757d;
  transition: transform 0.3s ease;
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  margin-top: 8px;
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

/* 목록 헤더 */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.list-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 목록으로 버튼 */
.list-btn {
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
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

.list-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(232, 125, 125, 0.3);
}

.total-count {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.category-info {
  font-size: 0.9rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 20px;
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
  border: 2px solid #f1f3f4;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
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
  border-radius: 12px;
}

.post-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .post-thumbnail {
  transform: scale(1.05);
}

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

/* 거래글 내용 */
.post-content {
  padding: 16px;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
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

.status-reserved {
  background: rgba(255, 152, 0, 0.9);
  color: white;
  border-color: rgba(255, 152, 0, 0.3);
}

.status-sold {
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border-color: rgba(244, 67, 54, 0.3);
}

.status-default {
  background: rgba(158, 158, 158, 0.9);
  color: white;
  border-color: rgba(158, 158, 158, 0.3);
}

/* 찜하기 버튼 (좌하단) */
.like-btn {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #e9ecef;
  border-radius: 50%;
  width: 44px;
  height: 44px;
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
  border: 1px solid rgba(108, 92, 231, 0.2);
  transition: all 0.2s ease;
  z-index: 10;
}

.distance-info:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(108, 92, 231, 0.3);
}

.distance-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #E87D7D;
  white-space: nowrap;
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
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 16px 0 8px 0;
}

.empty-container p {
  font-size: 1rem;
  margin-bottom: 24px;
}

.explore-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #E87D7D 0%, #d65a5a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(232, 125, 125, 0.3);
}

/* 페이지네이션 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-1px);
}

.page-number.active {
  background: #E87D7D;
  color: white;
  border-color: #E87D7D;
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

  .page-subtitle {
    font-size: 1rem;
  }

  .search-filter-section {
    padding: 20px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-container {
    min-width: auto;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-buttons {
    justify-content: center;
  }

  .category-buttons {
    gap: 12px;
  }

  .filter-group {
    margin-left: 0;
  }

  .posts-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .category-buttons {
    gap: 8px;
  }

  .post-price {
    font-size: 1.25rem;
  }
}
</style>
