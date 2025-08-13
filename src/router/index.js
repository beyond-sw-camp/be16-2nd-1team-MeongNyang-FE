import { createRouter, createWebHistory } from "vue-router"
// import { practiceRouter } from "./practiceRouter";

const routes = [
    // ...practiceRouter,
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/signup',
        name: 'Signup',
        component: () => import('../views/Signup.vue')
    },
    {
        path: '/feed',
        name: 'Feed',
        component: () => import('../views/Feed.vue')
    },
    {
        path: '/trade',
        name: 'Trade',
        component: () => import('../views/Trade.vue')
    },
    {
        path: '/chat',
        name: 'Chat',
        component: () => import('../views/Chat.vue')
    },
    {
        path: '/mypage',
        name: 'MyPage',
        component: () => import('../views/MyPage.vue')
    },
    {
        path: '/pet-register',
        name: 'PetRegister',
        component: () => import('../views/PetRegister.vue')
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('../views/Search.vue')
    }
];

const router = createRouter(
    {
        history: createWebHistory(),
        routes
    }
)

// 라우터 가드 - 이전 페이지 추적
router.beforeEach((to, from, next) => {
  // 로그인/회원가입 페이지가 아닌 경우에만 이전 페이지 저장
  if (from.path && !['/login', '/signup'].includes(from.path)) {
    sessionStorage.setItem('previousPage', from.path)
  }
  next()
})

export default router;









