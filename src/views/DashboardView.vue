<template>
  <v-container fluid>
    <v-row>
      <!-- 사이드바 -->
      <v-col cols="12" md="3" lg="2">
        <v-card class="pa-4">
          <v-list>
            <v-list-item
              v-for="item in menuItems"
              :key="item.title"
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              class="mb-2"
            />
          </v-list>
        </v-card>
      </v-col>
      
      <!-- 메인 콘텐츠 -->
      <v-col cols="12" md="9" lg="10">
        <v-card class="pa-6">
          <v-card-title class="text-h4 mb-6">
            안녕하세요, {{ user?.nickname || '사용자' }}님! 🐕🐱
          </v-card-title>
          
          <!-- 통계 카드들 -->
          <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
              <v-card color="primary" class="pa-4 text-center">
                <v-card-title class="text-h6 text-white">
                  내 반려동물
                </v-card-title>
                <v-card-text class="text-h4 text-white">
                  {{ petCount }}
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card color="secondary" class="pa-4 text-center">
                <v-card-title class="text-h6 text-white">
                  작성한 다이어리
                </v-card-title>
                <v-card-text class="text-h4 text-white">
                  {{ diaryCount }}
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card color="success" class="pa-4 text-center">
                <v-card-title class="text-h6 text-white">
                  마켓 게시글
                </v-card-title>
                <v-card-text class="text-h4 text-white">
                  {{ marketCount }}
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card color="info" class="pa-4 text-center">
                <v-card-title class="text-h6 text-white">
                  채팅방
                </v-card-title>
                <v-card-text class="text-h4 text-white">
                  {{ chatCount }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- 최근 활동 -->
          <v-card-title class="text-h5 mb-4">
            최근 활동
          </v-card-title>
          
          <v-list>
            <v-list-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :prepend-icon="activity.icon"
              :title="activity.title"
              :subtitle="activity.subtitle"
            />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

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
    
    // 임시 데이터 (나중에 실제 API로 교체)
    const petCount = ref(2)
    const diaryCount = ref(15)
    const marketCount = ref(3)
    const chatCount = ref(5)
    
    const recentActivities = ref([
      {
        id: 1,
        icon: 'mdi-paw',
        title: '새로운 반려동물 등록',
        subtitle: '2시간 전'
      },
      {
        id: 2,
        icon: 'mdi-book-open',
        title: '다이어리 작성',
        subtitle: '1일 전'
      },
      {
        id: 3,
        icon: 'mdi-store',
        title: '마켓 게시글 작성',
        subtitle: '2일 전'
      }
    ])
    
    return {
      user,
      menuItems,
      petCount,
      diaryCount,
      marketCount,
      chatCount,
      recentActivities
    }
  }
}
</script>
