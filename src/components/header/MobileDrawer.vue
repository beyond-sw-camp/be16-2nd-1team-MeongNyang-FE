<template>
  <v-navigation-drawer 
    v-model="drawerModel"
    temporary
    class="mobile-drawer"
    width="280"
  >
    <!-- 모바일 드로어 헤더 -->
    <div class="mobile-drawer-header">
      <BrandLogo :is-mobile="true" />
    </div>

    <!-- 모바일 메뉴 -->
    <NavigationMenu
      :menu-items="menuItems"
      :is-logged-in="isLoggedIn"
      :is-mobile="true"
      :show-notification-drawer="showNotificationDrawer"
      :alarm-store="alarmStore"
      @navigate="handleNavigation"
      @auth-action="handleAuthAction"
    />

    <!-- 모바일 사용자 정보 -->
    <template v-slot:append>
      <UserProfile
        v-if="isLoggedIn"
        :user="user"
        :representative-pet="representativePet"
        :is-mobile="true"
        @avatar-click="$emit('avatar-click')"
        @logout="$emit('logout')"
      />
    </template>
  </v-navigation-drawer>
</template>

<script>
import BrandLogo from './BrandLogo.vue'
import NavigationMenu from './NavigationMenu.vue'
import UserProfile from './UserProfile.vue'

export default {
  name: 'MobileDrawer',
  components: {
    BrandLogo,
    NavigationMenu,
    UserProfile
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
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
  emits: ['update:modelValue', 'navigate', 'auth-action', 'avatar-click', 'logout'],
  computed: {
    drawerModel: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
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
</style>
