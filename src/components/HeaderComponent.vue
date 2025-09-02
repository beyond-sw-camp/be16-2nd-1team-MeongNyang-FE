<template>
  <!-- 모바일 헤더 -->
  <MobileHeader
    v-if="$vuetify.display.mdAndDown"
    :is-logged-in="isLoggedIn"
    :user="user"
    :representative-pet="representativePet"
    @toggle-drawer="drawer = !drawer"
    @avatar-click="goToRepresentativePet"
  />

  <!-- 모바일 네비게이션 드로어 -->
  <MobileDrawer
    v-if="$vuetify.display.mdAndDown"
    v-model="drawer"
    :menu-items="menuItems"
    :is-logged-in="isLoggedIn"
    :user="user"
    :representative-pet="representativePet"
    :show-notification-drawer="showNotificationDrawer"
    :alarm-store="alarmStore"
    @navigate="handleMobileNavigation"
    @auth-action="handleAuthAction"
    @avatar-click="goToRepresentativePet"
    @logout="handleLogout"
  />

  <!-- 데스크톱 사이드바 -->
  <DesktopSidebar
    v-if="$vuetify.display.lgAndUp"
    :menu-items="menuItems"
    :is-logged-in="isLoggedIn"
    :user="user"
    :representative-pet="representativePet"
    :show-notification-drawer="showNotificationDrawer"
    :alarm-store="alarmStore"
    @navigate="handleDesktopNavigation"
    @auth-action="handleAuthAction"
    @avatar-click="goToRepresentativePet"
    @logout="handleLogout"
  />

  <!-- 알림 드로워 -->
  <NotificationDrawer v-model="showNotificationDrawer" />
</template>

<script>
import { computed, ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlarmStore } from '@/stores/alarm'
import { usePetStore } from '@/stores/pet'
import NotificationDrawer from './NotificationDrawer.vue'
import MobileHeader from './header/MobileHeader.vue'
import MobileDrawer from './header/MobileDrawer.vue'
import DesktopSidebar from './header/DesktopSidebar.vue'

export default {
  name: 'HeaderComponent',
  components: {
    NotificationDrawer,
    MobileHeader,
    MobileDrawer,
    DesktopSidebar
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const petStore = usePetStore()
    const alarmStore = useAlarmStore()
    
    // App.vue에서 제공하는 함수 inject
    const openAuthModal = inject('openAuthModal')
    const showLoginModalFromHeader = inject('showLoginModalFromHeader')

    // 반응형 상태
    const isLoggedIn = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    const representativePet = computed(() => petStore.getRepresentativePet)
    
    // UI 상태
    const drawer = ref(false)
    const showNotificationDrawer = ref(false)
    
    // 메뉴 아이템 정의
    const menuItems = computed(() => [
      {
        path: '/',
        title: '홈',
        icon: 'mdi-home',
        showCondition: true
      },
      {
        path: '/market',
        title: '마켓',
        icon: 'mdi-store',
        showCondition: isLoggedIn.value
      },
      {
        path: '/chat',
        title: '채팅',
        icon: 'mdi-chat',
        showCondition: isLoggedIn.value
      },
      {
        path: '/dashboard',
        title: '대시보드',
        icon: 'mdi-view-dashboard',
        showCondition: isLoggedIn.value
      },
      {
        path: '/profile',
        title: '프로필',
        icon: 'mdi-account',
        showCondition: isLoggedIn.value
      },
      {
        path: '/notifications',
        title: '알림',
        icon: 'mdi-bell',
        showCondition: isLoggedIn.value
      },
      {
        path: '/admin',
        title: '관리자',
        icon: 'mdi-shield-account',
        showCondition: isLoggedIn.value && isAdmin.value
      }
    ])

    // 네비게이션 핸들러
    const handleDesktopNavigation = (path) => {
      if (path === '/notifications') {
        showNotificationDrawer.value = !showNotificationDrawer.value
        return
      }
      
      if (showNotificationDrawer.value) {
        showNotificationDrawer.value = false
      }
      router.push(path)
    }

    const handleMobileNavigation = (path) => {
      if (path === '/notifications') {
        showNotificationDrawer.value = !showNotificationDrawer.value
        drawer.value = false
        return
      }
      
      router.push(path)
      drawer.value = false
    }

    // 인증 액션 핸들러
    const handleAuthAction = (action) => {
      if (action === 'login') {
        if (showLoginModalFromHeader) {
          showLoginModalFromHeader()
        }
      } else if (action === 'register') {
        if (openAuthModal) {
          openAuthModal('register')
        }
      }
      drawer.value = false
    }

    // 대표 반려동물 페이지로 이동
    const goToRepresentativePet = () => {
      const mainPetId = authStore.myPageInfo?.mainPetId
      if (mainPetId) {
        router.push(`/pet/${mainPetId}`)
      }
    }

    // 로그아웃 처리
    const handleLogout = () => {
      authStore.logout()
      router.push('/')
      drawer.value = false
    }

    // 로그인 상태 변화 감지
    watch(() => authStore.isAuthenticated, (newValue) => {
      console.log('Header - 로그인 상태 변화 감지:', newValue)
    }, { immediate: true })
    
    // 컴포넌트 마운트시 펫 데이터 가져오기
    onMounted(async () => {
      if (authStore.isAuthenticated) {
        try {
          await petStore.fetchPets()
        } catch (error) {
          console.error('HeaderComponent: 펫 데이터 로드 실패:', error)
        }
      }
    })
    
    return {
      // 상태
      isLoggedIn,
      user,
      isAdmin,
      representativePet,
      drawer,
      showNotificationDrawer,
      alarmStore,
      
      // 메뉴
      menuItems,
      
      // 메서드
      handleDesktopNavigation,
      handleMobileNavigation,
      handleAuthAction,
      goToRepresentativePet,
      handleLogout,
      openAuthModal
    }
  }
}
</script>

<style scoped>
</style>