<template>
  <div class="dashboard-container">
    <v-row>
      <!-- 사이드바 -->
      <v-col cols="12" md="3" lg="2">
        <v-card class="sidebar-card">
          <v-list>
            <v-list-item
              v-for="item in menuItems"
              :key="item.title"
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              class="sidebar-item"
            />
          </v-list>
        </v-card>
      </v-col>
      
      <!-- 메인 콘텐츠 -->
      <v-col cols="12" md="9" lg="10">
        <v-card class="main-content-card">
          <!-- 인사말 섹션 -->
          <div class="greeting-section">
            <h1 class="greeting-title">
              안녕하세요, {{ user?.nickname || '사용자' }}님! 🐕🐱
            </h1>
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
                <v-card class="stat-card stat-diary" @click="$router.push('/diary')">
                  <v-card-title class="stat-title">
                    작성한 다이어리
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
          
          <!-- 이번 주 요약 -->
          <div class="weekly-summary-section">
            <h2 class="section-title">
              이번 주 요약
            </h2>
            
            <v-row>
              <v-col cols="6" md="3">
                <div class="summary-item">
                  <div class="summary-number">{{ weeklyDiaryCount }}</div>
                  <div class="summary-label">작성한 다이어리</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="summary-item">
                  <div class="summary-number">{{ weeklyMarketCount }}</div>
                  <div class="summary-label">마켓 활동</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="summary-item">
                  <div class="summary-number">{{ weeklyChatCount }}</div>
                  <div class="summary-label">채팅 메시지</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="summary-item">
                  <div class="summary-number">{{ weeklyLoginDays }}</div>
                  <div class="summary-label">로그인 일수</div>
                </div>
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
import { useAuthStore } from '@/stores/auth'
import { postAPI, marketAPI, petAPI, chatAPI } from '@/services/api'

export default {
  name: 'DashboardView',
  setup() {
    const authStore = useAuthStore()
    
    const user = computed(() => authStore.user)
    
    const menuItems = ref([
      { title: '홈', icon: 'mdi-home', to: '/dashboard' },
      { title: '반려동물 관리', icon: 'mdi-paw', to: '/pets' },
      { title: '다이어리', icon: 'mdi-book-open', to: '/diary' },
      { title: '마켓플레이스', icon: 'mdi-store', to: '/market' },
      { title: '채팅', icon: 'mdi-chat', to: '/chat' },
      { title: '프로필', icon: 'mdi-account', to: '/profile' }
    ])
    
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
    
    // 이번 주 요약 데이터 (더미 데이터)
    const weeklyDiaryCount = ref(3)
    const weeklyMarketCount = ref(1)
    const weeklyChatCount = ref(12)
    const weeklyLoginDays = ref(5)
    
    // 컴포넌트 마운트 시 데이터 가져오기
    onMounted(() => {
      fetchPetCount()
      fetchDiaryCount()
      fetchMarketCount()
      fetchChatCount()
    })
    
    return {
      user,
      menuItems,
      petCount,
      diaryCount,
      marketCount,
      chatCount,
      weeklyDiaryCount,
      weeklyMarketCount,
      weeklyChatCount,
      weeklyLoginDays
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

.sidebar-card {
  background: #FFFFFF !important;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  height: fit-content;
}

.sidebar-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background: rgba(255, 139, 139, 0.08);
  color: #FF8B8B;
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

.greeting-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  padding: 0;
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
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-number {
    font-size: 2rem !important;
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
  
  .section-divider {
    margin: 24px 0;
  }
}
</style>
