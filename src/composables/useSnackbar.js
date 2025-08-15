import { useUIStore } from '@/stores/ui'

export function useSnackbar() {
  const uiStore = useUIStore()
  
  const showSnackbar = (message, type = 'info', duration = 3000) => {
    uiStore.showSnackbar({
      message,
      type,
      duration
    })
  }
  
  const showSuccess = (message, duration = 3000) => {
    showSnackbar(message, 'success', duration)
  }
  
  const showError = (message, duration = 5000) => {
    showSnackbar(message, 'error', duration)
  }
  
  const showWarning = (message, duration = 4000) => {
    showSnackbar(message, 'warning', duration)
  }
  
  const showInfo = (message, duration = 3000) => {
    showSnackbar(message, 'info', duration)
  }
  
  const hideSnackbar = () => {
    uiStore.hideSnackbar()
  }
  
  return {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar
  }
}
