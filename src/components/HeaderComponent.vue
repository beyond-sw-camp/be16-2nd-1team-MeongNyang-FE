<template>
  <v-app-bar 
    app 
    :elevation="0"
    class="modern-header"
    :class="{ 'scrolled': isScrolled }"
  >
    <!-- 배경 그라데이션 -->
    <div class="header-background"></div>
    
    <v-app-bar-nav-icon 
      @click="toggleDrawer" 
      class="d-md-none modern-nav-icon"
    ></v-app-bar-nav-icon>
    
    <!-- 로고/브랜드 -->
    <div class="brand-section" @click="$router.push('/')">
      <div class="brand-icon">
        <span class="emoji">🐕</span>
        <span class="emoji">🐱</span>
      </div>
      <v-app-bar-title class="brand-title cursor-pointer">
        멍냥이 커뮤니티
      </v-app-bar-title>
    </div>
    
    <!-- 데스크톱 네비게이션 -->
    <nav class="desktop-navigation d-none d-md-flex">
      <v-btn 
        variant="text" 
        class="nav-btn"
        :class="{ 'active': $route.path === '/' }"
        @click="$router.push('/')"
      >
        <v-icon class="me-2">mdi-home</v-icon>
        홈
      </v-btn>
      <v-btn 
        v-if="isLoggedIn" 
        variant="text" 
        class="nav-btn"
        :class="{ 'active': $route.path === '/pets' }"
        @click="$router.push('/pets')"
      >
        <v-icon class="me-2">mdi-paw</v-icon>
        반려동물
      </v-btn>
      <v-btn 
        v-if="isLoggedIn" 
        variant="text" 
        class="nav-btn"
        :class="{ 'active': $route.path === '/diary' }"
        @click="$router.push('/diary')"
      >
        <v-icon class="me-2">mdi-book-open</v-icon>
        다이어리
      </v-btn>
      <v-btn 
        v-if="isLoggedIn" 
        variant="text" 
        class="nav-btn"
        :class="{ 'active': $route.path === '/market' }"
        @click="$router.push('/market')"
      >
        <v-icon class="me-2">mdi-store</v-icon>
        마켓
      </v-btn>
      <v-btn 
        v-if="isLoggedIn" 
        variant="text" 
        class="nav-btn"
        :class="{ 'active': $route.path === '/chat' }"
        @click="$router.push('/chat')"
      >
        <v-icon class="me-2">mdi-chat</v-icon>
        채팅
      </v-btn>
    </nav>
    
    <v-spacer></v-spacer>
    
    <!-- 사용자 메뉴 -->
    <div v-if="isLoggedIn" class="d-none d-md-flex user-section">
      <v-menu offset-y class="modern-menu">
        <template v-slot:activator="{ props }">
          <v-btn 
            variant="text" 
            class="user-btn"
            v-bind="props"
          >
            <v-avatar size="36" class="me-2 user-avatar">
              <v-img v-if="user?.profileImage" :src="user.profileImage"></v-img>
              <v-icon v-else size="20">mdi-account</v-icon>
            </v-avatar>
            <span class="user-name">{{ user?.nickname || '사용자' }}</span>
            <v-icon class="ms-2">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list class="modern-dropdown">
          <v-list-item @click="$router.push('/dashboard')" class="dropdown-item">
            <v-list-item-icon>
              <v-icon>mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title>대시보드</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/profile')" class="dropdown-item">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>프로필</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="$router.push('/admin')" class="dropdown-item">
            <v-list-item-icon>
              <v-icon>mdi-shield-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>관리자</v-list-item-title>
          </v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item @click="handleLogout" class="dropdown-item logout-item">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>로그아웃</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    
    <!-- 로그인/회원가입 버튼 -->
    <div v-else class="d-none d-md-flex auth-buttons">
      <v-btn 
        variant="text" 
        class="login-btn"
        @click="$router.push('/auth/login')"
      >
        로그인
      </v-btn>
      <v-btn 
        variant="elevated" 
        class="register-btn"
        @click="$router.push('/auth/register')"
      >
        회원가입
      </v-btn>
    </div>
    
    <!-- 모바일 메뉴 버튼 -->
    <v-btn 
      v-if="!isLoggedIn" 
      icon 
      class="d-md-none mobile-auth-btn"
      @click="$router.push('/auth/login')"
    >
      <v-icon>mdi-login</v-icon>
    </v-btn>
  </v-app-bar>
  
  <!-- 모바일 네비게이션 드로어 -->
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list>
      <v-list-item @click="$router.push('/')">
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
        <v-list-item-title>홈</v-list-item-title>
      </v-list-item>
      
      <template v-if="isLoggedIn">
        <v-list-item @click="$router.push('/dashboard')">
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-title>대시보드</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/pets')">
          <v-list-item-icon>
            <v-icon>mdi-paw</v-icon>
          </v-list-item-icon>
          <v-list-item-title>반려동물</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/diary')">
          <v-list-item-icon>
            <v-icon>mdi-book-open</v-icon>
          </v-list-item-icon>
          <v-list-item-title>다이어리</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/market')">
          <v-list-item-icon>
            <v-icon>mdi-store</v-icon>
          </v-list-item-icon>
          <v-list-item-title>마켓</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/chat')">
          <v-list-item-icon>
            <v-icon>mdi-chat</v-icon>
          </v-list-item-icon>
          <v-list-item-title>채팅</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/profile')">
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-title>프로필</v-list-item-title>
        </v-list-item>
        
        <v-list-item v-if="isAdmin" @click="$router.push('/admin')">
          <v-list-item-icon>
            <v-icon>mdi-shield-account</v-icon>
          </v-list-item-icon>
          <v-list-item-title>관리자</v-list-item-title>
        </v-list-item>
        
        <v-divider></v-divider>
        
        <v-list-item @click="handleLogout">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-title>로그아웃</v-list-item-title>
        </v-list-item>
      </template>
      
      <template v-else>
        <v-list-item @click="$router.push('/auth/login')">
          <v-list-item-icon>
            <v-icon>mdi-login</v-icon>
          </v-list-item-icon>
          <v-list-item-title>로그인</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="$router.push('/auth/register')">
          <v-list-item-icon>
            <v-icon>mdi-account-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-title>회원가입</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HeaderComponent',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const drawer = ref(false)
    const isScrolled = ref(false)
    
    const isLoggedIn = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    
    const toggleDrawer = () => {
      drawer.value = !drawer.value
    }
    
    const handleLogout = () => {
      authStore.logout()
      router.push('/')
      drawer.value = false
    }
    
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50
    }
    
    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
    
    return {
      drawer,
      isScrolled,
      isLoggedIn,
      user,
      isAdmin,
      toggleDrawer,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* 현대적인 헤더 스타일 */
.modern-header {
  background: transparent !important;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modern-header.scrolled {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(129, 140, 248, 0.9) 100%);
  z-index: -1;
  transition: opacity 0.3s ease;
}

.modern-header.scrolled .header-background {
  opacity: 0;
}

/* 브랜드 섹션 */
.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.brand-section:hover {
  transform: scale(1.05);
}

.brand-icon {
  display: flex;
  gap: 4px;
}

.emoji {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modern-header.scrolled .brand-title {
  color: #1E293B;
}

/* 네비게이션 */
.desktop-navigation {
  display: flex;
  gap: 8px;
  margin-left: 32px;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-btn.active {
  color: white !important;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.modern-header.scrolled .nav-btn {
  color: #475569 !important;
}

.modern-header.scrolled .nav-btn:hover {
  color: #6366F1 !important;
  background: rgba(99, 102, 241, 0.1);
}

.modern-header.scrolled .nav-btn.active {
  color: #6366F1 !important;
  background: rgba(99, 102, 241, 0.1);
}

/* 사용자 섹션 */
.user-section {
  display: flex;
  align-items: center;
}

.user-btn {
  color: rgba(255, 255, 255, 0.9) !important;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.user-btn:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.modern-header.scrolled .user-btn {
  color: #475569 !important;
}

.modern-header.scrolled .user-btn:hover {
  color: #6366F1 !important;
  background: rgba(99, 102, 241, 0.1);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: border-color 0.3s ease;
}

.user-btn:hover .user-avatar {
  border-color: rgba(255, 255, 255, 0.6);
}

.user-name {
  font-weight: 600;
  margin: 0 8px;
}

/* 드롭다운 메뉴 */
.modern-dropdown {
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

.dropdown-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateX(4px);
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

/* 인증 버튼 */
.auth-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.login-btn {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  border-radius: 12px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.register-btn {
  background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%) !important;
  color: white !important;
  font-weight: 600;
  border-radius: 12px;
  padding: 8px 20px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

/* 모바일 요소 */
.modern-nav-icon {
  color: rgba(255, 255, 255, 0.9) !important;
}

.modern-header.scrolled .modern-nav-icon {
  color: #475569 !important;
}

.mobile-auth-btn {
  color: rgba(255, 255, 255, 0.9) !important;
}

.modern-header.scrolled .mobile-auth-btn {
  color: #475569 !important;
}

/* 유틸리티 */
.cursor-pointer {
  cursor: pointer;
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .desktop-navigation {
    margin-left: 16px;
  }
  
  .nav-btn {
    padding: 6px 12px;
    font-size: 0.875rem;
  }
  
  .brand-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 600px) {
  .brand-title {
    display: none;
  }
  
  .emoji {
    font-size: 20px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .modern-header.scrolled {
    background: rgba(15, 23, 42, 0.95) !important;
  }
  
  .modern-header.scrolled .brand-title {
    color: #F8FAFC;
  }
  
  .modern-header.scrolled .nav-btn {
    color: #CBD5E1 !important;
  }
  
  .modern-header.scrolled .nav-btn:hover {
    color: #818CF8 !important;
  }
  
  .modern-dropdown {
    background: rgba(15, 23, 42, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .modern-header,
  .nav-btn,
  .user-btn,
  .login-btn,
  .register-btn,
  .brand-section {
    transition: none;
  }
  
  .nav-btn:hover,
  .user-btn:hover,
  .login-btn:hover,
  .register-btn:hover {
    transform: none;
  }
}
</style>