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
        <!-- 상단: 프로필 이미지 + 통계 정보 -->
        <div class="profile-top-section">
          <div class="profile-left-section">
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
          </div>
          
          <!-- 통계 정보 (사진 우측) -->
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
        
        <!-- 닉네임 + 액션 버튼들 (동일선상) -->
        <div class="profile-bottom-section">
          <!-- 닉네임 -->
          <div class="username-section">
            <h1 class="username">@{{ userInfo?.nickname || '사용자' }}</h1>
          </div>
          
          <!-- 액션 버튼들 -->
          <div class="profile-actions">
            <v-btn 
              @click="openEditModal" 
              color="#E87D7D"
              variant="flat"
              size="default"
              rounded="xl"
              prepend-icon="mdi-pencil"
              class="action-btn primary-btn"
              elevation="4"
              hover
            >
              프로필 수정
            </v-btn>
          </div>
        </div>
      </div>

      <!-- 정보 카드들 -->
      <div class="info-cards">
        <!-- 기본 정보 카드 -->
        <div class="info-card">
          <div class="card-header">
            <h2>기본 정보</h2>
          </div>
          
          <div class="info-list">
            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-account" />
                <span>이름</span>
              </div>
              <div class="info-content" :class="{ 'empty-field': !userInfo?.name }">
                {{ userInfo?.name || '정보 없음' }}
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-at" />
                <span>닉네임</span>
              </div>
              <div class="info-content">
                {{ userInfo?.nickname || '-' }}
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-email" />
                <span>이메일</span>
              </div>
              <div class="info-content email">
                {{ userInfo?.email || '-' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 계정 정보 카드 -->
        <div class="info-card">
          <div class="card-header">
            <h2>계정 정보</h2>
          </div>
          
          <div class="info-list">
            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-shield-account" />
                <span>로그인 방식</span>
              </div>
                              <div class="info-content">
                  <div class="social-login-display">
                    <div 
                      v-if="userInfo?.socialType === 'GOOGLE'"
                      class="social-logo-container google-logo selected"
                    >
                      <img 
                        src="https://developers.google.com/identity/images/g-logo.png" 
                        alt="Google" 
                        class="social-logo"
                      />
                      <span class="social-text">Google</span>
                    </div>
                    <div 
                      v-else-if="userInfo?.socialType === 'KAKAO'"
                      class="social-logo-container kakao-logo selected"
                    >
                      <img 
                        src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" 
                        alt="Kakao" 
                        class="social-logo"
                      />
                      <span class="social-text">Kakao</span>
                    </div>
                    <div 
                      v-else
                      class="social-logo-container selected"
                    >
                      <v-icon 
                        icon="mdi-account" 
                        class="social-logo"
                        color="#64748b"
                      />
                      <span class="social-text">일반</span>
                    </div>
                  </div>
                </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-check-circle" />
                <span>계정 상태</span>
              </div>
                              <div class="info-content">
                  <div class="social-login-display">
                    <div class="social-logo-container status-container selected">
                      <v-icon 
                        :color="getStatusColor(userInfo?.userStatus)" 
                        :icon="getStatusIcon(userInfo?.userStatus)" 
                        class="social-logo"
                      />
                      <span class="social-text">{{ getStatusText(userInfo?.userStatus) }}</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>



      <!-- 계정 관리 카드 -->
      <div class="info-card account-management">
        <div class="card-header">
          <h2>계정 관리</h2>
        </div>
        
        <div class="account-content">
          <!-- 비밀번호 변경 버튼 -->
          <div class="password-section">
            <v-btn 
              v-if="userInfo?.socialType === 'COMMON'"
              variant="outlined" 
              size="large"
              rounded="lg"
              prepend-icon="mdi-lock"
              class="management-btn password-btn"
              @click="changePassword"
              color="#64748b"
            >
              비밀번호 변경
            </v-btn>
            
            <v-btn 
              v-else
              variant="outlined" 
              size="large"
              rounded="lg"
              prepend-icon="mdi-lock"
              class="management-btn password-btn"
              disabled
              color="#94a3b8"
            >
              비밀번호 변경 (소셜 계정)
            </v-btn>
          </div>
          
          <div class="warning-container">
            <div class="warning-message">
              <v-icon size="18" color="#ef4444" icon="mdi-alert" />
              <p class="warning-text">
                계정을 삭제하면 모든 데이터가 <strong>영구적으로 삭제</strong>되며 복구할 수 없습니다.
              </p>
            </div>
            
            <v-btn 
              @click="deleteAccount" 
              variant="outlined"
              size="large"
              rounded="lg"
              prepend-icon="mdi-delete"
              class="management-btn delete-btn"
              color="error"
            >
              계정 탈퇴
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 프로필 수정 모달 -->
    <ProfileEditModal 
      v-model="showEditModal" 
      @success="handleProfileUpdateSuccess"
    />

    <!-- 비밀번호 변경 모달 -->
    <ChangePasswordModal 
      v-model="showChangePasswordModal" 
      @success="handlePasswordChangeSuccess"
    />

    <!-- 계정탈퇴 모달 -->
    <DeleteAccountModal 
      v-model="showDeleteAccountModal" 
      @confirm="handleDeleteAccountConfirm"
      @close="showDeleteAccountModal = false"
    />

    <!-- 계정 삭제 성공 모달 -->
    <v-dialog
      v-model="showSuccessModal"
      max-width="400"
      class="success-modal modal-coinmarketcap-overlay"
      :retain-focus="false"
      transition="dialog-transition"
    >
      <v-card 
        class="success-card modal-container modal-gpu-accelerated modal-coinmarketcap-card"
        elevation="24" 
        rounded="xl"
      >
        <!-- 헤더 -->
        <v-card-title class="success-header modal-coinmarketcap-header pa-6 pb-4">
          <div class="d-flex align-center w-100 position-relative">
            <!-- 성공 아이콘 -->
            <div class="success-icon-container">
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 48 48" 
                class="success-icon"
              >
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  fill="#10b981"
                />
                <path 
                  d="M16 24l6 6 12-12" 
                  stroke="white" 
                  stroke-width="3" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            
            <h1 class="modal-title text-center" style="font-size: 1.25rem; font-weight: 600; flex: 1;">
              계정 삭제 완료
            </h1>
            
            <!-- 균형을 위한 빈 공간 -->
            <div class="success-icon-container" style="opacity: 0;"></div>
          </div>
        </v-card-title>

        <!-- 콘텐츠 -->
        <v-card-text class="pa-6 pt-2 pb-4">
          <p class="text-center" style="font-size: 0.9rem; color: #64748b; margin: 0;">
            계정이 성공적으로 삭제되었습니다
          </p>
        </v-card-text>

        <!-- 액션 버튼 -->
        <v-card-actions class="pa-6 pt-2">
          <v-btn
            variant="flat"
            size="large"
            rounded="xl"
            color="success"
            class="success-btn"
            @click="handleSuccessConfirm"
            block
            style="height: 48px; font-size: 1rem; font-weight: 600;"
          >
            <v-icon start size="20">mdi-check</v-icon>
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, onMounted, watch, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import { userAPI } from '@/services/api'
import ProfileEditModal from '@/components/user/ProfileEditModal.vue'
import ChangePasswordModal from '@/components/user/ChangePasswordModal.vue'
import DeleteAccountModal from '@/components/user/DeleteAccountModal.vue'

export default {
  name: 'ProfileView',
  
  components: {
    ProfileEditModal,
    ChangePasswordModal,
    DeleteAccountModal
  },
  
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const petStore = usePetStore()
    
    const userInfo = computed(() => authStore.myPageInfo)
    const showEditModal = ref(false)
    const showChangePasswordModal = ref(false)
    const showDeleteAccountModal = ref(false)
    const showSuccessModal = ref(false)
    
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
    
    // 프로필 수정 모달 열기
    const openEditModal = () => {
      console.log('프로필 수정 모달 열기')
      showEditModal.value = true
    }
    
    // 프로필 수정 성공 처리
    const handleProfileUpdateSuccess = () => {
      console.log('프로필 수정 성공')
      // 데이터가 이미 모달에서 새로고침되므로 추가 작업 불필요
    }
    
    // 계정 삭제 모달 열기
    const deleteAccount = () => {
      showDeleteAccountModal.value = true
    }

    // 계정 삭제 확인 처리
    const handleDeleteAccountConfirm = async () => {
      try {
        console.log('계정 삭제 요청')
        
        // 백엔드에서 현재 로그인한 사용자를 자동으로 삭제
        const refreshToken = localStorage.getItem('refreshToken')
        await userAPI.delete(refreshToken)
        
        // 모달 닫기
        showDeleteAccountModal.value = false
        
        // 성공 모달 표시
        showSuccessModal.value = true
        
      } catch (error) {
        console.error('계정 삭제 실패:', error)
        if (error.response?.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.')
        } else {
          alert('계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
        }
      }
    }

    // 성공 모달 확인 처리
    const handleSuccessConfirm = async () => {
      showSuccessModal.value = false
      
      // 로그아웃 처리
      await authStore.logout()
      router.push('/login')
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
      showChangePasswordModal.value = true
    }
    
    // 비밀번호 변경 성공 처리
    const handlePasswordChangeSuccess = () => {
      console.log('비밀번호 변경 성공')
    }
    
    return {
      userInfo,
      profileImageUrl,
      forceImageUrl,
      petStore,
      showEditModal,
      showChangePasswordModal,
      showDeleteAccountModal,
      showSuccessModal,
      handleSuccessConfirm,
      formatJoinDate,
      getSocialIcon,
      getSocialColor,
      getSocialName,
      getStatusIcon,
      getStatusColor,
      getStatusText,
      openEditModal,
      handleProfileUpdateSuccess,
      deleteAccount,
      handleDeleteAccountConfirm,
      changePassword,
      handlePasswordChangeSuccess,
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
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

/* 프로필 상단 섹션 (이미지 + 통계) */
.profile-top-section {
  display: flex;
  align-items: center;
  gap: 3rem;
}

/* 프로필 좌측 섹션 (이미지만) */
.profile-left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
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

/* 프로필 하단 섹션 (닉네임 + 버튼들 동일선상) */
.profile-bottom-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* 닉네임 섹션 */
.username-section {
  text-align: left;
}

.username {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.3;
}

/* 프로필 액션 버튼들 */
.profile-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: row;
}

/* 프로필 통계 (사진 우측) */
.profile-stats {
  display: flex;
  flex-direction: row;
  gap: 6.25rem;
  flex: 1;
  align-items: center;
}

.action-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
  height: 40px;
  font-size: 0.9rem;
}

.primary-btn {
  min-width: auto;
  width: auto;
}

.secondary-btn {
  min-width: auto;
  width: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #E87D7D, #f8a5a5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

/* 정보 카드들 */
.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #E87D7D, #f8a5a5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-header h2 {
  font-size: 1.375rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.info-content {
  flex: 1;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.info-content.empty-field {
  color: #94a3b8;
  font-style: italic;
}

.info-content.email {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  color: #475569;
}

/* 소셜 로그인 칩 */
.social-chip {
  font-weight: 500;
}

/* 소셜 로그인 이미지 디스플레이 */
.social-login-display {
  display: flex;
  justify-content: flex-end;
  margin-right: 1rem;
}

.social-logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  transition: all 0.2s ease;
  width: 100px;
  justify-content: center;
}

.social-logo-container.selected {
  background: #F3F4F6;
  border-color: #D1D5DB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.google-logo {
  border-color: #dadce0;
  color: #5f6368;
}

.google-logo:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.kakao-logo {
  border-color: #e0e0e0;
  color: #333333;
}

.kakao-logo.selected {
  background: #F3F4F6;
  border-color: #D1D5DB;
  color: #374151;
}

.kakao-logo:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.social-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.social-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.status-container {
  border-color: #e0e0e0;
  color: #333333;
}

.status-container:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}



/* 계정 관리 섹션 */
.account-management {
  border: 1px solid #e9ecef;
  background: white;
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.password-section {
  display: flex;
  justify-content: flex-start;
}

.management-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.025em;
  border-width: 1px;
  transition: all 0.2s ease;
}

.management-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.password-btn {
  min-width: 200px;
}

.warning-container {
  background: rgba(239, 68, 68, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.warning-text {
  font-size: 0.9rem;
  color: #dc2626;
  margin: 0;
  line-height: 1.5;
}

.delete-btn {
  align-self: flex-start;
  min-width: 200px;
  border-color: #ef4444;
  color: #ef4444;
}

.delete-btn:hover {
  border-color: #dc2626;
  background: rgba(239, 68, 68, 0.05);
  color: #dc2626;
}

/* 성공 모달 스타일 - 코인마켓캡 스타일 */
.success-modal :deep(.v-overlay__content) {
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
}

.success-card {
  max-width: 400px !important;
  width: 100%;
  min-height: 250px;
  overflow: hidden;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%) !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
  box-shadow: 
    0 32px 64px -12px rgba(16, 185, 129, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 8px 32px rgba(16, 185, 129, 0.15) !important;
  border-radius: 24px !important;
  position: relative;
}

.success-header {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
  border-bottom: 1px solid rgba(16, 185, 129, 0.2) !important;
  border-radius: 24px 24px 0 0 !important;
  flex-shrink: 0;
}

.success-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: transparent;
  border: none;
  margin: 0;
  box-shadow: none;
  position: relative;
  flex-shrink: 0;
}

.success-icon svg {
  stroke: none !important;
  stroke-width: 0 !important;
}

.success-icon svg * {
  stroke: none !important;
  stroke-width: 0 !important;
}

.success-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  padding: 16px 32px !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  box-shadow: none !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.success-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  transform: none !important;
  box-shadow: none !important;
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
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-content {
    text-align: left;
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



