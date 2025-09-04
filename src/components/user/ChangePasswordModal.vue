<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
    class="change-password-modal"
    transition="modal-scale"
    @update:modelValue="handleDialogClose"
  >
    <v-card class="modal-card modal-content modal-gpu-accelerated">
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">비밀번호 변경</h2>
      </div>

      <!-- 소셜 로그인 사용자 접근 차단 -->
      <div v-if="!canAccessPasswordChange" class="access-denied-section">
        <div class="access-denied-content">
          <v-icon size="64" color="#ef4444" class="mb-4">mdi-account-lock</v-icon>
          <h3 class="access-denied-title">접근 불가</h3>
          <p class="access-denied-text">
            {{ providerLabel }}로 로그인한 계정은 비밀번호 변경이 불가능합니다.
          </p>
          <p class="access-denied-subtext">
            계정 보안을 위해 {{ providerLabel }} 계정의 보안 설정을 확인해주세요.
          </p>
        </div>
        
        <div class="modal-actions">
          <v-btn
            @click="closeModal"
            color="#E87D7D"
            class="close-button"
            size="large"
            variant="flat"
          >
            확인
          </v-btn>
        </div>
      </div>

      <!-- 일반 로그인 사용자용 비밀번호 변경 폼 -->
      <v-form v-else ref="formRef" @submit.prevent="handleSubmit" class="modal-form">
        <!-- 입력 필드들 -->
        <div class="form-fields-section">
          <!-- 기존 비밀번호 -->
          <div class="form-field">
            <label class="field-label">기존 비밀번호 *</label>
            <v-text-field
              v-model="form.oldPassword"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              :rules="oldPasswordRules"
              required
              variant="outlined"
              rounded="lg"
              class="form-input modern-input"
              hide-details="false"
              density="compact"
              @blur="validateOldPassword"
            >
              <template #prepend-inner>
                <v-icon color="#6b7280" size="20">mdi-lock</v-icon>
              </template>
              <template #append-inner>
                <v-progress-circular
                  v-if="validatingOldPassword"
                  indeterminate
                  size="16"
                  color="#E87D7D"
                />
                <v-icon
                  v-else-if="oldPasswordValid === true"
                  color="success"
                  size="16"
                >
                  mdi-check-circle
                </v-icon>
                <v-icon
                  v-else-if="oldPasswordValid === false"
                  color="error"
                  size="16"
                >
                  mdi-close-circle
                </v-icon>
              </template>
            </v-text-field>
          </div>

          <!-- 새 비밀번호 -->
          <div class="form-field">
            <label class="field-label">새 비밀번호 *</label>
            <v-text-field
              v-model="form.newPassword"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              :rules="newPasswordRules"
              required
              variant="outlined"
              rounded="lg"
              class="form-input modern-input"
              hide-details="auto"
              density="compact"
            >
              <template #prepend-inner>
                <v-icon color="#6b7280" size="20">mdi-lock-plus</v-icon>
              </template>
            </v-text-field>
          </div>

          <!-- 새 비밀번호 확인 -->
          <div class="form-field">
            <label class="field-label">새 비밀번호 확인 *</label>
            <v-text-field
              v-model="form.confirmPassword"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              :rules="confirmPasswordRules"
              required
              variant="outlined"
              rounded="lg"
              class="form-input modern-input"
              hide-details="auto"
              density="compact"
            >
              <template #prepend-inner>
                <v-icon color="#6b7280" size="20">mdi-lock-check</v-icon>
              </template>
            </v-text-field>
          </div>
        </div>

        <!-- 안내 메시지 -->
        <div class="info-banner">
          <div class="info-icon">
            <v-icon size="20" color="#3B82F6">mdi-information</v-icon>
          </div>
          <div class="info-content">
            <div class="info-title">비밀번호 변경 안내</div>
            <ul class="info-list">
              <li>새 비밀번호는 8자 이상이어야 합니다</li>
              <li>영문과 숫자를 포함해야 합니다</li>
              <li>변경 후에는 새 비밀번호로 로그인해야 합니다</li>
            </ul>
          </div>
        </div>

        <!-- 액션 버튼들 -->
        <div class="modal-actions">
          <v-btn
            variant="outlined"
            @click="closeModal"
            class="cancel-button"
            size="large"
          >
            취소
          </v-btn>
          
          <v-btn
            type="submit"
            color="#E87D7D"
            :loading="loading"
            :disabled="!canSubmit"
            class="save-button"
            size="large"
            variant="flat"
          >
            비밀번호 변경
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <!-- 성공 스낵바 -->
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

    <!-- 에러 스낵바 -->
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
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '@/services/api'
import '@/assets/styles/modal-animations.css'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// Router
const router = useRouter()

// Refs
const formRef = ref(null)
const loading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const userProfile = ref(null)
const validatingOldPassword = ref(false)
const oldPasswordValid = ref(null)

// Form data
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

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
         form.newPassword === form.confirmPassword &&
         oldPasswordValid.value === true
})

// 비밀번호 유효성 검사 규칙
const oldPasswordRules = [
  v => !!v || '기존 비밀번호를 입력해주세요',
  () => oldPasswordValid.value !== false || '기존 비밀번호가 올바르지 않습니다'
]

const newPasswordRules = [
  v => !!v || '새 비밀번호를 입력해주세요',
  v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
  v => /^(?=.*[A-Za-z])(?=.*\d)/.test(v) || '영문과 숫자를 포함해야 합니다',
  v => v !== form.oldPassword || '기존 비밀번호와 동일합니다'
]

const confirmPasswordRules = [
  v => !!v || '비밀번호 확인을 입력해주세요',
  v => v === form.newPassword || '비밀번호가 일치하지 않습니다'
]

// Methods
const validateOldPassword = async () => {
  if (!form.oldPassword) {
    oldPasswordValid.value = null
    return
  }

  validatingOldPassword.value = true
  try {
    // 현재 사용자의 이메일과 입력한 비밀번호로 로그인 시도하여 검증
    const userEmail = userProfile.value?.email
    if (!userEmail) {
      oldPasswordValid.value = false
      return
    }

    await userAPI.login({
      email: userEmail,
      password: form.oldPassword
    })
    
    // 로그인 성공하면 기존 비밀번호가 올바름
    oldPasswordValid.value = true
  } catch (error) {
    console.error('기존 비밀번호 검증 실패:', error)
    
    const status = error.response?.status
    if (status === 400 || status === 401) {
      // 비밀번호가 틀림
      oldPasswordValid.value = false
    } else {
      // 기타 오류 - 검증 실패로 처리
      oldPasswordValid.value = false
    }
  } finally {
    validatingOldPassword.value = false
    // 검증 완료 후 폼 유효성 검사 다시 실행하여 에러 메시지 즉시 표시
    if (formRef.value) {
      formRef.value.validate()
    }
  }
}

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
    
    // 성공 후 모달 닫기 (폼 초기화 포함)
    setTimeout(() => {
      closeModal()
      emit('success')
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

const closeModal = () => {
  // 보안상 비밀번호 필드들은 모달 닫기 시 초기화
  form.oldPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  
  // 검증 상태 초기화
  oldPasswordValid.value = null
  validatingOldPassword.value = false
  
  // 에러 메시지 초기화
  showError.value = false
  errorMessage.value = ''
  
  isOpen.value = false
}

const handleDialogClose = (value) => {
  // 모달이 닫힐 때 (배경 클릭, ESC 키 등) 폼 초기화
  if (!value) {
    closeModal()
  }
}

// Watch for modal open
watch(isOpen, (newValue) => {
  if (newValue) {
    loadUserProfile()
    // 모달이 열릴 때는 사용자 정보만 로드 (비밀번호 필드는 빈 상태)
  }
})

// Watch for old password changes to revalidate new password
watch(() => form.oldPassword, (newValue, oldValue) => {
  // 기존 비밀번호가 변경되면 검증 상태 초기화
  if (newValue !== oldValue) {
    oldPasswordValid.value = null
  }
  
  if (formRef.value && form.newPassword) {
    // 새 비밀번호 필드의 유효성 검사를 다시 실행
    formRef.value.validate()
  }
})
</script>

<style scoped>
.change-password-modal {
  z-index: 2000;
}

.change-password-modal :deep(.v-overlay__content) {
  background: transparent !important;
}

.change-password-modal :deep(.v-overlay__scrim) {
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  background: rgba(0, 0, 0, 0.4) !important;
}

.modal-card {
  border-radius: 28px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
  background: #ffffff !important;
}

.modal-header {
  background: #E87D7D !important;
  padding: 2rem 2rem 1.5rem !important;
  text-align: center !important;
  border-bottom: none !important;
}

.modal-title {
  color: #ffffff !important;
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  margin: 0 !important;
}

.access-denied-section {
  padding: 2rem;
  text-align: center;
}

.access-denied-content {
  margin-bottom: 2rem;
}

.access-denied-title {
  color: #ef4444;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0;
}

.access-denied-text {
  color: #374151;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.access-denied-subtext {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.modal-form {
  padding: 1.5rem 2rem 2rem;
}

.form-fields-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-input {
  border-radius: 12px;
}

.modern-input :deep(.v-field) {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: none;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
  width: 100%;
}

.modern-input :deep(.v-field--focused) {
  background: #ffffff;
  border-color: #E87D7D;
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.1);
}

.modern-input :deep(.v-field:hover) {
  background: #ffffff;
  border-color: #d1d5db;
}

.modern-input :deep(.v-field__input) {
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #111827;
  font-weight: 500;
}

.modern-input :deep(.v-field__input::placeholder) {
  color: #9ca3af;
  opacity: 1;
  font-weight: 400;
}

.modern-input :deep(.v-field__prepend-inner) {
  padding-right: 8px;
  color: #6b7280;
}

.modern-input :deep(.v-field--focused .v-field__prepend-inner) {
  color: #E87D7D;
}

.modern-input :deep(.v-field) {
  min-height: 44px;
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #EBF4FF;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 0.875rem;
  color: #1E40AF;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.info-list {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.8rem;
  color: #1E40AF;
  line-height: 1.5;
}

.info-list li {
  margin-bottom: 0.25rem;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  margin-top: 24px;
}

.cancel-button {
  min-width: 100px !important;
  height: 48px !important;
  border: 2px solid #e5e7eb !important;
  color: #374151 !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.cancel-button:hover {
  border-color: #d1d5db !important;
  background: #f9fafb !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.save-button {
  min-width: 120px !important;
  height: 48px !important;
  background: #E87D7D !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2) !important;
}

.save-button:hover {
  background: #D16B6B !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(232, 125, 125, 0.3) !important;
}

.close-button {
  min-width: 120px !important;
  height: 48px !important;
  background: #E87D7D !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2) !important;
}

.close-button:hover {
  background: #D16B6B !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(232, 125, 125, 0.3) !important;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .modal-form {
    padding: 1rem 1.5rem 1.5rem;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .access-denied-section {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .cancel-button,
  .save-button,
  .close-button {
    width: 100%;
    height: 52px;
  }
}
</style>
