<template>
  <v-navigation-drawer
    v-model="isOpen"
    location="left"
    temporary
    width="400"
    class="notification-drawer"
  >
    <!-- 헤더 -->
    <div class="drawer-header">
      <div class="header-content">
        <h2 class="drawer-title">
          <v-icon size="24" color="#E87D7D" class="mr-2">mdi-bell</v-icon>
          알림
        </h2>
        <v-btn
          icon
          variant="text"
          @click="closeDrawer"
          class="close-btn"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 알림 목록 -->
    <div class="notification-list">
      <div v-if="notifications.length === 0" class="empty-state">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-bell-off</v-icon>
        <h3 class="empty-title">알림이 없습니다</h3>
        <p class="empty-text">새로운 알림이 오면 여기에 표시됩니다.</p>
      </div>

      <div v-else class="notifications">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <v-icon 
              :color="getNotificationIconColor(notification.type)"
              size="20"
            >
              {{ getNotificationIcon(notification.type) }}
            </v-icon>
          </div>
          
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
          </div>
          
          <div v-if="!notification.read" class="unread-indicator"></div>
        </div>
      </div>
    </div>

    <!-- 하단 액션 버튼들 -->
    <template v-slot:append>
      <div class="drawer-actions">
        <v-divider class="mb-3"></v-divider>
        <div class="action-buttons">
          <v-btn
            variant="outlined"
            color="primary"
            size="small"
            @click="markAllAsRead"
            :disabled="!hasUnreadNotifications"
          >
            <v-icon size="16" class="mr-1">mdi-check-all</v-icon>
            모두 읽음 처리
          </v-btn>
          
          <v-btn
            variant="outlined"
            color="error"
            size="small"
            @click="clearAllNotifications"
            :disabled="notifications.length === 0"
          >
            <v-icon size="16" class="mr-1">mdi-delete-sweep</v-icon>
            모두 삭제
          </v-btn>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'NotificationDrawer',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    // 샘플 알림 데이터 (실제로는 API에서 가져올 예정)
    const notifications = ref([
      {
        id: 1,
        title: '새 메시지',
        message: 'admin님이 메시지를 보냈습니다.',
        type: 'chat',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5분 전
      },
      {
        id: 2,
        title: '다이어리 좋아요',
        message: '사용자님이 당신의 다이어리에 좋아요를 눌렀습니다.',
        type: 'like',
        read: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30분 전
      },
      {
        id: 3,
        title: '새 팔로워',
        message: '새로운 사용자가 당신을 팔로우했습니다.',
        type: 'follow',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 전
      }
    ])

    const hasUnreadNotifications = computed(() => {
      return notifications.value.some(notification => !notification.read)
    })

    const closeDrawer = () => {
      isOpen.value = false
    }

    const getNotificationIcon = (type) => {
      const icons = {
        chat: 'mdi-chat',
        like: 'mdi-heart',
        follow: 'mdi-account-plus',
        comment: 'mdi-comment',
        system: 'mdi-information'
      }
      return icons[type] || 'mdi-bell'
    }

    const getNotificationIconColor = (type) => {
      const colors = {
        chat: '#2196F3',
        like: '#E91E63',
        follow: '#4CAF50',
        comment: '#FF9800',
        system: '#9C27B0'
      }
      return colors[type] || '#6C757D'
    }

    const formatTime = (date) => {
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 1) return '방금 전'
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      if (days < 7) return `${days}일 전`
      return date.toLocaleDateString('ko-KR')
    }

    const markAsRead = (notificationId) => {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    }

    const markAllAsRead = () => {
      notifications.value.forEach(notification => {
        notification.read = true
      })
    }

    const clearAllNotifications = () => {
      notifications.value = []
    }

    return {
      isOpen,
      notifications,
      hasUnreadNotifications,
      closeDrawer,
      getNotificationIcon,
      getNotificationIconColor,
      formatTime,
      markAsRead,
      markAllAsRead,
      clearAllNotifications
    }
  }
}
</script>

<style scoped>
.notification-drawer {
  background: #FFFFFF;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.drawer-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.close-btn {
  color: white !important;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #6C757D;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.empty-text {
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
}

.notifications {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #F8F9FA;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: #F1F3F4;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  background: rgba(232, 125, 125, 0.05);
  border-color: rgba(232, 125, 125, 0.2);
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(232, 125, 125, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2C3E50;
  margin-bottom: 4px;
  line-height: 1.3;
}

.notification-message {
  font-size: 0.85rem;
  color: #6C757D;
  margin-bottom: 8px;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.unread-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E87D7D;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(232, 125, 125, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(232, 125, 125, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(232, 125, 125, 0);
  }
}

.drawer-actions {
  padding: 16px;
  background: #F8F9FA;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .v-btn {
  flex: 1;
  font-size: 0.8rem;
}

/* 스크롤바 스타일링 */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 반응형 */
@media (max-width: 600px) {
  .notification-drawer {
    width: 100% !important;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .notification-drawer {
    background: #1A1A1A;
    border-right-color: rgba(255, 255, 255, 0.1);
  }
  
  .notification-item {
    background: #2D2D2D;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .notification-item:hover {
    background: #3D3D3D;
  }
  
  .notification-item.unread {
    background: rgba(232, 125, 125, 0.1);
    border-color: rgba(232, 125, 125, 0.3);
  }
  
  .notification-title {
    color: #F8F9FA;
  }
  
  .notification-message {
    color: #ADB5BD;
  }
  
  .notification-time {
    color: #6C757D;
  }
  
  .drawer-actions {
    background: #2D2D2D;
  }
}
</style>
