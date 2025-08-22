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
  
  // 사용자에게 에러 알림
  handleError(error, router)
}

// 처리되지 않은 Promise 에러 핸들러
window.addEventListener('unhandledrejection', (event) => {
  console.error('처리되지 않은 Promise 에러:', event.reason)
  handleError(event.reason, router)
  event.preventDefault()
})

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// 인증 스토어 초기화
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')