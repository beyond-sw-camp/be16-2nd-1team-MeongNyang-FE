<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-nav-icon @click="toggleDrawer" class="d-md-none"></v-app-bar-nav-icon>
    
    <!-- 로고/브랜드 -->
    <v-app-bar-title @click="$router.push('/')" class="cursor-pointer">
      🐕🐱 멍냥이 커뮤니티
    </v-app-bar-title>
    
    <!-- 데스크톱 네비게이션 -->
    <v-toolbar-items class="d-none d-md-flex">
      <v-btn text @click="$router.push('/')">
        홈
      </v-btn>
      <v-btn v-if="isLoggedIn" text @click="$router.push('/pets')">
        반려동물
      </v-btn>
      <v-btn v-if="isLoggedIn" text @click="$router.push('/diary')">
        다이어리
      </v-btn>
      <v-btn v-if="isLoggedIn" text @click="$router.push('/market')">
        마켓
      </v-btn>
      <v-btn v-if="isLoggedIn" text @click="$router.push('/chat')">
        채팅
      </v-btn>
    </v-toolbar-items>
    
    <v-spacer></v-spacer>
    
    <!-- 사용자 메뉴 -->
    <div v-if="isLoggedIn" class="d-none d-md-flex">
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn text v-bind="props">
            <v-avatar size="32" class="mr-2">
              <v-img v-if="user?.profileImage" :src="user.profileImage"></v-img>
              <v-icon v-else>mdi-account</v-icon>
            </v-avatar>
            {{ user?.nickname || '사용자' }}
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$router.push('/dashboard')">
            <v-list-item-icon>
              <v-icon>mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title>대시보드</v-list-item-title>
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
        </v-list>
      </v-menu>
    </div>
    
    <!-- 로그인/회원가입 버튼 -->
    <div v-else class="d-none d-md-flex">
      <v-btn text @click="$router.push('/auth/login')">
        로그인
      </v-btn>
      <v-btn outlined @click="$router.push('/auth/register')">
        회원가입
      </v-btn>
    </div>
    
    <!-- 모바일 메뉴 버튼 -->
    <v-btn v-if="!isLoggedIn" icon class="d-md-none" @click="$router.push('/auth/login')">
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
.cursor-pointer {
  cursor: pointer;
}
</style>