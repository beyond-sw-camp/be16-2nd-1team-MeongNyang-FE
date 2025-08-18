<template>
  <v-app-bar 
    app 
    :elevation="0"
    class="modern-header"
  >
    <!-- 배경 그라데이션 -->
    <div class="header-background"></div>
    
    <v-app-bar-nav-icon 
      @click="toggleDrawer" 
      class="d-md-none modern-nav-icon"
    ></v-app-bar-nav-icon>
    
    <!-- 로고/브랜드 -->
    <div class="brand-section" @click="$router.push('/')">
      <img class="brand-logo" src="@/assets/logo.png" alt="멍멍냥냥 로고" />
    </div>
    <v-spacer class="d-none d-md-flex"></v-spacer>
    
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
            <v-avatar size="32" class="user-avatar">
              <v-img v-if="user?.profileImage" :src="user.profileImage"></v-img>
              <v-icon v-else size="18">mdi-account</v-icon>
            </v-avatar>
            <span class="user-name">{{ user?.nickname || '사용자' }}</span>
            <v-icon size="16" class="chevron-icon">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list class="modern-dropdown">
          <v-list-item @click="$router.push('/dashboard')" class="dropdown-item" density="comfortable">
            <v-list-item-icon>
              <v-icon size="20">mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title>대시보드</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/profile')" class="dropdown-item" density="comfortable">
            <v-list-item-icon>
              <v-icon size="20">mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>프로필</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="$router.push('/admin')" class="dropdown-item" density="comfortable">
            <v-list-item-icon>
              <v-icon size="20">mdi-shield-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>관리자</v-list-item-title>
          </v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item @click="handleLogout" class="dropdown-item logout-item" density="comfortable">
            <v-list-item-icon>
              <v-icon size="20">mdi-logout</v-icon>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HeaderComponent',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const drawer = ref(false)
    
    
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
    
    
    
    return {
      drawer,
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
  background: #FFFFFF !important; /* 네비게이션 바 흰색 유지 */
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 48px;
}

/* 스크롤 시 색상 변화 없음 - scrolled 상태 스타일 미사용 */

.header-background {
  display: none;
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

.brand-logo {
  height: 56px;
  width: auto;
  display: block;
}

/* 네비게이션 */
.desktop-navigation {
  display: flex;
  gap: 24px;
  margin-left: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.nav-btn {
  color: #111111 !important;
  font-weight: 500;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: none !important;
  box-shadow: none !important;
  text-transform: none !important;
}

/* 아이콘 색이 텍스트와 함께 자연스럽게 변하도록 */
.nav-btn .v-icon {
  color: #111111 !important;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.06), transparent);
  transition: left 0.5s;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn:hover {
  color: #111111 !important;
  background: rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.nav-btn.active {
  color: #FF8B8B !important;
  background: transparent;
  box-shadow: none;
}

.nav-btn.active:hover {
  color: #FF8B8B !important;
  background: transparent;
}

.nav-btn.active .v-icon {
  color: #FF8B8B !important;
}

.modern-header.scrolled .nav-btn {
  color: #111111 !important;
}

.modern-header.scrolled .nav-btn.active,
.modern-header.scrolled .nav-btn.active:hover {
  color: #FF8B8B !important;
  background: transparent;
}

/* 사용자 섹션 */
.user-section {
  display: flex;
  align-items: center;
}

.user-btn {
  color: #111111 !important;
  border-radius: 12px;
  padding: 6px 12px;
  transition: all 0.3s ease;
  border: none !important;
  box-shadow: none !important;
  text-transform: none !important;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: auto;
}

.user-btn:hover {
  color: #111111 !important;
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.modern-header.scrolled .user-btn {
  color: #111111 !important;
}

.modern-header.scrolled .user-avatar {
  border-color: rgba(71, 85, 105, 0.3);
}

.modern-header.scrolled .user-btn:hover .user-avatar {
  border-color: rgba(99, 102, 241, 0.6);
}

.modern-header.scrolled .chevron-icon {
  color: #475569 !important;
  opacity: 0.7;
}

.modern-header.scrolled .user-btn:hover .chevron-icon {
  color: #6366F1 !important;
  opacity: 1;
}

.user-avatar {
  border: 2px solid rgba(0, 0, 0, 0.08);
  transition: border-color 0.3s ease;
  flex-shrink: 0;
}

.user-btn:hover .user-avatar {
  border-color: rgba(0, 0, 0, 0.2);
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  flex-shrink: 0;
  margin: 0 4px;
}

.chevron-icon {
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.user-btn:hover .chevron-icon {
  opacity: 1;
}

/* 드롭다운 메뉴 */
.modern-dropdown {
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  background: #FFFFFF;
}

.dropdown-item {
  border-radius: 8px;
  margin: 2px 6px;
  padding: 8px 12px;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.06);
  color: #EF4444;
}

/* 인증 버튼 */
.auth-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.login-btn {
  color: #FF8B8B !important;
  font-weight: 600;
  border-radius: 10px;
  padding: 10px 18px;
  transition: all 0.2s ease;
  border: 1.5px solid #FF8B8B !important;
  box-shadow: 0 6px 16px rgba(0,0,0,0.06) !important;
  background: #FFFAF0 !important;
  text-transform: none !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover {
  color: #FF6B6B !important;
  background: rgba(255, 139, 139, 0.08) !important;
}

.register-btn {
  background: linear-gradient(135deg, #FF8B8B 0%, #FF6B6B 100%) !important;
  color: #FFFFFF !important;
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 18px;
  box-shadow: 0 6px 16px rgba(255, 139, 139, 0.25);
  transition: all 0.2s ease;
  border: none !important;
  text-transform: none !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(255, 139, 139, 0.35);
}

/* 모바일 요소 */
.modern-nav-icon {
  color: #111111 !important;
}

.modern-header.scrolled .modern-nav-icon {
  color: #475569 !important;
}

.mobile-auth-btn {
  color: #111111 !important;
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
  .modern-header {
    padding: 0 24px;
  }
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

/* Vuetify 기본 스타일 오버라이드 */
:deep(.v-btn) {
  border: none !important;
  box-shadow: none !important;
  text-transform: none !important;
}

:deep(.v-btn--variant-text) {
  border: none !important;
  box-shadow: none !important;
}

:deep(.v-btn--variant-elevated) {
  border: none !important;
}

:deep(.v-btn--variant-outlined) {
  border: none !important;
}

:deep(.v-btn--variant-plain) {
  border: none !important;
  box-shadow: none !important;
}
</style>