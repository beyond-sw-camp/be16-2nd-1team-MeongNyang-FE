<template>
  <BaseButton
    :icon="currentThemeIcon"
    :aria-label="toggleAriaLabel"
    variant="text"
    size="small"
    :color="buttonColor"
    :class="customClass"
    @click="toggleTheme"
  >
    <template #default>
      <span class="theme-toggle__text">{{ currentThemeText }}</span>
    </template>
  </BaseButton>
</template>

<script>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import BaseButton from './BaseButton.vue'

export default {
  name: 'ThemeToggle',
  components: {
    BaseButton
  },
  props: {
    // 버튼 색상
    color: {
      type: String,
      default: 'primary'
    },
    
    // 텍스트 표시 여부
    showText: {
      type: Boolean,
      default: true
    },
    
    // 커스텀 클래스
    customClass: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    const theme = useTheme()
    
    const currentTheme = computed(() => {
      return theme.global.current.value
    })
    
    const isDark = computed(() => {
      return currentTheme.value.dark
    })
    
    const currentThemeIcon = computed(() => {
      return isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night'
    })
    
    const currentThemeText = computed(() => {
      if (!props.showText) return ''
      return isDark.value ? '라이트 모드' : '다크 모드'
    })
    
    const toggleAriaLabel = computed(() => {
      return isDark.value 
        ? '라이트 모드로 전환' 
        : '다크 모드로 전환'
    })
    
    const buttonColor = computed(() => {
      return props.color
    })
    
    const toggleTheme = () => {
      theme.global.name.value = isDark.value ? 'light' : 'dark'
      
      // 로컬 스토리지에 테마 설정 저장
      localStorage.setItem('theme', theme.global.name.value)
      
      // 시스템 테마 변경 이벤트 발생
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme: theme.global.name.value }
      }))
    }
    
    // 컴포넌트 마운트 시 저장된 테마 설정 복원
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (savedTheme) {
        theme.global.name.value = savedTheme
      } else if (systemPrefersDark) {
        theme.global.name.value = 'dark'
      }
    }
    
    // 시스템 테마 변경 감지
    const handleSystemThemeChange = (event) => {
      if (!localStorage.getItem('theme')) {
        theme.global.name.value = event.matches ? 'dark' : 'light'
      }
    }
    
    // 컴포넌트 마운트 시 초기화
    if (typeof window !== 'undefined') {
      initializeTheme()
      
      // 시스템 테마 변경 감지 리스너 등록
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
    
    return {
      currentTheme,
      isDark,
      currentThemeIcon,
      currentThemeText,
      toggleAriaLabel,
      buttonColor,
      toggleTheme
    }
  }
}
</script>

<style scoped>
.theme-toggle__text {
  margin-left: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* 애니메이션 효과 */
.theme-toggle__text {
  transition: all 0.2s ease-in-out;
}

/* 호버 효과 */
.v-btn:hover .theme-toggle__text {
  transform: translateX(2px);
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .theme-toggle__text {
    display: none;
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle__text {
    transition: none;
  }
  
  .v-btn:hover .theme-toggle__text {
    transform: none;
  }
}
</style>
