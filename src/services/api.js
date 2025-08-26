import axios from 'axios'
import {
  ACCESS_KEY,           // 'accessToken'
  REFRESH_KEY,          // 'refreshToken'
  getToken,
  saveTokens,
  clearAllTokens,
  // isTokenExpired,     // ← 사용 안 하면 주석/삭제
  // generateCSRFToken,  // ← 사용 안 하면 주석/삭제
  RT_HEADER_RAW,        // 'X-Refresh-Token' (요청 보낼 때 원형)
  RT_HEADER_LOWER       // 'x-refresh-token' (응답 헤더 읽을 때)
} from '@/utils/auth'

// 환경변수 (네 프로젝트 규칙)
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'

// refresh 동시 처리 큐
let isRefreshing = false
let failedQueue = []
const pushQueue = () => new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
const flushQueue = (err, token = null) => {
  failedQueue.forEach(p => err ? p.reject(err) : p.resolve(token))
  failedQueue = []
}

// axios 인스턴스
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 요청 인터셉터 (필요 시 CSRF/만료검사 추가 가능)
apiClient.interceptors.request.use((config) => {
  const at = getToken(ACCESS_KEY)
  if (at /* && !isTokenExpired(at) */) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${at}`
  }

  // FormData면 Content-Type 제거 (브라우저가 boundary 자동 설정)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  // 만약 CSRF 쓰려면 주석 해제
  // if (['post','put','delete','patch'].includes((config.method || '').toLowerCase())) {
  //   config.headers = config.headers || {}
  //   config.headers['X-CSRF-Token'] = generateCSRFToken()
  // }

  return config
})

// 응답 인터셉터 (AT/RT 저장 + 401 자동 재발급)
apiClient.interceptors.response.use(
  (res) => {
    const body = res?.data
    const at = body?.accessToken ?? body?.data?.accessToken ?? null
    const rt = res?.headers?.[RT_HEADER_LOWER] ?? null

    if (at || rt) {
      // 하나만 와도 기존 값 보존하여 저장
      saveTokens(at || getToken(ACCESS_KEY), rt || getToken(REFRESH_KEY))
    }
    return res
  },
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      // 이미 다른 요청이 refresh 중 → 큐에 대기
      if (isRefreshing) {
        try {
          const newAT = await pushQueue()
          original.headers = original.headers || {}
          original.headers.Authorization = `Bearer ${newAT}`
          return apiClient(original)
        } catch (e) {
          return Promise.reject(e)
        }
      }

      // 내가 refresh
      original._retry = true
      isRefreshing = true

      try {
        const rt = getToken(REFRESH_KEY)
        if (!rt) throw new Error('NO_REFRESH_TOKEN')

        // RT는 "헤더"로 보냄 (서버 규약)
        const r = await axios.post(`${API_BASE_URL}/users/refresh-token`, {}, {
          headers: { [RT_HEADER_RAW]: rt }
        })

        const newAT = r?.data?.accessToken ?? r?.data?.data?.accessToken
        const newRT = r?.headers?.[RT_HEADER_LOWER] ?? rt // 회전 없으면 기존 유지

        if (!newAT) throw new Error('REFRESH_FAILED_NO_AT')

        saveTokens(newAT, newRT)
        flushQueue(null, newAT)

        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${newAT}`
        return apiClient(original)
      } catch (e) {
        flushQueue(e, null)
        clearAllTokens()
        if (window.location.pathname !== '/users/login') window.location.href = '/users/login'
        return Promise.reject(e)
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

  // 임시 비밀번호 발급
  lostPassword: (userData) => apiClient.post('/users/lost-password', userData),

  // 계정 잠금 해제
  unlock: (userData) => apiClient.post('/users/unlock', userData),

  // 비밀번호 변경
  changePassword: (passwordData) => apiClient.put('/users/change/password', passwordData),

  // 회원 탈퇴
  delete: (refreshToken) =>
    apiClient.post('/users/delete', null, { headers: { [RT_HEADER_RAW]: refreshToken } }),

  // --- 소셜 로그인 (인가코드 -> 서버) ---
  oauthLogin: (provider, code) => apiClient.post(`/users/login/${provider}`, { code }),

  // --- 소셜 계정 연동 확정 ---
  confirmLink: (linkTicket) => apiClient.post('/users/link/confirm', { linkTicket }),
  // --- 소셜 신규 유저 추가정보 제출 ---
  signupExtra: (payload) => apiClient.post('/users/signup-extra', payload),

  // ✅ AT 재발급(헤더 RT)
  refreshAT: (refreshToken) =>
    apiClient.post('/users/token/refresh', null, { headers: { [RT_HEADER_RAW]: refreshToken } }),
  // ✅ 로그아웃(헤더 RT)
  logout: (refreshToken) =>
    apiClient.post('/users/logout', null, { headers: { [RT_HEADER_RAW]: refreshToken } }),

  // 대표 동물 설정
  setMainPet: () => apiClient.put(`/users/pets/main`),
  
  // 마이페이지 정보 조회
  getMyPage: () => apiClient.get('/users/my-page'),

  // 프로필 업데이트
  updateProfile: (profileData, imageFile) => {
    const formData = new FormData()
    formData.append('profileUpdateReq', JSON.stringify(profileData))
    if (imageFile) {
      formData.append('profileImage', imageFile)
    }
    return apiClient.put('/users/profile', formData)
  },

  // 팔로우
  follow: (userId) => apiClient.post(`/users/follows/${userId}`),

  // 언팔로우
  unfollow: (userId) => apiClient.delete(`/users/follows/${userId}`),

  // 팔로워 목록 조회
  getFollowers: (pageable) => apiClient.get('/users/follows/followers', { params: pageable }),

  // 팔로잉 목록 조회
  getFollowings: (pageable) => apiClient.get('/users/follows/followings', { params: pageable }),

  // 팔로워 개수 조회 (프로필용)
  getFollowersCount: () => apiClient.get('/users/follows/followers', { params: { page: 0, size: 1 } }),

  // 팔로잉 개수 조회 (프로필용)
  getFollowingsCount: () => apiClient.get('/users/follows/followings', { params: { page: 0, size: 1 } }),

  // 사용자 차단
  block: (userId) => apiClient.post(`/users/blocks/${userId}`),

  // 사용자 차단 해제
  unblock: (userId) => apiClient.delete(`/users/blocks/${userId}`),

  // 차단 목록 조회
  getBlocks: (pageable, type) => apiClient.get('/users/blocks', { params: { ...pageable, type } }),

  // 다른 사용자 프로필 조회
  getUserProfile: (userId) => apiClient.get(`/users/${userId}/profile`),

  // 팔로우 상태 확인
  checkFollowStatus: (userId) => apiClient.get(`/users/follows/${userId}/status`),

  // 다른 사용자의 팔로워 개수 조회
  getUserFollowersCount: (userId) => apiClient.get(`/users/${userId}/follows/followers`),

  // 다른 사용자의 팔로잉 개수 조회
  getUserFollowingsCount: (userId) => apiClient.get(`/users/${userId}/follows/followings`),

  // 다른 사용자의 팔로워 목록 조회
  getUserFollowers: (userId, pageable = { page: 0, size: 20 }) => apiClient.get(`/users/${userId}/follows/followers`, { params: pageable }),

  // 다른 사용자의 팔로잉 목록 조회
  getUserFollowings: (userId, pageable = { page: 0, size: 20 }) => apiClient.get(`/users/${userId}/follows/followings`, { params: pageable }),

  // 다른 사용자의 게시물 개수 조회
  getUserPostsCount: (userId) => apiClient.get('/posts', { params: { userId, page: 0, size: 1 } })
}

// 게시글 관련 API
export const postAPI = {
  // 전체 일기 목록 조회
  getAllPosts: (pageable = { page: 0, size: 9 }) => apiClient.get('/posts', { params: pageable }),
  
  // 내 일기 목록 조회 (대시보드용)
  getMyPosts: (pageable = { page: 0, size: 1 }) => apiClient.get('/posts/me', { params: pageable }),
  // 내 게시물 개수 조회 (프로필용)
  getMyPostsCount: () => apiClient.get('/posts', { params: { page: 0, size: 1 } }),

  // 일기 작성
  create: (formData) => {
    return apiClient.post('/posts', formData)
  },

  // 일기 수정
  update: (postId, formData) => {
    return apiClient.patch(`/posts/${postId}`, formData)
  },

  // 일기 삭제
  delete: (postId) => apiClient.delete(`/posts/${postId}`),

  // 일기 목록 조회
  getList: (pageable) => apiClient.get('/posts', { params: pageable }),

  // 다른 사용자의 일기 목록 조회
  getUserPosts: (userId, pageable) => apiClient.get(`/posts/${userId}`, { params: pageable }),
  
  // 일기 상세 조회
  getDetail: (postId) => apiClient.get(`/posts/detail/${postId}`),
  
  // 좋아요
  like: (postId) => apiClient.post(`/posts/${postId}/like`),

  // 좋아요 취소
  unlike: (postId) => apiClient.delete(`/posts/${postId}/like`),

  // 좋아요 목록 조회
  getLikes: (postId, pageable) => apiClient.get(`/posts/${postId}/like`, { params: pageable }),

  // 댓글 작성
  createComment: (postId, content) => apiClient.post(`/posts/${postId}/comments`, { content }),

  // 대댓글 작성
  createReply: (commentId, content, mentionUserId) => {
    return apiClient.post(`/posts/comments/${commentId}/reply`, { content, mentionUserId })
  },

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
    formData.append(
      'post',
      new Blob([JSON.stringify(postData)], { type: 'application/json' })
    )

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => formData.append('imageFiles', file))
    }

    // FormData는 axios 인터셉터에서 자동으로 Content-Type 설정
    return apiClient.post('/markets/posts', formData)
  },

  // 거래글 수정
  update: (postId, postData, imageFiles) => {
    const formData = new FormData()
  
    formData.append(
      'post',
      new Blob([JSON.stringify(postData)], { type: 'application/json' })
    )
  
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => formData.append('imageFiles', file))
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
  getLikes: (pageable) => apiClient.get('/markets/like', { params: pageable }),

  // 사용자의 찜한 게시글 목록 조회
  getUserLikedPosts() {
    return apiClient.get('/markets/likes/user')
  }
}

// 반려동물 관련 API
export const petAPI = {
  // 반려동물 등록
  register: async (petData, petImg) => {
    // 이미지가 없으면 JSON으로만 전송
    if (!petImg) {
      console.log('이미지 없음 - JSON으로만 전송')
      return await apiClient.post('/pets/register', petData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // 이미지가 있으면 FormData로 전송
    const formData = new FormData()

    // PetRegisterReq를 JSON 문자열로 전송
    formData.append('PetRegisterReq', JSON.stringify(petData))

    // 이미지 파일 추가 (백엔드 @RequestPart("url")와 맞춤)
    formData.append('url', petImg)

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

    console.log('=== API 요청 시작 ===')
    console.log('요청 URL:', '/pets/register')
    console.log('요청 헤더:', { 'Content-Type': undefined })

    try {
      const response = await apiClient.post('/pets/register', formData, {
        headers: {
          'Content-Type': undefined // 명시적으로 undefined로 설정
        }
      })

      console.log('=== API 응답 성공 ===')
      console.log('응답 상태:', response.status)
      console.log('응답 헤더:', response.headers)
      console.log('응답 데이터:', response.data)
      console.log('응답 데이터 타입:', typeof response.data)
      console.log('응답 데이터 키들:', Object.keys(response.data))

      // 백엔드 응답 구조 상세 분석
      if (response.data) {
        console.log('=== 백엔드 응답 구조 분석 ===')
        console.log('response.data.success:', response.data.success)
        console.log('response.data.isSuccess:', response.data.isSuccess)
        console.log('response.data.message:', response.data.message)
        console.log('response.data.data:', response.data.data)
        console.log('response.data.status:', response.data.status)

        if (response.data.status) {
          console.log('response.data.status.code:', response.data.status.code)
          console.log('response.data.status.message:', response.data.status.message)
        }
        console.log('=== 백엔드 응답 구조 분석 완료 ===')
      }

      return response
    } catch (error) {
      console.log('=== API 요청 실패 ===')
      console.log('에러 객체:', error)
      console.log('에러 응답:', error.response)
      if (error.response) {
        console.log('에러 응답 상태:', error.response.status)
        console.log('에러 응답 데이터:', error.response.data)
        console.log('에러 응답 헤더:', error.response.headers)
      }
      throw error
    }
  },

  // 반려동물 목록 조회
  getList: () => apiClient.get('/pets'),

  // 사용자 반려동물 목록 조회 (프로필용)
  getUserPets: () => apiClient.get('/pets'),

  // 다른 사용자의 반려동물 목록 조회
  getOtherUserPets: (userId) => apiClient.get('/pets', { params: { userId } }),

  // 대표 펫 설정
  setMainPet: () => apiClient.put(`/users/pets/main`),
  
  // 반려동물 존재 여부 확인
  checkExist: () => apiClient.get('/pets/exist'),
  
  // 대표 반려동물 설정 (다른 엔드포인트)
  setMainPetAlt: () => apiClient.put(`/users/pets/main`),

  // 반려동물 수정
  update: async (petId, petData, petImg) => {
    // 이미지가 없으면 JSON으로만 전송
    if (!petImg) {
      console.log('이미지 없음 - JSON으로만 전송')
      return await apiClient.put(`/pets/${petId}`, petData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // 이미지가 있으면 FormData로 전송
    const formData = new FormData()

    // PetRegisterReq를 JSON 문자열로 전송
    formData.append('PetRegisterReq', JSON.stringify(petData))

    // 이미지 파일 추가 (백엔드 @RequestPart("url")와 맞춤)
    formData.append('url', petImg)

    // FormData 디버깅
    console.log('=== FormData Debug (UPDATE) ===')
    console.log('수정할 petId:', petId)
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
      if (key === 'petImg') {
        console.log('=== 이미지 파일 상세 정보 ===')
        console.log('파일 이름:', value.name)
        console.log('파일 크기:', value.size, 'bytes')
        console.log('파일 타입:', value.type)
        console.log('파일 마지막 수정:', value.lastModified)
        console.log('=== 이미지 파일 상세 정보 완료 ===')
      }
    }
    console.log('=== End FormData Debug (UPDATE) ===')

    console.log('=== UPDATE API 요청 시작 ===')
    console.log('요청 URL:', `/pets/${petId}`)
    console.log('요청 헤더:', { 'Content-Type': undefined })

    try {
      const response = await apiClient.put(`/pets/${petId}`, formData, {
        headers: {
          'Content-Type': undefined // 명시적으로 undefined로 설정
        }
      })

      console.log('=== UPDATE API 응답 성공 ===')
      console.log('응답 상태:', response.status)
      console.log('응답 헤더:', response.headers)
      console.log('응답 데이터:', response.data)
      console.log('응답 데이터 타입:', typeof response.data)
      console.log('응답 데이터 키들:', Object.keys(response.data))

      // 백엔드 응답 구조 상세 분석
      if (response.data) {
        console.log('=== UPDATE 백엔드 응답 구조 분석 ===')
        console.log('response.data.success:', response.data.success)
        console.log('response.data.isSuccess:', response.data.isSuccess)
        console.log('response.data.message:', response.data.message)
        console.log('response.data.data:', response.data.data)
        console.log('response.data.status:', response.data.status)

        if (response.data.status) {
          console.log('response.data.status.code:', response.data.status.code)
          console.log('response.data.status.message:', response.data.status.message)
        }

        // 백엔드 응답 전체 구조 상세 분석
        console.log('=== 백엔드 응답 전체 구조 ===')
        console.log('전체 response.data:', JSON.stringify(response.data, null, 2))
        console.log('response.data 키들:', Object.keys(response.data))
        console.log('response.data.data 타입:', typeof response.data.data)
        console.log('response.data.data 내용:', response.data.data)
        console.log('=== 백엔드 응답 전체 구조 완료 ===')

        console.log('=== UPDATE 백엔드 응답 구조 분석 완료 ===')
      }

      return response
    } catch (error) {
      console.log('=== UPDATE API 요청 실패 ===')
      console.log('에러 객체:', error)
      console.log('에러 응답:', error.response)
      if (error.response) {
        console.log('에러 응답 상태:', error.response.status)
        console.log('에러 응답 데이터:', error.response.data)
        console.log('에러 응답 헤더:', error.response.headers)
      }
      throw error
    }
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
  createRoom: (roomData) => {
    const { roomName, participantEmails = [] } = roomData

    // 백엔드 API 형식에 맞춰 요청 데이터 구성
    const requestData = {
      roomName,
      userEmailList: participantEmails
    }

    return apiClient.post('/chat-rooms', requestData)
  },

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
