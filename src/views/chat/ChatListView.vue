<template>
  <v-container>
    <v-card>
      <v-card-title>채팅</v-card-title>
      <v-card-text>
        <p>채팅 목록 페이지입니다.</p>
        <v-btn color="primary" @click="$router.push('/chat/1')">새 채팅방 입장</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'ChatListView'
}
</script>
