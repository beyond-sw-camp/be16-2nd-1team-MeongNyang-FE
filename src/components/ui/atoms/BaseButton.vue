<template>
  <v-btn
    :color="color"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :rounded="rounded"
    :elevation="elevation"
    :class="customClass"
    :role="buttonRole"
    :aria-label="computedAriaLabel"
    :aria-describedby="ariaDescribedby"
    :aria-expanded="ariaExpanded"
    :aria-pressed="ariaPressed"
    :aria-haspopup="ariaHasPopup"
    :aria-controls="ariaControls"
    :aria-live="ariaLive"
    :tabindex="computedTabindex"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    @keydown.escape="handleEscape"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <v-icon
      v-if="icon && !loading"
      :icon="icon"
      :size="iconSize"
      class="me-2"
      :aria-hidden="true"
    />
    
    <v-progress-circular
      v-if="loading"
      indeterminate
      :size="iconSize"
      :width="2"
      class="me-2"
      :aria-hidden="true"
    />
    
    <slot>{{ text }}</slot>
    
    <v-icon
      v-if="trailingIcon && !loading"
      :icon="trailingIcon"
      :size="iconSize"
      class="ms-2"
      :aria-hidden="true"
    />
  </v-btn>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BaseButton',
  props: {
    // 기본 버튼 속성
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'primary'
    },
    variant: {
      type: String,
      default: 'elevated',
      validator: (value) => ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    },
    elevation: {
      type: [Number, String],
      default: undefined
    },
    
    // 아이콘 관련
    icon: {
      type: String,
      default: ''
    },
    trailingIcon: {
      type: String,
      default: ''
    },
    iconSize: {
      type: [String, Number],
      default: 'small'
    },
    
    // 접근성 - 기본
    ariaLabel: {
      type: String,
      default: ''
    },
    ariaDescribedby: {
      type: String,
      default: ''
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
    
    // 버튼 역할
    role: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'menuitem', 'tab', 'option'].includes(value)
    },
    
    // 커스텀 스타일
    customClass: {
      type: String,
      default: ''
    }
  },
  
  emits: ['click', 'focus', 'blur', 'escape'],
  
  setup(props, { emit }) {
    const computedAriaLabel = computed(() => {
      // aria-label이 명시적으로 제공된 경우 사용
      if (props.ariaLabel) {
        return props.ariaLabel
      }
      
      // 텍스트가 있는 경우 텍스트 사용
      if (props.text) {
        return props.text
      }
      
      // 슬롯 내용이 있는 경우 슬롯 내용 사용
      // (이 부분은 템플릿에서 처리)
      
      // 아이콘만 있는 경우 아이콘 설명
      if (props.icon && !props.text) {
        return `${props.icon} 버튼`
      }
      
      return ''
    })
    
    const computedTabindex = computed(() => {
      if (props.disabled || props.loading) {
        return -1
      }
      return 0
    })
    
    const buttonRole = computed(() => {
      return props.role
    })
    
    const handleClick = (event) => {
      if (!props.disabled && !props.loading) {
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
      computedAriaLabel,
      computedTabindex,
      buttonRole,
      handleClick,
      handleEscape,
      handleFocus,
      handleBlur
    }
  }
}
</script>

<style scoped>
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: none;
  overflow: hidden;
}

.v-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.v-btn:hover::before {
  left: 100%;
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

/* 포커스 표시 개선 */
.v-btn:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1);
}

/* 키보드 포커스 시 시각적 피드백 */
.v-btn:focus-visible::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: inherit;
  pointer-events: none;
}

/* 비활성화 상태 */
.v-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  pointer-events: none;
}

/* 로딩 상태 */
.v-btn--loading {
  cursor: wait;
}

.v-btn--loading .v-btn__content {
  opacity: 0;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .v-btn:focus-visible {
    outline: 3px solid var(--v-theme-on-surface);
    outline-offset: 1px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .v-btn:focus-visible {
    outline-color: var(--v-theme-primary);
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .v-btn {
    transition: none;
  }
  
  .v-btn:hover {
    transform: none;
  }
}
</style>
