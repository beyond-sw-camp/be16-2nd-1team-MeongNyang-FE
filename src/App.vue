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
    
          <!-- 플로팅 인증 모달 -->
      <FloatingAuthModal
        v-model="showAuthModal"
        :initial-tab="authModalTab"
        @success="handleAuthSuccess"
        @update:modelValue="handleAuthModalUpdate"
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
      
      <!-- OAuth 추가정보 모달 -->
      <FinalRegistrationModal
        :show="showOAuthExtraModal"
        @update:show="showOAuthExtraModal = $event"
        :email="oauthExtraData?.email || ''"
        :password="''"
        :is-oauth="true"
        :oauth-data="oauthExtraData"
        @close="handleOAuthExtraClose"
        @success="handleOAuthExtraSuccess"
      />
      
      <!-- 소셜 계정 중복 모달 -->
      <v-dialog
        v-model="showSocialDuplicateModal"
        max-width="500"
        persistent
        class="social-duplicate-modal"
        :retain-focus="false"
      >
        <v-card class="pa-6" rounded="lg">
          <v-card-title class="text-h5 text-center mb-4">
            <div class="d-flex align-center justify-center">
              <v-icon size="32" color="warning" class="me-3">
                mdi-alert-circle
              </v-icon>
              소셜 계정 중복
            </div>
          </v-card-title>

          <v-card-text class="text-center pa-0">
            <div class="mb-6 px-4">
              <p class="text-body-1 mb-3">
                <strong class="text-warning">{{ socialDuplicateData?.email }}</strong>으로 가입된 계정이 이미 존재합니다.
              </p>
              <p class="text-body-2 text-medium-emphasis">
                이미 다른 소셜 계정으로 가입되어 있어요!
              </p>
              <p class="text-body-2 text-medium-emphasis">
                다른 소셜 로그인 버튼을 눌러서 로그인해주세요.
              </p>
            </div>

            <v-alert
              type="warning"
              variant="tonal"
              density="compact"
              rounded="lg"
              class="mb-6 mx-4"
            >
              <template #prepend>
                <v-icon size="16" color="warning">mdi-information</v-icon>
              </template>
              <span class="text-caption">
                <strong>해결 방법:</strong> 기존에 가입한 소셜 계정으로 로그인하세요.
              </span>
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-0 px-4 pb-4">
            <div class="d-flex flex-column w-100">
              <v-btn
                color="primary"
                block
                size="large"
                @click="handleSocialDuplicateLogin"
                height="48"
                rounded="lg"
                class="font-weight-medium"
              >
                로그인으로 이동
              </v-btn>
              
              <v-btn
                variant="text"
                block
                size="large"
                @click="handleSocialDuplicateClose"
                height="40"
                rounded="lg"
                color="grey-darken-1"
                class="text-caption"
                style="text-decoration: underline; font-weight: 500;"
              >
                닫기
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
              </v-dialog>
        
        <!-- 삭제된 계정 모달 -->
        <v-dialog
          v-model="showDeletedAccountModal"
          max-width="500"
          persistent
          class="deleted-account-modal"
          :retain-focus="false"
        >
          <v-card class="pa-6" rounded="lg">
            <v-card-title class="text-h5 text-center mb-4">
              <div class="d-flex align-center justify-center">
                <v-icon size="32" color="error" class="me-3">
                  mdi-account-remove
                </v-icon>
                계정 삭제됨
              </div>
            </v-card-title>

            <v-card-text class="text-center pa-0">
              <div class="mb-6 px-4">
                <p class="text-body-1 mb-3">
                  <span class="text-error">😩</span>
                  <strong class="text-error">{{ deletedAccountData?.email || '이 계정' }}</strong>은 삭제되었습니다.
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  새로운 계정으로 가입해주세요!
                </p>
              </div>

              <v-alert
                type="error"
                variant="tonal"
                density="compact"
                rounded="lg"
                class="mb-6 mx-4"
              >
                <template #prepend>
                  <v-icon size="16" color="error">mdi-information</v-icon>
                </template>
                <span class="text-caption">
                  <strong>안내:</strong> 삭제된 계정은 복구할 수 없습니다. 새로운 계정으로 가입해주세요.
                </span>
              </v-alert>
            </v-card-text>

            <v-card-actions class="pa-0 px-4 pb-4">
              <div class="d-flex flex-column w-100">
                <v-btn
                  color="primary"
                  block
                  size="large"
                  @click="handleDeletedAccountRegister"
                  height="48"
                  rounded="lg"
                  class="font-weight-medium"
                >
                  새 계정 만들기
                </v-btn>
                
                <v-btn
                  variant="text"
                  block
                  size="large"
                  @click="handleDeletedAccountClose"
                  height="40"
                  rounded="lg"
                  color="grey-darken-1"
                  class="text-caption"
                  style="text-decoration: underline; font-weight: 500;"
                >
                  닫기
                </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
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
import { ref, provide, onMounted, onUnmounted, watch } from 'vue'
import { useUIStore } from './stores/ui'
import { useAuthStore } from './stores/auth'
import { userAPI } from './services/api'
import { useSseStore } from './stores/sse'
import { useAlarmStore } from './stores/alarm'
import HeaderComponent from './components/HeaderComponent.vue'
// import FooterComponent from './components/FooterComponent.vue'
import GlobalSnackbar from './components/ui/global/GlobalSnackbar.vue'
import GlobalLoadingOverlay from './components/ui/global/GlobalLoadingOverlay.vue'
import FloatingAuthModal from './components/auth/FloatingAuthModal.vue'
import OtpVerificationModal from './components/auth/OtpVerificationModal.vue'
import FinalRegistrationModal from './components/auth/FinalRegistrationModal.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    // FooterComponent,
    GlobalSnackbar,
    GlobalLoadingOverlay,
    FloatingAuthModal,
    OtpVerificationModal,
    FinalRegistrationModal
  },
  setup() {
    const uiStore = useUIStore()
    
    const authStore = useAuthStore()
    
    // 플로팅 모달 상태 관리
    const showAuthModal = ref(false)
    const authModalTab = ref('login')
    
    // OTP 모달 상태 관리
    const showOtpModal = ref(false)
    const otpModalEmail = ref('')
    const otpModalPassword = ref('')
    
    // 최종 등록 모달 상태 관리
    const showFinalRegistrationModal = ref(false)
    
    // OAuth 추가정보 모달 상태 관리
    const showOAuthExtraModal = ref(false)
    const oauthExtraData = ref(null)
    
    // OAuth 연동 모달 상태 관리
    const showOAuthLinkModal = ref(false)
    const oauthLinkData = ref(null)
    
    // 소셜 계정 중복 모달 상태 관리
    const showSocialDuplicateModal = ref(false)
    const socialDuplicateData = ref(null)
    
    // 삭제된 계정 모달 상태 관리
    const showDeletedAccountModal = ref(false)
    const deletedAccountData = ref(null)
    
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
        console.log('이메일 재전송 요청:', otpModalEmail.value)
        
        // 백엔드 API 호출하여 이메일 재전송
        const response = await fetch('/users/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: otpModalEmail.value
          })
        })
        
        const result = await response.json()
        
        if (result.isSuccess === true) {
          // 성공 메시지 표시
          uiStore.showSnackbar('알림', '인증 이메일이 재전송되었습니다.', 'info')
          console.log('✅ 이메일 재전송 성공')
        } else {
          // 실패 시 에러 메시지 표시
          const errorMsg = result.status?.message || '이메일 재전송에 실패했습니다.'
          uiStore.showSnackbar('오류', errorMsg, 'error')
          console.error('❌ 이메일 재전송 실패:', result)
        }
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
      
      // 회원가입 완료 후 화면 새로고침하여 로그인된 상태로 표시
      console.log('✅ 회원가입 완료! 화면 새로고침 중...')
      setTimeout(() => {
        window.location.href = '/'
      }, 1000) // 1초 후 새로고침 (스낵바 메시지 확인 후)
    }
    
    // OAuth 추가정보 모달 이벤트 핸들러들
    const handleOAuthExtraClose = () => {
      showOAuthExtraModal.value = false
    }
    
    const handleOAuthExtraSuccess = (result) => {
      console.log('OAuth 추가정보 성공:', result)
      showOAuthExtraModal.value = false
      
      // 성공 메시지 표시
      uiStore.showSnackbar('성공', '소셜 계정 연동이 완료되었습니다!', 'success')
      
      // 로그인 성공 후 화면 새로고침하여 로그인된 상태로 표시
      console.log('✅ OAuth 추가정보 완료! 화면 새로고침 중...')
      setTimeout(() => {
        window.location.href = '/'
      }, 1000) // 1초 후 새로고침 (스낵바 메시지 확인 후)
    }
    
    // 소셜 계정 중복 모달 이벤트 핸들러들
    const handleSocialDuplicateClose = () => {
      showSocialDuplicateModal.value = false
    }
    
    const handleSocialDuplicateLogin = () => {
      showSocialDuplicateModal.value = false
      // 로그인 모달 열기
      openAuthModal('login')
    }
    
    // 삭제된 계정 모달 이벤트 핸들러들
    const handleDeletedAccountClose = () => {
      showDeletedAccountModal.value = false
    }
    
    const handleDeletedAccountRegister = () => {
      showDeletedAccountModal.value = false
      // 회원가입 모달 열기
      openAuthModal('register')
    }
    
    const handleAuthSuccess = (type) => {
      console.log(`${type} 성공!`)
      showAuthModal.value = false
      
      // 로그인 성공 후 화면 새로고침하여 로그인된 상태로 표시
      console.log(`✅ ${type} 성공! 화면 새로고침 중...`)
      setTimeout(() => {
        window.location.href = '/'
      }, 1000) // 1초 후 새로고침 (스낵바 메시지 확인 후)
    }
    
    // 인증 모달 상태 변경 처리
    const handleAuthModalUpdate = (value) => {
      console.log('인증 모달 상태 변경:', value)
      showAuthModal.value = value
      
      // 모달이 닫힐 때 폼 초기화
      if (!value) {
        console.log('인증 모달 닫힘 - 폼 초기화')
        // 필요한 경우 여기서 추가 정리 작업 수행
      }
    }
    
    // OAuth 추가정보 모달 열기 (HomeView에서 호출)
    const openOAuthExtraModal = (data) => {
      console.log('OAuth 추가정보 모달 열기:', data)
      oauthExtraData.value = data
      showOAuthExtraModal.value = true
    }
    
    // 소셜 계정 중복 모달 열기 (HomeView에서 호출)
    const openSocialDuplicateModal = (data) => {
      console.log('소셜 계정 중복 모달 열기:', data)
      socialDuplicateData.value = data
      showSocialDuplicateModal.value = true
    }
    
    // 삭제된 계정 모달 열기 (HomeView에서 호출)
    const openDeletedAccountModal = (data) => {
      console.log('삭제된 계정 모달 열기:', data)
      deletedAccountData.value = data
      showDeletedAccountModal.value = true
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
        
        // 연동 성공 후 화면 새로고침하여 로그인된 상태로 표시
        console.log('✅ OAuth 연동 완료! 화면 새로고침 중...')
        setTimeout(() => {
          window.location.href = '/'
        }, 1000) // 1초 후 새로고침 (스낵바 메시지 확인 후)
      } catch (error) {
        console.error('❌ 소셜 로그인 연동 실패:', error)
        uiStore.showSnackbar('오류', error.message || '소셜 로그인 연동에 실패했습니다.', 'error')
      }
    }
    
    // provide를 통해 HeaderComponent에 함수 전달
    provide('openAuthModal', openAuthModal)
    provide('openOtpModal', openOtpModal)
    provide('openOAuthExtraModal', openOAuthExtraModal)
    provide('openSocialDuplicateModal', openSocialDuplicateModal)
    provide('openDeletedAccountModal', openDeletedAccountModal)
    provide('openOAuthLinkModal', openOAuthLinkModal)
    
    // 전역 함수 제공 - 라우터 가드에서 사용
    provide('showLoginModal', () => {
      openAuthModal('login')
    })
    
    // 전역 함수 제공 - HeaderComponent에서 사용
    provide('showLoginModalFromHeader', () => {
      openAuthModal('login')
    })
    const sseStore = useSseStore()
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
      uiStore,
      showAuthModal,
      authModalTab,
      showOtpModal,
      otpModalEmail,
      otpModalPassword,
      showFinalRegistrationModal,
      showOAuthExtraModal,
      oauthExtraData,
      showOAuthLinkModal,
      oauthLinkData,
      showSocialDuplicateModal,
      socialDuplicateData,
      showDeletedAccountModal,
      deletedAccountData,
      handleAuthSuccess,
      handleAuthModalUpdate,
      handleOtpBack,
      handleOtpClose,
      handleOtpSuccess,
      handleOtpResend,
      handleFinalRegistrationClose,
      handleFinalRegistrationSuccess,
      handleOAuthExtraClose,
      handleOAuthExtraSuccess,
      handleSocialDuplicateClose,
      handleSocialDuplicateLogin,
      handleDeletedAccountClose,
      handleDeletedAccountRegister,
      handleOAuthLink
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

/* 소셜 계정 중복 모달 스타일 */
.social-duplicate-modal .v-card {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.social-duplicate-modal .v-card-title {
  color: #1f2937;
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.4;
}

.social-duplicate-modal .v-card-text {
  color: #4b5563;
}

.social-duplicate-modal .v-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.025em;
}

.social-duplicate-modal .v-alert {
  border: 1px solid #fef3c7;
  background-color: #fffbeb;
}

.social-duplicate-modal .v-btn.variant-text {
  background-color: transparent !important;
  border: none !important;
  color: #6b7280 !important;
  transition: color 0.2s ease;
  min-height: 40px !important;
}

.social-duplicate-modal .v-btn.variant-text:hover {
  color: #374151 !important;
  background-color: #f3f4f6 !important;
}

.social-duplicate-modal .v-card-actions {
  margin-top: auto !important;
}

/* 삭제된 계정 모달 스타일 */
.deleted-account-modal .v-card {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.deleted-account-modal .v-card-title {
  color: #1f2937;
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.4;
}

.deleted-account-modal .v-card-text {
  color: #4b5563;
}

.deleted-account-modal .v-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.025em;
}

.deleted-account-modal .v-alert {
  border: 1px solid #fecaca;
  background-color: #fef2f2;
}

.deleted-account-modal .v-btn.variant-text {
  background-color: transparent !important;
  border: none !important;
  color: #6b7280 !important;
  transition: color 0.2s ease;
  min-height: 40px !important;
}

.deleted-account-modal .v-btn.variant-text:hover {
  color: #374151 !important;
  background-color: #f3f4f6 !important;
}

.deleted-account-modal .v-card-actions {
  margin-top: auto !important;
}
</style>
