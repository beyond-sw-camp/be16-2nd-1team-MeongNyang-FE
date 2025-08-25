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
      <div class="final-registration-icon" :class="{ 'oauth': isOAuth }">
        <v-icon size="48" color="white">
          {{ isOAuth ? 'mdi-account-plus' : 'mdi-check-circle' }}
        </v-icon>
      </div>
      
      <!-- 제목 -->
      <h2 class="final-registration-title">
        {{ isOAuth ? '소셜 계정 추가정보' : '이메일 인증 완료!' }}
      </h2>
      
      <!-- 설명 -->
      <p class="final-registration-description">
        {{ isOAuth ? '소셜 계정 연동을 위해 이름과 닉네임을 입력해주세요' : '마지막으로 기본 정보를 입력해주세요' }}
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
        
        <!-- 닉네임 입력 및 중복확인 -->
        <div class="nickname-input-group">
          <input
            v-model="form.nickname"
            type="text"
            placeholder="닉네임을 입력하세요"
            class="final-input-field"
            :disabled="isBusy"
            @input="handleNicknameInput"
          />
          <button
            type="button"
            class="duplicate-check-btn"
            @click="checkNicknameDuplicate"
            :disabled="isBusy || !form.nickname.trim() || nicknameChecked"
          >
            {{ nicknameChecked ? '확인됨' : '중복확인' }}
          </button>
        </div>
        
        <!-- 닉네임 중복확인 결과 메시지 -->
        <div v-if="nicknameMessage" class="nickname-message" :class="nicknameMessageType">
          {{ nicknameMessage }}
        </div>
        
        <button
          type="button"
          class="final-submit-btn"
          @click="handleSubmit"
          :disabled="isBusy || !canSubmit"
        >
          {{ isBusy ? '처리 중...' : (isOAuth ? '소셜 계정 연동 완료' : '회원가입 완료') }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { userAPI } from '@/services/api'

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
      default: ''
    },
    isOAuth: {
      type: Boolean,
      default: false
    },
    oauthData: {
      type: Object,
      default: () => ({})
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
    
    // 닉네임 중복확인 상태
    const nicknameChecked = ref(false)
    const nicknameMessage = ref('')
    const nicknameMessageType = ref('')
    
    // computed 속성들
    const canSubmit = computed(() => {
      console.log('canSubmit 계산 시작 - props.isOAuth:', props.isOAuth, '타입:', typeof props.isOAuth)
      
      // OAuth 데이터가 있으면 OAuth로 인식 (임시 해결책)
      const isOAuthMode = props.isOAuth || (props.oauthData && props.oauthData.signupTicket)
      console.log('OAuth 모드 판단:', isOAuthMode)
      
      // OAuth일 때는 이름과 닉네임만 검증 (닉네임 중복확인 우회 - 임시)
      if (isOAuthMode) {
        const result = form.value.name.trim().length >= 2 && 
                      form.value.nickname.trim().length >= 2
                      // && nicknameChecked.value  // 임시로 중복확인 우회
        console.log('OAuth canSubmit 계산:', {
          nameLength: form.value.name.trim().length,
          nicknameLength: form.value.nickname.trim().length,
          nicknameChecked: nicknameChecked.value,
          result
        })
        return result
      }
      
      // 일반 회원가입일 때는 이름, 닉네임, 비밀번호 검증 (닉네임 중복확인 포함)
      const result = form.value.name.trim().length >= 2 && 
                    form.value.nickname.trim().length >= 2 &&
                    props.password.length >= 8 &&
                    nicknameChecked.value
      console.log('일반 회원가입 canSubmit 계산:', {
        nameLength: form.value.name.trim().length,
        nicknameLength: form.value.nickname.trim().length,
        passwordLength: props.password.length,
        nicknameChecked: nicknameChecked.value,
        result
      })
      return result
    })
    
    // 닉네임 입력 시 중복확인 초기화
    const handleNicknameInput = () => {
      if (nicknameChecked.value) {
        nicknameChecked.value = false
        nicknameMessage.value = ''
        nicknameMessageType.value = ''
      }
    }
    
    // 닉네임 중복확인
    const checkNicknameDuplicate = async () => {
      if (!form.value.nickname.trim()) return
      
      console.log('🔍 닉네임 중복확인 시작:', form.value.nickname.trim())
      
      try {
        console.log('📤 중복확인 API 요청 데이터:', {
          nickname: form.value.nickname.trim(),
          nicknameLength: form.value.nickname.trim().length
        })
        
        const response = await userAPI.checkNickname(form.value.nickname.trim())
        console.log('📡 중복확인 API 응답:', response)
        console.log('📡 응답 데이터:', response.data)
        
        const result = response.data
        
        // 백엔드 응답 구조 상세 분석
        console.log('🔍 백엔드 응답 구조 분석:')
        console.log('- result:', result)
        console.log('- result.isSuccess:', result.isSuccess)
        console.log('- result.data:', result.data)
        console.log('- result.data.available:', result.data?.available)
        console.log('- result.status:', result.status)
        console.log('- result.status?.message:', result.status?.message)
        
        if (result.isSuccess) {
          console.log('✅ API 성공 응답:', result)
          
          // 백엔드 응답 구조에 따른 사용 가능 여부 판단
          let isAvailable = false
          
          // CommonRes<String> 구조: result.data에 닉네임이 있으면 사용 가능
          if (result.data && typeof result.data === 'string' && result.data.trim() !== '') {
            isAvailable = true
            console.log('📋 CommonRes<String> 구조 사용: result.data =', result.data)
          }
          // 구조 1: result.data.available (boolean)
          else if (result.data && typeof result.data.available === 'boolean') {
            isAvailable = result.data.available
            console.log('📋 구조 1 사용: result.data.available =', isAvailable)
          }
          // 구조 2: result.data (boolean)
          else if (result.data && typeof result.data === 'boolean') {
            isAvailable = result.data
            console.log('📋 구조 2 사용: result.data =', isAvailable)
          }
          // 구조 3: result.available (boolean)
          else if (typeof result.available === 'boolean') {
            isAvailable = result.available
            console.log('📋 구조 3 사용: result.available =', isAvailable)
          }
          // 구조 4: result.status.code === 200이면 사용 가능
          else if (result.status && result.status.code === 200) {
            isAvailable = true
            console.log('📋 구조 4 사용: result.status.code === 200')
          }
          else {
            console.log('❓ 알 수 없는 응답 구조:', result)
            isAvailable = false
          }
          
          if (isAvailable) {
            nicknameChecked.value = true
            nicknameMessage.value = '사용 가능한 닉네임입니다.'
            nicknameMessageType.value = 'success'
            console.log('✅ 닉네임 사용 가능!')
          } else {
            nicknameChecked.value = false
            nicknameMessage.value = '이미 사용 중인 닉네임입니다.'
            nicknameMessageType.value = 'error'
            console.log('❌ 닉네임 중복!')
          }
        } else {
          nicknameChecked.value = false
          nicknameMessage.value = result.status?.message || '중복확인에 실패했습니다.'
          nicknameMessageType.value = 'error'
          console.log('❌ API 실패 응답:', result)
        }
      } catch (error) {
        console.error('❌ 닉네임 중복확인 실패:', error)
        console.error('❌ 에러 응답:', error.response?.data)
        console.error('❌ 에러 상태:', error.response?.status)
        nicknameChecked.value = false
        nicknameMessage.value = '중복확인 중 오류가 발생했습니다.'
        nicknameMessageType.value = 'error'
      }
    }
    
    // 제출 처리
    const handleSubmit = async () => {
      if (!canSubmit.value || isBusy.value) return
      
      isBusy.value = true
      errorMessage.value = ''
      
      try {
        let result
        
        // OAuth 데이터가 있으면 OAuth로 인식 (임시 해결책)
        const isOAuthMode = props.isOAuth || (props.oauthData && props.oauthData.signupTicket)
        
        if (isOAuthMode) {
          // OAuth 추가정보 처리 - 기존 API 사용
          const response = await userAPI.signupExtra({
            signupTicket: props.oauthData.signupTicket,
            name: form.value.name.trim(),
            nickname: form.value.nickname.trim()
          })
          
          result = response.data
        } else {
          // 일반 회원가입 처리
          const response = await userAPI.signup({
            email: props.email,
            password: props.password,
            name: form.value.name.trim(),
            nickname: form.value.nickname.trim()
          })
          
          result = response.data
        }
        
        if (result.isSuccess === true) {
          // 성공 시 부모 컴포넌트에 알림
          emit('success', result)
        } else {
          // 실패 시 에러 메시지 표시
          errorMessage.value = result.status?.message || '처리에 실패했습니다.'
        }
              } catch (error) {
          console.error('최종 등록 실패:', error)
          if (props.isOAuth) {
            errorMessage.value = '소셜 계정 연동 중 오류가 발생했습니다. 다시 시도해주세요.'
          } else {
            errorMessage.value = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'
          }
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
        console.log('FinalRegistrationModal 열림:', {
          isOAuth: props.isOAuth,
          email: props.email,
          oauthData: props.oauthData
        })
        console.log('props.isOAuth 타입:', typeof props.isOAuth)
        console.log('props.isOAuth 값:', props.isOAuth)
        
        // 폼 초기화
        form.value.name = ''
        form.value.nickname = ''
        errorMessage.value = ''
        isBusy.value = false
        
        // 닉네임 중복확인 상태 초기화
        nicknameChecked.value = false
        nicknameMessage.value = ''
        nicknameMessageType.value = ''
      }
    })
    
    return {
      // 상태
      form,
      isBusy,
      errorMessage,
      nicknameChecked,
      nicknameMessage,
      nicknameMessageType,
      
      // computed
      canSubmit,
      
      // 메서드
      handleSubmit,
      handleClose,
      handleNicknameInput,
      checkNicknameDuplicate
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

.final-registration-icon.oauth {
  background: #3b82f6;
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

/* 닉네임 입력 그룹 */
.nickname-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nickname-input-group .final-input-field {
  flex: 1;
}

.duplicate-check-btn {
  padding: 12px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  min-width: 80px;
}

.duplicate-check-btn:hover:not(:disabled) {
  background: #4b5563;
}

.duplicate-check-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 닉네임 메시지 */
.nickname-message {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.nickname-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.nickname-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
</style>
