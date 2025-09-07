<template>
  <div class="dashboard-container">
    <v-row>
      <!-- 메인 콘텐츠 -->
      <v-col cols="12">
        <v-card class="main-content-card">
          <!-- 인사말 섹션 -->
          <div class="greeting-section">
            <div class="greeting-content">
              <div class="greeting-text">
                <h1 class="greeting-title">
                  안녕하세요, {{ user?.nickname || '사용자' }}님! 🐕🐱
                </h1>
                <p class="greeting-subtitle">
                  {{ representativePet ? `${representativePet.name}와(과) 함께하는 하루를 보내세요!` : '반려동물과 함께하는 하루를 보내세요!' }}
                </p>
              </div>
              
              <div 
                v-if="representativePet" 
                class="representative-pet-avatar"
              >
                <v-avatar size="120" class="pet-avatar">
                  <v-img
                    v-if="representativePet.url"
                    :src="representativePet.url"
                    :alt="representativePet.name"
                    cover
                  />
                  <v-icon v-else size="48" color="primary">mdi-paw</v-icon>
                </v-avatar>
                <div class="pet-badge">대표</div>
              </div>
            </div>
          </div>
          
          <!-- 통계 카드들 -->
          <div class="stats-section">
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card stat-pet" @click="$router.push('/pets')">
                  <v-card-title class="stat-title">
                    내 반려동물
                  </v-card-title>
                  <v-card-text class="stat-number">
                    {{ petCount }}
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card stat-diary" @click="$router.push('/diarys')">
                  <v-card-title class="stat-title">
                    작성한 일기
                  </v-card-title>
                  <v-card-text class="stat-number">
                    {{ diaryCount }}
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card stat-market" @click="$router.push('/market')">
                  <v-card-title class="stat-title">
                    마켓 게시글
                  </v-card-title>
                  <v-card-text class="stat-number">
                    {{ marketCount }}
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card stat-chat" @click="$router.push('/chat')">
                  <v-card-title class="stat-title">
                    채팅방
                  </v-card-title>
                  <v-card-text class="stat-number">
                    {{ chatCount }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
          
          <!-- 구분선 -->
          <v-divider class="section-divider"></v-divider>
          
          <!-- 인사이트 -->
          <div class="today-tasks-section">
            <h2 class="section-title">
              인사이트
            </h2>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-card class="insight-card">
                  <div class="insight-header">
                    <v-icon color="#F59E0B" size="24">mdi-lightbulb</v-icon>
                    <div class="insight-title">오늘의 팁</div>
                    <v-spacer></v-spacer>
                    <v-btn
                      @click="refreshAITip"
                      size="small"
                      color="#F59E0B"
                      variant="elevated"
                      :loading="tipLoading"
                      class="tip-action-btn"
                      prepend-icon="mdi-refresh"
                    >
                      AI 새로고침
                    </v-btn>
                  </div>
                  
                  <div v-if="tipLoading" class="tip-loading">
                    <v-progress-circular indeterminate color="#F59E0B" size="24"></v-progress-circular>
                    <span class="ml-2">AI가 새로운 팁을 생성하는 중...</span>
                  </div>
                  
                  <div v-else-if="tipError" class="tip-error">
                    <v-icon color="error" size="24">mdi-alert-circle</v-icon>
                    <span class="ml-2">{{ tipError }}</span>
                    <v-btn 
                      @click="refreshAITip" 
                      size="small" 
                      color="#F59E0B" 
                      variant="elevated" 
                      class="ml-2 tip-action-btn"
                      prepend-icon="mdi-refresh"
                    >
                      다시 시도
                    </v-btn>
                  </div>
                  
                  <div v-else class="tip-content">
                    <div class="tip-text">{{ dailyTip.text }}</div>
                    <div class="tip-source">- {{ dailyTip.source }}</div>
                    <div v-if="lastTipUpdate" class="tip-timestamp">
                      {{ aiTipStore.lastUpdateFormatted }}에 업데이트됨
                    </div>
                    <div v-if="aiTipStore.isAITip" class="tip-ai-badge">
                      <v-chip size="x-small" color="primary" variant="outlined">
                        <v-icon start size="12">mdi-robot</v-icon>
                        AI 생성
                      </v-chip>
                    </div>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-row>
                  <!-- 인기 해시태그 섹션 -->
                  <v-col cols="12">
                    <TrendingHashtags @search="handleSearch" />
                  </v-col>

                  <!-- 오늘의 날씨 섹션 -->
                  <v-col cols="12">
                    <v-card class="insight-card">
                      <div class="insight-header">
                        <v-icon color="#60A5FA" size="24">mdi-weather-sunny</v-icon>
                        <div class="insight-title">오늘의 날씨</div>
                        <v-spacer></v-spacer>
                        <v-btn
                          v-if="!weatherData"
                          @click="getUserLocation"
                          size="small"
                          color="#FF8B8B"
                          variant="elevated"
                          :loading="locationLoading"
                          class="weather-action-btn"
                          prepend-icon="mdi-map-marker"
                        >
                          위치 허용
                        </v-btn>
                        <v-btn
                          v-else
                          @click="refreshWeather"
                          size="small"
                          color="#FF8B8B"
                          variant="elevated"
                          :loading="weatherLoading"
                          class="weather-action-btn"
                          prepend-icon="mdi-refresh"
                        >
                          새로고침
                        </v-btn>
                      </div>
                      <div v-if="weatherLoading" class="weather-loading">
                        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                        <span class="ml-2">날씨 정보를 가져오는 중...</span>
                      </div>
                      <div v-else-if="weatherError" class="weather-error">
                        <v-icon color="error" size="24">mdi-alert-circle</v-icon>
                        <span class="ml-2">{{ weatherError }}</span>
                        <v-btn 
                          @click="getUserLocation" 
                          size="small" 
                          color="#FF8B8B" 
                          variant="elevated" 
                          class="ml-2 weather-action-btn"
                          prepend-icon="mdi-refresh"
                        >
                          다시 시도
                        </v-btn>
                      </div>
                      <div v-else-if="weatherData" class="weather-detail">
                        <div class="weather-main-info">
                          <div class="weather-temp-large">{{ Math.round(weatherData.main.temp) }}°C</div>
                          <div class="weather-desc">{{ getWeatherDescription(weatherData.weather[0].description) }}</div>
                          <div class="weather-location">{{ weatherData.name }}</div>
                        </div>
                        <div class="weather-details">
                          <div class="weather-detail-item">
                            <span class="detail-label">습도</span>
                            <span class="detail-value">{{ weatherData.main.humidity }}%</span>
                          </div>
                          <div class="weather-detail-item">
                            <span class="detail-label">바람</span>
                            <span class="detail-value">{{ Math.round(weatherData.wind.speed) }}m/s</span>
                          </div>
                          <div class="weather-detail-item">
                            <span class="detail-label">체감온도</span>
                            <span class="detail-value">{{ Math.round(weatherData.main.feels_like) }}°C</span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="weather-placeholder">
                        <v-icon color="grey" size="48">mdi-map-marker</v-icon>
                        <p class="mt-2 text-grey">위치를 허용하면 날씨 정보를 확인할 수 있습니다</p>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>


        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import { useAITipStore } from '@/stores/aiTip'
import { postAPI, marketAPI, petAPI, chatAPI } from '@/services/api'
import TrendingHashtags from '@/components/common/TrendingHashtags.vue'

export default {
  name: 'DashboardView',
  components: {
    TrendingHashtags
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const petStore = usePetStore()
    const aiTipStore = useAITipStore()
    
    const user = computed(() => authStore.user)
    const representativePet = computed(() => {
      const pet = petStore.getRepresentativePet
      console.log('=== representativePet computed 실행 ===')
      console.log('대표 반려동물:', pet)
      console.log('대표 반려동물 이름:', pet?.name)
      return pet
    })
    

    
    // 통계 데이터
    const petCount = ref(0)
    const diaryCount = ref(0)
    const marketCount = ref(0)
    const chatCount = ref(0)
    
    // 다이어리 개수 가져오기
    const fetchDiaryCount = async () => {
      try {
        const response = await postAPI.getMyPosts({ page: 0, size: 1 })
        if (response.data && response.data.data) {
          // 백엔드에서 Page 객체의 totalElements를 반환
          diaryCount.value = response.data.data.totalElements || 0
        }
      } catch (error) {
        console.error('다이어리 개수 조회 실패:', error)
        diaryCount.value = 0
      }
    }
    
    // 판매 게시글 개수 가져오기
    const fetchMarketCount = async () => {
      try {
        const response = await marketAPI.getSales({ page: 0, size: 1 })
        if (response.data && response.data.data) {
          // 백엔드에서 Page 객체의 totalElements를 반환
          marketCount.value = response.data.data.totalElements || 0
        }
      } catch (error) {
        console.error('판매 게시글 개수 조회 실패:', error)
        marketCount.value = 0
      }
    }
    
    // 반려동물 개수 가져오기
    const fetchPetCount = async () => {
      try {
        const response = await petAPI.getList()
        if (response.data && response.data.data && response.data.data.pets) {
          // 백엔드에서 pets 배열의 길이를 반환
          petCount.value = response.data.data.pets.length || 0
        }
      } catch (error) {
        console.error('반려동물 개수 조회 실패:', error)
        petCount.value = 0
      }
    }
    
    // 채팅방 개수 가져오기
    const fetchChatCount = async () => {
      try {
        const response = await chatAPI.getMyChatRooms()
        if (response.data && response.data.data) {
          // 백엔드에서 ChatRoomSummaryRes 배열의 길이를 반환
          chatCount.value = response.data.data.length || 0
        }
      } catch (error) {
        console.error('채팅방 개수 조회 실패:', error)
        chatCount.value = 0
      }
    }
    
    // 검색 처리
    const handleSearch = (searchData) => {
      console.log('대시보드에서 검색:', searchData)
      router.push(`/search?searchType=${searchData.searchType}&keyword=${encodeURIComponent(searchData.keyword)}`)
    }
    



    // AI 팁 store에서 상태 가져오기
    const dailyTip = computed(() => aiTipStore.currentTip)
    const tipLoading = computed(() => aiTipStore.loading)
    const tipError = computed(() => aiTipStore.error)
    const lastTipUpdate = computed(() => aiTipStore.currentTip.timestamp)

    // 날씨 관련 데이터
    const weatherData = ref(null)
    const weatherLoading = ref(false)
    const weatherError = ref('')
    const locationLoading = ref(false)

    // 날씨 설명을 한국어로 변환
    const getWeatherDescription = (description) => {
      const weatherMap = {
        'clear sky': '맑음',
        'few clouds': '구름 조금',
        'scattered clouds': '구름 많음',
        'broken clouds': '구름 많음',
        'shower rain': '소나기',
        'rain': '비',
        'thunderstorm': '뇌우',
        'snow': '눈',
        'mist': '안개',
        'fog': '안개',
        'haze': '실안개',
        'dust': '먼지',
        'sand': '모래',
        'ash': '재',
        'squall': '돌풍',
        'tornado': '토네이도'
      }
      return weatherMap[description] || description
    }

    // 사용자 위치 가져오기
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        weatherError.value = '이 브라우저는 위치 서비스를 지원하지 않습니다.'
        return
      }

      locationLoading.value = true
      weatherError.value = ''

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchWeatherData(latitude, longitude)
        },
        (error) => {
          locationLoading.value = false
          switch (error.code) {
            case error.PERMISSION_DENIED:
              weatherError.value = '위치 접근이 거부되었습니다.'
              break
            case error.POSITION_UNAVAILABLE:
              weatherError.value = '위치 정보를 사용할 수 없습니다.'
              break
            case error.TIMEOUT:
              weatherError.value = '위치 요청이 시간 초과되었습니다.'
              break
            default:
              weatherError.value = '위치를 가져오는 중 오류가 발생했습니다.'
              break
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      )
    }

    // 날씨 데이터 가져오기
    const fetchWeatherData = async (lat, lon) => {
      weatherLoading.value = true
      locationLoading.value = false
      weatherError.value = ''

      try {
        const apiKey = process.env.VUE_APP_OPENWEATHER_API_KEY
        if (!apiKey) {
          throw new Error('OpenWeatherMap API 키가 설정되지 않았습니다.')
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`
        )

        if (!response.ok) {
          throw new Error(`날씨 API 요청 실패: ${response.status}`)
        }

        const data = await response.json()
        weatherData.value = data
        
        // AI를 통한 날씨에 따른 팁 업데이트
        await updateDailyTipWithAI(data)
      } catch (error) {
        console.error('날씨 데이터 가져오기 실패:', error)
        weatherError.value = error.message || '날씨 정보를 가져오는 중 오류가 발생했습니다.'
      } finally {
        weatherLoading.value = false
      }
    }

    // 날씨 데이터 새로고침
    const refreshWeather = () => {
      if (weatherData.value) {
        const { lat, lon } = weatherData.value.coord
        fetchWeatherData(lat, lon)
      }
    }

    // AI를 통한 일일 팁 업데이트 (store 사용)
    const updateDailyTipWithAI = async (weather) => {
      const temp = Math.round(weather.main.temp)
      const description = getWeatherDescription(weather.weather[0].description)
      
      await aiTipStore.fetchAITip({
        weather: description,
        temperature: temp.toString(),
        petType: representativePet.value?.species || ''
      })
    }


    // AI 팁 새로고침 함수 (store 사용)
    const refreshAITip = async () => {
      // 캐시 강제 갱신
      aiTipStore.forceRefresh()
      
      if (weatherData.value) {
        await updateDailyTipWithAI(weatherData.value)
      } else {
        // 날씨 정보가 없어도 기본 팁으로 AI 요청
        await aiTipStore.fetchAITip({
          petType: representativePet.value?.species || ''
        })
      }
    }




    
    // 컴포넌트 마운트 시 데이터 가져오기
    onMounted(async () => {
      console.log('=== DashboardView onMounted 시작 ===')
      
      // 반려동물 데이터 먼저 로드 (대표 반려동물 정보를 위해)
      console.log('반려동물 데이터 로드 시작...')
      await petStore.fetchPets()
      console.log('반려동물 데이터 로드 완료')
      console.log('대표 반려동물:', representativePet.value)
      
      // 통계 데이터 로드
      fetchPetCount()
      fetchDiaryCount()
      fetchMarketCount()
      fetchChatCount()
      
      console.log('=== DashboardView onMounted 완료 ===')
    })

    const goToRepresentativePet = () => {
      if (representativePet.value) {
        router.push('/pets/' + representativePet.value.id)
      }
    }

    return {
      user,
      petCount,
      diaryCount,
      marketCount,
      chatCount,
      representativePet,
      dailyTip,
      goToRepresentativePet,
      handleSearch,
      // 날씨 관련
      weatherData,
      weatherLoading,
      weatherError,
      locationLoading,
      getUserLocation,
      refreshWeather,
      getWeatherDescription,
      // AI 팁 관련
      tipLoading,
      tipError,
      lastTipUpdate,
      refreshAITip,
      aiTipStore
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #FFFAF0 0%, #FFF7EC 100%);
  min-height: 100vh;
  padding: 24px;
}



.main-content-card {
  background: #FFFFFF !important;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 32px;
}

/* 인사말 섹션 */
.greeting-section {
  margin-bottom: 32px;
  text-align: center;
}

.greeting-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px; /* 텍스트와 이미지 사이 간격 */
}

.greeting-text {
  flex: 1; /* 텍스트 영역을 차지하도록 */
  text-align: left;
}

.greeting-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  padding: 0;
}

.greeting-subtitle {
  font-size: 1rem;
  color: #6B7280;
  margin-top: 8px;
}

.representative-pet-avatar {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

/* .representative-pet-avatar:hover {
  transform: scale(1.05);
} */

.pet-avatar {
  border: 4px solid #FF8B8B; /* 테두리 두께 조정 */
  box-shadow: 0 4px 15px rgba(255, 139, 139, 0.3); /* 그림자 효과 */
}

.pet-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #FF8B8B;
  color: white;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.3);
  z-index: 1;
}

/* 통계 섹션 */
.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:active {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-title {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: white !important;
  margin-bottom: 8px !important;
  padding: 0 !important;
  text-align: center;
}

.stat-number {
  font-size: 2.5rem !important;
  font-weight: 700 !important;
  color: white !important;
  margin: 0 !important;
  padding: 0 !important;
  text-align: center;
}

/* 팔레트 색상 적용 */
.stat-pet {
  background: linear-gradient(135deg, #FF8B8B 0%, #FF6B6B 100%) !important;
}

.stat-diary {
  background: linear-gradient(135deg, #4ADE80 0%, #22C55E 100%) !important;
}

.stat-market {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%) !important;
}

.stat-chat {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
}

/* 구분선 */
.section-divider {
  margin: 32px 0;
  border-color: rgba(0, 0, 0, 0.25);
  border-width: 1px;
}

/* 활동 섹션 */
.activity-section {
  margin-top: 32px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 20px;
  padding: 0;
  text-align: left;
}

.activity-list {
  background: transparent;
}

.activity-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.2s ease;
  padding: 16px 20px;
  align-items: flex-start;
}

.activity-item:hover {
  background: rgba(255, 139, 139, 0.06);
}

/* 이번 주 요약 섹션 */
.weekly-summary-section {
  margin-top: 32px;
}

.summary-item {
  text-align: center;
  padding: 20px;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.summary-item:hover {
  background: #F1F5F9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-number {
  font-size: 2rem;
  font-weight: 700;
  color: #FF8B8B;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 0.875rem;
  color: #64748B;
  font-weight: 500;
}

/* 인사이트 섹션 */
.today-tasks-section {
  margin-top: 32px;
}

/* 인사이트 카드 */
.insight-card {
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  height: 100%;
}

.insight-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.insight-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1E293B;
  margin-left: 12px;
}

.insight-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-item {
  padding: 12px;
  background: #F8FAFC;
  border-radius: 8px;
  border-left: 3px solid #4ADE80;
}

.insight-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.insight-value {
  font-size: 0.875rem;
  color: #1E293B;
  font-weight: 500;
  line-height: 1.4;
}

/* 인사이트 카드 */
.insight-card {
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.insight-card:last-child {
  margin-bottom: 0;
}

.insight-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.insight-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  margin-left: 12px;
}



/* 날씨 상세 정보 */
.weather-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weather-main-info {
  text-align: center;
}

.weather-temp-large {
  font-size: 2rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 4px;
}

.weather-desc {
  font-size: 0.875rem;
  color: #6B7280;
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
  padding: 4px 0;
}

.detail-label {
  font-size: 0.75rem;
  color: #6B7280;
}

.detail-value {
  font-size: 0.875rem;
  color: #1E293B;
  font-weight: 500;
}

/* 팁 콘텐츠 */
.tip-content {
  padding: 12px;
  background: #FEF3C7;
  border-radius: 8px;
  border-left: 3px solid #F59E0B;
  text-align: left;
}

.tip-text {
  font-size: 0.875rem;
  color: #92400E;
  line-height: 1.5;
  margin-bottom: 8px;
}

.tip-source {
  font-size: 0.75rem;
  color: #B45309;
  font-style: italic;
  margin-bottom: 4px;
}

.tip-timestamp {
  font-size: 0.7rem;
  color: #A78B5B;
  font-style: italic;
}

.tip-ai-badge {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

/* AI 팁 관련 스타일 */
.tip-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6B7280;
}

.tip-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #EF4444;
  flex-wrap: wrap;
  gap: 8px;
}

/* 팁 액션 버튼 스타일 */
.tip-action-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s ease !important;
  color: white !important;
}

.tip-action-btn :deep(.v-btn__content) {
  color: white !important;
}

.tip-action-btn:hover {
  transform: translateY(-2px) !important;
}

.tip-action-btn:active {
  transform: translateY(0) !important;
}

.tip-action-btn :deep(.v-btn__prepend) {
  margin-inline-end: 6px !important;
}

/* 날씨 관련 스타일 */
.weather-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6B7280;
}

.weather-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #EF4444;
  flex-wrap: wrap;
  gap: 8px;
}

.weather-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9CA3AF;
  text-align: center;
}

.weather-location {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 4px;
}

/* 날씨 액션 버튼 스타일 */
.weather-action-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s ease !important;
  color: white !important;
}

.weather-action-btn :deep(.v-btn__content) {
  color: white !important;
}

.weather-action-btn:hover {
  transform: translateY(-2px) !important;
}

.weather-action-btn:active {
  transform: translateY(0) !important;
}

.weather-action-btn :deep(.v-btn__prepend) {
  margin-inline-end: 6px !important;
}





.activity-item :deep(.v-list-item__prepend) {
  margin-right: 16px;
  margin-top: 2px;
}

.activity-item :deep(.v-list-item__content) {
  padding: 0;
}

.activity-item :deep(.v-list-item-title) {
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 4px;
  line-height: 1.4;
}

.activity-item :deep(.v-list-item-subtitle) {
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.3;
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .main-content-card {
    padding: 24px;
  }
  
  .greeting-title {
    font-size: 1.75rem;
  }
  
  .greeting-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .greeting-text {
    text-align: center;
  }
  
  .representative-pet-avatar {
    order: -1; /* 모바일에서는 이미지를 위에 배치 */
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-number {
    font-size: 2rem !important;
  }

  /* 모바일에서 인사이트 섹션 조정 */
  .today-tasks-section .v-row {
    flex-direction: column;
  }

  .insight-card {
    margin-bottom: 16px;
  }

  .weather-detail {
    flex-direction: column;
    gap: 16px;
  }

  .weather-details {
    flex-direction: row;
    justify-content: space-around;
  }

  .community-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .main-content-card {
    padding: 20px;
  }
  
  .greeting-title {
    font-size: 1.5rem;
  }
  
  .greeting-subtitle {
    font-size: 0.875rem;
  }
  
  .representative-pet-avatar .pet-avatar {
    width: 80px !important;
    height: 80px !important;
  }
  
  .section-divider {
    margin: 24px 0;
  }

  /* 작은 모바일에서 추가 조정 */
  .stat-card {
    padding: 16px;
  }

  .stat-number {
    font-size: 1.75rem !important;
  }

  .weather-temp-large {
    font-size: 1.5rem;
  }

  .community-stats {
    grid-template-columns: 1fr;
  }


}
</style>
