import axios from 'axios'
import { getToken, saveTokens, clearAllTokens, isTokenExpired, generateCSRFToken } from '@/utils/auth'

// API 기본 설정
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'

// 토큰 갱신 상태 관리
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const accessToken = getToken('accessToken')
    
    if (accessToken && !isTokenExpired(accessToken)) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    // CSRF 토큰 추가 (POST, PUT, DELETE 요청에만)
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const csrfToken = generateCSRFToken()
      config.headers['X-CSRF-Token'] = csrfToken
    }
    
    // FormData 요청일 때는 Content-Type 헤더 제거 (브라우저가 자동으로 설정)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 토큰 갱신
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    // 401 에러이고 토큰 갱신을 시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중인 경우 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const refreshToken = getToken('refreshToken')
        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다.')
        }
        
        const response = await apiClient.post('/users/refresh-token', { 
          refreshToken 
        })
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data
        
        // 새 토큰 저장
        saveTokens(newAccessToken, newRefreshToken)
        
        // 큐에 대기 중인 요청들 처리
        processQueue(null, newAccessToken)
        
        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
        
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        processQueue(refreshError, null)
        clearAllTokens()
        
        // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닌 경우)
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

// 사용자 관련 API
export const userAPI = {
  // 이메일 중복 확인
  checkEmail: (email) => apiClient.post('/users/check-email', { email }),
  
  // 이메일 인증번호 발송
  verifyEmail: (email) => apiClient.post('/users/verify-email', { email }),
  
  // 이메일 인증번호 확인
  verifyEmailCheck: (email, code) => apiClient.post('/users/verify-email-check', { email, code }),
  
  // 닉네임 중복 확인
  checkNickname: (nickname) => apiClient.post('/users/check-nickname', { nickname }),
  
  // 회원가입
  signup: (userData) => apiClient.post('/users/sign', userData),
  
  // 로그인
  login: (credentials) => apiClient.post('/users/login', credentials),
  
  // 토큰 갱신
  refreshToken: (refreshToken) => apiClient.post('/users/refresh-token', { refreshToken }),
  
  // 임시 비밀번호 발급
  lostPassword: (userData) => apiClient.post('/users/lost-password', userData),
  
  // 계정 잠금 해제
  unlock: (userData) => apiClient.post('/users/unlock', userData),
  
  // 비밀번호 변경
  changePassword: (passwordData) => apiClient.put('/users/change/password', passwordData),
  
  // 회원 탈퇴
  delete: (password) => apiClient.post('/users/delete', { password }),
  
  // 대표 동물 설정
  setMainPet: (petId) => apiClient.put(`/users/my-page/${petId}/main-pet`),
  
  // 마이페이지 정보 조회
  getMyPage: () => apiClient.get('/users/my-page'),
  
  // 팔로우
  follow: (userId) => apiClient.post(`/users/follows/${userId}`),
  
  // 언팔로우
  unfollow: (userId) => apiClient.delete(`/users/follows/${userId}`),
  
  // 팔로워 목록 조회
  getFollowers: (pageable) => apiClient.get('/users/follows/followers', { params: pageable }),
  
  // 팔로잉 목록 조회
  getFollowings: (pageable) => apiClient.get('/users/follows/followings', { params: pageable }),
  
  // 사용자 차단
  block: (userId) => apiClient.post(`/users/blocks/${userId}`),
  
  // 사용자 차단 해제
  unblock: (userId) => apiClient.delete(`/users/blocks/${userId}`),
  
  // 차단 목록 조회
  getBlocks: (pageable, type) => apiClient.get('/users/blocks', { params: { ...pageable, type } })
}

// 게시글 관련 API
export const postAPI = {
  // 내 일기 목록 조회 (대시보드용)
  getMyPosts: (pageable = { page: 0, size: 1 }) => apiClient.get('/posts', { params: pageable }),
  
  // 일기 작성
  create: (postData, files) => {
    const formData = new FormData()
    formData.append('postCreateReq', JSON.stringify(postData))
    if (files) {
      files.forEach(file => formData.append('files', file))
    }
    return apiClient.post('/posts', formData)
  },
  
  // 일기 수정
  update: (postId, postData, files) => {
    const formData = new FormData()
    formData.append('postEditReq', JSON.stringify(postData))
    if (files) {
      files.forEach(file => formData.append('files', file))
    }
    return apiClient.patch(`/posts/${postId}`, formData)
  },
  
  // 일기 삭제
  delete: (postId) => apiClient.delete(`/posts/${postId}`),
  
  // 일기 목록 조회
  getList: (pageable) => apiClient.get('/posts', { params: pageable }),
  
  // 일기 상세 조회
  getDetail: (postId) => apiClient.get(`/posts/${postId}`),
  
  // 좋아요
  like: (postId) => apiClient.post('/posts/like', { postId }),
  
  // 좋아요 취소
  unlike: (postId) => apiClient.delete(`/posts/${postId}/like`),
  
  // 좋아요 목록 조회
  getLikes: (postId, pageable) => apiClient.get(`/posts/${postId}/like`, { params: pageable }),
  
  // 댓글 작성
  createComment: (postId, content) => apiClient.post(`/posts/${postId}/comments`, { content }),
  
  // 대댓글 작성
  createReply: (commentId, content, mentionUserId) => 
    apiClient.post(`/posts/comments/${commentId}/reply`, { content, mentionUserId }),
  
  // 댓글 수정
  updateComment: (commentId, content) => apiClient.patch(`/posts/comments/${commentId}`, { content }),
  
  // 댓글 삭제
  deleteComment: (commentId) => apiClient.delete(`/posts/comments/${commentId}`),
  
  // 댓글 목록 조회
  getComments: (postId, pageable) => apiClient.get(`/posts/${postId}/comments`, { params: pageable }),
  
  // 검색
  search: (searchType, keyword, pageable) => 
    apiClient.get('/posts/search', { params: { searchType, keyword, ...pageable } }),
  
  // 신고
  report: (postId, reason) => apiClient.post(`/posts/${postId}/reports`, { reason })
}

// 마켓플레이스 관련 API
export const marketAPI = {
  // 거래글 등록
  create: (postData, imageFiles) => {
    const formData = new FormData()
    formData.append('marketPostCreateReq', JSON.stringify(postData))
    if (imageFiles) {
      imageFiles.forEach(file => formData.append('files', file))
    }
    return apiClient.post('/markets/posts', formData)
  },
  
  // 거래글 수정
  update: (postId, postData, imageFiles) => {
    const formData = new FormData()
    formData.append('marketPostUpdateReq', JSON.stringify(postData))
    if (imageFiles) {
      imageFiles.forEach(file => formData.append('files', file))
    }
    return apiClient.patch(`/markets/${postId}`, formData)
  },
  
  // 거래글 삭제
  delete: (postId) => apiClient.delete(`/markets/${postId}`),
  
  // 거래글 목록 조회
  getList: (pageable) => apiClient.get('/markets/posts', { params: pageable }),
  
  // 거래글 상세 조회
  getDetail: (postId) => apiClient.get(`/markets/posts/${postId}`),
  
  // 구매목록 조회
  getPurchases: (pageable) => apiClient.get('/markets/purchases', { params: pageable }),
  
  // 판매목록 조회
  getSales: (pageable = { page: 0, size: 1 }) => apiClient.get('/markets/sales', { params: pageable }),
  
  // 찜하기
  like: (postId) => apiClient.post(`/markets/${postId}/like`),
  
  // 찜 취소
  unlike: (postId) => apiClient.delete(`/markets/${postId}/like`),
  
  // 찜 목록 조회
  getLikes: (pageable) => apiClient.get('/markets/like', { params: pageable })
}

// 반려동물 관련 API
export const petAPI = {
  // 반려동물 등록
  register: (petData, petImg) => {
    const formData = new FormData()
    
    // JSON 데이터를 문자열로 변환하여 추가
    formData.append('PetRegisterReq', new Blob([JSON.stringify(petData)], {
      type: 'application/json'
    }))
    
    // 이미지 파일 추가
    if (petImg) {
      formData.append('petImg', petImg)
    }
    
    // FormData 디버깅
    console.log('=== FormData Debug ===')
    console.log('Original petData:', petData)
    console.log('FormData contents:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value, typeof value)
      if (key === 'PetRegisterReq') {
        try {
          const parsed = JSON.parse(value)
          console.log('Parsed PetRegisterReq:', parsed)
        } catch (e) {
          console.log('Failed to parse PetRegisterReq:', e)
        }
      }
    }
    console.log('=== End FormData Debug ===')
    
    return apiClient.post('/pets/register', formData, {
      headers: {
        'Content-Type': undefined // 명시적으로 undefined로 설정
      }
    })
  },
  
  // 반려동물 목록 조회
  getList: () => apiClient.get('/pets/list'),
  
  // 반려동물 수정
  update: (petId, petData, petImg) => {
    const formData = new FormData()
    
    // JSON 데이터를 Blob으로 변환하여 추가
    formData.append('PetRegisterReq', new Blob([JSON.stringify(petData)], {
      type: 'application/json'
    }))
    
    // 이미지 파일 추가
    if (petImg) {
      formData.append('petImg', petImg)
    }
    
    // FormData 디버깅
    console.log('=== FormData Debug ===')
    console.log('Original petData:', petData)
    console.log('FormData contents:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value, typeof value)
      if (key === 'PetRegisterReq') {
        try {
          const parsed = JSON.parse(value)
          console.log('Parsed PetRegisterReq:', parsed)
        } catch (e) {
          console.log('Failed to parse PetRegisterReq:', e)
        }
      }
    }
    console.log('=== End FormData Debug ===')
    
    return apiClient.put(`/pets/${petId}`, formData, {
      headers: {
        'Content-Type': undefined // 명시적으로 undefined로 설정
      }
    })
  },
  
  // 반려동물 삭제
  delete: (petId) => apiClient.delete(`/pets/${petId}`)
}

// 종류 관련 API
export const speciesAPI = {
  // 종류 목록 조회
  getList: () => apiClient.get('/species/list'),
  
  // 종류 검색
  search: (searchData) => apiClient.get('/species/search', { params: searchData })
}

// 채팅 관련 API
export const chatAPI = {
  // 채팅방 개설
  createRoom: (roomData) => apiClient.post('/chat-rooms', roomData),
  
  // 채팅방 목록 조회
  getRooms: () => apiClient.get('/chat-rooms'),
  
  // 내 채팅방 목록 조회
  getMyChatRooms: () => apiClient.get('/chat-rooms'),
  
  // 메시지 목록 조회
  getMessages: (roomId) => apiClient.get(`/chat-rooms/${roomId}/messages`),
  
  // 참여자 추가
  addParticipants: (roomId, participants) => 
    apiClient.post(`/chat-rooms/${roomId}/participants`, participants),
  
  // 채팅방 나가기
  leaveRoom: (roomId) => apiClient.delete(`/chat-rooms/${roomId}/participants/me`),
  
  // 참여자 목록 조회
  getParticipants: (roomId) => apiClient.get(`/chat-rooms/${roomId}/participants`),
  
  // 파일 업로드
  uploadFiles: (roomId, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return apiClient.post(`/chat-rooms/${roomId}/files`, formData)
  }
}

// 관리자 관련 API
export const adminAPI = {
  // 회원 목록 조회
  getUsers: () => apiClient.get('/admin/users/list'),
  
  // 회원 상세 조회
  getUserDetail: (userId) => apiClient.get(`/admin/users/detail/${userId}`),
  
  // 신고 목록 조회
  getReports: (pageable) => apiClient.get('/admin/reports', { params: pageable }),
  
  // 신고 상세 조회
  getReportDetail: (reportId) => apiClient.get(`/admin/reports/${reportId}`),
  
  // 신고 처리
  processReport: (reportId, resultData) => apiClient.post(`/admin/reports/${reportId}`, resultData)
}

export default apiClient
