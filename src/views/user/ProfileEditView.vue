<template>
  <v-container>
    <v-card>
      <v-card-title>프로필 수정</v-card-title>
      <v-card-text>
        <p>프로필 수정 페이지입니다.</p>
        <v-btn @click="$router.push('/profile')">프로필로 돌아가기</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'ProfileEditView'
}
</script>
