import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from '@/stores/auth'
import { checkPetExist } from '@/utils/petValidation'

// 뷰 컴포넌트들
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ThemeDemoView from '@/views/ThemeDemoView.vue'
import SearchView from '@/views/SearchView.vue'
import PaymentSuccessView from '@/views/PaymentSuccessView.vue'
import PaymentFailView from '@/views/PaymentFailView.vue'

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
    path: '/search',
    name: 'Search',
    component: SearchView,
    meta: { requiresAuth: true }
  },
  {
    path: '/theme-demo',
    name: 'ThemeDemo',
    component: ThemeDemoView,
    meta: { requiresAuth: false }
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: PaymentSuccessView,
    meta: { requiresAuth: false }
  },
  {
    path: '/payment/fail',
    name: 'PaymentFail',
    component: PaymentFailView,
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
        // 사용자 정보 가져오기 실패 시 모달창 로그인 띄우기
        console.log('사용자 정보 가져오기 실패 - 모달창 로그인 표시')
        // 현재 페이지로 리다이렉트하여 모달창이 표시되도록 함
        next({ path: '/', query: { showLogin: 'true' } })
        return
      }
    }
    
    // 인증되지 않은 경우 모달창 로그인 띄우기
    if (!authStore.isAuthenticated) {
      console.log('인증되지 않은 사용자 - 모달창 로그인 표시')
      // 현재 페이지로 리다이렉트하여 모달창이 표시되도록 함
      next({ path: '/', query: { showLogin: 'true' } })
      return
    }
    
    // 관리자 권한이 필요한 페이지인지 확인
    if (to.meta.requiresAdmin && authStore.user?.role !== 'ADMIN') {
      next('/404')
      return
    }
    
    // 다이어리 관련 페이지에서 펫 존재 확인
    const isDiaryCreate = to.path.startsWith('/diarys/create')
    const isDiaryEdit = to.path.startsWith('/diary/') && to.path.includes('/edit')
    
    console.log('라우터 가드 조건 확인:')
    console.log('- isDiaryCreate:', isDiaryCreate)
    console.log('- isDiaryEdit:', isDiaryEdit)
    console.log('- 전체 조건:', isDiaryCreate || isDiaryEdit)
    
    if (isDiaryCreate || isDiaryEdit) {
      console.log('=== 라우터 가드: 다이어리 관련 페이지 접근 ===')
      console.log('접근 경로:', to.path)
      console.log('펫 존재 확인 시작...')
      
      try {
        const hasPet = await checkPetExist()
        console.log('펫 존재 확인 결과:', hasPet)
        
        if (!hasPet) {
          console.log('펫이 없음 - 대시보드로 리다이렉트')
          next('/dashboard')
          return
        }
        
        console.log('펫이 있음 - 정상 진행')
      } catch (error) {
        console.error('펫 존재 확인 중 오류:', error)
        console.log('에러 발생 - 대시보드로 리다이렉트')
        next('/dashboard')
        return
      }
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









