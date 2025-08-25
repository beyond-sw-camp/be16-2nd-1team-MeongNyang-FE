<template>
  <v-container fluid class="fill-height login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="login-card" elevation="8" rounded="xl">
          <v-card-title class="text-h4 text-center mb-6 pt-8">
            로그인
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            멍멍냥냥에 오신 것을 환영합니다
          </v-card-subtitle>

          <v-card-text class="pa-8">
            <v-form ref="formRef" @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                label="이메일"
                type="email"
                placeholder="example@email.com"
                :rules="emailRules"
                :disabled="busy"
                prepend-icon="mdi-email"
                variant="outlined"
                rounded="lg"
                class="rounded-input mb-4"
                autocomplete="username"
                hint="가입한 이메일을 입력해주세요"
                persistent-hint
              />

              <v-text-field
                v-model="form.password"
                label="비밀번호"
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호를 입력하세요"
                :rules="passwordRules"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                :disabled="busy"
                prepend-icon="mdi-lock"
                variant="outlined"
                rounded="lg"
                class="rounded-input mb-4"
                autocomplete="current-password"
                hint="8자 이상, 영문/숫자 조합"
                persistent-hint
              />

              <v-checkbox
                v-model="form.rememberMe"
                label="로그인 상태 유지"
                :disabled="busy"
                class="mb-4"
                color="primary"
              />

              <v-alert
                v-if="errorMsg"
                type="error"
                variant="tonal"
                class="mb-4"
                density="compact"
                rounded="lg"
              >
                <template #prepend>
                  <v-icon>mdi-alert-circle</v-icon>
                </template>
                {{ errorMsg }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="busy"
                rounded="lg"
                height="56"
                class="mb-4"
              >
                로그인
              </v-btn>
            </v-form>

            <v-divider class="my-6">
              <span class="px-4 text-grey">또는</span>
            </v-divider>
            
            <social-auth-buttons :disabled="busy" :edge="16" />
            
            <div class="utility-links mt-6">
              <div class="d-flex justify-space-between align-center mb-3">
                <v-btn
                  variant="outlined"
                  color="info"
                  :disabled="busy"
                  @click="$router.push('/auth/forgot-password')"
                  rounded="lg"
                  class="utility-btn"
                  prepend-icon="mdi-key"
                >
                  비밀번호 찾기
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="primary"
                  :disabled="busy"
                  @click="$router.push('/auth/register')"
                  rounded="lg"
                  class="utility-btn"
                  prepend-icon="mdi-account-plus"
                >
                  회원가입
                </v-btn>
              </div>
              
              <div class="text-center">
                <v-btn
                  variant="outlined"
                  color="secondary"
                  :disabled="busy"
                  @click="$router.push('/auth/unlock-account')"
                  rounded="lg"
                  class="utility-btn"
                  prepend-icon="mdi-lock-open"
                >
                  계정 잠금 해제
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'

export default {
  name: 'LoginView',
  components: {SocialAuthButtons},
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const formRef = ref(null)
    const form = reactive({
      email: '',
      password: '',
      rememberMe: false,
    })

    const showPassword = ref(false)
    const localLoading = ref(false)
    const errorMsg = ref('')

    // Vuetify rules
    const emailRules = [
      v => !!v || '이메일을 입력해주세요.',
      v => /.+@.+\..+/.test(v) || '올바른 이메일 형식을 입력해주세요.',
    ]
    const passwordRules = [v => !!v || '비밀번호를 입력해주세요.']

    // 전역/로컬 로딩 합쳐서 버튼/필드 제어
    const busy = computed(() => localLoading.value || authStore.loading)

    // 필드 변경 시 에러 메시지 클리어
    watch(() => [form.email, form.password], () => { errorMsg.value = '' })

    const handleLogin = async () => {
      const { valid } = await formRef.value.validate()
      if (!valid) return

      localLoading.value = true
      errorMsg.value = ''
      try {
        await authStore.login({
          email: form.email,
          password: form.password,
          rememberMe: form.rememberMe,
        })

        // ?redirect=/path 지원, 없으면 /dashboard 로
        const redirect = typeof route.query.redirect === 'string'
          ? route.query.redirect
          : '/dashboard'
        router.push(redirect)
      } catch (e) {
        const status = e?.response?.status
        // 다양한 위치에서 메시지 추출 시도
        const possibleMessages = [
          e?.response?.data?.message,     // 일반적인 위치
          e?.response?.data?.status?.message, // CommonRes 구조
          e?.response?.data?.error,       // 에러 필드
          e?.response?.data?.data,        // data 필드가 메시지인 경우
          e?.message,                     // axios 에러 메시지
          e?.response?.statusText         // HTTP 상태 텍스트
        ]
        
        const msg = possibleMessages.find(m => m && typeof m === 'string' && m.trim()) || ''
        
        console.error('🚨 로그인 에러 상세 분석:')
        console.error('- Status:', status)
        console.error('- Message 원본:', `"${msg}"`)
        console.error('- Full Response:', e?.response?.data)
        console.error('- Message 체크:', {
          '사용하지 않는 계정': msg.includes('사용하지 않는 계정'),
          '잠긴 계정': msg.includes('잠긴 계정'),
          '계정이 잠겼습니다': msg.includes('계정이 잠겼습니다'),
          '로그인 시도 실패': msg.includes('로그인 시도 실패'),
          '비밀번호가 다릅니다': msg.includes('비밀번호가 다릅니다'),
          '이메일 혹은 비밀번호가 다릅니다': msg.includes('이메일 혹은 비밀번호가 다릅니다'),
          originalMessage: msg
        })
        
        // 400: IllegalArgumentException - 사용하지 않는 계정, 잠긴 계정, 비밀번호 불일치
        if (status === 400) {
          if (msg.includes('사용하지 않는 계정')) {
            errorMsg.value = '😔 삭제된 계정입니다. 새로 가입해주세요!'
          } else if (msg.includes('잠긴 계정') || msg.includes('계정이 잠겼습니다') || msg.includes('로그인 시도횟수를 초과')) {
            errorMsg.value = '🔒 계정이 잠겼습니다. "계정 잠금 해제"를 이용해주세요.'
          } else if (msg.includes('로그인 시도 실패') || 
                     msg.includes('비밀번호가 다릅니다') || 
                     msg.includes('이메일 혹은 비밀번호가 다릅니다')) {
            errorMsg.value = '❌ 이메일 또는 비밀번호가 올바르지 않습니다.'
          } else {
            errorMsg.value = '❌ 이메일 또는 비밀번호가 올바르지 않습니다.'
          }
        }
        // 401: 인증 실패
        else if (status === 401) {
          errorMsg.value = '🔐 인증에 실패했습니다. 다시 확인해주세요.'
        }
        // 423: 계정 잠김 (레거시 호환)
        else if (status === 423) {
          errorMsg.value = '🔒 계정이 잠겨있습니다. 계정 잠금 해제를 이용해주세요.'
        }
        // 429: 너무 많은 시도
        else if (status === 429) {
          errorMsg.value = '⏰ 로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
        }
        // 500: 서버 오류
        else if (status === 500) {
          errorMsg.value = '🛠️ 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
        // 기타 오류
        else {
          errorMsg.value = msg ? `💭 ${msg}` : '💭 로그인에 문제가 생겼어요. 다시 시도해주세요!'
        }
      } finally {
        localLoading.value = false
      }
    }

    return {
      formRef,
      form,
      showPassword,
      busy,
      emailRules,
      passwordRules,
      errorMsg,
      handleLogin,
    }
  },
}
</script>

<style scoped>
.fill-height { 
  min-height: 100vh; 
}

.login-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
}

.login-card {
  border-radius: 24px !important;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.rounded-input {
  border-radius: 16px !important;
}

.rounded-input :deep(.v-field__outline) {
  border-radius: 16px !important;
}

.rounded-input :deep(.v-field__outline__start) {
  border-radius: 16px 0 0 16px !important;
}

.rounded-input :deep(.v-field__outline__end) {
  border-radius: 0 16px 16px 0 !important;
}

.utility-links .utility-btn {
  border-radius: 16px !important;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 120px;
}

.utility-links .utility-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 반응형 조정 */
@media (max-width: 960px) {
  .login-card {
    margin: 1rem;
  }
}

@media (max-width: 600px) {
  .login-card {
    margin: 0.5rem;
    border-radius: 16px !important;
  }
  
  .utility-links .utility-btn {
    min-width: 100px;
    font-size: 0.875rem;
  }
}
</style>
