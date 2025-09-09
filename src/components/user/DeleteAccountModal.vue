<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    class="delete-account-modal modal-coinmarketcap-overlay"
    :retain-focus="false"
    transition="dialog-transition"
    @update:model-value="handleUpdateModelValue"

  >
    <v-card 
      class="delete-account-card modal-container modal-gpu-accelerated modal-coinmarketcap-card"
      elevation="24" 
      rounded="xl"
    >
      <!-- 헤더 -->
      <v-card-title class="delete-account-header modal-coinmarketcap-header pa-6 pb-4">
        <div class="d-flex align-center justify-center w-100 position-relative">
          <!-- 닫기 버튼 -->
          <v-btn
            icon
            variant="text"
            size="small"
            @click="handleClose"
            class="modal-close-btn position-absolute"
            style="top: 0; right: 0;"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
          
          <!-- 경고 아이콘과 제목 -->
          <div class="header-content text-center">

            
            <h1 class="modal-title mb-1">
              계정을 삭제하시겠습니까?
            </h1>
            
            <p class="modal-subtitle">
              이 작업은 되돌릴 수 없습니다
            </p>
          </div>
        </div>
      </v-card-title>

      <!-- 내용 -->
      <v-card-text class="pa-8 pt-4">
        <div class="content-wrapper">
          <!-- 설명 -->
          <p class="delete-account-description mb-6 text-center">
            계정과 관련된 모든 데이터가 <strong>영구적으로 삭제</strong>됩니다.
          </p>
          
          <!-- 경고 박스 -->
          <div class="warning-box modal-coinmarketcap-warning pa-6 mb-6">
            <div class="warning-header mb-4">
              <div class="d-flex align-center justify-center mb-3">
                <div class="warning-icon-small">
                  <v-icon size="24" color="error">mdi-alert</v-icon>
                </div>
              </div>
              <h3 class="warning-title text-center">삭제되는 데이터</h3>
            </div>
            
            <div class="warning-grid">
              <div class="warning-item">
                <v-icon size="20" color="error" class="me-3">mdi-account</v-icon>
                <span>프로필 정보</span>
              </div>
              <div class="warning-item">
                <v-icon size="20" color="error" class="me-3">mdi-paw</v-icon>
                <span>반려동물 정보</span>
              </div>
              <div class="warning-item">
                <v-icon size="20" color="error" class="me-3">mdi-post</v-icon>
                <span>게시글 및 댓글</span>
              </div>
              <div class="warning-item">
                <v-icon size="20" color="error" class="me-3">mdi-chat</v-icon>
                <span>채팅 기록</span>
              </div>
              <div class="warning-item">
                <v-icon size="20" color="error" class="me-3">mdi-history</v-icon>
                <span>활동 기록</span>
              </div>
            </div>
          </div>
          
          <!-- 액션 버튼 -->
          <div class="action-buttons-container mt-6">
            <v-btn
              variant="outlined"
              size="x-large"
              rounded="xl"
              class="cancel-btn modal-coinmarketcap-btn"
              @click="handleClose"
              :disabled="isDeleting"
              block
            >
              <v-icon start size="20">mdi-close</v-icon>
              취소
            </v-btn>
            
            <v-btn
              variant="flat"
              size="x-large"
              rounded="xl"
              color="error"
              class="delete-btn modal-coinmarketcap-btn"
              @click="handleConfirm"
              :loading="isDeleting"
              :disabled="isDeleting"
              block
            >
              <v-icon start size="20">mdi-delete</v-icon>
              계정 삭제
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'DeleteAccountModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'confirm', 'close'],
  
  setup(props, { emit }) {
    const isOpen = ref(props.modelValue)
    const isDeleting = ref(false)
    
    // modelValue 변경 감지
    watch(() => props.modelValue, (newValue) => {
      isOpen.value = newValue
    }, { immediate: true })
    
    // isOpen 변경 감지
    watch(isOpen, (newValue) => {
      emit('update:modelValue', newValue)
    })
    
    const handleUpdateModelValue = (value) => {
      isOpen.value = value
    }
    
    const handleClose = () => {
      if (!isDeleting.value) {
        isOpen.value = false
        emit('close')
      }
    }
    
    const handleConfirm = async () => {
      isDeleting.value = true
      try {
        emit('confirm')
      } finally {
        isDeleting.value = false
      }
    }
    
    return {
      isOpen,
      isDeleting,
      handleUpdateModelValue,
      handleClose,
      handleConfirm
    }
  }
}
</script>

<style scoped>
/* 모달 오버레이 스타일 */
:deep(.delete-account-modal .v-overlay__content) {
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
}

/* 모달 카드 스타일 - 고급 코인마켓캡 스타일 */
.delete-account-card {
  max-width: 600px !important;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%) !important;
  border: 1px solid rgba(226, 232, 240, 0.6) !important;
  box-shadow: 
    0 32px 64px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border-radius: 24px !important;
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.delete-account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  z-index: 1;
}

/* 헤더 스타일 - 고급 코인마켓캡 스타일 */
.delete-account-header {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4) !important;
  border-radius: 24px 24px 0 0 !important;
  flex-shrink: 0;
}

/* 콘텐츠 영역 스타일 - 스크롤 가능하도록 설정 */
.delete-account-modal .v-card-text {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 32px !important;
  padding-top: 16px !important;
}

/* 스크롤바 스타일 - 펫 등록 폼과 동일하게 적용 */
.delete-account-modal .v-card-text::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
  -webkit-appearance: none !important;
}

.delete-account-modal .v-card-text::-webkit-scrollbar-track {
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
  -webkit-appearance: none !important;
}

.delete-account-modal .v-card-text::-webkit-scrollbar-thumb {
  background: #E87D7D !important;
  border-radius: 6px !important;
  border: 1px solid #f8f9fa !important;
  -webkit-appearance: none !important;
}

.delete-account-modal .v-card-text::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B !important;
  -webkit-appearance: none !important;
}

.delete-account-modal .v-card-text::-webkit-scrollbar-corner {
  background: #f8f9fa !important;
  -webkit-appearance: none !important;
}

.header-content {
  width: 100%;
}

.modal-title {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: #1e293b !important;
  line-height: 1.3 !important;
  margin: 0 !important;
  letter-spacing: -0.025em !important;
}

.modal-subtitle {
  font-size: 1rem !important;
  color: #64748b !important;
  margin: 0 !important;
  font-weight: 500 !important;
}

/* 경고 아이콘 컨테이너 - 모달 배경과 동일한 색상으로 숨김 */
.warning-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  border: none;
  margin: 0 auto;
  box-shadow: none;
  position: relative;
}

.icon-glow-effect {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}



@keyframes iconGlow {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.warning-icon {
  animation: warningPulse 2s ease-in-out infinite;
}

.warning-icon svg {
  stroke: none !important;
  stroke-width: 0 !important;
}

.warning-icon svg * {
  stroke: none !important;
  stroke-width: 0 !important;
}

@keyframes warningPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 설명 스타일 */
.delete-account-description {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

/* 경고 박스 스타일 - 고급 코인마켓캡 스타일 */
.warning-box {
  text-align: left;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border: 1px solid rgba(252, 165, 165, 0.4) !important;
  border-radius: 16px !important;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.warning-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
}

.warning-header {
  text-align: center;
}

.warning-icon-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
}

.warning-title {
  font-weight: 700 !important;
  color: #dc2626 !important;
  font-size: 1.1rem !important;
  margin: 0 !important;
}

.warning-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(252, 165, 165, 0.2);
  font-weight: 500;
  color: #7f1d1d;
  transition: all 0.2s ease;
}

.warning-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(4px);
}



/* 액션 버튼 컨테이너 */
.action-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* 버튼 스타일 - 고급 코인마켓캡 스타일 */
.cancel-btn {
  border-color: #d1d5db !important;
  color: #6b7280 !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  border-radius: 16px !important;
  font-weight: 600 !important;
  letter-spacing: 0.025em !important;
  height: 56px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border: 2px solid #e2e8f0 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
}

.cancel-btn:hover {
  border-color: #9ca3af !important;
  color: #374151 !important;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.delete-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  border-radius: 16px !important;
  font-weight: 700 !important;
  letter-spacing: 0.025em !important;
  height: 56px !important;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  border: 2px solid #dc2626 !important;
  box-shadow: 
    0 8px 32px rgba(239, 68, 68, 0.3),
    0 4px 16px rgba(239, 68, 68, 0.2) !important;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 
    0 12px 40px rgba(239, 68, 68, 0.4),
    0 6px 20px rgba(239, 68, 68, 0.3) !important;
}

.delete-btn:active {
  transform: translateY(0) !important;
  transition: transform 0.1s !important;
}

/* 닫기 버튼 스타일 */
.modal-close-btn {
  color: #9ca3af !important;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  color: #6b7280 !important;
  background-color: #f3f4f6 !important;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .delete-account-card {
    margin: 16px;
    max-width: calc(100vw - 32px) !important;
    border-radius: 20px !important;
  }
  
  .modal-title {
    font-size: 1.5rem !important;
  }
  
  .modal-subtitle {
    font-size: 0.9rem !important;
  }
  
  .warning-icon-container {
    width: 80px;
    height: 80px;
  }
  
  .warning-icon {
    font-size: 48px !important;
  }
  
  .delete-account-description {
    font-size: 1rem;
  }
  
  .warning-item {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  
  .cancel-btn, .delete-btn {
    height: 52px !important;
    font-size: 0.95rem !important;
  }
}

/* 코인마켓캡 스타일 애니메이션 적용 */
.delete-account-modal :deep(.v-overlay__content) {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 모달 진입 애니메이션 */
.delete-account-modal.modal-coinmarketcap-enter-active :deep(.v-overlay__content),
.delete-account-modal.modal-coinmarketcap-leave-active :deep(.v-overlay__content) {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.delete-account-modal.modal-coinmarketcap-enter-from :deep(.v-overlay__content) {
  opacity: 0;
  transform: scale(0.8) translateY(30px);
  filter: blur(4px);
}

.delete-account-modal.modal-coinmarketcap-leave-to :deep(.v-overlay__content) {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
  filter: blur(2px);
}

/* 오버레이 애니메이션 */
.delete-account-modal :deep(.v-overlay__backdrop) {
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
