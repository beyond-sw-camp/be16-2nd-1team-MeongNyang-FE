import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { alarmAPI } from '@/services/api'

export const useAlarmStore = defineStore('alarm', () => {
  // 상태
  const alarms = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 계산된 속성
  const unreadCount = computed(() => {
    return alarms.value.filter(alarm => !alarm.isRead).length
  })

  const hasUnreadAlarms = computed(() => {
    return unreadCount.value > 0
  })

  // 액션
  const fetchAlarms = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await alarmAPI.getMyAlarms()
      
      console.log('=== 알림 API 응답 디버깅 ===')
      console.log('전체 응답:', response)
      console.log('response.data:', response.data)
      console.log('response.data.data:', response.data?.data)
      
      // 백엔드 응답 구조에 맞춰 데이터 추출
      if (response.data && response.data.data) {
        alarms.value = response.data.data
      } else {
        alarms.value = response.data || []
      }
      
      console.log('최종 알림 데이터:', alarms.value)
      console.log('첫 번째 알림 객체:', alarms.value[0])
      console.log('isRead 필드 확인:', alarms.value.map(alarm => ({ id: alarm.id, isRead: alarm.isRead })))
      console.log('=== 알림 API 응답 디버깅 완료 ===')
    } catch (err) {
      console.error('알림 로드 실패:', err)
      error.value = err.message || '알림을 불러오는데 실패했습니다.'
      alarms.value = []
    } finally {
      loading.value = false
    }
  }

  const markAlarmAsRead = async (alarmId) => {
    try {
      await alarmAPI.markAsRead(alarmId)
      
      // 로컬 상태 업데이트 - isRead를 true로 변경
      const alarm = alarms.value.find(a => a.id === alarmId)
      if (alarm) {
        alarm.isRead = true
      }
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err)
      throw err
    }
  }

  const markAllAlarmsAsRead = async () => {
    try {
      await alarmAPI.markAllAsRead()
      
      // 로컬 상태 업데이트 - 모든 알림의 isRead를 true로 변경
      alarms.value.forEach(alarm => {
        alarm.isRead = true
      })
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err)
      throw err
    }
  }

  const deleteAlarm = async (alarmId) => {
    try {
      await alarmAPI.deleteAlarm(alarmId)
      
      // 로컬 상태에서 제거
      alarms.value = alarms.value.filter(alarm => alarm.id !== alarmId)
    } catch (err) {
      console.error('알림 삭제 실패:', err)
      throw err
    }
  }

  const deleteAllAlarms = async () => {
    try {
      await alarmAPI.deleteAllAlarms()
      
      // 로컬 상태 초기화
      alarms.value = []
    } catch (err) {
      console.error('모든 알림 삭제 실패:', err)
      throw err
    }
  }

  const addAlarm = (alarm) => {
    // 새 알림 추가 (SSE 등에서 사용)
    alarms.value.unshift(alarm)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // 상태
    alarms,
    loading,
    error,
    
    // 계산된 속성
    unreadCount,
    hasUnreadAlarms,
    
    // 액션
    fetchAlarms,
    markAlarmAsRead,
    markAllAlarmsAsRead,
    deleteAlarm,
    deleteAllAlarms,
    addAlarm,
    clearError
  }
})
