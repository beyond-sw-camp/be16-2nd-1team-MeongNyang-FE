<template>
  <v-container fluid class="fill-height register-container">
    <v-row justify="center" align="center" class="fill-height">
      <!-- 회원가입 폼 -->
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="register-card" elevation="8" rounded="xl">
          <v-card-title class="text-h4 text-center mb-6 pt-8">
            회원가입
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            펫키 계정을 만들어 시작하세요
          </v-card-subtitle>

          <v-card-text class="pa-8">
            <v-form @submit.prevent="handleSignup" ref="formRef">
              <!-- 이메일 + 인증번호 발송 -->
              <v-row dense class="mb-4">
                <v-col cols="8">
                  <v-text-field
                    v-model="form.email"
                    label="이메일 주소"
                    type="email"
                    placeholder="example@email.com"
                    :rules="emailRules"
                    :disabled="loading || emailVerified"
                    prepend-icon="mdi-email"
                    variant="outlined"
                    rounded="lg"
                    class="rounded-input"
                  />
                  <!-- 이메일 중복/가용 즉시 안내 -->
                  <div class="text-caption mt-1"
                       :class="emailAvailable === false ? 'text-error' : (emailAvailable === true ? 'text-success' : '')"
                       v-if="emailAvailable !== null">
                    <v-icon v-if="emailAvailable" size="small" color="success" class="mr-1">mdi-check-circle</v-icon>
                    <v-icon v-else size="small" color="error" class="mr-1">mdi-close-circle</v-icon>
                    {{ emailAvailable ? '사용 가능한 이메일입니다' : '이미 사용 중인 이메일입니다' }}
                  </div>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    type="button"
                    block
                    class="mt-1"
                    :color="emailVerified ? 'success' : 'primary'"
                    :disabled="loading || sendingEmail || emailVerified || emailCooldown > 0"
                    :loading="sendingEmail"
                    rounded="lg"
                    @click="sendEmailCode"
                  >
                    <template v-if="emailVerified">인증완료</template>
                    <template v-else-if="emailCooldown > 0">{{ emailCooldown }}초</template>
                    <template v-else>인증번호</template>
                  </v-btn>
                </v-col>
              </v-row>

              <!-- 인증번호 입력 + 확인 -->
              <v-row dense v-if="!emailVerified" class="mb-4">
                <v-col cols="8">
                  <v-text-field
                    v-model="emailCode"
                    label="인증번호"
                    placeholder="인증번호를 입력하세요"
                    :disabled="loading || sendingVerify"
                    prepend-icon="mdi-shield-key"
                    variant="outlined"
                    rounded="lg"
                    class="rounded-input"
                  />
                </v-col>
                <v-col cols="4">
                  <v-btn
                    type="button"
                    block
                    class="mt-1"
                    color="secondary"
                    :disabled="loading || !emailCode"
                    :loading="sendingVerify"
                    rounded="lg"
                    @click="verifyEmailCode"
                  >확인</v-btn>
                </v-col>
              </v-row>

              <!-- 이름 -->
              <v-text-field
                v-model="form.name"
                label="이름"
                placeholder="홍길동"
                :rules="nameRules"
                :disabled="loading"
                prepend-icon="mdi-card-account-details"
                variant="outlined"
                rounded="lg"
                class="rounded-input mb-4"
                hint="실명을 입력해주세요"
                persistent-hint
              />

              <!-- 닉네임 + 중복확인 -->
              <v-row dense class="mb-4">
                <v-col cols="8">
                  <v-text-field
                    v-model="form.nickname"
                    label="닉네임"
                    placeholder="펫러버123"
                    :rules="nicknameRules"
                    :disabled="loading"
                    prepend-icon="mdi-account"
                    variant="outlined"
                    rounded="lg"
                    class="rounded-input"
                  />
                  <div class="text-caption mt-1"
                       :class="nicknameAvailable === false ? 'text-error' : (nicknameAvailable === true ? 'text-success' : '')"
                       v-if="nicknameAvailable !== null">
                    <v-icon v-if="nicknameAvailable" size="small" color="success" class="mr-1">mdi-check-circle</v-icon>
                    <v-icon v-else size="small" color="error" class="mr-1">mdi-close-circle</v-icon>
                    {{ nicknameAvailable ? '사용 가능한 닉네임입니다' : '이미 사용 중인 닉네임입니다' }}
                  </div>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    type="button"
                    block
                    class="mt-1"
                    color="info"
                    :disabled="loading || checking.nickname"
                    :loading="checking.nickname"
                    rounded="lg"
                    @click="checkNicknameDup"
                  >
                    <template v-if="nicknameAvailable === true">사용가능</template>
                    <template v-else>중복확인</template>
                  </v-btn>
                </v-col>
              </v-row>

              <!-- 비밀번호 -->
              <v-text-field
                v-model="form.password"
                label="비밀번호"
                :type="showPwd ? 'text' : 'password'"
                placeholder="8자 이상, 영문/숫자 조합"
                :rules="passwordRules"
                :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPwd = !showPwd"
                :disabled="loading"
                prepend-icon="mdi-lock"
                variant="outlined"
                rounded="lg"
                class="rounded-input mb-4"
                hint="영문, 숫자, 특수문자를 포함해 8자 이상"
                persistent-hint
              />

              <!-- 비밀번호 확인 -->
              <v-text-field
                v-model="form.passwordConfirm"
                label="비밀번호 확인"
                :type="showPwd2 ? 'text' : 'password'"
                placeholder="비밀번호를 다시 입력하세요"
                :rules="passwordConfirmRules"
                :append-icon="showPwd2 ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPwd2 = !showPwd2"
                :disabled="loading"
                prepend-icon="mdi-lock-check"
                variant="outlined"
                rounded="lg"
                class="rounded-input mb-6"
                hint="비밀번호가 일치합니다"
                persistent-hint
              />

              <!-- 약관 동의 -->
              <v-checkbox
                v-model="form.agree"
                :rules="[v => !!v || '약관에 동의해주세요']"
                label="(필수) 서비스 이용 약관에 동의합니다."
                :disabled="loading"
                class="mb-4"
                color="primary"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                class="mb-4"
                :loading="loading"
                :disabled="!canSubmit"
                rounded="lg"
                height="56"
              >
                회원가입
              </v-btn>
            </v-form>

            <v-divider class="my-6">
              <span class="px-4 text-grey">또는</span>
            </v-divider>
            
            <social-auth-buttons :disabled="loading" :edge="16" />
            
            <div class="text-center mt-6">
              <v-btn
                variant="outlined"
                color="primary"
                @click="$router.push('/auth/login')"
                :disabled="loading"
                rounded="lg"
                class="login-link-btn"
                prepend-icon="mdi-login"
              >
                이미 계정이 있으신가요? 로그인
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'

export default {
  name: 'RegisterView',
  components: { SocialAuthButtons },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // ---- 상태 ----
    const formRef = ref(null)
    const loading = ref(false)
    const showPwd = ref(false)
    const showPwd2 = ref(false)

    // 폼 데이터
    const form = reactive({
      email: '',
      name: '',
      nickname: '',
      password: '',
      passwordConfirm: '',
      agree: false
    })

    // 이메일 인증/가용
    const emailCode = ref('')
    const emailVerified = ref(false)
    const sendingEmail = ref(false)
    const sendingVerify = ref(false)
    const emailCooldown = ref(0)
    const emailAvailable = ref(null) // true/false/null
    let cooldownTimer = null

    // 닉네임 가용
    const checking = reactive({ nickname: false })
    const nicknameAvailable = ref(null) // true/false/null

    // ---- rules ----
    const emailRules = [
      v => !!v || '이메일을 입력해주세요.',
      v => /.+@.+\..+/.test(v) || '올바른 이메일 형식을 입력해주세요.'
    ]
    const nameRules = [
      v => !!v || '이름을 입력해주세요.',
      v => (v && v.length >= 2) || '이름은 2자 이상이어야 합니다.'
    ]
    const nicknameRules = [
      v => !!v || '닉네임을 입력해주세요.',
      v => (v && v.length >= 2) || '닉네임은 2자 이상이어야 합니다.'
    ]
    const passwordRules = [
      v => !!v || '비밀번호를 입력해주세요.',
      v => (v && v.length >= 8) || '비밀번호는 8자 이상이어야 합니다.'
    ]
    const passwordConfirmRules = [
      v => !!v || '비밀번호 확인을 입력해주세요.',
      v => v === form.password || '비밀번호가 일치하지 않습니다.'
    ]

    // ---- computed ----
    const emailValid = computed(() => /.+@.+\..+/.test(form.email))
    const nicknameValid = computed(() => form.nickname && form.nickname.length >= 2)
    const canSubmit = computed(() =>
      !loading.value &&
      emailVerified.value &&
      nicknameAvailable.value === true &&
      !!form.agree &&
      form.password &&
      form.passwordConfirm &&
      form.password === form.passwordConfirm &&
      form.name &&
      form.name.length >= 2
    )

    // ---- 변경 시 상태 리셋 ----
    watch(() => form.email, () => {
      emailVerified.value = false
      emailAvailable.value = null
      emailCode.value = ''
    })
    watch(() => form.nickname, () => {
      nicknameAvailable.value = null
    })

    // ---- 이메일 인증: 발송 ----
    const startCooldown = (sec = 60) => {
      emailCooldown.value = sec
      if (cooldownTimer) clearInterval(cooldownTimer)
      cooldownTimer = setInterval(() => {
        emailCooldown.value -= 1
        if (emailCooldown.value <= 0) {
          clearInterval(cooldownTimer)
          cooldownTimer = null
        }
      }, 1000)
    }

    const sendEmailCode = async () => {
      // 내부 가드(이메일 형식 확인)
      if (!emailValid.value) {
        alert('올바른 이메일을 입력해주세요.')
        return
      }
      sendingEmail.value = true
      try {
        // 1) 중복 확인
        await apiClient.post('/users/check-email', { email: form.email })
        emailAvailable.value = true

        // 2) 인증번호 발송
        await apiClient.post('/users/verify-email', { email: form.email })
        alert('인증번호를 발송했습니다. 메일함을 확인하세요.')
        startCooldown(60)
      } catch (e) {
        if (e?.response?.status === 409) {
          emailAvailable.value = false
          alert('이미 사용 중인 이메일입니다.')
        } else {
          alert('인증번호 발송에 실패했습니다.')
        }
      } finally {
        sendingEmail.value = false
      }
    }

    // ---- 이메일 인증: 확인 ----
    const verifyEmailCode = async () => {
      if (!emailCode.value) {
        alert('인증번호를 입력해주세요.')
        return
      }
      sendingVerify.value = true
      try {
        await apiClient.post('/users/verify-email-check', {
          email: form.email,
          code: emailCode.value
        })
        emailVerified.value = true
        alert('이메일 인증이 완료되었습니다.')
      } catch (e) {
        alert('인증번호가 유효하지 않습니다.')
      } finally {
        sendingVerify.value = false
      }
    }

    // ---- 닉네임 중복확인 ----
    const checkNicknameDup = async () => {
      // 내부 가드(최소 길이 안내)
      if (!nicknameValid.value) {
        alert('닉네임은 2자 이상이어야 합니다.')
        return
      }
      checking.nickname = true
      try {
        await apiClient.post('/users/check-nickname', { nickname: form.nickname })
        nicknameAvailable.value = true
        alert('사용 가능한 닉네임입니다.')
      } catch (e) {
        nicknameAvailable.value = false
        alert('이미 사용 중인 닉네임입니다.')
      } finally {
        checking.nickname = false
      }
    }

    // ---- 제출 ----
    const handleSignup = async () => {
      const { valid } = await formRef.value.validate()
      if (!valid) return

      if (!emailVerified.value) return alert('이메일 인증을 완료해주세요.')
      if (nicknameAvailable.value !== true) return alert('닉네임 중복확인을 완료해주세요.')
      if (form.password !== form.passwordConfirm) return alert('비밀번호가 일치하지 않습니다.')
      if (!form.agree) return alert('약관에 동의해주세요.')

      loading.value = true
      try {
        await authStore.register({
          email: form.email,
          password: form.password,
          name: form.name,
          nickname: form.nickname
        })
        router.push('/dashboard')
      } catch (error) {
        console.error('회원가입 실패:', error)
        let msg = '회원가입에 실패했습니다.'
        if (error.response?.status === 400) msg = '입력값을 확인해주세요.'
        else if (error.response?.status === 409) msg = '이미 존재하는 계정입니다.'
        else if (error.response?.status === 429) msg = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        alert(msg)
      } finally {
        loading.value = false
      }
    }

    onUnmounted(() => {
      if (cooldownTimer) clearInterval(cooldownTimer)
    })

    return {
      formRef,
      form,
      loading,
      showPwd, showPwd2,

      // 이메일
      emailCode, emailVerified, sendingEmail, sendingVerify,
      emailCooldown, emailAvailable,
      sendEmailCode, verifyEmailCode,

      // 닉네임
      checking, nicknameAvailable, checkNicknameDup,

      // rules / computed
      emailRules, nameRules, nicknameRules, passwordRules, passwordConfirmRules,
      canSubmit,

      handleSignup
    }
  }
}
</script>

<style scoped>
.fill-height { 
  min-height: 100vh; 
}

.text-success { 
  color: #2e7d32; 
}

.text-error { 
  color: #c62828; 
}

/* 회원가입 카드 스타일 */
.register-card {
  border-radius: 24px !important;
  overflow: hidden;
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

/* 로그인 링크 버튼 스타일 */
.login-link-btn {
  border-radius: 16px !important;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 반응형 조정 */
@media (max-width: 960px) {
  .register-card {
    margin: 1rem;
  }
}

@media (max-width: 600px) {
  .register-card {
    margin: 0.5rem;
    border-radius: 16px !important;
  }
}
</style>
