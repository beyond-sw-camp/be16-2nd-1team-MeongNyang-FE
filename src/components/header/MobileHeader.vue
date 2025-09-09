<template>
  <v-app-bar 
    app 
    elevation="0"
    class="mobile-header"
  >
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')" class="hamburger-icon"></v-app-bar-nav-icon>
    
    <v-spacer></v-spacer>

    <router-link to="/" class="brand-container">
      <img src="@/assets/logo.png" alt="멍냥냥 로고" class="header-logo" />
      <span class="service-name">멍냥냥냥</span>
    </router-link>

    <v-spacer></v-spacer>

    <!-- 모바일 사용자 아바타 또는 플레이스홀더 -->
    <div v-if="isLoggedIn" class="mobile-user-section">
      <v-avatar size="32" class="mobile-avatar" >
        <v-img v-if="representativePet?.url" :src="representativePet.url" :alt="representativePet.name"></v-img>
        <v-img v-else-if="user?.profileImage" :src="user.profileImage" alt="사용자 프로필"></v-img>
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
    </div>
    <div v-else class="user-section-placeholder"></div>
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

.brand-container {
  display: flex;
  align-items: center;
  gap: 8px;
  /* 로고와 텍스트가 헤더의 다른 요소에 의해 잘리지 않도록 합니다. */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-decoration: none;
  color: inherit;
}

.header-logo {
  height: 28px;
  width: auto;
}

.service-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
}

/* 아바타와 플레이스홀더의 공간을 동일하게 유지하여 중앙 정렬을 돕습니다. */
.mobile-user-section, .user-section-placeholder {
  width: 48px; /* v-app-bar-nav-icon 너비와 유사하게 설정 */
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.mobile-avatar {
  border: 2px solid #FF8B8B;
}
</style>
