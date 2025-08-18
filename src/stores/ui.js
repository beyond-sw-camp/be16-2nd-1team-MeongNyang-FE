import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 스낵바 상태
  const snackbar = ref({
    show: false,
    title: '',
    message: '',
    type: 'info',
    timeout: 4000,
    actions: []
  })

  // 로딩 오버레이 상태
  const loadingOverlay = ref({
    show: false,
    title: '',
    message: '로딩 중...',
    progress: 0,
    showProgress: false,
    showCancelButton: false
  })

  // 계산된 속성
  const isSnackbarVisible = computed(() => snackbar.value.show)
  const isLoadingOverlayVisible = computed(() => loadingOverlay.value.show)

  // 스낵바 액션
  const showSnackbar = (options) => {
    snackbar.value = {
      show: true,
      title: '',
      message: '',
      type: 'info',
      timeout: 4000,
      actions: [],
      ...options
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  const showSuccessSnackbar = (message, title = '성공') => {
    showSnackbar({
      title,
      message,
      type: 'success',
      timeout: 3000
    })
  }

  const showErrorSnackbar = (message, title = '오류') => {
    showSnackbar({
      title,
      message,
      type: 'error',
      timeout: 5000
    })
  }

  const showWarningSnackbar = (message, title = '경고') => {
    showSnackbar({
      title,
      message,
      type: 'warning',
      timeout: 4000
    })
  }

  const showInfoSnackbar = (message, title = '알림') => {
    showSnackbar({
      title,
      message,
      type: 'info',
      timeout: 4000
    })
  }

  // 로딩 오버레이 액션
  const showLoadingOverlay = (options = {}) => {
    loadingOverlay.value = {
      show: true,
      title: '',
      message: '로딩 중...',
      progress: 0,
      showProgress: false,
      showCancelButton: false,
      ...options
    }
  }

  const hideLoadingOverlay = () => {
    loadingOverlay.value.show = false
  }

  const updateLoadingProgress = (progress) => {
    if (loadingOverlay.value.show) {
      loadingOverlay.value.progress = progress
    }
  }

  const updateLoadingMessage = (message) => {
    if (loadingOverlay.value.show) {
      loadingOverlay.value.message = message
    }
  }

  // 스낵바 이벤트 핸들러
  const handleSnackbarClose = () => {
    hideSnackbar()
  }

  const handleSnackbarAction = ({ action }) => {
    if (action.handler) {
      action.handler()
    }
  }

  // 로딩 오버레이 이벤트 핸들러
  const handleLoadingCancel = () => {
    hideLoadingOverlay()
  }

  return {
    // 상태
    snackbar,
    loadingOverlay,
    
    // 계산된 속성
    isSnackbarVisible,
    isLoadingOverlayVisible,
    
    // 스낵바 액션
    showSnackbar,
    hideSnackbar,
    showSuccessSnackbar,
    showErrorSnackbar,
    showWarningSnackbar,
    showInfoSnackbar,
    
    // 로딩 오버레이 액션
    showLoadingOverlay,
    hideLoadingOverlay,
    updateLoadingProgress,
    updateLoadingMessage,
    
    // 이벤트 핸들러
    handleSnackbarClose,
    handleSnackbarAction,
    handleLoadingCancel
  }
})
