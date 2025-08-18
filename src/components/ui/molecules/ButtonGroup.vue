<template>
  <div
    class="button-group"
    :class="groupClass"
    :role="role"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
  >
    <BaseButton
      v-for="(button, index) in buttons"
      :key="button.id || index"
      :text="button.text"
      :color="button.color || color"
      :variant="button.variant || variant"
      :size="button.size || size"
      :disabled="button.disabled || disabled"
      :loading="button.loading"
      :block="button.block || block"
      :rounded="button.rounded || rounded"
      :elevation="button.elevation || elevation"
      :icon="button.icon"
      :trailing-icon="button.trailingIcon"
      :icon-size="button.iconSize || iconSize"
      :aria-label="button.ariaLabel"
      :aria-describedby="button.ariaDescribedby"
      :custom-class="getButtonClass(index, button)"
      @click="handleButtonClick(button, index, $event)"
    >
      <template v-if="$slots.default">
        <slot :button="button" :index="index" />
      </template>
    </BaseButton>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseButton from '../atoms/BaseButton.vue'

export default {
  name: 'ButtonGroup',
  components: {
    BaseButton
  },
  props: {
    // 버튼 그룹 속성
    buttons: {
      type: Array,
      required: true,
      validator: (buttons) => {
        return buttons.every(button => 
          typeof button === 'object' && 
          (button.text || button.icon || button.slot)
        )
      }
    },
    
    // 레이아웃
    direction: {
      type: String,
      default: 'horizontal',
      validator: (value) => ['horizontal', 'vertical'].includes(value)
    },
    alignment: {
      type: String,
      default: 'start',
      validator: (value) => ['start', 'center', 'end', 'space-between', 'space-around'].includes(value)
    },
    wrap: {
      type: Boolean,
      default: false
    },
    gap: {
      type: [Number, String],
      default: 8
    },
    
    // 기본 버튼 속성 (개별 버튼에서 오버라이드 가능)
    color: {
      type: String,
      default: 'primary'
    },
    variant: {
      type: String,
      default: 'elevated'
    },
    size: {
      type: String,
      default: 'default'
    },
    disabled: {
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
    iconSize: {
      type: [String, Number],
      default: 'small'
    },
    
    // 스타일링
    density: {
      type: String,
      default: 'default',
      validator: (value) => ['compact', 'comfortable', 'default'].includes(value)
    },
    border: {
      type: Boolean,
      default: false
    },
    shadow: {
      type: Boolean,
      default: false
    },
    
    // 접근성
    role: {
      type: String,
      default: 'group'
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    ariaDescribedby: {
      type: String,
      default: ''
    },
    
    // 커스텀 스타일
    customClass: {
      type: String,
      default: ''
    }
  },
  
  emits: ['button-click', 'button-click:index'],
  
  setup(props, { emit }) {
    const groupClass = computed(() => {
      return {
        [`button-group--${props.direction}`]: true,
        [`button-group--${props.alignment}`]: true,
        [`button-group--${props.density}`]: true,
        'button-group--wrap': props.wrap,
        'button-group--border': props.border,
        'button-group--shadow': props.shadow,
        [props.customClass]: !!props.customClass
      }
    })
    
    const getButtonClass = (index, button) => {
      const classes = ['button-group__button']
      
      // 첫 번째 버튼
      if (index === 0) {
        classes.push('button-group__button--first')
      }
      
      // 마지막 버튼
      if (index === props.buttons.length - 1) {
        classes.push('button-group__button--last')
      }
      
      // 중간 버튼들
      if (index > 0 && index < props.buttons.length - 1) {
        classes.push('button-group__button--middle')
      }
      
      // 개별 버튼 클래스
      if (button.class) {
        classes.push(button.class)
      }
      
      return classes.join(' ')
    }
    
    const handleButtonClick = (button, index, event) => {
      emit('button-click', { button, index, event })
      emit(`button-click:${index}`, { button, index, event })
    }
    
    return {
      groupClass,
      getButtonClass,
      handleButtonClick
    }
  }
}
</script>

<style scoped>
.button-group {
  display: flex;
  align-items: center;
  gap: v-bind(gap + 'px');
  width: 100%;
}

/* 방향 */
.button-group--horizontal {
  flex-direction: row;
}

.button-group--vertical {
  flex-direction: column;
}

/* 정렬 */
.button-group--start {
  justify-content: flex-start;
}

.button-group--center {
  justify-content: center;
}

.button-group--end {
  justify-content: flex-end;
}

.button-group--space-between {
  justify-content: space-between;
}

.button-group--space-around {
  justify-content: space-around;
}

/* 줄바꿈 */
.button-group--wrap {
  flex-wrap: wrap;
}

/* 밀도 */
.button-group--compact {
  gap: 4px;
}

.button-group--comfortable {
  gap: 12px;
}

.button-group--default {
  gap: 8px;
}

/* 스타일링 */
.button-group--border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  padding: 8px;
}

.button-group--shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px;
}

/* 버튼 스타일 */
.button-group__button {
  flex: 1;
  min-width: 0;
}

.button-group--vertical .button-group__button {
  width: 100%;
}

/* 버튼 위치별 스타일 */
.button-group__button--first {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.button-group__button--middle {
  border-radius: 0;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.button-group__button--last {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* 수직 방향일 때 */
.button-group--vertical .button-group__button--first {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.button-group--vertical .button-group__button--middle {
  border-radius: 0;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.button-group--vertical .button-group__button--last {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* 접근성 */
.button-group:focus-within {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
  border-radius: 8px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .button-group {
    gap: 6px;
  }
  
  .button-group--wrap {
    gap: 4px;
  }
  
  .button-group--border,
  .button-group--shadow {
    padding: 6px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .button-group--border {
    border-color: rgba(var(--v-theme-on-surface), 0.24);
  }
  
  .button-group__button--middle,
  .button-group__button--last,
  .button-group--vertical .button-group__button--middle,
  .button-group--vertical .button-group__button--last {
    border-color: rgba(var(--v-theme-on-surface), 0.24);
  }
}

/* 애니메이션 */
.button-group__button {
  transition: all 0.2s ease-in-out;
}

.button-group__button:hover {
  transform: translateY(-1px);
  z-index: 1;
}
</style>
