<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :fullscreen="fullscreen"
    :persistent="persistent"
    :retain-focus="retainFocus"
    :scrollable="scrollable"
    :eager="eager"
    :transition="transition"
    :overlay-color="overlayColor"
    :overlay-opacity="overlayOpacity"
    :close-on-back="closeOnBack"
    :close-on-content-click="closeOnContentClick"
    :class="customClass"
    @update:model-value="handleUpdateModelValue"
    @click:outside="handleClickOutside"
    @keydown.esc="handleEscapeKey"
  >
    <BaseCard
      :elevation="cardElevation"
      :rounded="cardRounded"
      :shaped="cardShaped"
      :color="cardColor"
      :loading="loading"
      :disabled="disabled"
      :custom-class="cardClass"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
    >
      <!-- 헤더 -->
      <template #header>
        <div class="modal-dialog__header">
          <div class="modal-dialog__title-section">
            <BaseIcon
              v-if="icon"
              :icon="icon"
              :size="iconSize"
              :color="iconColor"
              class="modal-dialog__icon"
            />
            <h2 class="modal-dialog__title">{{ title }}</h2>
          </div>
          
          <BaseButton
            v-if="showCloseButton"
            :icon="closeIcon"
            :size="closeButtonSize"
            :variant="closeButtonVariant"
            :color="closeButtonColor"
            :aria-label="closeButtonAriaLabel"
            class="modal-dialog__close-button"
            @click="handleClose"
          />
        </div>
      </template>
      
      <!-- 내용 -->
      <div class="modal-dialog__content">
        <slot>{{ content }}</slot>
      </div>
      
      <!-- 액션 -->
      <template #actions>
        <div class="modal-dialog__actions">
          <slot name="actions">
            <BaseButton
              v-if="showCancelButton"
              :text="cancelText"
              :color="cancelColor"
              :variant="cancelVariant"
              :size="buttonSize"
              :disabled="cancelDisabled || disabled"
              :loading="cancelLoading"
              @click="handleCancel"
            />
            
            <BaseButton
              v-if="showConfirmButton"
              :text="confirmText"
              :color="confirmColor"
              :variant="confirmVariant"
              :size="buttonSize"
              :disabled="confirmDisabled || disabled"
              :loading="confirmLoading"
              @click="handleConfirm"
            />
          </slot>
        </div>
      </template>
    </BaseCard>
  </v-dialog>
</template>

<script>
import BaseCard from '../atoms/BaseCard.vue'
import BaseButton from '../atoms/BaseButton.vue'
import BaseIcon from '../atoms/BaseIcon.vue'

export default {
  name: 'ModalDialog',
  components: {
    BaseCard,
    BaseButton,
    BaseIcon
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
    content: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    
    // 다이얼로그 설정
    maxWidth: {
      type: [String, Number],
      default: 500
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false
    },
    retainFocus: {
      type: Boolean,
      default: true
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    eager: {
      type: Boolean,
      default: false
    },
    transition: {
      type: String,
      default: 'dialog-bottom-transition'
    },
    overlayColor: {
      type: String,
      default: undefined
    },
    overlayOpacity: {
      type: [Number, String],
      default: undefined
    },
    closeOnBack: {
      type: Boolean,
      default: true
    },
    closeOnContentClick: {
      type: Boolean,
      default: false
    },
    
    // 카드 스타일링
    cardElevation: {
      type: [Number, String],
      default: 24
    },
    cardRounded: {
      type: [Boolean, String],
      default: 'lg'
    },
    cardShaped: {
      type: Boolean,
      default: false
    },
    cardColor: {
      type: String,
      default: undefined
    },
    
    // 헤더 설정
    iconSize: {
      type: [String, Number],
      default: 'large'
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
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
      default: 'default'
    },
    closeButtonAriaLabel: {
      type: String,
      default: '다이얼로그 닫기'
    },
    
    // 액션 버튼 설정
    showCancelButton: {
      type: Boolean,
      default: true
    },
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '취소'
    },
    confirmText: {
      type: String,
      default: '확인'
    },
    cancelColor: {
      type: String,
      default: 'default'
    },
    confirmColor: {
      type: String,
      default: 'primary'
    },
    cancelVariant: {
      type: String,
      default: 'outlined'
    },
    confirmVariant: {
      type: String,
      default: 'elevated'
    },
    buttonSize: {
      type: String,
      default: 'default'
    },
    cancelDisabled: {
      type: Boolean,
      default: false
    },
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    cancelLoading: {
      type: Boolean,
      default: false
    },
    confirmLoading: {
      type: Boolean,
      default: false
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
    'cancel',
    'confirm',
    'click:outside',
    'keydown:esc'
  ],
  
  computed: {
    cardClass() {
      return 'modal-dialog__card'
    }
  },
  
  methods: {
    handleUpdateModelValue(value) {
      this.$emit('update:modelValue', value)
    },
    
    handleClose() {
      this.$emit('close')
      this.$emit('update:modelValue', false)
    },
    
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:modelValue', false)
    },
    
    handleConfirm() {
      this.$emit('confirm')
      this.$emit('update:modelValue', false)
    },
    
    handleClickOutside(event) {
      this.$emit('click:outside', event)
    },
    
    handleEscapeKey(event) {
      this.$emit('keydown:esc', event)
      if (!this.persistent) {
        this.handleClose()
      }
    }
  }
}
</script>

<style scoped>
.modal-dialog__card {
  max-height: 90vh;
  overflow: hidden;
}

.modal-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 0 24px;
}

.modal-dialog__title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.modal-dialog__icon {
  flex-shrink: 0;
}

.modal-dialog__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--v-theme-on-surface);
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-dialog__close-button {
  flex-shrink: 0;
}

.modal-dialog__content {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

.modal-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

/* 접근성 */
.modal-dialog__card:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .modal-dialog__header {
    padding: 16px 16px 0 16px;
    gap: 12px;
  }
  
  .modal-dialog__title-section {
    gap: 8px;
  }
  
  .modal-dialog__title {
    font-size: 1.125rem;
  }
  
  .modal-dialog__content {
    padding: 16px;
    max-height: calc(90vh - 160px);
  }
  
  .modal-dialog__actions {
    padding: 0 16px 16px 16px;
    gap: 8px;
  }
  
  .modal-dialog__actions .v-btn {
    flex: 1;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .modal-dialog__title {
    color: var(--v-theme-on-surface);
  }
}

/* 애니메이션 */
.modal-dialog__card {
  transition: all 0.3s ease-in-out;
}

.modal-dialog__close-button {
  transition: all 0.2s ease-in-out;
}

.modal-dialog__close-button:hover {
  transform: scale(1.1);
}

/* 스크롤바 스타일링 */
.modal-dialog__content::-webkit-scrollbar {
  width: 6px;
}

.modal-dialog__content::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 3px;
}

.modal-dialog__content::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

.modal-dialog__content::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
</style>
