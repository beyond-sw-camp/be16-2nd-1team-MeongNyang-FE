<template>
  <v-card
    :elevation="elevation"
    :rounded="rounded"
    :shaped="shaped"
    :flat="flat"
    :outlined="outlined"
    :color="color"
    :class="customClass"
    :loading="loading"
    :disabled="disabled"
    :ripple="ripple"
    :link="link"
    :to="to"
    :href="href"
    :target="target"
    :rel="rel"
    :role="cardRole"
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
    <!-- 로딩 오버레이 -->
    <template v-if="loading" #loader>
      <v-progress-linear
        :color="loadingColor"
        :indeterminate="loadingIndeterminate"
        :model-value="loadingProgress"
        height="4"
        :aria-label="loadingAriaLabel"
        role="progressbar"
      />
    </template>
    
    <!-- 카드 헤더 -->
    <v-card-title 
      v-if="$slots.header || title" 
      class="d-flex align-center"
      :id="headerId"
    >
      <slot name="header">
        <span class="text-h6">{{ title }}</span>
      </slot>
    </v-card-title>
    
    <!-- 카드 서브타이틀 -->
    <v-card-subtitle 
      v-if="$slots.subtitle || subtitle"
      :id="subtitleId"
    >
      <slot name="subtitle">
        {{ subtitle }}
      </slot>
    </v-card-subtitle>
    
    <!-- 카드 내용 -->
    <v-card-text 
      v-if="$slots.default || content" 
      class="pa-4"
      :id="contentId"
    >
      <slot>{{ content }}</slot>
    </v-card-text>
    
    <!-- 카드 액션 -->
    <v-card-actions 
      v-if="$slots.actions" 
      class="pa-4 pt-0"
      :id="actionsId"
    >
      <slot name="actions" />
    </v-card-actions>
    
    <!-- 카드 푸터 -->
    <v-card-footer 
      v-if="$slots.footer" 
      class="pa-4 pt-0"
      :id="footerId"
    >
      <slot name="footer" />
    </v-card-footer>
  </v-card>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BaseCard',
  props: {
    // 기본 카드 속성
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    
    // 스타일링
    elevation: {
      type: [Number, String],
      default: 1
    },
    rounded: {
      type: [Boolean, String],
      default: false
    },
    shaped: {
      type: Boolean,
      default: false
    },
    flat: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: undefined
    },
    
    // 상태
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    ripple: {
      type: Boolean,
      default: true
    },
    
    // 로딩 관련
    loadingColor: {
      type: String,
      default: 'primary'
    },
    loadingIndeterminate: {
      type: Boolean,
      default: true
    },
    loadingProgress: {
      type: [Number, String],
      default: 0
    },
    
    // 링크 관련
    link: {
      type: Boolean,
      default: false
    },
    to: {
      type: [String, Object],
      default: undefined
    },
    href: {
      type: String,
      default: undefined
    },
    target: {
      type: String,
      default: undefined
    },
    rel: {
      type: String,
      default: undefined
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
    
    // 카드 역할
    role: {
      type: String,
      default: '',
      validator: (value) => ['', 'article', 'region', 'button', 'link', 'tab', 'menuitem'].includes(value)
    },
    
    // 커스텀 스타일
    customClass: {
      type: String,
      default: ''
    }
  },
  
  emits: ['click', 'focus', 'blur', 'escape'],
  
  setup(props, { emit }) {
    const cardId = computed(() => {
      return `base-card-${Math.random().toString(36).substr(2, 9)}`
    })
    
    const headerId = computed(() => {
      return `${cardId.value}-header`
    })
    
    const subtitleId = computed(() => {
      return `${cardId.value}-subtitle`
    })
    
    const contentId = computed(() => {
      return `${cardId.value}-content`
    })
    
    const actionsId = computed(() => {
      return `${cardId.value}-actions`
    })
    
    const footerId = computed(() => {
      return `${cardId.value}-footer`
    })
    
    const isClickable = computed(() => {
      return props.link || props.to || props.href || props.$listeners?.click
    })
    
    const computedAriaLabel = computed(() => {
      if (props.ariaLabel) {
        return props.ariaLabel
      }
      
      if (props.title) {
        return props.title
      }
      
      if (isClickable.value) {
        return '클릭 가능한 카드'
      }
      
      return ''
    })
    
    const computedTabindex = computed(() => {
      if (props.disabled || props.loading) {
        return -1
      }
      
      if (isClickable.value) {
        return 0
      }
      
      return undefined
    })
    
    const cardRole = computed(() => {
      if (props.role) {
        return props.role
      }
      
      if (isClickable.value) {
        return 'button'
      }
      
      return 'article'
    })
    
    const loadingAriaLabel = computed(() => {
      return '카드 로딩 중'
    })
    
    const handleClick = (event) => {
      if (isClickable.value && !props.disabled && !props.loading) {
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
      cardId,
      headerId,
      subtitleId,
      contentId,
      actionsId,
      footerId,
      isClickable,
      computedAriaLabel,
      computedTabindex,
      cardRole,
      loadingAriaLabel,
      handleClick,
      handleEscape,
      handleFocus,
      handleBlur
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.v-card:not(.v-card--disabled):hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15), 0 8px 16px rgba(15, 23, 42, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

/* 포커스 표시 개선 */
.v-card:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1);
}

/* 키보드 포커스 시 시각적 피드백 */
.v-card:focus-visible::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: 8px;
  pointer-events: none;
}

.v-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.v-card--loading {
  pointer-events: none;
}

/* 클릭 가능한 카드 */
.v-card--link {
  cursor: pointer;
}

.v-card--link:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}

/* 카드 헤더 스타일 */
.v-card-title {
  font-weight: 600;
  line-height: 1.4;
}

.v-card-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.875rem;
  line-height: 1.4;
}

/* 카드 내용 스타일 */
.v-card-text {
  line-height: 1.6;
}

/* 카드 액션 스타일 */
.v-card-actions {
  gap: 8px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .v-card {
    margin: 8px;
  }
  
  .v-card-title {
    font-size: 1.125rem;
  }
  
  .v-card-text {
    padding: 16px;
  }
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .v-card:focus-visible {
    outline: 3px solid var(--v-theme-on-surface);
    outline-offset: 1px;
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .v-card {
    transition: none;
  }
  
  .v-card:hover {
    transform: none;
  }
}
</style>
