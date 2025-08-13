<template>
  <div class="signup-container">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="signup-card" elevation="8">
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
              <h1 class="text-h5 font-weight-medium mb-6">회원가입</h1>
            </div>

            <!-- 회원가입 폼 -->
            <v-form @submit.prevent="handleSignup" ref="signupForm">
              <v-card-text class="pa-6">
                <!-- 이메일 입력 -->
                <v-text-field
                  v-model="signupData.email"
                  label="이메일"
                  type="email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  :rules="emailRules"
                  required
                  class="mb-4"
                  @blur="checkEmail"
                  :loading="checkingEmail"
                >
                  <template v-slot:append>
                    <v-icon 
                      v-if="emailChecked" 
                      :color="emailAvailable ? 'success' : 'error'"
                      size="small"
                    >
                      {{ emailAvailable ? 'mdi-check' : 'mdi-close' }}
                    </v-icon>
                  </template>
                </v-text-field>

                <!-- 이메일 인증 -->
                <div v-if="emailAvailable && !emailVerified" class="mb-4">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="small"
                    @click="sendVerificationCode"
                    :loading="sendingCode"
                    :disabled="sendingCode"
                    block
                  >
                    <v-icon left>mdi-email-send</v-icon>
                    {{ codeSent ? '인증번호 재발송' : '인증번호 발송' }}
                  </v-btn>
                </div>

                <!-- 인증번호 입력 -->
                <div v-if="codeSent || emailVerified" class="mb-4">
                  <v-text-field
                    v-model="verificationCode"
                    label="인증번호 6자리"
                    type="text"
                    prepend-inner-icon="mdi-key"
                    variant="outlined"
                    maxlength="6"
                    :rules="verificationRules"
                    required
                    class="mb-2"
                  ></v-text-field>
                  <v-btn
                    v-if="!emailVerified"
                    variant="outlined"
                    color="primary"
                    size="small"
                    @click="verifyCode"
                    :loading="verifyingCode"
                    :disabled="verifyingCode"
                    block
                  >
                    <v-icon left>mdi-check</v-icon>
                    인증번호 확인
                  </v-btn>
                </div>

                <!-- 이름 입력 -->
                <v-text-field
                  v-model="signupData.name"
                  label="이름"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="nameRules"
                  required
                  class="mb-4"
                ></v-text-field>

                <!-- 사용자명 입력 -->
                <v-text-field
                  v-model="signupData.nickname"
                  label="사용자명"
                  prepend-inner-icon="mdi-at"
                  variant="outlined"
                  :rules="nicknameRules"
                  required
                  class="mb-4"
                  @blur="checkNickname"
                  :loading="checkingNickname"
                >
                  <template v-slot:append>
                    <v-icon 
                      v-if="nicknameChecked" 
                      :color="nicknameAvailable ? 'success' : 'error'"
                      size="small"
                    >
                      {{ nicknameAvailable ? 'mdi-check' : 'mdi-close' }}
                    </v-icon>
                  </template>
                </v-text-field>

                <!-- 비밀번호 입력 -->
                <v-text-field
                  v-model="signupData.password"
                  label="비밀번호"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  :rules="passwordRules"
                  required
                  @click:append-inner="showPassword = !showPassword"
                  class="mb-4"
                ></v-text-field>

                <!-- 비밀번호 확인 -->
                <v-text-field
                  v-model="confirmPassword"
                  label="비밀번호 확인"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-check"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  :rules="confirmPasswordRules"
                  required
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  class="mb-6"
                ></v-text-field>

                <!-- 약관 동의 -->
                <v-checkbox
                  v-model="agreeToTerms"
                  label="이용약관 및 개인정보처리방침에 동의합니다"
                  :rules="[v => !!v || '약관에 동의해주세요']"
                  class="mb-4"
                ></v-checkbox>

                <!-- 회원가입 버튼 -->
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="loading || !canSignup"
                  class="mb-4"
                >
                  <v-icon left>mdi-account-plus</v-icon>
                  회원가입
                </v-btn>
              </v-card-text>
            </v-form>

            <!-- 로그인 링크 -->
            <v-card-actions class="pa-6 pt-0">
              <v-row>
                <v-col cols="12" class="text-center">
                  <span class="text-body-2 text-grey-darken-1">이미 계정이 있으신가요? </span>
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    @click="$router.push('/login')"
                  >
                    로그인
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
  name: 'SignupPage',
  data() {
    return {
      signupData: {
        email: '',
        name: '',
        nickname: '',
        password: ''
      },
      confirmPassword: '',
      verificationCode: '',
      showPassword: false,
      showConfirmPassword: false,
      agreeToTerms: false,
      loading: false,
      checkingEmail: false,
      checkingNickname: false,
      sendingCode: false,
      verifyingCode: false,
      emailChecked: false,
      emailAvailable: false,
      emailVerified: false,
      codeSent: false,
      nicknameChecked: false,
      nicknameAvailable: false,
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
      nameRules: [
        v => !!v || '이름을 입력해주세요',
        v => v.length >= 2 || '이름은 2자 이상이어야 합니다'
      ],
      nicknameRules: [
        v => !!v || '사용자명을 입력해주세요',
        v => v.length >= 2 || '사용자명은 2자 이상이어야 합니다',
        v => v.length <= 20 || '사용자명은 20자 이하여야 합니다'
      ],
      passwordRules: [
        v => !!v || '비밀번호를 입력해주세요',
        v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
        v => /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(v) || '영문과 숫자를 포함해야 합니다'
      ],
      confirmPasswordRules: [
        v => !!v || '비밀번호를 다시 입력해주세요',
        v => v === this.signupData.password || '비밀번호가 일치하지 않습니다'
      ],
      verificationRules: [
        v => !!v || '인증번호를 입력해주세요',
        v => v.length === 6 || '인증번호는 6자리입니다'
      ]
    }
  },
  computed: {
    canSignup() {
      return this.emailAvailable && 
             this.emailVerified && 
             this.nicknameAvailable && 
             this.agreeToTerms &&
             this.signupData.password === this.confirmPassword &&
             this.signupData.name.trim().length >= 2
    }
  },
  methods: {
    // 이메일 중복 체크
    async checkEmail() {
      if (!this.signupData.email || !/.+@.+\..+/.test(this.signupData.email)) {
        return
      }

      this.checkingEmail = true
      try {
        await axios.post(`${this.apiBaseUrl}/user/check-email`, {
          email: this.signupData.email
        })
        
        this.emailAvailable = true
        this.emailChecked = true
        this.emailVerified = false // 이메일 변경시 인증 초기화
        this.codeSent = false // 이메일 변경시 인증번호 발송 상태 초기화
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.emailAvailable = false
          this.emailChecked = true
        }
      } finally {
        this.checkingEmail = false
      }
    },

    // 사용자명 중복 체크
    async checkNickname() {
      if (!this.signupData.nickname || this.signupData.nickname.length < 2) {
        return
      }

      this.checkingNickname = true
      try {
        await axios.post(`${this.apiBaseUrl}/user/check-nickname`, {
          nickname: this.signupData.nickname
        })
        
        this.nicknameAvailable = true
        this.nicknameChecked = true
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.nicknameAvailable = false
          this.nicknameChecked = true
        }
      } finally {
        this.checkingNickname = false
      }
    },

    // 인증번호 발송
    async sendVerificationCode() {
      this.sendingCode = true
      try {
        await axios.post(`${this.apiBaseUrl}/user/verify-email`, {
          email: this.signupData.email
        })
        
        this.successMessage = '인증번호가 이메일로 발송되었습니다'
        this.showSuccess = true
        this.codeSent = true // 인증번호 발송 완료 상태 설정
      } catch (error) {
        this.errorMessage = '인증번호 발송에 실패했습니다. 다시 시도해주세요'
        this.showError = true
      } finally {
        this.sendingCode = false
      }
    },

    // 인증번호 확인
    async verifyCode() {
      if (!this.verificationCode || this.verificationCode.length !== 6) {
        this.errorMessage = '6자리 인증번호를 입력해주세요'
        this.showError = true
        return
      }

      this.verifyingCode = true
      try {
        await axios.post(`${this.apiBaseUrl}/user/verify-email-check`, {
          email: this.signupData.email,
          code: this.verificationCode
        })
        
        this.emailVerified = true
        this.successMessage = '이메일 인증이 완료되었습니다'
        this.showSuccess = true
      } catch (error) {
        this.errorMessage = '인증번호가 올바르지 않습니다'
        this.showError = true
      } finally {
        this.verifyingCode = false
      }
    },

    // 회원가입 처리
    async handleSignup() {
      // 폼 유효성 검사
      const { valid } = await this.$refs.signupForm.validate()
      if (!valid) return

      if (!this.canSignup) {
        this.errorMessage = '모든 필수 항목을 확인해주세요'
        this.showError = true
        return
      }

      this.loading = true
      this.showError = false

      try {
        const response = await axios.post(`${this.apiBaseUrl}/user/sign`, {
          email: this.signupData.email,
          name: this.signupData.name,
          nickname: this.signupData.nickname,
          password: this.signupData.password
        })

        if (response.data.isSuccess) {
          this.successMessage = '회원가입이 완료되었습니다!'
          this.showSuccess = true

          // 회원가입 성공 후 자동 로그인 시도
          try {
            const loginResponse = await axios.post(`${this.apiBaseUrl}/user/login`, {
              email: this.signupData.email,
              password: this.signupData.password
            })

            if (loginResponse.data.isSuccess) {
              // JWT 토큰 저장
              const { accessToken, refreshToken } = loginResponse.data.data
              localStorage.setItem('accessToken', accessToken)
              localStorage.setItem('refreshToken', refreshToken)

              // 로그인 상태 변경 이벤트 발생
              window.dispatchEvent(new Event('loginStatusChanged'))

              // 홈페이지로 즉시 리다이렉트 (성공 파라미터 포함)
              this.$router.push('/?loginSuccess=true')
            }
          } catch (loginError) {
            // 자동 로그인 실패 시 로그인 페이지로 즉시 이동 (이메일 자동 입력)
            this.$router.push(`/login?email=${encodeURIComponent(this.signupData.email)}`)
          }
        }
      } catch (error) {
        console.error('회원가입 실패:', error)
        
        if (error.response) {
          const { status, data } = error.response
          
          switch (status) {
            case 400:
              this.errorMessage = data.message || '입력 정보를 확인해주세요'
              break
            case 409:
              this.errorMessage = '이미 존재하는 계정입니다'
              break
            default:
              this.errorMessage = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요'
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
    }
  },
  mounted() {
    // 이미 로그인된 경우 홈으로 리다이렉트
    if (localStorage.getItem('accessToken')) {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.signup-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF9A8B 0%, #A8E6CF 100%);
  display: flex;
  align-items: center;
}

.signup-card {
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
  .signup-card {
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
