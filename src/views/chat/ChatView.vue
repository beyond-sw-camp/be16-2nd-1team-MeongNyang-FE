<template>
  <v-container fluid class="chat-view-container pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="4" class="chat-list-column fill-height" style="border-right: 1px solid #e0e0e0;">
        <chat-list 
          @chat-selected="onChatSelected" 
          @show-message="showMessage"
        />
      </v-col>
      <v-col cols="8" class="chat-room-column fill-height">
        <router-view :key="$route.fullPath"></router-view>
      </v-col>
    </v-row>
    
    <!-- 전역 스낵바 -->
    <GlobalSnackbar />
  </v-container>
</template>

<script>
import ChatList from '@/components/chat/ChatList.vue'
import GlobalSnackbar from '@/components/ui/global/GlobalSnackbar.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { provide } from 'vue'

export default {
  name: 'ChatView',
  components: {
    ChatList,
    GlobalSnackbar
  },
  setup() {
    const { showSnackbar } = useSnackbar()
    
    // showMessage 함수를 provide로 제공
    const showMessage = (message) => {
      showSnackbar(message.text, message.type)
    }
    
    // provide를 통해 showMessage 함수 제공
    provide('showMessage', showMessage)
    
    return {
      showSnackbar
    }
  },
  mounted() {
    // 컴포넌트 마운트 시 채팅방 나가기 메시지 확인
    // this.checkLeaveMessage() // Removed as per edit hint
  },
  methods: {
    onChatSelected(roomId) {
      this.$router.push({ name: 'ChatRoom', params: { roomId } })
    },
    showMessage(message) {
      this.showSnackbar(message.text, message.type)
    }
  }
}
</script>

<style scoped>
.chat-view-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.fill-height {
  height: 100vh;
  max-height: 100vh;
}

.chat-list-column {
  overflow: hidden;
}

.chat-room-column {
  overflow: hidden;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-view-container {
    height: 100vh;
  }
  
  .fill-height {
    height: 100vh;
  }
}
</style>