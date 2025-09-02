<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            임시비밀번호 발급
          </v-card-title>
          
          <v-card-text class="text-center mb-4">
            <p>가입 시 등록한 이름과 이메일을 입력하시면<br>임시 비밀번호를 발급해드립니다.</p>
          </v-card-text>
          
          <v-form @submit.prevent="handleForgotPassword" ref="formRef">
            <v-text-field
              v-model="formData.name"
              label="이름"
              :rules="nameRules"
              required
              prepend-icon="mdi-account"
              :disabled="loading"
            />
            
            <v-text-field
              v-model="formData.email"
              label="이메일"
              type="email"
              :rules="emailRules"
              required
              prepend-icon="mdi-email"
              :disabled="loading"
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
              :disabled="loading"
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const formRef = ref(null)
    const loading = ref(false)
    
    const formData = reactive({
      name: '',
      email: ''
    })
    
    const nameRules = [
      v => !!v || '이름을 입력해주세요',
      v => v.length >= 2 || '이름은 2자 이상이어야 합니다',
      v => v.length <= 20 || '이름은 20자 이하여야 합니다',
      v => /^[가-힣a-zA-Z\s]+$/.test(v) || '이름은 한글, 영문, 공백만 입력 가능합니다'
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
        alert('임시 비밀번호가 이메일로 발송되었습니다.\n이메일을 확인해주세요.')
        router.push('/auth/login')
      } catch (error) {
        console.error('비밀번호 찾기 실패:', error)
        
        let errorMessage = '비밀번호 찾기에 실패했습니다.'
        
        if (error.response?.status === 400) {
          errorMessage = '입력한 정보가 올바르지 않습니다.'
        } else if (error.response?.status === 404) {
          errorMessage = '등록되지 않은 사용자입니다.'
        } else if (error.response?.status === 429) {
          errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        }
        
        alert(errorMessage)
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
