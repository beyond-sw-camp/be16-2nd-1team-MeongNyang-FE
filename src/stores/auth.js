import { defineStore } from 'pinia'
import { ref, computed} from 'vue'
import { userAPI } from '@/services/api'
import { 
  getToken, 
  saveTokens, 
  clearAllTokens, 
  isValidToken, 
  extractUserFromToken,
  setupTokenRefresh 
} from '@/utils/auth'
import { getEmailFromToken } from '@/utils/jwt'

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null)
  const accessToken = ref(getToken('accessToken') || null)
  const refreshToken = ref(getToken('refreshToken') || null)
  const loading = ref(false)
  const isInitialized = ref(false)
  const myPageInfo = ref(null) // 마이페이지 정보 (대표 반려동물 포함)

  // 계산된 속성
  const isAuthenticated = computed(() => {
    const authenticated = !!accessToken.value && !!user.value && isValidToken(accessToken.value)
    console.log('isAuthenticated 계산:', {
      hasAccessToken: !!accessToken.value,
      hasUser: !!user.value,
      isValidToken: isValidToken(accessToken.value),
      result: authenticated
    })
    return authenticated
  })

  // 액션
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await userAPI.login(credentials)
      const { accessToken: at, refreshToken: rt, member } = response.data.data
      
      // 토큰 저장
      accessToken.value = at
      refreshToken.value = rt
      saveTokens(at, rt)
      
      // JWT에서 이메일 추출하여 저장
      user.value = member
      
      // 로그인 성공 시 이메일을 로컬 스토리지에 저장
      if (member?.email) {
        localStorage.setItem('email', member.email)
        console.log('🔍 일반 로그인에서 이메일 로컬 스토리지에 저장:', member.email)
      }
      
      // 토큰 자동 갱신 설정
      setupTokenRefresh(refreshAccessToken)
      
      return response.data
    } finally {
      loading.value = false
    }
  }

  const loginWithOAuth = async (oauthData) => {
    loading.value = true
    try {
      const { accessToken: at, refreshToken: rt, member } = oauthData
      
      // 토큰 저장
      accessToken.value = at
      refreshToken.value = rt
      saveTokens(at, rt)
      
      // 사용자 정보 저장
      user.value = member
      
      // OAuth 로그인 성공 시 이메일을 로컬 스토리지에 저장
      if (member?.email) {
        localStorage.setItem('email', member.email)
        console.log('🔍 OAuth 로그인에서 이메일 로컬 스토리지에 저장:', member.email)
      }
      
      // 토큰 자동 갱신 설정
      setupTokenRefresh(refreshAccessToken)
      

      return { success: true }

    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    try {
      const response = await userAPI.signup(userData)
      return response.data
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    clearAllTokens()
    
    // localStorage에서 이메일도 제거
    localStorage.removeItem('email')
  }

  const refreshAccessToken = async () => {
    try {
      const currentRefreshToken = getToken('refreshToken')
      if (!currentRefreshToken) {
        console.log('리프레시 토큰이 없습니다. 로그아웃 처리')
        logout()
        return null
      }
      
      const response = await userAPI.refreshAT(currentRefreshToken)
      const { accessToken: at, refreshToken: rt } = response.data.data
      
      // 새 토큰 저장
      accessToken.value = at
      refreshToken.value = rt
      saveTokens(at, rt)
      
      // JWT에서 이메일 추출하여 저장
      const email = getEmailFromToken(at)
      if (email) {
        localStorage.setItem('email', email)
      }
      
      // 토큰 자동 갱신 재설정
      setupTokenRefresh(refreshAccessToken)
      
      // 마이페이지 정보 새로고침
      await fetchMyPageInfo()
      
      return at
    } catch (error) {
      console.error('토큰 자동 갱신 실패:', error)
      
      // 401 에러인 경우 (refresh token 만료) 조용히 로그아웃
      if (error.response?.status === 401) {
        console.log('리프레시 토큰이 만료되었습니다. 자동 로그아웃')
        logout()
        return null
      }
      
      // 다른 에러인 경우에만 throw
      throw error
    }
  }

  const getCurrentUser = async () => {
    if (!accessToken.value || !isValidToken(accessToken.value)) {
      return null
    }
    
    try {
      const response = await userAPI.getMyPage()
      user.value = response.data.data
      myPageInfo.value = response.data.data // 마이페이지 정보도 함께 저장
      return response.data.data
    } catch (error) {
      if (error.response?.status === 401) {
        logout()
      }
      throw error
    }
  }

  const updateProfile = async (profileData) => {
    loading.value = true
    try {
      const response = await userAPI.updateProfile(profileData)
      user.value = response.data.data
      return response.data
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    loading.value = true
    try {
      const response = await userAPI.changePassword(passwordData)
      return response.data
    } finally {
      loading.value = false
    }
  }

  const withdraw = async () => {
    loading.value = true
    try {
      await userAPI.delete()
      logout()
    } finally {
      loading.value = false
    }
  }

  // 이메일 중복 확인
  const checkEmail = async (email) => {
    const response = await userAPI.checkEmail(email)
    return response.data
  }

  // 닉네임 중복 확인
  const checkNickname = async (nickname) => {
    const response = await userAPI.checkNickname(nickname)
    return response.data
  }

  // 이메일 인증번호 발송
  const verifyEmail = async (email) => {
    const response = await userAPI.verifyEmail(email)
    return response.data
  }

  // 이메일 인증번호 확인
  const verifyEmailCheck = async (email, code) => {
    const response = await userAPI.verifyEmailCheck(email, code)
    return response.data
  }

  // 임시 비밀번호 발급
  const lostPassword = async (userData) => {
    loading.value = true
    try {
      const response = await userAPI.lostPassword(userData)
      return response.data
    } finally {
      loading.value = false
    }
  }

  // 계정 잠금 해제
  const unlock = async (userData) => {
    loading.value = true
    try {
      const response = await userAPI.unlock(userData)
      return response.data
    } finally {
      loading.value = false
    }
  }

  // 마이페이지 정보 가져오기 (대표 반려동물 포함)
  const fetchMyPageInfo = async () => {
    try {
      const response = await userAPI.getMyPage()
      if (response.data.isSuccess) {
        myPageInfo.value = response.data.data
        console.log('마이페이지 정보:', myPageInfo.value)
      }
    } catch (error) {
      console.error('마이페이지 정보 가져오기 실패:', error)
    }
  }

  // 초기화 시 사용자 정보 가져오기
  const initialize = async () => {
    if (isInitialized.value) return
    
    try {
      const token = getToken('accessToken')
      const refreshTokenValue = getToken('refreshToken')
      
      // accessToken이 유효한 경우
      if (token && isValidToken(token)) {
        accessToken.value = token
        refreshToken.value = refreshTokenValue
        
        // JWT에서 이메일 추출하여 저장
        const email = getEmailFromToken(token)
        if (email) {
          localStorage.setItem('email', email)
        }
        
        // 토큰에서 사용자 정보 추출 (임시)
        const userFromToken = extractUserFromToken(token)
        if (userFromToken) {
          user.value = userFromToken
        }
        
        // 서버에서 최신 사용자 정보 가져오기
        await getCurrentUser()
        
        // 토큰 자동 갱신 설정
        setupTokenRefresh(refreshAccessToken)
      } 
      // accessToken이 없거나 만료되었지만 refreshToken이 있는 경우
      else if (refreshTokenValue) {
        console.log('accessToken이 없거나 만료됨, refreshToken으로 자동 갱신 시도')
        refreshToken.value = refreshTokenValue
        
        // refresh token으로 access token 갱신 시도
        const newAccessToken = await refreshAccessToken()
        if (newAccessToken) {
          console.log('토큰 자동 갱신 성공')
          // 서버에서 최신 사용자 정보 가져오기
          await getCurrentUser()
        } else {
          console.log('토큰 자동 갱신 실패, 로그아웃 처리')
          logout()
        }
      }
    } catch (error) {
      console.error('인증 초기화 실패:', error)
      logout()
    } finally {
      isInitialized.value = true
    }
  }

  return {
    // 상태
    user,
    accessToken,
    refreshToken,
    loading,
    isInitialized,
    myPageInfo,
    
    // 계산된 속성
    isAuthenticated,
    
    // 액션
    login,
    loginWithOAuth,
    register,
    logout,
    refreshAccessToken,
    getCurrentUser,
    updateProfile,
    changePassword,
    withdraw,
    checkEmail,
    checkNickname,
    verifyEmail,
    verifyEmailCheck,
    lostPassword,
    unlock,
    fetchMyPageInfo,
    initialize
  }
})
