<template>
  <div class="oauth-callback">
    <!-- OAuth 처리 중 - 화면에 표시되지 않음 -->
  </div>
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
      
      // 로그인 성공 후 화면 새로고침하여 로그인된 상태로 표시
      console.log('✅ OAuth 로그인 성공! 화면 새로고침 중...')
      window.location.href = '/'
      return
    }

    // 이메일 매칭 → 연동 확인 (홈으로 이동 후 모달 열기)
    if (payload?.needLink) {
      // 홈으로 이동하고 소셜 연동 모달을 열기 위한 쿼리 파라미터 전달
      router.replace({
        name: 'Home',
        query: {
          openOAuthLink: 'true',
          provider,
          email: payload.email,
          linkTicket: payload.linkTicket,
        },
      })
      return
    }

    // 신규가입 → 추가정보 (홈으로 이동 후 모달 열기)
    if (payload?.isNewUser || payload?.needExtra || payload?.signupTicket) {
      // 홈으로 이동하고 OAuth 추가정보 모달을 열기 위한 쿼리 파라미터 전달
      router.replace({
        name: 'Home',
        query: {
          openOAuthExtra: 'true',
          provider,
          signupTicket: payload.signupTicket,
          email: payload.email,
        },
      })
      return
    }

    router.replace({ name: 'Login' })
  } catch (e) {
  // 서버 응답 정보 추출
  const status = e?.response?.status
  const payload = e?.response?.data?.data
  
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

  console.error('🚨 OAuth 로그인 에러 상세 분석:')
  console.error('- Status:', status)
  console.error('- Provider:', provider)
  console.error('- Message 원본:', `"${msg}"`)
  console.error('- Message 길이:', msg.length)
  console.error('- Payload:', payload)
  console.error('- Full Response Data:', e?.response?.data)
  console.error('- Response 구조 전체:', JSON.stringify(e?.response?.data, null, 2))
  
  // 삭제 계정 감지 테스트
  const deletedChecks = {
    '사용하지 않는 계정': msg.includes('사용하지 않는 계정'),
    '삭제된 계정': msg.includes('삭제된 계정'),
    '탈퇴한 계정': msg.includes('탈퇴한 계정'),
    '존재하지 않는': msg.includes('존재하지 않는'),
    '비활성화된 계정': msg.includes('비활성화된 계정'),
    originalMessage: msg
  }
  console.error('- 삭제 계정 체크 결과:', deletedChecks)

      // 400: IllegalArgumentException, EntityExistsException
    if (status === 400) {
      // 삭제된 계정 - 다양한 메시지 패턴 확인
      if (msg.includes('사용하지 않는 계정') || 
          msg.includes('삭제된 계정') || 
          msg.includes('탈퇴한 계정') ||
          msg.includes('존재하지 않는') ||
          msg.includes('비활성화된 계정')) {
        console.log('삭제된 계정 감지:', msg)
        
        // 홈으로 이동하고 삭제된 계정 모달을 열기 위한 쿼리 파라미터 전달
        router.replace({
          name: 'Home',
          query: {
            showDeletedAccount: 'true',
            deletedEmail: payload?.email || '알 수 없는 이메일',
          },
        })
        return
      }
    
    // 잠긴 계정
    if (msg.includes('잠긴 계정')) {
      alert('🔒 계정이 일시적으로 잠겨있습니다.\n\n계정 잠금 해제를 통해 다시 이용하실 수 있습니다.')
      router.replace({ name: 'UnlockAccount' })
      return
    }
    
    // EntityExistsException - 이미 다른 방식으로 연동된 계정
    if (msg.includes('이미 다른 방식으로 연동') || msg.includes('이미 소셜 연동')) {
      // 에러 메시지에서 기존 소셜 타입 추출
      const existingType = 
        msg.includes('구글') || msg.includes('Google') || msg.includes('GOOGLE') ? 'Google' :
        msg.includes('카카오') || msg.includes('Kakao') || msg.includes('KAKAO') ? 'Kakao' : '다른 소셜'
      
      // 홈으로 이동하고 소셜 계정 중복 모달을 열기 위한 쿼리 파라미터 전달
      router.replace({
        name: 'Home',
        query: {
          showSocialDuplicate: 'true',
          duplicateEmail: payload?.email || '알 수 없는 이메일',
          duplicateProvider: existingType,
        },
      })
      return
    }
    
    // 기타 400 오류
    console.error('기타 400 오류 상세:', { msg, payload, status })
    alert(`⚠️ 소셜 로그인에 문제가 생겼어요.\n\n${msg || '잠시 후 다시 시도해주세요!'}\n\n문제가 계속되면 다른 로그인 방법을 이용해보세요.`)
    router.replace({ name: 'Login' })
    return
  }

  // 401: 인증 오류
  if (status === 401) {
    alert('🔐 인증에 실패했습니다.\n\n소셜 로그인을 다시 시도해주세요.')
    router.replace({ name: 'Login' })
    return
  }

  // 403: 권한 오류
  if (status === 403) {
    alert('🚫 접근 권한이 없습니다.\n\n관리자에게 문의해주세요.')
    router.replace({ name: 'Login' })
    return
  }

  // 404: 찾을 수 없음
  if (status === 404) {
    alert('❓ 요청한 정보를 찾을 수 없습니다.\n\n다시 시도해주세요.')
    router.replace({ name: 'Login' })
    return
  }

  // 500: 서버 오류
  if (status === 500) {
    alert('🛠️ 서버에 일시적인 문제가 발생했습니다.\n\n잠시 후 다시 시도해주세요.')
    router.replace({ name: 'Login' })
    return
  }

  // 기타 오류
  alert(`💭 소셜 로그인에 문제가 생겼어요.\n\n${msg || '잠시 후 다시 시도해주세요!'}`)
  router.replace({ name: 'Login' })
}

})
</script>


<style scoped>
.oauth-callback {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: -1;
  pointer-events: none;
}
</style>
