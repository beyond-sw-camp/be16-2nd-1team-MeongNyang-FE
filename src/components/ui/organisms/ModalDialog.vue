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
    <v-card
      :elevation="cardElevation"
      :rounded="cardRounded"
      :shaped="cardShaped"
      :color="cardColor"
      :loading="loading"
      :disabled="disabled"
      :class="cardClass"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
    >
      <!-- 헤더 -->
      <v-card-title v-if="title || $slots.header" class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon
            v-if="icon"
            :icon="icon"
            :size="iconSize"
            :color="iconColor"
            class="me-3"
          />
          <span class="text-h6">{{ title }}</span>
        </div>
        
        <v-btn
          v-if="showCloseButton"
          :icon="closeIcon"
          :size="closeButtonSize"
          :variant="closeButtonVariant"
          :color="closeButtonColor"
          :aria-label="closeButtonAriaLabel"
          @click="handleClose"
        />
      </v-card-title>
      
      <!-- 내용 -->
      <v-card-text v-if="$slots.default" class="pa-4">
        <slot />
      </v-card-text>
      
      <!-- 액션 -->
      <v-card-actions v-if="$slots.actions" class="pa-4 pt-0">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ModalDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
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
      type: [String, Number],
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
    customClass: {
      type: String,
      default: ''
    },
    // 카드 관련 props
    cardElevation: {
      type: [String, Number],
      default: 8
    },
    cardRounded: {
      type: [String, Number],
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
    cardClass: {
      type: String,
      default: ''
    },
    // 헤더 관련 props
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    iconSize: {
      type: [String, Number],
      default: 24
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
      type: [String, Number],
      default: 'small'
    },
    closeButtonVariant: {
      type: String,
      default: 'text'
    },
    closeButtonColor: {
      type: String,
      default: 'grey'
    },
    closeButtonAriaLabel: {
      type: String,
      default: '닫기'
    },
    // 상태 관련 props
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 접근성 관련 props
    ariaLabel: {
      type: String,
      default: undefined
    },
    ariaDescribedby: {
      type: String,
      default: undefined
    }
  },
  
  emits: ['update:modelValue', 'close', 'confirm', 'cancel'],
  
  setup(props, { emit }) {
    const handleUpdateModelValue = (value) => {
      emit('update:modelValue', value)
    }
    
    const handleClose = () => {
      emit('close')
      emit('update:modelValue', false)
    }
    
    const handleClickOutside = () => {
      if (!props.persistent) {
        handleClose()
      }
    }
    
    const handleEscapeKey = () => {
      if (!props.persistent) {
        handleClose()
      }
    }
    
    return {
      handleUpdateModelValue,
      handleClose,
      handleClickOutside,
      handleEscapeKey
    }
  }
}
</script>

<style scoped>
.modal-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.modal-dialog__title-section {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.modal-dialog__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.modal-dialog__icon {
  margin-right: 12px;
}

.modal-dialog__close-button {
  flex-shrink: 0;
}

.modal-dialog__content {
  flex-grow: 1;
}

.modal-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .modal-dialog__actions {
    flex-direction: column;
  }
  
  .modal-dialog__actions .v-btn {
    width: 100%;
  }
}
</style>
