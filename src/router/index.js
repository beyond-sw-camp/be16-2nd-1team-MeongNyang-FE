import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from '@/stores/auth'

// 뷰 컴포넌트들
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ThemeDemoView from '@/views/ThemeDemoView.vue'

// 라우터 모듈들
import authRoutes from './modules/auth'
import petRoutes from './modules/pet'
import diaryRoutes from './modules/diary'
import marketRoutes from './modules/market'
import chatRoutes from './modules/chat'
import userRoutes from './modules/user'
import adminRoutes from './modules/admin'
import errorRoutes from './modules/error'

// 기본 라우트
const baseRoutes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/theme-demo',
    name: 'ThemeDemo',
    component: ThemeDemoView,
    meta: { requiresAuth: false }
  }
]

// 모든 라우트 통합
const routes = [
  ...baseRoutes,
  ...authRoutes,
  ...petRoutes,
  ...diaryRoutes,
  ...marketRoutes,
  ...chatRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...errorRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
   if (to.path.startsWith('/oauth/')) return next()

  const authStore = useAuthStore()

  
  // 인증이 필요한 페이지인지 확인
  if (to.meta.requiresAuth) {
    // 토큰이 있지만 사용자 정보가 없는 경우 사용자 정보 가져오기
    if (authStore.accessToken && !authStore.user) {
      try {
        await authStore.getCurrentUser()
      } catch (error) {
        // 사용자 정보 가져오기 실패 시 로그인 페이지로 리다이렉트
        next('/auth/login')
        return
      }
    }
    
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!authStore.isAuthenticated) {
      next('/auth/login')
      return
    }
    
    // 관리자 권한이 필요한 페이지인지 확인
    if (to.meta.requiresAdmin && authStore.user?.role !== 'ADMIN') {
      next('/404')
      return
    }
  }
  
  // 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근하는 경우 대시보드로 리다이렉트
  if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router









