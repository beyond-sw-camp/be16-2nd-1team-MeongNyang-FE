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

let router = null;

export function setApiRouter(routerInstance) {
  router = routerInstance;
}

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
        const r = await axios.post(`${API_BASE_URL}/users/token/refresh`, {}, {
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
        
        router.push({ path: '/', query: { showLogin: 'true' } })
        
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
      unlock: (userData) => apiClient.post('/users/lost-password', userData),

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
  setMainPet: async (petId) => {
    try {
      console.log('🔄 petAPI.setMainPet 시작:', petId)
      console.log('🔍 API 호출 URL:', `/pets/main`)
      
      const response = await apiClient.put(`/users/main-pet/${petId}`)
      console.log('✅ petAPI.setMainPet 성공:', response)
      return response
    } catch (error) {
      console.error('❌ petAPI.setMainPet 에러:', error)
      console.error('❌ 에러 상세:', error.response?.data)
      console.error('❌ 에러 상태:', error.response?.status)
      console.error('❌ 에러 메시지:', error.message)
      throw error
    }
  },

  // 마이페이지 정보 조회
  getMyPage: () => apiClient.get('/users/my-page'),

  // 프로필 업데이트
  updateProfile: async (profileData) => {
    console.log('프로필 업데이트 요청:', profileData)
    
    try {
      // 백엔드 profile 엔드포인트 호출
      const response = await apiClient.put('/users/profile', profileData)
      console.log('프로필 업데이트 성공:', response.data)
      return response
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      throw error
    }
  },

  // 팔로우
  follow: (userId) => apiClient.post(`/users/follows/${userId}`),

  // 언팔로우
  unfollow: (userId) => apiClient.delete(`/users/follows/${userId}`),

  // 내 팔로워 목록 조회(채팅만 사용)
  getMyFollowers: (pageable) => apiClient.get('/users/follows/followers', { params: pageable }),

  // 내 팔로잉 목록 조회(채팅만 사용)
  getMyFollowings: (pageable) => apiClient.get('/users/follows/followings', { params: pageable }),

  // 특정 사용자의 팔로워 목록 조회
  getFollowers: (userId, pageable = { page: 0, size: 20 }) => apiClient.get(`/users/${userId}/follows/followers`, { params: pageable }),

  // 특정 사용자의 팔로잉 목록 조회
  getFollowings: (userId, pageable = { page: 0, size: 20 }) => apiClient.get(`/users/${userId}/follows/followings`, { params: pageable }),

  // 내 팔로워 개수 조회
  getFollowersCount: () => apiClient.get('/users/follows/followers', { params: { page: 0, size: 1 } }),

  // 내 팔로잉 개수 조회
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
  likePost: (postId) => apiClient.post(`/posts/${postId}/like`),

  // 좋아요 취소

  unlikePost: (postId) => apiClient.delete(`/posts/${postId}/like`),

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
  getSales: (pageable) => apiClient.get('/markets/sales', { params: pageable }),

  // 찜하기
  likeMarket: (postId) => apiClient.post(`/markets/${postId}/like`),

  // 찜 취소
  unlikeMarket: (postId) => apiClient.delete(`/markets/${postId}/like`),

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
    console.log('=== 반려동물 등록 시작 ===')
    console.log('petData:', petData)
    console.log('petImg:', petImg)
    
    // 백엔드가 기대하는 multipart/form-data 구조로 전송
    const formData = new FormData()
    
    // PetRegisterReq를 JSON Blob으로 추가 (Spring Boot @RequestPart 방식)
    const petDataBlob = new Blob([JSON.stringify(petData)], {
      type: 'application/json'
    })
    formData.append('PetRegisterReq', petDataBlob)
    
    // 이미지 파일 추가 (선택사항) - 다시 활성화
    if (petImg) {
      // 백엔드 Pet.java의 @RequestPart 어노테이션에 맞는 필드명 시도
      formData.append('url', petImg)  // Pet.java에서 petProfileUrl = req.getUrl()이므로
      console.log('✅ 이미지 파일 추가됨 (url 필드):', petImg.name, petImg.size, 'bytes')

    // FormData 디버깅
    console.log('=== FormData 구조 ===')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
      if (value instanceof Blob) {
        console.log(`  - Blob type: ${value.type}`)
        console.log(`  - Blob size: ${value.size}`)
      }
      if (value instanceof File) {
        console.log(`  - File name: ${value.name}`)
        console.log(`  - File type: ${value.type}`)
        console.log(`  - File size: ${value.size}`)
      }
    }

    console.log('=== End FormData Debug ===')

    console.log('=== API 요청 시작 ===')
    console.log('요청 URL:', '/pets/register')
    console.log('요청 헤더:', { 'Content-Type': undefined })

    try {
      const response = await apiClient.post('/pets/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ FormData 등록 성공:', response.data)
      
      return response
    } catch (error) {
      console.log('❌ FormData 등록 실패:', error.response?.data)
      throw error
    }
  }
},

  // 반려동물 목록 조회
  getList: () => apiClient.get('/pets'),

  // 반려동물 존재 여부 확인
  checkExist: () => apiClient.get('/pets/exist'),

  // 사용자 반려동물 목록 조회 (프로필용)
  getUserPets: () => apiClient.get('/pets'),

  // 다른 사용자의 반려동물 목록 조회
  getOtherUserPets: (userId) => apiClient.get('/pets', { params: { userId } }),
  

  // 반려동물 수정
  update: async (petId, petData, petImg) => {

    console.log('🔥🔥🔥 === 반려동물 수정 API 호출 시작 === 🔥🔥🔥')
    console.log('🔍 petId:', petId)
    console.log('🔍 petData:', petData)
    console.log('🔍 petImg:', petImg)
    console.log('🔍 petImg 타입:', typeof petImg)
    console.log('🔍 petImg === null:', petImg === null)
    console.log('🔍 petImg === "REMOVE_IMAGE":', petImg === 'REMOVE_IMAGE')
    
    // 백엔드가 기대하는 multipart/form-data 구조로 전송
    const formData = new FormData()
    
    // PetRegisterReq를 JSON Blob으로 추가 (Spring Boot @RequestPart 방식)
    const petDataBlob = new Blob([JSON.stringify(petData)], {
      type: 'application/json'
    })
    formData.append('PetRegisterReq', petDataBlob)
    
    // 🚨 이미지 처리 로직 분석
    console.log('🚨🚨🚨 이미지 처리 분기 시작 🚨🚨🚨')
    if (petImg === 'REMOVE_IMAGE') {
      // 이미지 제거 요청: url 필드를 아예 보내지 않음 (file == null 조건)
      console.log('🗑️🗑️🗑️ 이미지 제거 요청 - url 필드 미전송으로 백엔드에서 삭제 처리!')
    } else if (petImg && petImg !== null && typeof petImg === 'object' && petImg instanceof File) {
      // 새 이미지 파일 업로드 (File 객체인 경우에만)
      formData.append('url', petImg)
      console.log('📷📷📷 새 이미지 파일 업로드:', petImg.name, petImg.size, 'bytes')
    } else {
      // petImg가 null이면 백엔드에 "기존 이미지 유지" 신호를 보내야 함
      console.log('🛡️🛡️🛡️ 기존 이미지 유지 - 빈 파일 전송으로 백엔드에 KEEP 신호!')
      console.log('   🔍 petImg 값:', petImg)
      console.log('   🔍 petImg 타입:', typeof petImg)
      console.log('   🔍 petImg instanceof File:', petImg instanceof File)
      
      // 🔥 백엔드 로직에 맞춰 빈 파일을 전송 (file != null && file.isEmpty() 조건)
      const emptyFile = new File([''], 'keep_existing.txt', { type: 'text/plain' })
      formData.append('url', emptyFile)
      console.log('📤 백엔드에 빈 파일 전송 - 기존 이미지 유지됨!')
    }
    console.log('🚨🚨🚨 이미지 처리 분기 완료 🚨🚨🚨')
    
    // FormData 디버깅
    console.log('📦📦📦 === FormData 최종 구조 확인 === 📦📦📦')
    let hasUrlField = false
    for (let [key, value] of formData.entries()) {
      console.log(`🔍 ${key}:`, value)
      if (key === 'url') {
        hasUrlField = true
        console.log('🚨 URL 필드 발견! 백엔드로 이미지 처리 신호가 전송됩니다!')
        if (value instanceof File && value.size === 0) {
          console.log('  → 빈 파일 = 기존 이미지 유지 요청!')
        } else if (value instanceof File && value.size > 0) {
          console.log('  → 새 파일 = 이미지 업로드 요청!')
        }
      }
      if (value instanceof Blob) {
        console.log(`  - Blob type: ${value.type}`)
        console.log(`  - Blob size: ${value.size}`)
        if (key === 'url' && value.size === 0) {
          console.log('  🗑️ 빈 Blob = 이미지 삭제 요청!')
        }
      }
      if (value instanceof File) {
        console.log(`  - File name: ${value.name}`)
        console.log(`  - File type: ${value.type}`)
        console.log(`  - File size: ${value.size}`)
        if (key === 'url') {
          console.log('  📷 새 이미지 파일 업로드!')
        }
      }
    }

    if (!hasUrlField) {
      console.log('🗑️ URL 필드 없음 = 백엔드에서 이미지 삭제됨!')
    } else {
      console.log('⚠️ URL 필드 있음 = 이미지 처리 요청!')
    }
    console.log('📦📦📦 === FormData 구조 확인 완료 === 📦📦📦')
    
    try {
      const response = await apiClient.put(`/pets/${petId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ FormData 수정 성공:', response.data)

      return response
    } catch (error) {
      console.log('❌ FormData 수정 실패:', error.response?.data)
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

// 알림 관련 API
export const alarmAPI = {
  // 내 알림 목록 조회
  getMyAlarms: () => apiClient.get('/notifications'),
  
  // 알림 읽음 처리
  markAsRead: (alarmId) => apiClient.patch(`/notifications/${alarmId}`),
  
  // 모든 알림 읽음 처리
  markAllAsRead: () => apiClient.patch('/notifications'),
  
  // 알림 삭제
  deleteAlarm: (alarmId) => apiClient.delete(`/notifications/${alarmId}`),
  
  // 모든 알림 삭제
  deleteAllAlarms: () => apiClient.delete('/notifications')
}

export default apiClient
