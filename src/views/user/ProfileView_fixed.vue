<template>
  <div class="profile-page">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1 class="page-title">프로필</h1>
      <p class="page-subtitle">내 정보를 확인하고 관리하세요</p>
    </div>

    <!-- 프로필 헤더 섹션 -->
    <div class="profile-header">
      <!-- 프로필 이미지와 닉네임 (중앙 정렬) -->
      <div class="profile-center-section">
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
        
        <!-- 닉네임 -->
        <div class="username-section">
          <h1 class="username">@{{ userInfo?.nickname || '사용자' }}</h1>
        </div>
      </div>
      
      <!-- 통계 정보와 액션 버튼 -->
      <div class="profile-bottom-section">
        <!-- 통계 정보 -->
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

      <!-- 통합 정보 섹션 -->
      <div class="unified-info-section">
        <!-- 기본 정보 -->
        <div class="info-section">
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
          </div>
        </div>

        <!-- 계정 정보 -->
        <div class="info-section">
          <div class="info-list">
            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-shield-key" />
                <span>로그인 방식</span>
              </div>
              <div class="info-content">
                <div class="social-info">
                  <img 
                    v-if="userInfo?.socialType === 'KAKAO'"
                    src="@/assets/kakao_login.png" 
                    alt="Kakao"
                    class="social-logo"
                  />
                  <span class="social-text">{{ getSocialTypeLabel(userInfo?.socialType) }}</span>
                </div>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-check-circle" />
                <span>계정 상태</span>
              </div>
              <div class="info-content">
                <div class="social-info">
                  <img 
                    v-if="userInfo?.userStatus === 'ACTIVE'"
                    src="@/assets/google_login.png" 
                    alt="Active"
                    class="social-logo"
                  />
                  <span class="social-text">{{ getStatusText(userInfo?.userStatus) }}</span>
                </div>
              </div>
            </div>

            <div class="info-row">
              <div class="info-label">
                <v-icon size="16" color="#64748b" icon="mdi-email" />
                <span>이메일</span>
              </div>
              <div class="info-content">
                {{ userInfo?.email || '-' }}
              </div>
            </div>
          </div>
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
      
      const activePets = pets.value?.filter(pet => pet.status === 'ACTIVE') || []
      if (activePets.length > 0) {
        const firstPet = activePets[0]
        if (firstPet?.profileImage?.imageUrl) {
          return firstPet.profileImage.imageUrl
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

    const handleProfileUpdateSuccess = () => {
      console.log('프로필 수정 성공')
    }

    const handlePasswordChangeSuccess = () => {
      console.log('비밀번호 변경 성공')
    }

    const handleDeleteAccountConfirm = async () => {
      try {
        await userAPI.delete()
        showDeleteModal.value = false
        showSuccessModal.value = true
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
        'COMMON': '로그인 방식',
        'KAKAO': 'Kakao',
        'GOOGLE': 'Google'
      }
      return labels[socialType] || '알 수 없음'
    }

    const getStatusText = (status) => {
      const statusTexts = {
        'ACTIVE': '계정 상태',
        'INACTIVE': '비활성',
        'SUSPENDED': '정지됨'
      }
      return statusTexts[status] || '알 수 없음'
    }

    // 라이프사이클
    onMounted(async () => {
      try {
        await petStore.fetchPets()
      } catch (error) {
        console.error('펫 정보 로드 오류:', error)
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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
  background: linear-gradient(135deg, #e87d7d, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

.profile-header {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* 프로필 중앙 섹션 (이미지 + 닉네임) */
.profile-center-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
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

/* 프로필 하단 섹션 (통계 + 액션 버튼) */
.profile-bottom-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
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

/* 통계 섹션 */
.stat-item {
  display: flex;
  gap: 0.75rem;
  flex-direction: row;
}

/* 프로필 통계 */
.profile-stats {
  display: flex;
  flex-direction: row;
  gap: 3rem;
  flex: 1;
  justify-content: center;
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

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e87d7d, #f093fb);
  border-radius: 12px;
  flex-shrink: 0;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
}

/* 통합 정보 섹션 */
.unified-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.info-section {
  display: flex;
  flex-direction: column;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  min-width: 120px;
}

.info-content {
  flex: 1;
  text-align: right;
  color: #64748b;
}

.empty-field {
  color: #9ca3af;
  font-style: italic;
}

.social-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.social-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.social-text {
  font-size: 0.9rem;
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

.info-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
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
}
</style>
