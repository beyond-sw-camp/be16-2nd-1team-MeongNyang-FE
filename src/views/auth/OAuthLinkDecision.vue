<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h5 text-center mb-4">
            계정 연동 확인
          </v-card-title>
          
          <v-card-text class="text-center mb-6">
            <v-icon size="64" color="info" class="mb-3">mdi-account-link</v-icon>
            <p class="text-body-1 mb-2">
              <strong>{{ providerLabel }}</strong> 계정으로 로그인하려고 합니다.
            </p>
            <p class="text-body-2 text-medium-emphasis">
              이 이메일(<strong>{{ email }}</strong>)로 이미 가입된 계정이 있습니다.
            </p>
            <p class="text-body-2 text-medium-emphasis">
              두 계정을 연동하시겠습니까?
            </p>
          </v-card-text>

          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-6"
          >
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div>
              <strong>연동 후에는:</strong>
              <ul class="mt-2 mb-0">
                <li>{{ providerLabel }} 계정으로 로그인할 수 있습니다</li>
                <li>기존 비밀번호는 더 이상 사용할 수 없습니다</li>
                <li>모든 데이터는 그대로 유지됩니다</li>
              </ul>
            </div>
          </v-alert>

          <v-card-actions class="justify-space-between">
            <v-btn
              variant="outlined"
              color="error"
              :disabled="loading"
              @click="handleReject"
            >
              연동 거부
            </v-btn>
            
            <v-btn
              color="primary"
              :loading="loading"
              @click="handleConfirm"
            >
              연동 동의
            </v-btn>
          </v-card-actions>

          <v-card-actions class="justify-center">
            <v-btn
              variant="text"
              color="secondary"
              :disabled="loading"
              @click="goLogin"
            >
              로그인 화면으로 돌아가기
            </v-btn>
          </v-card-actions>
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
    router.replace({ name: 'Login' })
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
    
    router.replace({ name: 'Login' })
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
  router.replace({ name: 'Login' })
}
</script>

<style scoped>
.fill-height { min-height: 70vh; }
</style>
