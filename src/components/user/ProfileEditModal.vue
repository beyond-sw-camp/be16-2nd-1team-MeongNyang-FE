<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
    class="profile-edit-modal"
    transition="modal-scale"
  >
    <v-card class="modal-card modal-content modal-gpu-accelerated">
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">프로필 수정</h2>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <v-progress-circular indeterminate size="64" color="#E87D7D"></v-progress-circular>
      </div>

      <!-- 폼 내용 -->
      <v-form v-else ref="formRef" @submit.prevent="handleSubmit" class="modal-form">
        <!-- 프로필 이미지 섹션 -->
        <div class="profile-image-section">
          <v-avatar size="120" class="profile-avatar">
            <v-img
              v-if="representativePet?.url"
              :src="representativePet.url"
              alt="대표동물 프로필 이미지"
            />
            <v-icon v-else size="64" color="grey-lighten-2">mdi-paw</v-icon>
          </v-avatar>
          
          <!-- 정보 배너 -->
          <div class="info-banner">
            <div class="info-icon">
              <v-icon size="20" color="#3B82F6">mdi-information</v-icon>
            </div>
            <span class="info-text">프로필 이미지는 반려동물 대표 프로필에서 관리됩니다</span>
          </div>
        </div>

        <!-- 입력 필드들 -->
        <div class="form-fields-section compact-form-section">
          <!-- 이름 필드 -->
          <div class="form-field compact-form-field">
            <label class="field-label compact-label">이름 *</label>
            <v-text-field
              v-model="form.name"
              :rules="nameRules"
              required
              variant="outlined"
              rounded="lg"
              class="form-input modern-input name-input"
              hide-details="auto"
              density="compact"
            />
          </div>

          <!-- 닉네임 필드 -->
          <div class="form-field compact-form-field">
            <label class="field-label compact-label">닉네임 *</label>
            <v-text-field
              v-model="form.nickname"
              :rules="nicknameRules"
              required
              variant="outlined"
              rounded="lg"
              class="form-input modern-input"
              hide-details="false"
              density="compact"
              @input="resetNicknameCheck"
            >
              <template #append>
                <v-btn
                  :color="nicknameAvailable === true ? 'success' : 'info'"
                  :disabled="!nicknameValid || checkingNickname"
                  :loading="checkingNickname"
                  @click="checkNicknameDup"
                  class="check-button-append"
                  size="small"
                  variant="flat"
                  rounded="lg"
                >
                  <template v-if="nicknameAvailable === true">사용가능</template>
                  <template v-else>중복확인</template>
                </v-btn>
              </template>
            </v-text-field>
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
            :loading="saving"
            :disabled="!canSubmit"
            class="save-button"
            size="large"
            variant="flat"
          >
            저장
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <!-- 성공 스낵바 -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      프로필이 성공적으로 수정되었습니다.
    </v-snackbar>

    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
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

// Stores
const authStore = useAuthStore()
const petStore = usePetStore()

// Refs
const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const checkingNickname = ref(false)
const nicknameAvailable = ref(null)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const profile = ref(null)

// Form data
const form = reactive({
  name: '',
  nickname: ''
})

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 유효성 검사 규칙
const nameRules = [
  v => !!v || '이름을 입력해주세요',
  v => v.length <= 20 || '이름은 20자 이하여야 합니다',
  v => /^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z\s]+$/.test(v) || '이름은 한글, 영문, 공백만 입력 가능합니다'
]

const nicknameRules = [
  v => !!v || '닉네임을 입력해주세요',
  v => v.length >= 2 || '닉네임은 2자 이상이어야 합니다',
  v => v.length <= 20 || '닉네임은 20자 이하여야 합니다',
  v => /^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9_]+$/.test(v) || '닉네임은 한글, 영문, 숫자, 언더스코어만 입력 가능합니다'
]

// 닉네임 유효성
const nicknameValid = computed(() => {
  return form.nickname && nicknameRules.every(rule => rule(form.nickname) === true)
})

// 대표동물 정보 (pet store에서 직접 가져오기)
const representativePet = computed(() => {
  return petStore.representativePet || petStore.pets?.[0]
})

// 제출 가능 여부
const canSubmit = computed(() => {
  const isSameNickname = profile.value?.nickname === form.nickname
  return form.name && 
         form.nickname && 
         (nicknameAvailable.value === true || isSameNickname) &&
         nicknameAvailable.value !== false // 중복된 닉네임이면 저장 불가
})

// Methods
const loadProfile = async () => {
  if (!authStore.isAuthenticated) {
    const showLoginModal = inject('showLoginModal')
    if (showLoginModal) {
      showLoginModal()
    }
    return
  }

  loading.value = true
  try {
    const { data } = await userAPI.getMyPage()
    profile.value = data?.data || data
    
    form.name = profile.value?.name || ''
    form.nickname = profile.value?.nickname || ''
    
    if (profile.value?.nickname) {
      nicknameAvailable.value = true
    } else {
      nicknameAvailable.value = null
    }
  } catch (error) {
    console.error('프로필 로드 실패:', error)
    if (error.response?.status === 401) {
      const showLoginModal = inject('showLoginModal')
      if (showLoginModal) {
        showLoginModal()
      }
    }
  } finally {
    loading.value = false
  }
}

const checkNicknameDup = async () => {
  if (!form.nickname || !nicknameValid.value) return
  
  checkingNickname.value = true
  try {
    await userAPI.checkNickname(form.nickname)
    nicknameAvailable.value = true
  } catch (error) {
    if (error.response?.status === 400) {
      nicknameAvailable.value = false
    } else {
      console.error('닉네임 중복 확인 실패:', error)
      errorMessage.value = '닉네임 중복 확인에 실패했습니다.'
      showError.value = true
    }
  } finally {
    checkingNickname.value = false
  }
}

const resetNicknameCheck = () => {
  nicknameAvailable.value = null
}

const getSocialTypeLabel = (socialType) => {
  if (!socialType) return '일반'
  
  const normalizedType = String(socialType).toUpperCase().trim()
  
  switch (normalizedType) {
    case 'GOOGLE': return 'Google'
    case 'KAKAO': return 'Kakao'
    case 'COMMON': return '일반'
    default: return '일반'
  }
}

const handleSubmit = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid || !canSubmit.value) return

  saving.value = true
  try {
    await userAPI.updateProfile(form)
    
    showSuccess.value = true
    
    // 성공 후 데이터 새로고침
    await authStore.fetchMyPageInfo()
    await petStore.fetchPets()
    
    // 모달 닫기 및 성공 이벤트 발생
    setTimeout(() => {
      closeModal()
      emit('success')
    }, 1500)
  } catch (error) {
    console.error('프로필 수정 실패:', error)
    
    const status = error.response?.status
    if (status === 400) {
      errorMessage.value = '입력한 정보가 올바르지 않습니다.'
    } else if (status === 401) {
      errorMessage.value = '인증이 필요합니다. 다시 로그인해주세요.'
      const showLoginModal = inject('showLoginModal')
      if (showLoginModal) {
        showLoginModal()
      }
      return
    } else {
      errorMessage.value = '프로필 수정에 실패했습니다. 다시 시도해주세요.'
    }
    
    showError.value = true
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
}

// Watch for modal open
watch(isOpen, (newValue) => {
  if (newValue) {
    loadProfile()
    // pet 데이터도 로드
    if (petStore.pets.length === 0) {
      petStore.fetchPets()
    }
  }
})
</script>

<style scoped>
.profile-edit-modal {
  z-index: 2000;
}

.profile-edit-modal :deep(.v-overlay__content) {
  background: transparent !important;
}

.profile-edit-modal :deep(.v-overlay__scrim) {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

.modal-form {
  padding: 1.5rem 2rem 2rem;
}

.profile-image-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  cursor: default !important;
  pointer-events: none !important;
}

.info-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #EBF4FF;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 0 auto;
  max-width: 400px;
}

.info-icon {
  flex-shrink: 0;
}

.info-text {
  font-size: 0.875rem;
  color: #1E40AF;
  font-weight: 500;
}

/* 펫 등록 모달과 동일한 폼 스타일 */
.form-fields-section {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

/* 기본 폼 입력 필드 */
.form-input {
  border-radius: 12px;
}

/* 현대적인 입력 필드 스타일 */
.modern-input :deep(.v-field) {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: none;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
  width: 100%;
}

/* 모든 인풋 필드의 너비를 일치시키기 */
.form-field .modern-input {
  width: 100%;
}

/* 이름 인풋박스 크기를 닉네임과 맞추기 */
.name-input :deep(.v-field) {
  width: 318px !important;
  max-width: 318px !important;
}

.name-input {
  width: 318px !important;
  max-width: 318px !important;
}

.check-button-append {
  min-width: 90px !important;
  height: 28px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  margin-left: 8px !important;
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

.modern-input :deep(.v-field--disabled) {
  background: #f9fafb;
  border-color: #e5e7eb;
  opacity: 0.6;
}

.modern-input :deep(.v-field--disabled .v-field__input) {
  color: #9ca3af;
}

.modern-input :deep(.v-field) {
  min-height: 44px;
}

.field-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
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

/* 스크롤바 스타일 (펫 등록 모달과 동일) */
.modal-card::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
  -webkit-appearance: none !important;
}

.modal-card::-webkit-scrollbar-track {
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
  -webkit-appearance: none !important;
}

.modal-card::-webkit-scrollbar-thumb {
  background: #E87D7D !important;
  border-radius: 6px !important;
  border: 1px solid #f8f9fa !important;
  -webkit-appearance: none !important;
}

.modal-card::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B !important;
  -webkit-appearance: none !important;
}

.modal-card {
  scrollbar-width: thin !important;
  scrollbar-color: #E87D7D #f8f9fa !important;
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
  
  .name-input :deep(.v-field) {
    width: 280px !important;
    max-width: 280px !important;
  }
  
  .name-input {
    width: 280px !important;
    max-width: 280px !important;
  }
  
  .check-button-append {
    min-width: 80px !important;
    height: 26px !important;
    font-size: 10px !important;
    margin-left: 4px !important;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .cancel-button,
  .save-button {
    width: 100%;
    height: 52px;
  }
}
</style>
