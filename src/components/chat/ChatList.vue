<template>
  <div class="chat-list-container">
    <!-- 심플한 헤더 -->
    <div class="chat-list-header">
      <h2 class="header-title">채팅</h2>
      <v-btn 
        icon 
        color="primary" 
        variant="outlined"
        @click="showUserSelectionModal = true"
        class="new-chat-btn"
        size="large"
      >
        <v-icon size="24">mdi-plus</v-icon>
      </v-btn>
    </div>
    
    <!-- 채팅방 목록 -->
    <div class="chat-rooms-list">
      <div
        v-for="chatRoom in filteredChatRoomList"
        :key="chatRoom.id"
        @click="selectChatRoom(chatRoom.id)"
        class="chat-room-item"
        :class="{ 
          'has-unread': chatRoom.newMessageCount > 0,
          'selected': selectedChatRoomId == chatRoom.id
        }"
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
            <span class="last-message">{{ chatRoom.lastMessage || '파일' }}</span>
            <span class="last-message-time">{{ formatLastMessageTime(chatRoom.lastMessageTime || chatRoom.updatedAt || new Date()) }}</span>
          </div>
        </div>
        
        <!-- 선택 표시 아이콘 -->
        <div v-if="selectedChatRoomId === chatRoom.id" class="selection-indicator">
          <v-icon size="20" color="#E87D7D">mdi-check-circle</v-icon>
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
          size="large"
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
  props: {
    selectedChatRoomId: {
      type: [String, Number],
      default: null
    }
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
      // 선택된 채팅방에 시각적 피드백 제공
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

/* 헤더 스타일 */
.chat-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid var(--mm-border-light);
  background: var(--mm-surface);
  flex-shrink: 0;
  min-height: 72px;
}

.header-title {
  font-size: var(--mm-text-xl);
  font-weight: 700;
  color: var(--mm-on-surface);
  margin: 0;
}

/* 새 채팅 버튼 */
.new-chat-btn {
  border-radius: 16px !important;
  border: 2px solid rgba(232, 125, 125, 0.3) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%) !important;
  color: #E87D7D !important;
  transition: all var(--mm-transition-normal);
  min-width: 56px !important;
  height: 56px !important;
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.2);
}

.new-chat-btn:hover:not(:disabled) {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.4);
  border-color: rgba(232, 125, 125, 0.6) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%) !important;
}

.new-chat-btn:active {
  transform: scale(0.95);
}

.new-chat-btn .v-icon {
  transition: all var(--mm-transition-fast);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.new-chat-btn:hover .v-icon {
  transform: scale(1.2);
  color: #FF6B6B !important;
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

/* 선택된 채팅방 스타일 */
.chat-room-item.selected {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.08) 0%, rgba(255, 107, 107, 0.08) 100%);
  border: 2px solid #E87D7D;
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.3);
  transform: translateY(-2px);
}

.chat-room-item.selected:hover {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.12) 0%, rgba(255, 107, 107, 0.12) 100%);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

/* 선택 표시 아이콘 */
.selection-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  animation: selectionPulse 0.6s ease-out;
}

@keyframes selectionPulse {
  0% {
    opacity: 0;
    transform: translateY(-50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
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

.chat-room-item.selected .avatar-circle {
  border-color: #E87D7D;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(232, 125, 125, 0.2);
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
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
  text-align: left;
  width: 100%;
}

.chat-room-item.selected .room-name {
  color: #E87D7D;
  font-weight: 700;
}

.room-meta {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: var(--mm-text-xs);
  color: var(--mm-on-surface-variant);
  width: 100%;
  gap: 12px;
}

.last-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  min-width: 0;
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

/* 빈 상태 액션 버튼 */
.empty-action-btn {
  border-radius: 20px !important;
  border: 2px solid rgba(232, 125, 125, 0.3) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%) !important;
  color: #E87D7D !important;
  font-weight: 600 !important;
  padding: 12px 24px !important;
  transition: all var(--mm-transition-normal);
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.2);
}

.empty-action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.4);
  border-color: rgba(232, 125, 125, 0.6) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%) !important;
}

.empty-action-btn:active {
  transform: translateY(0);
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
    justify-content: flex-start;
    gap: 8px;
  }
  
  .last-message {
    text-align: left;
    min-width: 0;
  }
  
  .selection-indicator {
    right: 12px;
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
  
  .chat-room-item.selected {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.15) 0%, rgba(255, 107, 107, 0.15) 100%);
    border-color: #E87D7D;
  }
  
  .room-info {
    text-align: left;
  }
  
  .room-name {
    text-align: left;
  }
  
  .last-message {
    text-align: left;
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

.chat-room-item.selected:hover {
  transform: translateY(-2px);
}

/* 클릭 애니메이션 */
.chat-room-item:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

.chat-room-item.selected:active {
  transform: scale(0.98) translateY(-1px);
}
</style>
