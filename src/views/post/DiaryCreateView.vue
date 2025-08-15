<template>
  <v-container>
    <v-card>
      <v-card-title>새 다이어리 작성</v-card-title>
      <v-card-text>
        <p>다이어리 작성 페이지입니다.</p>
        <v-btn @click="$router.push('/diary')">목록으로 돌아가기</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'DiaryCreateView'
}
</script>
