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
        showSnackbar({
          title: '알림 로드 실패',
          message: '알림을 불러오는데 실패했습니다.',
          type: 'error'
        })
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
        console.log('알림 클릭:', alarm)
        console.log('현재 읽음 상태:', alarm.isRead, '타입:', typeof alarm.isRead)
        console.log('알림 ID:', alarm.id, '타입:', typeof alarm.id)
        console.log('isRead === false:', alarm.isRead === false)
        console.log('isRead === "FALSE":', alarm.isRead === "FALSE")
        console.log('!alarm.isRead:', !alarm.isRead)
        
        // 읽지 않은 알림인 경우 읽음 처리 (문자열 "FALSE"로 비교)
        if (alarm.isRead == "FALSE") {
          console.log('읽음 처리 시작...')
          await alarmStore.markAlarmAsRead(alarm.id)
          console.log('읽음 처리 완료')
        } else {
          console.log('이미 읽은 알림입니다.')
        }

        // 알림 타입에 따른 네비게이션 처리
        if (alarm.targetId) {
          console.log('알림 타입:', alarm.alarmType, '타겟 ID:', alarm.targetId)
          switch (alarm.alarmType) {
            case 'CHAT':
              // 채팅방으로 이동
              // router.push(`/chat/${alarm.targetId}`)
              break
            case 'LIKE':
            case 'COMMENT':
              // 게시글 상세로 이동
              // router.push(`/post/${alarm.targetId}`)
              break
            case 'FOLLOW':
              // 사용자 프로필로 이동
              // router.push(`/profile/${alarm.targetId}`)
              break
            case 'MARKET':
              // 마켓 상세로 이동
              // router.push(`/market/${alarm.targetId}`)
              break
            case 'PET':
              // 반려동물 상세로 이동
              // router.push(`/pet/${alarm.targetId}`)
              break
          }
        }
      } catch (error) {
        console.error('알림 처리 중 오류:', error)
        console.error('에러 상세 정보:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        })
        showSnackbar({
          title: '알림 처리 실패',
          message: '알림을 처리하는데 실패했습니다.',
          type: 'error'
        })
      }
    }

    const markAllAsRead = async () => {
      try {
        await alarmStore.markAllAlarmsAsRead()
        showSnackbar({
          title: '알림 처리 완료',
          message: '모든 알림을 읽음 처리했습니다.',
          type: 'success'
        })
      } catch (error) {
        showSnackbar({
          title: '알림 처리 실패',
          message: '알림을 처리하는데 실패했습니다.',
          type: 'error'
        })
      }
    }

    const deleteAllAlarms = async () => {
      try {
        await alarmStore.deleteAllAlarms()
        showSnackbar({
          title: '알림 삭제 완료',
          message: '모든 알림을 삭제했습니다.',
          type: 'success'
        })
      } catch (error) {
        showSnackbar({
          title: '알림 삭제 실패',
          message: '알림을 삭제하는데 실패했습니다.',
          type: 'error'
        })
      }
    }

    const deleteAlarm = async (alarmId) => {
      try {
        await alarmStore.deleteAlarm(alarmId)
        showSnackbar({
          title: '알림 삭제 완료',
          message: '알림을 삭제했습니다.',
          type: 'success'
        })
      } catch (error) {
        showSnackbar({
          title: '알림 삭제 실패',
          message: '알림을 삭제하는데 실패했습니다.',
          type: 'error'
        })
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
      deleteAlarm
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
  gap: 8px;
}

.unread-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.1) !important;
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
}

.loading-text,
.error-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.error-text {
  font-size: 0.9rem;
  color: #9CA3AF;
  margin: 0;
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

.drawer-actions {
  padding: 16px;
  background: #F8F9FA;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.simple-text-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: #5A6C7D !important;
  font-size: 0.95rem;
  font-weight: 400;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-transform: none;
  letter-spacing: 0.4px;
  line-height: 1.5;
  padding: 8px 16px;
  border-radius: 8px;
}

.simple-text-btn:hover {
  background: transparent !important;
}

.simple-text-btn:disabled {
  color: #ADB5BD !important;
  background: transparent !important;
  box-shadow: none !important;
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
  
  .drawer-actions {
    background: #2D2D2D;
  }
}
</style>
