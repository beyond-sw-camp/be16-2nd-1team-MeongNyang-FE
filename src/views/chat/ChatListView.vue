<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5 text-center font-weight-bold py-4">
            내 채팅방 목록
          </v-card-title>
          <v-card-text>
            <!-- 로딩 상태 -->
            <div v-if="chatStore.loading" class="text-center py-10">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4 text-grey-darken-1">채팅방 목록을 불러오는 중...</p>
            </div>
            
            <!-- 에러 상태 -->
            <div v-else-if="chatStore.error" class="text-center py-10">
              <v-icon size="50" color="error">mdi-alert-circle</v-icon>
              <p class="text-error mt-4">{{ chatStore.error }}</p>
              <v-btn color="primary" @click="retryFetch" class="mt-2">다시 시도</v-btn>
            </div>
            
            <!-- 채팅방 목록 -->
            <v-list lines="two" v-else-if="chatRoomList.length > 0">
              <v-list-item
                v-for="chatRoom in chatRoomList"
                :key="chatRoom.id"
                @click="joinChatRoom(chatRoom.id)"
                class="list-item-hover"
              >
                <v-list-item-content class="d-flex align-center">
                  <div class="flex-grow-1">
                    <v-list-item-title class="font-weight-medium">{{ chatRoom.roomName }}</v-list-item-title>
                    <v-list-item-subtitle>#{{ chatRoom.id }}</v-list-item-subtitle>
                  </div>
                  <div class="d-flex align-center">
                    <v-badge
                      color="error"
                      :content="chatRoom.newMessageCount"
                      inline
                      v-if="chatRoom.newMessageCount > 0"
                      class="mr-4"
                    ></v-badge>
                    <v-btn color="primary" variant="tonal" @click.stop="joinChatRoom(chatRoom.id)">
                      참여하기
                    </v-btn>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            
            <!-- 빈 상태 -->
            <div v-else class="text-center py-10">
              <v-icon size="50" color="grey-lighten-1">mdi-message-off</v-icon>
              <p class="text-grey-lighten-1 mt-4">아직 참여 중인 채팅방이 없습니다.</p>
              <v-btn color="primary" @click="showCreateRoomModal = true" class="mt-2">
                첫 번째 채팅방 만들기
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 채팅방 생성 버튼 -->
    <v-btn
      icon="mdi-plus"
      size="large"
      color="primary"
      position="fixed"
      location="bottom right"
      class="ma-4"
      @click="showCreateRoomModal = true"
      v-if="chatRoomList.length > 0"
    ></v-btn>

    <!-- 채팅방 생성 모달 -->
    <v-dialog v-model="showCreateRoomModal" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          새로운 채팅방 생성
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="방 제목"
            v-model="newRoomTitle"
            variant="outlined"
            autofocus
            @keyup.enter="createChatRoom"
            :error-messages="roomTitleError"
            :disabled="creating"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="closeCreateModal"
            :disabled="creating"
          >
            취소
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            @click="createChatRoom"
            :loading="creating"
            :disabled="!newRoomTitle.trim()"
          >
            생성
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 성공/에러 스낵바 -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { useChatStore } from '@/stores/chat';
import { storeToRefs } from 'pinia';

export default {
  setup() {
    const chatStore = useChatStore();
    const { chatRoomList } = storeToRefs(chatStore);

    return {
      chatStore,
      chatRoomList,
    };
  },
  
  data() {
    return {
      showCreateRoomModal: false,
      newRoomTitle: "",
      roomTitleError: "",
      creating: false,
      showSnackbar: false,
      snackbarMessage: "",
      snackbarColor: "success"
    }
  },
  
  methods: {
    async joinChatRoom(roomId) {
      try {
        await this.chatStore.joinChatRoom(roomId);
        this.$router.push({ path: `/chat/${roomId}` });
      } catch (error) {
        this.showSnackbarMessage('채팅방 참여에 실패했습니다.', 'error');
      }
    },
    
    async createChatRoom() {
      if (!this.newRoomTitle.trim()) {
        this.roomTitleError = "방 제목을 입력해주세요.";
        return;
      }
      
      this.creating = true;
      this.roomTitleError = "";
      
      try {
        const newRoom = await this.chatStore.createChatRoom(this.newRoomTitle.trim());
        this.showSnackbarMessage('채팅방이 생성되었습니다.', 'success');
        this.closeCreateModal();
        
        // 새로 생성된 채팅방으로 이동
        this.$router.push({ path: `/chat/${newRoom.id}` });
      } catch (error) {
        this.showSnackbarMessage('채팅방 생성에 실패했습니다.', 'error');
      } finally {
        this.creating = false;
      }
    },
    
    closeCreateModal() {
      this.showCreateRoomModal = false;
      this.newRoomTitle = "";
      this.roomTitleError = "";
    },
    
    async retryFetch() {
      this.chatStore.clearError();
      await this.chatStore.fetchChatRoomList();
    },
    
    showSnackbarMessage(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.showSnackbar = true;
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