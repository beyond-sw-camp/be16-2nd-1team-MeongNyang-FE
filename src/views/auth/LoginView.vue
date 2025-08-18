<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            로그인
          </v-card-title>
          
          <v-form @submit.prevent="handleLogin" ref="formRef">
            <v-text-field
              v-model="formData.email"
              label="이메일"
              type="email"
              :rules="emailRules"
              required
              prepend-icon="mdi-email"
              :disabled="loading"
            />
            
            <v-text-field
              v-model="formData.password"
              label="비밀번호"
              :type="showPassword ? 'text' : 'password'"
              :rules="passwordRules"
              required
              prepend-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              :disabled="loading"
            />
            
            <v-checkbox
              v-model="formData.rememberMe"
              label="로그인 상태 유지"
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
              로그인
            </v-btn>
          </v-form>
          
          <v-divider class="my-4" />
          
          <v-card-actions class="justify-space-between">
            <v-btn
              text
              color="primary"
              @click="$router.push('/auth/forgot-password')"
              :disabled="loading"
            >
              비밀번호 찾기
            </v-btn>
            
            <v-btn
              text
              color="primary"
              @click="$router.push('/auth/register')"
              :disabled="loading"
            >
              회원가입
            </v-btn>
          </v-card-actions>
          
          <v-card-actions class="justify-center">
            <v-btn
              text
              color="secondary"
              @click="$router.push('/auth/unlock-account')"
              :disabled="loading"
            >
              계정 잠금 해제
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
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const formRef = ref(null)
    const loading = ref(false)
    const showPassword = ref(false)
    
    const formData = reactive({
      email: '',
      password: '',
      rememberMe: false
    })
    
    const emailRules = [
      v => !!v || '이메일을 입력해주세요',
      v => /.+@.+\..+/.test(v) || '올바른 이메일 형식을 입력해주세요'
    ]
    
    const passwordRules = [
      v => !!v || '비밀번호를 입력해주세요'
    ]
    
    const handleLogin = async () => {
      if (!formRef.value.validate()) return
      
      loading.value = true
      try {
        await authStore.login(formData)
        
        // 로그인 성공 시 대시보드로 이동
        router.push('/dashboard')
      } catch (error) {
        console.error('로그인 실패:', error)
        
        // 에러 메시지 처리
        let errorMessage = '로그인에 실패했습니다.'
        
        if (error.response?.status === 400) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (error.response?.status === 401) {
          errorMessage = '인증에 실패했습니다.'
        } else if (error.response?.status === 423) {
          errorMessage = '계정이 잠겨있습니다. 계정 잠금 해제를 이용해주세요.'
        } else if (error.response?.status === 429) {
          errorMessage = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
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
      showPassword,
      emailRules,
      passwordRules,
      handleLogin
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
