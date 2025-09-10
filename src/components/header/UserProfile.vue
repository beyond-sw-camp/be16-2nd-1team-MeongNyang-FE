<template>
  <div :class="containerClass">
    <v-divider class="mb-3"></v-divider>
    <div :class="detailsClass">
      <v-avatar 
        :size="avatarSize" 
        :class="avatarClass" 
        
      >
        <v-img 
          v-if="representativePet?.url" 
          :src="representativePet.url" 
          :alt="representativePet.name"
        ></v-img>
        <v-img 
          v-else-if="user?.profileImage" 
          :src="user.profileImage" 
          alt="사용자 프로필"
        ></v-img>
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
      <div :class="textClass">
        <div :class="nameClass">{{ user?.nickname || '사용자' }}</div>
      </div>
      <v-btn 
        icon 
        :class="logoutBtnClass" 
        @click="$emit('logout')"
      >
        <v-icon color="#F87171">mdi-logout</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  props: {
    user: {
      type: Object,
      default: null
    },
    representativePet: {
      type: Object,
      default: null
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  emits: ['avatar-click', 'logout'],
  computed: {
    containerClass() {
      return this.isMobile ? 'mobile-user-info' : 'user-section'
    },
    detailsClass() {
      return this.isMobile ? 'mobile-user-details' : 'user-info'
    },
    textClass() {
      return this.isMobile ? 'mobile-user-text' : 'user-details'
    },
    nameClass() {
      return this.isMobile ? 'mobile-user-name' : 'user-name'
    },
    avatarClass() {
      return this.isMobile ? 'mobile-user-avatar' : 'user-avatar'
    },
    logoutBtnClass() {
      return this.isMobile ? 'mobile-logout-btn' : 'logout-btn'
    },
    avatarSize() {
      return this.isMobile ? 40 : 40
    }
  }
}
</script>

<style scoped>
/* 사용자 섹션 */
.user-section {
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-avatar {
  border: 2px solid #E87D7D;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.2);
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

.user-details {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.logout-btn {
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: transparent !important;
  box-shadow: none !important;
  transform: scale(1.1);
}

.logout-btn :deep(.v-icon) {
  color: #F87171 !important;
}

.logout-btn:hover :deep(.v-icon) {
  color: #EF4444 !important;
}

/* 모바일 스타일 */
.mobile-user-info {
  padding: 16px 20px;
}

.mobile-user-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-user-avatar {
  cursor: pointer;
  border: 2px solid #FF8B8B;
}

.mobile-user-text {
  flex: 1;
}

.mobile-user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1E293B;
}

.mobile-logout-btn {
  color: #F87171 !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* 맥 환경 최적화 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .user-avatar {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

</style>
