import { createApp } from 'vue'
import App from './App.vue'
// Axios 인터셉터 설정
import router from './router'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import './assets/styles/global-design-system.css'
import '@mdi/font/css/materialdesignicons.css'
import axios from 'axios'
import { useAuthStore } from './stores/auth'
import SseService from './services/sse'

// axios interceptor 설정
axios.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) config.headers['Authorization'] = `Bearer ${accessToken}`
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 모든 axios요청에서 401을 받을경우에 interceptor를 통해 rt를 통한 at 재발급
// rt마저 만료되었을때는 login창으로 이동
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member/refresh-at`, { refreshToken })
        localStorage.setItem("accessToken", response.data.data.accessToken)

        console.log("갱신성공")
        window.location.reload()
      } catch (e) {
        console.log("갱신 실패", e)

        localStorage.clear()
        window.location.href = "/member/login"
      }
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

// 전역 에러 핸들러 설정
app.config.errorHandler = (error, instance, info) => {
  console.error('전역 에러 발생:', error)
  console.error('에러 정보:', info)
  console.error('컴포넌트:', instance)
  
  // 사용자에게 에러 알림 (간단한 alert로 대체)
  alert('오류가 발생했습니다. 페이지를 새로고침해주세요.')
}

// 처리되지 않은 Promise 에러 핸들러
window.addEventListener('unhandledrejection', (event) => {
  console.error('처리되지 않은 Promise 에러:', event.reason)
  alert('오류가 발생했습니다. 페이지를 새로고침해주세요.')
  event.preventDefault()
})

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// 인증 스토어 초기화
const authStore = useAuthStore()
authStore.initialize()

// SSE 서비스 초기화 및 디버깅 함수 설정
if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서만 디버깅 함수 노출
  window.debugSSENewRoom = (testData) => {
    console.log('테스트용 SSE new-room 이벤트 시뮬레이션:', testData);
    SseService.handleNewRoom(testData);
  };
  
  // 새 메시지 시뮬레이션 함수
  window.debugNewMessage = (roomId, messageData) => {
    console.log('테스트용 새 메시지 시뮬레이션:', { roomId, messageData });
    import('@/stores/chat').then(({ useChatStore }) => {
      const chatStore = useChatStore();
      chatStore.updateChatRoomLastMessage(roomId, messageData);
    });
  };
  
  console.log('SSE 디버깅 함수가 설정되었습니다. 브라우저 콘솔에서 다음 함수들을 사용할 수 있습니다:');
  console.log('1. debugSSENewRoom({id: 34, roomName: "admin와의 채팅", lastMessage: "메세지를 보내 채팅을 시작해보세요!", lastMessageTime: "2025-08-25T15:46:06.931218", newMessageCount: 0})');
  console.log('2. debugNewMessage(roomId, {message: "테스트 메시지", senderEmail: "test@example.com", createdAt: new Date().toISOString()})');
}

app.mount('#app')