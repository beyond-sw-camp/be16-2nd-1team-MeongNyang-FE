<template>
  <!-- 모바일 헤더 -->
  <v-app-bar 
    v-if="$vuetify.display.mdAndDown"
    app 
    elevation="0"
    class="mobile-header"
  >
    <v-app-bar-nav-icon @click="drawer = !drawer" class="hamburger-icon"></v-app-bar-nav-icon>

    <v-spacer></v-spacer>

    <!-- 모바일 사용자 아바타 -->
    <div v-if="isLoggedIn" class="mobile-user-section">
      <v-avatar size="32" class="mobile-avatar" @click="goToRepresentativePet">
        <v-img v-if="representativePet?.url" :src="representativePet.url" :alt="representativePet.name"></v-img>
        <v-img v-else-if="user?.profileImage" :src="user.profileImage" alt="사용자 프로필"></v-img>
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
    </div>
  </v-app-bar>

  <!-- 모바일 네비게이션 드로어 -->
  <v-navigation-drawer 
    v-model="drawer"
    v-if="$vuetify.display.mdAndDown"
    temporary
    class="mobile-drawer"
    width="280"
  >
    <!-- 모바일 드로어 헤더 -->
    <div class="mobile-drawer-header">
      <div class="mobile-drawer-logo" @click="$router.push('/')">
        <img 
          class="brand-logo-mobile" 
          src="@/assets/logo.png" 
          alt="멍멍냥냥 로고" 
        />
        <span class="brand-title-mobile">멍멍냥냥</span>
      </div>
    </div>

    <!-- 모바일 메뉴 -->
    <v-list class="mobile-menu">
      <!-- 홈 -->
      <v-list-item 
        @click="goToHome"
        :class="{ 'active': isHomeActive }"
        class="mobile-menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="isHomeActive ? '#E87D7D' : '#6c757d'">
            mdi-home
          </v-icon>
        </template>
        <v-list-item-title>홈</v-list-item-title>
      </v-list-item>

      <!-- 마켓 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="goToMarket"
        :class="{ 'active': $route.path === '/market' }"
        class="mobile-menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/market' ? '#E87D7D' : '#6c757d'">
            mdi-store
          </v-icon>
        </template>
        <v-list-item-title>마켓</v-list-item-title>
      </v-list-item>

      <!-- 채팅 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="goToChat"
        :class="{ 'active': $route.path === '/chat' }"
        class="mobile-menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/chat' ? '#E87D7D' : '#6c757d'">
            mdi-chat
          </v-icon>
        </template>
        <v-list-item-title>채팅</v-list-item-title>
      </v-list-item>

      <!-- 대시보드 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="goToDashboard"
        :class="{ 'active': $route.path === '/dashboard' }"
        class="mobile-menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/dashboard' ? '#E87D7D' : '#6c757d'">
            mdi-view-dashboard
          </v-icon>
        </template>
        <v-list-item-title>대시보드</v-list-item-title>
      </v-list-item>

      <!-- 프로필 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="goToProfile"
        :class="{ 'active': $route.path === '/profile' }"
        class="mobile-menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/profile' ? '#E87D7D' : '#6c757d'">
            mdi-account
          </v-icon>
        </template>
        <v-list-item-title>프로필</v-list-item-title>
      </v-list-item>

      <!-- 관리자 (관리자인 경우) -->
      <v-list-item 
        v-if="isLoggedIn && isAdmin"
        @click="goToAdmin"
        :class="{ 'active': $route.path === '/admin' }"
        class="mobile-menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/admin' ? '#E87D7D' : '#6c757d'">
            mdi-shield-account
          </v-icon>
        </template>
        <v-list-item-title>관리자</v-list-item-title>
      </v-list-item>

      <!-- 구분선 -->
      <v-divider v-if="isLoggedIn" class="my-4"></v-divider>

      <!-- 로그인/회원가입 (비로그인 시) -->
      <template v-if="!isLoggedIn">
        <v-list-item 
          @click="goToLogin"
          class="mobile-menu-item auth-item"
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon size="20" color="#6c757d">mdi-login</v-icon>
          </template>
          <v-list-item-title>로그인</v-list-item-title>
        </v-list-item>

        <v-list-item 
          @click="goToRegister"
          class="mobile-menu-item auth-item"
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon size="20" color="#6c757d">mdi-account-plus</v-icon>
          </template>
          <v-list-item-title>회원가입</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>

    <!-- 모바일 사용자 정보 -->
    <template v-slot:append>
      <div v-if="isLoggedIn" class="mobile-user-info">
        <v-divider class="mb-3"></v-divider>
        <div class="mobile-user-details">
          <v-avatar size="40" class="mobile-user-avatar" @click="goToRepresentativePet">
            <v-img v-if="representativePet?.url" :src="representativePet.url" :alt="representativePet.name"></v-img>
            <v-img v-else-if="user?.profileImage" :src="user.profileImage" alt="사용자 프로필"></v-img>
            <v-icon v-else>mdi-account</v-icon>
          </v-avatar>
          <div class="mobile-user-text">
            <div class="mobile-user-name">{{ user?.nickname || '사용자' }}</div>
          </div>
          <v-btn icon class="mobile-logout-btn" @click="handleLogout">
            <v-icon color="#F87171">mdi-logout</v-icon>
          </v-btn>
        </div>
      </div>
    </template>
  </v-navigation-drawer>

  <!-- 데스크톱 사이드바 -->
  <v-navigation-drawer 
    v-if="$vuetify.display.lgAndUp"
    app 
    permanent
    class="modern-sidebar"
    width="260"
  >
    <!-- 로고 섹션 -->
    <div class="sidebar-header">
      <div class="logo-section" @click="$router.push('/')">
        <img 
          class="brand-logo" 
          src="@/assets/logo.png" 
          alt="멍멍냥냥 로고" 
        />
        <span class="brand-title">멍멍냥냥</span>
      </div>
    </div>

    <!-- 네비게이션 메뉴 -->
    <v-list class="sidebar-menu">
      <!-- 홈 -->
      <v-list-item 
        @click="navigateTo('/')"
        :class="{ 'active': $route.path === '/' && !showNotificationDrawer }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/' && !showNotificationDrawer ? '#E87D7D' : '#6c757d'">
            mdi-home
          </v-icon>
        </template>
        <v-list-item-title>홈</v-list-item-title>
      </v-list-item>

      <!-- 마켓 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="navigateTo('/market')"
        :class="{ 'active': $route.path === '/market' && !showNotificationDrawer }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/market' && !showNotificationDrawer ? '#E87D7D' : '#6c757d'">
            mdi-store
          </v-icon>
        </template>
        <v-list-item-title>마켓</v-list-item-title>
      </v-list-item>

      <!-- 채팅 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="navigateTo('/chat')"
        :class="{ 'active': $route.path === '/chat' && !showNotificationDrawer }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/chat' && !showNotificationDrawer ? '#E87D7D' : '#6c757d'">
            mdi-chat
          </v-icon>
        </template>
        <v-list-item-title>채팅</v-list-item-title>
      </v-list-item>

      <!-- 대시보드 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="navigateTo('/dashboard')"
        :class="{ 'active': $route.path === '/dashboard' && !showNotificationDrawer }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/dashboard' && !showNotificationDrawer ? '#E87D7D' : '#6c757d'">
            mdi-view-dashboard
          </v-icon>
        </template>
        <v-list-item-title>대시보드</v-list-item-title>
      </v-list-item>

      <!-- 프로필 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="navigateTo('/profile')"
        :class="{ 'active': $route.path === '/profile' && !showNotificationDrawer }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/profile' && !showNotificationDrawer ? '#E87D7D' : '#6c757d'">
            mdi-account
          </v-icon>
        </template>
        <v-list-item-title>프로필</v-list-item-title>
      </v-list-item>

      <!-- 알림 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="openNotificationDrawer"
        :class="{ 'active': showNotificationDrawer }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <div class="notification-icon-wrapper">
            <v-icon size="20" :color="showNotificationDrawer ? '#E87D7D' : '#6c757d'">
              mdi-bell
            </v-icon>
            <span v-if="alarmStore.unreadCount > 0" class="notification-badge">
              {{ alarmStore.unreadCount > 99 ? '99+' : alarmStore.unreadCount }}
            </span>
          </div>
        </template>
        <v-list-item-title>알림</v-list-item-title>
      </v-list-item>

      <!-- 관리자 (관리자인 경우) -->
      <v-list-item 
        v-if="isLoggedIn && isAdmin"
        @click="navigateTo('/admin')"
        :class="{ 'active': $route.path === '/admin' && !showNotificationDrawer }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/admin' && !showNotificationDrawer ? '#E87D7D' : '#6c757d'">
            mdi-shield-account
          </v-icon>
        </template>
        <v-list-item-title>관리자</v-list-item-title>
      </v-list-item>

      <!-- 구분선 -->
      <v-divider v-if="isLoggedIn" class="my-4"></v-divider>

      <!-- 로그인/회원가입 (비로그인 시) -->
      <template v-if="!isLoggedIn">
        <v-list-item 
          @click="openAuthModal('login')"
          class="menu-item auth-item"
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon size="20" color="#6c757d">mdi-login</v-icon>
          </template>
          <v-list-item-title>로그인</v-list-item-title>
        </v-list-item>

        <v-list-item 
          @click="openAuthModal('register')"
          class="menu-item auth-item"
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon size="20" color="#6c757d">mdi-account-plus</v-icon>
          </template>
          <v-list-item-title>회원가입</v-list-item-title>
        </v-list-item>
      </template>


    </v-list>

<!-- 사용자 정보 (하단) -->
<template v-slot:append>
  <div v-if="isLoggedIn" class="user-section">
    <v-divider class="mb-3"></v-divider>
    <div class="user-info">
      <v-avatar size="40" class="user-avatar" @click="goToRepresentativePet">
        <v-img v-if="representativePet?.url" :src="representativePet.url" :alt="representativePet.name"></v-img>
        <v-img v-else-if="user?.profileImage" :src="user.profileImage" alt="사용자 프로필"></v-img>
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
      <div class="user-details">
        <div class="user-name">{{ user?.nickname || '사용자' }}</div>
      </div>
      <v-btn icon class="logout-btn" @click="handleLogout">
        <v-icon color="#F87171">mdi-logout</v-icon>
      </v-btn>
    </div>
  </div>
</template>
  </v-navigation-drawer>

  <!-- 알림 드로워 -->
  <NotificationDrawer v-model="showNotificationDrawer" />
</template>

<script>

import { computed, ref, onMounted, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlarmStore } from '@/stores/alarm'
import NotificationDrawer from './NotificationDrawer.vue'
import { usePetStore } from '@/stores/pet'

export default {
  name: 'HeaderComponent',
  components: {
    NotificationDrawer
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const petStore = usePetStore()
    
    // App.vue에서 제공하는 함수 inject
    const openAuthModal = inject('openAuthModal')

    const alarmStore = useAlarmStore()

    
    const isLoggedIn = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    const representativePet = computed(() => petStore.getRepresentativePet)
    
    // 모바일 드로어 상태
    const drawer = ref(false)
    
    // 로그인 상태 변화를 감지하기 위해 watch 추가
    watch(() => authStore.isAuthenticated, (newValue) => {
      console.log('Header - 로그인 상태 변화 감지:', newValue)
    }, { immediate: true })
    
    // 홈 활성화 상태 확인
    const isHomeActive = computed(() => {
      return route.path === '/'
    })
    
    // 홈으로 이동
    const goToHome = () => {
      router.push('/')
      drawer.value = false
    }
    
    const goToMarket = () => {
      router.push('/market')
      drawer.value = false
    }
    
    const goToChat = () => {
      router.push('/chat')
      drawer.value = false
    }
    
    const goToDashboard = () => {
      router.push('/dashboard')
      drawer.value = false
    }
    
    const goToProfile = () => {
      router.push('/profile')
      drawer.value = false
    }
    
    const goToAdmin = () => {
      router.push('/admin')
      drawer.value = false
    }
    
    const goToLogin = () => {
      router.push('/auth/login')
      drawer.value = false
    }
    
    const goToRegister = () => {
      router.push('/auth/register')
      drawer.value = false
    }
    
    // 알림 드로워 상태
    const showNotificationDrawer = ref(false)
    
    // 대표 반려동물 이미지 가져오기
    const representativePetImage = computed(() => {
      const mainPetId = authStore.myPageInfo?.mainPetId
      if (!mainPetId) return null
      
      const representativePet = petStore.pets.find(pet => pet.id === mainPetId)
      // 대표 펫에 이미지가 있을 때만 반환, 없으면 기본 아이콘 표시
      return representativePet?.url || null
    })
    
    const handleLogout = () => {
      authStore.logout()
      router.push('/')
      drawer.value = false
    }
    
    const openNotificationDrawer = () => {
      showNotificationDrawer.value = !showNotificationDrawer.value
    }
    
    const navigateTo = (path) => {
      // 알림 드로워가 열려있으면 닫기
      if (showNotificationDrawer.value) {
        showNotificationDrawer.value = false
      }
      // 라우터 이동
      router.push(path)
    }
    
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
      isLoggedIn,
      user,
      isAdmin,
      handleLogout,
      representativePetImage,
      openAuthModal,
      alarmStore,
      showNotificationDrawer,
      openNotificationDrawer,
      navigateTo,
      isHomeActive,
      representativePet,
      drawer,
      goToHome,
      goToMarket,
      goToChat,
      goToDashboard,
      goToProfile,
      goToAdmin,
      goToLogin,
      goToRegister,

    }
  }
}
</script>

<style scoped>
.modern-sidebar {
  background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-section:hover {
  transform: scale(1.05);
}

.brand-logo {
  height: 38px;
  width: auto;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}



.brand-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.sidebar-menu {
  padding: 16px 10px;
}

.menu-item {
  margin: 4px 8px;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.menu-item:hover {
  background: rgba(232, 125, 125, 0.08);
  transform: translateX(4px);
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.15), rgba(255, 107, 107, 0.1));
  border-left: 3px solid #E87D7D;
}

.menu-item.active .v-list-item-title {
  color: #E87D7D;
  font-weight: 600;
}

.auth-item:hover {
  background: rgba(99, 102, 241, 0.08);
}

/* 모바일 헤더 */
.mobile-header {
  background: #FFFFFF !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.hamburger-icon {
  color: #6c757d !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.hamburger-icon :deep(.v-icon) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-left: 8px;
}

.brand-logo-mobile {
  height: 28px;
  width: auto;
}

.brand-title-mobile {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
}

.mobile-user-section {
  margin-right: 8px;
}

.mobile-avatar {
  cursor: pointer;
  border: 2px solid #FF8B8B;
}

/* 모바일 드로어 */
.mobile-drawer {
  background: #FFFFFF !important;
}

.mobile-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.mobile-drawer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.close-btn {
  color: #6c757d !important;
}

.mobile-menu {
  padding: 16px 10px;
}

.mobile-menu-item {
  margin: 4px 8px;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mobile-menu-item:hover {
  background: rgba(232, 125, 125, 0.08);
  transform: translateX(4px);
}

.mobile-menu-item.active {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.15), rgba(255, 107, 107, 0.1));
  border-left: 3px solid #E87D7D;
}

.mobile-menu-item.active .v-list-item-title {
  color: #E87D7D;
  font-weight: 600;
}

.mobile-user-info {
  padding: 16px 20px;
}

.mobile-user-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-user-avatar {
  cursor: pointer;
  border: 2px solid #FF8B8B;
}

.mobile-user-text {
  flex: 1;
}

.mobile-user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1E293B;
}

.mobile-logout-btn {
  color: #F87171 !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .modern-sidebar {
    display: none;
  }
}

@media (min-width: 961px) {
  .mobile-header,
  .mobile-drawer {
    display: none;
  }
}

.logout-item:hover {
  background: rgba(220, 53, 69, 0.08);
}

.logout-item:hover .v-icon {
  color: #dc3545 !important;
}

.user-section {
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-avatar {
  border: 2px solid #E87D7D;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.2);
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

.user-details {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.logout-btn {
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: transparent !important;
  box-shadow: none !important;
  transform: scale(1.1);
}

.logout-btn :deep(.v-icon) {
  color: #F87171 !important;
}

.logout-btn:hover :deep(.v-icon) {
  color: #EF4444 !important;
}

/* Vuetify 스타일 오버라이드 */
:deep(.v-list-item) {
  border-radius: 10px;
  margin: 3px 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:deep(.v-list-item__prepend) {
  margin-right: 12px;
}

:deep(.v-list-item__content) {
  padding: 8px 0;
}

:deep(.v-list-item-title) {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 반응형 */
@media (max-width: 960px) {
  .modern-sidebar {
    width: 260px !important;
  }
  
  .sidebar-header {
    padding: 20px 16px;
  }
  
  .brand-logo {
    height: 38px;
  }
  
  .brand-title {
    font-size: 1.1rem;
  }
  
  .sidebar-menu {
    padding: 16px 10px;
  }
  
  .menu-item {
    margin: 4px 8px;
  }
  
  .user-section {
    padding: 12px;
  }
  
  .user-name {
    font-size: 0.9rem;
    margin-bottom: 3px;
  }
  
  .user-email {
    font-size: 0.8rem;
  }
  
  :deep(.v-list-item) {
    margin: 3px 0;
  }
  
  :deep(.v-list-item__prepend) {
    margin-right: 12px;
  }
  
  :deep(.v-list-item__content) {
    padding: 8px 0;
  }
  
  :deep(.v-list-item-title) {
    font-size: 0.9rem;
  }
}

/* 맥 환경 최적화 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .modern-sidebar {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .brand-logo {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  .user-avatar {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .modern-sidebar {
    background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
    border-right-color: rgba(255, 255, 255, 0.1);
  }
  
  .brand-title {
    color: #f8f9fa;
  }
  
  .user-section {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .user-name {
    color: #f8f9fa;
  }
  
  .user-email {
    color: #adb5bd;
  }
}

.notification-icon-wrapper {
  position: relative;
  display: inline-block;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #E87D7D;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
  border: 2px solid white;
}
</style>