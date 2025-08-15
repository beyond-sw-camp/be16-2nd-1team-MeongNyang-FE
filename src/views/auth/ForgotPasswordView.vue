<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            비밀번호 찾기
          </v-card-title>
          
          <v-form @submit.prevent="handleForgotPassword" ref="formRef">
            <v-text-field
              v-model="formData.name"
              label="이름"
              :rules="nameRules"
              required
              prepend-icon="mdi-account"
            />
            
            <v-text-field
              v-model="formData.email"
              label="이메일"
              type="email"
              :rules="emailRules"
              required
              prepend-icon="mdi-email"
            />
            
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              class="mb-4"
            >
              임시 비밀번호 발급
            </v-btn>
          </v-form>
          
          <v-divider class="my-4" />
          
          <v-card-actions class="justify-center">
            <v-btn
              text
              color="primary"
              @click="$router.push('/auth/login')"
            >
              로그인으로 돌아가기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const authStore = useAuthStore()
    const formRef = ref(null)
    const loading = ref(false)
    
    const formData = reactive({
      name: '',
      email: ''
    })
    
    const nameRules = [
      v => !!v || '이름을 입력해주세요',
      v => v.length >= 2 || '이름은 2자 이상이어야 합니다'
    ]
    
    const emailRules = [
      v => !!v || '이메일을 입력해주세요',
      v => /.+@.+\..+/.test(v) || '올바른 이메일 형식을 입력해주세요'
    ]
    
    const handleForgotPassword = async () => {
      if (!formRef.value.validate()) return
      
      loading.value = true
      try {
        await authStore.lostPassword(formData)
        // 성공 메시지 표시
        alert('임시 비밀번호가 이메일로 발송되었습니다.')
      } catch (error) {
        console.error('비밀번호 찾기 실패:', error)
        alert('비밀번호 찾기에 실패했습니다. 다시 시도해주세요.')
      } finally {
        loading.value = false
      }
    }
    
    return {
      formRef,
      formData,
      loading,
      nameRules,
      emailRules,
      handleForgotPassword
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
