<template>
  <v-snackbar
    :model-value="modelValue"
    :timeout="timeout"
    :color="getSnackbarColor"
    :location="location"
    :elevation="elevation"
    :rounded="rounded"
    :shaped="shaped"
    :flat="flat"
    :outlined="outlined"
    :text="text"
    :class="customClass"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    @update:model-value="handleUpdateModelValue"
  >
    <div class="global-snackbar__content">
      <!-- 아이콘 -->
      <BaseIcon
        v-if="icon || getDefaultIcon(type)"
        :icon="icon || getDefaultIcon(type)"
        :size="iconSize"
        :color="iconColor"
        class="global-snackbar__icon"
      />
      
      <!-- 메시지 -->
      <div class="global-snackbar__message">
        <div v-if="title" class="global-snackbar__title">{{ title }}</div>
        <div class="global-snackbar__text">{{ message }}</div>
      </div>
      
      <!-- 액션 버튼 -->
      <div v-if="actions && actions.length > 0" class="global-snackbar__actions">
        <BaseButton
          v-for="(action, index) in actions"
          :key="index"
          :text="action.text"
          :icon="action.icon"
          :size="actionButtonSize"
          :variant="action.variant || 'text'"
          :color="action.color || 'white'"
          :disabled="action.disabled"
          :loading="action.loading"
          @click="handleAction(action, index)"
        />
      </div>
    </div>
    
    <!-- 닫기 버튼 -->
    <template #actions>
      <v-btn
        v-if="showCloseButton"
        :icon="closeIcon"
        :size="closeButtonSize"
        variant="text"
        color="white"
        :aria-label="closeButtonAriaLabel"
        class="snackbar-close-btn"
        @click="handleClose"
      />
    </template>
  </v-snackbar>
</template>

<script>
import BaseIcon from '../atoms/BaseIcon.vue'
import BaseButton from '../atoms/BaseButton.vue'

export default {
  name: 'GlobalSnackbar',
  components: {
    BaseIcon,
    BaseButton
  },
  props: {
    // 기본 속성
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    },
    
    // 스낵바 설정
    timeout: {
      type: [Number, String],
      default: 4000
    },
    location: {
      type: String,
      default: 'bottom',
      validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
    },
    elevation: {
      type: [Number, String],
      default: 6
    },
    rounded: {
      type: [Boolean, String],
      default: 'lg'
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
    text: {
      type: Boolean,
      default: false
    },
    
    // 스타일링
    color: {
      type: String,
      default: undefined
    },
    iconSize: {
      type: [String, Number],
      default: 'small'
    },
    iconColor: {
      type: String,
      default: 'white'
    },
    
    // 액션 버튼
    actions: {
      type: Array,
      default: () => []
    },
    actionButtonSize: {
      type: String,
      default: 'small'
    },
    
    // 닫기 버튼
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeIcon: {
      type: String,
      default: 'mdi-close'
    },
    closeButtonSize: {
      type: String,
      default: 'small'
    },
    closeButtonVariant: {
      type: String,
      default: 'text'
    },
    closeButtonColor: {
      type: String,
      default: 'white'
    },
    closeButtonAriaLabel: {
      type: String,
      default: '알림 닫기'
    },
    
    // 접근성
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
  
  emits: [
    'update:modelValue',
    'close',
    'action'
  ],
  
  computed: {
    getSnackbarColor() {
      // color prop이 명시적으로 설정된 경우 우선 사용
      if (this.color) {
        return this.color
      }
      
      // type에 따라 기본 색상 반환
      const colors = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
      }
      return colors[this.type] || 'info'
    }
  },
  
  methods: {
    getDefaultIcon(type) {
      const icons = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information'
      }
      return icons[type] || icons.info
    },
    
    handleUpdateModelValue(value) {
      this.$emit('update:modelValue', value)
    },
    
    handleClose() {
      this.$emit('close')
      this.$emit('update:modelValue', false)
    },
    
    handleAction(action, index) {
      this.$emit('action', { action, index })
    }
  }
}
</script>

<style scoped>
.global-snackbar__content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.global-snackbar__icon {
  flex-shrink: 0;
}

.global-snackbar__message {
  flex: 1;
  min-width: 0;
}

.global-snackbar__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: inherit;
  line-height: 1.4;
  margin-bottom: 2px;
}

.global-snackbar__text {
  font-size: 0.8125rem;
  color: inherit;
  line-height: 1.4;
  opacity: 0.9;
  white-space: pre-line;
}

.global-snackbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 접근성 */
.global-snackbar__content:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .global-snackbar__content {
    gap: 8px;
  }
  
  .global-snackbar__title {
    font-size: 0.8125rem;
  }
  
  .global-snackbar__text {
    font-size: 0.75rem;
  }
  
  .global-snackbar__actions {
    gap: 4px;
  }
}

/* 닫기 버튼 스타일 */
.snackbar-close-btn {
  background: transparent !important;
  box-shadow: none !important;
  cursor: pointer !important;
}

.snackbar-close-btn:hover {
  background: transparent !important;
  cursor: pointer !important;
}

.snackbar-close-btn:focus {
  background: transparent !important;
  cursor: pointer !important;
}

/* 애니메이션 */
.global-snackbar__content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
