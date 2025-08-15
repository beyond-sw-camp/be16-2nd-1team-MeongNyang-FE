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
              :disabled="emailVerified"
            />
            
            <!-- 이메일 인증 섹션 -->
            <div v-if="!emailVerified" class="mb-4">
              <v-btn
                @click="sendVerificationEmail"
                :loading="sendingEmail"
                :disabled="!formData.email || !isValidEmail(formData.email)"
                color="secondary"
                block
                class="mb-2"
              >
                이메일 인증번호 발송
              </v-btn>
              
              <v-text-field
                v-model="verificationCode"
                label="인증번호"
                :rules="[v => !!v || '인증번호를 입력해주세요']"
                required
                prepend-icon="mdi-key"
                :disabled="!sendingEmail"
              />
              
              <v-btn
                @click="verifyEmail"
                :loading="verifyingEmail"
                :disabled="!verificationCode"
                color="info"
                block
                class="mb-2"
              >
                인증번호 확인
              </v-btn>
            </div>
            
            <v-alert
              v-if="emailVerified"
              type="success"
              class="mb-4"
            >
              ✅ 이메일 인증이 완료되었습니다.
            </v-alert>
            
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
              :disabled="!emailVerified"
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const formRef = ref(null)
    const loading = ref(false)
    const sendingEmail = ref(false)
    const verifyingEmail = ref(false)
    const emailVerified = ref(false)
    const verificationCode = ref('')
    
    const formData = reactive({
      email: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    })
    
    const isValidEmail = (email) => {
      return /.+@.+\..+/.test(email)
    }
    
    const emailRules = [
      v => !!v || '이메일을 입력해주세요',
      v => isValidEmail(v) || '올바른 이메일 형식을 입력해주세요'
    ]
    
    const nicknameRules = [
      v => !!v || '닉네임을 입력해주세요',
      v => v.length >= 2 || '닉네임은 2자 이상이어야 합니다',
      v => v.length <= 20 || '닉네임은 20자 이하여야 합니다'
    ]
    
    const passwordRules = [
      v => !!v || '비밀번호를 입력해주세요',
      v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
      v => /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(v) || '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'
    ]
    
    const confirmPasswordRules = [
      v => !!v || '비밀번호 확인을 입력해주세요',
      v => v === formData.password || '비밀번호가 일치하지 않습니다'
    ]
    
    const sendVerificationEmail = async () => {
      if (!isValidEmail(formData.email)) {
        alert('올바른 이메일 형식을 입력해주세요.')
        return
      }
      
      sendingEmail.value = true
      try {
        await authStore.verifyEmail(formData.email)
        alert('인증번호가 이메일로 발송되었습니다.')
      } catch (error) {
        console.error('이메일 발송 실패:', error)
        alert('인증번호 발송에 실패했습니다. 다시 시도해주세요.')
      } finally {
        sendingEmail.value = false
      }
    }
    
    const verifyEmail = async () => {
      if (!verificationCode.value) {
        alert('인증번호를 입력해주세요.')
        return
      }
      
      verifyingEmail.value = true
      try {
        await authStore.verifyEmailCheck(formData.email, verificationCode.value)
        emailVerified.value = true
        alert('이메일 인증이 완료되었습니다.')
      } catch (error) {
        console.error('이메일 인증 실패:', error)
        alert('인증번호가 올바르지 않습니다. 다시 확인해주세요.')
      } finally {
        verifyingEmail.value = false
      }
    }
    
    const handleRegister = async () => {
      if (!formRef.value.validate()) return
      
      if (!emailVerified.value) {
        alert('이메일 인증을 완료해주세요.')
        return
      }
      
      loading.value = true
      try {
        await authStore.register(formData)
        alert('회원가입이 완료되었습니다. 로그인해주세요.')
        router.push('/auth/login')
      } catch (error) {
        console.error('회원가입 실패:', error)
        alert('회원가입에 실패했습니다. 다시 시도해주세요.')
      } finally {
        loading.value = false
      }
    }
    
    return {
      formRef,
      formData,
      loading,
      sendingEmail,
      verifyingEmail,
      emailVerified,
      verificationCode,
      emailRules,
      nicknameRules,
      passwordRules,
      confirmPasswordRules,
      isValidEmail,
      sendVerificationEmail,
      verifyEmail,
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
