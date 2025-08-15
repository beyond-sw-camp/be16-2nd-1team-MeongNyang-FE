import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const loading = ref(false)

  // 계산된 속성
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  // 액션
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await userAPI.login(credentials)
      const { accessToken: at, refreshToken: rt, member } = response.data.data
      
      // 토큰 저장
      accessToken.value = at
      refreshToken.value = rt
      localStorage.setItem('accessToken', at)
      localStorage.setItem('refreshToken', rt)
      
      // 사용자 정보 저장
      user.value = member
      
      return response.data
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
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const refreshAccessToken = async () => {
    try {
      const response = await userAPI.refreshToken(refreshToken.value)
      
      const { accessToken: at } = response.data.data
      accessToken.value = at
      localStorage.setItem('accessToken', at)
      
      return at
    } catch (error) {
      logout()
      throw error
    }
  }

  const getCurrentUser = async () => {
    if (!accessToken.value) return null
    
    try {
      const response = await userAPI.getMyPage()
      user.value = response.data.data
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

  // 초기화 시 사용자 정보 가져오기
  const initialize = async () => {
    if (accessToken.value) {
      try {
        await getCurrentUser()
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error)
      }
    }
  }

  return {
    // 상태
    user,
    accessToken,
    refreshToken,
    loading,
    
    // 계산된 속성
    isAuthenticated,
    
    // 액션
    login,
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
    initialize
  }
})
