/**
 * JWT 토큰 디코딩 유틸리티
 */

/**
 * JWT 토큰을 디코딩하여 payload를 반환합니다.
 * @param {string} token - JWT 토큰
 * @returns {object|null} 디코딩된 payload 또는 null
 */
export function decodeJWT(token) {
  try {
    if (!token) return null
    
    // JWT 토큰은 3부분으로 구성: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    // payload 부분을 base64 디코딩
    const payload = parts[1]
    const decodedPayload = atob(payload)
    
    // JSON 파싱
    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('JWT 디코딩 실패:', error)
    return null
  }
}

/**
 * JWT 토큰에서 사용자 이메일을 추출합니다.
 * @param {string} token - JWT 토큰
 * @returns {string|null} 사용자 이메일 또는 null
 */
export function getEmailFromToken(token) {
  const payload = decodeJWT(token)
  return payload?.email || payload?.sub || null
}

/**
 * JWT 토큰의 만료 시간을 확인합니다.
 * @param {string} token - JWT 토큰
 * @returns {boolean} 토큰이 유효한지 여부
 */
export function isTokenValid(token) {
  const payload = decodeJWT(token)
  if (!payload) return false
  
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp > currentTime
}
