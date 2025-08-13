<template>
  <div class="home-container">
    <v-container fluid class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <!-- 환영 메시지 -->
          <div class="text-center mb-8">
            <h1 class="text-h3 font-weight-bold text-primary mb-4">
              {{ welcomeMessage }}
            </h1>
            <p class="text-h6 text-grey-darken-1">
              반려동물과 함께하는 따뜻한 커뮤니티
            </p>
          </div>

          <!-- 기능 소개 카드들 -->
          <v-row class="mb-8">
            <v-col cols="12" md="4">
              <v-card class="feature-card" elevation="4">
                <v-card-text class="text-center pa-6">
                  <v-icon size="64" color="primary" class="mb-4">mdi-post</v-icon>
                  <h3 class="text-h5 font-weight-medium mb-3">반려동물 일기</h3>
                  <p class="text-body-1 text-grey-darken-1">
                    우리 아이의 특별한 순간들을 기록하고 공유해보세요
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="feature-card" elevation="4">
                <v-card-text class="text-center pa-6">
                  <v-icon size="64" color="secondary" class="mb-4">mdi-currency-usd</v-icon>
                  <h3 class="text-h5 font-weight-medium mb-3">반려용품 거래</h3>
                  <p class="text-body-1 text-grey-darken-1">
                    중고 반려용품을 안전하게 거래하고 새로운 아이템을 발견하세요
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="feature-card" elevation="4">
                <v-card-text class="text-center pa-6">
                  <v-icon size="64" color="accent" class="mb-4">mdi-message</v-icon>
                  <h3 class="text-h5 font-weight-medium mb-3">실시간 채팅</h3>
                  <p class="text-body-1 text-grey-darken-1">
                    다른 반려인들과 실시간으로 소통하고 정보를 나누세요
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 시작하기 버튼 -->
          <div class="text-center">
            <v-btn
              v-if="!isLoggedIn"
              color="primary"
              size="x-large"
              @click="$router.push('/signup')"
              class="mr-4"
            >
              <v-icon left>mdi-account-plus</v-icon>
              회원가입하고 시작하기
            </v-btn>
            <v-btn
              v-if="!isLoggedIn"
              variant="outlined"
              color="primary"
              size="x-large"
              @click="$router.push('/login')"
            >
              <v-icon left>mdi-login</v-icon>
              로그인
            </v-btn>
            <v-btn
              v-else
              color="primary"
              size="x-large"
              @click="$router.push('/feed')"
            >
              <v-icon left>mdi-post</v-icon>
              피드 보러가기
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- 로그인 성공 스낵바 -->
    <v-snackbar
      v-model="showLoginSuccess"
      color="success"
      timeout="4000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-check-circle</v-icon>
        <span>{{ loginSuccessMessage }}</span>
      </div>
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showLoginSuccess = false"
        >
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      showLoginSuccess: false,
      loginSuccessMessage: ''
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('accessToken')
    },
    userInfo() {
      const userInfoStr = localStorage.getItem('userInfo')
      return userInfoStr ? JSON.parse(userInfoStr) : null
    },
    welcomeMessage() {
      if (this.userInfo && this.userInfo.nickname) {
        return `${this.userInfo.nickname}님, 환영합니다! 🐾`
      }
      return '멍냥에 오신 것을 환영합니다! 🐾'
    }
  },
  mounted() {
    // 로그인 성공 메시지 표시
    this.showLoginSuccessMessage()
  },
  methods: {
    showLoginSuccessMessage() {
      // URL 파라미터에서 로그인 성공 여부 확인
      const urlParams = new URLSearchParams(window.location.search)
      const loginSuccess = urlParams.get('loginSuccess')
      
      if (loginSuccess === 'true') {
        // URL 파라미터 정리
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        // 성공 메시지 표시
        this.loginSuccessMessage = this.userInfo && this.userInfo.nickname !== '사용자' 
          ? `${this.userInfo.nickname}님, 환영합니다! 🐾` 
          : '로그인되었습니다! 🎉'
        this.showLoginSuccess = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: calc(100vh - 68px);
  background: linear-gradient(135deg, rgba(255, 154, 139, 0.1) 0%, rgba(168, 230, 207, 0.1) 100%);
}

.feature-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
}

// 반응형 디자인
@media (max-width: 768px) {
  .home-container {
    padding: 16px;
  }
  
  h1 {
    font-size: 2rem !important;
  }
}
</style>
