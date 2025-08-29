<template>
  <Transition name="likes-slide">
    <div v-if="show" :class="sidebarMode ? 'likes-sidebar' : 'likes-overlay'">
      <div :class="sidebarMode ? 'likes-sidebar-modal' : 'likes-modal'">
      <v-card-title class="modal-title">
        좋아요
      </v-card-title>
      
      <v-card-text class="modal-content">
        <div class="likes-list">
          <!-- 좋아요 목록이 있을 때 -->
          <template v-if="likesList.length > 0">
            <div 
              v-for="(like, index) in likesList" 
              :key="index" 
              class="like-item"
            >
              <v-avatar 
                size="32" 
                class="like-avatar clickable"
                @click="goToUserDiary(like.userId)"
              >
                <v-img :src="like.profileImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center'"></v-img>
              </v-avatar>
              <div class="like-info">
                <span class="like-username clickable" @click="goToUserDiary(like.userId)">{{ like.userName || like.username || like.petName || '익명' }}</span>
                <span class="like-date">{{ like.date }}</span>
              </div>
            </div>
          </template>
          
          <!-- 좋아요 목록이 없을 때 -->
          <div v-else class="empty-likes">
            <v-icon size="48" color="#CBD5E1">mdi-heart-outline</v-icon>
            <p class="empty-text">아직 좋아요가 없습니다</p>
            <p class="empty-subtext">첫 번째 좋아요를 눌러보세요!</p>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="modal-actions">
        <v-btn 
          variant="text"
          @click="closeModal"
          class="close-modal-btn"
        >
          닫기
        </v-btn>
      </v-card-actions>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'LikesModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    likesList: {
      type: Array,
      default: () => []
    },
    sidebarMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  computed: {
    show: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    closeModal() {
      this.show = false
    },
    
    // 사용자 다이어리로 이동하는 메서드
    goToUserDiary(userId) {
      if (userId) {
        this.$router.push(`/diarys/${userId}`)
      }
    }
  }
}
</script>

<style scoped>
/* 사이드바 모드 스타일 */
.likes-sidebar {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  left: auto !important;
  bottom: auto !important;
  width: 400px !important;
  height: 100vh !important;
  background: white !important;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1) !important;
  z-index: 1000 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  border-left: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.likes-sidebar-modal {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  background: white !important;
  overflow: hidden !important;
  border-radius: 0 !important;
  max-width: none !important;
  box-shadow: none !important;
}

/* 중앙 모달 모드 스타일 */
.likes-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.likes-modal {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex-shrink: 0;
}

.modal-content {
  padding: 0;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.likes-list {
  padding: 0;
}

.like-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.like-item:hover {
  background: linear-gradient(135deg, rgba(255, 139, 139, 0.05) 0%, rgba(255, 193, 193, 0.05) 100%);
  transform: translateX(4px);
}

.like-item:last-child {
  border-bottom: none;
}

.like-avatar {
  flex-shrink: 0;
  border: 2px solid #FF8B8B;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
  width: 32px !important;
  height: 32px !important;
}

.like-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  align-items: flex-start;
  text-align: left;
}

.like-username {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1E293B;
  line-height: 1.2;
  text-align: left;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.like-date {
  font-size: 0.75rem;
  color: #64748B;
  line-height: 1.2;
  text-align: left;
}

/* 빈 상태 스타일 */
.empty-likes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  min-height: 200px;
}

.empty-text {
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #64748B;
}

.empty-subtext {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #94A3B8;
}

.modal-actions {
  padding: 16px 24px;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.close-modal-btn {
  color: #FF8B8B !important;
  background: transparent !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  color: #FF6B6B !important;
  background: transparent !important;
  transform: translateY(-1px);
}

/* 좋아요 사이드바 애니메이션 */
.likes-slide-enter-active,
.likes-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.likes-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.likes-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.likes-slide-enter-to,
.likes-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
