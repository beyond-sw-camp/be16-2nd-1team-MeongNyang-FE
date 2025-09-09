import { jwtDecode } from 'jwt-decode'

// ===== 상수 정의 =====
export const ACCESS_KEY = 'accessToken'      // Access Token 저장 key
export const REFRESH_KEY = 'refreshToken'    // Refresh Token 저장 key
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000 // 만료 체크 시 5분 버퍼(ms)

// ===== JWT 토큰 decode =====
export const decodeToken = (token) => {
  if (!token) return null
  try {
    return jwtDecode(token)  // payload 추출
  } catch (e) {
    console.error('토큰 디코딩 실패:', e)
    return null
  }
}

// ===== 토큰 만료 여부 확인 =====
export const isTokenExpired = (token) => {
  if (!token) return true
  const dec = decodeToken(token)
  if (!dec || !dec.exp) return true

  const now = Date.now() / 1000 // 초 단위
  // exp < (현재시간 + 버퍼) → 곧 만료라고 판단
  return dec.exp < (now + TOKEN_EXPIRY_BUFFER_MS / 1000)
}

// ===== 토큰 만료까지 남은 시간(ms) =====
export const getTokenExpiryTime = (token) => {
  if (!token) return 0
  const dec = decodeToken(token)
  if (!dec || !dec.exp) return 0

  const now = Date.now() / 1000
  return Math.max(0, (dec.exp - now) * 1000)
}

// ===== 토큰 저장 (localStorage) =====
export const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

// ===== 토큰 조회 =====
export const getToken = (key = ACCESS_KEY) => localStorage.getItem(key)

// ===== 토큰 삭제 (단일) =====
export const removeToken = (key = ACCESS_KEY) => {
  localStorage.removeItem(key)
}

// ===== 모든 토큰 삭제 =====
export const clearAllTokens = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// ===== 토큰 유효성 확인 =====
export const isValidToken = (token) => !!token && !isTokenExpired(token)

// ===== 토큰에서 사용자 정보 추출 =====
export const extractUserFromToken = (token) => {
  const dec = decodeToken(token)
  if (!dec) return null
  return {
    id: dec.sub || dec.userId,
    email: dec.email,
    role: dec.role,
    nickname: dec.nickname,
  }
}

// ===== CSRF 토큰 랜덤 생성 =====
export const generateCSRFToken = () => {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

// ===== 서버와 맞춘 Refresh Token 헤더 이름 =====
export const RT_HEADER_RAW = 'X-Refresh-Token'      // 서버가 요구하는 실제 헤더명
export const RT_HEADER_LOWER = RT_HEADER_RAW.toLowerCase()

// ===== Access Token 만료되기 1분 전에 자동 갱신 예약 =====
export const setupTokenRefresh = (refreshCallback) => {
  const at = getToken(ACCESS_KEY)
  if (!at) return

  const ms = getTokenExpiryTime(at)
  if (ms <= 0) return

  // 최소 1분 전 → 만료 직전에 콜백 실행
  const t = Math.max(60000, ms - 60000)
  setTimeout(() => {
    refreshCallback().catch((err) => {
      console.error('토큰 자동 갱신 실패:', err)
    })
  }, t)
}
