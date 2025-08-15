<template>
  <div
    class="input-group"
    :class="groupClass"
    :role="role"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
  >
    <!-- 그룹 라벨 -->
    <label
      v-if="label"
      :for="groupId"
      class="input-group__label"
      :class="{ 'input-group__label--required': required }"
    >
      {{ label }}
      <span v-if="required" class="required-indicator" aria-label="필수 필드">*</span>
    </label>
    
    <!-- 입력 필드들 -->
    <div class="input-group__fields" :class="fieldsClass">
      <div
        v-for="(field, index) in fields"
        :key="field.id || index"
        class="input-group__field"
        :class="getFieldClass(index, field)"
      >
        <!-- 개별 필드 라벨 -->
        <label
          v-if="field.label && showIndividualLabels"
          :for="`${groupId}-${index}`"
          class="input-group__field-label"
        >
          {{ field.label }}
        </label>
        
        <!-- 입력 필드 -->
        <BaseInput
          :id="`${groupId}-${index}`"
          :model-value="field.value"
          :placeholder="field.placeholder"
          :type="field.type || 'text'"
          :disabled="field.disabled || disabled"
          :readonly="field.readonly"
          :required="field.required || required"
          :clearable="field.clearable"
          :density="field.density || density"
          :variant="field.variant || variant"
          :color="field.color || color"
          :rules="field.rules || []"
          :error-messages="field.errorMessages"
          :success-messages="field.successMessages"
          :hint="field.hint"
          :persistent-hint="field.persistentHint"
          :counter="field.counter"
          :maxlength="field.maxlength"
          :minlength="field.minlength"
          :autocomplete="field.autocomplete"
          :name="field.name"
          :prepend-icon="field.prependIcon"
          :append-icon="field.appendIcon"
          :append-inner-icon="field.appendInnerIcon"
          :prepend-inner-icon="field.prependInnerIcon"
          :hide-details="field.hideDetails || hideDetails"
          :loading="field.loading"
          :rounded="field.rounded || rounded"
          :shaped="field.shaped || shaped"
          :elevation="field.elevation || elevation"
          :aria-label="field.ariaLabel"
          :aria-describedby="field.ariaDescribedby"
          :custom-class="getInputClass(index, field)"
          @update:model-value="(value) => handleFieldInput(index, value)"
          @blur="(event) => handleFieldBlur(index, event)"
          @focus="(event) => handleFieldFocus(index, event)"
          @keydown="(event) => handleFieldKeydown(index, event)"
          @click:append="(event) => handleFieldAppendClick(index, event)"
          @click:append-inner="(event) => handleFieldAppendInnerClick(index, event)"
          @click:prepend="(event) => handleFieldPrependClick(index, event)"
          @click:prepend-inner="(event) => handleFieldPrependInnerClick(index, event)"
          @click:clear="(event) => handleFieldClear(index, event)"
        >
          <template v-if="$slots[`field-${index}-prepend`]" #prepend>
            <slot :name="`field-${index}-prepend`" :field="field" :index="index" />
          </template>
          
          <template v-if="$slots[`field-${index}-append`]" #append>
            <slot :name="`field-${index}-append`" :field="field" :index="index" />
          </template>
          
          <template v-if="$slots[`field-${index}-prepend-inner`]" #prepend-inner>
            <slot :name="`field-${index}-prepend-inner`" :field="field" :index="index" />
          </template>
          
          <template v-if="$slots[`field-${index}-append-inner`]" #append-inner>
            <slot :name="`field-${index}-append-inner`" :field="field" :index="index" />
          </template>
        </BaseInput>
      </div>
    </div>
    
    <!-- 그룹 설명 -->
    <div
      v-if="description && !hideDetails"
      class="input-group__description"
      :id="`${groupId}-description`"
    >
      {{ description }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseInput from '../atoms/BaseInput.vue'

export default {
  name: 'InputGroup',
  components: {
    BaseInput
  },
  props: {
    // 기본 속성
    label: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 필드 배열
    fields: {
      type: Array,
      required: true,
      validator: (fields) => {
        return fields.every(field => 
          typeof field === 'object' && 
          (field.type || field.placeholder || field.label)
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
      default: 16
    },
    
    // 라벨 표시
    showIndividualLabels: {
      type: Boolean,
      default: false
    },
    
    // 기본 필드 속성 (개별 필드에서 오버라이드 가능)
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
    
    // 스타일링
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
    
    // 기타
    hideDetails: {
      type: [Boolean, String],
      default: false
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  
  emits: [
    'field-input',
    'field-blur',
    'field-focus',
    'field-keydown',
    'field-append-click',
    'field-append-inner-click',
    'field-prepend-click',
    'field-prepend-inner-click',
    'field-clear'
  ],
  
  setup(props, { emit }) {
    const groupId = computed(() => {
      return `input-group-${Math.random().toString(36).substr(2, 9)}`
    })
    
    const groupClass = computed(() => {
      return {
        [`input-group--${props.direction}`]: true,
        [`input-group--${props.alignment}`]: true,
        'input-group--wrap': props.wrap,
        'input-group--border': props.border,
        'input-group--shadow': props.shadow,
        'input-group--required': props.required,
        'input-group--disabled': props.disabled,
        [props.customClass]: !!props.customClass
      }
    })
    
    const fieldsClass = computed(() => {
      return {
        [`input-group__fields--${props.direction}`]: true,
        [`input-group__fields--${props.alignment}`]: true,
        'input-group__fields--wrap': props.wrap
      }
    })
    
    const getFieldClass = (index, field) => {
      const classes = ['input-group__field']
      
      // 첫 번째 필드
      if (index === 0) {
        classes.push('input-group__field--first')
      }
      
      // 마지막 필드
      if (index === props.fields.length - 1) {
        classes.push('input-group__field--last')
      }
      
      // 중간 필드들
      if (index > 0 && index < props.fields.length - 1) {
        classes.push('input-group__field--middle')
      }
      
      // 개별 필드 클래스
      if (field.class) {
        classes.push(field.class)
      }
      
      return classes.join(' ')
    }
    
    const getInputClass = (index, field) => {
      return 'input-group__input'
    }
    
    const handleFieldInput = (index, value) => {
      emit('field-input', { index, value, field: props.fields[index] })
    }
    
    const handleFieldBlur = (index, event) => {
      emit('field-blur', { index, event, field: props.fields[index] })
    }
    
    const handleFieldFocus = (index, event) => {
      emit('field-focus', { index, event, field: props.fields[index] })
    }
    
    const handleFieldKeydown = (index, event) => {
      emit('field-keydown', { index, event, field: props.fields[index] })
    }
    
    const handleFieldAppendClick = (index, event) => {
      emit('field-append-click', { index, event, field: props.fields[index] })
    }
    
    const handleFieldAppendInnerClick = (index, event) => {
      emit('field-append-inner-click', { index, event, field: props.fields[index] })
    }
    
    const handleFieldPrependClick = (index, event) => {
      emit('field-prepend-click', { index, event, field: props.fields[index] })
    }
    
    const handleFieldPrependInnerClick = (index, event) => {
      emit('field-prepend-inner-click', { index, event, field: props.fields[index] })
    }
    
    const handleFieldClear = (index, event) => {
      emit('field-clear', { index, event, field: props.fields[index] })
    }
    
    return {
      groupId,
      groupClass,
      fieldsClass,
      getFieldClass,
      getInputClass,
      handleFieldInput,
      handleFieldBlur,
      handleFieldFocus,
      handleFieldKeydown,
      handleFieldAppendClick,
      handleFieldAppendInnerClick,
      handleFieldPrependClick,
      handleFieldPrependInnerClick,
      handleFieldClear
    }
  }
}
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.input-group__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--v-theme-on-surface);
  line-height: 1.4;
  cursor: pointer;
}

.input-group__label--required {
  position: relative;
}

.required-indicator {
  color: var(--v-theme-error);
  margin-left: 4px;
  font-weight: 600;
}

.input-group__fields {
  display: flex;
  align-items: flex-start;
  gap: v-bind(gap + 'px');
  width: 100%;
}

/* 방향 */
.input-group__fields--horizontal {
  flex-direction: row;
}

.input-group__fields--vertical {
  flex-direction: column;
}

/* 정렬 */
.input-group__fields--start {
  justify-content: flex-start;
}

.input-group__fields--center {
  justify-content: center;
}

.input-group__fields--end {
  justify-content: flex-end;
}

.input-group__fields--space-between {
  justify-content: space-between;
}

.input-group__fields--space-around {
  justify-content: space-around;
}

/* 줄바꿈 */
.input-group__fields--wrap {
  flex-wrap: wrap;
}

.input-group__field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group__fields--vertical .input-group__field {
  width: 100%;
}

.input-group__field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--v-theme-on-surface);
  line-height: 1.4;
}

.input-group__input {
  width: 100%;
}

.input-group__description {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.4;
  margin-top: 4px;
}

/* 스타일링 */
.input-group--border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  padding: 16px;
}

.input-group--shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 16px;
}

/* 상태별 스타일 */
.input-group--required .input-group__label {
  font-weight: 600;
}

.input-group--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 접근성 */
.input-group:focus-within {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
  border-radius: 8px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .input-group {
    gap: 8px;
  }
  
  .input-group__fields {
    gap: 12px;
  }
  
  .input-group__label {
    font-size: 0.8125rem;
  }
  
  .input-group__field-label {
    font-size: 0.6875rem;
  }
  
  .input-group__description {
    font-size: 0.6875rem;
  }
  
  .input-group--border,
  .input-group--shadow {
    padding: 12px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .input-group__label,
  .input-group__field-label {
    color: var(--v-theme-on-surface);
  }
  
  .input-group__description {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }
  
  .input-group--border {
    border-color: rgba(var(--v-theme-on-surface), 0.24);
  }
}

/* 애니메이션 */
.input-group__field {
  transition: all 0.2s ease-in-out;
}

.input-group__field:hover {
  transform: translateY(-1px);
}
</style>
