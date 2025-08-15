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
            />
            
            <v-text-field
              v-model="formData.password"
              label="비밀번호"
              type="password"
              :rules="passwordRules"
              required
              prepend-icon="mdi-lock"
            />
            
            <v-checkbox
              v-model="formData.rememberMe"
              label="로그인 상태 유지"
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
          
          <v-card-actions class="justify-center">
            <v-btn
              text
              color="primary"
              @click="$router.push('/auth/register')"
            >
              회원가입
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="$router.push('/auth/forgot-password')"
            >
              비밀번호 찾기
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
      v => !!v || '비밀번호를 입력해주세요',
      v => v.length >= 6 || '비밀번호는 6자 이상이어야 합니다'
    ]
    
    const handleLogin = async () => {
      if (!formRef.value.validate()) return
      
      loading.value = true
      try {
        await authStore.login(formData)
        router.push('/dashboard')
      } catch (error) {
        console.error('로그인 실패:', error)
        // 에러 처리 로직 추가
      } finally {
        loading.value = false
      }
    }
    
    return {
      formRef,
      formData,
      loading,
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
