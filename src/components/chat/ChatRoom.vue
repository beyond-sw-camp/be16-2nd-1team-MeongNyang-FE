<template>
  <v-card class="chat-room-container d-flex flex-column" flat tile>
    <v-toolbar color="white" flat class="chat-header">
      <v-toolbar-title>{{ currentRoom?.roomName || '채팅' }}</v-toolbar-title>
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text class="chat-messages-container flex-grow-1 pa-4" ref="chatBox">
      <template v-for="item in messagesWithDateSeparators" :key="item.id">
        <div v-if="item.type === 'date-separator'" class="text-center my-4">
          <v-chip small>{{ item.date }}</v-chip>
        </div>
        <div v-else :class="['message-row', 'mb-2', item.senderEmail === senderEmail ? 'sent-message' : 'received-message']">
          <!-- 아바타 영역 -->
          <div class="avatar-area">
            <v-avatar v-if="item.senderEmail !== senderEmail && item.showAvatarAndEmail" size="40">
              <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="avatar"></v-img>
            </v-avatar>
          </div>
          
          <!-- 메시지 내용 영역 -->
          <div class="message-content">
            <div class="font-weight-bold mb-1 text-left" v-if="item.senderEmail !== senderEmail && item.showAvatarAndEmail">{{ item.senderEmail }}</div>
            <div class="message-bubble-container">
              <div :class="['message-bubble', item.senderEmail === senderEmail ? 'sent' : 'received', { 'media-bubble': item.fileUrls && item.fileUrls.length > 0 }]">
                <div v-if="item.message">{{ item.message }}</div>
                
                <!-- 파일 표시 - 종류별 그룹화된 그리드 -->
                <div v-if="item.fileUrls && item.fileUrls.length > 0" class="mt-2">
                  <FileGrid :files="item.fileUrls" />
                </div>
              </div>
              <div class="message-meta">
                <div class="d-flex align-end mx-2" v-if="item.senderEmail !== senderEmail">
                  <div class="text-caption text-grey-darken-1" :style="{ visibility: item.unreadCount > 0 ? 'visible' : 'hidden' }">{{ item.unreadCount }}</div>
                  <div class="text-caption text-grey-darken-1 ml-1" :style="{ visibility: item.showTimestamp ? 'visible' : 'hidden' }">{{ formatTime(item.sendTime) }}</div>
                </div>
                <div class="d-flex align-end mx-2" v-if="item.senderEmail === senderEmail">
                  <div class="text-caption text-grey-darken-1" :style="{ visibility: item.unreadCount && item.showTimestamp > 0 ? 'visible' : 'hidden' }">{{ item.unreadCount }}</div>
                  <div class="text-caption text-grey-darken-1 ml-1" :style="{ visibility: item.showTimestamp ? 'visible' : 'hidden' }">{{ formatTime(item.sendTime) }}</div>
                  <div class="text-caption text-grey-darken-1" :style="{ visibility: item.unreadCount && !item.showTimestamp > 0 ? 'visible' : 'hidden' }">{{ item.unreadCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="chat-input-container pa-4">
      <v-btn icon @click="triggerFileInput" class="mr-2">
        <v-icon>mdi-paperclip</v-icon>
      </v-btn>
      <input type="file" ref="fileInput" @change="onFileChange" multiple style="display: none;" />
      
      <v-textarea
        v-model="newMessage"
        label="메세지 입력"
        @keyup.enter="sendMessage"
        hide-details
        outlined
        dense
        rows="1"
        auto-grow
        class="mr-2"
        :disabled="!stompClient?.connected || isSending"
      ></v-textarea>
      <v-btn 
        icon="mdi-send" 
        color="primary" 
        @click="sendMessage"
        :disabled="!stompClient?.connected || isSending"
        :loading="isSending"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import axios from 'axios'
import FileGrid from './FileGrid.vue'

export default {
  name: 'ChatRoom',
  components: {
    FileGrid
  },
  props: {
    roomId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const chatStore = useChatStore()
    
    // 반응형 데이터
    const participants = ref([])
    const onlineParticipants = ref([])
    const messages = ref([])
    const newMessage = ref('')
    const stompClient = ref(null)
    const senderEmail = ref('')
    const selectedFiles = ref([])
    const loading = ref(false)
    const error = ref(null)
    const currentRoom = ref(null)
    const isSending = ref(false)
    
    // 파일 입력 참조
    const fileInput = ref(null)
    const chatBox = ref(null)
    
    // 계산된 속성
    const displayedMessages = computed(() => {
      return messages.value.map(message => {
        let unreadCount = 0
        participants.value.forEach(participant => {
          if (participant.lastReadMessageId < message.id) {
            unreadCount++
          }
        })
        return { ...message, unreadCount }
      })
    })
    
    const messagesWithDateSeparators = computed(() => {
      const messagesWithSeparators = []
      let lastDate = null
      displayedMessages.value.forEach((message, index) => {
        const messageDate = new Date(message.sendTime).toLocaleDateString()
        if (lastDate !== messageDate) {
          messagesWithSeparators.push({
            type: 'date-separator',
            date: new Date(message.sendTime).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' }),
            id: `date-${messageDate}`
          })
          lastDate = messageDate
        }

        const previousMessage = displayedMessages.value[index - 1];
        const nextMessage = displayedMessages.value[index + 1];

        const showTimestamp = !nextMessage || nextMessage.senderEmail !== message.senderEmail || new Date(nextMessage.sendTime) - new Date(message.sendTime) > 60000;
        const showAvatarAndEmail = !previousMessage || previousMessage.senderEmail !== message.senderEmail || new Date(message.sendTime) - new Date(previousMessage.sendTime) > 60000;

        messagesWithSeparators.push({ ...message, showTimestamp, showAvatarAndEmail })
      })
      return messagesWithSeparators
    })
    
    // 메서드들
    const retryLoad = async () => {
      error.value = null
      loading.value = true
      await loadRoomData()
    }
    
    const loadRoomData = async () => {
      try {
        // 채팅방 정보는 기본값으로 설정 (백엔드 API 불필요)
        currentRoom.value = {
          id: props.roomId,
          roomName: `채팅방 #${props.roomId}`,
          createdAt: new Date().toISOString()
        }
        
        // 메시지와 참여자는 채팅 스토어를 통해 로드
        await chatStore.getMessages(props.roomId)
        await chatStore.getParticipants(props.roomId)
        
        // 스토어에서 데이터 가져오기
        messages.value = chatStore.messages
        participants.value = chatStore.participants
        
        loading.value = false
      } catch (err) {
        console.error('채팅방 데이터 로드 실패:', err)
        error.value = '채팅방 데이터를 불러오는데 실패했습니다.'
        loading.value = false
      }
    }
    
    const connectWebsocket = () => {
      if (stompClient.value && stompClient.value.connected) return
      
      const sockJS = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/connect`)
      stompClient.value = Stomp.over(sockJS)
      
      const accessToken = localStorage.getItem('accessToken')
      
      stompClient.value.connect(
        { Authorization: `Bearer ${accessToken}` },
        () => {
          // 메시지 구독
          stompClient.value.subscribe(`/topic/chat-rooms/${props.roomId}/chat-message`, (message) => {
            const parseMessage = JSON.parse(message.body)
            messages.value.push(parseMessage)
            
            onlineParticipants.value.forEach(online => {
              participants.value.forEach(p => {
                if (p.email === online.email) {
                  p.lastReadMessageId = parseMessage.id
                }
              })
            })
          }, { Authorization: `Bearer ${accessToken}` })
          
          // 참여자 구독
          stompClient.value.subscribe(`/topic/chat-rooms/${props.roomId}/chat-participants`, (message) => {
            const parseMessage = JSON.parse(message.body)
            participants.value = parseMessage
          }, { Authorization: `Bearer ${accessToken}` })
          
          // 온라인 참여자 구독
          stompClient.value.subscribe(`/topic/chat-rooms/${props.roomId}/chat-online-participants`, (message) => {
            const parseMessage = JSON.parse(message.body)
            onlineParticipants.value = parseMessage
            
            onlineParticipants.value.forEach(online => {
              participants.value.forEach(p => {
                if (p.email === online.email) {
                  p.lastReadMessageId = messages.value.length > 0 ? messages.value[messages.value.length - 1].id : 0
                }
              })
            })
          }, { Authorization: `Bearer ${accessToken}` })
          
          // 온라인 상태 전송
          const onlineMessage = { email: senderEmail.value }
          stompClient.value.send(`/publish/chat-rooms/${props.roomId}/online`, JSON.stringify(onlineMessage))
        }
      )
    }
    
    const disconnectWebsocket = () => {
      if (stompClient.value && stompClient.value.connected) {
        const offlineMessage = { email: senderEmail.value }
        stompClient.value.send(`/publish/chat-rooms/${props.roomId}/offline`, JSON.stringify(offlineMessage))
        
        stompClient.value.unsubscribe(`/topic/chat-rooms/${props.roomId}/chat-message`)
        stompClient.value.unsubscribe(`/topic/chat-rooms/${props.roomId}/chat-participants`)
        stompClient.value.unsubscribe(`/topic/chat-rooms/${props.roomId}/chat-online-participants`)
        stompClient.value.disconnect()
        stompClient.value = null
      }
    }
    
    const sendMessage = async () => {
      if (isSending.value) return
      if (newMessage.value.trim() === '' && selectedFiles.value.length === 0) return

      isSending.value = true
      error.value = null

      try {
        let fileUrls = []
        if (selectedFiles.value.length > 0) {
          fileUrls = await uploadFiles()
        }

        const message = {
          senderEmail: senderEmail.value,
          message: newMessage.value,
          fileUrls: fileUrls
        }

        const json = JSON.stringify(message)
        stompClient.value.send(`/publish/chat-rooms/${props.roomId}/chat-message`, json)

        newMessage.value = ''
        selectedFiles.value = []
        if (fileInput.value) fileInput.value.value = null
      } catch (err) {
        error.value = '메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.'
        console.error('메시지 전송 실패:', err)
      } finally {
        isSending.value = false
      }
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatBox.value) {
          chatBox.value.scrollTop = chatBox.value.scrollHeight
        }
      })
    }
    
    const triggerFileInput = () => {
      if (fileInput.value) fileInput.value.click()
    }
    
    const onFileChange = (event) => {
      selectedFiles.value = Array.from(event.target.files)
    }
    
    const uploadFiles = async () => {
      const formData = new FormData()
      selectedFiles.value.forEach(file => {
        formData.append('files', file)
      })
      
      try {
        const res = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-rooms/${props.roomId}/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        return res.data.data
      } catch (error) {
        console.error('파일 업로드 실패:', error)
        throw new Error('파일 업로드에 실패했습니다.')
      }
    }
    

    
    const formatTime = (dateTime) => {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return new Intl.DateTimeFormat('default', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date)
    }
    
    watch(() => props.roomId, async (newRoomId, oldRoomId) => {
      if (newRoomId && newRoomId !== oldRoomId) {
        disconnectWebsocket()
        await loadRoomData()
        connectWebsocket()
      }
    })
    
    watch(messages, () => {
      scrollToBottom()
    }, { deep: true })
    
    onMounted(async () => {
      senderEmail.value = localStorage.getItem('email')
      if (props.roomId) {
        await loadRoomData()
        connectWebsocket()
      }
      window.addEventListener('beforeunload', disconnectWebsocket)
    })
    
    onUnmounted(() => {
      disconnectWebsocket()
      window.removeEventListener('beforeunload', disconnectWebsocket)
    })
    
    return {
      participants,
      onlineParticipants,
      messages,
      newMessage,
      stompClient,
      senderEmail,
      selectedFiles,
      loading,
      error,
      currentRoom,
      fileInput,
      chatBox,
      displayedMessages,
      messagesWithDateSeparators,
      retryLoad,
      connectWebsocket,
      disconnectWebsocket,
      sendMessage,
      scrollToBottom,
      triggerFileInput,
      onFileChange,
      uploadFiles,
      formatTime,
      isSending
    }
  }
}
</script>

<style scoped>
/* 채팅방 컨테이너 높이 제한 */
.chat-room-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

/* 채팅 헤더 고정 높이 */
.chat-header {
  flex-shrink: 0;
  min-height: 64px;
}

/* 메시지 컨테이너 스크롤 영역 */
.chat-messages-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 140px); /* 헤더(64px) + 입력영역(76px) 제외 */
  max-height: calc(100vh - 140px);
  scroll-behavior: smooth;
}

/* 입력 영역 고정 높이 */
.chat-input-container {
  flex-shrink: 0;
  min-height: 76px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

/* 스크롤바 스타일링 */
.chat-messages-container::-webkit-scrollbar {
  width: 6px;
}

.chat-messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Grid 레이아웃 기반 메시지 구조 */
.message-row {
  display: grid;
  gap: 12px;
  align-items: start;
}

.received-message {
  grid-template-columns: 40px 1fr;
  justify-items: start;
}

.sent-message {
  grid-template-columns: 1fr 40px;
  justify-items: end;
}

.sent-message .avatar-area {
  order: 2;
}

.sent-message .message-content {
  order: 1;
  justify-self: end;
}

.avatar-area {
  display: flex;
  justify-content: center;
}

.message-content {
  min-width: 0; /* Grid에서 텍스트 오버플로우 방지 */
}

.message-bubble-container {
  display: flex;
  align-items: end;
  gap: 8px;
}

.sent-message .message-bubble-container {
  flex-direction: row-reverse;
}

.message-bubble {
  padding: 12px 18px;
  border-radius: 25px;
  max-width: 60%;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.media-bubble {
  min-width: 250px;
  max-width: 60%;
}

.media-bubble video,
.media-bubble img {
  max-width: 100%;
  height: auto;
}

.sent {
  background-color: #42a5f5;
  color: white;
  border-bottom-right-radius: 4px;
}

.received {
  background-color: #f1f3f4;
  color: black;
  border-bottom-left-radius: 4px;
}

.message-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: fit-content;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-room-container {
    height: 100vh;
  }
  
  .chat-messages-container {
    height: calc(100vh - 120px);
    max-height: calc(100vh - 120px);
  }
  
  .message-bubble {
    max-width: 80%;
  }
  
  .media-bubble {
    min-width: 200px;
    max-width: 80%;
  }
}
</style>
