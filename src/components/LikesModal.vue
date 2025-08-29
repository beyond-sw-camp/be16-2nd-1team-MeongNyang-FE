<template>
  <v-dialog v-model="show" max-width="400">
    <v-card class="likes-modal">
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
    </v-card>
  </v-dialog>
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
.likes-modal {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-content {
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.likes-list {
  padding: 16px 0;
}

.like-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.like-item:hover {
  background: linear-gradient(135deg, rgba(255, 139, 139, 0.05) 0%, rgba(255, 193, 193, 0.05) 100%);
  transform: translateX(4px);
}

.like-avatar {
  flex-shrink: 0;
  border: 2px solid #FF8B8B;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
}

.like-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.like-username {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1E293B;
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
}

/* 빈 상태 스타일 */
.empty-likes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
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
  padding: 20px 24px;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
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
</style>
