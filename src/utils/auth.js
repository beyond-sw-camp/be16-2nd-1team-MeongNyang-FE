import { jwtDecode } from 'jwt-decode'

// 토큰 관련 상수
const TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000 // 5분 (밀리초)

/**
 * JWT 토큰 디코딩
 * @param {string} token - JWT 토큰
 * @returns {object|null} 디코딩된 토큰 페이로드 또는 null
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token)
  } catch (error) {
    console.error('토큰 디코딩 실패:', error)
    return null
  }
}

/**
 * 토큰 만료 시간 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} 토큰이 만료되었는지 여부
 */
export const isTokenExpired = (token) => {
  if (!token) return true
  
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  
  // 현재 시간 + 버퍼 시간과 비교
  const currentTime = Date.now() / 1000
  return decoded.exp < (currentTime + TOKEN_EXPIRY_BUFFER / 1000)
}

/**
 * 토큰 만료까지 남은 시간 (밀리초)
 * @param {string} token - JWT 토큰
 * @returns {number} 남은 시간 (밀리초)
 */
export const getTokenExpiryTime = (token) => {
  if (!token) return 0
  
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return 0
  
  const currentTime = Date.now() / 1000
  return Math.max(0, (decoded.exp - currentTime) * 1000)
}

/**
 * 토큰 저장 (localStorage + 쿠키)
 * @param {string} token - 액세스 토큰
 * @param {string} refreshToken - 리프레시 토큰
 */
export const saveTokens = (token, refreshToken) => {
  // localStorage에 저장 (백업용)
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
  
  // 쿠키에 저장 (보안 강화)
  if (token) {
    const expiryTime = getTokenExpiryTime(token)
    const expiryDate = new Date(Date.now() + expiryTime)
    
    document.cookie = `${TOKEN_KEY}=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict; Secure`
  }
  
  if (refreshToken) {
    // 리프레시 토큰은 30일간 유지
    const refreshExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; expires=${refreshExpiryDate.toUTCString()}; path=/; SameSite=Strict; Secure`
  }
}

/**
 * 토큰 가져오기 (쿠키 우선, localStorage 백업)
 * @param {string} key - 토큰 키
 * @returns {string|null} 토큰 또는 null
 */
export const getToken = (key = TOKEN_KEY) => {
  // 쿠키에서 먼저 확인
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === key) {
      return value
    }
  }
  
  // localStorage에서 백업
  return localStorage.getItem(key)
}

/**
 * 토큰 삭제
 * @param {string} key - 토큰 키 (기본값: accessToken)
 */
export const removeToken = (key = TOKEN_KEY) => {
  // localStorage에서 삭제
  localStorage.removeItem(key)
  
  // 쿠키에서 삭제
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

/**
 * 모든 토큰 삭제
 */
export const clearAllTokens = () => {
  removeToken(TOKEN_KEY)
  removeToken(REFRESH_TOKEN_KEY)
}

/**
 * 유효한 토큰인지 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} 토큰이 유효한지 여부
 */
export const isValidToken = (token) => {
  if (!token) return false
  
  const decoded = decodeToken(token)
  if (!decoded) return false
  
  // 필수 필드 확인
  if (!decoded.exp || !decoded.iat) return false
  
  // 만료 시간 확인
  return !isTokenExpired(token)
}

/**
 * 토큰에서 사용자 정보 추출
 * @param {string} token - JWT 토큰
 * @returns {object|null} 사용자 정보 또는 null
 */
export const extractUserFromToken = (token) => {
  const decoded = decodeToken(token)
  if (!decoded) return null
  
  // 토큰에서 사용자 정보 추출 (백엔드 토큰 구조에 따라 조정 필요)
  return {
    id: decoded.sub || decoded.userId,
    email: decoded.email,
    role: decoded.role,
    nickname: decoded.nickname
  }
}

/**
 * CSRF 토큰 생성
 * @returns {string} CSRF 토큰
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 토큰 자동 갱신 설정
 * @param {Function} refreshCallback - 토큰 갱신 콜백 함수
 */
export const setupTokenRefresh = (refreshCallback) => {
  const token = getToken()
  if (!token) return
  
  const expiryTime = getTokenExpiryTime(token)
  if (expiryTime <= 0) return
  
  // 토큰 만료 1분 전에 갱신
  const refreshTime = Math.max(60000, expiryTime - 60000)
  
  setTimeout(async () => {
    try {
      await refreshCallback()
    } catch (error) {
      console.error('토큰 자동 갱신 실패:', error)
    }
  }, refreshTime)
}
