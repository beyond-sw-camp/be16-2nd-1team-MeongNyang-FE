<template>
  <v-navigation-drawer app permanent class="modern-sidebar" width="260">
    <!-- 로고 섹션 -->
    <div class="sidebar-header">
      <BrandLogo :is-mobile="false" />
    </div>

    <!-- 네비게이션 메뉴 -->
    <NavigationMenu :menu-items="menuItems" :is-logged-in="isLoggedIn" :is-mobile="false"
      :show-notification-drawer="showNotificationDrawer" :alarm-store="alarmStore" @navigate="handleNavigation"
      @auth-action="handleAuthAction" />

    <!-- 사용자 정보 (하단) -->
    <template v-slot:append>
      <UserProfile v-if="isLoggedIn" :user="user" :representative-pet="representativePet" :is-mobile="false"
        @avatar-click="$emit('avatar-click')" @logout="$emit('logout')" />
    </template>
  </v-navigation-drawer>
</template>

<script>
  import BrandLogo from './BrandLogo.vue'
  import NavigationMenu from './NavigationMenu.vue'
  import UserProfile from './UserProfile.vue'

  export default {
    name: 'DesktopSidebar',
    components: {
      BrandLogo,
      NavigationMenu,
      UserProfile
    },
    props: {
      menuItems: {
        type: Array,
        required: true
      },
      isLoggedIn: {
        type: Boolean,
        required: true
      },
      user: {
        type: Object,
        default: null
      },
      representativePet: {
        type: Object,
        default: null
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
    emits: ['navigate', 'auth-action', 'avatar-click', 'logout'],
    methods: {
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
  .modern-sidebar {
    background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .sidebar-header {
    display: flex;
    padding: 20px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  /* 반응형 디자인 : expand on hover로 동작하게 끔 */
  /* @media (max-width: 1280px) {
    .modern-sidebar {
      width: 80px !important;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-x: hidden;
    }

    .modern-sidebar:hover {
      width: 260px !important;
    }

    .modern-sidebar .sidebar-header {
      padding: 20px 8px;
      justify-content: center;
    }

    .modern-sidebar:hover .sidebar-header {
      justify-content: flex-start;
    } */

    /* Hide text and other elements when collapsed */
    /* .modern-sidebar:not(:hover) :deep(.v-list-item-title),
    .modern-sidebar:not(:hover) :deep(.brand-title),
    .modern-sidebar:not(:hover) :deep(.user-details),
    .modern-sidebar:not(:hover) :deep(.logout-btn) {
      display: none;
    } */

    /* Adjust layout for collapsed state */
    /* .modern-sidebar:not(:hover) :deep(.v-list-item__prepend) {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-right: 0 !important;
    }

    .modern-sidebar:not(:hover) :deep(.user-avatar) {
      margin: 0 auto;
    }

    .modern-sidebar:not(:hover) .sidebar-header {
      justify-content: center;
    }
  } */



  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    .modern-sidebar {
      background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
      border-right-color: rgba(255, 255, 255, 0.1);
    }
  }
</style>
