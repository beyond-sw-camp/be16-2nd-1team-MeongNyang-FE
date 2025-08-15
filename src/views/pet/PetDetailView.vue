<template>
  <v-container>
    <v-card>
      <v-card-title>반려동물 상세</v-card-title>
      <v-card-text>
        <p>반려동물 상세 페이지입니다.</p>
        <v-btn @click="$router.push('/pets')">목록으로 돌아가기</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'PetDetailView'
}
</script>
