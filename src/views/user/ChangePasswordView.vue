<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- 소셜 로그인 사용자 접근 차단 -->
        <v-card v-if="!canAccessPasswordChange" class="pa-6">
          <v-card-title class="text-h4 text-center mb-6 text-error">
            <v-icon start color="error">mdi-lock-off</v-icon>
            접근 불가
          </v-card-title>
          <v-card-text class="text-center">
            <v-icon size="64" color="error" class="mb-4">mdi-account-lock</v-icon>
            <div class="text-h6 mb-3">소셜 로그인 사용자입니다</div>
            <p class="text-body-1 text-medium-emphasis">
              {{ providerLabel }}로 로그인한 계정은 비밀번호 변경이 불가능합니다.
            </p>
            <p class="text-body-2 text-medium-emphasis mt-2">
              계정 보안을 위해 {{ providerLabel }} 계정의 보안 설정을 확인해주세요.
            </p>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn color="primary" @click="$router.push('/profile')">
              프로필로 돌아가기
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- 일반 로그인 사용자용 비밀번호 변경 폼 -->
        <v-card v-else class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            비밀번호 변경
          </v-card-title>
          
          <v-form ref="formRef" @submit.prevent="handleSubmit">
            <v-row>
              <!-- 기존 비밀번호 -->
              <v-col cols="12">
                <v-text-field
                  v-model="form.oldPassword"
                  label="기존 비밀번호 *"
                  type="password"
                  placeholder="현재 비밀번호를 입력하세요"
                  :rules="oldPasswordRules"
                  required
                  prepend-icon="mdi-lock"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <!-- 새 비밀번호 -->
              <v-col cols="12">
                <v-text-field
                  v-model="form.newPassword"
                  label="새 비밀번호 *"
                  type="password"
                  placeholder="새 비밀번호를 입력하세요"
                  :rules="newPasswordRules"
                  required
                  prepend-icon="mdi-lock-plus"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <!-- 새 비밀번호 확인 -->
              <v-col cols="12">
                <v-text-field
                  v-model="form.confirmPassword"
                  label="새 비밀번호 확인 *"
                  type="password"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  :rules="confirmPasswordRules"
                  required
                  prepend-icon="mdi-lock-check"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <!-- 제출 버튼 -->
            <v-card-actions class="justify-center mt-6">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="loading"
                :disabled="!canSubmit"
              >
                <v-icon start>mdi-check</v-icon>
                비밀번호 변경
              </v-btn>
            </v-card-actions>
          </v-form>

          <!-- 안내 메시지 -->
          <v-alert type="info" variant="tonal" density="comfortable" class="mt-6">
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div>
              <strong>비밀번호 변경 안내</strong>
              <ul class="mt-2 mb-0">
                <li>새 비밀번호는 8자 이상이어야 합니다</li>
                <li>영문과 숫자를 포함해야 합니다</li>
                <li>변경 후에는 새 비밀번호로 로그인해야 합니다</li>
              </ul>
            </div>
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <!-- 성공 메시지 -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        비밀번호가 성공적으로 변경되었습니다!
      </div>
    </v-snackbar>

    <!-- 에러 메시지 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '@/services/api'
import { inject } from 'vue'

const router = useRouter()
const userProfile = ref(null) // To store user's socialType

// 인증 상태 확인을 위한 함수
const checkAuthStatus = () => {
  // localStorage에서 토큰 확인
  const token = localStorage.getItem('accessToken')
  return !!token
}

// 폼 관련
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const formRef = ref(null)
const loading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// 소셜 로그인 사용자 접근 차단
const canAccessPasswordChange = computed(() => {
  return userProfile.value?.socialType === 'COMMON'
})

// 프로바이더 라벨
const providerLabel = computed(() => {
  if (!userProfile.value?.socialType) return '소셜'
  switch (userProfile.value.socialType.toUpperCase()) {
    case 'GOOGLE': return 'Google'
    case 'KAKAO': return 'Kakao'
    default: return '소셜'
  }
})

// 제출 가능 여부
const canSubmit = computed(() => {
  return form.oldPassword && form.newPassword && form.confirmPassword && 
         form.newPassword === form.confirmPassword
})

// 비밀번호 유효성 검사 규칙
const oldPasswordRules = [
  v => !!v || '기존 비밀번호를 입력해주세요'
]

const newPasswordRules = [
  v => !!v || '새 비밀번호를 입력해주세요',
  v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
  v => /^(?=.*[A-Za-z])(?=.*\d)/.test(v) || '영문과 숫자를 포함해야 합니다'
]

const confirmPasswordRules = [
  v => !!v || '비밀번호 확인을 입력해주세요',
  v => v === form.newPassword || '비밀번호가 일치하지 않습니다'
]

// 사용자 정보 로드
const loadUserProfile = async () => {
  try {
    const { data } = await userAPI.getMyPage()
    userProfile.value = data?.data || data
    
    // 소셜 로그인 사용자인 경우 접근 차단
    if (!canAccessPasswordChange.value) {
      console.log('소셜 로그인 사용자 접근 차단:', userProfile.value?.socialType)
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
    if (error.response?.status === 401) {
      // 로그인 모달 띄우기
      const showLoginModal = inject('showLoginModal')
      if (showLoginModal) {
        showLoginModal()
      } else {
        // fallback: 홈으로 이동하여 모달 표시
        router.push({ path: '/', query: { showLogin: 'true' } })
      }
    }
  }
}

// 폼 제출
const handleSubmit = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid || !canSubmit.value) return

  loading.value = true
  try {
    await userAPI.changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    
    showSuccess.value = true
    
    // 프로필 화면으로 이동
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error) {
    console.error('비밀번호 변경 실패:', error)
    
    const status = error.response?.status
    if (status === 400) {
      errorMessage.value = '기존 비밀번호가 올바르지 않습니다.'
    } else if (status === 401) {
      errorMessage.value = '인증이 필요합니다. 다시 로그인해주세요.'
      // 로그인 모달 띄우기
      const showLoginModal = inject('showLoginModal')
      if (showLoginModal) {
        showLoginModal()
      } else {
        // fallback: 홈으로 이동하여 모달 표시
        router.push({ path: '/', query: { showLogin: 'true' } })
      }
      return
    } else {
      errorMessage.value = '비밀번호 변경에 실패했습니다. 다시 시도해주세요.'
    }
    
    showError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!checkAuthStatus()) {
    // 로그인 모달 띄우기
    const showLoginModal = inject('showLoginModal')
    if (showLoginModal) {
      showLoginModal()
    } else {
      // fallback: 홈으로 이동하여 모달 표시
      router.push({ path: '/', query: { showLogin: 'true' } })
    }
    return
  }
  
  loadUserProfile()
})
</script>

<style scoped>
.v-card-title .v-icon {
  margin-right: 8px;
}
</style>
