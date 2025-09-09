<template>
  <div class="profile-page">
    <!-- 헤더 (배경 위에 직접) -->
    <div class="page-header">
      <h1 class="page-title">프로필</h1>
      <p class="page-subtitle">내 정보를 확인하고 관리하세요</p>
    </div>

    <!-- 프로필 컨테이너 -->
    <div class="profile-container">
      <!-- 통계 정보와 액션 버튼 -->
      <div class="profile-bottom-section">
        <!-- 통합 프로필 카드 -->
        <div class="unified-profile-card">
          <!-- 좌측: 사진과 닉네임 -->
          <div class="profile-left-section">
            <div class="profile-image-container">
              <v-avatar size="156" class="profile-avatar">
                <v-img 
                  v-if="profileImageUrl" 
                  :src="profileImageUrl" 
                  alt="대표 반려동물 이미지"
                  cover
                />
                <v-icon v-else size="78" color="#64748b">mdi-paw</v-icon>
              </v-avatar>
            </div>
            <div class="profile-nickname">
              <h2 class="nickname-text">@{{ userInfo?.nickname || '닉네임 없음' }}</h2>
            </div>
          </div>
          
          <!-- 우측: 통계 정보 2x2 그리드 -->
          <div class="profile-right-section">
            <div class="stats-grid">
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
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon>mdi-shield-key</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">로그인 방식</div>
                <div class="stat-value">
                  <div class="social-container">
                    <img 
                      v-if="userInfo?.socialType === 'KAKAO'"
                      src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" 
                      alt="Kakao" 
                      class="social-logo"
                    />
                    <img 
                      v-else-if="userInfo?.socialType === 'GOOGLE'"
                      src="https://developers.google.com/identity/images/g-logo.png" 
                      alt="Google" 
                      class="social-logo"
                    />
                    <v-icon 
                      v-else-if="userInfo?.socialType === 'COMMON'"
                      size="24" 
                      color="#6B7280"
                      class="social-icon"
                    >
                      mdi-email
                    </v-icon>
                    <span class="social-text">{{ getSocialTypeLabel(userInfo?.socialType) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon>mdi-check-circle</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">계정 상태</div>
                <div class="stat-value">
                  <div class="status-container">
                    <div class="status-indicator" :class="getStatusClass(userInfo?.userStatus)"></div>
                    <span class="status-text">{{ getStatusText(userInfo?.userStatus) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- 정보 박스 섹션 -->
      <div class="info-boxes-section">
        <!-- 이름 박스 -->
        <div class="info-box">
          <div class="info-label">
            <v-icon size="16" color="#64748b" icon="mdi-account" />
            <span>이름</span>
          </div>
          <div class="info-field" :class="{ 'empty-field': !userInfo?.name }">
            {{ userInfo?.name || '정보 없음' }}
          </div>
        </div>
        
        <!-- 닉네임 박스 -->
        <div class="info-box">
          <div class="info-label">
            <v-icon size="16" color="#64748b" icon="mdi-at" />
            <span>닉네임</span>
          </div>
          <div class="info-field">
            {{ userInfo?.nickname || '-' }}
          </div>
        </div>
        
        
        <!-- 이메일 박스 -->
        <div class="info-box">
          <div class="info-label">
            <v-icon size="16" color="#64748b" icon="mdi-email" />
            <span>이메일</span>
          </div>
          <div class="info-field">
            {{ userInfo?.email || '-' }}
          </div>
        </div>
        
        <!-- 프로필 수정 버튼 -->
        <div class="profile-edit-button-container">
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

    <!-- 계정관리 카드 (기존 구조 그대로) -->
    <div class="account-management-card">
        <div class="card-header">
          <h2>계정 관리</h2>
        </div>
        
      <div class="account-management-content">
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
          
        <!-- 계정 탈퇴 섹션 -->
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
      v-model="showDeleteModal"
      @confirm="handleDeleteAccountConfirm"
      @cancel="showDeleteModal = false"
    />

    <!-- 성공 모달 -->
    <v-dialog 
      v-model="showSuccessModal" 
      max-width="480" 
      persistent
      class="success-modal"
    >
      <v-card class="success-card">
        <v-card-title class="d-flex align-center w-100 position-relative">
          <div class="success-icon-container mr-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10b981"></circle>
              <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="flex-1 text-center">
            <h3 class="modal-title">계정 삭제 완료</h3>
          </div>
          <div class="success-icon-container" style="opacity: 0;">
            <!-- 투명한 스페이서로 완벽한 중앙 정렬 -->
          </div>
        </v-card-title>
        <v-card-text class="text-center">
          <p class="modal-subtitle">계정이 성공적으로 삭제되었습니다</p>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-btn 
            color="#10b981"
            variant="flat"
            rounded="lg"
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
import { computed, onMounted, ref } from 'vue'
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
    
    // 반응형 상태
    const showEditModal = ref(false)
    const showChangePasswordModal = ref(false)
    const showDeleteModal = ref(false)
    const showSuccessModal = ref(false)
    const forceImageUrl = ref('')
    
    // 계산된 속성
    const userInfo = computed(() => authStore.user)
    const pets = computed(() => petStore.pets || [])
    
    // 프로필 이미지 URL
    const profileImageUrl = computed(() => {
      if (forceImageUrl.value) {
        return forceImageUrl.value
      }
      
      // 🔥 representativePet 사용 (메인펫)
      const mainPet = petStore.representativePet
      
      if (mainPet) {
        // 여러 가능한 이미지 필드 확인
        const imageUrl = mainPet?.profileImage?.imageUrl || 
                        mainPet?.url || 
                        mainPet?.imageUrl ||
                        mainPet?.image?.url
        
        if (imageUrl) {
          return imageUrl
        }
      }
      
      // 대표펫이 없으면 첫 번째 ACTIVE 펫 사용
      const activePets = pets.value?.filter(pet => pet.status === 'ACTIVE') || []
      
      if (activePets.length > 0) {
        const firstPet = activePets[0]
        
        const imageUrl = firstPet?.profileImage?.imageUrl || 
                        firstPet?.url || 
                        firstPet?.imageUrl ||
                        firstPet?.image?.url
        
        if (imageUrl) {
          return imageUrl
        }
      }
      
      return null
    })

    // 메서드들
    const openEditModal = () => {
      showEditModal.value = true
    }

    const changePassword = () => {
      showChangePasswordModal.value = true
    }

    const deleteAccount = () => {
      showDeleteModal.value = true
    }

    const handleProfileUpdateSuccess = async () => {
      console.log('프로필 수정 성공')
      // 사용자 정보 다시 불러오기
      try {
        await authStore.getCurrentUser()
      } catch (error) {
        console.error('사용자 정보 새로고침 오류:', error)
      }
    }

    const handlePasswordChangeSuccess = () => {
      console.log('비밀번호 변경 성공')
    }

    const handleDeleteAccountConfirm = async () => {
      try {
        await userAPI.delete()
        showDeleteModal.value = false
        showSuccessModal.value = true
        await authStore.logout()
        router.push('/')
      } catch (error) {
        console.error('계정 삭제 오류:', error)
      }
    }

    const handleSuccessConfirm = async () => {
      showSuccessModal.value = false
      await authStore.logout()
      router.push('/login')
    }

    const handleImageError = () => {
      console.log('이미지 로드 오류')
    }

    const handleImageLoad = () => {
      console.log('이미지 로드 성공')
    }

    const formatJoinDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
      } catch (error) {
        return '-'
      }
    }

    const getSocialTypeLabel = (socialType) => {
      const labels = {
        'COMMON': '이메일',
        'KAKAO': 'Kakao',
        'GOOGLE': 'Google'
      }
      return labels[socialType] || '알 수 없음'
    }

    const getStatusText = (status) => {
      const statusTexts = {
        'ACTIVE': '활성',
        'INACTIVE': '비활성',
        'SUSPENDED': '정지됨'
      }
      return statusTexts[status] || '알 수 없음'
    }

    const getStatusClass = (status) => {
      const statusClasses = {
        'ACTIVE': 'status-active',
        'INACTIVE': 'status-inactive',
        'SUSPENDED': 'status-suspended'
      }
      return statusClasses[status] || 'status-unknown'
    }

    // 라이프사이클
    onMounted(async () => {
      try {
        // 사용자 정보와 펫 정보를 동시에 로드
        await Promise.all([
          authStore.getCurrentUser(),
          petStore.fetchPets()
        ])
      } catch (error) {
        console.error('정보 로드 오류:', error)
      }
    })
    
    return {
      // 상태
      showEditModal,
      showChangePasswordModal,
      showDeleteModal,
      showSuccessModal,
      forceImageUrl,
      
      // 계산된 속성
      userInfo,
      pets,
      profileImageUrl,
      
      // 메서드
      openEditModal,
      changePassword,
      deleteAccount,
      handleProfileUpdateSuccess,
      handlePasswordChangeSuccess,
      handleDeleteAccountConfirm,
      handleSuccessConfirm,
      handleImageError,
      handleImageLoad,
      formatJoinDate,
      getSocialTypeLabel,
      getStatusText,
      getStatusClass,
      
      // 스토어
      authStore,
      petStore
    }
  }
}
</script>

<style scoped>
/* 기본 페이지 스타일 */
.profile-page {
  min-height: 100vh;
  background: var(--v-theme-surface-light);
  padding: 2rem 0;
}

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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 프로필 중앙 섹션 (이미지 + 닉네임) */
.profile-center-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;
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
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  pointer-events: none;
  user-select: none;
}

/* 프로필 하단 섹션 (통계 + 액션 버튼) */
.profile-bottom-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.2rem;
  padding: 1.2rem 0;
  min-height: 120px;
}

/* 통합 프로필 카드 */
.unified-profile-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 3rem;
  width: 100%;
  max-width: 900px;
}

/* 닉네임 섹션 */
.username-section {
  text-align: center;
}

.username {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}


/* 좌측 섹션 (사진과 닉네임) */
.profile-left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex: 0 0 auto;
}

.profile-nickname {
  text-align: center;
}

.nickname-text {
  font-size: 1.8rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

/* 우측 섹션 (통계 그리드와 액션 버튼) */
.profile-right-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  align-items: flex-start;
  justify-content: center;
}


/* 통계 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  align-items: start;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 프로필 통계 */
.profile-stats {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: center;
  margin-left: 2rem;
  flex-wrap: wrap;
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

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #E87D7D, #d16b6b);
  border-radius: 12px;
  flex-shrink: 0;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  text-align: center;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

/* 정보 박스 섹션 */
.info-boxes-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.2rem;
  padding: 1.2rem 0;
}

/* 프로필 수정 버튼 컨테이너 */
.profile-edit-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
}

.info-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.info-field {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  min-height: 20px;
  display: flex;
  align-items: center;
}

.empty-field {
  color: #9ca3af;
  font-style: italic;
}

.social-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.social-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.social-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-text {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-active {
  background: #10b981;
}

.status-inactive {
  background: #f59e0b;
}

.status-suspended {
  background: #ef4444;
}

.status-unknown {
  background: #6b7280;
}

.status-text {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

/* 계정관리 카드 (기존 구조 그대로) */
.account-management-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.account-management-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.password-section {
  display: flex;
  justify-content: flex-start;
}


.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.warning-container {
  background: linear-gradient(135deg, #fef7f7 0%, #fef2f2 100%);
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
}

.warning-text {
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.management-btn {
  min-width: 140px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
}

.delete-btn {
  align-self: flex-start;
}

/* 성공 모달 스타일 */
.success-modal .v-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.success-card {
  border-radius: 20px !important;
  overflow: hidden;
  max-width: 480px;
  min-height: 280px;
}

.success-card .v-card-title {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.success-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  text-align: center;
}

.modal-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 1rem 0 0 0;
  line-height: 1.5;
}

.success-btn {
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0.025em;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .profile-header {
    padding: 0 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .profile-stats {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    text-align: center;
  }
  
  .profile-bottom-section {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }
  
  .profile-right-section {
    align-items: center;
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
  
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
    max-width: 200px;
  }
  
  .unified-info-section {
    gap: 1rem;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-content {
    text-align: left;
    width: 100%;
  }
  
  .stat-item {
    justify-content: center;
  }
  
  .info-boxes-section {
    gap: 0.75rem;
  }
  
  .info-field {
    padding: 0.5rem 0.75rem;
  }
}
</style>
