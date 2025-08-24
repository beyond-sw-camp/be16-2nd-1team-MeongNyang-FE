<template>
  <div class="chat-list-container">
    <!-- 심플한 헤더 -->
    <div class="chat-list-header">
      <h2 class="header-title">채팅</h2>
      <v-btn 
        icon 
        color="primary" 
        variant="text"
        @click="showUserSelectionModal = true"
        class="new-chat-btn"
        size="small"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>
    
    <!-- 채팅방 목록 -->
    <div class="chat-rooms-list">
      <div
        v-for="chatRoom in filteredChatRoomList"
        :key="chatRoom.id"
        @click="selectChatRoom(chatRoom.id)"
        class="chat-room-item"
        :class="{ 'has-unread': chatRoom.newMessageCount > 0 }"
      >
        <!-- 채팅방 아바타 -->
        <div class="room-avatar">
          <div class="avatar-circle">
            <v-icon size="20" color="white">mdi-chat</v-icon>
          </div>
          <div 
            v-if="chatRoom.newMessageCount > 0" 
            class="unread-badge"
          >
            {{ chatRoom.newMessageCount > 99 ? '99+' : chatRoom.newMessageCount }}
          </div>
        </div>
        
        <!-- 채팅방 정보 -->
        <div class="room-info">
          <div class="room-name">{{ chatRoom.roomName }}</div>
          <div class="room-meta">
            <span class="last-message">{{ chatRoom.lastMessage || '새로운 채팅방입니다.' }}</span>
            <span class="last-message-time">{{ formatLastMessageTime(chatRoom.lastMessageTime || chatRoom.updatedAt || new Date()) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 빈 상태 -->
      <div v-if="filteredChatRoomList.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-text">
          아직 채팅방이 없습니다.
        </div>
        <v-btn 
          color="primary" 
          variant="outlined" 
          @click="showUserSelectionModal = true"
          size="small"
          class="empty-action-btn"
        >
          첫 채팅방 만들기
        </v-btn>
      </div>
    </div>
    
    <!-- 유저 선택 모달 -->
    <UserSelectionModal
      v-model="showUserSelectionModal"
      @users-selected="createNewChatRoom"
    />
  </div>
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
    const showUserSelectionModal = ref(false);

    const filteredChatRoomList = computed(() => {
      return chatRoomList.value;
    });

    return {
      chatStore,
      chatRoomList,
      filteredChatRoomList,
      showUserSelectionModal
    };
  },
  methods: {
    selectChatRoom(roomId) {
      this.$emit('chat-selected', roomId);
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
        
        // roomId 디버깅
        console.log('생성된 roomId:', roomId, typeof roomId);
        console.log('roomId가 유효한지 확인:', roomId && roomId !== null && roomId !== undefined);
        
        // 성공 메시지 표시
        this.$emit('show-message', {
          type: 'success',
          text: `${selectedUsers.length}명과의 새 채팅방이 생성되었습니다.`
        });
        
        // 채팅방 목록 새로고침
        await this.refreshChatList();
        
        // 새로 생성된 채팅방으로 이동
        if (roomId && roomId !== null && roomId !== undefined) {
          console.log('채팅방으로 이동:', roomId);
          this.$emit('chat-selected', roomId);
        } else {
          console.error('유효하지 않은 roomId:', roomId);
          this.$emit('show-message', {
            type: 'error',
            text: '채팅방 ID가 유효하지 않습니다.'
          });
        }
        
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
    },
    
    formatLastMessageTime(timestamp) {
      if (!timestamp) return '';
      try {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = (now - messageTime) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
          return '방금 전';
        } else if (diffInHours < 24) {
          return `${Math.floor(diffInHours)}시간 전`;
        } else if (diffInHours < 48) {
          return '어제';
        } else {
          return messageTime.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        }
      } catch (error) {
        console.warn('시간 포맷팅 오류:', error);
        return '';
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
  background: var(--mm-surface);
  display: flex;
  flex-direction: column;
}

/* 채팅 목록 헤더 */
.chat-list-header {
  flex-shrink: 0;
  min-height: 72px;
  padding: 0 24px;
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.chat-list-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-title {
  margin: 0;
  color: white;
  font-size: var(--mm-text-xl);
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

/* 새 채팅방 버튼 */
.new-chat-btn {
  color: white;
  transition: all var(--mm-transition-normal);
  position: relative;
  z-index: 1;
}

.new-chat-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* 채팅방 목록 */
.chat-rooms-list {
  background: transparent;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 72px);
  max-height: calc(100vh - 72px);
  scroll-behavior: smooth;
  flex: 1;
}

.chat-room-item {
  margin: 8px 0;
  border-radius: var(--mm-radius-lg);
  transition: all var(--mm-transition-normal);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--mm-surface);
  border: 1px solid var(--mm-border-light);
  cursor: pointer;
}

.chat-room-item:hover {
  background: var(--mm-surface-variant);
  border-color: #FF6B6B;
  box-shadow: var(--mm-shadow-sm);
  transform: translateY(-1px);
}

.chat-room-item.has-unread {
  border-left: 4px solid #E87D7D;
  padding-left: 12px;
  background: rgba(232, 125, 125, 0.02);
}

/* 채팅방 아바타 */
.room-avatar {
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: var(--mm-radius-full);
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--mm-border);
  transition: all var(--mm-transition-normal);
}

.chat-room-item:hover .avatar-circle {
  border-color: #E87D7D;
  transform: scale(1.05);
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #FF6B6B;
  color: white;
  border-radius: var(--mm-radius-full);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid var(--mm-surface);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 107, 107, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

/* 채팅방 정보 */
.room-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.room-name {
  font-weight: 600;
  font-size: var(--mm-text-base);
  color: var(--mm-on-surface);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.room-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--mm-text-xs);
  color: var(--mm-on-surface-variant);
}

.last-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.last-message-time {
  font-weight: 500;
  color: var(--mm-on-surface-variant);
  flex-shrink: 0;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--mm-space-16);
  text-align: center;
  color: var(--mm-on-surface-variant);
  height: 100%;
}

.empty-icon {
  margin-bottom: var(--mm-space-4);
  opacity: 0.5;
  font-size: 64px;
}

.empty-text {
  font-size: var(--mm-text-base);
  margin-bottom: var(--mm-space-6);
  line-height: 1.5;
}

.empty-action-btn {
  border-radius: var(--mm-radius-lg);
  font-weight: 500;
}

/* 스크롤바 스타일링 */
.chat-rooms-list::-webkit-scrollbar {
  width: 6px;
}

.chat-rooms-list::-webkit-scrollbar-track {
  background: transparent;
}

.chat-rooms-list::-webkit-scrollbar-thumb {
  background: var(--mm-border);
  border-radius: var(--mm-radius-full);
  transition: background var(--mm-transition-fast);
}

.chat-rooms-list::-webkit-scrollbar-thumb:hover {
  background: var(--mm-on-surface-variant);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-list-container {
    height: 100vh;
  }
  
  .chat-rooms-list {
    height: calc(100vh - 72px);
    max-height: calc(100vh - 72px);
    padding: 12px;
  }
  
  .chat-room-item {
    padding: 12px;
    margin: 6px 0;
  }
  
  .room-avatar {
    margin-right: 12px;
  }
  
  .avatar-circle {
    width: 36px;
    height: 36px;
  }
  
  .room-name {
    font-size: var(--mm-text-sm);
  }
  
  .room-meta {
    font-size: 10px;
  }
  
  .last-message {
    margin-right: 8px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-list-container {
    background: #2d2d2d;
  }
  
  .chat-room-item {
    background: #2d2d2d;
    border-color: #404040;
  }
  
  .chat-room-item:hover {
    background: #404040;
  }
  
  .chat-room-item.has-unread {
    background: rgba(232, 125, 125, 0.05);
  }
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-room-item {
  animation: fadeInUp 0.3s ease-out;
}

/* 호버 효과 개선 */
.chat-room-item:hover {
  transform: translateY(-1px);
}

.chat-room-item.has-unread:hover {
  transform: translateY(-1px) translateX(2px);
}
</style>
