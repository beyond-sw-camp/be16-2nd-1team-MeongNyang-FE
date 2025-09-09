<template>
  <div
    class="notification-panel"
    :class="panelClass"
    :role="role"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
  >
    <!-- 헤더 -->
    <div class="notification-panel__header">
      <div class="notification-panel__title-section">
        <BaseIcon
          v-if="icon"
          :icon="icon"
          :size="iconSize"
          :color="iconColor"
          class="notification-panel__icon"
        />
        <h3 class="notification-panel__title">{{ title }}</h3>
        <span v-if="count > 0" class="notification-panel__count">{{ count }}</span>
      </div>
      
      <div class="notification-panel__actions">
        <BaseButton
          v-if="showClearButton && notifications.length > 0"
          :text="clearText"
          :size="clearButtonSize"
          :variant="clearButtonVariant"
          :color="clearButtonColor"
          :disabled="clearDisabled"
          :loading="clearLoading"
          @click="handleClearAll"
        />
        
        <BaseButton
          v-if="showCloseButton"
          :icon="closeIcon"
          :size="closeButtonSize"
          :variant="closeButtonVariant"
          :color="closeButtonColor"
          :aria-label="closeButtonAriaLabel"
          @click="handleClose"
        />
      </div>
    </div>
    
    <!-- 알림 목록 -->
    <div class="notification-panel__content">
      <div
        v-if="notifications.length === 0"
        class="notification-panel__empty"
      >
        <BaseIcon
          :icon="emptyIcon"
          :size="emptyIconSize"
          :color="emptyIconColor"
          class="notification-panel__empty-icon"
        />
        <p class="notification-panel__empty-text">{{ emptyText }}</p>
      </div>
      
      <div
        v-else
        class="notification-panel__list"
        :class="{ 'notification-panel__list--scrollable': scrollable }"
      >
        <div
          v-for="(notification, index) in displayNotifications"
          :key="notification.id || index"
          class="notification-panel__item"
          :class="getItemClass(notification, index)"
        >
          <!-- 알림 아이콘 -->
          <BaseIcon
            v-if="notification.icon || getDefaultIcon(notification.type)"
            :icon="notification.icon || getDefaultIcon(notification.type)"
            :size="notificationIconSize"
            :color="getIconColor(notification.type)"
            class="notification-panel__item-icon"
          />
          
          <!-- 알림 내용 -->
          <div class="notification-panel__item-content">
            <div class="notification-panel__item-header">
              <h4 class="notification-panel__item-title">{{ notification.title }}</h4>
              <span class="notification-panel__item-time">{{ formatTime(notification.timestamp) }}</span>
            </div>
            
            <p v-if="notification.message" class="notification-panel__item-message">
              {{ notification.message }}
            </p>
            
            <div v-if="notification.actions && notification.actions.length > 0" class="notification-panel__item-actions">
              <BaseButton
                v-for="(action, actionIndex) in notification.actions"
                :key="actionIndex"
                :text="action.text"
                :icon="action.icon"
                :size="actionButtonSize"
                :variant="action.variant || 'text'"
                :color="action.color || 'primary'"
                :disabled="action.disabled"
                :loading="action.loading"
                @click="handleAction(notification, action, index)"
              />
            </div>
          </div>
          
          <!-- 닫기 버튼 -->
          <BaseButton
            v-if="showItemCloseButton"
            :icon="itemCloseIcon"
            :size="itemCloseButtonSize"
            :variant="itemCloseButtonVariant"
            :color="itemCloseButtonColor"
            :aria-label="`${notification.title} 알림 닫기`"
            class="notification-panel__item-close"
            @click="handleRemoveNotification(index)"
          />
        </div>
      </div>
    </div>
    
    <!-- 푸터 -->
    <div v-if="showFooter && notifications.length > maxVisible" class="notification-panel__footer">
      <BaseButton
        :text="viewAllText"
        :size="footerButtonSize"
        :variant="footerButtonVariant"
        :color="footerButtonColor"
        @click="handleViewAll"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseButton from '../atoms/BaseButton.vue'
import BaseIcon from '../atoms/BaseIcon.vue'

export default {
  name: 'NotificationPanel',
  components: {
    BaseButton,
    BaseIcon
  },
  props: {
    // 기본 속성
    title: {
      type: String,
      default: '알림'
    },
    icon: {
      type: String,
      default: 'mdi-bell'
    },
    notifications: {
      type: Array,
      default: () => []
    },
    
    // 레이아웃
    maxVisible: {
      type: Number,
      default: 5
    },
    scrollable: {
      type: Boolean,
      default: true
    },
    maxHeight: {
      type: [String, Number],
      default: 400
    },
    
    // 헤더 설정
    iconSize: {
      type: [String, Number],
      default: 'large'
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
    showClearButton: {
      type: Boolean,
      default: true
    },
    clearText: {
      type: String,
      default: '모두 지우기'
    },
    clearButtonSize: {
      type: String,
      default: 'small'
    },
    clearButtonVariant: {
      type: String,
      default: 'text'
    },
    clearButtonColor: {
      type: String,
      default: 'default'
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeIcon: {
      type: String,
      default: 'mdi-close'
    },
    closeButtonSize: {
      type: String,
      default: 'small'
    },
    closeButtonVariant: {
      type: String,
      default: 'text'
    },
    closeButtonColor: {
      type: String,
      default: 'default'
    },
    closeButtonAriaLabel: {
      type: String,
      default: '알림 패널 닫기'
    },
    
    // 빈 상태 설정
    emptyIcon: {
      type: String,
      default: 'mdi-bell-off'
    },
    emptyIconSize: {
      type: [String, Number],
      default: 'large'
    },
    emptyIconColor: {
      type: String,
      default: 'default'
    },
    emptyText: {
      type: String,
      default: '새로운 알림이 없습니다'
    },
    
    // 알림 아이템 설정
    notificationIconSize: {
      type: [String, Number],
      default: 'small'
    },
    showItemCloseButton: {
      type: Boolean,
      default: true
    },
    itemCloseIcon: {
      type: String,
      default: 'mdi-close'
    },
    itemCloseButtonSize: {
      type: String,
      default: 'x-small'
    },
    itemCloseButtonVariant: {
      type: String,
      default: 'text'
    },
    itemCloseButtonColor: {
      type: String,
      default: 'default'
    },
    actionButtonSize: {
      type: String,
      default: 'x-small'
    },
    
    // 푸터 설정
    showFooter: {
      type: Boolean,
      default: true
    },
    viewAllText: {
      type: String,
      default: '모두 보기'
    },
    footerButtonSize: {
      type: String,
      default: 'small'
    },
    footerButtonVariant: {
      type: String,
      default: 'text'
    },
    footerButtonColor: {
      type: String,
      default: 'primary'
    },
    
    // 상태
    clearDisabled: {
      type: Boolean,
      default: false
    },
    clearLoading: {
      type: Boolean,
      default: false
    },
    
    // 접근성
    role: {
      type: String,
      default: 'region'
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    ariaDescribedby: {
      type: String,
      default: ''
    },
    
    // 커스텀 스타일
    customClass: {
      type: String,
      default: ''
    }
  },
  
  emits: [
    'close',
    'clear-all',
    'remove-notification',
    'action',
    'view-all'
  ],
  
  setup(props, { emit }) {
    const count = computed(() => props.notifications.length)
    
    const displayNotifications = computed(() => {
      return props.notifications.slice(0, props.maxVisible)
    })
    
    const panelClass = computed(() => {
      return {
        'notification-panel--scrollable': props.scrollable,
        'notification-panel--empty': props.notifications.length === 0,
        [props.customClass]: !!props.customClass
      }
    })
    
    const getItemClass = (notification) => {
      return {
        'notification-panel__item--unread': !notification.read,
        'notification-panel__item--read': notification.read,
        [`notification-panel__item--${notification.type || 'info'}`]: true
      }
    }
    
    const getDefaultIcon = (type) => {
      const icons = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information'
      }
      return icons[type] || icons.info
    }
    
    const getIconColor = (type) => {
      const colors = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
      }
      return colors[type] || colors.info
    }
    
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return '방금 전'
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      if (days < 7) return `${days}일 전`
      
      return date.toLocaleDateString('ko-KR')
    }
    
    const handleClose = () => {
      emit('close')
    }
    
    const handleClearAll = () => {
      emit('clear-all')
    }
    
    const handleRemoveNotification = (index) => {
      emit('remove-notification', { index, notification: props.notifications[index] })
    }
    
    const handleAction = (notification, action, index) => {
      emit('action', { notification, action, index })
    }
    
    const handleViewAll = () => {
      emit('view-all')
    }
    
    return {
      count,
      displayNotifications,
      panelClass,
      getItemClass,
      getDefaultIcon,
      getIconColor,
      formatTime,
      handleClose,
      handleClearAll,
      handleRemoveNotification,
      handleAction,
      handleViewAll
    }
  }
}
</script>

<style scoped>
.notification-panel {
  display: flex;
  flex-direction: column;
  background: var(--v-theme-surface);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 320px;
  max-width: 480px;
}

.notification-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: var(--v-theme-surface-variant);
}

.notification-panel__title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.notification-panel__icon {
  flex-shrink: 0;
}

.notification-panel__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--v-theme-on-surface);
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-panel__count {
  background: var(--v-theme-primary);
  color: var(--v-theme-on-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.notification-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notification-panel__content {
  flex: 1;
  min-height: 0;
}

.notification-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.notification-panel__empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.notification-panel__empty-text {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0;
  line-height: 1.4;
}

.notification-panel__list {
  max-height: v-bind(maxHeight + 'px');
}

.notification-panel__list--scrollable {
  overflow-y: auto;
}

.notification-panel__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.notification-panel__item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.notification-panel__item:last-child {
  border-bottom: none;
}

.notification-panel__item--unread {
  background: rgba(var(--v-theme-primary), 0.04);
  border-left: 3px solid var(--v-theme-primary);
}

.notification-panel__item--read {
  opacity: 0.8;
}

.notification-panel__item-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-panel__item-content {
  flex: 1;
  min-width: 0;
}

.notification-panel__item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.notification-panel__item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--v-theme-on-surface);
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-panel__item-time {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  line-height: 1.4;
  flex-shrink: 0;
}

.notification-panel__item-message {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
  line-height: 1.4;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-panel__item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.notification-panel__item-close {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.notification-panel__item:hover .notification-panel__item-close {
  opacity: 1;
}

.notification-panel__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: var(--v-theme-surface-variant);
}

/* 접근성 */
.notification-panel:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .notification-panel {
    min-width: 280px;
    max-width: 100%;
  }
  
  .notification-panel__header {
    padding: 12px 16px;
  }
  
  .notification-panel__title {
    font-size: 1rem;
  }
  
  .notification-panel__item {
    padding: 12px 16px;
  }
  
  .notification-panel__item-title {
    font-size: 0.8125rem;
  }
  
  .notification-panel__item-message {
    font-size: 0.75rem;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .notification-panel {
    background: var(--v-theme-surface);
  }
  
  .notification-panel__header {
    background: var(--v-theme-surface-variant);
    border-bottom-color: rgba(var(--v-theme-on-surface), 0.24);
  }
  
  .notification-panel__item {
    border-bottom-color: rgba(var(--v-theme-on-surface), 0.16);
  }
  
  .notification-panel__footer {
    background: var(--v-theme-surface-variant);
    border-top-color: rgba(var(--v-theme-on-surface), 0.24);
  }
}

/* 스크롤바 스타일링 */
.notification-panel__list--scrollable::-webkit-scrollbar {
  width: 4px;
}

.notification-panel__list--scrollable::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.notification-panel__list--scrollable::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 2px;
}

.notification-panel__list--scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

/* 애니메이션 */
.notification-panel__item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
