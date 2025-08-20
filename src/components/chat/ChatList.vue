<template>
  <v-card class="d-flex flex-column fill-height" flat tile>
    <v-toolbar color="white" flat>
      <v-avatar class="ml-4">
        <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
      </v-avatar>
      <v-toolbar-title>john9823</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text class="pa-0">
      <v-list lines="two">
        <v-list-item>
          <v-checkbox-btn v-model="unreadOnly" label="안읽은 메시지만 보기"></v-checkbox-btn>
        </v-list-item>
        <v-list-item
          v-for="chatRoom in filteredChatRoomList"
          :key="chatRoom.id"
          @click="selectChatRoom(chatRoom.id)"
          class="list-item-hover"
        >
          <v-list-item-content class="d-flex align-center">
            <v-avatar class="mr-4">
              <v-img :src="chatRoom.avatar || 'https://cdn.vuetifyjs.com/images/john.jpg'" alt="Avatar"></v-img>
            </v-avatar>
            <div class="flex-grow-1">
              <v-list-item-title class="font-weight-medium">{{ chatRoom.roomName }}</v-list-item-title>
              <v-list-item-subtitle>{{ chatRoom.lastMessage }}</v-list-item-subtitle>
            </div>
            <div class="d-flex flex-column align-end">
              <v-list-item-subtitle class="mb-1">{{ formatTime(chatRoom.lastMessageTime) }}</v-list-item-subtitle>
              <v-badge
                color="error"
                :content="chatRoom.newMessageCount"
                inline
                v-if="chatRoom.newMessageCount > 0"
              ></v-badge>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { useChatStore } from '@/stores/chat';
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

export default {
  name: 'ChatList',
  setup() {
    const chatStore = useChatStore();
    const { chatRoomList } = storeToRefs(chatStore);
    const unreadOnly = ref(false);

    const filteredChatRoomList = computed(() => {
      if (unreadOnly.value) {
        return chatRoomList.value.filter(room => room.newMessageCount > 0);
      }
      return chatRoomList.value;
    });

    return {
      chatStore,
      chatRoomList,
      unreadOnly,
      filteredChatRoomList
    };
  },
  methods: {
    selectChatRoom(roomId) {
      this.$emit('chat-selected', roomId);
    },
    formatTime(time) {
      // Implement your time formatting logic here
      return time;
    }
  },
  async created() {
    await this.chatStore.fetchChatRoomList();
  }
}
</script>

<style scoped>
.list-item-hover {
  transition: background-color 0.2s ease-in-out;
}

.list-item-hover:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}
</style>
