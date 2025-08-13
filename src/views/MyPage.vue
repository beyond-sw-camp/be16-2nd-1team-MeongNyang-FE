<template>
  <div class="mypage-container">
    <v-container fluid class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold text-primary mb-6">마이페이지</h1>
          
          <!-- 프로필 정보 -->
          <v-card class="mb-6">
            <v-card-text class="pa-6">
              <div class="d-flex align-center">
                <v-avatar size="80" class="mr-6">
                  <v-icon size="40">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-medium mb-2">사용자님</h2>
                  <p class="text-body-1 text-grey-darken-1 mb-3">user@example.com</p>
                  <v-btn color="primary" variant="outlined" size="small">
                    프로필 수정
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- 메뉴 목록 -->
          <v-card>
            <v-list>
              <v-list-item @click="goToPetRegister">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-paw</v-icon>
                </template>
                <v-list-item-title>반려동물 등록/관리</v-list-item-title>
                <template v-slot:append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="secondary">mdi-post</v-icon>
                </template>
                <v-list-item-title>내 게시글</v-list-item-title>
                <template v-slot:append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="accent">mdi-heart</v-icon>
                </template>
                <v-list-item-title>좋아요한 게시글</v-list-item-title>
                <template v-slot:append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-cog</v-icon>
                </template>
                <v-list-item-title>설정</v-list-item-title>
                <template v-slot:append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'MyPageView',
  methods: {
    goToPetRegister() {
      this.$router.push('/pet-register')
    }
  }
}
</script>

<style lang="scss" scoped>
.mypage-container {
  min-height: calc(100vh - 68px);
  background: linear-gradient(135deg, rgba(255, 154, 139, 0.05) 0%, rgba(168, 230, 207, 0.05) 100%);
}
</style>
