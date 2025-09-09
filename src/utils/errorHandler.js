// 에러 타입별 처리
export const handleError = (error, router = null) => {
  console.error('에러 발생:', error)
  
  let message = '알 수 없는 오류가 발생했습니다.'
  let shouldRedirect = false
  let redirectPath = '/diary'
  
  // HTTP 상태 코드별 처리
  if (error.response) {
    const status = error.response.status
    
    switch (status) {
      case 400:
        message = '잘못된 요청입니다. 입력값을 확인해주세요.'
        break
      case 401:
        message = '로그인이 필요합니다.'
        shouldRedirect = true
        redirectPath = '/login'
        break
      case 403:
        message = '접근 권한이 없습니다.'
        shouldRedirect = true
        redirectPath = '/diary'
        break
      case 404:
        message = '요청한 리소스를 찾을 수 없습니다.'
        shouldRedirect = true
        redirectPath = '/diary'
        break
      case 500:
        message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        break
      default:
        message = `오류가 발생했습니다. (${status})`
    }
  } else if (error.request) {
    // 네트워크 오류
    message = '네트워크 연결을 확인해주세요.'
  } else if (error.message) {
    // 기타 오류
    message = error.message
  }
  
  // 알림 표시
  alert(message)
  
  // 리다이렉트 처리
  if (shouldRedirect && router) {
    router.push(redirectPath)
  }
  
  return { message, shouldRedirect, redirectPath }
}

// API 에러 처리
export const handleApiError = (error, router = null, customMessage = null) => {
  if (customMessage) {
    alert(customMessage)
    return
  }
  
  return handleError(error, router)
}

// 비동기 함수 래퍼
export const withErrorHandling = async (asyncFn, router = null, customMessage = null) => {
  try {
    return await asyncFn()
  } catch (error) {
    handleApiError(error, router, customMessage)
    throw error
  }
}
