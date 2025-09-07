<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">결제하기</span>
        <v-btn
          class="close-btn"
          icon="mdi-close"
          variant="text"
          @click="closeModal"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <!-- 주문 정보 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-3">주문 정보</h3>
          <v-card variant="outlined" class="pa-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-1">상품명</span>
              <span class="font-weight-medium">{{ orderInfo.orderName }}</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-1">결제 금액</span>
              <span class="text-h6 font-weight-bold payment-amount">
                {{ formatPrice(orderInfo.amount) }}원
              </span>
            </div>
          </v-card>
        </div>

        <!-- 결제 수단 선택 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-3">결제 수단</h3>
          <div id="payment-method" class="payment-widget-container"></div>
        </div>

          <!-- 이용약관 -->
          <div class="mb-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <h3 class="text-h6">이용약관</h3>
              <v-chip
                :color="agreementStatusColor"
                size="small"
                variant="flat"
              >
                {{ agreementStatusText }}
              </v-chip>
            </div>
            <div id="agreement" class="agreement-container"></div>
          </div>

        <!-- 고객 정보 -->
        <!-- <div class="mb-6">
          <h3 class="text-h6 mb-3">고객 정보</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customerInfo.customerName"
                label="이름"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="customerInfo.customerEmail"
                label="이메일"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.email]"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="customerInfo.customerMobilePhone"
                label="휴대폰 번호"
                variant="outlined"
                density="compact"
                placeholder="01012345678"
                :rules="[rules.required, rules.phone]"
              />
            </v-col>
          </v-row>
        </div> -->
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          class="cancel-btn"
          variant="outlined"
          @click="closeModal"
        >
          취소
        </v-btn>
        <v-btn
          class="payment-btn"
          variant="elevated"
          :loading="isProcessing"
          :disabled="!isPaymentButtonEnabled"
          @click="requestPayment"
        >
          {{ formatPrice(orderInfo.amount) }}원 결제하기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useAuthStore } from '@/stores/auth'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'

export default {
  name: 'PaymentWidgetModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    orderInfo: {
      type: Object,
      required: true,
      default: () => ({
        orderId: '',
        orderName: '',
        amount: 0
      })
    }
  },
  emits: ['update:modelValue', 'payment-success', 'payment-fail', 'payment-cancel'],
  setup(props, { emit }) {
    const { showMessage } = useSnackbar()
    const authStore = useAuthStore()
    
    // 반응형 데이터
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    const isProcessing = ref(false)
    const paymentWidget = ref(null)
    const tossPayments = ref(null)
    const agreementWidget = ref(null)
    const isAgreementValid = ref(false)
    
    // 고객 정보
    const customerInfo = ref({
      customerName: '',
      customerEmail: '',
      customerMobilePhone: ''
    })
    
    // 유효성 검사 규칙
    const rules = {
      required: (value) => !!value || '필수 입력 항목입니다.',
      email: (value) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || '올바른 이메일 형식이 아닙니다.'
      },
      phone: (value) => {
        const pattern = /^010\d{4}\d{4}$/
        return pattern.test(value) || '01012345678 형식으로 입력해주세요.'
      }
    }
    
    // 폼 유효성 검사
    const isFormValid = computed(() => {
      return customerInfo.value.customerName &&
             customerInfo.value.customerEmail &&
             customerInfo.value.customerMobilePhone &&
             rules.email(customerInfo.value.customerEmail) === true &&
             rules.phone(customerInfo.value.customerMobilePhone) === true
    })
    
    // 결제 버튼 활성화 조건
    const isPaymentButtonEnabled = computed(() => {
      return isAgreementValid.value && !isProcessing.value && paymentWidget.value !== null && agreementWidget.value !== null
    })
    
    // 약관 상태 표시 텍스트
    const agreementStatusText = computed(() => {
      if (!paymentWidget.value || !agreementWidget.value) {
        return '로딩 중...'
      }
      return isAgreementValid.value ? '모든 약관 동의 완료' : '약관 동의 필요'
    })
    
    // 약관 상태 칩 색상
    const agreementStatusColor = computed(() => {
      if (!paymentWidget.value || !agreementWidget.value) {
        return 'grey'
      }
      return isAgreementValid.value ? 'success' : 'warning'
    })
    
    // 가격 포맷팅
    const formatPrice = (price) => {
      return new Intl.NumberFormat('ko-KR').format(price)
    }
    
    // 모달 닫기
    const closeModal = () => {
      isOpen.value = false
    }
    
    // 토스페이먼츠 SDK 초기화
    const initializeTossPayments = async () => {
      try {
        // 토스페이먼츠 클라이언트 키 (테스트 키)
        // 실제 운영 환경에서는 환경변수로 설정하세요: process.env.VUE_APP_TOSS_CLIENT_KEY
        const clientKey = process.env.VUE_APP_TOSS_CLIENT_KEY
        
        // v2 SDK의 loadTossPayments 함수 사용
        tossPayments.value = await loadTossPayments(clientKey)
        
        // 결제위젯 인스턴스 생성
        paymentWidget.value = tossPayments.value.widgets({
          customerKey: `customer_${Date.now()}` // 실제로는 사용자 고유 ID 사용
        })
        
        // 결제 금액 설정
        await paymentWidget.value.setAmount({
          currency: 'KRW',
          value: props.orderInfo.amount
        })
        
        // 결제 수단 UI 렌더링
        await paymentWidget.value.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT'
        })
        
        // 이용약관 UI 렌더링
        agreementWidget.value = await paymentWidget.value.renderAgreement({
          selector: '#agreement',
          variantKey: 'DEFAULT'
        })
        
        // 약관 동의 상태 변경 이벤트 리스너 등록
        agreementWidget.value.on('agreementStatusChange', (agreementStatus) => {
          console.log('약관 동의 상태 변경:', agreementStatus)
          isAgreementValid.value = agreementStatus.agreedRequiredTerms
        })
        
        // 약관 위젯 렌더링 완료 후 초기 상태 확인
        // 약간의 지연을 두고 초기 상태를 확인
        setTimeout(async () => {
          try {
            // 약관 위젯이 완전히 렌더링된 후 초기 상태를 확인
            if (agreementWidget.value && typeof agreementWidget.value.getAgreementStatus === 'function') {
              const agreementStatus = await agreementWidget.value.getAgreementStatus()
              console.log('약관 초기 상태 확인:', agreementStatus)
              isAgreementValid.value = agreementStatus.agreedRequiredTerms
            } else {
              // getAgreementStatus 메서드가 없는 경우 기본값으로 true 설정 (기본 동의 상태)
              isAgreementValid.value = true
              console.log('약관 초기 상태를 true로 설정 (기본 동의 상태)')
            }
          } catch (error) {
            console.warn('약관 초기 상태 확인 실패:', error)
            // 오류 발생 시 기본값으로 true 설정 (기본 동의 상태)
            isAgreementValid.value = true
          }
        }, 500) // 500ms 지연
        
      } catch (error) {
        console.error('토스페이먼츠 초기화 실패:', error)
        showMessage({
          type: 'error',
          text: '결제 시스템 초기화에 실패했습니다.'
        })
      }
    }
    
    // Promise 방식의 결제 요청 함수
    const requestPaymentPromise = (paymentData) => {
      return new Promise((resolve, reject) => {
        if (!paymentWidget.value) {
          const error = new Error('결제 시스템이 초기화되지 않았습니다.')
          error.type = 'INIT_ERROR'
          reject(error)
          return
        }

        // 토스페이먼츠 requestPayment는 Promise를 반환하므로 직접 사용
        paymentWidget.value.requestPayment(paymentData)
          .then((result) => {
            resolve(result)
          })
          .catch((error) => {
            // 에러 타입 구분
            if (error.code === 'USER_CANCEL' || error.message?.includes('cancel') || error.message?.includes('취소')) {
              error.type = 'USER_CANCEL'
            } else if (error.code === 'INVALID_CARD_COMPANY' || error.message?.includes('카드')) {
              error.type = 'CARD_ERROR'
            } else if (error.code === 'INSUFFICIENT_BALANCE' || error.message?.includes('잔액')) {
              error.type = 'BALANCE_ERROR'
            } else {
              error.type = 'PAYMENT_ERROR'
            }
            reject(error)
          })
      })
    }

    // 결제 요청 (UI 처리 포함)
    const requestPayment = async () => {
      if (!paymentWidget.value) {
        showMessage({
          type: 'error',
          text: '결제 시스템이 초기화되지 않았습니다.'
        })
        return
      }
      
    //   if (!isFormValid.value) {
    //     showMessage({
    //       type: 'error',
    //       text: '고객 정보를 올바르게 입력해주세요.'
    //     })
    //     return
    //   }
      
      // 약관 동의 상태 확인
      if (!isAgreementValid.value) {
        showMessage({
          type: 'error',
          text: '모든 필수 약관에 동의해주세요.'
        })
        return
      }
      
      isProcessing.value = true
      
      try {
        // 결제 데이터 구성
        const paymentData = {
          orderId: props.orderInfo.orderId,
          orderName: props.orderInfo.orderName,
        //   successUrl: `${window.location.origin}/payment/success?orderId=${props.orderInfo.orderId}&amount=${props.orderInfo.amount}&roomId=${props.orderInfo.roomId || ''}`,
        //   failUrl: `${window.location.origin}/payment/fail?orderId=${props.orderInfo.orderId}&roomId=${props.orderInfo.roomId || ''}`,
          customerEmail: authStore.user?.email || localStorage.getItem('email'),
        //   customerName: customerInfo.value.customerName,
        //   customerMobilePhone: customerInfo.value.customerMobilePhone
        }

        // Promise 방식으로 결제 요청
        const result = await requestPaymentPromise(paymentData)
        
        // 결제 성공 처리 (성공 URL로 리다이렉트되므로 여기까지 도달하지 않을 수 있음)
        console.log('결제 요청 성공:', result)
        
      } catch (error) {
        console.error('결제 요청 실패:', error)
        isProcessing.value = false
        
        // 에러 타입에 따른 다른 처리
        if (error.type === 'USER_CANCEL') {
          // 사용자가 취소한 경우 - 오류 메시지 표시하지 않음
          console.log('사용자가 결제를 취소했습니다.')
          emit('payment-cancel', error)
          // 모달만 닫고 별도 메시지 없음
        } else if (error.type === 'CARD_ERROR') {
          // 카드 관련 오류
          emit('payment-fail', error)
          showMessage({
            type: 'error',
            text: '카드 정보를 확인해주세요.'
          })
        } else if (error.type === 'BALANCE_ERROR') {
          // 잔액 부족 오류
          emit('payment-fail', error)
          showMessage({
            type: 'error',
            text: '잔액이 부족합니다.'
          })
        } else {
          // 기타 결제 오류
          emit('payment-fail', error)
          showMessage({
            type: 'error',
            text: '결제 요청에 실패했습니다.'
          })
        }
      }
    }
    
    // 모달이 열릴 때 토스페이먼츠 초기화
    watch(isOpen, async (newValue) => {
      if (newValue) {
        // 고객 정보 초기화
        customerInfo.value = {
          customerName: '',
          customerEmail: '',
          customerMobilePhone: ''
        }
        
        // 약관 동의 상태 초기화 (기본적으로 동의된 상태로 시작)
        isAgreementValid.value = true
        
        // 토스페이먼츠 초기화
        await initializeTossPayments()
      }
    })
    
    // 컴포넌트 마운트 시 (NPM 패키지 사용으로 SDK 로드 불필요)
    onMounted(() => {
      console.log('토스페이먼츠 NPM 패키지 사용 준비 완료')
    })
    
    // 컴포넌트 언마운트 시 정리
    onUnmounted(() => {
      if (agreementWidget.value) {
        // 약관 위젯 정리
        agreementWidget.value.destroy().catch(console.error)
        agreementWidget.value = null
      }
      if (paymentWidget.value) {
        // 위젯 정리 (필요한 경우)
        paymentWidget.value = null
      }
    })
    
    return {
      isOpen,
      isProcessing,
      customerInfo,
      rules,
      isFormValid,
      isAgreementValid,
      isPaymentButtonEnabled,
      agreementStatusText,
      agreementStatusColor,
      formatPrice,
      closeModal,
      requestPayment,
      requestPaymentPromise
    }
  }
}
</script>

<style scoped>
.payment-widget-container {
  min-height: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.agreement-container {
  min-height: 100px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

/* 토스페이먼츠 위젯 스타일 커스터마이징 */
:deep(.tosspayments-widget) {
  font-family: 'Roboto', sans-serif;
}

:deep(.tosspayments-widget__payment-method) {
  border-radius: 8px;
}

:deep(.tosspayments-widget__agreement) {
  border-radius: 8px;
}

/* 프로젝트 표준 버튼 스타일 */
.cancel-btn,
.payment-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-width: 100px !important;
  height: 40px !important;
}

.cancel-btn {
  background: #F5F5F5 !important;
  color: #666 !important;
  border: 2px solid #E0E0E0 !important;
  min-width: 80px !important;
}

.cancel-btn:hover:not(:disabled) {
  background: #EEEEEE !important;
  border-color: #BDBDBD !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.payment-btn {
  background: linear-gradient(135deg, #FF8B8B, #FF6B6B) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.4);
}

.payment-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #FF6B6B, #FF5252) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.6);
}

.payment-btn:active {
  transform: translateY(0);
}

.cancel-btn:active,
.payment-btn:active {
  transform: translateY(0) scale(0.98);
}

.cancel-btn:disabled,
.payment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 결제 금액 핑크색 스타일 */
.payment-amount {
  color: #FF8B8B !important;
  text-shadow: 0 1px 2px rgba(255, 139, 139, 0.2);
}

/* 닫기 버튼 스타일 */
.close-btn {
  background: transparent !important;
  color: #FF8B8B !important;
  border: none !important;
  box-shadow: none !important;
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  transition: none !important;
}

.close-btn:hover {
  background: transparent !important;
  color: #FF6B6B !important;
  transform: none !important;
  box-shadow: none !important;
}

.close-btn:focus {
  background: transparent !important;
  color: #FF6B6B !important;
  outline: none !important;
  box-shadow: none !important;
}

.close-btn:active {
  background: transparent !important;
  color: #FF5252 !important;
  transform: none !important;
}
</style>
