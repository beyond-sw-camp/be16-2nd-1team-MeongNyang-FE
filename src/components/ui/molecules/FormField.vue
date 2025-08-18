<template>
  <div class="form-field" :class="fieldClass" :role="fieldRole">
    <!-- 라벨 -->
    <label
      v-if="label"
      :for="inputId"
      class="form-field__label"
      :class="{ 'form-field__label--required': required }"
      :id="labelId"
    >
      {{ label }}
      <span 
        v-if="required" 
        class="required-indicator" 
        aria-label="필수 필드"
        aria-hidden="true"
      >*</span>
    </label>
    
    <!-- 입력 필드 -->
    <BaseInput
      :id="inputId"
      :model-value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :clearable="clearable"
      :density="density"
      :variant="variant"
      :color="color"
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
      :prepend-icon="prependIcon"
      :append-icon="appendIcon"
      :append-inner-icon="appendInnerIcon"
      :prepend-inner-icon="prependInnerIcon"
      :hide-details="hideDetails"
      :loading="loading"
      :rounded="rounded"
      :shaped="shaped"
      :elevation="elevation"
      :aria-label="computedAriaLabel"
      :aria-describedby="computedAriaDescribedby"
      :aria-labelledby="labelId"
      :aria-invalid="hasError"
      :aria-required="required"
      :aria-errormessage="errorMessageId"
      :custom-class="inputClass"
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
    </BaseInput>
    
    <!-- 추가 설명 -->
    <div
      v-if="description && !hideDetails"
      class="form-field__description"
      :id="descriptionId"
      :aria-live="descriptionAriaLive"
    >
      {{ description }}
    </div>
    
    <!-- 접근성을 위한 오류 메시지 영역 -->
    <div
      v-if="hasError && !hideDetails"
      :id="errorMessageId"
      class="form-field__error-message"
      role="alert"
      aria-live="polite"
    >
      <span class="error-icon" aria-hidden="true">⚠</span>
      {{ errorMessageText }}
    </div>
    
    <!-- 접근성을 위한 성공 메시지 영역 -->
    <div
      v-if="hasSuccess && !hideDetails"
      :id="successMessageId"
      class="form-field__success-message"
      role="status"
      aria-live="polite"
    >
      <span class="success-icon" aria-hidden="true">✓</span>
      {{ successMessageText }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseInput from '../atoms/BaseInput.vue'

export default {
  name: 'FormField',
  components: {
    BaseInput
  },
  props: {
    // 기본 속성
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
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
      default: 'default'
    },
    variant: {
      type: String,
      default: 'outlined'
    },
    color: {
      type: String,
      default: 'primary'
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
    
    // 접근성
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
    ariaLabel: {
      type: String,
      default: ''
    },
    ariaDescribedby: {
      type: String,
      default: ''
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
    const fieldId = computed(() => {
      return props.id || `form-field-${Math.random().toString(36).substr(2, 9)}`
    })
    
    const inputId = computed(() => {
      return `${fieldId.value}-input`
    })
    
    const labelId = computed(() => {
      return `${fieldId.value}-label`
    })
    
    const descriptionId = computed(() => {
      return `${fieldId.value}-description`
    })
    
    const errorMessageId = computed(() => {
      return `${fieldId.value}-error`
    })
    
    const successMessageId = computed(() => {
      return `${fieldId.value}-success`
    })
    
    const fieldClass = computed(() => {
      return {
        'form-field--required': props.required,
        'form-field--disabled': props.disabled,
        'form-field--error': hasError.value,
        'form-field--success': hasSuccess.value,
        'form-field--loading': props.loading,
        [props.customClass]: !!props.customClass
      }
    })
    
    const inputClass = computed(() => {
      return 'form-field__input'
    })
    
    const validationRules = computed(() => {
      const rules = [...props.rules]
      
      // 필수 필드 검증
      if (props.required) {
        rules.push(v => !!v || `${props.label || '이 필드'}는 필수입니다.`)
      }
      
      return rules
    })
    
    const hasError = computed(() => {
      return !!props.errorMessages || (Array.isArray(props.errorMessages) && props.errorMessages.length > 0)
    })
    
    const hasSuccess = computed(() => {
      return !!props.successMessages || (Array.isArray(props.successMessages) && props.successMessages.length > 0)
    })
    
    const errorMessageText = computed(() => {
      if (Array.isArray(props.errorMessages)) {
        return props.errorMessages[0] || ''
      }
      return props.errorMessages || ''
    })
    
    const successMessageText = computed(() => {
      if (Array.isArray(props.successMessages)) {
        return props.successMessages[0] || ''
      }
      return props.successMessages || ''
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
      
      if (props.description) {
        ids.push(descriptionId.value)
      }
      
      if (hasError.value) {
        ids.push(errorMessageId.value)
      }
      
      if (hasSuccess.value) {
        ids.push(successMessageId.value)
      }
      
      return ids.length > 0 ? ids.join(' ') : undefined
    })
    
    const fieldRole = computed(() => {
      return 'group'
    })
    
    const descriptionAriaLive = computed(() => {
      return 'polite'
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
      fieldId,
      inputId,
      labelId,
      descriptionId,
      errorMessageId,
      successMessageId,
      fieldClass,
      inputClass,
      validationRules,
      hasError,
      hasSuccess,
      errorMessageText,
      successMessageText,
      computedAriaLabel,
      computedAriaDescribedby,
      fieldRole,
      descriptionAriaLive,
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
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  position: relative;
}

.form-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--v-theme-on-surface);
  line-height: 1.4;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-field__label--required {
  position: relative;
}

.required-indicator {
  color: var(--v-theme-error);
  font-weight: 600;
}

.form-field__description {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.4;
  margin-top: 4px;
}

.form-field__error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--v-theme-error);
  line-height: 1.4;
}

.form-field__success-message {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--v-theme-success);
  line-height: 1.4;
}

.error-icon {
  font-size: 0.875rem;
  color: var(--v-theme-error);
}

.success-icon {
  font-size: 0.875rem;
  color: var(--v-theme-success);
}

.form-field__input {
  width: 100%;
}

/* 상태별 스타일 */
.form-field--required .form-field__label {
  font-weight: 600;
}

.form-field--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-field--error .form-field__label {
  color: var(--v-theme-error);
}

.form-field--success .form-field__label {
  color: var(--v-theme-success);
}

.form-field--loading {
  pointer-events: none;
}

/* 접근성 개선 */
.form-field__label:focus-within {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .form-field {
    gap: 6px;
  }
  
  .form-field__label {
    font-size: 0.8125rem;
  }
  
  .form-field__description,
  .form-field__error-message,
  .form-field__success-message {
    font-size: 0.6875rem;
  }
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .form-field__label:focus-within {
    outline: 3px solid var(--v-theme-on-surface);
    outline-offset: 1px;
  }
  
  .form-field__error-message,
  .form-field__success-message {
    font-weight: bold;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .form-field__label {
    color: var(--v-theme-on-surface);
  }
  
  .form-field__description {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .form-field {
    transition: none;
  }
}
</style>
