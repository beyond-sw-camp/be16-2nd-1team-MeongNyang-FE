<template>
  <div class="home-view">
    <!-- 로그인하지 않은 경우: 기존 홈페이지 -->
    <template v-if="!isLoggedIn">
      <!-- 히어로 섹션 -->
      <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-line">멍멍냥냥에</span>
            <span class="title-line">오신 것을 환영합니다!</span>
          </h1>
          <p class="hero-subtitle">
            반려동물과 함께하는 즐거운 커뮤니티입니다.
            <br>다이어리, 마켓플레이스, 채팅 등 다양한 기능을 이용해보세요!
          </p>
          
          <div class="hero-actions">
            <v-btn
              v-if="!isLoggedIn"
              size="x-large"
              variant="elevated"
              class="hero-btn login-btn"
              @click="openAuthModal('login')"
            >
              <v-icon class="me-3">mdi-login</v-icon>
              로그인
            </v-btn>
            <v-btn
              v-if="!isLoggedIn"
              size="x-large"
              variant="outlined"
              class="hero-btn register-btn"
              @click="openAuthModal('register')"
            >
              <v-icon class="me-3">mdi-account-plus</v-icon>
              회원가입
            </v-btn>
            <v-btn
              v-if="isLoggedIn"
              size="x-large"
              variant="elevated"
              class="hero-btn dashboard-btn"
              @click="$router.push('/dashboard')"
            >
              <v-icon class="me-3">mdi-view-dashboard</v-icon>
              대시보드로 이동
            </v-btn>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="pet-illustrations">
            <div class="pet pet-dog">
              <span class="emoji">🐕</span>
            </div>
            <div class="pet pet-cat">
              <span class="emoji">🐱</span>
            </div>
            <div class="pet pet-bird">
              <span class="emoji">🦜</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 기능 소개 섹션 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">주요 기능</h2>
        <div class="features-grid">
          <div class="feature-card palette-pet">
            <div class="feature-icon">
              <v-icon size="48">mdi-paw</v-icon>
            </div>
            <h3 class="feature-title">반려동물 관리</h3>
            <p class="feature-description">
              반려동물의 정보를 체계적으로 관리하고 건강 상태를 추적해보세요.
            </p>
          </div>
          
          <div class="feature-card palette-diary">
            <div class="feature-icon">
              <v-icon size="48">mdi-book-open</v-icon>
            </div>
            <h3 class="feature-title">다이어리</h3>
            <p class="feature-description">
              반려동물과의 특별한 순간들을 기록하고 추억을 남겨보세요.
            </p>
          </div>
          
          <div class="feature-card palette-market">
            <div class="feature-icon">
              <v-icon size="48">mdi-store</v-icon>
            </div>
            <h3 class="feature-title">마켓플레이스</h3>
            <p class="feature-description">
              반려동물 용품을 거래하고 필요한 물건을 찾아보세요.
            </p>
          </div>
          
          <div class="feature-card palette-community">
            <div class="feature-icon">
              <v-icon size="48">mdi-chat</v-icon>
            </div>
            <h3 class="feature-title">커뮤니티</h3>
            <p class="feature-description">
              다른 반려동물 가족들과 소통하고 정보를 공유해보세요.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 통계 섹션 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">1000+</div>
            <div class="stat-label">활성 사용자</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5000+</div>
            <div class="stat-label">등록된 반려동물</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">10000+</div>
            <div class="stat-label">공유된 다이어리</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">거래된 상품</div>
          </div>
        </div>
      </div>
    </section>

    </template>

    <!-- 로그인한 경우: 검색 컴포넌트와 전체 일기 목록 -->
    <template v-else>
      <div class="home-content-wrapper">
        <!-- 메인 콘텐츠 -->
        <div class="home-main-content">
          <!-- 검색 섹션 -->
          <div class="home-search-section">
            <div class="search-wrapper">
              <div class="search-and-write-container">
                <SearchComponent
                  v-model="searchKeyword"
                  :search-type="searchType"
                  @update:search-type="searchType = $event"
                  @search="handleSearch"
                  @clear="handleClearSearch"
                />
              </div>
            </div>
          </div>
          
          <AllPostsView />
        </div>

        <!-- 오른쪽 사이드바 -->
        <div class="home-sidebar">
          <!-- 인기 해시태그 섹션 -->
          <v-card class="sidebar-card">
            <div class="insight-header">
              <div class="insight-title">인기 해시태그</div>
            </div>
            <div class="hashtag-list">
              <div 
                class="hashtag-item" 
                v-for="tag in popularHashtags" 
                :key="tag.tagId"
                @click="handleHashtagClick(tag)"
                style="cursor: pointer;"
              >
                <span class="hashtag-text">#{{ tag.name }}</span>
                <span class="hashtag-count">{{ tag.count }}회</span>
              </div>
            </div>
          </v-card>

          <!-- 오늘의 날씨 섹션 -->
          <v-card class="sidebar-card">
            <div class="insight-header">
              <v-icon color="#60A5FA" size="24">mdi-weather-sunny</v-icon>
              <div class="insight-title">오늘의 날씨</div>
            </div>
            <div v-if="weatherLoading" class="weather-loading">
              <v-progress-circular indeterminate color="#60A5FA" size="24"></v-progress-circular>
              <span>날씨 정보를 가져오는 중...</span>
            </div>
            <div v-else-if="weatherError" class="weather-error">
              <v-icon color="#EF4444" size="24">mdi-alert-circle</v-icon>
              <span>위치 권한이 필요합니다</span>
              <v-btn
                size="small"
                variant="outlined"
                color="#60A5FA"
                @click="fetchWeather"
                class="mt-2"
              >
                위치 권한 다시 요청
              </v-btn>
            </div>
            <div v-else class="weather-detail">
              <div class="weather-location">
                <v-icon size="16" color="#64748B">mdi-map-marker</v-icon>
                <span class="location-text">{{ weatherData.location }}</span>
              </div>
              <div class="weather-main-info">
                <div class="weather-temp-large">{{ Math.round(weatherData.temp) }}°C</div>
                <div class="weather-desc">{{ weatherData.description }}</div>
              </div>
              <div class="weather-details">
                <div class="weather-detail-item">
                  <span class="detail-label">습도</span>
                  <span class="detail-value">{{ weatherData.humidity }}%</span>
                </div>
                <div class="weather-detail-item">
                  <span class="detail-label">바람</span>
                  <span class="detail-value">{{ weatherData.windSpeed }}m/s</span>
                </div>
                <div class="weather-detail-item">
                  <span class="detail-label">체감온도</span>
                  <span class="detail-value">{{ Math.round(weatherData.feelsLike) }}°C</span>
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { computed, inject, onMounted, watch, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import AllPostsView from '@/views/diary/AllDiaryView.vue'
import SearchComponent from '@/components/SearchComponent.vue'
import { postAPI } from '@/services/api'

export default {
  name: 'HomeView',
  components: {
    AllPostsView,
    SearchComponent
  },
  setup() {
    const authStore = useAuthStore()
    const route = useRoute()
    const router = useRouter()
    
    // App.vue에서 제공하는 함수 inject
    const openAuthModal = inject('openAuthModal')
    
        const isLoggedIn = computed(() => authStore.isAuthenticated)
    
    // 검색 관련 상태
    const searchKeyword = ref('')
    const searchType = ref('CONTENT')

    const handleSearch = (searchData) => {
      searchType.value = searchData.searchType
      searchKeyword.value = searchData.keyword
      // 검색 시 새로운 검색 페이지로 이동
      router.push({
        path: '/search',
        query: {
          searchType: searchData.searchType,
          keyword: searchData.keyword
        }
      })
    }

    const handleClearSearch = () => {
      searchKeyword.value = ''
    }

    // 인기 해시태그 데이터
    const popularHashtags = ref([
      { tagId: 1, name: '강아지', count: 156 },
      { tagId: 2, name: '산책', count: 89 },
      { tagId: 3, name: '고양이', count: 67 },
      { tagId: 4, name: '장난감', count: 45 },
      { tagId: 5, name: '목욕', count: 34 }
    ])

    // 날씨 관련 상태
    const weatherData = ref({
      temp: 0,
      feelsLike: 0,
      humidity: 0,
      windSpeed: 0,
      description: '',
      location: ''
    })
    const weatherLoading = ref(true)
    const weatherError = ref(false)

    // 주소 파싱 함수 (동, 면, 읍, 리까지만 표시)
    const parseAddress = (fullAddress) => {
      if (!fullAddress) return ''
      
      console.log('🔍 주소 파싱 시작:', fullAddress)
      
      // 카카오맵 API 주소 형식: "서울 동작구 신대방동 123-45" -> "동작구 신대방동"
      const kakaoPattern = /^[가-힣]+(?:특별시|광역시|도)\s+([가-힣]+(?:시|군|구)\s+[가-힣]+(?:동|면|읍|리))/
      const kakaoMatch = fullAddress.match(kakaoPattern)
      
      if (kakaoMatch) {
        const result = kakaoMatch[1].trim()
        console.log('🔍 카카오맵 패턴 매치 성공:', result)
        return result
      }
      
      // 기존 패턴들 (백업용)
      const patterns = [
        // 서울특별시 동작구 신대방동 -> 동작구 신대방동
        /서울특별시\s+([가-힣]+구\s+[가-힣]+동)/,
        // 서울 동작구 신대방동 -> 동작구 신대방동
        /서울\s+([가-힣]+구\s+[가-힣]+동)/,
        // 경기도 고양시 일산서구 대화동 -> 일산서구 대화동
        /경기도\s+[가-힣]+시\s+([가-힣]+구\s+[가-힣]+동)/,
        // 경기도 고양시 -> 고양시
        /경기도\s+([가-힣]+시)/,
        // 충청남도 부여군 부여읍 -> 부여군 부여읍
        /[가-힣]+도\s+([가-힣]+군\s+[가-힣]+읍)/,
        // 기타 시 단위 (동까지 포함)
        /[가-힣]+시\s+([가-힣]+구\s+[가-힣]+동)/,
        // 기타 도 단위 (읍, 면, 리까지 포함)
        /[가-힣]+도\s+([가-힣]+(?:시|군)\s+[가-힣]+(?:동|읍|면|리))/,
        // 기타 광역시 (동까지 포함)
        /[가-힣]+광역시\s+([가-힣]+구\s+[가-힣]+동)/,
        // 영어 주소 패턴 (Seoul, Gangnam-gu -> 강남구)
        /Seoul,\s*([A-Za-z-]+)/,
        // 영어 주소 패턴 (Gangnam-gu, Seoul -> 강남구)
        /([A-Za-z-]+),\s*Seoul/
      ]
      
      for (const pattern of patterns) {
        const match = fullAddress.match(pattern)
        if (match) {
          const result = match[1].trim()
          console.log('🔍 패턴 매치 성공:', result)
          return result
        }
      }
      
      // 패턴에 맞지 않으면 원본에서 동, 면, 읍, 리까지만 추출
      const fallbackPattern = /([가-힣]+(?:시|군|구)\s+[가-힣]+(?:동|면|읍|리))/
      const fallbackMatch = fullAddress.match(fallbackPattern)
      
      if (fallbackMatch) {
        const result = fallbackMatch[1].trim()
        console.log('🔍 폴백 패턴 매치 성공:', result)
        return result
      }
      
      // 최종 폴백: 원본 반환 (최대 15자)
      const result = fullAddress.length > 15 ? fullAddress.substring(0, 15) + '...' : fullAddress
      console.log('🔍 모든 패턴 매치 실패, 원본 사용:', result)
      return result
    }

    // 위치 정보 상태
    const currentCoords = ref(null)
    const locationError = ref(null)
    
    // 카카오맵 API로 위치 정보 가져오기
    const getKakaoAddress = async (latitude, longitude) => {
      try {
        console.log('🗺️ 카카오맵 API 호출:', { latitude, longitude })
        
        const kakaoApiKey = process.env.VUE_APP_KAKAO_MAP_API_KEY
        console.log('🗺️ 카카오맵 API 키:', kakaoApiKey ? '설정됨' : '없음')
        
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
          {
            headers: {
              'Authorization': `KakaoAK ${kakaoApiKey}`
            }
          }
        )
        
        console.log('🗺️ 카카오맵 API 응답 상태:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🗺️ 카카오맵 API 응답 데이터:', data)
          
          if (data.documents && data.documents.length > 0) {
            const address = data.documents[0].address
            console.log('🗺️ 카카오맵 주소 객체:', address)
            
            // 가장 구체적인 주소 정보 사용
            const fullAddress = address.address_name
            console.log('🗺️ 카카오맵 전체 주소:', fullAddress)
            
            const parsedAddress = parseAddress(fullAddress)
            console.log('📍 파싱된 주소:', parsedAddress)
            return parsedAddress
          } else {
            console.log('🗺️ 카카오맵 API 응답이 비어있음')
          }
        } else {
          console.log('🗺️ 카카오맵 API 실패:', response.status, response.statusText)
        }
        
        return null
      } catch (error) {
        console.error('🗺️ 카카오맵 API 에러:', error)
        return null
      }
    }

    // 위치 정보 가져오기 (카카오맵 우선, 실패 시 OpenWeatherMap)
    const getLocationFromCoords = async (latitude, longitude) => {
      try {
        console.log('🌍 좌표로 위치 정보 가져오기:', { latitude, longitude })
        
        // 1. 카카오맵 API 시도 (우선)
        const kakaoAddress = await getKakaoAddress(latitude, longitude)
        if (kakaoAddress) {
          console.log('✅ 카카오맵 API 성공:', kakaoAddress)
          return kakaoAddress
        }
        
        console.log('❌ 카카오맵 API 실패, OpenWeatherMap 시도...')
        
        // 2. OpenWeatherMap API 시도 (백업)
        const apiKey = process.env.VUE_APP_OPENWEATHER_API_KEY || 'demo'
        console.log('🔑 OpenWeatherMap API 키 확인:', apiKey === 'demo' ? '데모 키 사용' : '실제 키 사용')
        
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${apiKey}`
        )
        
        console.log('🌍 OpenWeatherMap API 응답 상태:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🌍 OpenWeatherMap API 응답 데이터:', data)
          
          if (data && data.length > 0) {
            // 가장 정확한 한국 주소 찾기
            let bestAddress = null
            
            for (const location of data) {
              console.log('🌍 검토 중인 위치:', location)
              
              // 한국어 주소가 있으면 우선 사용
              if (location.local_names?.ko) {
                bestAddress = location.local_names.ko
                console.log('🌍 한국어 주소 발견:', bestAddress)
                break
              }
              
              // 영어 주소 중에서 한국 주소 패턴 찾기
              if (location.name && location.country === 'KR') {
                bestAddress = location.name
                console.log('🌍 한국 영어 주소 발견:', bestAddress)
                break
              }
              
              // state 정보가 있으면 더 구체적
              if (location.state && location.country === 'KR') {
                bestAddress = `${location.state}, ${location.name}`
                console.log('🌍 한국 state 주소 발견:', bestAddress)
                break
              }
            }
            
            if (bestAddress) {
              console.log('🌍 최종 선택된 주소:', bestAddress)
              const parsedAddress = parseAddress(bestAddress)
              console.log('📍 파싱된 주소:', parsedAddress)
              return parsedAddress
            } else {
              console.log('🌍 적절한 한국 주소를 찾을 수 없음')
            }
          } else {
            console.log('🌍 OpenWeatherMap API 응답이 비어있음')
          }
        } else {
          console.log('🌍 OpenWeatherMap API 실패:', response.status, response.statusText)
        }
        
        // 3. 모든 API 실패 시 추정 위치 사용
        console.log('🌍 모든 API 실패, 추정 위치 사용')
        const estimatedLocation = estimateLocationFromCoords(latitude, longitude)
        console.log('📍 추정 위치:', estimatedLocation)
        return estimatedLocation
        
      } catch (error) {
        console.error('🌍 위치 정보 가져오기 실패:', error)
        // 에러 시 추정 위치 사용
        const estimatedLocation = estimateLocationFromCoords(latitude, longitude)
        console.log('📍 에러로 인한 추정 위치:', estimatedLocation)
        return estimatedLocation
      }
    }

    // 좌표로 대략적인 위치 추정 (API 키가 없을 때)
    const estimateLocationFromCoords = (latitude, longitude) => {
      console.log('🗺️ 위치 추정 시작:', { latitude, longitude })
      
      // 더 세밀한 지역 정보를 포함한 좌표 데이터
      const locations = [
        // 서울 지역
        { name: '강남구', lat: 37.5172, lon: 127.0473 },
        { name: '서초구', lat: 37.4837, lon: 127.0324 },
        { name: '마포구', lat: 37.5637, lon: 126.9085 },
        { name: '종로구', lat: 37.5735, lon: 126.9788 },
        { name: '중구', lat: 37.5640, lon: 126.9979 },
        { name: '용산구', lat: 37.5384, lon: 126.9654 },
        { name: '성동구', lat: 37.5506, lon: 127.0409 },
        { name: '광진구', lat: 37.5384, lon: 127.0822 },
        { name: '동대문구', lat: 37.5744, lon: 127.0395 },
        { name: '중랑구', lat: 37.6064, lon: 127.0926 },
        { name: '성북구', lat: 37.5894, lon: 127.0167 },
        { name: '강북구', lat: 37.6396, lon: 127.0257 },
        { name: '도봉구', lat: 37.6688, lon: 127.0471 },
        { name: '노원구', lat: 37.6542, lon: 127.0568 },
        { name: '은평구', lat: 37.6027, lon: 126.9291 },
        { name: '서대문구', lat: 37.5791, lon: 126.9368 },
        { name: '영등포구', lat: 37.5264, lon: 126.8962 },
        { name: '동작구', lat: 37.5124, lon: 126.9393 },
        { name: '관악구', lat: 37.4784, lon: 126.9516 },
        { name: '금천구', lat: 37.4569, lon: 126.8956 },
        { name: '강서구', lat: 37.5509, lon: 126.8495 },
        { name: '양천구', lat: 37.5270, lon: 126.8565 },
        { name: '구로구', lat: 37.4954, lon: 126.8874 },
        { name: '송파구', lat: 37.5145, lon: 127.1059 },
        { name: '강동구', lat: 37.5301, lon: 127.1238 },
        
        // 경기도 주요 지역
        { name: '수원시', lat: 37.2636, lon: 127.0286 },
        { name: '고양시', lat: 37.6584, lon: 126.8320 },
        { name: '용인시', lat: 37.2411, lon: 127.1776 },
        { name: '성남시', lat: 37.4449, lon: 127.1389 },
        { name: '부천시', lat: 37.5035, lon: 126.7660 },
        { name: '안산시', lat: 37.3219, lon: 126.8309 },
        { name: '안양시', lat: 37.3943, lon: 126.9568 },
        { name: '평택시', lat: 36.9920, lon: 127.1128 },
        { name: '시흥시', lat: 37.3799, lon: 126.8031 },
        { name: '김포시', lat: 37.6156, lon: 126.7158 },
        { name: '광주시', lat: 37.4295, lon: 127.2551 },
        { name: '광명시', lat: 37.4794, lon: 126.8649 },
        { name: '군포시', lat: 37.3616, lon: 126.9352 },
        { name: '오산시', lat: 37.1498, lon: 127.0772 },
        { name: '하남시', lat: 37.5392, lon: 127.2148 },
        { name: '이천시', lat: 37.2720, lon: 127.4350 },
        { name: '안성시', lat: 37.0080, lon: 127.2797 },
        { name: '의왕시', lat: 37.3449, lon: 126.9482 },
        { name: '양평군', lat: 37.4912, lon: 127.4875 },
        { name: '여주시', lat: 37.2984, lon: 127.6370 },
        { name: '과천시', lat: 37.4291, lon: 126.9879 },
        { name: '남양주시', lat: 37.6364, lon: 127.2160 },
        { name: '파주시', lat: 37.8154, lon: 126.7928 },
        { name: '의정부시', lat: 37.7381, lon: 127.0337 },
        { name: '양주시', lat: 37.8323, lon: 127.0462 },
        { name: '구리시', lat: 37.5943, lon: 127.1296 },
        { name: '포천시', lat: 37.8949, lon: 127.2002 },
        { name: '동두천시', lat: 37.9036, lon: 127.0606 },
        { name: '가평군', lat: 37.8315, lon: 127.5105 },
        { name: '연천군', lat: 38.0966, lon: 127.0747 },
        
        // 기타 주요 도시
        { name: '부산', lat: 35.1796, lon: 129.0756 },
        { name: '대구', lat: 35.8714, lon: 128.6014 },
        { name: '인천', lat: 37.4563, lon: 126.7052 },
        { name: '광주', lat: 35.1595, lon: 126.8526 },
        { name: '대전', lat: 36.3504, lon: 127.3845 },
        { name: '울산', lat: 35.5384, lon: 129.3114 },
        { name: '세종', lat: 36.4800, lon: 127.2890 },
        { name: '창원', lat: 35.2278, lon: 128.6817 },
        { name: '포항', lat: 36.0320, lon: 129.3650 },
        { name: '청주', lat: 36.6424, lon: 127.4890 },
        { name: '전주', lat: 35.8242, lon: 127.1480 },
        { name: '천안', lat: 36.8151, lon: 127.1139 },
        { name: '김해', lat: 35.2281, lon: 128.8891 }
      ]
      
              // 가장 가까운 지역 찾기
        let closestLocation = locations[0]
        let minDistance = Number.MAX_VALUE
        
        for (const location of locations) {
          const distance = Math.sqrt(
            Math.pow(latitude - location.lat, 2) + Math.pow(longitude - location.lon, 2)
          )
          if (distance < minDistance) {
            minDistance = distance
            closestLocation = location
          }
        }
        
        // 거리가 매우 가까우면 (0.01 이하) 더 구체적인 동네 정보 추가
        let result = closestLocation.name
        if (minDistance < 0.01) {
          // 동작구 근처라면 구체적인 동네 추가
          if (closestLocation.name === '동작구') {
            result = '동작구 신대방동'
          } else if (closestLocation.name === '강남구') {
            result = '강남구 역삼동'
          } else if (closestLocation.name === '서초구') {
            result = '서초구 서초동'
          } else if (closestLocation.name === '마포구') {
            result = '마포구 합정동'
          }
        }
        
        console.log('🗺️ 추정된 위치:', result, '거리:', minDistance.toFixed(4))
        return result
    }

    // 위치 정보 가져오기
    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('위치 정보를 지원하지 않습니다'))
          return
        }
        
        console.log('📍 위치 정보 요청 시작...')
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            console.log('✅ 위치 정보 성공:', coords)
            currentCoords.value = coords
            locationError.value = null
            resolve(coords)
          },
          (error) => {
            console.error('❌ 위치 정보 에러:', error)
            locationError.value = error
            
            // 에러 코드별 상세 메시지
            switch (error.code) {
              case 1:
                console.error('위치 권한이 거부되었습니다')
                break
              case 2:
                console.error('위치 정보를 사용할 수 없습니다')
                break
              case 3:
                console.error('위치 정보 요청 시간이 초과되었습니다')
                break
              default:
                console.error('알 수 없는 위치 에러:', error.message)
            }
            
            reject(error)
          },
          {
            timeout: 30000, // 30초로 증가
            enableHighAccuracy: true, // 정확도 향상
            maximumAge: 60000 // 1분으로 단축
          }
        )
      })
    }

    // 인기 해시태그 가져오기
const fetchPopularHashtags = async () => {
  try {
    console.log('🏷️ 인기 해시태그 가져오기 시작...');
    console.log('🏷️ API 엔드포인트: /posts/rank-hashtag');
    console.log('🏷️ 현재 popularHashtags 초기값:', popularHashtags.value);
    
    const response = await postAPI.getRankHashtags();
    console.log('🏷️ API 응답 전체:', JSON.stringify(response, null, 2));
    console.log('🏷️ API 응답 데이터:', JSON.stringify(response.data, null, 2));
    console.log('🏷️ 응답 데이터 타입:', typeof response.data);
    console.log('🏷️ 응답 데이터 길이:', Array.isArray(response.data) ? response.data.length : '배열 아님');
    
    // 응답 구조: { isSuccess: true, data: [...], status: {...} }
    const hashtagData = response.data.data;
    console.log('🏷️ 실제 해시태그 데이터:', JSON.stringify(hashtagData, null, 2));
    console.log('🏷️ 해시태그 데이터 타입:', typeof hashtagData);
    console.log('🏷️ 해시태그 데이터 길이:', Array.isArray(hashtagData) ? hashtagData.length : '배열 아님');
    
    if (Array.isArray(hashtagData)) {
      console.log('🏷️ 각 해시태그 데이터:');
      hashtagData.forEach((tag, index) => {
        console.log(`  ${index + 1}.`, JSON.stringify(tag, null, 2));
      });
    }
    
    popularHashtags.value = hashtagData;
    console.log('🏷️ popularHashtags 업데이트 완료:', JSON.stringify(popularHashtags.value, null, 2));
  } catch (error) {
    console.error('❌ 인기 해시태그 가져오기 실패:', error);
    console.error('❌ 에러 상세 정보:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    console.log('🏷️ 기본 데이터로 fallback...');
    // 기본 데이터 사용
    popularHashtags.value = [
      { tagId: 1, name: '강아지', count: 156 },
      { tagId: 2, name: '산책', count: 89 },
      { tagId: 3, name: '고양이', count: 67 },
      { tagId: 4, name: '장난감', count: 45 },
      { tagId: 5, name: '목욕', count: 34 }
    ];
    console.log('🏷️ 기본 데이터 설정 완료:', JSON.stringify(popularHashtags.value, null, 2));
  }
};

// 해시태그 클릭 핸들러
const handleHashtagClick = (hashtag) => {
  console.log('🏷️ 해시태그 클릭 시작...');
  console.log('🏷️ 클릭된 해시태그 데이터:', JSON.stringify(hashtag, null, 2));
  console.log('🏷️ 해시태그 타입:', typeof hashtag);
  console.log('🏷️ 해시태그 속성들:', Object.keys(hashtag));
  
  // 검색창에 해시태그 입력 (해시태그 기호 없이)
  const searchQuery = hashtag.name;
  console.log('🏷️ 검색 쿼리 생성:', searchQuery);
  
  searchKeyword.value = searchQuery;
  console.log('🏷️ 검색 쿼리:', searchQuery);
  
  // 검색 실행 (searchType을 HASHTAG로 설정)
  const routeQuery = { 
    keyword: searchQuery,
    searchType: 'HASHTAG'
  };
  console.log('🏷️ 라우터 쿼리:', JSON.stringify(routeQuery, null, 2));
  
  router.push({
    path: '/search',
    query: routeQuery
  });
  console.log('🏷️ 라우터 이동 완료');
};

// 날씨 정보 가져오기
const fetchWeather = async () => {
      try {
        console.log('🌤️ 날씨 정보 가져오기 시작...')
        weatherLoading.value = true
        weatherError.value = false
        
        // 위치 정보 가져오기
        let coords = currentCoords.value
        console.log('📍 캐시된 위치 정보:', coords)
        
        if (!coords) {
          console.log('📍 캐시된 위치 정보 없음, 새로 요청...')
          coords = await getCurrentLocation()
        }
        
        console.log('📍 최종 위치 좌표:', coords)
        
        // 위치 정보 가져오기
        console.log('🌍 위치 정보 파싱 시작...')
        const location = await getLocationFromCoords(coords.latitude, coords.longitude)
        console.log('📍 최종 파싱된 위치:', location)
        
        // OpenWeatherMap API 호출
        const apiKey = process.env.VUE_APP_OPENWEATHER_API_KEY || 'demo'
        console.log('🌤️ 날씨 API 키:', apiKey === 'demo' ? '데모 키' : '실제 키')
        
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${apiKey}&units=metric&lang=kr`
        console.log('🌤️ 날씨 API URL:', weatherUrl)
        
        const response = await fetch(weatherUrl)
        console.log('🌤️ 날씨 API 응답 상태:', response.status)
        
        if (!response.ok) {
          console.log('🌤️ 날씨 API 실패, 기본 데이터 사용')
          // API 키가 없거나 에러인 경우에도 위치 정보는 표시
          weatherData.value = {
            temp: 23,
            feelsLike: 25,
            humidity: 65,
            windSpeed: 3,
            description: '맑음',
            location: location
          }
          console.log('🌤️ 기본 날씨 데이터 설정:', weatherData.value)
          return
        }
        
        const data = await response.json()
        console.log('🌤️ 날씨 API 응답 데이터:', data)
        
        weatherData.value = {
          temp: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
          location: location
        }
        
        console.log('🌤️ 최종 날씨 데이터:', weatherData.value)
        
      } catch (error) {
        console.error('❌ 날씨 정보 가져오기 실패:', error)
        
        // 위치 에러 처리
        if (locationError.value) {
          weatherError.value = true
          console.log('❌ 위치 에러:', locationError.value)
        } else {
          console.log('❌ 기타 에러, 기본 데이터 사용')
          // 기타 에러의 경우 기본 데이터 사용 (위치 정보는 추정)
          const estimatedLocation = estimateLocationFromCoords(37.5665, 126.9780) // 서울 좌표
          weatherData.value = {
            temp: 23,
            feelsLike: 25,
            humidity: 65,
            windSpeed: 3,
            description: '맑음',
            location: estimatedLocation
          }
          console.log('🌤️ 에러로 인한 기본 날씨 데이터:', weatherData.value)
        }
      } finally {
        weatherLoading.value = false
        console.log('🌤️ 날씨 정보 가져오기 완료')
      }
    }



    // OAuth 모달 자동 열기
    onMounted(() => {
      console.log('🏠 HomeView 마운트 시작...')
      
      // 날씨 정보 가져오기
      console.log('🌤️ 날씨 정보 가져오기 호출...')
      fetchWeather()
      
      // 인기 해시태그 가져오기
      console.log('🏷️ 인기 해시태그 가져오기 호출...')
      fetchPopularHashtags()
      
      // 로그인 모달 자동 열기 (라우터 가드에서 리다이렉트된 경우)
      // 로그인 모달 자동 열기 (라우터 가드에서 리다이렉트된 경우)
      const { showLogin } = route.query
      if (showLogin === 'true') {
        console.log('🔍 라우터 가드에서 로그인 모달 자동 열기')
        if (openAuthModal) {
          openAuthModal('login')
        }
        // URL에서 쿼리 파라미터 제거
        window.history.replaceState({}, document.title, '/')
      }
      
      // OAuth 추가정보 모달
      const { openOAuthExtra, provider, signupTicket, email } = route.query
      if (openOAuthExtra === 'true' && provider && signupTicket && email) {
        const openOAuthExtraModal = inject('openOAuthExtraModal')
        if (openOAuthExtraModal) {
          openOAuthExtraModal({
            provider,
            signupTicket,
            email
          })
        }
        // URL에서 쿼리 파라미터 제거
        window.history.replaceState({}, document.title, '/')
      }
      
      // 소셜 연동 모달
      const { openOAuthLink, provider: linkProvider, email: linkEmail, linkTicket } = route.query
      if (openOAuthLink === 'true' && linkProvider && linkEmail && linkTicket) {
        const openOAuthLinkModal = inject('openOAuthLinkModal')
        if (openOAuthLinkModal) {
          openOAuthLinkModal({
            provider: linkProvider,
            email: linkEmail,
            linkTicket
          })
        }
        // URL에서 쿼리 파라미터 제거
        window.history.replaceState({}, document.title, '/')
      }
      
      // OAuth 추가정보 모달 (중복 제거)
      const { openOAuthExtra: extraFlag, provider: extraProvider, email: extraEmail, signupTicket: extraTicket } = route.query
      if (extraFlag === 'true' && extraProvider && extraEmail && extraTicket) {
        const openOAuthExtraModal = inject('openOAuthExtraModal')
        if (openOAuthExtraModal) {
          openOAuthExtraModal({
            provider: extraProvider,
            email: extraEmail,
            signupTicket: extraTicket
          })
        }
        // URL에서 쿼리 파라미터 제거
        window.history.replaceState({}, document.title, '/')
      }
      
      // 소셜 계정 중복 모달
      const { showSocialDuplicate, duplicateEmail, duplicateProvider } = route.query
      if (showSocialDuplicate === 'true' && duplicateEmail && duplicateProvider) {
        const openSocialDuplicateModal = inject('openSocialDuplicateModal')
        if (openSocialDuplicateModal) {
          openSocialDuplicateModal({
            email: duplicateEmail,
            provider: duplicateProvider
          })
        }
        // URL에서 쿼리 파라미터 제거
        window.history.replaceState({}, document.title, '/')
      }
      
      // 삭제된 계정 모달
      const { showDeletedAccount, deletedEmail } = route.query
      if (showDeletedAccount === 'true' && deletedEmail) {
        const openDeletedAccountModal = inject('openDeletedAccountModal')
        if (openDeletedAccountModal) {
          openDeletedAccountModal({
            email: deletedEmail
          })
        }
        // URL에서 쿼리 파라미터 제거
        window.history.replaceState({}, document.title, '/')
      }
    })
    
    // 로그인 상태 변화를 감지하기 위해 watch 추가
    watch(() => authStore.isAuthenticated, (newValue) => {
      console.log('로그인 상태 변화 감지:', newValue)
    }, { immediate: true })
    
    return {
      isLoggedIn,
      openAuthModal,
      searchKeyword,
      searchType,
      handleSearch,
      handleClearSearch,
      popularHashtags,
      handleHashtagClick,
      weatherData,
      weatherLoading,
      weatherError,
      fetchWeather
    }
  }
}
</script>

<style scoped>
/* 홈뷰 전체 스타일 */
.home-view {
  min-height: 100vh;
}

/* 홈 콘텐츠 래퍼 */
.home-content-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 메인 콘텐츠 */
  .home-main-content {
  flex: 1;
  min-width: 0;
  margin-top: 10px;
  padding-right: 40px;
  padding-left: 0;
  max-width: calc(100% - 400px);
  margin-left: 40px;
  margin-right: auto;
}

/* 오른쪽 사이드바 */
.home-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 40px;
  position: fixed;
  top: 10px;
  right: 40px;
  z-index: 999;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

/* 사이드바 카드 */
.sidebar-card {
  background: #FFFFFF !important;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px;
}

/* 인사이트 헤더 */
.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.insight-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1E293B;
}

/* 해시태그 리스트 */
.hashtag-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hashtag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #F8FAFC;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.hashtag-item:hover {
  background: #F1F5F9;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hashtag-text {
  font-weight: 500;
  color: #475569;
}

.hashtag-count {
  font-size: 0.9rem;
  color: #64748B;
  font-weight: 500;
}

/* 날씨 상세 */
.weather-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 위치 정보 */
.weather-location {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #F8FAFC;
  border-radius: 8px;
  margin-bottom: 8px;
}

.location-text {
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

.weather-main-info {
  text-align: center;
  padding: 16px 0;
}

.weather-temp-large {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1E293B;
  line-height: 1;
}

.weather-desc {
  font-size: 1.1rem;
  color: #475569;
  margin-top: 4px;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weather-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E2E8F0;
}

.weather-detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.9rem;
  color: #64748B;
}

.detail-value {
  font-weight: 600;
  color: #1E293B;
}

/* 날씨 로딩 상태 */
.weather-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
  color: #64748B;
  font-size: 0.9rem;
}

/* 날씨 에러 상태 */
.weather-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
  color: #EF4444;
  font-size: 0.9rem;
  text-align: center;
}

/* 검색 섹션 스타일 */
.home-search-section {
  background: transparent;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-left: 10px;
}

.search-wrapper {
  width: 100%;
  max-width: 800px;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.search-and-write-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-and-write-container :deep(.search-component) {
  width: 100%;
  max-width: 700px;
}

.search-and-write-container :deep(.search-component .v-text-field) {
  width: 100%;
  min-width: 600px;
}

.search-and-write-container :deep(.search-component .v-text-field__field) {
  width: 100%;
}

.search-and-write-container :deep(.search-component .v-text-field__input) {
  width: 100%;
  min-width: 500px;
}



/* 히어로 섹션 */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%);
  z-index: -2;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.0);
  z-index: -1;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  z-index: 1;
}

.hero-text {
  color: #111111;
  text-align: left;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.title-line {
  display: block;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 48px;
  opacity: 0.95;
  color: #4B5563;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-btn {
  border-radius: 16px;
  font-weight: 600;
  padding: 16px 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  line-height: 1;
  text-transform: none;
}

.hero-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.login-btn {
  background: linear-gradient(135deg, #FF8B8B 0%, #FF6B6B 100%) !important;
  color: #fff !important;
}

.register-btn {
  border: 2px solid #FF8B8B;
  color: #FF8B8B !important;
  background: transparent !important;
}

.register-btn:hover {
  background: #FF8B8B !important;
  color: #ffffff !important;
}

.dashboard-btn {
  background: linear-gradient(135deg, #FF8B8B 0%, #FF6B6B 100%) !important;
}

/* 히어로 비주얼 */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pet-illustrations {
  position: relative;
  width: 300px;
  height: 300px;
}

.pet {
  position: absolute;
  font-size: 80px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  animation: bounce 3s ease-in-out infinite;
}

.pet-dog {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.pet-cat {
  bottom: 0;
  left: 20%;
  animation-delay: 1s;
}

.pet-bird {
  bottom: 0;
  right: 20%;
  animation-delay: 2s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 기능 소개 섹션 */
.features-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF !important;
  margin-bottom: 64px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: #FFFFFF;
  padding: 40px 32px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 팔레트 변형: 카드별 배경/아이콘/텍스트 컬러 차별화 */
.palette-pet { background: linear-gradient(135deg, #FFF5F5 0%, #FFECEC 100%); }
.palette-pet .feature-icon { background: linear-gradient(135deg, #FFE3E3 0%, #FFD6D6 100%); }
.palette-pet .feature-title { color: #7F1D1D; }

.palette-diary { background: linear-gradient(135deg, #F5FFF7 0%, #ECFFEE 100%); }
.palette-diary .feature-icon { background: linear-gradient(135deg, #DFFBE5 0%, #CCF7D5 100%); }
.palette-diary .feature-title { color: #065F46; }

.palette-market { background: linear-gradient(135deg, #F5F8FF 0%, #ECF2FF 100%); }
.palette-market .feature-icon { background: linear-gradient(135deg, #DDE7FF 0%, #CCD9FF 100%); }
.palette-market .feature-title { color: #1E3A8A; }

.palette-community { background: linear-gradient(135deg, #FFF9F0 0%, #FFF2E0 100%); }
.palette-community .feature-icon { background: linear-gradient(135deg, #FFE6C7 0%, #FFD8A8 100%); }
.palette-community .feature-title { color: #9A3412; }

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 139, 139, 0.06), transparent);
  transition: left 0.5s;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

.feature-icon {
  margin-bottom: 24px;
  display: inline-block;
  padding: 20px;
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE8D6 100%);
  border-radius: 20px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 16px;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #475569;
}

/* 통계 섹션 */
.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #FFFAF0 0%, #FFF7EC 100%);
  color: #1E293B;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 48px;
  text-align: center;
}

.stat-item {
  padding: 32px 16px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: #0F172A;
}

.stat-label {
  font-size: 1.125rem;
  opacity: 0.9;
  font-weight: 500;
  color: #334155;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .home-content-wrapper {
    flex-direction: column;
    gap: 16px;
  }
  
  .home-main-content {
    padding-right: 0;
    margin-left: 20px;
    margin-right: 20px;
    max-width: 100%;
  }
  
  .home-sidebar {
    display: none;
  }
  
  .sidebar-card {
    min-width: 280px;
    flex-shrink: 0;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .pet-illustrations {
    width: 250px;
    height: 250px;
  }
  
  .pet {
    font-size: 60px;
  }
  
  .search-wrapper {
    width: calc(100% - 200px);
    max-width: 800px;
    padding: 0 24px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
  
  .home-search-section {
    padding: 8px 0;
  }
  
  .home-content-wrapper {
    padding: 0 16px;
  }
  
  .home-main-content {
    padding-right: 0;
    margin-left: 10px;
    margin-right: 10px;
    max-width: 100%;
  }
  
  .search-wrapper {
    width: calc(100% - 100px);
    max-width: 700px;
    padding: 0 20px;
    justify-content: center;
    margin: 0 auto;
  }
  
  .search-and-write-container {
    gap: 12px;
  }
  
  .search-and-write-container :deep(.search-component) {
    flex: 1;
    min-width: 0;
  }
  

}

@media (max-width: 480px) {
  .hero-content {
    padding: 0 16px;
  }
  
  .home-content-wrapper {
    padding: 0 12px;
  }
  
  .home-main-content {
    padding-right: 0;
    margin-left: 5px;
    margin-right: 5px;
    max-width: 100%;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .home-search-section {
    padding: 5px 0;
  }
  
  .search-wrapper {
    width: calc(100% - 40px);
    max-width: 600px;
    padding: 0 16px;
    justify-content: center;
    margin: 0 auto;
  }
  
  .search-and-write-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-and-write-container :deep(.search-component) {
    flex: 1;
    min-width: 0;
    width: 100%;
  }
  

}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  /* 다크 모드에서도 동일 팔레트 유지 */
  .features-section {
    background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
  }
  .feature-card {
    background: #FFFFFF;
    border-color: rgba(0, 0, 0, 0.06);
  }
  .feature-title { color: #1E293B; }
  .feature-description { color: #475569; }
  .section-title { color: #FFFFFF !important; }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .shape,
  .pet,
  .hero-btn,
  .feature-card {
    animation: none;
    transition: none;
  }
  
  .hero-btn:hover,
  .feature-card:hover {
    transform: none;
  }
}
</style>
