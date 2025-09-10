<template>
  <div 
    class="brand-logo-container" 
    :class="{ 'mobile': isMobile }"
    @click="$router.push('/')"
  >
    <img 
      :class="logoClass" 
      src="@/assets/logo.png" 
      alt="멍멍냥냥 로고" 
    />
    <span :class="titleClass">멍멍냥냥</span>
  </div>
</template>

<script>
export default {
  name: 'BrandLogo',
  props: {
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    logoClass() {
      return this.isMobile ? 'brand-logo-mobile' : 'brand-logo'
    },
    titleClass() {
      return this.isMobile ? 'brand-title-mobile' : 'brand-title'
    }
  }
}
</script>

<style scoped>
.brand-logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brand-logo-container:hover {
  transform: scale(1.05);
}

.brand-logo {
  height: 38px;
  width: auto;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

.brand-logo-mobile {
  height: 28px;
  width: auto;
}

.brand-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.brand-title-mobile {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
}

/* 맥 환경 최적화 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .brand-logo,
  .brand-logo-mobile {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

</style>
