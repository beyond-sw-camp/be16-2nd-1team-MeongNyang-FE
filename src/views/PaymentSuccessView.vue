<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100vh;">
    <v-card max-width="500" class="text-center pa-8">
      <v-card-title class="text-h4 mb-4">
        <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
        <div>결제 완료</div>
      </v-card-title>
      
      <v-card-text class="text-h6 mb-6">
        결제가 성공적으로 완료되었습니다.
      </v-card-text>
      
      <v-card-text class="text-body-1 mb-6">
        주문번호: {{ orderId }}<br>
        결제금액: {{ formatPrice(amount) }}원
      </v-card-text>
      
      <v-card-actions class="justify-center">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          @click="goToChat"
        >
          채팅방으로 돌아가기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'PaymentSuccessView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const orderId = ref('')
    const amount = ref(0)
    
    // 가격 포맷팅
    const formatPrice = (price) => {
      return new Intl.NumberFormat('ko-KR').format(price)
    }
    
    // 채팅방으로 돌아가기
    const goToChat = () => {
      // URL 파라미터에서 채팅방 ID 가져오기
      const roomId = route.query.roomId
      if (roomId) {
        router.push(`/chat/${roomId}`)
      } else {
        router.push('/chat')
      }
    }
    
    onMounted(() => {
      // URL 파라미터에서 주문 정보 가져오기
      orderId.value = route.query.orderId || 'N/A'
      amount.value = parseInt(route.query.amount) || 0
    })
    
    return {
      orderId,
      amount,
      formatPrice,
      goToChat
    }
  }
}
</script>
