<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="oauth-link-card" elevation="24" rounded="xl">
          <!-- 헤더 -->
          <div class="modal-header">
            <div class="header-icon">
              <img 
                v-if="provider === 'kakao'" 
                src="@/assets/kakao_login.png" 
                alt="Kakao" 
                class="provider-logo"
              />
              <img 
                v-else-if="provider === 'google'" 
                src="@/assets/google_login.png" 
                alt="Google" 
                class="provider-logo"
              />
              <v-icon v-else size="24" color="white">mdi-link-variant</v-icon>
            </div>
            <v-btn
              icon
              variant="text"
              @click="goLogin"
              class="close-btn"
            >
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- 컨텐츠 -->
          <div class="modal-content">
            <h3 class="modal-title">계정 연동 확인</h3>
            
            <div class="provider-info">
              <div class="provider-badge">
                <img 
                  v-if="provider === 'kakao'" 
                  src="@/assets/kakao_login.png" 
                  alt="Kakao" 
                  class="badge-logo"
                />
                <img 
                  v-else-if="provider === 'google'" 
                  src="@/assets/google_login.png" 
                  alt="Google" 
                  class="badge-logo"
                />
                <v-icon v-else size="16" color="white">mdi-account</v-icon>
                <span>{{ providerLabel }}</span>
              </div>
            </div>
            
            <p class="modal-description">
              <strong>{{ providerLabel }}</strong> 계정으로 로그인하려고 합니다.
            </p>
            
            <div class="email-card">
              <div class="email-icon">
                <v-icon size="16" color="#FF8B8B">mdi-email</v-icon>
              </div>
              <span class="email-text">
                <strong>{{ email }}</strong>로 이미 가입된 계정이 있습니다.
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
                  <span>{{ providerLabel }} 계정으로 간편 로그인</span>
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
              :loading="loading"
              @click="handleConfirm"
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
              :disabled="loading"
              @click="handleReject"
              height="48"
              rounded="xl"
              class="secondary-btn"
              color="#FF8B8B"
            >
              연동하지 않기
            </v-btn>
            
            <v-btn
              variant="text"
              block
              size="large"
              :disabled="loading"
              @click="goLogin"
              height="40"
              rounded="lg"
              class="tertiary-btn"
              color="#9ca3af"
            >
              다른 방법으로 로그인
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { saveTokens } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const email = ref('')
const provider = ref('')
const linkTicket = ref('')

// 프로바이더 라벨
const providerLabel = computed(() => {
  switch (provider.value?.toLowerCase()) {
    case 'google': return 'Google'
    case 'kakao': return 'Kakao'
    default: return '소셜'
  }
})

onMounted(() => {
  // URL 쿼리에서 데이터 추출
  email.value = route.query.email || ''
  provider.value = route.query.provider || ''
  linkTicket.value = route.query.linkTicket || ''
  
  // 필수 데이터 검증
  if (!email.value || !provider.value || !linkTicket.value) {
    console.error('Missing required data for account linking')
    router.replace({ 
      name: 'Home',
      query: { showLogin: 'true' }
    })
    return
  }
})

// 연동 동의
const handleConfirm = async () => {
  if (!linkTicket.value) return
  
  loading.value = true
  try {
    const { data, headers } = await userAPI.confirmLink(linkTicket.value)
    const payload = data?.data ?? data
    
    // 토큰 저장 및 로그인 처리
    const at = payload?.accessToken || data?.accessToken
    const rt = headers?.['x-refresh-token']
    
    if (at) {
      saveTokens(at, rt)
      auth.accessToken = at
      if (rt) auth.refreshToken = rt
      
      // 사용자 정보 가져오기
      try {
        await auth.getCurrentUser()
      } catch (e) {
        console.warn('Failed to get current user:', e)
      }
      
      // 홈으로 이동
      router.replace({ name: 'Home' })
    } else {
      throw new Error('No access token received')
    }
  } catch (e) {
    console.error('Account linking failed:', e)
    
    const status = e?.response?.status
    const msg = e?.response?.data?.message || e?.message || '계정 연동에 실패했습니다.'
    
    // 400: IllegalArgumentException, EntityExistsException
    if (status === 400) {
      // 삭제된 계정
      if (msg.includes('사용하지 않는 계정')) {
        alert('😔 이 계정은 삭제되었습니다.\n\n새로운 계정으로 가입해주세요!')
        router.replace({ name: 'Register' })
        return
      }
      
      // 잠긴 계정
      if (msg.includes('잠긴 계정')) {
        alert('🔒 계정이 일시적으로 잠겨있습니다.\n\n계정 잠금 해제를 통해 다시 이용하실 수 있습니다.')
        router.replace({ name: 'UnlockAccount' })
        return
      }
      
      // EntityExistsException - 이미 연동된 계정
      if (msg.includes('이미 다른 방식으로 연동') || msg.includes('이미 소셜 연동')) {
        alert('🔗 이미 다른 소셜 계정으로 연동되어 있어요!\n\n기존 소셜 계정으로 로그인해주세요.')
      } else {
        alert('❌ 계정 연동이 불가능합니다.\n\n다른 방법으로 로그인해주세요.')
      }
    } 
    // 401: 토큰 만료
    else if (status === 401) {
      alert('⏰ 연동 요청 시간이 만료되었습니다.\n\n처음부터 다시 로그인해주세요.')
    }
    // 403: 권한 오류
    else if (status === 403) {
      alert('🚫 연동 권한이 없습니다.\n\n관리자에게 문의해주세요.')
    }
    // 404: 찾을 수 없음
    else if (status === 404) {
      alert('❓ 연동 정보를 찾을 수 없습니다.\n\n다시 로그인해주세요.')
    }
    // 500: 서버 오류
    else if (status === 500) {
      alert('🛠️ 서버에 일시적인 문제가 발생했습니다.\n\n잠시 후 다시 시도해주세요.')
    }
    // 기타 오류
    else {
      alert(`💭 계정 연동에 문제가 생겼어요.\n\n${msg || '다시 시도해주세요!'}`)
    }
    
    router.replace({ 
      name: 'Home',
      query: { showLogin: 'true' }
    })
  } finally {
    loading.value = false
  }
}

// 연동 거부
const handleReject = () => {
  if (confirm('연동을 거부하시겠습니까? 로그인 화면으로 돌아갑니다.')) {
    goLogin()
  }
}

// 로그인 화면으로 이동
const goLogin = () => {
  router.replace({ 
    name: 'Home',
    query: { showLogin: 'true' }
  })
}
</script>

<style scoped>
.fill-height { min-height: 70vh; }

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

.header-icon {
  width: 48px;
  height: 48px;
  background: #FF8B8B;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
}

.provider-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.close-btn {
  color: #9ca3af;
  transition: all 0.2s ease;
  padding: 8px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  border-radius: 8px;
}

.close-btn:hover {
  color: #6b7280;
  background: rgba(156, 163, 175, 0.1) !important;
  transform: scale(1.05);
}

.close-btn::before {
  background: transparent !important;
  border: none !important;
  outline: none !important;
}

.close-btn::after {
  background: transparent !important;
  border: none !important;
  outline: none !important;
}

.close-btn .v-btn__content {
  background: transparent !important;
  border: none !important;
  outline: none !important;
}

.close-btn .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
  border: none !important;
  outline: none !important;
}

.close-btn:hover .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
  border: none !important;
  outline: none !important;
}

.close-btn:focus .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
  border: none !important;
  outline: none !important;
}

.close-btn:active .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
  border: none !important;
  outline: none !important;
}

.close-btn:focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.modal-content {
  padding: 0 24px 24px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.3;
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
  padding: 20px;
  margin-bottom: 24px;
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
</style>
