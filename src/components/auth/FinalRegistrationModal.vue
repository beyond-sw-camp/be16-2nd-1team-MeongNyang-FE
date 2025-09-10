<template>
  <v-dialog
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
    max-width="480"
    persistent
    class="final-registration-modal"
    :retain-focus="false"
  >
    <v-card class="final-registration-card" elevation="24" rounded="xl">
      <!-- 헤더 -->
      <div class="modal-header">
        <div class="success-icon">
          <v-icon size="24" color="white">
            {{ isOAuth ? 'mdi-account-plus' : 'mdi-check-circle' }}
          </v-icon>
        </div>
        <div class="spacer"></div>
        <v-btn
          icon
          variant="text"
          @click="handleClose"
          class="modal-close-btn"
        >
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- 컨텐츠 -->
      <div class="modal-content">
        <h3 class="modal-title">
          {{ isOAuth ? '소셜 계정 추가정보' : '인증 완료' }}
        </h3>
        
        <p class="modal-description">
          {{ isOAuth ? '소셜 계정 연동을 위해 이름과 닉네임을 입력해주세요' : '마지막으로 기본 정보를 입력해주세요' }}
        </p>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="error-message">
          <v-icon size="16" color="#ef4444">mdi-alert-circle</v-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 입력 폼 -->
        <div class="form-container">
          <div class="input-group">
            <div class="input-label">
              <v-icon size="18" color="#FF8B8B">mdi-account</v-icon>
              <span>이름</span>
            </div>
            <v-text-field
              v-model="form.name"
              placeholder="이름을 입력하세요"
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="isBusy"
              class="input-field"
            ></v-text-field>
          </div>

          <div class="input-group">
            <div class="input-label">
              <v-icon size="18" color="#FF8B8B">mdi-at</v-icon>
              <span>닉네임</span>
            </div>
            <div class="duplicate-check-section">
              <v-text-field
                v-model="form.nickname"
                placeholder="닉네임을 입력하세요"
                variant="outlined"
                density="comfortable"
                hide-details
                :disabled="isBusy"
                @input="handleNicknameInput"
                class="input-field"
              ></v-text-field>
              <v-btn
                type="button"
                class="duplicate-check-btn"
                @click="checkNicknameDuplicate"
                :disabled="isBusy || !form.nickname.trim() || nicknameChecked"
                height="48"
                rounded="lg"
              >
                {{ nicknameChecked ? '확인됨' : '중복확인' }}
              </v-btn>
            </div>
          </div>

          <!-- 닉네임 중복확인 결과 메시지 -->
          <div v-if="nicknameMessage" class="nickname-message" :class="nicknameMessageType">
            <v-icon size="16" :color="nicknameMessageType === 'success' ? '#10b981' : '#ef4444'">
              {{ nicknameMessageType === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <span>{{ nicknameMessage }}</span>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="modal-actions">
        <v-btn
          color="#FF8B8B"
          block
          size="large"
          @click="handleSubmit"
          height="56"
          rounded="xl"
          class="primary-btn"
          elevation="0"
          :disabled="isBusy || !isFormValid"
        >
          <v-icon start size="20">mdi-check</v-icon>
          {{ isOAuth ? '계정 연동 완료' : '회원가입 완료' }}
        </v-btn>
      </div>
    </v-card>
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
    const isFormValid = computed(() => {
      console.log('isFormValid 계산 시작 - props.isOAuth:', props.isOAuth, '타입:', typeof props.isOAuth)
      
      // OAuth 데이터가 있으면 OAuth로 인식 (임시 해결책)
      const isOAuthMode = props.isOAuth || (props.oauthData && props.oauthData.signupTicket)
      console.log('OAuth 모드 판단:', isOAuthMode)
      
      // OAuth일 때는 이름과 닉네임만 검증 (닉네임 중복확인 우회 - 임시)
      if (isOAuthMode) {
        const result = form.value.name.trim().length >= 2 && 
                      form.value.nickname.trim().length >= 2
                      // && nicknameChecked.value  // 임시로 중복확인 우회
        console.log('OAuth isFormValid 계산:', {
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
      console.log('일반 회원가입 isFormValid 계산:', {
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
        nicknameMessage.value = '이미 사용 중인 닉네임입니다.'
        nicknameMessageType.value = 'error'
      }
    }
    
    // 제출 처리
    const handleSubmit = async () => {
      if (!isFormValid.value || isBusy.value) return
      
      isBusy.value = true
      errorMessage.value = ''
      
      try {
        let result
        
        // OAuth 데이터가 있으면 OAuth로 인식
        const isOAuthMode = props.isOAuth || (props.oauthData && props.oauthData.signupTicket)
        
        console.log('🔍 제출 시작 - 디버깅 정보:')
        console.log('- props.isOAuth:', props.isOAuth)
        console.log('- props.oauthData:', props.oauthData)
        console.log('- props.oauthData?.signupTicket:', props.oauthData?.signupTicket)
        console.log('- isOAuthMode:', isOAuthMode)
        
        if (isOAuthMode) {
          // OAuth 추가정보 처리
          console.log('🔧 OAuth 모드 - signupExtra API 호출')
          console.log('signupTicket:', props.oauthData?.signupTicket)
          console.log('이름:', form.value.name.trim())
          console.log('닉네임:', form.value.nickname.trim())
          
          const signupExtraPayload = {
            signupTicket: props.oauthData?.signupTicket,
            name: form.value.name.trim(),
            nickname: form.value.nickname.trim()
          }
          
          console.log('📤 signupExtra API 요청 데이터:', signupExtraPayload)
          
          const response = await userAPI.signupExtra(signupExtraPayload)
          console.log('📡 signupExtra API 응답:', response)
          
          result = response.data
        } else {
          // 일반 회원가입 처리
          console.log('🔧 일반 회원가입 모드')
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
        console.error('❌ 최종 등록 실패:', error)
        console.error('❌ 에러 응답:', error.response?.data)
        console.error('❌ 에러 상태:', error.response?.status)
        console.error('❌ 에러 메시지:', error.message)
        
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
        
        // OAuth 모드일 때 이메일을 로컬 스토리지에 저장
        if (props.isOAuth && props.email) {
          localStorage.setItem('email', props.email)
          console.log('🔍 OAuth 모드에서 이메일 로컬 스토리지에 저장:', props.email)
        }
        
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
      isFormValid,
      
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
.final-registration-modal {
  .v-card {
    background: white !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 0 24px;
    margin-bottom: 16px;
  }

  .success-icon {
    width: 48px;
    height: 48px;
    background: #10b981 !important;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2) !important;
  }

  .success-icon .v-icon {
    color: white !important;
    font-size: 24px !important;
  }

  .spacer {
    flex: 1;
  }

  .modal-content {
    padding: 0 24px 24px 24px;
  }

  .modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
    text-align: center;
  }

  .modal-description {
    font-size: 16px;
    color: #6b7280;
    text-align: center;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }

  .form-container {
    margin-bottom: 24px;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
    gap: 8px;
  }

  .input-label .v-icon {
    color: #FF8B8B;
  }

  .input-field {
    width: 100%;
  }

  .duplicate-check-section {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .duplicate-check-section .input-field {
    flex: 1;
  }

  .duplicate-check-btn {
    height: 48px !important;
    background: #6b7280 !important;
    color: white !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    box-shadow: none !important;
    padding: 0 16px !important;
  }

  .duplicate-check-btn:hover {
    background: #4b5563 !important;
    box-shadow: none !important;
  }

  .duplicate-check-btn:disabled {
    background: #d1d5db !important;
    color: #9ca3af !important;
  }

  .nickname-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 8px;
  }

  .nickname-message.success {
    background: rgba(16, 185, 129, 0.1);
    color: #065f46;
  }

  .nickname-message.error {
    background: rgba(239, 68, 68, 0.1);
    color: #991b1b;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ef4444;
    font-size: 14px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
  }

  .modal-actions {
    padding: 0 24px 24px 24px;
  }

  .primary-btn {
    width: 100%;
    height: 56px !important;
    background: #FF8B8B !important;
    color: white !important;
    border-radius: 12px !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    box-shadow: none !important;
  }

  .primary-btn:hover {
    background: #E87D7D !important;
    box-shadow: none !important;
  }

  .primary-btn:disabled {
    background: #d1d5db !important;
    color: #9ca3af !important;
  }
}
</style>
