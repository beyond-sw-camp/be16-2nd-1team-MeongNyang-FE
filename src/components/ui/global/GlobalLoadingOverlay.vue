<template>
  <v-overlay
    :model-value="modelValue"
    :persistent="persistent"
    :scrim="scrim"
    :scrim-class="scrimClass"
    :close-on-back="closeOnBack"
    :close-on-content-click="closeOnContentClick"
    :class="overlayClass"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    @update:model-value="handleUpdateModelValue"
    @click:outside="handleClickOutside"
  >
    <div class="global-loading-overlay__content">
      <!-- 로딩 스피너 -->
      <div class="global-loading-overlay__spinner">
        <v-progress-circular
          :size="spinnerSize"
          :width="spinnerWidth"
          :color="spinnerColor"
          :indeterminate="indeterminate"
          :model-value="progress"
          :rotate="rotate"
          :class="spinnerClass"
        >
          <template v-if="showProgress && !indeterminate">
            <span class="global-loading-overlay__progress-text">{{ Math.round(progress) }}%</span>
          </template>
        </v-progress-circular>
      </div>
      
      <!-- 로딩 메시지 -->
      <div v-if="message" class="global-loading-overlay__message">
        <h3 v-if="title" class="global-loading-overlay__title">{{ title }}</h3>
        <p class="global-loading-overlay__text">{{ message }}</p>
      </div>
      
      <!-- 취소 버튼 -->
      <div v-if="showCancelButton" class="global-loading-overlay__actions">
        <BaseButton
          :text="cancelText"
          :size="cancelButtonSize"
          :variant="cancelButtonVariant"
          :color="cancelButtonColor"
          :disabled="cancelDisabled"
          :loading="cancelLoading"
          @click="handleCancel"
        />
      </div>
    </div>
  </v-overlay>
</template>

<script>
import BaseButton from '../atoms/BaseButton.vue'

export default {
  name: 'GlobalLoadingOverlay',
  components: {
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
      default: '로딩 중...'
    },
    
    // 오버레이 설정
    persistent: {
      type: Boolean,
      default: true
    },
    scrim: {
      type: Boolean,
      default: true
    },
    scrimClass: {
      type: String,
      default: ''
    },
    closeOnBack: {
      type: Boolean,
      default: false
    },
    closeOnContentClick: {
      type: Boolean,
      default: false
    },
    
    // 스피너 설정
    spinnerSize: {
      type: [Number, String],
      default: 64
    },
    spinnerWidth: {
      type: [Number, String],
      default: 4
    },
    spinnerColor: {
      type: String,
      default: 'primary'
    },
    indeterminate: {
      type: Boolean,
      default: true
    },
    progress: {
      type: [Number, String],
      default: 0
    },
    rotate: {
      type: [Number, String],
      default: 0
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    
    // 취소 버튼
    showCancelButton: {
      type: Boolean,
      default: false
    },
    cancelText: {
      type: String,
      default: '취소'
    },
    cancelButtonSize: {
      type: String,
      default: 'small'
    },
    cancelButtonVariant: {
      type: String,
      default: 'outlined'
    },
    cancelButtonColor: {
      type: String,
      default: 'white'
    },
    cancelDisabled: {
      type: Boolean,
      default: false
    },
    cancelLoading: {
      type: Boolean,
      default: false
    },
    
    // 접근성
    ariaLabel: {
      type: String,
      default: '로딩 중'
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
    'cancel',
    'click:outside'
  ],
  
  computed: {
    overlayClass() {
      return {
        'global-loading-overlay': true,
        [this.customClass]: !!this.customClass
      }
    },
    
    spinnerClass() {
      return 'global-loading-overlay__spinner-element'
    }
  },
  
  methods: {
    handleUpdateModelValue(value) {
      this.$emit('update:modelValue', value)
    },
    
    handleCancel() {
      this.$emit('cancel')
    },
    
    handleClickOutside(event) {
      this.$emit('click:outside', event)
    }
  }
}
</script>

<style scoped>
.global-loading-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 32px;
  background: rgba(var(--v-theme-surface), 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  min-width: 280px;
  max-width: 400px;
  text-align: center;
}

.global-loading-overlay__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-loading-overlay__spinner-element {
  position: relative;
}

.global-loading-overlay__progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--v-theme-primary);
}

.global-loading-overlay__message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
}

.global-loading-overlay__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--v-theme-on-surface);
  line-height: 1.4;
  margin: 0;
}

.global-loading-overlay__text {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
  line-height: 1.4;
  margin: 0;
}

.global-loading-overlay__actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 접근성 */
.global-loading-overlay__content:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .global-loading-overlay__content {
    gap: 20px;
    padding: 24px;
    min-width: 240px;
    max-width: 320px;
  }
  
  .global-loading-overlay__title {
    font-size: 1rem;
  }
  
  .global-loading-overlay__text {
    font-size: 0.8125rem;
  }
}

/* 애니메이션 */
.global-loading-overlay__content {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 스피너 애니메이션 */
.global-loading-overlay__spinner-element {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
