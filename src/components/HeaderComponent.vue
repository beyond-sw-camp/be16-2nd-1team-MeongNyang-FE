<template>
  <v-navigation-drawer 
    app 
    permanent
    class="modern-sidebar"
    width="240"
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
        @click="$router.push('/')"
        :class="{ 'active': $route.path === '/' }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/' ? '#E87D7D' : '#6c757d'">
            mdi-home
          </v-icon>
        </template>
        <v-list-item-title>홈</v-list-item-title>
      </v-list-item>

      <!-- 마켓 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="$router.push('/market')"
        :class="{ 'active': $route.path === '/market' }"
        class="menu-item"
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
        @click="$router.push('/chat')"
        :class="{ 'active': $route.path === '/chat' }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/chat' ? '#E87D7D' : '#6c757d'">
            mdi-chat
          </v-icon>
        </template>
        <v-list-item-title>채팅</v-list-item-title>
      </v-list-item>

      <!-- 대시보드 (채팅 밑으로 이동) -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="$router.push('/dashboard')"
        :class="{ 'active': $route.path === '/dashboard' }"
        class="menu-item"
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
        @click="$router.push('/profile')"
        :class="{ 'active': $route.path === '/profile' }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/profile' ? '#E87D7D' : '#6c757d'">
            mdi-account
          </v-icon>
        </template>
        <v-list-item-title>프로필</v-list-item-title>
      </v-list-item>

      <!-- 알림 -->
      <v-list-item 
        v-if="isLoggedIn"
        @click="$router.push('/notifications')"
        :class="{ 'active': $route.path === '/notifications' }"
        class="menu-item"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" :color="$route.path === '/notifications' ? '#E87D7D' : '#6c757d'">
            mdi-bell
          </v-icon>
        </template>
        <v-list-item-title>알림</v-list-item-title>
      </v-list-item>

      <!-- 관리자 (관리자인 경우) -->
      <v-list-item 
        v-if="isLoggedIn && isAdmin"
        @click="$router.push('/admin')"
        :class="{ 'active': $route.path === '/admin' }"
        class="menu-item"
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
          @click="$router.push('/auth/login')"
          class="menu-item auth-item"
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon size="20" color="#6c757d">mdi-login</v-icon>
          </template>
          <v-list-item-title>로그인</v-list-item-title>
        </v-list-item>

        <v-list-item 
          @click="$router.push('/auth/register')"
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
           <v-avatar size="40" class="user-avatar">
             <v-img v-if="user?.profileImage" :src="user.profileImage"></v-img>
             <v-icon v-else size="20">mdi-account</v-icon>
           </v-avatar>
           <div class="user-details">
             <div class="user-name">{{ user?.nickname || '사용자' }}</div>
           </div>
           <!-- 로그아웃 아이콘 (사용자 닉네임 우측) -->
           <v-btn
             @click="handleLogout"
             icon
             variant="text"
             size="small"
             class="logout-icon-btn"
             color="#dc3545"
           >
             <v-icon size="20">mdi-logout</v-icon>
           </v-btn>
         </div>
       </div>
     </template>
  </v-navigation-drawer>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HeaderComponent',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLoggedIn = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    
    const handleLogout = () => {
      authStore.logout()
      router.push('/')
    }
    
    return {
      isLoggedIn,
      user,
      isAdmin,
      handleLogout
    }
  }
}
</script>

<style scoped>
.modern-sidebar {
  background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
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
  height: 40px;
  width: auto;
}



.brand-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  white-space: nowrap;
}

.sidebar-menu {
  padding: 16px 8px;
}

.menu-item {
  margin: 4px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
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

.logout-item:hover {
  background: rgba(220, 53, 69, 0.08);
}

.logout-item:hover .v-icon {
  color: #dc3545 !important;
}

.logout-icon-btn {
  margin-left: auto;
  transition: all 0.3s ease;
}

.logout-icon-btn:hover {
  transform: scale(1.1);
  background: rgba(220, 53, 69, 0.1) !important;
}

.user-section {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  border: 2px solid #E87D7D;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.2);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: #6c757d;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Vuetify 스타일 오버라이드 */
:deep(.v-list-item) {
  border-radius: 12px;
  margin: 2px 0;
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
}

/* 반응형 */
@media (max-width: 960px) {
  .modern-sidebar {
    width: 240px !important;
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

}
</style>