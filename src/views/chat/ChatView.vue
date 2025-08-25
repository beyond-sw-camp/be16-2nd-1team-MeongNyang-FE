<template>
  <v-container fluid class="chat-view-container pa-0">
    <v-row no-gutters class="fill-height">
      <!-- 채팅방 목록 컬럼 -->
      <v-col 
        :cols="$vuetify.display.mdAndUp ? 4 : 12" 
        :class="[
          'chat-list-column fill-height',
          $vuetify.display.mdAndUp ? 'desktop-list' : 'mobile-list'
        ]"
      >
        <chat-list 
          :selected-chat-room-id="selectedChatRoomId"
          @chat-selected="onChatSelected" 
          @show-message="showMessage"
        />
      </v-col>
      
      <!-- 채팅방 컬럼 -->
      <v-col 
        :cols="$vuetify.display.mdAndUp ? 8 : 12" 
        :class="[
          'chat-room-column fill-height',
          $vuetify.display.mdAndUp ? 'desktop-room' : 'mobile-room'
        ]"
      >
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
import { provide, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'ChatView',
  components: {
    ChatList,
    GlobalSnackbar
  },
  setup() {
    const { showSnackbar } = useSnackbar()
    const selectedChatRoomId = ref(null)
    const router = useRouter()
    const route = useRoute()
    
    // showMessage 함수를 provide로 제공
    const showMessage = (message) => {
      showSnackbar(message.text, message.type)
    }
    
    // provide를 통해 showMessage 함수 제공
    provide('showMessage', showMessage)
    
    // 채팅방 선택 처리
    const onChatSelected = (roomId) => {
      // roomId 유효성 검사
      console.log('ChatView에서 받은 roomId:', roomId, typeof roomId);
      
      if (!roomId || roomId === null || roomId === undefined) {
        console.error('유효하지 않은 roomId:', roomId);
        showMessage({
          type: 'error',
          text: '채팅방 ID가 유효하지 않습니다.'
        });
        return;
      }
      
      // roomId가 객체인 경우 id 필드에서 추출
      let actualRoomId = roomId;
      if (typeof roomId === 'object' && roomId !== null) {
        if (roomId.id !== undefined) {
          actualRoomId = roomId.id;
        } else {
          console.error('roomId 객체에 id 필드가 없습니다:', roomId);
          showMessage({
            type: 'error',
            text: '채팅방 ID를 찾을 수 없습니다.'
          });
          return;
        }
      }
      
      // 숫자나 문자열로 변환
      actualRoomId = String(actualRoomId);
      console.log('라우터로 이동할 roomId:', actualRoomId);
      
      // 선택된 채팅방 ID 업데이트
      selectedChatRoomId.value = actualRoomId;
      
      router.push({ name: 'ChatRoom', params: { roomId: actualRoomId } });
    }
    
    // 라우트 변경 시 선택된 채팅방 ID 업데이트
    watch(() => route.params.roomId, (newRoomId) => {
      if (newRoomId) {
        selectedChatRoomId.value = newRoomId;
      }
    }, { immediate: true })
    
    return {
      selectedChatRoomId,
      onChatSelected,
      showMessage
    }
  }
}
</script>

<style scoped>
.chat-view-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #FFFDF6 0%, #FAF9F6 100%);
}

.fill-height {
  height: 100vh;
  max-height: 100vh;
}

/* 데스크톱 채팅방 목록 */
.desktop-list {
  border-right: 1px solid var(--mm-border-light);
  background: var(--mm-surface);
  box-shadow: var(--mm-shadow-md);
  transition: all var(--mm-transition-normal);
  position: relative;
  overflow: hidden;
}

.desktop-list::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.02) 0%, rgba(255, 107, 107, 0.01) 100%);
  opacity: 0.8;
  pointer-events: none;
}

/* 데스크톱 채팅방 */
.desktop-room {
  background: var(--mm-surface);
  position: relative;
  overflow: hidden;
}

.desktop-room::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.01) 0%, rgba(255, 107, 107, 0.005) 100%);
  opacity: 0.6;
  pointer-events: none;
}

/* 모바일 레이아웃 */
.mobile-list {
  display: block;
  z-index: 10;
}

.mobile-room {
  display: block;
  z-index: 5;
}

.chat-list-column {
  overflow: hidden;
  transition: all var(--mm-transition-normal);
}

.chat-room-column {
  overflow: hidden;
  transition: all var(--mm-transition-normal);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-view-container {
    height: 100vh;
    background: var(--mm-surface);
  }
  
  .fill-height {
    height: 100vh;
  }
  
  .chat-list-column,
  .chat-room-column {
    transition: transform var(--mm-transition-normal);
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-view-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }
  
  .desktop-list {
    background: #2d2d2d;
    border-right-color: #404040;
  }
  
  .desktop-list::before {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.05) 0%, rgba(255, 107, 107, 0.02) 100%);
  }
  
  .desktop-room {
    background: #2d2d2d;
  }
  
  .desktop-room::before {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.02) 0%, rgba(255, 107, 107, 0.01) 100%);
  }
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-list-column,
.chat-room-column {
  animation: fadeIn 0.3s ease-out;
}

/* 스크롤바 스타일링 */
.chat-list-column::-webkit-scrollbar,
.chat-room-column::-webkit-scrollbar {
  width: 8px;
}

.chat-list-column::-webkit-scrollbar-track,
.chat-room-column::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list-column::-webkit-scrollbar-thumb,
.chat-room-column::-webkit-scrollbar-thumb {
  background: var(--mm-border);
  border-radius: var(--mm-radius-full);
  transition: background var(--mm-transition-fast);
}

.chat-list-column::-webkit-scrollbar-thumb:hover,
.chat-room-column::-webkit-scrollbar-thumb:hover {
  background: var(--mm-on-surface-variant);
}
</style>