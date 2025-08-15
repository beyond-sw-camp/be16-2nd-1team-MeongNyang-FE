<template>
  <v-container>
    <v-card>
      <v-card-title>다이어리</v-card-title>
      <v-card-text>
        <p>다이어리 목록 페이지입니다.</p>
        <v-btn color="primary" @click="$router.push('/diary/new')">새 다이어리 작성</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'DiaryListView'
}
</script>
