import { petAPI } from '@/services/api'

/**
 * 펫 등록 여부를 확인하는 함수
 * @returns {Promise<boolean>} 펫이 등록되어 있으면 true, 없으면 false
 */
export const checkPetExist = async () => {
  try {
    const response = await petAPI.checkExist()
    
    // 성공 응답인 경우
    if (response.data.isSuccess) {
      return true
    }
    
    // 펫이 등록되지 않은 경우
    if (response.data.status && response.data.status.code === 403) {
      alert(response.data.status.message || '등록된 펫이 없습니다. 펫 등록 후 사용 가능합니다.')
      return false
    }
    
    return true
  } catch (error) {
    console.error('펫 존재 확인 중 오류 발생:', error)
    
    // 403 에러인 경우 (펫이 등록되지 않음)
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.status?.message || '등록된 펫이 없습니다. 펫 등록 후 사용 가능합니다.'
      alert(message)
      return false
    }
    
    // 기타 에러
    alert('펫 정보를 확인하는 중 오류가 발생했습니다.')
    return false
  }
}

/**
 * 펫 등록 여부를 확인하고 실패 시 이전 페이지로 돌아가는 함수
 * @param {Function} router - Vue Router 인스턴스
 * @returns {Promise<boolean>} 펫이 등록되어 있으면 true, 없으면 false
 */
export const validatePetAndRedirect = async (router) => {
  const hasPet = await checkPetExist()
  
  if (!hasPet) {
    router.back()
    return false
  }
  
  return true
}
