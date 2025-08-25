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

        // ?redirect=/path 지원, 없으면 홈으로
        const redirect = typeof route.query.redirect === 'string'
          ? route.query.redirect
          : '/'
        
        // 홈으로 리다이렉트하는 경우 강제로 새로고침하여 상태 반영
        if (redirect === '/') {
          window.location.href = '/'
        } else {
          router.push(redirect)
        }
      } catch (e) {
        const s = e?.response?.status
        if (s === 400) errorMsg.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
        else if (s === 401) errorMsg.value = '인증에 실패했습니다.'
        else if (s === 423) errorMsg.value = '계정이 잠겨있습니다. 계정 잠금 해제를 이용해주세요.'
        else if (s === 429) errorMsg.value = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
        else errorMsg.value = '로그인에 실패했습니다.'
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
