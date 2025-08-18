<template>
  <v-container>
    <v-card>
      <v-card-title>마켓플레이스</v-card-title>
      <v-card-text>
        <p>마켓플레이스 목록 페이지입니다.</p>
        <v-btn color="primary" @click="$router.push('/market/new')">새 게시글 작성</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'MarketListView'
}
</script>
