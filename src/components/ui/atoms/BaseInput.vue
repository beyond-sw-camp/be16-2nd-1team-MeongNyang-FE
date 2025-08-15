<template>
  <div class="base-input-wrapper" :class="wrapperClass">
    <v-text-field
      :model-value="modelValue"
      :label="label"
      :placeholder="placeholder"
      :type="inputType"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :clearable="clearable"
      :density="density"
      :variant="variant"
      :color="color"
      :bg-color="bgColor"
      :rules="validationRules"
      :error-messages="errorMessages"
      :success-messages="successMessages"
      :hint="hint"
      :persistent-hint="persistentHint"
      :counter="counter"
      :maxlength="maxlength"
      :minlength="minlength"
      :autocomplete="autocomplete"
      :name="name"
      :id="inputId"
      :class="customClass"
      :prepend-icon="prependIcon"
      :append-icon="appendIcon"
      :append-inner-icon="appendInnerIcon"
      :prepend-inner-icon="prependInnerIcon"
      :hide-details="hideDetails"
      :loading="loading"
      :rounded="rounded"
      :outlined="outlined"
      :filled="filled"
      :solo="solo"
      :solo-inverted="soloInverted"
      :solo-filled="soloFilled"
      :flat="flat"
      :underlined="underlined"
      :plain="plain"
      :shaped="shaped"
      :elevation="elevation"
      :reverse="reverse"
      :tabindex="computedTabindex"
      :aria-label="computedAriaLabel"
      :aria-describedby="computedAriaDescribedby"
      :aria-invalid="hasError"
      :aria-required="required"
      :aria-errormessage="errorMessageId"
      :aria-autocomplete="ariaAutocomplete"
      :aria-expanded="ariaExpanded"
      :aria-controls="ariaControls"
      :aria-activedescendant="ariaActiveDescendant"
      :role="inputRole"
      @update:model-value="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
      @click:append="handleAppendClick"
      @click:append-inner="handleAppendInnerClick"
      @click:prepend="handlePrependClick"
      @click:prepend-inner="handlePrependInnerClick"
      @click:clear="handleClear"
    >
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>
      
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
      
      <template v-if="$slots.prepend-inner" #prepend-inner>
        <slot name="prepend-inner" />
      </template>
      
      <template v-if="$slots.append-inner" #append-inner>
        <slot name="append-inner" />
      </template>
    </v-text-field>
    
    <!-- 접근성을 위한 오류 메시지 영역 -->
    <div
      v-if="hasError && !hideDetails"
      :id="errorMessageId"
      class="base-input__error-message"
      role="alert"
      aria-live="polite"
    >
      <span class="error-icon" aria-hidden="true">⚠</span>
      {{ errorMessageText }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BaseInput',
  props: {
    // 기본 입력 속성
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text',
      validator: (value) => [
        'text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local'
      ].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    
    // 스타일링
    density: {
      type: String,
      default: 'default',
      validator: (value) => ['compact', 'comfortable', 'default'].includes(value)
    },
    variant: {
      type: String,
      default: 'outlined',
      validator: (value) => ['outlined', 'filled', 'solo', 'solo-inverted', 'solo-filled', 'flat', 'underlined', 'plain'].includes(value)
    },
    color: {
      type: String,
      default: 'primary'
    },
    bgColor: {
      type: String,
      default: undefined
    },
    rounded: {
      type: Boolean,
      default: false
    },
    shaped: {
      type: Boolean,
      default: false
    },
    elevation: {
      type: [Number, String],
      default: undefined
    },
    reverse: {
      type: Boolean,
      default: false
    },
    
    // 검증
    rules: {
      type: Array,
      default: () => []
    },
    errorMessages: {
      type: [String, Array],
      default: ''
    },
    successMessages: {
      type: [String, Array],
      default: ''
    },
    
    // 힌트 및 카운터
    hint: {
      type: String,
      default: ''
    },
    persistentHint: {
      type: Boolean,
      default: false
    },
    counter: {
      type: [Boolean, Number, String],
      default: false
    },
    maxlength: {
      type: [Number, String],
      default: undefined
    },
    minlength: {
      type: [Number, String],
      default: undefined
    },
    
    // 아이콘
    prependIcon: {
      type: String,
      default: ''
    },
    appendIcon: {
      type: String,
      default: ''
    },
    prependInnerIcon: {
      type: String,
      default: ''
    },
    appendInnerIcon: {
      type: String,
      default: ''
    },
    
    // 접근성 - 기본
    autocomplete: {
      type: String,
      default: 'off'
    },
    name: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    },
    tabindex: {
      type: [Number, String],
      default: 0
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    ariaDescribedby: {
      type: String,
      default: ''
    },
    
    // 접근성 - 고급
    ariaAutocomplete: {
      type: String,
      default: '',
      validator: (value) => ['', 'inline', 'list', 'both'].includes(value)
    },
    ariaExpanded: {
      type: Boolean,
      default: undefined
    },
    ariaControls: {
      type: String,
      default: ''
    },
    ariaActiveDescendant: {
      type: String,
      default: ''
    },
    
    // 입력 역할
    role: {
      type: String,
      default: '',
      validator: (value) => ['', 'combobox', 'searchbox', 'spinbutton'].includes(value)
    },
    
    // 기타
    hideDetails: {
      type: [Boolean, String],
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  
  emits: [
    'update:modelValue',
    'blur',
    'focus',
    'keydown',
    'click:append',
    'click:append-inner',
    'click:prepend',
    'click:prepend-inner',
    'click:clear'
  ],
  
  setup(props, { emit }) {
    const inputId = computed(() => {
      return props.id || `base-input-${Math.random().toString(36).substr(2, 9)}`
    })
    
    const errorMessageId = computed(() => {
      return `${inputId.value}-error`
    })
    
    const inputType = computed(() => {
      return props.type
    })
    
    const validationRules = computed(() => {
      const rules = [...props.rules]
      
      // 필수 필드 검증
      if (props.required) {
        rules.push(v => !!v || `${props.label || '이 필드'}는 필수입니다.`)
      }
      
      // 최소/최대 길이 검증
      if (props.minlength) {
        rules.push(v => !v || v.length >= props.minlength || `최소 ${props.minlength}자 이상 입력해주세요.`)
      }
      
      if (props.maxlength) {
        rules.push(v => !v || v.length <= props.maxlength || `최대 ${props.maxlength}자까지 입력 가능합니다.`)
      }
      
      return rules
    })
    
    const hasError = computed(() => {
      return !!props.errorMessages || (Array.isArray(props.errorMessages) && props.errorMessages.length > 0)
    })
    
    const errorMessageText = computed(() => {
      if (Array.isArray(props.errorMessages)) {
        return props.errorMessages[0] || ''
      }
      return props.errorMessages || ''
    })
    
    const wrapperClass = computed(() => {
      return {
        'base-input-wrapper--error': hasError.value,
        'base-input-wrapper--success': !!props.successMessages,
        'base-input-wrapper--disabled': props.disabled,
        'base-input-wrapper--loading': props.loading
      }
    })
    
    const computedAriaLabel = computed(() => {
      if (props.ariaLabel) {
        return props.ariaLabel
      }
      
      if (props.label) {
        return props.label
      }
      
      return ''
    })
    
    const computedAriaDescribedby = computed(() => {
      const ids = []
      
      if (props.ariaDescribedby) {
        ids.push(props.ariaDescribedby)
      }
      
      if (hasError.value) {
        ids.push(errorMessageId.value)
      }
      
      return ids.length > 0 ? ids.join(' ') : undefined
    })
    
    const computedTabindex = computed(() => {
      if (props.disabled || props.loading) {
        return -1
      }
      return props.tabindex
    })
    
    const inputRole = computed(() => {
      return props.role || undefined
    })
    
    const handleInput = (value) => {
      emit('update:modelValue', value)
    }
    
    const handleBlur = (event) => {
      emit('blur', event)
    }
    
    const handleFocus = (event) => {
      emit('focus', event)
    }
    
    const handleKeydown = (event) => {
      emit('keydown', event)
    }
    
    const handleAppendClick = (event) => {
      emit('click:append', event)
    }
    
    const handleAppendInnerClick = (event) => {
      emit('click:append-inner', event)
    }
    
    const handlePrependClick = (event) => {
      emit('click:prepend', event)
    }
    
    const handlePrependInnerClick = (event) => {
      emit('click:prepend-inner', event)
    }
    
    const handleClear = (event) => {
      emit('click:clear', event)
    }
    
    return {
      inputId,
      errorMessageId,
      inputType,
      validationRules,
      hasError,
      errorMessageText,
      wrapperClass,
      computedAriaLabel,
      computedAriaDescribedby,
      computedTabindex,
      inputRole,
      handleInput,
      handleBlur,
      handleFocus,
      handleKeydown,
      handleAppendClick,
      handleAppendInnerClick,
      handlePrependClick,
      handlePrependInnerClick,
      handleClear
    }
  }
}
</script>

<style scoped>
.base-input-wrapper {
  position: relative;
  width: 100%;
}

.v-text-field {
  transition: all 0.2s ease-in-out;
}

.v-text-field:focus-within {
  transform: translateY(-1px);
}

.v-text-field--error {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 접근성 개선 */
.v-text-field input:focus {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
}

/* 로딩 상태 스타일 */
.v-text-field--loading {
  opacity: 0.7;
  pointer-events: none;
}

/* 오류 메시지 스타일 */
.base-input__error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--v-theme-error);
  line-height: 1.4;
}

.error-icon {
  font-size: 0.875rem;
  color: var(--v-theme-error);
}

/* 상태별 래퍼 스타일 */
.base-input-wrapper--error .v-text-field {
  border-color: var(--v-theme-error);
}

.base-input-wrapper--success .v-text-field {
  border-color: var(--v-theme-success);
}

.base-input-wrapper--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.base-input-wrapper--loading {
  pointer-events: none;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .v-text-field input:focus {
    outline: 3px solid var(--v-theme-on-surface);
    outline-offset: 1px;
  }
  
  .base-input__error-message {
    font-weight: bold;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .v-text-field input:focus {
    outline-color: var(--v-theme-primary);
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .v-text-field {
    transition: none;
  }
  
  .v-text-field:focus-within {
    transform: none;
  }
  
  .v-text-field--error {
    animation: none;
  }
}
</style>
