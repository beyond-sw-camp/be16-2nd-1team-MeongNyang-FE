import { petAPI } from '@/services/api'

/**
 * 펫 등록 여부를 확인하는 함수
 * @returns {Promise<boolean>} 펫이 등록되어 있으면 true, 없으면 false
 */
export const checkPetExist = async () => {
  console.log('=== checkPetExist 함수 시작 ===')
  
  try {
    console.log('petAPI.checkExist() 호출 시작...')
    const response = await petAPI.checkExist()
    console.log('petAPI.checkExist() 응답:', response)
    console.log('응답 데이터:', response.data)
    
    // 성공 응답인 경우
    if (response.data.isSuccess) {
      console.log('펫 존재 확인 성공 - 펫이 있음')
      return true
    }
    
    // 펫이 등록되지 않은 경우
    if (response.data.status && response.data.status.code === 403) {
      console.log('펫이 등록되지 않음 (403)')
      const message = response.data.status.message || '등록된 펫이 없습니다. 펫 등록 후 사용 가능합니다.'
      console.log('표시할 메시지:', message)
      alert(message)
      return false
    }
    
    console.log('기타 응답 - 기본값 true 반환')
    return true
  } catch (error) {
    console.error('펫 존재 확인 중 오류 발생:', error)
    console.log('에러 응답:', error.response)
    console.log('에러 상태:', error.response?.status)
    console.log('에러 데이터:', error.response?.data)
    
    // 403 에러인 경우 (펫이 등록되지 않음)
    if (error.response && error.response.status === 403) {
      console.log('403 에러 - 펫이 등록되지 않음')
      const message = error.response.data?.status?.message || '등록된 펫이 없습니다. 펫 등록 후 사용 가능합니다.'
      console.log('표시할 메시지:', message)
      alert(message)
      return false
    }
    
    // 기타 에러
    console.log('기타 에러 - 기본 에러 메시지 표시')
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
