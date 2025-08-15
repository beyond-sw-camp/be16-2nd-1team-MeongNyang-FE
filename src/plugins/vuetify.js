import { createVuetify } from "vuetify";
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { mdi } from 'vuetify/iconsets/mdi';

// 커스텀 테마 설정
const lightTheme = {
  dark: false,
  colors: {
    // 브랜드 색상
    primary: '#1976D2',
    'primary-darken-1': '#1565C0',
    'primary-lighten-1': '#42A5F5',
    
    // 보조 색상
    secondary: '#424242',
    'secondary-darken-1': '#212121',
    'secondary-lighten-1': '#757575',
    
    // 성공/경고/오류 색상
    success: '#4CAF50',
    'success-darken-1': '#388E3C',
    'success-lighten-1': '#81C784',
    
    warning: '#FF9800',
    'warning-darken-1': '#F57C00',
    'warning-lighten-1': '#FFB74D',
    
    error: '#F44336',
    'error-darken-1': '#D32F2F',
    'error-lighten-1': '#E57373',
    
    info: '#2196F3',
    'info-darken-1': '#1976D2',
    'info-lighten-1': '#64B5F6',
    
    // 표면 색상
    surface: '#FFFFFF',
    'surface-variant': '#F5F5F5',
    'surface-bright': '#FFFFFF',
    'surface-light': '#FAFAFA',
    'surface-dark': '#F5F5F5',
    
    // 배경 색상
    background: '#FFFFFF',
    'background-light': '#FAFAFA',
    'background-dark': '#F5F5F5',
    
    // 텍스트 색상
    'on-primary': '#FFFFFF',
    'on-primary-darken-1': '#FFFFFF',
    'on-primary-lighten-1': '#000000',
    
    'on-secondary': '#FFFFFF',
    'on-secondary-darken-1': '#FFFFFF',
    'on-secondary-lighten-1': '#000000',
    
    'on-success': '#FFFFFF',
    'on-success-darken-1': '#FFFFFF',
    'on-success-lighten-1': '#000000',
    
    'on-warning': '#000000',
    'on-warning-darken-1': '#000000',
    'on-warning-lighten-1': '#000000',
    
    'on-error': '#FFFFFF',
    'on-error-darken-1': '#FFFFFF',
    'on-error-lighten-1': '#000000',
    
    'on-info': '#FFFFFF',
    'on-info-darken-1': '#FFFFFF',
    'on-info-lighten-1': '#000000',
    
    'on-surface': '#000000',
    'on-surface-variant': '#000000',
    'on-surface-bright': '#000000',
    'on-surface-light': '#000000',
    'on-surface-dark': '#000000',
    
    'on-background': '#000000',
    'on-background-light': '#000000',
    'on-background-dark': '#000000',
    
    // 기타 색상
    outline: '#E0E0E0',
    'outline-variant': '#BDBDBD',
    shadow: 'rgba(0, 0, 0, 0.12)',
    'shadow-light': 'rgba(0, 0, 0, 0.08)',
    'shadow-dark': 'rgba(0, 0, 0, 0.24)',
    
    // 반투명 색상
    'overlay-light': 'rgba(255, 255, 255, 0.8)',
    'overlay-dark': 'rgba(0, 0, 0, 0.5)',
    'overlay-darker': 'rgba(0, 0, 0, 0.7)',
  }
};

const darkTheme = {
  dark: true,
  colors: {
    // 브랜드 색상
    primary: '#90CAF9',
    'primary-darken-1': '#64B5F6',
    'primary-lighten-1': '#BBDEFB',
    
    // 보조 색상
    secondary: '#BDBDBD',
    'secondary-darken-1': '#9E9E9E',
    'secondary-lighten-1': '#E0E0E0',
    
    // 성공/경고/오류 색상
    success: '#81C784',
    'success-darken-1': '#66BB6A',
    'success-lighten-1': '#A5D6A7',
    
    warning: '#FFB74D',
    'warning-darken-1': '#FFA726',
    'warning-lighten-1': '#FFCC02',
    
    error: '#E57373',
    'error-darken-1': '#EF5350',
    'error-lighten-1': '#FFCDD2',
    
    info: '#64B5F6',
    'info-darken-1': '#42A5F5',
    'info-lighten-1': '#90CAF9',
    
    // 표면 색상
    surface: '#121212',
    'surface-variant': '#1E1E1E',
    'surface-bright': '#1E1E1E',
    'surface-light': '#2D2D2D',
    'surface-dark': '#0A0A0A',
    
    // 배경 색상
    background: '#121212',
    'background-light': '#1E1E1E',
    'background-dark': '#0A0A0A',
    
    // 텍스트 색상
    'on-primary': '#000000',
    'on-primary-darken-1': '#000000',
    'on-primary-lighten-1': '#000000',
    
    'on-secondary': '#000000',
    'on-secondary-darken-1': '#000000',
    'on-secondary-lighten-1': '#000000',
    
    'on-success': '#000000',
    'on-success-darken-1': '#000000',
    'on-success-lighten-1': '#000000',
    
    'on-warning': '#000000',
    'on-warning-darken-1': '#000000',
    'on-warning-lighten-1': '#000000',
    
    'on-error': '#000000',
    'on-error-darken-1': '#000000',
    'on-error-lighten-1': '#000000',
    
    'on-info': '#000000',
    'on-info-darken-1': '#000000',
    'on-info-lighten-1': '#000000',
    
    'on-surface': '#FFFFFF',
    'on-surface-variant': '#FFFFFF',
    'on-surface-bright': '#FFFFFF',
    'on-surface-light': '#FFFFFF',
    'on-surface-dark': '#FFFFFF',
    
    'on-background': '#FFFFFF',
    'on-background-light': '#FFFFFF',
    'on-background-dark': '#FFFFFF',
    
    // 기타 색상
    outline: '#424242',
    'outline-variant': '#616161',
    shadow: 'rgba(0, 0, 0, 0.3)',
    'shadow-light': 'rgba(0, 0, 0, 0.2)',
    'shadow-dark': 'rgba(0, 0, 0, 0.5)',
    
    // 반투명 색상
    'overlay-light': 'rgba(255, 255, 255, 0.1)',
    'overlay-dark': 'rgba(0, 0, 0, 0.7)',
    'overlay-darker': 'rgba(0, 0, 0, 0.9)',
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

// 커스텀 그림자 설정
const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// 커스텀 애니메이션 설정
const transitions = {
  // 기본 전환 시간
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // 이징 함수
  easing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
  }
};

export default createVuetify({
  components,
  directives,
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
    }
  }
});