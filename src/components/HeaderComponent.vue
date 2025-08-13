<template>
  <v-app-bar
    app
    elevation="0"
    color="#FFFBF7"
    class="header-component"
    height="68"
  >
    <!-- 로고 영역 -->
    <div class="d-flex align-center">
      <v-btn
        to="/"
        variant="text"
        class="logo-btn"
      >
        <div class="logo-container d-flex align-center">
          <div class="logo-icon-wrapper mr-3">
            <div class="logo-icon-bg">
              <v-icon size="20" color="white" class="logo-icon-main">
                mdi-heart
              </v-icon>
            </div>
            <v-icon size="14" color="primary" class="logo-icon-dog">
              mdi-dog
            </v-icon>
            <v-icon size="12" color="secondary" class="logo-icon-cat">
              mdi-cat
            </v-icon>
          </div>
          <div class="logo-text">
            <span class="text-h6 font-weight-medium text-primary">멍냥</span>
            <span class="text-caption text-grey-darken-1 d-block">반려동물 커뮤니티</span>
          </div>
        </div>
      </v-btn>
    </div>

    <!-- 네비게이션 메뉴 -->
    <v-tabs
      v-model="activeTab"
      class="ml-6 navigation-tabs"
      color="primary"
      hide-slider
    >
      <v-tab
        to="/"
        value="home"
        class="text-body-2 font-weight-medium"
      >
        홈
      </v-tab>
      <v-tab
        to="/feed"
        value="feed"
        class="text-body-2 font-weight-medium"
      >
        피드
      </v-tab>
      <v-tab
        to="/trade"
        value="trade"
        class="text-body-2 font-weight-medium"
      >
        거래
      </v-tab>
      <v-tab
        to="/chat"
        value="chat"
        class="text-body-2 font-weight-medium"
      >
        채팅
      </v-tab>
    </v-tabs>

    <v-spacer></v-spacer>

    <!-- 검색 기능 -->
    <v-text-field
      v-model="searchQuery"
      placeholder="검색어를 입력하세요..."
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      density="compact"
      hide-details
      class="search-field mr-3"
      style="max-width: 280px;"
      @keyup.enter="handleSearch"
    ></v-text-field>

    <!-- 알림 드롭다운 -->
    <v-menu
      v-model="showNotifications"
      :close-on-content-click="false"
      location="bottom end"
      offset="8"
      :max-width="400"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          variant="text"
          size="small"
          class="mr-2 notification-btn"
          @click="loadNotifications"
        >
          <v-badge
            :content="notificationCount"
            :model-value="notificationCount > 0"
            color="#FF9A8B"
            dot
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>
      <v-card min-width="350" max-height="400" class="notification-card">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6 font-weight-medium">알림</span>
          <v-btn
            variant="text"
            size="small"
            color="primary"
            @click="markAllAsRead"
          >
            모두 읽음
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-list v-if="notifications.length > 0" class="notification-list pa-0">
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            :class="{ 'unread': !notification.read }"
            @click="handleNotificationClick(notification)"
            class="notification-item"
          >
            <template v-slot:prepend>
              <v-icon :color="getNotificationIconColor(notification.type)" size="20">
                {{ getNotificationIcon(notification.type) }}
              </v-icon>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ notification.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-grey-darken-1">
              {{ formatNotificationTime(notification.createdAt) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-text v-else class="text-center text-grey-darken-1 py-8">
          새로운 알림이 없습니다
        </v-card-text>
      </v-card>
    </v-menu>

    <!-- 사용자 메뉴 -->
    <v-menu
      v-model="showUserMenu"
      :close-on-content-click="false"
      location="bottom end"
      offset="8"
      :max-width="250"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          size="small"
          class="user-menu-btn"
        >
          <v-avatar size="28" class="mr-2">
            <v-img
              v-if="userProfile"
              :src="userProfile"
              alt="프로필"
            ></v-img>
            <v-icon v-else size="20">mdi-account</v-icon>
          </v-avatar>
          <span class="text-body-2">{{ userName || '로그인' }}</span>
          <v-icon size="16" class="ml-1">mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-card min-width="200" class="user-menu-card">
        <v-list class="pa-2">
          <v-list-item
            v-if="!isLoggedIn"
            @click="handleLoginClick"
            class="user-menu-item"
          >
            <template v-slot:prepend>
              <v-icon color="primary" size="20">mdi-login</v-icon>
            </template>
            <v-list-item-title class="text-body-2">로그인</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="!isLoggedIn"
            @click="handleSignupClick"
            class="user-menu-item"
          >
            <template v-slot:prepend>
              <v-icon color="secondary" size="20">mdi-account-plus</v-icon>
            </template>
            <v-list-item-title class="text-body-2">회원가입</v-list-item-title>
          </v-list-item>

          <v-divider v-if="!isLoggedIn" class="my-2"></v-divider>

          <v-list-item
            v-if="isLoggedIn"
            to="/mypage"
            @click="showUserMenu = false"
            class="user-menu-item"
          >
            <template v-slot:prepend>
              <v-icon color="primary" size="20">mdi-account</v-icon>
            </template>
            <v-list-item-title class="text-body-2">마이페이지</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="isLoggedIn"
            to="/pet-register"
            @click="showUserMenu = false"
            class="user-menu-item"
          >
            <template v-slot:prepend>
              <v-icon color="secondary" size="20">mdi-paw</v-icon>
            </template>
            <v-list-item-title class="text-body-2">반려동물 등록</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="isLoggedIn"
            @click="handleLogout"
            class="user-menu-item"
          >
            <template v-slot:prepend>
              <v-icon color="error" size="20">mdi-logout</v-icon>
            </template>
            <v-list-item-title class="text-body-2">로그아웃</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HeaderComponent',
  data() {
    return {
      activeTab: 'home',
      searchQuery: '',
      showUserMenu: false,
      showNotifications: false,
      isLoggedIn: false,
      userName: '',
      userProfile: null,
      notificationCount: 0,
      notifications: [],
      // API 설정
      apiBaseUrl: 'http://localhost:8080'
    }
  },
  computed: {
    unreadNotifications() {
      return this.notifications.filter(n => !n.read).length
    }
  },
  watch: {
    unreadNotifications: {
      handler(newCount) {
        this.notificationCount = newCount
      },
      immediate: true
    }
  },
  methods: {
    // API 호출을 위한 axios 설정
    getAuthHeaders() {
      const token = localStorage.getItem('accessToken')
      return token ? { Authorization: `Bearer ${token}` } : {}
    },

    // 로그인 상태 확인
    async checkLoginStatus() {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await axios.get(`${this.apiBaseUrl}/user/my-page`, {
            headers: this.getAuthHeaders()
          })
          if (response.data.isSuccess) {
            this.isLoggedIn = true
            this.userName = response.data.data.nickname || '사용자'
            this.userProfile = response.data.data.profileImage
          }
        } catch (error) {
          console.error('로그인 상태 확인 실패:', error)
          this.handleTokenExpired()
        }
      }
    },

    // 토큰 만료 처리
    handleTokenExpired() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      this.isLoggedIn = false
      this.userName = ''
      this.userProfile = null
    },

    // 검색 처리
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({
          path: '/search',
          query: { q: this.searchQuery }
        })
        this.searchQuery = ''
      }
    },

    // 로그인 페이지로 이동
    handleLogin() {
      this.showUserMenu = false
      this.$router.push('/login')
    },

    // 회원가입 페이지로 이동
    handleSignup() {
      this.showUserMenu = false
      this.$router.push('/signup')
    },

    // 로그아웃 처리
    async handleLogout() {
      try {
        // 백엔드에 로그아웃 요청 (필요시)
        await axios.post(`${this.apiBaseUrl}/user/logout`, {}, {
          headers: this.getAuthHeaders()
        })
      } catch (error) {
        console.error('로그아웃 요청 실패:', error)
      } finally {
        // 로컬 스토리지 정리
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
        this.isLoggedIn = false
        this.userName = ''
        this.userProfile = null
        this.showUserMenu = false
        this.$router.push('/')
      }
    },

    // 알림 로드
    async loadNotifications() {
      if (!this.isLoggedIn) return

      try {
        const response = await axios.get(`${this.apiBaseUrl}/alarms`, {
          headers: this.getAuthHeaders()
        })
        if (response.data.isSuccess) {
          this.notifications = response.data.data || []
        }
      } catch (error) {
        console.error('알림 로드 실패:', error)
        // 임시 알림 데이터 (백엔드 알림 API가 완성되기 전까지)
        this.notifications = [
          {
            id: 1,
            type: 'like',
            title: '사용자가 회원님의 게시글을 좋아합니다',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            id: 2,
            type: 'comment',
            title: '새로운 댓글이 달렸습니다',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
          },
          {
            id: 3,
            type: 'follow',
            title: '새로운 팔로워가 생겼습니다',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
          }
        ]
      }
    },

    // 알림 클릭 처리
    async handleNotificationClick(notification) {
      try {
        // 알림 읽음 처리 API 호출
        await axios.patch(`${this.apiBaseUrl}/alarms/${notification.id}/read`, {}, {
          headers: this.getAuthHeaders()
        })
        notification.read = true
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
        // API 호출 실패시에도 UI 업데이트
        notification.read = true
      }
      this.showNotifications = false
    },

    // 모든 알림 읽음 처리
    async markAllAsRead() {
      try {
        await axios.patch(`${this.apiBaseUrl}/alarms/read-all`, {}, {
          headers: this.getAuthHeaders()
        })
        this.notifications.forEach(notification => {
          notification.read = true
        })
      } catch (error) {
        console.error('모든 알림 읽음 처리 실패:', error)
        // API 호출 실패시에도 UI 업데이트
        this.notifications.forEach(notification => {
          notification.read = true
        })
      }
    },

    // 알림 아이콘 가져오기
    getNotificationIcon(type) {
      const icons = {
        like: 'mdi-heart',
        comment: 'mdi-comment',
        follow: 'mdi-account-plus',
        trade: 'mdi-currency-usd',
        chat: 'mdi-message'
      }
      return icons[type] || 'mdi-bell'
    },

    // 알림 아이콘 색상 가져오기
    getNotificationIconColor(type) {
      const colors = {
        like: '#FF9A8B',
        comment: '#A8E6CF',
        follow: '#FFD3B6',
        trade: '#B8E6B8',
        chat: '#E8E0FF'
      }
      return colors[type] || '#B3D9FF'
    },

    // 알림 시간 포맷팅
    formatNotificationTime(date) {
      const now = new Date()
      const diff = now - new Date(date)
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 60) {
        return `${minutes}분 전`
      } else if (hours < 24) {
        return `${hours}시간 전`
      } else {
        return `${days}일 전`
      }
    },

    // localStorage 변경 감지
    handleStorageChange(event) {
      if (event.key === 'accessToken') {
        this.checkLoginStatus()
      }
    },

    // 로그인 클릭 처리
    handleLoginClick() {
      this.showUserMenu = false
      // 현재 페이지를 리다이렉트 파라미터로 전달
      const currentPath = this.$route.path
      if (currentPath !== '/login' && currentPath !== '/signup') {
        this.$router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      } else {
        this.$router.push('/login')
      }
    },

    // 회원가입 클릭 처리
    handleSignupClick() {
      this.showUserMenu = false
      this.$router.push('/signup')
    }
  },
  async mounted() {
    await this.checkLoginStatus()
    
    // 로그인 상태 변경 감지 (localStorage 이벤트)
    window.addEventListener('storage', this.handleStorageChange)
    
    // 커스텀 이벤트 리스너 (로그인/로그아웃 시)
    window.addEventListener('loginStatusChanged', this.checkLoginStatus)
  },
  
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('loginStatusChanged', this.checkLoginStatus)
  }
}
</script>

<style lang="scss" scoped>
.header-component {
  border-bottom: 1px solid rgba(255, 154, 139, 0.15);
  backdrop-filter: blur(20px);
  background: rgba(255, 251, 247, 0.92) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.logo-btn {
  text-decoration: none;
  text-transform: none;
  padding: 8px 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
  height: auto;
  min-height: 56px;
  
  &:hover {
    background-color: rgba(255, 154, 139, 0.08);
    transform: translateY(-1px);
  }
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 2px 0;
}

.logo-icon-bg {
  position: absolute;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #FF9A8B, #A8E6CF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(255, 154, 139, 0.15);
  transition: all 0.3s ease;
}

.logo-icon-main {
  transition: transform 0.3s ease;
}

.logo-icon-dog {
  position: absolute;
  top: -2px;
  left: -2px;
  background: white;
  border-radius: 50%;
  padding: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.logo-icon-cat {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: white;
  border-radius: 50%;
  padding: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.logo-btn:hover .logo-icon-bg {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.logo-btn:hover .logo-icon-main {
  transform: scale(1.1);
}

.logo-btn:hover .logo-icon-dog {
  transform: scale(1.1) rotate(-5deg);
}

.logo-btn:hover .logo-icon-cat {
  transform: scale(1.1) rotate(5deg);
}

.logo-text {
  line-height: 1.2;
}

.navigation-tabs {
  .v-tab {
    border-radius: 12px;
    margin: 0 2px;
    padding: 8px 16px;
    transition: all 0.3s ease;
    font-size: 0.875rem;
    
    &:hover {
      background-color: rgba(255, 154, 139, 0.06);
    }
    
    &.v-tab--selected {
      background-color: rgba(255, 154, 139, 0.1);
      color: #FF9A8B;
    }
  }
}

.search-field {
  .v-field {
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.8);
  }
  
  .v-field--focused {
    background-color: rgba(255, 255, 255, 0.95);
  }
}

.user-menu-btn {
  text-transform: none;
  font-weight: normal;
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 6px 12px;
  
  &:hover {
    background-color: rgba(255, 154, 139, 0.06);
  }
}

.notification-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 154, 139, 0.06);
  }
}

.user-menu-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 154, 139, 0.1);
}

.user-menu-item {
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 154, 139, 0.06);
    transform: translateX(2px);
  }
}

.notification-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 154, 139, 0.1);
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 154, 139, 0.3);
    border-radius: 2px;
  }
}

.notification-item {
  cursor: pointer;
  border-radius: 8px;
  margin: 4px 8px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 154, 139, 0.06);
    transform: translateX(2px);
  }
}

.unread {
  background-color: rgba(255, 154, 139, 0.04);
  border-left: 3px solid #FF9A8B;
  
  .notification-item {
    margin-left: 5px;
  }
}

// 반응형 디자인
@media (max-width: 768px) {
  .search-field {
    display: none;
  }
  
  .v-tabs {
    display: none;
  }
}
</style>