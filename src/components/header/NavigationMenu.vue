<template>
  <v-list :class="menuClass">
    <template v-for="item in menuItems" :key="item.path">
      <v-list-item 
        v-if="item.showCondition"
        @click="handleNavigation(item.path)"
        :class="[itemClass, { 'active': isActiveRoute(item.path) }]"
        density="compact"
      >
        <template v-slot:prepend>
          <div v-if="item.path === '/notifications'" class="notification-icon-wrapper">
            <v-icon size="20" :color="showNotificationDrawer ? '#E87D7D' : '#6c757d'">
              {{ item.icon }}
            </v-icon>
            <span v-if="alarmStore.unreadCount > 0" class="notification-badge">
              {{ alarmStore.unreadCount > 99 ? '99+' : alarmStore.unreadCount }}
            </span>
          </div>
          <v-icon v-else size="20" :color="getIconColor(item.path)">
            {{ item.icon }}
          </v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </template>

    <!-- 구분선 -->
    <v-divider v-if="isLoggedIn" class="my-4"></v-divider>

    <!-- 로그인/회원가입 (비로그인 시) -->
    <template v-if="!isLoggedIn">
      <v-list-item 
        @click="handleAuthAction('login')"
        :class="[itemClass, 'auth-item']"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" color="#6c757d">mdi-login</v-icon>
        </template>
        <v-list-item-title>로그인</v-list-item-title>
      </v-list-item>

      <v-list-item 
        @click="handleAuthAction('register')"
        :class="[itemClass, 'auth-item']"
        density="compact"
      >
        <template v-slot:prepend>
          <v-icon size="20" color="#6c757d">mdi-account-plus</v-icon>
        </template>
        <v-list-item-title>회원가입</v-list-item-title>
      </v-list-item>
    </template>
  </v-list>
</template>

<script>
export default {
  name: 'NavigationMenu',
  props: {
    menuItems: {
      type: Array,
      required: true
    },
    isLoggedIn: {
      type: Boolean,
      required: true
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    showNotificationDrawer: {
      type: Boolean,
      default: false
    },
    alarmStore: {
      type: Object,
      required: true
    }
  },
  emits: ['navigate', 'auth-action'],
  computed: {
    menuClass() {
      return this.isMobile ? 'mobile-menu' : 'sidebar-menu'
    },
    itemClass() {
      return this.isMobile ? 'mobile-menu-item' : 'menu-item'
    }
  },
  methods: {
    isActiveRoute(path) {
      if (path === '/notifications') {
        return this.showNotificationDrawer
      }
      // 알림 드로어가 열려있으면 다른 탭들은 비활성화
      if (this.showNotificationDrawer) {
        return false
      }
      return this.$route.path === path
    },
    getIconColor(path) {
      if (path === '/notifications') {
        return this.showNotificationDrawer ? '#E87D7D' : '#6c757d'
      }
      return this.isActiveRoute(path) ? '#E87D7D' : '#6c757d'
    },
    handleNavigation(path) {
      this.$emit('navigate', path)
    },
    handleAuthAction(action) {
      this.$emit('auth-action', action)
    }
  }
}
</script>

<style scoped>
.sidebar-menu {
  padding: 16px 10px;
}

.mobile-menu {
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

.auth-item:hover {
  background: rgba(99, 102, 241, 0.08);
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
</style>
