<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h4 text-center mb-6">
            회원가입
          </v-card-title>
          
          <v-form @submit.prevent="handleRegister" ref="formRef">
            <v-text-field
              v-model="formData.email"
              label="이메일"
              type="email"
              :rules="emailRules"
              required
              prepend-icon="mdi-email"
            />
            
            <v-text-field
              v-model="formData.nickname"
              label="닉네임"
              :rules="nicknameRules"
              required
              prepend-icon="mdi-account"
            />
            
            <v-text-field
              v-model="formData.password"
              label="비밀번호"
              type="password"
              :rules="passwordRules"
              required
              prepend-icon="mdi-lock"
            />
            
            <v-text-field
              v-model="formData.confirmPassword"
              label="비밀번호 확인"
              type="password"
              :rules="confirmPasswordRules"
              required
              prepend-icon="mdi-lock-check"
            />
            
            <v-checkbox
              v-model="formData.agreeToTerms"
              :rules="[v => !!v || '약관에 동의해주세요']"
              label="이용약관 및 개인정보처리방침에 동의합니다"
            />
            
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              class="mb-4"
            >
              회원가입
            </v-btn>
          </v-form>
          
          <v-divider class="my-4" />
          
          <v-card-actions class="justify-center">
            <v-btn
              text
              color="primary"
              @click="$router.push('/auth/login')"
            >
              이미 계정이 있으신가요? 로그인
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const formRef = ref(null)
    const loading = ref(false)
    
    const formData = reactive({
      email: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    })
    
    const emailRules = [
      v => !!v || '이메일을 입력해주세요',
      v => /.+@.+\..+/.test(v) || '올바른 이메일 형식을 입력해주세요'
    ]
    
    const nicknameRules = [
      v => !!v || '닉네임을 입력해주세요',
      v => v.length >= 2 || '닉네임은 2자 이상이어야 합니다',
      v => v.length <= 20 || '닉네임은 20자 이하여야 합니다'
    ]
    
    const passwordRules = [
      v => !!v || '비밀번호를 입력해주세요',
      v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
      v => /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(v) || '비밀번호는 영문과 숫자를 포함해야 합니다'
    ]
    
    const confirmPasswordRules = computed(() => [
      v => !!v || '비밀번호 확인을 입력해주세요',
      v => v === formData.password || '비밀번호가 일치하지 않습니다'
    ])
    
    const handleRegister = async () => {
      if (!formRef.value.validate()) return
      
      loading.value = true
      try {
        await authStore.register(formData)
        router.push('/auth/login')
      } catch (error) {
        console.error('회원가입 실패:', error)
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
      nicknameRules,
      passwordRules,
      confirmPasswordRules,
      handleRegister
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
