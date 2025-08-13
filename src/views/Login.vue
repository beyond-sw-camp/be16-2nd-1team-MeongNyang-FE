<template>
  <div class="login-container">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="login-card" elevation="8">
            <!-- 로고 영역 -->
            <div class="text-center pa-6">
              <div class="logo-container d-flex align-center justify-center mb-4">
                <div class="logo-icon-wrapper mr-3">
                  <div class="logo-icon-bg">
                    <v-icon size="24" color="white" class="logo-icon-main">
                      mdi-heart
                    </v-icon>
                  </div>
                  <v-icon size="16" color="primary" class="logo-icon-dog">
                    mdi-dog
                  </v-icon>
                  <v-icon size="14" color="secondary" class="logo-icon-cat">
                    mdi-cat
                  </v-icon>
                </div>
                <div class="logo-text">
                  <h2 class="text-h4 font-weight-bold text-primary mb-1">멍냥</h2>
                  <p class="text-body-2 text-grey-darken-1">반려동물 커뮤니티</p>
                </div>
              </div>
              <h1 class="text-h5 font-weight-medium mb-6">로그인</h1>
            </div>

            <!-- 로그인 폼 -->
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-card-text class="pa-6">
                <!-- 이메일 입력 -->
                <v-text-field
                  v-model="loginData.email"
                  label="이메일"
                  type="email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  :rules="emailRules"
                  required
                  class="mb-4"
                ></v-text-field>

                <!-- 비밀번호 입력 -->
                <v-text-field
                  v-model="loginData.password"
                  label="비밀번호"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  :rules="passwordRules"
                  required
                  @click:append-inner="showPassword = !showPassword"
                  class="mb-6"
                ></v-text-field>

                <!-- 로그인 버튼 -->
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="loading"
                  class="mb-4"
                >
                  <v-icon left>mdi-login</v-icon>
                  로그인
                </v-btn>

                <!-- 소셜 로그인 (추후 구현) -->
                <v-divider class="my-4">
                  <span class="text-grey-darken-1 text-body-2">또는</span>
                </v-divider>

                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  class="mb-4"
                  disabled
                >
                  <v-icon left>mdi-google</v-icon>
                  Google로 로그인 (준비 중)
                </v-btn>

                <!-- 추가 옵션 -->
                <div class="d-flex justify-space-between align-center mt-4">
                  <v-checkbox
                    v-model="rememberMe"
                    label="로그인 상태 유지"
                    hide-details
                    class="text-body-2"
                  ></v-checkbox>
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    @click="forgotPassword"
                  >
                    비밀번호 찾기
                  </v-btn>
                </div>
              </v-card-text>
            </v-form>

            <!-- 회원가입 링크 -->
            <v-card-actions class="pa-6 pt-0">
              <v-row>
                <v-col cols="12" class="text-center">
                  <span class="text-body-2 text-grey-darken-1">계정이 없으신가요? </span>
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    @click="$router.push('/signup')"
                  >
                    회원가입
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showError = false"
        >
          닫기
        </v-btn>
      </template>
    </v-snackbar>

    <!-- 성공 스낵바 -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSuccess = false"
        >
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LoginPage',
  data() {
    return {
      loginData: {
        email: '',
        password: ''
      },
      showPassword: false,
      rememberMe: false,
      loading: false,
      showError: false,
      showSuccess: false,
      errorMessage: '',
      successMessage: '',
      apiBaseUrl: 'http://localhost:8080',
      // 유효성 검사 규칙
      emailRules: [
        v => !!v || '이메일을 입력해주세요',
        v => /.+@.+\..+/.test(v) || '올바른 이메일 형식을 입력해주세요'
      ],
      passwordRules: [
        v => !!v || '비밀번호를 입력해주세요',
        v => v.length >= 6 || '비밀번호는 6자 이상이어야 합니다'
      ]
    }
  },
  methods: {
    async handleLogin() {
      // 폼 유효성 검사
      const { valid } = await this.$refs.loginForm.validate()
      if (!valid) return

      this.loading = true
      this.showError = false

      try {
        console.log('로그인 시도:', this.loginData)
        const response = await axios.post(`${this.apiBaseUrl}/user/login`, {
          email: this.loginData.email,
          password: this.loginData.password
        })
        
        console.log('로그인 응답:', response.data)

        if (response.data.isSuccess) {
          // JWT 토큰 저장
          const { accessToken, refreshToken } = response.data.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          // 로그인 상태 유지 설정
          if (this.rememberMe) {
            localStorage.setItem('rememberMe', 'true')
          } else {
            localStorage.removeItem('rememberMe')
          }

          // 로그인 상태 변경 이벤트 발생
          window.dispatchEvent(new Event('loginStatusChanged'))

          // 사용자 정보를 localStorage에 저장 (기본값)
          localStorage.setItem('userInfo', JSON.stringify({
            nickname: '사용자',
            email: this.loginData.email,
            name: ''
          }))

          // 즉시 리다이렉트
          this.handleRedirect()

          // 백그라운드에서 사용자 정보 가져오기 (비동기)
          this.loadUserInfoInBackground(accessToken)
        }
      } catch (error) {
        console.error('로그인 실패:', error)
        console.error('에러 응답:', error.response?.data)
        
        if (error.response) {
          const { status, data } = error.response
          
          switch (status) {
            case 400:
              this.errorMessage = data.message || '입력 정보를 확인해주세요'
              break
            case 401:
              this.errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다'
              break
            case 403:
              this.errorMessage = '계정이 잠겨있습니다. 관리자에게 문의하세요'
              break
            case 404:
              this.errorMessage = '존재하지 않는 계정입니다'
              break
            default:
              this.errorMessage = '로그인 중 오류가 발생했습니다. 다시 시도해주세요'
          }
        } else if (error.request) {
          this.errorMessage = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요'
        } else {
          this.errorMessage = '알 수 없는 오류가 발생했습니다'
        }
        
        this.showError = true
      } finally {
        this.loading = false
      }
    },

    forgotPassword() {
      // 비밀번호 찾기 페이지로 이동 (추후 구현)
      this.$router.push('/forgot-password')
    },

    // 리다이렉트 처리 (즉시, replace 사용)
    handleRedirect() {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirect')
      const previousPage = sessionStorage.getItem('previousPage')

      const resolveTarget = (rawPath) => {
        try {
          const url = new URL(rawPath, window.location.origin)
          const query = Object.fromEntries(url.searchParams.entries())
          return { path: url.pathname, query: { ...query, loginSuccess: 'true' } }
        } catch (_) {
          return { path: rawPath || '/', query: { loginSuccess: 'true' } }
        }
      }

      let target = { path: '/', query: { loginSuccess: 'true' } }

      if (redirectTo) {
        target = resolveTarget(redirectTo)
      } else if (previousPage && previousPage !== '/login' && previousPage !== '/signup') {
        target = resolveTarget(previousPage)
      }

      sessionStorage.removeItem('previousPage')

      const href = this.$router.resolve(target).href
      window.location.assign(href)
    },

    // 백그라운드에서 사용자 정보 가져오기
    async loadUserInfoInBackground(accessToken) {
      try {
        const userResponse = await axios.get(`${this.apiBaseUrl}/user/my-page`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        
        if (userResponse.data.isSuccess) {
          const userData = userResponse.data.data
          
          // 사용자 정보를 localStorage에 업데이트
          localStorage.setItem('userInfo', JSON.stringify({
            nickname: userData.nickname,
            email: userData.email,
            name: userData.name
          }))

          // 헤더 상태 업데이트를 위한 이벤트 발생
          window.dispatchEvent(new Event('loginStatusChanged'))

          // 성공 메시지 업데이트 (개인화된 메시지)
          if (this.showSuccess) {
            this.successMessage = `${userData.nickname}님, 환영합니다! 🐾`
          }
        }
      } catch (userError) {
        console.error('사용자 정보 가져오기 실패:', userError)
      }
    }
  },
  mounted() {
    // 이미 로그인된 경우 홈으로 리다이렉트
    if (localStorage.getItem('accessToken')) {
      this.$router.push('/')
    }

    // URL 파라미터에서 이메일 가져오기 (회원가입 후 자동 입력)
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    if (email) {
      this.loginData.email = email
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF9A8B 0%, #A8E6CF 100%);
  display: flex;
  align-items: center;
}

.login-card {
  border-radius: 20px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-container {
  position: relative;
}

.logo-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
}

.logo-icon-bg {
  position: absolute;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FF9A8B, #A8E6CF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 154, 139, 0.3);
  transition: all 0.3s ease;
}

.logo-icon-main {
  transition: transform 0.3s ease;
}

.logo-icon-dog {
  position: absolute;
  top: -3px;
  left: -3px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.logo-icon-cat {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.logo-container:hover .logo-icon-bg {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 154, 139, 0.4);
}

.logo-container:hover .logo-icon-main {
  transform: scale(1.1);
}

.logo-container:hover .logo-icon-dog {
  transform: scale(1.1) rotate(-5deg);
}

.logo-container:hover .logo-icon-cat {
  transform: scale(1.1) rotate(5deg);
}

// 반응형 디자인
@media (max-width: 600px) {
  .login-card {
    margin: 16px;
    border-radius: 16px;
  }
  
  .logo-icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .logo-icon-bg {
    width: 32px;
    height: 32px;
  }
}
</style>
