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
        max-width="480"
        persistent
        class="social-duplicate-modal"
        :retain-focus="false"
      >
        <v-card class="social-duplicate-card" elevation="24" rounded="xl">
          <!-- 헤더 -->
          <div class="modal-header">
            <div class="header-icon">
              <v-icon size="28" color="white">mdi-account-alert</v-icon>
            </div>
            <v-btn
              icon
              variant="text"
              @click="handleSocialDuplicateClose"
              class="modal-close-btn"
            >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- 컨텐츠 -->
          <div class="modal-content">
            <h3 class="modal-title">계정 중복 발견</h3>
            
            <div class="modal-spacer"></div>
            
            <div class="info-box">
              <div class="info-icon">
                <v-icon size="20" color="#FF8B8B">mdi-information</v-icon>
              </div>
              <div class="info-content">
                <div class="info-title">이미 가입된 계정이 있어요!</div>
                <div class="info-text">다른 소셜 로그인 버튼을 눌러서 로그인해주세요.</div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="modal-actions">
            <v-btn
              color="#6366f1"
              block
              size="large"
              @click="handleSocialDuplicateLogin"
              height="52"
              rounded="lg"
              class="primary-btn"
              elevation="0"
            >
              <v-icon start size="20">mdi-login</v-icon>
              로그인으로 이동
            </v-btn>
            
            <v-btn
              variant="text"
              block
              size="large"
              @click="handleSocialDuplicateClose"
              height="44"
              rounded="lg"
              color="#6b7280"
              class="secondary-btn"
            >
              닫기
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
        
        <!-- 삭제된 계정 모달 -->
        <v-dialog
          v-model="showDeletedAccountModal"
          max-width="480"
          persistent
          class="deleted-account-modal"
          :retain-focus="false"
          :transition="false"
          :overlay="false"
        >
          <v-card class="auth-modal-card" elevation="24" rounded="xl">
            <v-card-title class="auth-modal-header pa-8 pb-4">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <!-- 헤더 제목 제거 -->
                </div>
                
                <!-- 타이틀을 헤더 중앙에 배치 -->
                <div class="auth-tabs-container">
                  <div class="deleted-account-title">
                    <v-icon size="24" color="error" class="me-2">mdi-account-remove</v-icon>
                    <span>계정 삭제됨</span>
                  </div>
                </div>
                
                <v-btn
                  icon
                  variant="text"
                  @click="handleDeletedAccountClose"
                  class="modal-close-btn"
                >
                  <v-icon size="20">mdi-close</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-card-text class="pa-8 pt-6">
              <div class="text-center mb-6">
                <div class="deleted-account-icon mb-3">
                  <v-icon size="32" color="white">mdi-account-remove</v-icon>
                </div>
                <h3 class="text-h6 font-weight-semibold mb-2 text-dark">계정이 삭제되었습니다</h3>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  <strong>{{ deletedAccountData?.email || '이 계정' }}</strong>은 삭제되었습니다.
                </p>
                <p v-if="deletedAccountData?.attemptedProvider" class="text-body-2 text-medium-emphasis mb-3">
                  <strong>{{ getProviderDisplayName(deletedAccountData.attemptedProvider) }}</strong>로 로그인을 시도하셨습니다.
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
                class="mb-6"
              >
                <template #prepend>
                  <v-icon size="16" color="error">mdi-information</v-icon>
                </template>
                <span class="text-caption">
                  <strong>안내:</strong> 삭제된 계정은 복구할 수 없습니다. 새로운 계정으로 가입해주세요.
                </span>
              </v-alert>

              <div class="deleted-account-actions">
                <v-btn
                  color="primary"
                  block
                  size="large"
                  @click="handleDeletedAccountRegister"
                  rounded="xl"
                  height="52"
                  class="deleted-account-primary-btn mb-3"
                  elevation="4"
                  prepend-icon="mdi-account-plus"
                >
                  새 계정 만들기
                </v-btn>
                
                <v-btn
                  variant="outlined"
                  block
                  size="large"
                  @click="handleDeletedAccountClose"
                  rounded="xl"
                  height="48"
                  color="grey-darken-1"
                  class="deleted-account-secondary-btn"
                  elevation="0"
                >
                  닫기
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>
        
        <!-- OAuth 연동 확인 모달 -->
      <v-dialog
        v-model="showOAuthLinkModal"
        max-width="480"
        persistent
        class="oauth-link-modal"
        :retain-focus="false"
      >
        <v-card class="oauth-link-card" elevation="24" rounded="xl">
          <!-- 헤더 -->
          <div class="modal-header">
            <div class="spacer"></div>
            <v-btn
              icon
              variant="text"
              @click="showOAuthLinkModal = false"
              class="modal-close-btn"
            >
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- 컨텐츠 -->
          <div class="modal-content">
            <h3 class="modal-title">계정 연동 확인</h3>
            
            <p class="modal-description">
              <strong>{{ oauthLinkData?.provider === 'google' ? 'Google' : '카카오' }}</strong> 계정으로 로그인하려고 합니다.
            </p>
            
            <div class="email-card">
              <div class="email-icon">
                <v-icon size="16" color="#FF8B8B">mdi-email</v-icon>
              </div>
              <span class="email-text">
                <strong>{{ oauthLinkData?.email }}</strong>로 이미 가입된 계정이 있습니다.
              </span>
            </div>
            
            <p class="link-question">
              두 계정을 연동하시겠습니까?
            </p>

            <!-- 정보 박스 -->
            <div class="info-box">
              <div class="info-header">
                <v-icon size="18" color="#FF8B8B">mdi-information</v-icon>
                <span>연동 후 혜택</span>
              </div>
              <div class="benefits-list">
                <div class="benefit-item">
                  <v-icon size="16" color="#10b981">mdi-check-circle</v-icon>
                  <span>{{ oauthLinkData?.provider === 'google' ? 'Google' : '카카오' }} 계정으로 간편 로그인</span>
                </div>
                <div class="benefit-item">
                  <v-icon size="16" color="#10b981">mdi-check-circle</v-icon>
                  <span>기존 데이터 모두 유지</span>
                </div>
                <div class="benefit-item">
                  <v-icon size="16" color="#10b981">mdi-check-circle</v-icon>
                  <span>보안 강화된 계정 관리</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="modal-actions">
            <v-btn
              color="#FF8B8B"
              block
              size="large"
              @click="handleOAuthLink('link')"
              height="56"
              rounded="xl"
              class="primary-btn"
              elevation="0"
            >
              <v-icon start size="20">mdi-link-variant</v-icon>
              계정 연동하기
            </v-btn>
            
            <v-btn
              variant="outlined"
              block
              size="large"
              @click="handleOAuthLink('cancel')"
              height="48"
              rounded="xl"
              class="secondary-btn"
              color="#FF8B8B"
            >
              연동하지 않기
            </v-btn>
          </div>
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
      console.log('🔍 OAuth 추가정보 모달 열기 - 디버깅 정보:')
      console.log('- 받은 데이터:', data)
      console.log('- data.provider:', data.provider)
      console.log('- data.signupTicket:', data.signupTicket)
      console.log('- data.email:', data.email)
      
      oauthExtraData.value = data
      console.log('- oauthExtraData 설정 후:', oauthExtraData.value)
      
      showOAuthExtraModal.value = true
      console.log('- showOAuthExtraModal 설정 후:', showOAuthExtraModal.value)
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

/* 계정 삭제 모달 스타일 */
.deleted-account-modal {
  backdrop-filter: blur(8px);
}

.deleted-account-modal .auth-modal-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  max-width: 520px !important;
  width: 100%;
}

.deleted-account-modal .auth-modal-header {
  background: #ffffff;
  border-bottom: none;
  box-shadow: none;
}

.deleted-account-title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.deleted-account-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.deleted-account-modal .modal-close-btn {
  color: #9ca3af !important;
  transition: none !important;
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  border-radius: 0 !important;
  min-width: auto !important;
  width: auto !important;
  height: auto !important;
  position: relative !important;
  overflow: visible !important;
}

.deleted-account-modal .modal-close-btn:hover {
  color: #6b7280 !important;
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.deleted-account-modal .modal-close-btn:active {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.deleted-account-modal .modal-close-btn:focus {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.deleted-account-modal .modal-close-btn::before {
  display: none !important;
  content: none !important;
}

.deleted-account-modal .modal-close-btn::after {
  display: none !important;
  content: none !important;
}

.deleted-account-modal .modal-close-btn .v-btn__content {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  position: relative !important;
  z-index: 1 !important;
}

.deleted-account-modal .modal-close-btn .v-btn__overlay {
  display: none !important;
  opacity: 0 !important;
  background: transparent !important;
}

.deleted-account-modal .modal-close-btn:hover .v-btn__overlay {
  display: none !important;
  opacity: 0 !important;
  background: transparent !important;
}

.deleted-account-modal .modal-close-btn:focus .v-btn__overlay {
  display: none !important;
  opacity: 0 !important;
  background: transparent !important;
}

.deleted-account-modal .modal-close-btn:active .v-btn__overlay {
  display: none !important;
  opacity: 0 !important;
  background: transparent !important;
}

.deleted-account-modal .modal-close-btn .v-btn__prepend,
.deleted-account-modal .modal-close-btn .v-btn__append {
  display: none !important;
}

.deleted-account-modal .modal-close-btn .v-btn__loader {
  display: none !important;
}

/* Vuetify 기본 스타일 완전 덮어쓰기 */
.deleted-account-modal .modal-close-btn.v-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.deleted-account-modal .modal-close-btn.v-btn:hover {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.deleted-account-modal .modal-close-btn.v-btn:focus {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.deleted-account-modal .modal-close-btn.v-btn:active {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 계정 삭제 모달 버튼 스타일 */
.deleted-account-actions {
  margin-top: 8px;
}

.deleted-account-primary-btn {
  background: #3b82f6 !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  text-transform: none !important;
  transition: background-color 0.2s ease !important;
}

.deleted-account-primary-btn:hover {
  background: #2563eb !important;
}

.deleted-account-primary-btn .v-btn__prepend .v-icon {
  margin-right: 8px !important;
  font-size: 20px !important;
}

.deleted-account-secondary-btn {
  background: #ffffff !important;
  border: 1px solid #d1d5db !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  font-size: 0.9rem !important;
  text-transform: none !important;
  transition: background-color 0.2s ease !important;
}

.deleted-account-secondary-btn:hover {
  background: #f9fafb !important;
  border-color: #9ca3af !important;
  color: #374151 !important;
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

/* 깔끔한 핑크 계열 스타일 */
.oauth-link-card {
  background: #ffffff;
  border: 1px solid rgba(255, 139, 139, 0.12);
  overflow: hidden;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  margin-bottom: 8px;
}

.spacer {
  flex: 1;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: #FFB6C1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.2);
}

.provider-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* 전역 모달 닫기 버튼 스타일 - Vuetify 완전 무력화 */
.modal-close-btn,
.modal-close-btn *,
.modal-close-btn *::before,
.modal-close-btn *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

.modal-close-btn {
  color: #9ca3af !important;
  transition: none !important;
  min-width: auto !important;
  width: auto !important;
  height: auto !important;
  position: relative !important;
  overflow: visible !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.modal-close-btn:hover,
.modal-close-btn:hover *,
.modal-close-btn:hover *::before,
.modal-close-btn:hover *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  transform: none !important;
}

.modal-close-btn:hover {
  color: #6b7280 !important;
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.modal-close-btn:active,
.modal-close-btn:active *,
.modal-close-btn:active *::before,
.modal-close-btn:active *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  transform: none !important;
}

.modal-close-btn:active {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.modal-close-btn:focus,
.modal-close-btn:focus *,
.modal-close-btn:focus *::before,
.modal-close-btn:focus *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  transform: none !important;
}

.modal-close-btn:focus {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.modal-close-btn::before,
.modal-close-btn::after {
  display: none !important;
  content: none !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.modal-close-btn .v-btn__content,
.modal-close-btn .v-btn__overlay,
.modal-close-btn .v-btn__prepend,
.modal-close-btn .v-btn__append,
.modal-close-btn .v-btn__loader {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  display: block !important;
}

.modal-close-btn .v-btn__overlay {
  opacity: 0 !important;
  display: none !important;
}

/* Vuetify 기본 스타일 완전 덮어쓰기 */
.modal-close-btn.v-btn,
.modal-close-btn.v-btn *,
.modal-close-btn.v-btn *::before,
.modal-close-btn.v-btn *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.modal-close-btn.v-btn:hover,
.modal-close-btn.v-btn:hover *,
.modal-close-btn.v-btn:hover *::before,
.modal-close-btn.v-btn:hover *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.modal-close-btn.v-btn:focus,
.modal-close-btn.v-btn:focus *,
.modal-close-btn.v-btn:focus *::before,
.modal-close-btn.v-btn:focus *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.modal-close-btn.v-btn:active,
.modal-close-btn.v-btn:active *,
.modal-close-btn.v-btn:active *::before,
.modal-close-btn.v-btn:active *::after {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 기존 close-btn 클래스는 전역 클래스로 교체 */
.close-btn {
  @extend .modal-close-btn;
}

.modal-content {
  padding: 24px 32px 32px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 0;
  line-height: 1.3;
}

.modal-spacer {
  height: 24px;
}

.provider-badge-top {
  background: #FFE812;
  color: #000000;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(255, 232, 18, 0.3);
  margin-bottom: 20px;
  align-self: flex-start;
  margin-left: 0;
}

.badge-logo-top {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.provider-text {
  color: #000000;
  font-weight: 600;
}

.provider-info {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.provider-badge {
  background: #FF8B8B;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
}

.badge-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.modal-description {
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 0.95rem;
  font-weight: 500;
}

.modal-sub-description {
  color: #4b5563;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 400;
}

.email-card {
  background: #f8fafc;
  border: 1px solid rgba(255, 139, 139, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.email-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 139, 139, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.email-text {
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
}

.email-text strong {
  color: #FF8B8B;
  font-weight: 600;
}

.link-question {
  color: #111827;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 1.125rem;
  font-weight: 600;
}

.info-box {
  background: #fef7ff;
  border: 1px solid rgba(255, 139, 139, 0.15);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #FF8B8B;
  font-size: 0.9rem;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.modal-actions {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  background: #FF8B8B !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  letter-spacing: 0.025em !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3) !important;
  border: none !important;
  text-transform: none !important;
}

.primary-btn:hover {
  background: #E87D7D !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.4) !important;
}

.primary-btn:active {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3) !important;
}

.primary-btn:disabled {
  background: #d1d5db !important;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(209, 213, 219, 0.3) !important;
  cursor: not-allowed !important;
}

.secondary-btn {
  color: #FF8B8B !important;
  border-color: #FF8B8B !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  background: white !important;
}

.secondary-btn:hover {
  background: rgba(255, 139, 139, 0.05) !important;
  border-color: #E87D7D !important;
  color: #E87D7D !important;
  transform: translateY(-1px) !important;
}

.secondary-btn:active {
  transform: translateY(0) !important;
}

.secondary-btn:disabled {
  color: #9ca3af !important;
  border-color: #d1d5db !important;
  transform: none !important;
  cursor: not-allowed !important;
}

.tertiary-btn {
  color: #9ca3af !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
  transition: all 0.2s ease !important;
  text-transform: none !important;
}

.tertiary-btn:hover {
  color: #6b7280 !important;
  background: rgba(156, 163, 175, 0.05) !important;
}

.tertiary-btn:disabled {
  color: #d1d5db !important;
  cursor: not-allowed !important;
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


.social-duplicate-card {
  background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%);
  border: 1px solid rgba(255, 139, 139, 0.1);
  overflow: hidden;
}

.social-duplicate-card .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.social-duplicate-card .header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #FF8B8B 0%, #E87D7D 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.3);
}

.social-duplicate-card .close-btn {
  color: #FF8B8B;
  transition: all 0.2s ease;
  padding: 4px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.social-duplicate-card .close-btn:hover {
  color: #E87D7D;
  background: transparent !important;
  transform: scale(1.1);
}

.social-duplicate-card .close-btn::before {
  background: transparent !important;
}

.social-duplicate-card .close-btn::after {
  background: transparent !important;
}

.social-duplicate-card .close-btn .v-btn__content {
  background: transparent !important;
}

.social-duplicate-card .close-btn .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}

.social-duplicate-card .close-btn:hover .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}

.social-duplicate-card .close-btn:focus .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}

.social-duplicate-card .close-btn:active .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}

.social-duplicate-card .modal-content {
  padding: 0 24px 24px;
}

.social-duplicate-card .modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.3;
}

.social-duplicate-card .modal-description {
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.social-duplicate-card .highlight-email {
  color: #FF8B8B;
  font-weight: 600;
}

.social-duplicate-card .info-box {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border: 1px solid rgba(255, 139, 139, 0.15);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.social-duplicate-card .info-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: rgba(255, 139, 139, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-duplicate-card .info-content {
  flex: 1;
}

.social-duplicate-card .info-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.social-duplicate-card .info-text {
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.5;
}

.social-duplicate-card .modal-actions {
  padding: 0 24px 24px;
}

.social-duplicate-card .primary-btn {
  background: linear-gradient(135deg, #FF8B8B 0%, #E87D7D 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  letter-spacing: 0.025em !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3) !important;
  border: none !important;
}

.social-duplicate-card .primary-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.4) !important;
}

.social-duplicate-card .secondary-btn {
  color: #6b7280 !important;
  font-weight: 500 !important;
  font-size: 0.9rem !important;
  transition: all 0.2s ease !important;
  margin-top: 8px !important;
}

.social-duplicate-card .secondary-btn:hover {
  color: #374151 !important;
  background: rgba(107, 114, 128, 0.1) !important;
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

/* FinalRegistrationModal 스타일 */
.final-registration-modal {
  .v-card {
    background: white !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 0 24px;
    margin-bottom: 16px;
  }

  .success-icon {
    width: 48px;
    height: 48px;
    background: #10b981 !important;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2) !important;
  }

  .success-icon .v-icon {
    color: white !important;
    font-size: 24px !important;
  }

  .modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    text-align: center;
    flex: 1;
  }

  .modal-subtitle {
    font-size: 16px;
    color: #6b7280;
    text-align: center;
    margin: 8px 0 24px 0;
  }

  .form-section {
    padding: 0 24px 24px 24px;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
  }

  .input-label .v-icon {
    margin-right: 8px;
    color: #FF8B8B;
  }

  .input-field {
    width: 100%;
  }

  .duplicate-check-section {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .duplicate-check-section .input-field {
    flex: 1;
  }

  .duplicate-check-btn {
    height: 48px !important;
    background: #6b7280 !important;
    color: white !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    box-shadow: none !important;
  }

  .duplicate-check-btn:hover {
    background: #4b5563 !important;
    box-shadow: none !important;
  }

  .submit-btn {
    width: 100%;
    height: 56px !important;
    background: #6b7280 !important;
    color: white !important;
    border-radius: 12px !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    box-shadow: none !important;
    margin-top: 8px;
  }

  .submit-btn:hover {
    background: #4b5563 !important;
    box-shadow: none !important;
  }

  .submit-btn:disabled {
    background: #d1d5db !important;
    color: #9ca3af !important;
  }

  .error-message {
    color: #ef4444;
    font-size: 14px;
    margin-top: 4px;
    display: flex;
    align-items: center;
  }

  .error-message .v-icon {
    margin-right: 4px;
    font-size: 16px;
  }
}
</style>
