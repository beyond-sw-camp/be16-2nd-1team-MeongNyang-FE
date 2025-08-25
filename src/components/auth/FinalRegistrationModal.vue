<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="400" persistent>
    <div class="final-registration-card">
      <!-- 헤더 -->
      <div class="final-registration-header">
        <button class="close-btn" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>
      
      <!-- 체크 아이콘 -->
      <div class="final-registration-icon">
        <v-icon size="48" color="white">mdi-check-circle</v-icon>
      </div>
      
      <!-- 제목 -->
      <h2 class="final-registration-title">이메일 인증 완료!</h2>
      
      <!-- 설명 -->
      <p class="final-registration-description">
        마지막으로 기본 정보를 입력해주세요
      </p>
      
      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <!-- 최종 정보 입력 폼 -->
      <div class="final-registration-form">
        <input
          v-model="form.name"
          type="text"
          placeholder="이름을 입력하세요"
          class="final-input-field"
          :disabled="isBusy"
        />
        <input
          v-model="form.nickname"
          type="text"
          placeholder="닉네임을 입력하세요"
          class="final-input-field"
          :disabled="isBusy"
        />
        <button
          type="button"
          class="final-submit-btn"
          @click="handleSubmit"
          :disabled="isBusy || !canSubmit"
        >
          {{ isBusy ? '처리 중...' : '회원가입 완료' }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'FinalRegistrationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    // 폼 상태
    const form = ref({
      name: '',
      nickname: ''
    })
    
    // UI 상태
    const isBusy = ref(false)
    const errorMessage = ref('')
    
    // computed 속성들
    const canSubmit = computed(() => {
      return form.value.name.trim().length >= 2 && 
             form.value.nickname.trim().length >= 2
    })
    
    // 제출 처리
    const handleSubmit = async () => {
      if (!canSubmit.value || isBusy.value) return
      
      isBusy.value = true
      errorMessage.value = ''
      
      try {
        // 백엔드 API 호출하여 최종 회원가입
        const response = await fetch('/users/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: props.email,
            password: props.password,
            name: form.value.name.trim(),
            nickname: form.value.nickname.trim()
          })
        })
        
        const result = await response.json()
        
        if (result.isSuccess === true) {
          // 성공 시 부모 컴포넌트에 알림
          emit('success', result)
        } else {
          // 실패 시 에러 메시지 표시
          errorMessage.value = result.status?.message || '회원가입에 실패했습니다.'
        }
      } catch (error) {
        console.error('최종 등록 실패:', error)
        errorMessage.value = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'
      } finally {
        isBusy.value = false
      }
    }
    
    // 모달 닫기
    const handleClose = () => {
      emit('close')
    }
    
    // 모달이 열릴 때마다 초기화
    watch(() => props.show, (newVal) => {
      if (newVal) {
        // 폼 초기화
        form.value.name = ''
        form.value.nickname = ''
        errorMessage.value = ''
        isBusy.value = false
      }
    })
    
    return {
      // 상태
      form,
      isBusy,
      errorMessage,
      
      // computed
      canSubmit,
      
      // 메서드
      handleSubmit,
      handleClose
    }
  }
}
</script>

<style scoped>
.final-registration-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #e9ecef;
  overflow: hidden;
  max-width: 400px;
  width: 100%;
  position: relative;
}

.final-registration-header {
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  padding: 32px 32px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #64748b;
  background: rgba(148, 163, 184, 0.1);
}

.final-registration-icon {
  background: #10b981;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.final-registration-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 16px;
}

.final-registration-description {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 32px;
  padding: 0 32px;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin: 0 32px 24px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.final-registration-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 32px 32px;
}

.final-input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
}

.final-input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.final-input-field:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.final-submit-btn {
  width: 100%;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.final-submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.final-submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
