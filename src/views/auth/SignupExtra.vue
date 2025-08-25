<!-- src/views/auth/SignupExtra.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h5 text-center mb-2">추가정보 입력</v-card-title>

          <!-- 남은 시간 표시 + 진행도 -->
          <v-alert
            :type="expired ? 'error' : 'warning'"
            density="comfortable"
            class="mb-3"
          >
            <b>남은 시간</b>:
            <span v-if="!expired">{{ timeLeftText }}</span>
            <span v-else>입력 시간이 만료되었습니다. 다시 로그인해주세요.</span>
          </v-alert>
          <v-progress-linear
            :model-value="progress"
            :color="expired ? 'error' : 'warning'"
            height="8"
            rounded
            class="mb-4"
          />

          <v-form ref="formRef" @submit.prevent="submitExtra">
            <!-- 이름 -->
            <v-text-field
              v-model="form.name"
              label="이름"
              :rules="nameRules"
              prepend-icon="mdi-account-card-details"
              :disabled="loading || expired"
            />

            <!-- 닉네임 + 중복확인 -->
            <v-row dense>
              <v-col cols="8">
                <v-text-field
                  v-model="form.nickname"
                  label="닉네임"
                  :rules="nicknameRules"
                  prepend-icon="mdi-account"
                  :disabled="loading || expired"
                  @input="resetNicknameCheck"
                />
              </v-col>
              <v-col cols="4">
                <v-btn
                  block
                  class="mt-1"
                  :color="nicknameAvailable === true ? 'success' : 'info'"
                  :disabled="loading || expired || !nicknameValid"
                  :loading="checkingNickname"
                  @click="checkNicknameDup"
                >
                  <template v-if="nicknameAvailable === true">사용가능</template>
                  <template v-else>중복확인</template>
                </v-btn>
              </v-col>
            </v-row>

            <v-btn
              type="submit"
              color="primary"
              block
              class="mt-4"
              :loading="loading"
              :disabled="!canSubmit"
            >
              완료하고 시작하기
            </v-btn>

            <div class="text-center mt-3">
              <v-btn variant="text" @click="goLogin" :disabled="loading">건너뛰기</v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userAPI } from '@/services/api'
import { saveTokens } from '@/utils/auth'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

/* ---------- 10분 타이머 ---------- */
const TICKET_TTL_MS = 10 * 60 * 1000 // 10분
const formRef = ref(null)
const loading = ref(false)

const signupTicket = computed(() => String(route.query.signupTicket || ''))
const STORAGE_KEY = computed(() => `signupExtra:${signupTicket.value}:startedAt`)

const startedAt = ref(0)
const remainingMs = ref(TICKET_TTL_MS)
let timer = null

const expired = computed(() => remainingMs.value <= 0)
const timeLeftText = computed(() => {
  const ms = Math.max(0, remainingMs.value)
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const progress = computed(() => {
  const p = (remainingMs.value / TICKET_TTL_MS) * 100
  return Math.max(0, Math.min(100, Math.round(p)))
})

function tick() {
  const now = Date.now()
  remainingMs.value = Math.max(0, (startedAt.value + TICKET_TTL_MS) - now)
  if (remainingMs.value <= 0) {
    clearInterval(timer)
    alert('추가정보 입력 시간이 만료되었습니다. 다시 로그인해주세요.')
    router.replace({ name: 'Login' })
  }
}

onMounted(() => {
  if (!signupTicket.value) {
    router.replace({ name: 'Login' })
    return
  }
  const saved = Number(sessionStorage.getItem(STORAGE_KEY.value) || 0)
  startedAt.value = saved > 0 ? saved : Date.now()
  if (!saved) sessionStorage.setItem(STORAGE_KEY.value, String(startedAt.value))
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

/* ---------- 폼/닉네임 로직 ---------- */
const checkingNickname = ref(false)
const nicknameAvailable = ref(null)

const form = reactive({
  name: '',
  nickname: ''
})

const nameRules = [
  v => !!v || '이름을 입력해주세요.',
  v => (v && v.length >= 2) || '이름은 2자 이상이어야 합니다.'
]
const nicknameRules = [
  v => !!v || '닉네임을 입력해주세요.',
  v => (v && v.length >= 2) || '닉네임은 2자 이상이어야 합니다.'
]

const nicknameValid = computed(() => form.nickname && form.nickname.length >= 2)
const canSubmit = computed(() =>
  !loading.value &&
  !expired.value &&
  form.name &&
  form.name.length >= 2 &&
  nicknameValid.value &&
  nicknameAvailable.value === true
)

const resetNicknameCheck = () => { nicknameAvailable.value = null }

const checkNicknameDup = async () => {
  if (!nicknameValid.value || expired.value) return
  checkingNickname.value = true
  try {
    await userAPI.checkNickname(form.nickname)
    nicknameAvailable.value = true
  } catch {
    nicknameAvailable.value = false
    alert('이미 사용 중인 닉네임입니다.')
  } finally {
    checkingNickname.value = false
  }
}

/* ---------- 제출 ---------- */
const submitExtra = async () => {
  if (expired.value) {
    alert('입력 시간이 만료되었습니다. 다시 로그인해주세요.')
    router.replace({ name: 'Login' })
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const { data, headers } = await userAPI.signupExtra({
      signupTicket: signupTicket.value,
      name: form.name,
      nickname: form.nickname
    })

    const payload = data?.data ?? data
    const at = payload?.accessToken
    const rt = headers?.['x-refresh-token']

    if (at) {
      saveTokens(at, rt)
      auth.accessToken = at
      if (rt) auth.refreshToken = rt
      try { await auth.getCurrentUser() } catch (e) {void(e)}
      // 완료됐으니 타이머 키 제거
      sessionStorage.removeItem(STORAGE_KEY.value)
      router.replace({ name: 'Home' })
    } else {
      alert('로그인 토큰을 받지 못했습니다. 다시 시도해주세요.')
    }
  } catch (e) {
    console.error('[signup-extra error]', e)
    alert(e?.response?.data?.message || '추가정보 저장에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const goLogin = () => router.replace({ name: 'Login' })
</script>

<style scoped>
.fill-height { min-height: 70vh; }
</style>
