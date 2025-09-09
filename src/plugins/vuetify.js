import { createVuetify } from "vuetify";
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { mdi } from 'vuetify/iconsets/mdi';
import { ko } from 'vuetify/locale';

// 커스텀 테마 설정
const lightTheme = {
  dark: false,
  colors: {
    // 브랜드 색상 - 더 세련된 파란색 계열
    primary: '#6366F1',
    'primary-darken-1': '#4F46E5',
    'primary-lighten-1': '#818CF8',
    
    // 보조 색상 - 모던한 그레이 계열
    secondary: '#64748B',
    'secondary-darken-1': '#475569',
    'secondary-lighten-1': '#94A3B8',
    
    // 성공/경고/오류 색상 - 더 부드러운 톤
    success: '#10B981',
    'success-darken-1': '#059669',
    'success-lighten-1': '#34D399',
    
    warning: '#F59E0B',
    'warning-darken-1': '#D97706',
    'warning-lighten-1': '#FBBF24',
    
    error: '#EF4444',
    'error-darken-1': '#DC2626',
    'error-lighten-1': '#F87171',
    
    info: '#3B82F6',
    'info-darken-1': '#2563EB',
    'info-lighten-1': '#60A5FA',
    
    // 표면 색상 - 더 부드러운 화이트
    surface: '#FFFFFF',
    'surface-variant': '#F8FAFC',
    'surface-bright': '#FFFFFF',
    'surface-light': '#F1F5F9',
    'surface-dark': '#E2E8F0',
    
    // 배경 색상 - 그라데이션 친화적
    background: '#FFFFFF',
    'background-light': '#F8FAFC',
    'background-dark': '#F1F5F9',
    
    // 텍스트 색상
    'on-primary': '#FFFFFF',
    'on-primary-darken-1': '#FFFFFF',
    'on-primary-lighten-1': '#1E293B',
    
    'on-secondary': '#FFFFFF',
    'on-secondary-darken-1': '#FFFFFF',
    'on-secondary-lighten-1': '#1E293B',
    
    'on-success': '#FFFFFF',
    'on-success-darken-1': '#FFFFFF',
    'on-success-lighten-1': '#1E293B',
    
    'on-warning': '#FFFFFF',
    'on-warning-darken-1': '#FFFFFF',
    'on-warning-lighten-1': '#1E293B',
    
    'on-error': '#FFFFFF',
    'on-error-darken-1': '#FFFFFF',
    'on-error-lighten-1': '#1E293B',
    
    'on-info': '#FFFFFF',
    'on-info-darken-1': '#FFFFFF',
    'on-info-lighten-1': '#1E293B',
    
    'on-surface': '#1E293B',
    'on-surface-variant': '#475569',
    'on-surface-bright': '#1E293B',
    'on-surface-light': '#475569',
    'on-surface-dark': '#64748B',
    
    'on-background': '#1E293B',
    'on-background-light': '#475569',
    'on-background-dark': '#64748B',
    
    // 기타 색상 - 더 세련된 톤
    outline: '#E2E8F0',
    'outline-variant': '#CBD5E1',
    shadow: 'rgba(15, 23, 42, 0.08)',
    'shadow-light': 'rgba(15, 23, 42, 0.04)',
    'shadow-dark': 'rgba(15, 23, 42, 0.16)',
    
    // 반투명 색상
    'overlay-light': 'rgba(255, 255, 255, 0.9)',
    'overlay-dark': 'rgba(15, 23, 42, 0.6)',
    'overlay-darker': 'rgba(15, 23, 42, 0.8)',
    
    // 새로운 그라데이션 색상
    'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'gradient-success': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'gradient-warning': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'gradient-error': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  }
};

const darkTheme = {
  dark: true,
  colors: {
    // 브랜드 색상 - 더 세련된 파란색 계열
    primary: '#818CF8',
    'primary-darken-1': '#6366F1',
    'primary-lighten-1': '#A5B4FC',
    
    // 보조 색상 - 모던한 그레이 계열
    secondary: '#94A3B8',
    'secondary-darken-1': '#64748B',
    'secondary-lighten-1': '#CBD5E1',
    
    // 성공/경고/오류 색상 - 더 부드러운 톤
    success: '#34D399',
    'success-darken-1': '#10B981',
    'success-lighten-1': '#6EE7B7',
    
    warning: '#FBBF24',
    'warning-darken-1': '#F59E0B',
    'warning-lighten-1': '#FCD34D',
    
    error: '#F87171',
    'error-darken-1': '#EF4444',
    'error-lighten-1': '#FCA5A5',
    
    info: '#60A5FA',
    'info-darken-1': '#3B82F6',
    'info-lighten-1': '#93C5FD',
    
    // 표면 색상 - 더 부드러운 다크 톤
    surface: '#0F172A',
    'surface-variant': '#1E293B',
    'surface-bright': '#1E293B',
    'surface-light': '#334155',
    'surface-dark': '#020617',
    
    // 배경 색상 - 그라데이션 친화적
    background: '#0F172A',
    'background-light': '#1E293B',
    'background-dark': '#020617',
    
    // 텍스트 색상
    'on-primary': '#0F172A',
    'on-primary-darken-1': '#0F172A',
    'on-primary-lighten-1': '#0F172A',
    
    'on-secondary': '#0F172A',
    'on-secondary-darken-1': '#0F172A',
    'on-secondary-lighten-1': '#0F172A',
    
    'on-success': '#0F172A',
    'on-success-darken-1': '#0F172A',
    'on-success-lighten-1': '#0F172A',
    
    'on-warning': '#0F172A',
    'on-warning-darken-1': '#0F172A',
    'on-warning-lighten-1': '#0F172A',
    
    'on-error': '#0F172A',
    'on-error-darken-1': '#0F172A',
    'on-error-lighten-1': '#0F172A',
    
    'on-info': '#0F172A',
    'on-info-darken-1': '#0F172A',
    'on-info-lighten-1': '#0F172A',
    
    'on-surface': '#F8FAFC',
    'on-surface-variant': '#E2E8F0',
    'on-surface-bright': '#F8FAFC',
    'on-surface-light': '#CBD5E1',
    'on-surface-dark': '#94A3B8',
    
    'on-background': '#F8FAFC',
    'on-background-light': '#E2E8F0',
    'on-background-dark': '#CBD5E1',
    
    // 기타 색상 - 더 세련된 톤
    outline: '#334155',
    'outline-variant': '#475569',
    shadow: 'rgba(0, 0, 0, 0.4)',
    'shadow-light': 'rgba(0, 0, 0, 0.3)',
    'shadow-dark': 'rgba(0, 0, 0, 0.6)',
    
    // 반투명 색상
    'overlay-light': 'rgba(15, 23, 42, 0.2)',
    'overlay-dark': 'rgba(0, 0, 0, 0.8)',
    'overlay-darker': 'rgba(0, 0, 0, 0.9)',
    
    // 새로운 그라데이션 색상
    'gradient-primary': 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
    'gradient-secondary': 'linear-gradient(135deg, #A5B4FC 0%, #818CF8 100%)',
    'gradient-success': 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    'gradient-warning': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    'gradient-error': 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
  }
};

// 커스텀 타이포그래피 설정
const typography = {
  fontFamily: {
    // 기본 폰트 스택
    body: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(', '),
    
    // 제목 폰트
    heading: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(', '),
    
    // 모노스페이스 폰트
    mono: [
      'SFMono-Regular',
      'Consolas',
      '"Liberation Mono"',
      'Menlo',
      'Courier',
      'monospace'
    ].join(', ')
  },
  
  // 폰트 크기 설정
  fontSize: {
    'xs': '0.75rem',      // 12px
    'sm': '0.875rem',     // 14px
    'base': '1rem',       // 16px
    'lg': '1.125rem',     // 18px
    'xl': '1.25rem',      // 20px
    '2xl': '1.5rem',      // 24px
    '3xl': '1.875rem',    // 30px
    '4xl': '2.25rem',     // 36px
    '5xl': '3rem',        // 48px
    '6xl': '3.75rem',     // 60px
  },
  
  // 폰트 굵기 설정
  fontWeight: {
    'light': 300,
    'normal': 400,
    'medium': 500,
    'semibold': 600,
    'bold': 700,
    'extrabold': 800,
  },
  
  // 줄 간격 설정
  lineHeight: {
    'tight': 1.25,
    'normal': 1.5,
    'relaxed': 1.75,
  }
};

// 커스텀 간격 설정
const spacing = {
  // 기본 간격 단위
  unit: 8,
  
  // 간격 값들
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  '2xl': 48, // 48px
  '3xl': 64, // 64px
};

// 커스텀 둥근 모서리 설정
const borderRadius = {
  none: 0,
  sm: 2,    // 2px
  base: 4,  // 4px
  md: 6,    // 6px
  lg: 8,    // 8px
  xl: 12,   // 12px
  '2xl': 16, // 16px
  full: 9999,
};

// 커스텀 그림자 설정 - 더 현대적이고 부드러운 그림자
const shadows = {
  none: 'none',
  sm: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
  base: '0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px 0 rgba(15, 23, 42, 0.06)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
  '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  // 새로운 그림자 효과
  'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
  'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
  'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
  'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
  'inner': 'inset 0 2px 4px 0 rgba(15, 23, 42, 0.06)',
  'inner-lg': 'inset 0 4px 8px 0 rgba(15, 23, 42, 0.1)',
};

// 커스텀 애니메이션 설정 - 더 부드럽고 현대적인 전환
const transitions = {
  // 기본 전환 시간
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  
  // 이징 함수 - 더 자연스러운 움직임
  easing: {
    linear: 'linear',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // 커스텀 전환 효과
  effects: {
    'fade-in': 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    'slide-up': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    'scale-in': 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    'bounce-in': 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  }
};

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'ko',
    fallback: 'ko',
    messages: { ko }
  },
  icons: { 
    defaultSet: 'mdi', 
    sets: { mdi } 
  },
  
  // 테마 설정
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
    
    // 테마 변경 감지
    variations: {
      colors: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
      lighten: 1,
      darken: 1,
    },
  },
  
  // 전역 기본값 설정
  defaults: {
    // 버튼 기본값
    VBtn: {
      variant: 'elevated',
      size: 'default',
      color: 'primary',
      rounded: false,
      elevation: 2,
    },
    
    // 입력 필드 기본값
    VTextField: {
      variant: 'outlined',
      density: 'default',
      color: 'primary',
      hideDetails: false,
    },
    
    // 카드 기본값
    VCard: {
      elevation: 1,
      rounded: true,
    },
    
    // 다이얼로그 기본값
    VDialog: {
      persistent: false,
      maxWidth: 500,
      transition: 'dialog-bottom-transition',
    },
    
    // 스낵바 기본값
    VSnackbar: {
      timeout: 5000,
      location: 'bottom',
      variant: 'elevated',
    },
    
    // 오버레이 기본값
    VOverlay: {
      scrim: true,
      persistent: false,
    },
  },
  
  // 전역 디스플레이 설정
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 340,
      md: 540,
      lg: 800,
      xl: 1280,
    },
  },
  
  // 커스텀 CSS 변수 정의
  css: {
    variables: {
      // 타이포그래피
      '--font-family': typography.fontFamily.body,
      '--font-family-heading': typography.fontFamily.heading,
      '--font-family-mono': typography.fontFamily.mono,
      
      // 간격
      '--spacing-unit': `${spacing.unit}px`,
      '--spacing-xs': `${spacing.xs}px`,
      '--spacing-sm': `${spacing.sm}px`,
      '--spacing-md': `${spacing.md}px`,
      '--spacing-lg': `${spacing.lg}px`,
      '--spacing-xl': `${spacing.xl}px`,
      '--spacing-2xl': `${spacing['2xl']}px`,
      '--spacing-3xl': `${spacing['3xl']}px`,
      
      // 둥근 모서리
      '--border-radius-none': `${borderRadius.none}px`,
      '--border-radius-sm': `${borderRadius.sm}px`,
      '--border-radius-base': `${borderRadius.base}px`,
      '--border-radius-md': `${borderRadius.md}px`,
      '--border-radius-lg': `${borderRadius.lg}px`,
      '--border-radius-xl': `${borderRadius.xl}px`,
      '--border-radius-2xl': `${borderRadius['2xl']}px`,
      '--border-radius-full': `${borderRadius.full}px`,
      
      // 그림자
      '--shadow-none': shadows.none,
      '--shadow-sm': shadows.sm,
      '--shadow-base': shadows.base,
      '--shadow-md': shadows.md,
      '--shadow-lg': shadows.lg,
      '--shadow-xl': shadows.xl,
      '--shadow-2xl': shadows['2xl'],
      
      // 전환
      '--transition-fast': `${transitions.duration.fast}ms`,
      '--transition-normal': `${transitions.duration.normal}ms`,
      '--transition-slow': `${transitions.duration.slow}ms`,
      '--transition-slower': `${transitions.duration.slower}ms`,
      
      // 이징 함수
      '--ease-default': transitions.easing.ease,
      '--ease-bounce': transitions.easing.bounce,
      '--ease-elastic': transitions.easing.elastic,
      
      // 커스텀 전환 효과
      '--transition-fade-in': transitions.effects['fade-in'],
      '--transition-slide-up': transitions.effects['slide-up'],
      '--transition-scale-in': transitions.effects['scale-in'],
      '--transition-bounce-in': transitions.effects['bounce-in'],
    }
  }
});