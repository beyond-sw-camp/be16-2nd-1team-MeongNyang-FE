<template>
  <div class="social-wrap" :style="{ marginInline: `-${edge}px` }">
    <v-btn
      type="button"
      block
      variant="text"
      elevation="0"
      rounded="lg"
      class="pa-0 mb-2 social-img-btn"
      :disabled="disabled"
      @click="goGoogle"
    >
      <img :src="googleImg" alt="Google로 계속하기" class="social-img" />
    </v-btn>

    <v-btn
      type="button"
      block
      variant="text"
      elevation="0"
      rounded="lg"
      class="pa-0 social-img-btn"
      :disabled="disabled"
      @click="goKakao"
    >
      <img :src="kakaoImg" alt="Kakao로 계속하기" class="social-img" />
    </v-btn>
  </div>
</template>

<script>
import googleImg from '@/assets/google_login.png'
import kakaoImg from '@/assets/kakao_login.png'

export default {
  name: 'SocialAuthButtons',
  props: {
    disabled: { type: Boolean, default: false },
    edge: { type: Number, default: 12 },
  },
  setup() {
    const origin = window.location.origin

// ✅ 히스토리 모드 고정 (해시 X)
const cbUrl = (p) => `${origin}/oauth/${p}/redirect`

const goGoogle = () => {
  const client = process.env.VUE_APP_GOOGLE_CLIENT_ID
  if (!client) { alert('VUE_APP_GOOGLE_CLIENT_ID 미설정'); return }

  const params = new URLSearchParams({
    client_id: client,
    redirect_uri: cbUrl('google'),
    response_type: 'code',
    scope: 'openid email profile',
    state: 'google',
  })
  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

const goKakao = () => {
  const client = process.env.VUE_APP_KAKAO_CLIENT_ID // REST API 키
  if (!client) { alert('VUE_APP_KAKAO_CLIENT_ID 미설정'); return }

  const params = new URLSearchParams({
    client_id: client,
    redirect_uri: cbUrl('kakao'),
    response_type: 'code',
    state: 'kakao',
  })
  window.location.assign(`https://kauth.kakao.com/oauth/authorize?${params}`)
}


    return { googleImg, kakaoImg, goGoogle, goKakao }
  },
}
</script>

<style scoped>
.social-img-btn { min-height: 0; padding: 0 !important; }
.social-img { width: 100%; height: auto; display: block; border-radius: 8px; }
</style>
