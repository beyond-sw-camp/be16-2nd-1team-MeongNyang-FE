<template>
  <div class="feed-container">
    <v-container fluid class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold text-primary mb-6">반려동물 피드</h1>
          <p class="text-body-1 text-grey-darken-1 mb-8">
            다른 반려인들의 소중한 순간들을 확인해보세요
          </p>
          
          <!-- 임시 피드 내용 -->
          <v-card class="mb-4" v-for="i in 3" :key="i">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar size="40" class="mr-3">
                  <v-icon>mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">사용자 {{ i }}</div>
                  <div class="text-caption text-grey-darken-1">2시간 전</div>
                </div>
              </div>
              <p class="text-body-1 mb-4">
                우리 강아지와 함께한 오늘의 산책! 🐕‍🦺 정말 즐거운 시간이었어요.
              </p>
              <v-img
                src="https://picsum.photos/600/400?random={{ i }}"
                height="300"
                cover
                class="rounded-lg mb-4"
              ></v-img>
              <div class="d-flex align-center">
                <v-btn variant="text" color="primary" class="mr-4">
                  <v-icon left>mdi-heart</v-icon>
                  좋아요
                </v-btn>
                <v-btn variant="text" color="primary" class="mr-4">
                  <v-icon left>mdi-comment</v-icon>
                  댓글
                </v-btn>
                <v-btn variant="text" color="primary">
                  <v-icon left>mdi-share</v-icon>
                  공유
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'FeedPage'
}
</script>

<style lang="scss" scoped>
.feed-container {
  min-height: calc(100vh - 68px);
  background: linear-gradient(135deg, rgba(255, 154, 139, 0.05) 0%, rgba(168, 230, 207, 0.05) 100%);
}
</style>
