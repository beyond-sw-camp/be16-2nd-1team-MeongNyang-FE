<template>
  <v-app>
    <HeaderComponent />
    
    <v-main>
      <router-view />
    </v-main>
    
    <!-- <FooterComponent v-if="!isChatPage" /> -->
    
    <!-- 전역 UI 컴포넌트들 -->
    <GlobalSnackbar
      v-model="uiStore.snackbar.show"
      :title="uiStore.snackbar.title"
      :message="uiStore.snackbar.message"
      :type="uiStore.snackbar.type"
      :timeout="uiStore.snackbar.timeout"
      :actions="uiStore.snackbar.actions"
      @close="uiStore.handleSnackbarClose"
      @action="uiStore.handleSnackbarAction"
    />
    
    <GlobalLoadingOverlay
      v-model="uiStore.loadingOverlay.show"
      :title="uiStore.loadingOverlay.title"
      :message="uiStore.loadingOverlay.message"
      :progress="uiStore.loadingOverlay.progress"
      :show-progress="uiStore.loadingOverlay.showProgress"
      :show-cancel-button="uiStore.loadingOverlay.showCancelButton"
      @cancel="uiStore.handleLoadingCancel"
    />
  </v-app>
</template>

<script>
import { useUIStore } from './stores/ui'
import { useSseStore } from './stores/sse'
import { useAuthStore } from './stores/auth'
import { useAlarmStore } from './stores/alarm'
import HeaderComponent from './components/HeaderComponent.vue'
// import FooterComponent from './components/FooterComponent.vue'
import GlobalSnackbar from './components/ui/global/GlobalSnackbar.vue'
import GlobalLoadingOverlay from './components/ui/global/GlobalLoadingOverlay.vue'
import { onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    // FooterComponent,
    GlobalSnackbar,
    GlobalLoadingOverlay
  },
  setup() {
    const uiStore = useUIStore()
    const sseStore = useSseStore()
    const authStore = useAuthStore()
    const alarmStore = useAlarmStore()
    
    // SSE 연결 설정
    const setupSse = async () => {
      try {
        await sseStore.connect()
        console.log('SSE connection established in App.vue')
      } catch (error) {
        console.error('Failed to establish SSE connection:', error)
      }
    }
    
    // SSE 연결 해제
    const cleanupSse = () => {
      sseStore.disconnect()
      console.log('SSE connection cleaned up in App.vue')
    }
    
    // 알림 초기 로드
    const loadInitialAlarms = async () => {
      if (authStore.isAuthenticated) {
        try {
          await alarmStore.fetchAlarms()
          console.log('초기 알림 로드 완료')
        } catch (error) {
          console.error('초기 알림 로드 실패:', error)
        }
      }
    }
    
    // 인증 상태 변경 감지하여 알림 로드
    watch(() => authStore.isAuthenticated, (isAuthenticated) => {
      if (isAuthenticated) {
        loadInitialAlarms()
      }
    }, { immediate: true })
    
    // 컴포넌트 마운트 시 초기화
    onMounted(async () => {
      // 인증 초기화
      await authStore.initialize()
      
      // SSE 연결
      setupSse()
      
      // 로그인된 상태라면 알림 로드
      if (authStore.isAuthenticated) {
        loadInitialAlarms()
      }
    })
    
    // 컴포넌트 언마운트 시 SSE 연결 해제
    onUnmounted(() => {
      cleanupSse()
    })
    
    return {
      uiStore
    }
  }
}
</script>

<style>
#app, html, body {
  background-color: #FFFAF0; /* 상아색 전역 배경 */
}

/* Vuetify 루트와 메인 영역에도 동일하게 적용 */
.v-application {
  background-color: #FFFAF0 !important;
}

.v-main {
  background-color: transparent !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
