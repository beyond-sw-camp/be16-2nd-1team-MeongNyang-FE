<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="4" class="fill-height" style="border-right: 1px solid #e0e0e0;">
        <chat-list @chat-selected="onChatSelected" />
      </v-col>
      <v-col cols="8" class="fill-height">
        <router-view :key="$route.fullPath"></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ChatList from '@/components/chat/ChatList.vue'

export default {
  name: 'ChatView',
  components: {
    ChatList
  },
  methods: {
    onChatSelected(roomId) {
      this.$router.push({ name: 'ChatRoom', params: { roomId } })
    }
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>