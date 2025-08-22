<template>
  <v-card class="chat-list-container d-flex flex-column fill-height" flat tile>
    <!-- 새로운 채팅방 생성 헤더 -->
    <v-toolbar color="white" flat class="chat-list-header">
      <v-btn 
        prepend-icon="mdi-plus" 
        color="primary" 
        variant="flat"
        @click="showUserSelectionModal = true"
        class="new-chat-btn"
      >
        새 채팅방
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="showChatListOptions = !showChatListOptions">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
      
      <!-- 채팅방 옵션 메뉴 -->
      <v-menu v-model="showChatListOptions" :close-on-content-click="false">
        <v-list>
          <v-list-item @click="showUserSelectionModal = true">
            <template v-slot:prepend>
              <v-icon>mdi-account-plus</v-icon>
            </template>
            <v-list-item-title>새 채팅방 만들기</v-list-item-title>
          </v-list-item>
          <v-list-item @click="refreshChatList">
            <template v-slot:prepend>
              <v-icon>mdi-refresh</v-icon>
            </template>
            <v-list-item-title>새로고침</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    
    <v-divider></v-divider>
    
    <!-- 채팅방 목록 -->
    <v-card-text class="chat-list-content pa-0">
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
    
    <!-- 유저 선택 모달 -->
    <UserSelectionModal
      v-model="showUserSelectionModal"
      @users-selected="createNewChatRoom"
    />
  </v-card>
</template>

<script>
import { useChatStore } from '@/stores/chat';
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import UserSelectionModal from './UserSelectionModal.vue';

export default {
  name: 'ChatList',
  components: {
    UserSelectionModal
  },
  setup() {
    const chatStore = useChatStore();
    const { chatRoomList } = storeToRefs(chatStore);
    const unreadOnly = ref(false);
    const showUserSelectionModal = ref(false);
    const showChatListOptions = ref(false);

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
      filteredChatRoomList,
      showUserSelectionModal,
      showChatListOptions
    };
  },
  methods: {
    selectChatRoom(roomId) {
      this.$emit('chat-selected', roomId);
    },
    formatTime(time) {
      // Implement your time formatting logic here
      return time;
    },
    async createNewChatRoom(selectedUsers) {
      try {
        // 선택된 사용자들로 새로운 채팅방 생성
        const userIds = selectedUsers.map(user => user.userEmail);
        console.log('새 채팅방 생성:', userIds);
        
        // 채팅방 이름 생성 (선택된 사용자들의 이름으로)
        const roomName = selectedUsers.length === 1 
          ? `${selectedUsers[0].userName || selectedUsers[0].userEmail}와의 채팅`
          : `${selectedUsers[0].userName || selectedUsers[0].userEmail} 외 ${selectedUsers.length - 1}명과의 채팅`;
        
        // 채팅방 생성 API 호출
        const roomId = await this.chatStore.createChatRoom(roomName, userIds);
        
        // 성공 메시지 표시
        this.$emit('show-message', {
          type: 'success',
          text: `${selectedUsers.length}명과의 새 채팅방이 생성되었습니다.`
        });
        
        // 채팅방 목록 새로고침
        await this.refreshChatList();
        
        // 새로 생성된 채팅방으로 이동
        this.$emit('chat-selected', roomId);
        
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
        this.$emit('show-message', {
          type: 'error',
          text: '채팅방 생성에 실패했습니다.'
        });
      }
    },
    async refreshChatList() {
      try {
        await this.chatStore.fetchChatRoomList();
      } catch (error) {
        console.error('채팅방 목록 새로고침 실패:', error);
      }
    }
  },
  async created() {
    await this.chatStore.fetchChatRoomList();
  }
}
</script>

<style scoped>
/* 채팅 목록 컨테이너 */
.chat-list-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

/* 채팅 목록 헤더 */
.chat-list-header {
  flex-shrink: 0;
  min-height: 64px;
  padding: 0 16px;
}

/* 새 채팅방 버튼 */
.new-chat-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
}

/* 채팅 목록 콘텐츠 영역 */
.chat-list-content {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 64px); /* 헤더 높이 제외 */
  max-height: calc(100vh - 64px);
  scroll-behavior: smooth;
}

/* 스크롤바 스타일링 */
.chat-list-content::-webkit-scrollbar {
  width: 6px;
}

.chat-list-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-list-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-list-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.list-item-hover {
  transition: background-color 0.2s ease-in-out;
}

.list-item-hover:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-list-container {
    height: 100vh;
  }
  
  .chat-list-content {
    height: calc(100vh - 64px);
    max-height: calc(100vh - 64px);
  }
  
  .new-chat-btn {
    font-size: 0.875rem;
    padding: 8px 16px;
  }
}
</style>
