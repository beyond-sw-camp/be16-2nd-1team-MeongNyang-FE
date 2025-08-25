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
      
      <!-- OAuth 연동 확인 모달 -->
      <v-dialog
        v-model="showOAuthLinkModal"
        max-width="500"
        persistent
        class="oauth-link-modal"
        :retain-focus="false"
      >
        <v-card class="pa-6" rounded="lg" style="min-height: 400px;">
          <v-card-title class="text-h5 text-center mb-4">
            <div class="d-flex align-center justify-center">
              <img 
                v-if="oauthLinkData?.provider === 'google'"
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                class="me-3"
                style="width: 32px; height: 32px;"
              />
              <v-icon 
                v-else
                size="32" 
                color="primary" 
                class="me-3"
              >
                mdi-chat
              </v-icon>
            </div>
            계정 연동 확인
          </v-card-title>

          <v-card-text class="text-center pa-0">
            <div class="mb-6 px-4">
              <p class="text-body-1 mb-3">
                <strong class="text-primary">{{ oauthLinkData?.email }}</strong>으로 가입된 계정이 이미 존재합니다.
              </p>
              <p class="text-body-2 text-medium-emphasis">
                이 {{ oauthLinkData?.provider === 'google' ? 'Google' : '카카오' }} 계정을 기존 계정과 연동하시겠습니까?
              </p>
            </div>

            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              rounded="lg"
              class="mb-6 mx-4"
            >
              <template #prepend>
                <v-icon size="16" color="info">mdi-information</v-icon>
              </template>
              <span class="text-caption">
                <strong>연동 시:</strong> 소셜 계정으로 간편하게 로그인할 수 있습니다.
              </span>
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-0 px-4 pb-4">
            <div class="d-flex flex-column w-100">
              <v-btn
                color="primary"
                block
                size="large"
                @click="handleOAuthLink('link')"
                height="48"
                rounded="lg"
                class="font-weight-medium mb-3"
              >
                기존 계정과 연동
              </v-btn>
              
              <v-btn
                variant="text"
                block
                size="large"
                @click="handleOAuthLink('cancel')"
                height="40"
                rounded="lg"
                color="grey-darken-1"
                class="text-caption"
                style="text-decoration: underline; font-weight: 500;"
              >
                연동하지 않겠습니다
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
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
import { useRouter } from 'vue-router'
import { useUIStore } from './stores/ui'
import { useAuthStore } from './stores/auth'
import { userAPI } from './services/api'
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
    const authStore = useAuthStore()
    const router = useRouter()
    
    // 플로팅 모달 상태 관리
    const showAuthModal = ref(false)
    const authModalTab = ref('login')
    
    // OTP 모달 상태 관리
    const showOtpModal = ref(false)
    const otpModalEmail = ref('')
    const otpModalPassword = ref('')
    
    // 최종 등록 모달 상태 관리
    const showFinalRegistrationModal = ref(false)
    
    // OAuth 연동 모달 상태 관리
    const showOAuthLinkModal = ref(false)
    const oauthLinkData = ref(null)
    
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
    
    // OAuth 연동 모달 열기 (HomeView에서 호출)
    const openOAuthLinkModal = (data) => {
      console.log('OAuth 연동 모달 열기:', data)
      console.log('showOAuthLinkModal 변경 전:', showOAuthLinkModal.value)
      // OAuth 연동 모달 데이터 설정 및 표시
      oauthLinkData.value = data
      showOAuthLinkModal.value = true
      console.log('showOAuthLinkModal 변경 후:', showOAuthLinkModal.value)
      console.log('oauthLinkData 설정됨:', oauthLinkData.value)
    }
    
    // OAuth 연동 처리
    const handleOAuthLink = async (action) => {
      try {
        if (action === 'link') {
          // 기존 계정과 연동
          console.log('🔗 기존 계정과 연동 처리 시작')
          console.log('연동 데이터:', oauthLinkData.value)
          
          const response = await userAPI.confirmLink(oauthLinkData.value.linkTicket)
          console.log('연동 API 응답:', response)
          
          if (response.data.isSuccess) {
            // 연동 성공 시 토큰 저장 및 로그인 처리
            const { accessToken, refreshToken } = response.data.data
            console.log('연동 성공, 토큰 받음:', { accessToken: accessToken ? '있음' : '없음', refreshToken: refreshToken ? '있음' : '없음' })
            
            // 토큰 저장 및 사용자 정보 설정
            authStore.accessToken = accessToken
            if (refreshToken) authStore.refreshToken = refreshToken
            
            // 사용자 정보 가져오기
            try {
              await authStore.getCurrentUser()
              uiStore.showSnackbar('성공', '계정이 성공적으로 연동되었습니다!', 'success')
            } catch (userError) {
              console.error('사용자 정보 가져오기 실패:', userError)
              uiStore.showSnackbar('성공', '계정이 연동되었습니다!', 'success')
            }
          } else {
            throw new Error(response.data.message || '연동에 실패했습니다.')
          }
        } else if (action === 'cancel') {
          // 연동 취소
          console.log('❌ 연동 취소')
          uiStore.showSnackbar('알림', '연동을 취소했습니다.', 'info')
        } else {
          // 새 계정 생성
          console.log('🆕 새 계정 생성 처리')
          // TODO: 백엔드 API 호출하여 새 계정 생성
          uiStore.showSnackbar('성공', '새 계정이 생성되었습니다!', 'success')
        }
        
        showOAuthLinkModal.value = false
        oauthLinkData.value = null
        
        // 홈 화면으로 이동
        router.push('/')
      } catch (error) {
        console.error('❌ 소셜 로그인 연동 실패:', error)
        uiStore.showSnackbar('오류', error.message || '소셜 로그인 연동에 실패했습니다.', 'error')
      }
    }
    
    // provide를 통해 HeaderComponent에 함수 전달
    provide('openAuthModal', openAuthModal)
    provide('openOtpModal', openOtpModal)
    provide('openOAuthLinkModal', openOAuthLinkModal)
    
    return {
      uiStore,
      showAuthModal,
      authModalTab,
      showOtpModal,
      otpModalEmail,
      otpModalPassword,
      showFinalRegistrationModal,
      showOAuthLinkModal,
      oauthLinkData,
      handleAuthSuccess,
      handleOtpBack,
      handleOtpClose,
      handleOtpSuccess,
      handleOtpResend,
      handleFinalRegistrationClose,
      handleFinalRegistrationSuccess,
      handleOAuthLink
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

/* OAuth 연동 모달 스타일 */
.oauth-link-modal .v-card {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.oauth-link-modal .v-card-title {
  color: #1f2937;
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.4;
}

.oauth-link-modal .v-card-text {
  color: #4b5563;
}

.oauth-link-modal .v-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.025em;
}

.oauth-link-modal .v-alert {
  border: 1px solid #dbeafe;
  background-color: #eff6ff;
}

.oauth-link-modal .v-btn.variant-text {
  background-color: transparent !important;
  border: none !important;
  color: #6b7280 !important;
  transition: color 0.2s ease;
  min-height: 40px !important;
}

.oauth-link-modal .v-btn.variant-text:hover {
  color: #374151 !important;
  background-color: #f3f4f6 !important;
}

.oauth-link-modal .v-card-actions {
  margin-top: auto !important;
}
</style>
