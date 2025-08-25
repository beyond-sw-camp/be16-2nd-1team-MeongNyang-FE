<template>
  <v-app>
    <HeaderComponent />
    
    <v-main>
      <router-view />
    </v-main>
    
    <FooterComponent />
    
          <!-- 플로팅 인증 모달 -->
      <FloatingAuthModal
        v-model="showAuthModal"
        :initial-tab="authModalTab"
        @success="handleAuthSuccess"
      />
      
      <!-- OTP 인증 모달 -->
      <OtpVerificationModal
        :show="showOtpModal"
        @update:show="showOtpModal = $event"
        :email="otpModalEmail"
        @back="handleOtpBack"
        @close="handleOtpClose"
        @success="handleOtpSuccess"
        @resend="handleOtpResend"
      />
      
      <!-- 최종 등록 모달 -->
      <FinalRegistrationModal
        :show="showFinalRegistrationModal"
        @update:show="showFinalRegistrationModal = $event"
        :email="otpModalEmail"
        :password="otpModalPassword"
        @close="handleFinalRegistrationClose"
        @success="handleFinalRegistrationSuccess"
      />
      
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
import { ref, provide } from 'vue'
import { useUIStore } from './stores/ui'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import GlobalSnackbar from './components/ui/global/GlobalSnackbar.vue'
import GlobalLoadingOverlay from './components/ui/global/GlobalLoadingOverlay.vue'
import FloatingAuthModal from './components/auth/FloatingAuthModal.vue'
import OtpVerificationModal from './components/auth/OtpVerificationModal.vue'
import FinalRegistrationModal from './components/auth/FinalRegistrationModal.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
    GlobalSnackbar,
    GlobalLoadingOverlay,
    FloatingAuthModal,
    OtpVerificationModal,
    FinalRegistrationModal
  },
  setup() {
    const uiStore = useUIStore()
    
    // 플로팅 모달 상태 관리
    const showAuthModal = ref(false)
    const authModalTab = ref('login')
    
    // OTP 모달 상태 관리
    const showOtpModal = ref(false)
    const otpModalEmail = ref('')
    const otpModalPassword = ref('')
    
    // 최종 등록 모달 상태 관리
    const showFinalRegistrationModal = ref(false)
    
    // HeaderComponent에서 호출할 함수들
    const openAuthModal = (tab = 'login') => {
      authModalTab.value = tab
      showAuthModal.value = true
    }
    
    // OTP 모달 열기 (FloatingAuthModal에서 호출)
    const openOtpModal = (email, password) => {
      console.log('OTP 모달 열기:', email)
      otpModalEmail.value = email
      otpModalPassword.value = password
      showOtpModal.value = true
    }
    
    // OTP 모달 이벤트 핸들러들
    const handleOtpBack = () => {
      showOtpModal.value = false
      showAuthModal.value = true
    }
    
    const handleOtpClose = () => {
      showOtpModal.value = false
    }
    
    const handleOtpSuccess = (data) => {
      console.log('OTP 인증 성공:', data)
      showOtpModal.value = false
      showAuthModal.value = false
      
      // 최종 등록 모달 열기
      showFinalRegistrationModal.value = true
    }
    
    const handleOtpResend = async () => {
      try {
        // TODO: 백엔드 API 호출하여 이메일 재전송
        console.log('이메일 재전송 요청:', otpModalEmail.value)
        // 성공 메시지 표시
        uiStore.showSnackbar('알림', '인증 이메일이 재전송되었습니다.', 'info')
      } catch (error) {
        console.error('이메일 재전송 실패:', error)
        uiStore.showSnackbar('오류', '이메일 재전송에 실패했습니다.', 'error')
      }
    }
    
    // 최종 등록 모달 이벤트 핸들러들
    const handleFinalRegistrationClose = () => {
      showFinalRegistrationModal.value = false
    }
    
    const handleFinalRegistrationSuccess = (result) => {
      console.log('최종 등록 성공:', result)
      showFinalRegistrationModal.value = false
      
      // 성공 메시지 표시
      uiStore.showSnackbar('성공', '회원가입이 완료되었습니다!', 'success')
    }
    
    const handleAuthSuccess = (type) => {
      console.log(`${type} 성공!`)
      showAuthModal.value = false
    }
    
    // provide를 통해 HeaderComponent에 함수 전달
    provide('openAuthModal', openAuthModal)
    provide('openOtpModal', openOtpModal)
    
    return {
      uiStore,
      showAuthModal,
      authModalTab,
      showOtpModal,
      otpModalEmail,
      otpModalPassword,
      showFinalRegistrationModal,
      handleAuthSuccess,
      handleOtpBack,
      handleOtpClose,
      handleOtpSuccess,
      handleOtpResend,
      handleFinalRegistrationClose,
      handleFinalRegistrationSuccess
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
  margin-top: 60px;
}
</style>
