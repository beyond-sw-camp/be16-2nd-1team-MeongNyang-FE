<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100vh;">
    <v-card max-width="500" class="text-center pa-8">
      <v-card-title class="text-h4 mb-4">
        <v-icon color="error" size="64" class="mb-4">mdi-close-circle</v-icon>
        <div>결제 실패</div>
      </v-card-title>
      
      <v-card-text class="text-h6 mb-6">
        결제 처리 중 오류가 발생했습니다.
      </v-card-text>
      
      <v-card-text class="text-body-1 mb-6">
        {{ errorMessage }}
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
        <v-btn
          color="secondary"
          variant="outlined"
          size="large"
          @click="retryPayment"
        >
          다시 결제하기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'PaymentFailView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const errorMessage = ref('알 수 없는 오류가 발생했습니다.')
    
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
    
    // 다시 결제하기
    const retryPayment = () => {
      // URL 파라미터에서 채팅방 ID 가져오기
      const roomId = route.query.roomId
      if (roomId) {
        router.push(`/chat/${roomId}`)
      } else {
        router.push('/chat')
      }
    }
    
    onMounted(() => {
      // URL 파라미터에서 에러 메시지 가져오기
      const error = route.query.error
      if (error) {
        errorMessage.value = decodeURIComponent(error)
      }
    })
    
    return {
      errorMessage,
      goToChat,
      retryPayment
    }
  }
}
</script>
