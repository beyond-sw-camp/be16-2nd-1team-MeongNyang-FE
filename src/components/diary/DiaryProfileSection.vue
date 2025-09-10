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
    <v-dialog v-model="showMainPetModal" max-width="400">
      <v-card class="main-pet-modal">
        <v-card-title class="modal-title">
          대표동물 변경
        </v-card-title>
        
        <v-card-text class="modal-content">
          <div class="current-pet-section">
            <v-avatar size="60" class="current-pet-avatar">
              <v-img :src="profileImageUrl"></v-img>
            </v-avatar>
            <v-select
              v-model="selectedPet"
              :items="userPets"
              item-title="name"
              item-value="id"
              label="대표동물 선택"
              variant="outlined"
              class="pet-select"
            ></v-select>
          </div>
        </v-card-text>
        
        <v-card-actions class="modal-actions">
          <v-btn 
            color="primary" 
            variant="elevated"
            @click="changeMainPet"
            class="change-button"
          >
            변경
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

const changeMainPet = async () => {
  try {
    if (!selectedPet.value) {
      alert('동물을 선택해주세요');
      return;
    }
    await userAPI.setMainPet(selectedPet.value);
    alert('대표동물이 변경되었습니다!');
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
.main-pet-modal {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  padding: 28px 28px 0 28px;
}

.modal-content {
  padding: 28px;
}

.current-pet-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-pet-avatar {
  border: 3px solid #FF8B8B;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3);
}

.pet-select {
  flex: 1;
}

.modal-actions {
  padding: 0 28px 28px 28px;
  justify-content: center;
}

.change-button {
  background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
  color: white;
  font-weight: 600;
  padding: 14px 36px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(255, 139, 139, 0.3);
  transition: all 0.3s ease;
}

.change-button:hover {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8B8B 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.4);
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
}
</style>
