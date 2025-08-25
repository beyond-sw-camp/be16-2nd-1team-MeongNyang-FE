<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            프로필 수정
          </v-card-title>

          <v-row v-if="loading" justify="center" class="py-8">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-row>

          <v-form v-else ref="formRef" @submit.prevent="handleSubmit">
            <!-- 프로필 이미지 안내 -->
            <div class="text-center mb-6">
              <v-avatar size="120" class="mb-3">
                <v-img
                  v-if="profile?.profileImage"
                  :src="profile.profileImage"
                  alt="프로필 이미지"
                />
                <v-icon v-else size="64" color="grey">mdi-account</v-icon>
              </v-avatar>
              
              <v-alert
                type="info"
                variant="tonal"
                class="mb-3"
                density="compact"
              >
                <template #prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                프로필 이미지는 반려동물 대표 프로필에서 관리됩니다
              </v-alert>
            </div>

            <v-divider class="mb-6" />

            <!-- 기본 정보 -->
            <v-text-field
              v-model="form.name"
              label="이름"
              :rules="nameRules"
              required
              prepend-icon="mdi-account"
              variant="outlined"
              class="mb-4"
            />

            <!-- 닉네임 + 중복확인 -->
            <v-row dense class="mb-4">
              <v-col cols="8">
                <v-text-field
                  v-model="form.nickname"
                  label="닉네임"
                  :rules="nicknameRules"
                  required
                  prepend-icon="mdi-account"
                  variant="outlined"
                  @input="resetNicknameCheck"
                />
              </v-col>
              <v-col cols="4">
                <v-btn
                  block
                  class="mt-1"
                  :color="nicknameAvailable === true ? 'success' : 'info'"
                  :disabled="!nicknameValid || checkingNickname"
                  :loading="checkingNickname"
                  @click="checkNicknameDup"
                >
                  <template v-if="nicknameAvailable === true">사용가능</template>
                  <template v-else>중복확인</template>
                </v-btn>
              </v-col>
            </v-row>

            <!-- 이메일 (읽기 전용) -->
            <v-text-field
              :model-value="profile?.email || ''"
              label="이메일"
              readonly
              prepend-icon="mdi-email"
              variant="outlined"
              class="mb-4"
              hint="이메일은 변경할 수 없습니다"
              persistent-hint
            />

            <!-- 소셜 로그인 정보 (읽기 전용) -->
            <v-text-field
              :model-value="getSocialTypeLabel(profile?.socialType)"
              label="로그인 방식"
              readonly
              prepend-icon="mdi-shield-account"
              variant="outlined"
              class="mb-6"
            />

            <!-- 액션 버튼들 -->
            <v-card-actions class="justify-space-between">
              <v-btn
                variant="outlined"
                @click="$router.push('/profile')"
              >
                취소
              </v-btn>
              
              <v-btn
                type="submit"
                color="primary"
                :loading="saving"
                :disabled="!canSubmit"
              >
                저장
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

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
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/services/api'
import { usePetStore } from '@/stores/pet'

const router = useRouter()
const authStore = useAuthStore()
const petStore = usePetStore()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const checkingNickname = ref(false)
const nicknameAvailable = ref(null)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const profile = ref(null)
// 이미지 관련 변수들 제거

const form = reactive({
  name: '',
  nickname: ''
})

// 유효성 검사 규칙
const nameRules = [
  v => !!v || '이름을 입력해주세요',
  v => v.length >= 2 || '이름은 2자 이상이어야 합니다',
  v => v.length <= 20 || '이름은 20자 이하여야 합니다',
  v => /^[가-힣a-zA-Z\s]+$/.test(v) || '이름은 한글, 영문, 공백만 입력 가능합니다'
]

const nicknameRules = [
  v => !!v || '닉네임을 입력해주세요',
  v => v.length >= 2 || '닉네임은 2자 이상이어야 합니다',
  v => v.length <= 20 || '닉네임은 20자 이하여야 합니다',
  v => /^[가-힣a-zA-Z0-9_]+$/.test(v) || '닉네임은 한글, 영문, 숫자, 언더스코어만 입력 가능합니다'
]

// 닉네임 유효성
const nicknameValid = computed(() => {
  return form.nickname && nicknameRules.every(rule => rule(form.nickname) === true)
})

// 제출 가능 여부
const canSubmit = computed(() => {
  // 기존 닉네임과 동일하면 중복확인 없이도 저장 가능
  const isSameNickname = profile.value?.nickname === form.nickname
  
  return form.name && 
         form.nickname && 
         (nicknameAvailable.value === true || isSameNickname)
})

// 프로필 정보 로드
const loadProfile = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }

  loading.value = true
  try {
    const { data } = await userAPI.getMyPage()
    profile.value = data?.data || data
    
    console.log('=== 백엔드 응답 전체 구조 ===')
    console.log('전체 응답:', data)
    console.log('profile.value:', profile.value)
    console.log('profile.value.name:', profile.value?.name)
    console.log('profile.value.nickname:', profile.value?.nickname)
    console.log('profile.value의 모든 키:', Object.keys(profile.value || {}))
    console.log('=== 응답 구조 확인 완료 ===')
    
    // 폼 데이터 초기화 - 실제 name 필드 사용
    form.name = profile.value?.name || ''
    form.nickname = profile.value?.nickname || ''
    
    console.log('폼에 설정된 이름:', form.name)
    console.log('폼에 설정된 닉네임:', form.nickname)
    
    // 기존 닉네임이면 사용 가능하게 설정 (중복확인 불필요)
    if (profile.value?.nickname) {
      nicknameAvailable.value = true
    } else {
      nicknameAvailable.value = null
    }
  } catch (error) {
    console.error('프로필 로드 실패:', error)
    if (error.response?.status === 401) {
      router.push('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// 닉네임 중복 확인
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

// 닉네임 변경 시 중복 확인 상태 리셋
const resetNicknameCheck = () => {
  nicknameAvailable.value = null
}

// 소셜 타입 라벨
const getSocialTypeLabel = (socialType) => {
  if (!socialType) return '일반' // 기본값을 '일반'으로 설정
  
  const normalizedType = String(socialType).toUpperCase().trim()
  
  switch (normalizedType) {
    case 'GOOGLE': return 'Google'
    case 'KAKAO': return 'Kakao'
    case 'COMMON': return '일반'
    default: return '일반' // 기본값을 '일반'으로 설정
  }
}

  // 폼 제출
  const handleSubmit = async () => {
    const { valid } = await formRef.value?.validate()
    if (!valid || !canSubmit.value) return

    saving.value = true
    try {
      // 프로필 업데이트 API 호출
      await userAPI.updateProfile(form)
      
      showSuccess.value = true
      
      // 성공 후 authStore와 petStore 데이터 새로고침
      console.log('🔄 프로필 수정 성공, 데이터 새로고침 시작')
      await authStore.fetchMyPageInfo()
      await petStore.fetchPets()
      console.log('✅ 데이터 새로고침 완료')
      
      // 프로필 화면으로 이동 (데이터가 이미 새로고침됨)
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (error) {
      console.error('프로필 수정 실패:', error)
      
      const status = error.response?.status
      if (status === 400) {
        errorMessage.value = '입력한 정보가 올바르지 않습니다.'
      } else if (status === 401) {
        errorMessage.value = '인증이 필요합니다. 다시 로그인해주세요.'
        router.push('/auth/login')
        return
      } else {
        errorMessage.value = '프로필 수정에 실패했습니다. 다시 시도해주세요.'
      }
      
      showError.value = true
    } finally {
      saving.value = false
    }
  }

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.v-card-title .v-icon {
  margin-right: 8px;
}
</style>
