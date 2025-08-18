<template>
  <v-container>
    <v-card>
      <v-card-title>게시글 수정</v-card-title>
      <v-card-text>
        <p>마켓플레이스 게시글 수정 페이지입니다.</p>
        <v-btn @click="$router.push('/market')">목록으로 돌아가기</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'MarketEditView'
}
</script>
