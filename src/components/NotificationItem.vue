<template>
  <div
    class="notification-item"
    :class="{ 
      'unread': alarm.isRead == 'FALSE', 
      'read': alarm.isRead == 'TRUE',
      'hover': isHovered
    }"
    @click="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 아이콘 영역 -->
    <div class="notification-icon" :class="`icon-${alarm.alarmType.toLowerCase()}`">
      <div class="icon-background">
        <v-icon 
          :color="getAlarmIconColor(alarm.alarmType)"
          size="18"
        >
          {{ getAlarmIcon(alarm.alarmType) }}
        </v-icon>
      </div>
    </div>
    
    <!-- 콘텐츠 영역 -->
    <div class="notification-content">
      <div class="notification-header">
        <div class="notification-title" :class="{ 'unread-text': alarm.isRead == 'FALSE' }">
          {{ alarm.content }}
        </div>
        <div class="notification-badge" :class="`badge-${alarm.alarmType.toLowerCase()}`">
          {{ getAlarmTypeText(alarm.alarmType) }}
        </div>
      </div>
      
      <div class="notification-meta">
        <div class="notification-time">
          <v-icon size="12" color="currentColor" class="time-icon">mdi-clock-outline</v-icon>
          <span class="time-text">{{ formatTime(alarm.createdAt) }}</span>
        </div>
        
        <!-- 읽음 상태 표시 -->
        <div class="read-status" v-if="alarm.isRead == 'FALSE'">
          <div class="unread-indicator"></div>
          <span class="unread-text">새 알림</span>
        </div>
      </div>
    </div>
    
    <!-- 액션 버튼들 -->
    <div class="notification-actions" :class="{ 'visible': isHovered }">
      <!-- 삭제 버튼 -->
      <v-btn
        icon
        variant="text"
        size="small"
        color="error"
        class="action-btn delete-btn"
        @click.stop="handleDelete"
        :title="'삭제'"
      >
        <v-icon size="16">mdi-delete-outline</v-icon>
      </v-btn>
    </div>
    
    <!-- 읽음 상태 배경 표시 제거 -->
  </div>
</template>

<script>
import { ref } from 'vue'

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
    const isHovered = ref(false)

    const getAlarmIcon = (alarmType) => {
      const icons = {
        CHAT: 'mdi-chat-outline',
        LIKE: 'mdi-heart',
        FOLLOW: 'mdi-account-plus',
        COMMENT: 'mdi-comment-outline',
        SYSTEM: 'mdi-information-outline',
        MARKET: 'mdi-store',
        PET: 'mdi-paw'
      }
      return icons[alarmType] || 'mdi-bell-outline'
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
      // 여러 가능한 시간 필드명 시도 (백엔드 변경 대비)
      let timeValue = dateString
      if (!timeValue && props.alarm) {
        // createdAt, created_at, createTime, create_time 등 시도
        timeValue = props.alarm.createdAt || 
                   props.alarm.created_at || 
                   props.alarm.createTime || 
                   props.alarm.create_time ||
                   props.alarm.regDate ||
                   props.alarm.reg_date
      }
      
      if (!timeValue) return '시간 정보 없음'
      
      try {
        const date = new Date(timeValue)
        
        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
          return '잘못된 날짜'
        }
        
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
      } catch (error) {
        console.error('Error formatting time:', error)
        return '시간 오류'
      }
    }

    const handleClick = () => {
      emit('click', props.alarm)
    }

    const handleDelete = () => {
      emit('delete', props.alarm.id)
    }

    return {
      isHovered,
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
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: #FAFBFC;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 80px;
  text-align: left;
}

.notification-item:hover {
  background: #F1F3F4;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: rgba(232, 125, 125, 0.2);
}

.notification-item.unread {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.05) 0%, rgba(255, 107, 107, 0.05) 100%);
  border-color: rgba(232, 125, 125, 0.15);
  box-shadow: 0 2px 8px rgba(232, 125, 125, 0.1);
}

.notification-item.unread:hover {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.08) 0%, rgba(255, 107, 107, 0.08) 100%);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.15);
}

.notification-item.read {
  background: #FAFBFC;
  border-color: rgba(0, 0, 0, 0.06);
}

.notification-item.read:hover {
  background: #F1F3F4;
}

/* 아이콘 영역 */
.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  align-self: center;
}

.icon-background {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(232, 125, 125, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin: auto 0;
}

.notification-item:hover .icon-background {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

/* 아이콘 타입별 스타일 */
.icon-chat .icon-background {
  background: rgba(33, 150, 243, 0.08);
}

.icon-like .icon-background {
  background: rgba(233, 30, 99, 0.08);
}

.icon-follow .icon-background {
  background: rgba(76, 175, 80, 0.08);
}

.icon-comment .icon-background {
  background: rgba(255, 152, 0, 0.08);
}

.icon-system .icon-background {
  background: rgba(156, 39, 176, 0.08);
}

.icon-market .icon-background {
  background: rgba(255, 87, 34, 0.08);
}

.icon-pet .icon-background {
  background: rgba(121, 85, 72, 0.08);
}

/* 콘텐츠 영역 */
.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.notification-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1F2937;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  text-align: left;
  font-family: inherit;
}

.notification-title.unread-text {
  font-weight: 600;
  color: #DC2626;
  text-align: left;
  font-size: 0.95rem;
  font-family: inherit;
}

.notification-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-chat {
  background: rgba(33, 150, 243, 0.1);
  color: #1976D2;
}

.badge-like {
  background: rgba(233, 30, 99, 0.1);
  color: #C2185B;
}

.badge-follow {
  background: rgba(76, 175, 80, 0.1);
  color: #388E3C;
}

.badge-comment {
  background: rgba(255, 152, 0, 0.1);
  color: #F57C00;
}

.badge-system {
  background: rgba(156, 39, 176, 0.1);
  color: #7B1FA2;
}

.badge-market {
  background: rgba(255, 87, 34, 0.1);
  color: #D84315;
}

.badge-pet {
  background: rgba(121, 85, 72, 0.1);
  color: #5D4037;
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.notification-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 400;
}

.time-icon {
  opacity: 0.7;
  flex-shrink: 0;
}

.time-text {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.read-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  box-shadow: 0 0 0 2px rgba(232, 125, 125, 0.3);
  animation: pulse 2s infinite;
}

.unread-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: #E87D7D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 액션 버튼들 */
.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%) translateX(10px);
}

.notification-actions.visible {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  transform: scale(1.1) !important;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1) !important;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2) !important;
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
    background: #1F2937;
    border-color: rgba(255, 255, 255, 0.1);
    text-align: left;
  }
  
  .notification-item:hover {
    background: #374151;
  }
  
  .notification-item.unread {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.08) 0%, rgba(255, 107, 107, 0.08) 100%);
    border-color: rgba(232, 125, 125, 0.25);
  }

  .notification-item.unread:hover {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.12) 0%, rgba(255, 107, 107, 0.12) 100%);
  }

  .notification-item.read {
    background: #1F2937;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .notification-item.read:hover {
    background: #374151;
  }
  
  .notification-content {
    text-align: left;
  }
  
  .notification-title {
    color: #F9FAFB;
    text-align: left;
    font-size: 0.95rem;
    font-family: inherit;
  }
  
  .notification-title.unread-text {
    color: #FCA5A5;
    text-align: left;
    font-size: 0.95rem;
    font-family: inherit;
  }
  
  .notification-time {
    color: #9CA3AF;
  }

  .unread-text {
    color: #FCA5A5;
  }
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .notification-item {
    padding: 16px;
    gap: 12px;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .notification-badge {
    align-self: flex-start;
  }
  
  .notification-actions {
    right: 12px;
  }
  
  .action-btn {
    width: 28px !important;
    height: 28px !important;
  }
}
</style>
