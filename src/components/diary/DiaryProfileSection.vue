<template>
  <div class="profile-section">
    <div class="profile-container">
      <!-- 프로필 이미지 -->
      <div class="profile-image-container" @click="isMyProfile && (showMainPetModal = true)">
        <v-avatar size="120" class="profile-avatar">
          <v-img 
            :src="profileImageUrl" 
            :alt="mainPet?.name || '프로필 이미지'"
          ></v-img>
        </v-avatar>
        <div v-if="isMyProfile" class="edit-hint">
          <v-icon size="16">mdi-pencil</v-icon>
          <span>대표동물 변경</span>
        </div>
      </div>
      
      <!-- 사용자 정보 -->
      <div class="user-info">
        <div class="username-section">
          <h2 class="username">{{ displayUserName }}</h2>
          <div class="badges">
            <v-chip color="light-blue" size="small" class="badge">
              <v-icon size="16" class="me-1">mdi-check</v-icon>
              인증됨
            </v-chip>
            <v-chip color="amber" size="small" class="badge">
              <v-icon size="16" class="me-1">mdi-star</v-icon>
              프리미엄
            </v-chip>
            <v-chip color="light-green" size="small" class="badge">
              <v-icon size="16" class="me-1">mdi-trophy</v-icon>
              활동왕
            </v-chip>
          </div>
        </div>
        
        <!-- 통계 -->
        <div class="stats">
          <span class="stat-item">{{ postsCount }} 게시물</span>
          <span class="stat-item clickable" @click="$emit('open-follow-modal', 'followers')">{{ followersCount }} 팔로워</span>
          <span class="stat-item clickable" @click="$emit('open-follow-modal', 'followings')">{{ followingsCount }} 팔로잉</span>
          <span 
              v-if="!isMyProfile && !isFollowing"
              class="stat-item follow-stat clickable"
              @click="$emit('follow')"
            >
              팔로우
            </span>
            <span 
              v-if="!isMyProfile && isFollowing"
              class="stat-item unfollow-stat clickable"
              @click="$emit('unfollow')"
            >
              언팔로우
            </span>
        </div>
        
        <!-- 소개 -->
        <p class="bio">{{ petBio }}</p>
      </div>
      
      <!-- 추가 버튼 -->
      <v-btn v-if="isMyProfile" icon class="add-button" size="large" @click="$router.push('/diarys/create')">
        <v-icon size="32">mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- 대표동물 변경 모달 -->
    <v-dialog v-model="showMainPetModal" max-width="600" class="main-pet-dialog">
      <v-card class="main-pet-modal">
        <v-card-title class="modal-header">
          <div class="header-content">
            <v-icon size="28" class="header-icon">mdi-paw</v-icon>
            <h2 class="modal-title">대표동물 변경</h2>
          </div>
          <v-btn 
            icon 
            variant="text" 
            size="small" 
            @click="showMainPetModal = false"
            class="close-button"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="modal-content">
          <!-- 현재 대표동물 표시 -->
          <div class="current-pet-display">
            <div class="current-label">
              <v-icon size="16" class="me-2">mdi-star</v-icon>
              현재 대표동물
            </div>
            <div class="current-pet-card">
              <v-avatar size="80" class="current-pet-avatar">
                <v-img :src="profileImageUrl" :alt="mainPet?.name"></v-img>
              </v-avatar>
              <div class="current-pet-info">
                <h3 class="current-pet-name">{{ mainPet?.name || '대표동물 없음' }}</h3>
                <p class="current-pet-species">{{ mainPet?.species || '' }}</p>
              </div>
            </div>
          </div>

          <!-- 동물 선택 섹션 -->
          <div class="pet-selection-section">
            <div class="selection-label">
              <v-icon size="16" class="me-2">mdi-paw</v-icon>
              새로운 대표동물 선택
            </div>
            <div class="pet-grid">
              <div 
                v-for="pet in userPets" 
                :key="pet.id"
                class="pet-card"
                :class="{ 'selected': selectedPet === pet.id, 'current': mainPet?.id === pet.id }"
                @click="selectPet(pet.id)"
              >
                <div class="pet-card-content">
                  <v-avatar size="60" class="pet-avatar">
                    <v-img :src="pet.url || '/default-pet.png'" :alt="pet.name"></v-img>
                  </v-avatar>
                  <div class="pet-info">
                    <h4 class="pet-name">{{ pet.name }}</h4>
                    <p class="pet-species">{{ pet.species }}</p>
                  </div>
                  <div class="selection-indicator">
                    <v-icon v-if="selectedPet === pet.id" size="20" class="selected-icon">mdi-check-circle</v-icon>
                    <v-icon v-else-if="mainPet?.id === pet.id" size="20" class="current-icon">mdi-star</v-icon>
                    <v-icon v-else size="20" class="unselected-icon">mdi-circle-outline</v-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="modal-actions">
          <v-btn 
            variant="outlined"
            @click="showMainPetModal = false"
            class="cancel-button"
          >
            취소
          </v-btn>
          <v-btn 
            color="primary" 
            variant="elevated"
            @click="changeMainPet"
            class="change-button"
            :disabled="!selectedPet || selectedPet === mainPet?.id"
          >
            <v-icon size="18" class="me-2">mdi-check</v-icon>
            변경하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { usePetStore } from '@/stores/pet';

const props = defineProps({
  userInfo: Object,
  postsCount: Number,
  followersCount: Number,
  followingsCount: Number,
  mainPet: Object,
  userPets: Array,
  profileImageUrl: String,
  displayUserName: String,
  petBio: String,
  isMyProfile: {
    type: Boolean,
    default: true,
  },
  isFollowing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['open-follow-modal', 'change-main-pet', 'follow', 'unfollow']);

const authStore = useAuthStore();
const petStore = usePetStore();

const showMainPetModal = ref(false);
const selectedPetId = ref(null);

const selectedPet = computed({
  get: () => selectedPetId.value || props.mainPet?.id || null,
  set: value => {
    selectedPetId.value = value;
  },
});

watch(() => props.mainPet, (newVal) => {
  if (newVal) {
    selectedPetId.value = newVal.id;
  }
}, { immediate: true });

const selectPet = (petId) => {
  selectedPetId.value = petId;
};

const changeMainPet = async () => {
  try {
    if (!selectedPet.value) {
      alert('동물을 선택해주세요');
      return;
    }
    await userAPI.setMainPet(selectedPet.value);
    showMainPetModal.value = false;
    selectedPetId.value = null;
    await authStore.fetchMyPageInfo();
    await petStore.fetchPets();
    emit('change-main-pet'); // Emit event to parent if needed for further actions
  } catch (error) {
    console.error('대표동물 변경 실패:', error);
    alert('대표동물 변경에 실패했습니다.');
  }
};
</script>

<style scoped>
.profile-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 40px;
}

.profile-image-container {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-image-container:hover {
  transform: scale(1.02);
}

.profile-avatar {
  border: 4px solid #FF8B8B;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.3);
  transition: all 0.3s ease;
}

.profile-image-container:hover .profile-avatar {
  border-color: #FF6B6B;
  box-shadow: 0 12px 32px rgba(255, 139, 139, 0.4);
}

.edit-hint {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748B;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.profile-image-container:hover .edit-hint {
  opacity: 1;
  bottom: -12px;
}

.user-info {
  flex: 1;
}

.username-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.username {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.badges {
  display: flex;
  gap: 10px;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat-item {
  font-size: 0.9rem;
  color: #64748B;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(255, 139, 139, 0.1);
  border: 1px solid rgba(255, 139, 139, 0.2);
  border-radius: 20px;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  background: rgba(255, 139, 139, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.3);
}

.follow-stat {
  background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
  color: white;
  border: 1px solid #FF8B8B;
  transition: all 0.3s ease;
}

.follow-stat:hover {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8B8B 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.3);
}

.unfollow-stat {
  background: rgba(100, 116, 139, 0.1);
  color: #64748B;
  border: 1px solid #64748B;
  transition: all 0.3s ease;
}

.unfollow-stat:hover {
  background: rgba(100, 116, 139, 0.2);
  color: #475569;
  border-color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);
}

.bio {
  font-size: 0.95rem;
  color: #475569;
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

.add-button {
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(30, 41, 59, 0.3);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.add-button:hover {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(30, 41, 59, 0.4);
}

/* 모달 스타일 */
.main-pet-dialog :deep(.v-overlay__content) {
  border-radius: 32px !important;
  overflow: hidden;
}

.main-pet-modal {
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
  color: white;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.close-button {
  color: white !important;
  opacity: 0.8;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
}

.close-button:hover {
  opacity: 1;
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.3) !important;
}

.modal-content {
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 현재 대표동물 표시 */
.current-pet-display {
  margin-bottom: 32px;
}

.current-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 16px;
}

.current-pet-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 139, 139, 0.1) 0%, rgba(255, 193, 193, 0.1) 100%);
  border: 2px solid rgba(255, 139, 139, 0.2);
  border-radius: 24px;
  transition: all 0.3s ease;
}

.current-pet-card:hover {
  border-color: rgba(255, 139, 139, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.2);
}

.current-pet-avatar {
  border: 3px solid #FF8B8B;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3);
}

.current-pet-info {
  flex: 1;
}

.current-pet-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 4px 0;
}

.current-pet-species {
  font-size: 0.9rem;
  color: #64748B;
  margin: 0;
}

/* 동물 선택 섹션 */
.pet-selection-section {
  margin-top: 24px;
}

.selection-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 20px;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.pet-card {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 139, 139, 0.2);
  border-radius: 24px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pet-card:hover {
  border-color: rgba(255, 139, 139, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.2);
}

.pet-card.selected {
  border-color: #FF8B8B;
  background: linear-gradient(135deg, rgba(255, 139, 139, 0.1) 0%, rgba(255, 193, 193, 0.1) 100%);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.3);
}

.pet-card.current {
  border-color: #FFD700;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 193, 0.1) 100%);
}

.pet-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  position: relative;
}

.pet-avatar {
  border: 2px solid rgba(255, 139, 139, 0.3);
  transition: all 0.3s ease;
}

.pet-card.selected .pet-avatar {
  border-color: #FF8B8B;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3);
}

.pet-card.current .pet-avatar {
  border-color: #FFD700;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
}

.pet-info {
  flex: 1;
}

.pet-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 4px 0;
}

.pet-species {
  font-size: 0.8rem;
  color: #64748B;
  margin: 0;
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}

.selected-icon {
  color: #FF8B8B;
}

.current-icon {
  color: #FFD700;
}

.unselected-icon {
  color: #CBD5E1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px 32px 32px;
  background: rgba(248, 250, 252, 0.8);
}

.cancel-button {
  background: #F5F5F5 !important;
  color: #666 !important;
  border: 2px solid #E0E0E0 !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-width: 100px !important;
  height: 48px !important;
}

.cancel-button:hover:not(:disabled) {
  background: #EEEEEE !important;
  border-color: #BDBDBD !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.change-button {
  background: linear-gradient(135deg, #FF8B8B 0%, #FF6B6B 50%, #FF5252 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-width: 120px !important;
  height: 48px !important;
  box-shadow: 0 6px 20px rgba(255, 139, 139, 0.4), 0 2px 8px rgba(255, 107, 107, 0.3) !important;
  position: relative;
}

.change-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  border-radius: 12px;
  pointer-events: none;
}

.change-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 50%, #FF1744 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.6), 0 4px 12px rgba(255, 107, 107, 0.4) !important;
}

.change-button:disabled {
  background: #E2E8F0 !important;
  color: #94A3B8 !important;
  box-shadow: none !important;
  cursor: not-allowed;
  transform: none !important;
}

.change-button:active {
  transform: translateY(0) scale(0.98);
}

.cancel-button:active {
  transform: translateY(0) scale(0.98);
}

/* 반응형 */
@media (max-width: 768px) {
  .profile-section {
    padding: 28px;
  }
  
  .profile-container {
    flex-direction: column;
    text-align: center;
    gap: 28px;
  }
  
  .username-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats {
    justify-content: center;
    flex-wrap: wrap;
  }

  /* 모달 모바일 스타일 */
  .main-pet-modal {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }

  .modal-header {
    padding: 20px 24px;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-content {
    padding: 24px;
  }

  .current-pet-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .pet-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .pet-card {
    padding: 16px;
  }

  .modal-actions {
    padding: 20px 24px 24px 24px;
    flex-direction: column;
    gap: 12px;
  }

  .cancel-button,
  .change-button {
    width: 100%;
  }

  .cancel-button:last-child,
  .change-button:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  .profile-section {
    padding: 24px;
  }
  
  .stats {
    gap: 16px;
  }
  
  .stat-item {
    font-size: 0.8rem;
    padding: 6px 12px;
  }

  /* 모달 모바일 스타일 */
  .main-pet-modal {
    margin: 12px;
    max-width: calc(100vw - 24px);
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .modal-content {
    padding: 20px;
  }

  .current-pet-card {
    padding: 16px;
  }

  .current-pet-avatar {
    width: 60px !important;
    height: 60px !important;
  }

  .current-pet-name {
    font-size: 1.1rem;
  }

  .pet-card {
    padding: 12px;
  }

  .pet-avatar {
    width: 50px !important;
    height: 50px !important;
  }

  .pet-name {
    font-size: 0.9rem;
  }

  .pet-species {
    font-size: 0.75rem;
  }
}

@media (min-width: 769px) {
  .modal-actions {
    flex-direction: row;
  }
}
</style>
