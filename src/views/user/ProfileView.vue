<template>
  <v-container>
    <v-card>
      <v-card-title>프로필</v-card-title>
      <v-card-text>
        <p>사용자 프로필 페이지입니다.</p>
        <v-btn color="primary" @click="$router.push('/profile/edit')">프로필 수정</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'ProfileView'
}
</script>
