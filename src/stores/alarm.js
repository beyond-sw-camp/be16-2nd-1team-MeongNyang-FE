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
    return alarms.value.filter(alarm => alarm.isRead == 'FALSE').length
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
      
      // 백엔드 응답 구조에 맞춰 데이터 추출
      if (response.data && response.data.data) {
        alarms.value = response.data.data
      } else {
        alarms.value = response.data || []
      }
      
      console.log('알림 데이터 로드 완료:', alarms.value.length, '개')
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
      console.log(`알림 ${alarmId} 읽음 처리 시작...`)
      console.log('API 호출 전 alarmId:', alarmId, '타입:', typeof alarmId)
      
      const response = await alarmAPI.markAsRead(alarmId)
      console.log('API 응답 성공:', response)
      
      // 로컬 상태 업데이트 - isRead를 "TRUE"로 변경
      const alarm = alarms.value.find(a => a.id === alarmId)
      if (alarm) {
        alarm.isRead = "TRUE"
        console.log(`알림 ${alarmId} 읽음 처리 완료`)
      } else {
        console.warn(`알림 ${alarmId}를 로컬 상태에서 찾을 수 없습니다.`)
      }
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err)
      console.error('에러 상세 정보:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      })
      throw err
    }
  }

  const markAllAlarmsAsRead = async () => {
    try {
      await alarmAPI.markAllAsRead()
      
      // 로컬 상태 업데이트 - 모든 알림을 "TRUE"로 변경
      alarms.value.forEach(alarm => {
        alarm.isRead = "TRUE"
      })
      console.log('모든 알림 읽음 처리 완료')
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

  const addAlarm = (alarmData) => {
    // SSE에서 받은 알림 데이터를 백엔드 API 응답 구조에 맞게 변환
    const newAlarm = {
      id: alarmData.id || Date.now(), // 임시 ID (백엔드에서 생성된 ID가 없을 경우)
      content: alarmData.content || alarmData.message || alarmData.title || '새 알림',
      alarmType: alarmData.alarmType || alarmData.type || 'SYSTEM',
      targetId: alarmData.targetId || alarmData.target_id || null,
      isRead: "FALSE", // 새 알림은 기본적으로 읽지 않은 상태
      createdAt: alarmData.createdAt || alarmData.created_at || new Date().toISOString(),
      ...alarmData // 기타 필드들 유지
    }
    
    alarms.value.unshift(newAlarm)
    console.log('새 알림 추가:', newAlarm)
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
