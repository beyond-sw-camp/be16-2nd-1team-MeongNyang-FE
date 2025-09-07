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
              <span class="text-h6 font-weight-bold text-primary">
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
          <div id="agreement" class="agreement-container"></div>
        </div>

        <!-- 고객 정보 -->
        <div class="mb-6">
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
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeModal"
        >
          취소
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="isProcessing"
          :disabled="!isFormValid"
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
  emits: ['update:modelValue', 'payment-success', 'payment-fail'],
  setup(props, { emit }) {
    const { showMessage } = useSnackbar()
    
    // 반응형 데이터
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    const isProcessing = ref(false)
    const paymentWidget = ref(null)
    const tossPayments = ref(null)
    
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
        
        // 토스페이먼츠 SDK 로드 확인
        if (typeof window.TossPayments === 'undefined') {
          throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다.')
        }
        
        tossPayments.value = window.TossPayments(clientKey)
        
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
        await paymentWidget.value.renderAgreement({
          selector: '#agreement',
          variantKey: 'DEFAULT'
        })
        
      } catch (error) {
        console.error('토스페이먼츠 초기화 실패:', error)
        showMessage({
          type: 'error',
          text: '결제 시스템 초기화에 실패했습니다.'
        })
      }
    }
    
    // 결제 요청
    const requestPayment = async () => {
      if (!paymentWidget.value) {
        showMessage({
          type: 'error',
          text: '결제 시스템이 초기화되지 않았습니다.'
        })
        return
      }
      
      if (!isFormValid.value) {
        showMessage({
          type: 'error',
          text: '고객 정보를 올바르게 입력해주세요.'
        })
        return
      }
      
      isProcessing.value = true
      
      try {
        // 결제 요청
        await paymentWidget.value.requestPayment({
          orderId: props.orderInfo.orderId,
          orderName: props.orderInfo.orderName,
          successUrl: `${window.location.origin}/payment/success?orderId=${props.orderInfo.orderId}&amount=${props.orderInfo.amount}&roomId=${props.orderInfo.roomId || ''}`,
          failUrl: `${window.location.origin}/payment/fail?orderId=${props.orderInfo.orderId}&roomId=${props.orderInfo.roomId || ''}`,
          customerEmail: customerInfo.value.customerEmail,
          customerName: customerInfo.value.customerName,
          customerMobilePhone: customerInfo.value.customerMobilePhone
        })
        
      } catch (error) {
        console.error('결제 요청 실패:', error)
        isProcessing.value = false
        
        // 결제 실패 처리
        emit('payment-fail', error)
        showMessage({
          type: 'error',
          text: '결제 요청에 실패했습니다.'
        })
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
        
        // 토스페이먼츠 초기화
        await initializeTossPayments()
      }
    })
    
    // 컴포넌트 마운트 시 토스페이먼츠 SDK 로드
    onMounted(() => {
      // 토스페이먼츠 SDK가 이미 로드되어 있는지 확인
      if (typeof window.TossPayments === 'undefined') {
        // SDK 로드
        const script = document.createElement('script')
        script.src = 'https://js.tosspayments.com/v2/standard'
        script.async = true
        script.onload = () => {
          console.log('토스페이먼츠 SDK 로드 완료')
        }
        script.onerror = () => {
          console.error('토스페이먼츠 SDK 로드 실패')
          showMessage({
            type: 'error',
            text: '결제 시스템을 불러올 수 없습니다.'
          })
        }
        document.head.appendChild(script)
      }
    })
    
    // 컴포넌트 언마운트 시 정리
    onUnmounted(() => {
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
      formatPrice,
      closeModal,
      requestPayment
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
</style>
