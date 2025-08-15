<template>
  <v-container>
    <v-card>
      <v-card-title>채팅방</v-card-title>
      <v-card-text>
        <p>채팅방 페이지입니다.</p>
        <v-btn @click="$router.push('/chat')">채팅 목록으로 돌아가기</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'ChatRoomView'
}
</script>
