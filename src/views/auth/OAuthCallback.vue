<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h5 text-center">소셜 로그인 처리중…</v-card-title>
          <v-card-text class="text-center">
            잠시만 기다려주세요.
            <v-progress-linear indeterminate class="mt-4"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { saveTokens } from '@/utils/auth'


const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  // 동적 라우트라 provider가 반드시 옴
  const provider = String(route.params.provider || '').toLowerCase()
  const code = String(route.query.code || '')
  console.log('[OAUTH]', { provider, code, path: route.fullPath })

  if (!provider || !code) {
    router.replace({ name: 'Login' })
    return
  }

  try {
    // /users/login/{provider} 로 인가코드 교환
    const { data, headers } = await userAPI.oauthLogin(provider, code)
    const payload = data?.data ?? data

    // 즉시 로그인 케이스 (AT 바디, RT 헤더)
    if (payload?.accessToken) {
      const at = data?.data?.accessToken || data?.accessToken
      const rt = headers?.['x-refresh-token']
      saveTokens(at, rt)
      auth.accessToken = at
      if (rt) auth.refreshToken = rt
      try { await auth.getCurrentUser() } catch(e) {void e}
      router.replace({ name: 'Dashboard' })
      return
    }

    // 이메일 매칭 → 연동 확인
    if (payload?.needLink) {
      router.replace({
        name: 'oauth-link',
        query: {
          provider,
          email: payload.email,
          linkTicket: payload.linkTicket, // 반드시 전달
        },
      })
      return
    }

    // 신규가입 → 추가정보
    if (payload?.isNewUser || payload?.needExtra || payload?.signupTicket) {
      router.replace({
        name: 'signup-extra',
        query: {
          provider,
          signupTicket: payload.signupTicket,
          email: payload.email,
        },
      })
      return
    }

    router.replace({ name: 'Login' })
  } catch (e) {
  // 서버 메시지/상태 추출
  const status = e?.response?.status
  const payload = e?.response?.data?.data
  const msg = e?.response?.data?.message || e?.message || ''

  // 서버가 socialType을 내려줄 수도, 아닐 수도 있음
  // (없으면 문구에서 추정 → 그래도 못 찾으면 generic)
  const existingType =
    (payload && (payload.socialType || payload.registeredWith)) ||
    (/(kakao|카카오)/i.test(msg) ? 'KAKAO' :
     /(google|구글)/i.test(msg) ? 'GOOGLE' : '')

  // 이메일이 다른 소셜로 이미 가입/연동된 경우
  if (status === 400 || /연동된 계정|다른 방식/i.test(msg)) {
    const label =
      existingType === 'GOOGLE' ? 'Google' :
      existingType === 'KAKAO'  ? 'Kakao'  : '소셜'
    alert(`이 이메일은 ${label}로 이미 가입되어 있어요. 해당 방법으로 로그인해주세요.`)

    // 로그인 화면에 힌트 전달(버튼 쪽에 안내 띄우기)
    router.replace({ name: 'Login', query: { suggest: existingType || 'SOCIAL' } })
    return
  }

  alert('소셜 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
  router.replace({ name: 'Login' })
}

})
</script>


<style scoped>
.fill-height { min-height: 70vh; }
</style>
