<template>
  <v-app>
    <HeaderComponent />
    
    <v-main>
      <router-view />
    </v-main>
    
    <!-- 맨 위로 버튼 -->
    <div 
      v-show="showScrollToTop"
      class="scroll-to-top-btn"
      @click="scrollToTop"
    >
      <v-icon size="24" color="white">mdi-chevron-up</v-icon>
    </div>
    
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
import HeaderComponent from './components/HeaderComponent.vue'
// import FooterComponent from './components/FooterComponent.vue'
import GlobalSnackbar from './components/ui/global/GlobalSnackbar.vue'
import GlobalLoadingOverlay from './components/ui/global/GlobalLoadingOverlay.vue'

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
    
    return {
      uiStore
    }
  },
  data() {
    return {
      showScrollToTop: false
    }
  },
  mounted() {
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 제거
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      // 스크롤 위치가 300px 이상일 때 버튼 표시
      this.showScrollToTop = window.scrollY > 300
    },
    scrollToTop() {
      // 부드러운 스크롤로 맨 위로 이동
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
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

/* 전역 스타일 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f5f5f5;
}

/* 맨 위로 버튼 스타일 */
.scroll-to-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  background: #FF8B8B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.3s ease forwards;
}

.scroll-to-top-btn:hover {
  background: #FF6B6B;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.4);
}

.scroll-to-top-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.3);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .scroll-to-top-btn {
    bottom: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
  }
}
</style>
