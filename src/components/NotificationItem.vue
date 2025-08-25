<template>
  <div
    class="notification-item"
    :class="{ 'unread': alarm.isRead == 'FALSE', 'read': alarm.isRead == 'TRUE' }"
    @click="handleClick"
  >
    <div class="notification-icon">
      <v-icon 
        :color="getAlarmIconColor(alarm.alarmType)"
        size="20"
      >
        {{ getAlarmIcon(alarm.alarmType) }}
      </v-icon>
    </div>
    
    <div class="notification-content">
      <div class="notification-title" :class="{ 'unread-text': alarm.isRead == 'FALSE' }">
        {{ alarm.content }}
      </div>
      <div class="notification-type">{{ getAlarmTypeText(alarm.alarmType) }}</div>
      <div class="notification-time">{{ formatTime(alarm.createdAt) }}</div>
    </div>
    
    <!-- 읽음/안읽음 상태 표시 -->
    <div class="read-status">
      <div v-if="alarm.isRead == 'FALSE'" class="unread-indicator"></div>
      <div v-else class="read-indicator">
        <v-icon size="12" color="grey">mdi-check</v-icon>
      </div>
    </div>
    
    <!-- 삭제 버튼 -->
    <v-btn
      icon
      variant="text"
      size="small"
      color="grey"
      class="delete-btn"
      @click.stop="handleDelete"
    >
      <v-icon size="16">mdi-close</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'NotificationItem',
  props: {
    alarm: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'delete'],
  setup(props, { emit }) {
    const getAlarmIcon = (alarmType) => {
      const icons = {
        CHAT: 'mdi-chat',
        LIKE: 'mdi-heart',
        FOLLOW: 'mdi-account-plus',
        COMMENT: 'mdi-comment',
        SYSTEM: 'mdi-information',
        MARKET: 'mdi-store',
        PET: 'mdi-paw'
      }
      return icons[alarmType] || 'mdi-bell'
    }

    const getAlarmIconColor = (alarmType) => {
      const colors = {
        CHAT: '#2196F3',
        LIKE: '#E91E63',
        FOLLOW: '#4CAF50',
        COMMENT: '#FF9800',
        SYSTEM: '#9C27B0',
        MARKET: '#FF5722',
        PET: '#795548'
      }
      return colors[alarmType] || '#6C757D'
    }

    const getAlarmTypeText = (alarmType) => {
      const types = {
        CHAT: '채팅',
        LIKE: '좋아요',
        FOLLOW: '팔로우',
        COMMENT: '댓글',
        SYSTEM: '시스템',
        MARKET: '마켓',
        PET: '반려동물'
      }
      return types[alarmType] || '알림'
    }

    const formatTime = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
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

    const handleClick = () => {
      emit('click', props.alarm)
    }

    const handleDelete = () => {
      emit('delete', props.alarm.id)
    }

    return {
      getAlarmIcon,
      getAlarmIconColor,
      getAlarmTypeText,
      formatTime,
      handleClick,
      handleDelete
    }
  }
}
</script>

<style scoped>
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

.notification-item.read {
  background: #F8F9FA;
  border-color: rgba(0, 0, 0, 0.05);
  opacity: 0.8;
}

.notification-item.read:hover {
  background: #F1F3F4;
  opacity: 1;
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
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2C3E50;
  margin-bottom: 4px;
  line-height: 1.3;
}

.notification-title.unread-text {
  font-weight: 600;
  color: #E87D7D;
}

.notification-type {
  font-size: 0.75rem;
  color: #6C757D;
  margin-bottom: 2px;
}

.notification-time {
  font-size: 0.7rem;
  color: #9CA3AF;
}

.read-status {
  position: absolute;
  top: 12px;
  right: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E87D7D;
  box-shadow: 0 0 0 2px rgba(232, 125, 125, 0.3);
  animation: pulse 2s infinite;
}

.read-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.read-indicator .v-icon {
  color: white !important;
  font-size: 10px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .delete-btn {
  opacity: 1;
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

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
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

  .notification-item.read {
    background: #2D2D2D;
    border-color: rgba(255, 255, 255, 0.1);
    opacity: 0.8;
  }

  .notification-item.read:hover {
    background: #3D3D3D;
    opacity: 1;
  }
  
  .notification-title {
    color: #F8F9FA;
  }
  
  .notification-title.unread-text {
    color: #E87D7D;
  }
  
  .notification-type {
    color: #B0B0B0;
  }
  
  .notification-time {
    color: #808080;
  }

  .read-indicator {
    background: #4CAF50;
    opacity: 0.8;
  }

  .read-indicator .v-icon {
    color: white !important;
  }
}
</style>
