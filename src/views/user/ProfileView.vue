<template>
  <div class="profile-page">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1 class="page-title">프로필</h1>
      <p class="page-subtitle">내 정보를 확인하고 관리하세요</p>
    </div>

    <!-- 프로필 컨테이너 -->
    <div class="profile-container">
      <!-- 프로필 헤더 섹션 -->
      <div class="profile-header">
        <div class="profile-image-container">
          <!-- 강제 이미지 표시 (문제 해결용) -->
          <div v-if="forceImageUrl" class="force-image-display">
            <img 
              :src="forceImageUrl" 
              alt="대표 반려동물 이미지" 
              class="force-profile-image"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </div>
          
          <v-avatar 
            :size="120" 
            class="profile-avatar"
            :image="profileImageUrl"
          >
            <!-- 기본 이미지: 동물을 등록하지 않았거나 이미지가 없을 때 -->
            <v-icon 
              v-if="!profileImageUrl" 
              size="60" 
              color="grey-lighten-2"
              icon="mdi-account"
            />
          </v-avatar>
        </div>
        
        <div class="profile-info">
          <h1 class="username">@{{ userInfo?.nickname || '사용자' }}</h1>
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon>mdi-calendar</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">가입일</div>
                <div class="stat-value">{{ formatJoinDate(userInfo?.createdAt) }}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon>mdi-paw</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">반려동물</div>
                <div class="stat-value">{{ petStore.pets?.length || 0 }}마리</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 정보 카드들 -->
      <div class="info-cards">
        <!-- 기본 정보 카드 -->
        <div class="info-card">
          <div class="card-header">
            <div class="header-icon">
              <v-icon size="24" color="#E87D7D" icon="mdi-account-details" />
            </div>
            <h2>기본 정보</h2>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <label>이름</label>
              <span class="info-value" :class="{ 'empty-field': !userInfo?.name }">
                {{ userInfo?.name || '정보 없음' }}
              </span>
            </div>
            
            <div class="info-item">
              <label>닉네임</label>
              <span class="info-value">{{ userInfo?.nickname || '-' }}</span>
            </div>
            
            <div class="info-item">
              <label>이메일</label>
              <span class="info-value email">{{ userInfo?.email || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 계정 정보 카드 -->
        <div class="info-card">
          <div class="card-header">
            <div class="header-icon">
              <v-icon size="24" color="#E87D7D" icon="mdi-shield-account" />
            </div>
            <h2>계정 정보</h2>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <label>로그인 방식</label>
              <div class="login-method">
                <v-chip
                  :color="getSocialColor(userInfo?.socialType)"
                  size="small"
                  variant="elevated"
                  class="social-chip"
                >
                  <v-icon 
                    :icon="getSocialIcon(userInfo?.socialType)" 
                    size="18"
                  />
                  {{ getSocialName(userInfo?.socialType) }}
                </v-chip>
              </div>
            </div>
            
            <div class="info-item">
              <label>계정 상태</label>
              <div class="status-badge">
                <v-chip
                  :color="getStatusColor(userInfo?.userStatus)"
                  size="small"
                  variant="tonal"
                >
                  <v-icon size="16" :icon="getStatusIcon(userInfo?.userStatus)" />
                  {{ getStatusText(userInfo?.userStatus) }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 액션 버튼들 -->
      <div class="action-buttons">
        <v-btn 
          @click="editProfile" 
          color="#E87D7D"
          variant="flat"
          size="large"
          rounded="xl"
          prepend-icon="mdi-pencil"
          class="action-btn primary-btn"
          elevation="2"
        >
          프로필 수정
        </v-btn>
        
        <v-btn 
          v-if="userInfo?.socialType === 'COMMON'"
          variant="outlined" 
          size="large"
          rounded="xl"
          prepend-icon="mdi-lock"
          class="action-btn secondary-btn"
          @click="changePassword"
          color="#E87D7D"
        >
          비밀번호 변경
        </v-btn>
        
        <v-btn 
          v-else
          variant="outlined" 
          size="large"
          rounded="xl"
          prepend-icon="mdi-lock"
          class="action-btn secondary-btn"
          disabled
          color="#E87D7D"
        >
          비밀번호 변경 (소셜 계정)
        </v-btn>
      </div>

      <!-- 계정 관리 카드 -->
      <div class="info-card danger-zone">
        <div class="card-header">
          <div class="header-icon danger">
            <v-icon size="24" color="error" icon="mdi-alert-circle" />
          </div>
          <h2>계정 관리</h2>
        </div>
        
        <div class="danger-content">
          <div class="warning-message">
            <v-icon size="20" color="error" icon="mdi-alert" />
            <p class="warning-text">
              계정을 삭제하면 모든 데이터가 <strong>영구적으로 삭제</strong>되며 복구할 수 없습니다.
            </p>
          </div>
          
          <v-btn 
            @click="deleteAccount" 
            color="error" 
            variant="flat"
            size="large"
            rounded="xl"
            prepend-icon="mdi-delete"
            class="delete-btn"
            elevation="2"
          >
            계정 탈퇴
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import { userAPI } from '@/services/api'

export default {
  name: 'ProfileView',
  
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const petStore = usePetStore()
    
    const userInfo = computed(() => authStore.myPageInfo)
    
    // 실시간 대표동물 변경 감지
    watch(
      () => [authStore.myPageInfo?.mainPetId, authStore.myPageInfo?.mainPetImage, petStore.pets],
      async (newValues, oldValues) => {
        console.log('🔄 대표동물 변경 감지!')
        console.log('이전 값:', oldValues)
        console.log('새로운 값:', newValues)
        
        // 데이터가 변경되면 강제로 새로고침
        if (JSON.stringify(newValues) !== JSON.stringify(oldValues)) {
          console.log('🔄 데이터 변경됨, 강제 새로고침 실행')
          
          // 1초 후 데이터 새로고침 (API 호출 최적화)
          setTimeout(async () => {
            try {
              await authStore.fetchMyPageInfo()
              await petStore.fetchPets()
              console.log('✅ 데이터 새로고침 완료')
            } catch (error) {
              console.error('❌ 데이터 새로고침 실패:', error)
            }
          }, 1000)
        }
      },
      { deep: true, immediate: true }
    )

    // Pinia store 상태 변화 직접 감지 (더 강력한 방법)
    watch(
      () => petStore.representativePet,
      (newRepresentativePet, oldRepresentativePet) => {
        console.log('🔄 petStore.representativePet 변경 감지!')
        console.log('이전 대표동물:', oldRepresentativePet)
        console.log('새로운 대표동물:', newRepresentativePet)
        
        if (newRepresentativePet && newRepresentativePet !== oldRepresentativePet) {
          console.log('🔄 대표동물 변경됨, 즉시 반영!')
          // 강제로 computed 값들을 다시 계산하도록 트리거
          nextTick(() => {
            console.log('✅ UI 업데이트 완료')
          })
        }
      },
      { deep: true, immediate: true }
    )

    // authStore의 mainPetId 변화도 직접 감지
    watch(
      () => authStore.myPageInfo?.mainPetId,
      (newMainPetId, oldMainPetId) => {
        console.log('🔄 authStore.mainPetId 변경 감지!')
        console.log('이전 mainPetId:', oldMainPetId)
        console.log('새로운 mainPetId:', newMainPetId)
        
        if (newMainPetId !== oldMainPetId) {
          console.log('🔄 mainPetId 변경됨, 즉시 반영!')
          // 강제로 computed 값들을 다시 계산하도록 트리거
          nextTick(() => {
            console.log('✅ UI 업데이트 완료')
          })
        }
      },
      { immediate: true }
    )
    
    // 프로필 이미지 URL (대표 반려동물 이미지)
    const profileImageUrl = computed(() => {
      console.log('=== profileImageUrl 계산 시작 ===')
      console.log('userInfo.value:', userInfo.value)
      console.log('mainPetImage:', userInfo.value?.mainPetImage)
      console.log('mainPetId:', userInfo.value?.mainPetId)
      console.log('petStore.pets:', petStore.pets)
      
      // 1순위: mainPetImage를 직접 사용 (백엔드에서 제공하는 대표 펫 이미지)
      if (userInfo.value?.mainPetImage) {
        console.log('✅ mainPetImage 사용:', userInfo.value.mainPetImage)
        return userInfo.value.mainPetImage
      }
      
      // 2순위: mainPetId로 펫 정보에서 찾기
      if (userInfo.value?.mainPetId && petStore.pets.length > 0) {
        const representativePet = petStore.pets.find(pet => pet.id === userInfo.value.mainPetId)
        console.log('🔍 찾은 대표 펫:', representativePet)
        console.log('🔍 대표 펫 ID:', representativePet?.id)
        console.log('🔍 대표 펫 URL:', representativePet?.url)
        if (representativePet?.url) {
          console.log('✅ 대표 펫 이미지 사용:', representativePet.url)
          return representativePet.url
        } else {
          console.log('❌ 대표 펫에 이미지 없음, 기본 이미지 표시')
          return null // 대표 펫에 이미지가 없으면 기본 아이콘 표시
        }
      }
      
      // 3순위: 기본 이미지 (대표 펫이 없거나 펫이 등록되지 않았을 때)
      console.log('❌ 대표 펫 없음, 기본 이미지 사용')
      return null // null이면 v-avatar에서 기본 아이콘 표시
    })

    // 강제 이미지 URL (문제 해결용)
    const forceImageUrl = computed(() => {
      console.log('=== forceImageUrl 계산 시작 ===')
      console.log('userInfo.value:', userInfo.value)
      console.log('mainPetImage:', userInfo.value?.mainPetImage)
      console.log('mainPetId:', userInfo.value?.mainPetId)
      console.log('petStore.pets:', petStore.pets)

      // 1순위: mainPetImage를 직접 사용 (백엔드에서 제공하는 대표 펫 이미지)
      if (userInfo.value?.mainPetImage) {
        console.log('✅ mainPetImage 사용 (강제):', userInfo.value.mainPetImage)
        return userInfo.value.mainPetImage
      }
      
      // 2순위: mainPetId로 펫 정보에서 찾기
      if (userInfo.value?.mainPetId && petStore.pets.length > 0) {
        const representativePet = petStore.pets.find(pet => pet.id === userInfo.value.mainPetId)
        console.log('🔍 찾은 대표 펫 (강제):', representativePet)
        if (representativePet?.url) {
          console.log('✅ 대표 펫 이미지 사용 (강제):', representativePet.url)
          return representativePet.url
        } else {
          console.log('❌ 대표 펫에 이미지 없음, 기본 이미지 표시 (강제)')
          return null // 대표 펫에 이미지가 없으면 기본 아이콘 표시
        }
      }
      
      // 3순위: 기본 이미지 (대표 펫이 없거나 펫이 등록되지 않았을 때)
      console.log('❌ 대표 펫 없음, 기본 이미지 사용 (강제)')
      return null // null이면 v-avatar에서 기본 아이콘 표시
    })
    
    // 가입일 포맷팅
    const formatJoinDate = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
      } catch (error) {
        console.error('날짜 파싱 오류:', error)
        return '-'
      }
    }
    
    // 소셜 로그인 아이콘
    const getSocialIcon = (socialType) => {
      if (!socialType) return 'mdi-account'
      
      switch (String(socialType).toUpperCase()) {
        case 'GOOGLE': return 'mdi-google'
        case 'KAKAO': return 'mdi-alpha-k-circle'
        case 'COMMON': return 'mdi-account'
        default: return 'mdi-account'
      }
    }
    
    // 소셜 로그인 색상
    const getSocialColor = (socialType) => {
      if (!socialType) return 'blue'
      
      switch (String(socialType).toUpperCase()) {
        case 'GOOGLE': return 'red'
        case 'KAKAO': return 'yellow'
        case 'COMMON': return 'blue'
        default: return 'blue'
      }
    }
    
    // 소셜 로그인 이름
    const getSocialName = (socialType) => {
      if (!socialType) return '일반'
      
      switch (String(socialType).toUpperCase()) {
        case 'GOOGLE': return 'Google'
        case 'KAKAO': return 'Kakao'
        case 'COMMON': return '일반'
        default: return '일반'
      }
    }
    
    // 계정 상태 아이콘
    const getStatusIcon = (status) => {
      if (!status) return 'mdi-help-circle'
      
      switch (String(status).toUpperCase()) {
        case 'ACTIVE': return 'mdi-check-circle'
        case 'INACTIVE': return 'mdi-pause-circle'
        case 'BLOCKED': return 'mdi-block-helper'
        case 'LOCKED': return 'mdi-lock'
        default: return 'mdi-help-circle'
      }
    }
    
    // 계정 상태 색상
    const getStatusColor = (status) => {
      if (!status) return 'grey'
      
      switch (String(status).toUpperCase()) {
        case 'ACTIVE': return 'success'
        case 'INACTIVE': return 'warning'
        case 'BLOCKED': return 'error'
        case 'LOCKED': return 'error'
        default: return 'grey'
      }
    }
    
    // 계정 상태 텍스트
    const getStatusText = (status) => {
      if (!status) return '알 수 없음'
      
      switch (String(status).toUpperCase()) {
        case 'ACTIVE': return '활성'
        case 'INACTIVE': return '비활성'
        case 'BLOCKED': return '차단됨'
        case 'LOCKED': return '잠금'
        default: return '알 수 없음'
      }
    }
    
    // 프로필 수정
    const editProfile = () => {
      console.log('프로필 수정 페이지로 이동')
      router.push('/profile/edit')
    }
    
    // 계정 삭제
    const deleteAccount = async () => {
      if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        return
      }

      try {
        console.log('계정 삭제 요청')
        
        // 백엔드에서 현재 로그인한 사용자를 자동으로 삭제
        const refreshToken = localStorage.getItem('refreshToken')
        await userAPI.delete(refreshToken)
        
        alert('계정이 성공적으로 삭제되었습니다.')
        
        // 로그아웃 처리
        await authStore.logout()
        router.push('/login')
        
      } catch (error) {
        console.error('계정 삭제 실패:', error)
        if (error.response?.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.')
        } else {
          alert('계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
        }
      }
    }

    // 데이터 강제 새로고침
    const forceRefreshData = () => {
      console.log('데이터 강제 새로고침 클릭!')
      authStore.fetchMyPageInfo()
      petStore.fetchPets()
      console.log('✅ 데이터 강제 새로고침 완료')
    }

    // 이미지 로딩 실패 시 강제 이미지 표시
    const handleImageError = () => {
      console.log('이미지 로딩 실패, 강제 이미지 표시')
      // 이미지 로딩 실패 시 강제로 새로고침하여 다시 시도
      forceRefreshData()
    }

    // 이미지 로딩 성공 시 강제 이미지 숨김 처리
    const handleImageLoad = () => {
      console.log('이미지 로딩 성공, 강제 이미지 숨김 해제')
      // 이미지 로딩 성공 시 강제 이미지 URL을 null로 설정하여 다시 계산
      // 이렇게 하면 이미지가 로드된 후에도 강제 이미지 URL이 유지되지 않음
      // 대신, 이미지 로딩 실패 시 강제 새로고침을 통해 다시 시도하는 것이 더 안정적
    }
    
    onMounted(async () => {
      console.log('=== ProfileView 마운트됨 ===')
      
      try {
        // 1단계: 사용자 정보 가져오기
        if (!authStore.myPageInfo) {
          console.log('🔄 사용자 정보 가져오는 중...')
          await authStore.fetchMyPageInfo()
          console.log('✅ 사용자 정보 로드 완료:', authStore.myPageInfo)
        } else {
          console.log('✅ 사용자 정보 이미 있음:', authStore.myPageInfo)
        }
        
        // 2단계: 펫 정보 가져오기
        if (petStore.pets.length === 0) {
          console.log('🔄 펫 정보 가져오는 중...')
          await petStore.fetchPets()
          console.log('✅ 펫 정보 로드 완료:', petStore.pets)
        } else {
          console.log('✅ 펫 정보 이미 있음:', petStore.pets)
        }
        
        // 3단계: 최종 상태 확인
        console.log('=== 최종 상태 확인 ===')
        console.log('authStore.myPageInfo:', authStore.myPageInfo)
        console.log('userInfo.value:', userInfo.value)
        console.log('userInfo.value의 모든 키:', Object.keys(userInfo.value || {}))
        console.log('userInfo.value.name:', userInfo.value?.name)
        console.log('userInfo.value.nickname:', userInfo.value?.nickname)
        console.log('userInfo.value.userStatus:', userInfo.value?.userStatus)
        console.log('userInfo.value.socialType:', userInfo.value?.socialType)
        console.log('petStore.pets:', petStore.pets)
        console.log('mainPetId:', authStore.myPageInfo?.mainPetId)
        console.log('mainPetImage:', authStore.myPageInfo?.mainPetImage)
        console.log('profileImageUrl:', profileImageUrl.value)
        console.log('forceImageUrl:', forceImageUrl.value)
        console.log('=== 상태 확인 완료 ===')
        
      } catch (error) {
        console.error('❌ ProfileView 초기화 오류:', error)
      }
    })
    
    // 비밀번호 변경 함수
    const changePassword = () => {
      router.push('/profile/change-password')
    }
    
    return {
      userInfo,
      profileImageUrl,
      forceImageUrl,
      petStore,
      formatJoinDate,
      getSocialIcon,
      getSocialColor,
      getSocialName,
      getStatusIcon,
      getStatusColor,
      getStatusText,
      editProfile,
      deleteAccount,
      changePassword,
      forceRefreshData,
      handleImageError,
      handleImageLoad
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--v-theme-surface-light);
  padding: 2rem 0;
}

/* 페이지 헤더 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  position: relative;
  overflow: hidden;
}



.profile-image-container {
  position: relative;
  flex-shrink: 0;
}

.force-image-display {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
  overflow: hidden;
  z-index: 1;
}

.force-profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

/* 프로필 통계 */
.profile-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #E87D7D, #f8a5a5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

/* 정보 카드들 */
.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #E87D7D, #f8a5a5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  padding: 0.5rem 0;
}

.info-value.empty-field {
  color: #94a3b8;
  font-style: italic;
}

.info-value.email {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}

/* 소셜 로그인 칩 */
.login-method {
  display: flex;
  align-items: center;
}

.social-chip {
  font-weight: 500;
}

/* 상태 배지 */
.status-badge {
  display: flex;
  align-items: center;
}

/* 액션 버튼들 */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
}

.primary-btn {
  min-width: 160px;
}

.secondary-btn {
  min-width: 180px;
}

/* 위험 구역 */
.danger-zone {
  border: 1px solid #fecaca;
  background: white;
}

.danger-zone .header-icon {
  background: linear-gradient(135deg, #ef4444, #f87171);
}

.danger-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.warning-text {
  font-size: 0.9rem;
  color: #dc2626;
  margin: 0;
  line-height: 1.5;
}

.delete-btn {
  align-self: flex-start;
  font-weight: 600;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .profile-container {
    padding: 0 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .profile-stats {
    justify-content: center;
    gap: 1.5rem;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    justify-content: center;
  }
}
</style>

