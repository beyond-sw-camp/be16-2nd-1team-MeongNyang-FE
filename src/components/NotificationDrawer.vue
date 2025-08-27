<template>
  <v-navigation-drawer
    v-model="isOpen"
    location="left"
    temporary
    absolute
    width="400"
    :class="['notification-drawer', { 'is-open': isOpen }]"
  >
    <!-- 헤더 -->
    <div class="drawer-header">
      <div class="header-content">
        <h2 class="drawer-title">
          알림
          <span v-if="alarmStore.unreadCount > 0" class="unread-badge">
            {{ alarmStore.unreadCount }}
          </span>
        </h2>
        <v-btn
          icon
          variant="text"
          @click="closeDrawer"
          class="close-btn"
          size="small"
        >
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="alarmStore.loading" class="loading-state">
      <v-progress-circular
        indeterminate
        color="#E87D7D"
        size="32"
      ></v-progress-circular>
      <p class="loading-text">알림을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="alarmStore.error" class="error-state">
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
      <h3 class="error-title">알림 로드 실패</h3>
      <p class="error-text">{{ alarmStore.error }}</p>
      <v-btn
        @click="retryLoad"
        color="primary"
        variant="outlined"
        class="mt-3"
      >
        다시 시도
      </v-btn>
    </div>

    <!-- 알림 목록 -->
    <div v-else class="notification-list">
      <div v-if="alarmStore.alarms.length === 0" class="empty-state">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-bell-off</v-icon>
        <h3 class="empty-title">알림이 없습니다</h3>
        <p class="empty-text">새로운 알림이 오면 여기에 표시됩니다.</p>
      </div>

      <div v-else class="notifications">
        <NotificationItem
          v-for="alarm in alarmStore.alarms"
          :key="alarm.id"
          :alarm="alarm"
          @click="handleAlarmClick"
          @delete="deleteAlarm"
          @markAsRead="markAlarmAsRead"
        />
      </div>
    </div>

    <!-- 하단 액션 버튼들 -->
    <template v-slot:append>
      <div class="drawer-actions">
        <v-divider class="mb-3"></v-divider>
        <div class="action-buttons">
          <v-btn
            variant="text"
            color="grey"
            @click="markAllAsRead"
            :disabled="!alarmStore.hasUnreadAlarms"
            class="simple-text-btn"
          >
            모두 읽음 처리
          </v-btn>
          <v-btn
            variant="text"
            color="error"
            @click="deleteAllAlarms"
            :disabled="alarmStore.alarms.length === 0"
            class="simple-text-btn"
          >
            모두 삭제
          </v-btn>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { computed, watch } from 'vue'
import { useAlarmStore } from '@/stores/alarm'
import { useSnackbar } from '@/composables/useSnackbar'
import NotificationItem from './NotificationItem.vue'

export default {
  name: 'NotificationDrawer',
  components: {
    NotificationItem
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const alarmStore = useAlarmStore()
    const { showSnackbar } = useSnackbar()

    // 공통 스낵바 헬퍼
    const notifySuccess = (title, message) =>
      showSnackbar({ title, message, type: 'success' })
    const notifyError = (title, message) =>
      showSnackbar({ title, message, type: 'error' })

    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    // 드로워가 열릴 때 알림 데이터 로드
    watch(isOpen, (newValue) => {
      if (newValue) {
        loadAlarms()
      }
    })

    const loadAlarms = async () => {
      try {
        await alarmStore.fetchAlarms()
      } catch (error) {
        notifyError('알림 로드 실패', '알림을 불러오는데 실패했습니다.')
      }
    }

    const retryLoad = () => {
      alarmStore.clearError()
      loadAlarms()
    }

    const closeDrawer = () => {
      isOpen.value = false
    }

    const handleAlarmClick = async (alarm) => {
      try {
        // 읽지 않은 알림인 경우 읽음 처리
        if (alarm.isRead == "FALSE") {
          await alarmStore.markAlarmAsRead(alarm.id)
        }

        // 알림 타입에 따른 네비게이션 처리
        if (alarm.targetId) {
          switch (alarm.alarmType) {
            case 'CHAT':
              // router.push(`/chat/${alarm.targetId}`)
              break
            case 'LIKE':
            case 'COMMENT':
              // router.push(`/post/${alarm.targetId}`)
              break
            case 'FOLLOW':
              // router.push(`/profile/${alarm.targetId}`)
              break
            case 'MARKET':
              // router.push(`/market/${alarm.targetId}`)
              break
            case 'PET':
              // router.push(`/pet/${alarm.targetId}`)
              break
          }
        }
      } catch (error) {
        notifyError('알림 처리 실패', '알림을 처리하는데 실패했습니다.')
      }
    }

    const markAllAsRead = async () => {
      try {
        await alarmStore.markAllAlarmsAsRead()
        notifySuccess('알림 처리 완료', '모든 알림을 읽음 처리했습니다.')
      } catch (error) {
        notifyError('알림 처리 실패', '알림을 처리하는데 실패했습니다.')
      }
    }

    const deleteAllAlarms = async () => {
      try {
        await alarmStore.deleteAllAlarms()
        notifySuccess('알림 삭제 완료', '모든 알림을 삭제했습니다.')
      } catch (error) {
        notifyError('알림 삭제 실패', '알림을 삭제하는데 실패했습니다.')
      }
    }

    const deleteAlarm = async (alarmId) => {
      try {
        await alarmStore.deleteAlarm(alarmId)
        notifySuccess('알림 삭제 완료', '알림을 삭제했습니다.')
      } catch (error) {
        notifyError('알림 삭제 실패', '알림을 삭제하는데 실패했습니다.')
      }
    }

    const markAlarmAsRead = async (alarmId) => {
      try {
        await alarmStore.markAlarmAsRead(alarmId)
        notifySuccess('알림 처리 완료', '알림을 읽음 처리했습니다.')
      } catch (error) {
        notifyError('알림 처리 실패', '알림을 처리하는데 실패했습니다.')
      }
    }

    return {
      alarmStore,
      isOpen,
      closeDrawer,
      loadAlarms,
      retryLoad,
      handleAlarmClick,
      markAllAsRead,
      deleteAllAlarms,
      deleteAlarm,
      markAlarmAsRead
    }
  }
}
</script>

<style scoped>
.notification-drawer:not(.is-open) {
  display: none !important;
}

.notification-drawer {
  background: #FFFFFF;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.drawer-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.drawer-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.unread-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 16px;
  min-width: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #6C757D;
  padding: 40px 20px;
}

.loading-text,
.error-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 20px 0 10px 0;
  color: #374151;
}

.error-text {
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
  line-height: 1.5;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #FAFBFC;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #6C757D;
  padding: 40px 20px;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 20px 0 10px 0;
  color: #374151;
}

.empty-text {
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
  line-height: 1.5;
}

.notifications {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-actions {
  padding: 20px;
  background: #F8F9FA;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.simple-text-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: #5A6C7D !important;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.4px;
  line-height: 1.5;
  padding: 12px 20px;
  border-radius: 12px;
  transition: all 0.3s ease !important;
}

.simple-text-btn:hover {
  background: rgba(232, 125, 125, 0.08) !important;
  color: #E87D7D !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.15) !important;
}

.simple-text-btn:disabled {
  color: #ADB5BD !important;
  background: transparent !important;
  box-shadow: none !important;
  cursor: not-allowed;
}

/* 스크롤바 스타일링 */
.notification-list::-webkit-scrollbar {
  width: 8px;
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
  background-clip: content-box;
}


/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .notification-drawer {
    background: #1A1A1A;
    border-right-color: rgba(255, 255, 255, 0.1);
  }
  
  .notification-list {
    background: #1F2937;
  }
  
  .drawer-actions {
    background: #111827;
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .loading-text,
  .error-title,
  .empty-title {
    color: #F9FAFB;
  }
  
  .error-text,
  .empty-text {
    color: #9CA3AF;
  }
  
  .simple-text-btn {
    color: #E5E7EB !important;
  }
  
  .simple-text-btn:hover {
    background: rgba(232, 125, 125, 0.15) !important;
  }
  
  .simple-text-btn:disabled {
    color: #6B7280 !important;
  }
}

</style>
