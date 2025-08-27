<template>
  <v-app-bar 
    app 
    elevation="0"
    class="mobile-header"
  >
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')" class="hamburger-icon"></v-app-bar-nav-icon>
    <v-spacer></v-spacer>

    <!-- 모바일 사용자 아바타 -->
    <div v-if="isLoggedIn" class="mobile-user-section">
      <v-avatar size="32" class="mobile-avatar" @click="$emit('avatar-click')">
        <v-img v-if="representativePet?.url" :src="representativePet.url" :alt="representativePet.name"></v-img>
        <v-img v-else-if="user?.profileImage" :src="user.profileImage" alt="사용자 프로필"></v-img>
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
    </div>
  </v-app-bar>
</template>

<script>
export default {
  name: 'MobileHeader',
  props: {
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
    }
  },
  emits: ['toggle-drawer', 'avatar-click']
}
</script>

<style scoped>
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

.mobile-user-section {
  margin-right: 8px;
}

.mobile-avatar {
  cursor: pointer;
  border: 2px solid #FF8B8B;
}
</style>
