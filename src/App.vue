<template>
  <v-app>
    <!-- header, footer를 제외한 실질적인 화면의 내용은 v-main안에 들어감 -->
    <HeaderComponent />

    <v-main>
      <router-view />
    </v-main>

    <FooterComponent />

    <!-- 전역 로그인 성공 스낵바 -->
    <v-snackbar
      v-model="showLoginSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-check-circle</v-icon>
        <span>{{ loginSuccessMessage }}</span>
      </div>
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showLoginSuccess = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
  import HeaderComponent from './components/HeaderComponent.vue';
  import FooterComponent from './components/FooterComponent.vue';

  export default {
    name: 'App',
    components: {
      HeaderComponent,
      FooterComponent
    },
    data() {
      return {
        showLoginSuccess: false,
        loginSuccessMessage: ''
      }
    },
    mounted() {
      this.showLoginSuccessIfNeeded()
    },
    watch: {
      // 라우팅 변화시마다 재확인 (새 라우트 도착 시)
      $route() {
        this.showLoginSuccessIfNeeded()
      }
    },
    methods: {
      showLoginSuccessIfNeeded() {
        const url = new URL(window.location.href)
        const loginSuccess = url.searchParams.get('loginSuccess')
        if (loginSuccess === 'true') {
          const userInfoStr = localStorage.getItem('userInfo')
          const nickname = userInfoStr ? (JSON.parse(userInfoStr).nickname || '') : ''
          this.loginSuccessMessage = nickname && nickname !== '사용자' 
            ? `${nickname}님, 환영합니다! 🐾` 
            : '로그인되었습니다! 🎉'
          this.showLoginSuccess = true
          // 쿼리 정리
          url.searchParams.delete('loginSuccess')
          const newSearch = url.searchParams.toString()
          window.history.replaceState({}, document.title, url.pathname + (newSearch ? `?${newSearch}` : ''))
        }
      }
    }
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
