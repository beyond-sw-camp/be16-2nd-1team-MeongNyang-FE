<template>
  <v-icon
    :icon="icon"
    :size="size"
    :color="color"
    :class="customClass"
    :disabled="disabled"
    :start="start"
    :end="end"
    :left="left"
    :right="right"
    :aria-label="computedAriaLabel"
    :aria-hidden="computedAriaHidden"
    :aria-describedby="ariaDescribedby"
    :aria-expanded="ariaExpanded"
    :aria-pressed="ariaPressed"
    :aria-haspopup="ariaHasPopup"
    :aria-controls="ariaControls"
    :aria-live="ariaLive"
    :role="iconRole"
    :tabindex="computedTabindex"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    @keydown.escape="handleEscape"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BaseIcon',
  props: {
    // 기본 아이콘 속성
    icon: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      default: 'default',
      validator: (value) => {
        if (typeof value === 'string') {
          return ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
        }
        return typeof value === 'number' && value > 0
      }
    },
    color: {
      type: String,
      default: 'inherit'
    },
    
    // 위치
    start: {
      type: Boolean,
      default: false
    },
    end: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    
    // 상태
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 접근성 - 기본
    ariaLabel: {
      type: String,
      default: ''
    },
    ariaHidden: {
      type: Boolean,
      default: false
    },
    ariaDescribedby: {
      type: String,
      default: ''
    },
    tabindex: {
      type: [Number, String],
      default: undefined
    },
    
    // 접근성 - 고급
    ariaExpanded: {
      type: Boolean,
      default: undefined
    },
    ariaPressed: {
      type: Boolean,
      default: undefined
    },
    ariaHasPopup: {
      type: [Boolean, String],
      default: undefined
    },
    ariaControls: {
      type: String,
      default: ''
    },
    ariaLive: {
      type: String,
      default: '',
      validator: (value) => ['', 'polite', 'assertive', 'off'].includes(value)
    },
    
    // 아이콘 역할
    role: {
      type: String,
      default: '',
      validator: (value) => ['', 'button', 'menuitem', 'tab', 'option', 'img'].includes(value)
    },
    
    // 커스텀 스타일
    customClass: {
      type: String,
      default: ''
    }
  },
  
  emits: ['click', 'focus', 'blur', 'escape'],
  
  setup(props, { emit }) {
    const isClickable = computed(() => {
      return props.tabindex !== undefined && props.tabindex !== -1
    })
    
    const computedAriaLabel = computed(() => {
      // aria-label이 명시적으로 제공된 경우 사용
      if (props.ariaLabel) {
        return props.ariaLabel
      }
      
      // 클릭 가능한 아이콘인 경우 기본 설명 제공
      if (isClickable.value && !props.disabled) {
        return `${props.icon} 아이콘`
      }
      
      return ''
    })
    
    const computedAriaHidden = computed(() => {
      // 명시적으로 aria-hidden이 설정된 경우
      if (props.ariaHidden) {
        return true
      }
      
      // 클릭 가능한 아이콘이 아니고 설명이 없는 경우 숨김
      if (!isClickable.value && !props.ariaLabel) {
        return true
      }
      
      return false
    })
    
    const computedTabindex = computed(() => {
      if (props.disabled) {
        return -1
      }
      
      if (props.tabindex !== undefined) {
        return props.tabindex
      }
      
      // 클릭 가능한 아이콘인 경우 기본값
      if (isClickable.value) {
        return 0
      }
      
      return undefined
    })
    
    const iconRole = computed(() => {
      if (props.role) {
        return props.role
      }
      
      // 클릭 가능한 아이콘인 경우 기본 역할
      if (isClickable.value && !props.disabled) {
        return 'button'
      }
      
      return undefined
    })
    
    const handleClick = (event) => {
      if (isClickable.value && !props.disabled) {
        emit('click', event)
      }
    }
    
    const handleEscape = (event) => {
      emit('escape', event)
    }
    
    const handleFocus = (event) => {
      emit('focus', event)
    }
    
    const handleBlur = (event) => {
      emit('blur', event)
    }
    
    return {
      isClickable,
      computedAriaLabel,
      computedAriaHidden,
      computedTabindex,
      iconRole,
      handleClick,
      handleEscape,
      handleFocus,
      handleBlur
    }
  }
}
</script>

<style scoped>
.v-icon {
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.v-icon:not(.v-icon--disabled):hover {
  transform: scale(1.1);
}

/* 포커스 표시 개선 */
.v-icon:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
  border-radius: 4px;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1);
}

/* 키보드 포커스 시 시각적 피드백 */
.v-icon:focus-visible::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: 4px;
  pointer-events: none;
}

.v-icon--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* 클릭 가능한 아이콘 */
.v-icon[tabindex]:not([tabindex="-1"]) {
  cursor: pointer;
  border-radius: 4px;
}

.v-icon[tabindex]:not([tabindex="-1"]):hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

/* 애니메이션 효과 */
.v-icon--animated {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 색상 변형 */
.v-icon--success {
  color: var(--v-theme-success);
}

.v-icon--warning {
  color: var(--v-theme-warning);
}

.v-icon--error {
  color: var(--v-theme-error);
}

.v-icon--info {
  color: var(--v-theme-info);
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .v-icon:focus-visible {
    outline: 3px solid var(--v-theme-on-surface);
    outline-offset: 1px;
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .v-icon {
    transition: none;
  }
  
  .v-icon:hover {
    transform: none;
  }
  
  .v-icon--animated {
    animation: none;
  }
}
</style>
