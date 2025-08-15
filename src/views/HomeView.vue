<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6 text-center">
          <v-card-title class="text-h4 mb-4">
            멍냥이 커뮤니티에 오신 것을 환영합니다! 🐕🐱
          </v-card-title>
          <v-card-text class="text-body-1">
            반려동물과 함께하는 즐거운 커뮤니티입니다.
            <br>다이어리, 마켓플레이스, 채팅 등 다양한 기능을 이용해보세요!
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              v-if="!isLoggedIn"
              color="primary"
              size="large"
              @click="$router.push('/auth/login')"
              class="mr-4"
            >
              로그인
            </v-btn>
            <v-btn
              v-if="!isLoggedIn"
              color="secondary"
              size="large"
              @click="$router.push('/auth/register')"
            >
              회원가입
            </v-btn>
            <v-btn
              v-if="isLoggedIn"
              color="primary"
              size="large"
              @click="$router.push('/dashboard')"
            >
              대시보드로 이동
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HomeView',
  setup() {
    const authStore = useAuthStore()
    
    const isLoggedIn = computed(() => authStore.isAuthenticated)
    
    return {
      isLoggedIn
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 80vh;
}
</style>
