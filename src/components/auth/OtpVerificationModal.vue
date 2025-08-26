<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="480" persistent>
    <div class="otp-modal-card">
      <!-- 헤더 -->
      <div class="otp-header">
        <button class="back-btn" @click="handleBack">
          <v-icon>mdi-arrow-left</v-icon>
        </button>
        <button class="close-btn" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>
      
      <!-- 이메일 아이콘 -->
      <div class="otp-icon">
        <v-icon size="48" color="white">mdi-email</v-icon>
      </div>
      
      <!-- 제목 -->
      <h2 class="otp-title">이메일 인증</h2>
      
      <!-- 설명 -->
      <p class="otp-description">
        <strong>{{ email }}</strong>로 이메일 인증 링크를 보냈습니다. 
        이메일의 버튼을 클릭하거나 아래에 인증 코드를 입력해주세요.
      </p>
      
      <!-- 검증 코드 입력 섹션 -->
      <div class="otp-input-section">
        <div class="otp-input-header" @click="toggleOtpInput">
          <span class="otp-input-label">검증 코드 입력하기</span>
          <v-icon class="toggle-icon" :class="{ 'rotated': showOtpInput }">
            {{ showOtpInput ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </div>
        
        <!-- 접혀있는 OTP 입력 필드들 -->
        <div v-show="showOtpInput" class="otp-input-fields">
          <input
            v-for="(digit, index) in 6"
            :key="index"
            v-model="otpDigits[index]"
            type="text"
            maxlength="1"
            class="otp-input-field"
            :class="{ active: index === activeOtpIndex }"
            :data-index="index"
            @input="handleOtpInput(index, $event)"
            @focus="activeOtpIndex = index"
            @keydown="handleOtpKeydown(index, $event)"
            @paste="handleOtpPaste"
          />
        </div>
        
        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="otp-error">
          {{ errorMessage }}
        </div>
      </div>
      
      <!-- 타이머 및 재전송 -->
      <div class="timer-section">
        <div v-if="!canResend" class="timer-text">
          이메일이 도착하지 않으면 <strong>{{ timeLeftText }}</strong> 후에 재전송할 수 있습니다
        </div>
        <button
          v-else
          class="resend-btn"
          @click="handleResend"
          :disabled="isResending"
        >
          이메일 재전송
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onUnmounted } from 'vue'

export default {
  name: 'OtpVerificationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      required: true
    }
  },
  emits: ['back', 'close', 'success', 'resend'],
  setup(props, { emit }) {
    // OTP 입력 상태
    const otpDigits = ref(['', '', '', '', '', ''])
    const activeOtpIndex = ref(0)
    const showOtpInput = ref(false)
    const errorMessage = ref('')
    
    // 타이머 상태
    const timeLeft = ref(60) // 1분
    const canResend = ref(false)
    const isResending = ref(false)
    
    // 타이머 인터벌
    let timerInterval = null
    
    // computed 속성들
    const timeLeftText = computed(() => {
      const minutes = Math.floor(timeLeft.value / 60)
      const seconds = timeLeft.value % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    })
    
    // OTP 입력 섹션 토글
    const toggleOtpInput = () => {
      showOtpInput.value = !showOtpInput.value
      if (showOtpInput.value) {
        // 입력 필드가 열리면 첫 번째 필드에 포커스
        setTimeout(() => {
          const firstInput = document.querySelector('.otp-input-field[data-index="0"]')
          if (firstInput) firstInput.focus()
        }, 100)
      }
    }
    
    // OTP 입력 처리
    const handleOtpInput = (index, event) => {
      const value = event.target.value
      
      // UUID 문자 허용 (숫자, 알파벳, 하이픈)
      if (!/^[a-zA-Z0-9-]*$/.test(value)) {
        event.target.value = ''
        return
      }
      
      // 현재 입력 필드에 값 설정
      otpDigits.value[index] = value
      
      // 다음 입력 필드로 자동 이동
      if (value && index < 5) {
        activeOtpIndex.value = index + 1
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-index="${index + 1}"]`)
          if (nextInput) nextInput.focus()
        }, 10)
      }
      
      // 6자리가 모두 입력되었는지 확인하고 자동 검증
      if (index === 5 && value) {
        setTimeout(() => {
          const allDigits = otpDigits.value.join('')
          if (allDigits.length === 6) {
            handleOtpVerification()
          }
        }, 100)
      }
    }
    
    // OTP 키보드 처리
    const handleOtpKeydown = (index, event) => {
      if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        activeOtpIndex.value = index - 1
        otpDigits.value[index - 1] = ''
        setTimeout(() => {
          const prevInput = document.querySelector(`input[data-index="${index - 1}"]`)
          if (prevInput) prevInput.focus()
        }, 10)
      }
    }
    
    // OTP 붙여넣기 처리 (복붙 방지)
    const handleOtpPaste = (event) => {
      event.preventDefault()
      // 복붙 방지 - 아무것도 하지 않음
    }
    
    // OTP 인증 처리
    const handleOtpVerification = async () => {
      const otpString = otpDigits.value.join('')
      if (otpString.length !== 6) {
        errorMessage.value = '인증 코드를 모두 입력해주세요.'
        return
      }
      
      try {
        // 백엔드 API 호출하여 OTP 인증 확인
        const response = await fetch('/users/verify-email-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: props.email,
            code: otpString
          })
        })
        
        const result = await response.json()
        
        if (result.isSuccess === true) {
          // 성공 시 부모 컴포넌트에 알림
          emit('success', {
            email: props.email,
            code: otpString
          })
        } else {
          // 실패 시 에러 메시지 표시
          errorMessage.value = result.status?.message || '인증번호가 올바르지 않습니다.'
          // 입력 필드 초기화
          otpDigits.value = ['', '', '', '', '', '']
          activeOtpIndex.value = 0
          // 첫 번째 필드에 포커스
          setTimeout(() => {
            const firstInput = document.querySelector('.otp-input-field[data-index="0"]')
            if (firstInput) firstInput.focus()
          }, 100)
        }
      } catch (error) {
        console.error('OTP 인증 실패:', error)
        errorMessage.value = '인증 중 오류가 발생했습니다. 다시 시도해주세요.'
      }
    }
    
    // 재전송 처리
    const handleResend = async () => {
      if (isResending.value) return
      
      console.log('🔍 이메일 재전송 시작')
      isResending.value = true
      
      try {
        // 부모 컴포넌트에 재전송 요청
        console.log('🔍 부모 컴포넌트에 resend 이벤트 발생')
        emit('resend')
        
        // 타이머 리셋
        timeLeft.value = 60
        canResend.value = false
        startTimer()
        
        // 에러 메시지 초기화
        errorMessage.value = ''
        
        console.log('✅ 재전송 처리 완료, 타이머 리셋됨')
      } catch (error) {
        console.error('❌ 재전송 처리 실패:', error)
        errorMessage.value = '재전송 처리 중 오류가 발생했습니다.'
      } finally {
        isResending.value = false
      }
    }
    
    // 타이머 시작
    const startTimer = () => {
      if (timerInterval) clearInterval(timerInterval)
      
      timerInterval = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          clearInterval(timerInterval)
          canResend.value = true
        }
      }, 1000)
    }
    
    // 뒤로가기
    const handleBack = () => {
      emit('back')
    }
    
    // 모달 닫기
    const handleClose = () => {
      emit('close')
    }
    
    // 모달이 열릴 때마다 초기화
    watch(() => props.show, (newVal) => {
      if (newVal) {
        // 상태 초기화
        otpDigits.value = ['', '', '', '', '', '']
        activeOtpIndex.value = 0
        showOtpInput.value = false
        errorMessage.value = ''
        timeLeft.value = 60
        canResend.value = false
        
        // 타이머 시작
        startTimer()
      } else {
        // 모달이 닫힐 때 타이머 정리
        if (timerInterval) {
          clearInterval(timerInterval)
          timerInterval = null
        }
      }
    })
    
    // 컴포넌트 언마운트 시 타이머 정리
    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    })
    
    return {
      // 상태
      otpDigits,
      activeOtpIndex,
      showOtpInput,
      errorMessage,
      timeLeft,
      canResend,
      isResending,
      
      // computed
      timeLeftText,
      
      // 메서드
      toggleOtpInput,
      handleOtpInput,
      handleOtpKeydown,
      handleOtpPaste,
      handleOtpVerification,
      handleResend,
      handleBack,
      handleClose
    }
  }
}
</script>

<style scoped>
.otp-modal-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #e9ecef;
  overflow: hidden;
  max-width: 480px;
  width: 100%;
  position: relative;
}

.otp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 0;
  margin-bottom: 24px;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  color: #374151;
  background: rgba(107, 114, 128, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
  background: rgba(107, 114, 128, 0.1);
}

.otp-icon {
  background: #6b7280;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.otp-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 16px;
}

.otp-description {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 32px;
  padding: 0 32px;
}

.otp-input-section {
  margin: 0 32px 24px;
}

.otp-input-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.otp-input-header:hover {
  background: transparent;
}

.otp-input-label {
  font-size: 14px;
  font-weight: 700;
  color: #3b82f6;
  text-align: center;
}

.toggle-icon {
  transition: transform 0.2s;
  color: #6b7280;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.otp-input-fields {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.otp-input-field {
  width: 56px;
  height: 56px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  background: white;
  transition: all 0.2s ease;
  outline: none;
}

.otp-input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.otp-input-field.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.otp-input-field:not(:placeholder-shown) {
  border-color: #10b981;
}

.otp-input-field:hover {
  border-color: #d1d5db;
}

.otp-error {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 8px;
}

.timer-section {
  text-align: center;
  margin: 0 32px 32px;
}

.timer-text {
  color: #111827;
  font-size: 0.9rem;
  font-weight: 700;
}

.resend-btn {
  background: white;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.resend-btn:hover {
  background: #f8fafc;
  border-color: #2563eb;
  color: #2563eb;
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
