<template>
  <v-container>
    <v-card>
      <v-card-title>반려동물 관리</v-card-title>
      <v-card-text>
        <p>반려동물 목록 페이지입니다.</p>
        <v-btn color="primary" @click="$router.push('/pets/new')">
          새 반려동물 등록
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'PetListView'
}
</script>
