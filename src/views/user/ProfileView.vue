<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            내 프로필
          </v-card-title>

          <v-row v-if="loading" justify="center" class="py-8">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-row>

          <div v-else-if="profile">
            <!-- 프로필 이미지 섹션 -->
            <div class="text-center mb-6">
              <v-avatar size="120" class="mb-3">
                <v-img
                  v-if="profile.mainPetImage"
                  :src="profile.mainPetImage"
                  alt="대표 반려동물 이미지"
                />
                <v-img
                  v-else-if="profile.profileImage"
                  :src="profile.profileImage"
                  alt="프로필 이미지"
                />
                <v-icon v-else size="64" color="grey">mdi-account</v-icon>
              </v-avatar>
              <div class="text-h6">{{ profile.name }}</div>
              <div class="text-body-2 text-medium-emphasis">@{{ profile.nickname }}</div>
              <div v-if="profile.mainPetImage" class="text-caption text-primary mt-1">
                <v-icon size="16" color="primary">mdi-star</v-icon>
                대표 반려동물 이미지
              </div>
            </div>

            <v-divider class="mb-6" />

            <!-- 기본 정보 -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon start>mdi-account-details</v-icon>
                기본 정보
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">이름</div>
                    <div class="text-body-1">{{ profile.name }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">닉네임</div>
                    <div class="text-body-1">{{ profile.nickname }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">이메일</div>
                    <div class="text-body-1">{{ profile.email }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">가입일</div>
                    <div class="text-body-1">{{ formatDate(profile.createdAt) }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- 계정 정보 -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon start>mdi-shield-account</v-icon>
                계정 정보
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">로그인 방식</div>
                    <div class="text-body-1">
                      <v-chip
                        :color="getSocialTypeColor(profile?.socialType)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getSocialTypeLabel(profile?.socialType) }}
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">계정 상태</div>
                    <div class="text-body-1">
                      <v-chip
                        :color="getAccountStatusColor(profile.accountStatus || 'ACTIVE')"
                        size="small"
                        variant="tonal"
                      >
                        {{ getAccountStatusLabel(profile.accountStatus || 'ACTIVE') }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
                
                <!-- 계정 잠금 안내 -->
                <v-alert
                  v-if="profile?.accountStatus === 'LOCKED'"
                  type="error"
                  variant="tonal"
                  density="comfortable"
                  class="mt-4"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-lock-alert</v-icon>
                  </template>
                  <div>
                    <strong>계정이 잠겨있습니다</strong>
                    <p class="mb-2 mt-1">비밀번호를 5번 틀려서 계정이 잠겼습니다.</p>
                    <v-btn
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="$router.push('/auth/unlock-account')"
                    >
                      계정 잠금 해제
                    </v-btn>
                  </div>
                </v-alert>
                

              </v-card-text>
            </v-card>

            <!-- 반려동물 정보 -->
            <v-card v-if="profile.pets && profile.pets.length > 0" variant="outlined" class="mb-4">
              <v-card-title class="text-h6">
                <v-icon start>mdi-paw</v-icon>
                반려동물
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="pet in profile.pets"
                    :key="pet.id"
                    cols="12"
                    sm="6"
                  >
                    <v-card variant="tonal" class="pa-3">
                      <div class="d-flex align-center">
                        <v-avatar size="48" class="mr-3">
                          <v-img
                            v-if="pet.imageUrl"
                            :src="pet.imageUrl"
                            alt="펫 이미지"
                          />
                          <v-icon v-else>mdi-paw</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-body-1 font-weight-medium">{{ pet.name }}</div>
                          <div class="text-caption text-medium-emphasis">
                            {{ pet.species }} • {{ pet.age }}세
                          </div>
                        </div>
                        <v-chip
                          v-if="pet.isMain"
                          color="primary"
                          size="small"
                          class="ml-auto"
                        >
                          대표
                        </v-chip>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- 액션 버튼들 -->
            <v-card-actions class="justify-space-between">
              <v-btn
                variant="outlined"
                color="primary"
                @click="$router.push('/profile/edit')"
              >
                <v-icon start>mdi-pencil</v-icon>
                프로필 수정
              </v-btn>
              
              <v-btn
                v-if="profile?.socialType === 'COMMON'"
                variant="outlined"
                color="warning"
                @click="$router.push('/profile/change-password')"
              >
                <v-icon start>mdi-lock-reset</v-icon>
                비밀번호 변경
              </v-btn>
              
              <v-btn
                v-else
                variant="outlined"
                color="grey"
                disabled
                title="소셜 로그인 사용자는 비밀번호 변경이 불가능합니다"
              >
                <v-icon start>mdi-lock-off</v-icon>
                비밀번호 변경 (불가)
              </v-btn>
            </v-card-actions>

            <v-divider class="my-4" />

            <!-- 계정 관리 -->
            <v-card variant="outlined">
              <v-card-title class="text-h6 text-error">
                <v-icon start color="error">mdi-alert-circle</v-icon>
                계정 관리
              </v-card-title>
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                <v-btn
                  variant="outlined"
                  color="error"
                  @click="showDeleteConfirm = true"
                >
                  <v-icon start>mdi-delete-forever</v-icon>
                  계정 탈퇴
                </v-btn>
              </v-card-text>
            </v-card>
          </div>

          <div v-else class="text-center py-8">
            <v-icon size="64" color="error" class="mb-3">mdi-account-off</v-icon>
            <div class="text-h6 mb-2">프로필을 불러올 수 없습니다</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              로그인 상태를 확인해주세요.
            </div>
            <v-btn color="primary" @click="$router.push('/auth/login')">
              로그인하기
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 계정 탈퇴 확인 다이얼로그 -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-error">
          <v-icon start color="error">mdi-alert-circle</v-icon>
          계정 탈퇴 확인
        </v-card-title>
        <v-card-text>
          <p>정말로 계정을 탈퇴하시겠습니까?</p>
          <p class="text-caption text-medium-emphasis mt-2">
            이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
          </p>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn variant="text" @click="showDeleteConfirm = false">
            취소
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            :loading="deleting"
            @click="handleDeleteAccount"
          >
            계정 탈퇴
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const deleting = ref(false)
const profile = ref(null)
const showDeleteConfirm = ref(false)

// 프로필 정보 로드
const loadProfile = async () => {
  if (!auth.isAuthenticated) {
    router.push('/auth/login')
    return
  }

  loading.value = true
  try {
    const { data } = await userAPI.getMyPage()
    profile.value = data?.data || data
    
    // 디버깅: 프로필 데이터 확인
    console.log('=== 프로필 디버깅 ===')
    console.log('전체 프로필 데이터:', profile.value)
    console.log('소셜 타입:', profile.value?.socialType)
    console.log('소셜 타입 타입:', typeof profile.value?.socialType)
    console.log('계정 상태:', profile.value?.accountStatus)
    console.log('계정 상태 타입:', typeof profile.value?.accountStatus)
    console.log('프로필 키들:', Object.keys(profile.value || {}))
    console.log('데이터 구조:', JSON.stringify(profile.value, null, 2))
    
    // 추가 디버깅: 모든 필드 확인
    if (profile.value) {
      console.log('=== 모든 필드 상세 분석 ===')
      Object.entries(profile.value).forEach(([key, value]) => {
        console.log(`${key}:`, value, `(타입: ${typeof value})`)
      })
      console.log('=== 필드 분석 끝 ===')
    }
    
    console.log('=== 디버깅 끝 ===')
  } catch (error) {
    console.error('프로필 로드 실패:', error)
    if (error.response?.status === 401) {
      router.push('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 소셜 타입 라벨
const getSocialTypeLabel = (socialType) => {
  // 디버깅: 입력값 확인
  console.log('getSocialTypeLabel 호출됨:', socialType, typeof socialType)
  
  if (!socialType) {
    console.log('소셜 타입이 없음, 기본값 반환')
    return '일반' // 기본값을 '일반'으로 설정
  }
  
  const normalizedType = String(socialType).toUpperCase().trim()
  console.log('정규화된 소셜 타입:', normalizedType)
  
  switch (normalizedType) {
    case 'GOOGLE': return 'Google'
    case 'KAKAO': return 'Kakao'
    case 'COMMON': return '일반'
    default: 
      console.log('알 수 없는 소셜 타입:', socialType, '-> 기본값 반환')
      return '일반' // 기본값을 '일반'으로 설정
  }
}

// 소셜 타입 색상
const getSocialTypeColor = (socialType) => {
  if (!socialType) return 'blue' // 기본값은 '일반' 색상
  
  const normalizedType = String(socialType).toUpperCase().trim()
  
  switch (normalizedType) {
    case 'GOOGLE': return 'red'
    case 'KAKAO': return 'yellow'
    case 'COMMON': return 'blue'
    default: return 'blue' // 기본값은 '일반' 색상
  }
}

// 계정 상태 라벨
const getAccountStatusLabel = (status) => {
  if (!status) return '활성' // 기본값
  
  switch (String(status).toUpperCase()) {
    case 'ACTIVE': return '활성'
    case 'LOCKED': return '잠금'
    case 'SUSPENDED': return '정지'
    case 'DELETED': return '삭제됨'
    default: return '활성'
  }
}

// 계정 상태 색상
const getAccountStatusColor = (status) => {
  if (!status) return 'success' // 기본값
  
  switch (String(status).toUpperCase()) {
    case 'ACTIVE': return 'success'
    case 'LOCKED': return 'error'
    case 'SUSPENDED': return 'warning'
    case 'DELETED': return 'grey'
    default: return 'success'
  }
}

// 계정 탈퇴
const handleDeleteAccount = async () => {
  if (!confirm('정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    return
  }

  deleting.value = true
  try {
    await userAPI.delete()
    auth.logout()
    alert('계정이 성공적으로 탈퇴되었습니다.')
    router.push('/')
  } catch (error) {
    console.error('계정 탈퇴 실패:', error)
    alert('계정 탈퇴에 실패했습니다. 다시 시도해주세요.')
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
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
