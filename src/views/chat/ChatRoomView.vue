<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import axios from 'axios'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const chatStore = useChatStore()
    
    // 반응형 데이터
    const drawer = ref(true)
    const participants = ref([])
    const onlineParticipants = ref([])
    const messages = ref([])
    const newMessage = ref('')
    const stompClient = ref(null)
    const senderEmail = ref('')
    const roomId = ref(null)
    const selectedFiles = ref([])
    const loading = ref(false)
    const error = ref(null)
    const showLeaveDialog = ref(false)
    const leaving = ref(false)
    const currentRoom = ref(null)
    
    // 스낵바 상태
    const showConnectionSnackbar = ref(false)
    const connectionSnackbarMessage = ref('')
    const connectionSnackbarColor = ref('success')
    
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
    
    const isOnline = computed(() => {
      return (participant) => {
        return onlineParticipants.value.some(online => online.email === participant.email)
      }
    })
    
    const messagesWithDateSeparators = computed(() => {
      const messagesWithSeparators = []
      let lastDate = null
      displayedMessages.value.forEach(message => {
        const messageDate = new Date(message.sendTime).toLocaleDateString()
        if (lastDate !== messageDate) {
          messagesWithSeparators.push({
            type: 'date-separator',
            date: new Date(message.sendTime).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' }),
            id: `date-${messageDate}`
          })
          lastDate = messageDate
        }
        messagesWithSeparators.push(message)
      })
      return messagesWithSeparators
    })
    
    // 메서드들
    const showConnectionMessage = (message, color = 'success') => {
      connectionSnackbarMessage.value = message
      connectionSnackbarColor.value = color
      showConnectionSnackbar.value = true
    }
    
    const goBack = () => {
      router.push('/chat')
    }
    
    const leaveChatRoom = async () => {
      try {
        leaving.value = true
        await chatStore.leaveRoom(roomId.value)
        
        // 성공 메시지 표시
        showConnectionMessage('채팅방을 나갔습니다.', 'success')
        
        // 잠시 후 채팅 목록으로 이동
        setTimeout(() => {
          router.push('/chat')
        }, 1500)
        
      } catch (error) {
        console.error('채팅방 나가기 실패:', error)
        showConnectionMessage('채팅방을 나가는데 실패했습니다.', 'error')
      } finally {
        leaving.value = false
        showLeaveDialog.value = false
      }
    }
    
    const retryLoad = async () => {
      error.value = null
      loading.value = true
      await loadRoomData()
    }
    
    const loadRoomData = async () => {
      try {
        // 채팅방 정보는 기본값으로 설정 (백엔드 API 불필요)
        currentRoom.value = {
          id: roomId.value,
          roomName: `채팅방 #${roomId.value}`,
          createdAt: new Date().toISOString()
        }
        
        // 메시지와 참여자는 채팅 스토어를 통해 로드
        await chatStore.getMessages(roomId.value)
        await chatStore.getParticipants(roomId.value)
        
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
          showConnectionMessage('채팅방에 연결되었습니다.', 'success')
          
          // 메시지 구독
          stompClient.value.subscribe(`/topic/chat-rooms/${roomId.value}/chat-message`, (message) => {
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
          stompClient.value.subscribe(`/topic/chat-rooms/${roomId.value}/chat-participants`, (message) => {
            const parseMessage = JSON.parse(message.body)
            participants.value = parseMessage
          }, { Authorization: `Bearer ${accessToken}` })
          
          // 온라인 참여자 구독
          stompClient.value.subscribe(`/topic/chat-rooms/${roomId.value}/chat-online-participants`, (message) => {
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
          stompClient.value.send(`/publish/chat-rooms/${roomId.value}/online`, JSON.stringify(onlineMessage))
        }
      )
      
      stompClient.value.onclose = (event) => {
        console.error("STOMP 연결 종료:", event)
        showConnectionMessage('채팅방 연결이 종료되었습니다.', 'warning')
      }
      
      stompClient.value.onerror = (error) => {
        console.error("STOMP 에러:", error)
        showConnectionMessage('채팅방 연결에 문제가 발생했습니다.', 'error')
      }
    }
    
    const disconnectWebsocket = () => {
      if (stompClient.value && stompClient.value.connected) {
        const offlineMessage = { email: senderEmail.value }
        stompClient.value.send(`/publish/chat-rooms/${roomId.value}/offline`, JSON.stringify(offlineMessage))
        
        stompClient.value.unsubscribe(`/topic/chat-rooms/${roomId.value}/chat-message`)
        stompClient.value.unsubscribe(`/topic/chat-rooms/${roomId.value}/chat-participants`)
        stompClient.value.unsubscribe(`/topic/chat-rooms/${roomId.value}/chat-online-participants`)
        stompClient.value.disconnect()
        console.log("WebSocket 연결 해제")
        stompClient.value = null
      }
    }
    
    const sendMessage = async () => {
      if (newMessage.value.trim() === '' && selectedFiles.value.length === 0) return
      
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
      stompClient.value.send(`/publish/chat-rooms/${roomId.value}/chat-message`, json)
      
      newMessage.value = ''
      selectedFiles.value = []
      if (fileInput.value) fileInput.value.value = null
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatBox.value) {
          const el = chatBox.value.$el || chatBox.value
          el.scrollTop = el.scrollHeight
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
        const res = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-rooms/${roomId.value}/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        return res.data.data
      } catch (error) {
        console.error('파일 업로드 실패:', error)
        showConnectionMessage('파일 업로드에 실패했습니다.', 'error')
        return []
      }
    }
    
    const isImage = (url) => {
      if (!url) return false
      const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
      const extension = url.split('.').pop().toLowerCase()
      return imageExtensions.includes(extension)
    }
    
    const isVideo = (url) => {
      if (!url) return false
      const videoExtensions = ['mp4', 'webm', 'ogg']
      const extension = url.split('.').pop().toLowerCase()
      return videoExtensions.includes(extension)
    }
    
    const isAudio = (url) => {
      if (!url) return false
      const audioExtensions = ['mp3', 'ogg', 'wav']
      const extension = url.split('.').pop().toLowerCase()
      return audioExtensions.includes(extension)
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
    
    // 라우트 변경 감지
    watch(() => route.params.roomId, async (newRoomId) => {
      if (newRoomId && newRoomId !== roomId.value) {
        disconnectWebsocket()
        roomId.value = newRoomId
        await loadRoomData()
        connectWebsocket()
      }
    })
    
    // 메시지 변경 감지
    watch(messages, () => {
      scrollToBottom()
    }, { deep: true })
    
    // 컴포넌트 마운트
    onMounted(async () => {
      senderEmail.value = localStorage.getItem('email')
      roomId.value = route.params.roomId
      
      await loadRoomData()
      connectWebsocket()
      
      // 페이지 언로드 이벤트 리스너
      window.addEventListener('beforeunload', disconnectWebsocket)
    })
    
    // 컴포넌트 언마운트
    onUnmounted(() => {
      disconnectWebsocket()
      window.removeEventListener('beforeunload', disconnectWebsocket)
    })
    
    return {
      // 반응형 데이터
      drawer,
      participants,
      onlineParticipants,
      messages,
      newMessage,
      stompClient,
      senderEmail,
      roomId,
      selectedFiles,
      loading,
      error,
      currentRoom,
      showLeaveDialog,
      leaving,
      
      // 스낵바 상태
      showConnectionSnackbar,
      connectionSnackbarMessage,
      connectionSnackbarColor,
      
      // 참조
      fileInput,
      chatBox,
      
      // 계산된 속성
      displayedMessages,
      isOnline,
      messagesWithDateSeparators,
      
      // 메서드
      showConnectionMessage,
      goBack,
      retryLoad,
      leaveChatRoom,
      connectWebsocket,
      disconnectWebsocket,
      sendMessage,
      scrollToBottom,
      triggerFileInput,
      onFileChange,
      uploadFiles,
      isImage,
      isVideo,
      isAudio,
      formatTime
    }
  }
}
</script>

<template>
  <v-layout>
    <v-main>
      <v-container class="fill-height">
        <v-row class="fill-height" justify="center" align="center">
          <v-col cols="12" md="8" class="d-flex flex-column chat-container">
            <v-card class="flex-grow-1 d-flex flex-column">
              <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h5">{{ currentRoom?.roomName || '채팅' }}</span>
                <div class="d-flex align-center">
                  <v-btn icon @click.stop="drawer = !drawer" class="mr-2">
                    <v-icon>mdi-account-group</v-icon>
                  </v-btn>
                  <v-btn 
                    color="error" 
                    variant="outlined" 
                    size="small" 
                    @click="showLeaveDialog = true"
                    class="mr-2"
                  >
                    <v-icon left>mdi-exit-to-app</v-icon>
                    나가기
                  </v-btn>
                  <v-btn icon @click="goBack" variant="text">
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                </div>
              </v-card-title>
              <v-divider></v-divider>
              
              <!-- 로딩 상태 -->
              <div v-if="loading" class="flex-grow-1 d-flex align-center justify-center">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              </div>
              
              <!-- 에러 상태 -->
              <div v-else-if="error" class="flex-grow-1 d-flex flex-column align-center justify-center">
                <v-icon size="50" color="error">mdi-alert-circle</v-icon>
                <p class="text-error mt-4">{{ error }}</p>
                <v-btn color="primary" @click="retryLoad" class="mt-2">다시 시도</v-btn>
              </div>
              
              <!-- 채팅 내용 -->
              <v-card-text v-else class="flex-grow-1 overflow-y-auto pa-4" ref="chatBox">
                <template v-for="item in messagesWithDateSeparators" :key="item.id">
                  <div v-if="item.type === 'date-separator'" class="text-center my-4">
                    <v-chip small>{{ item.date }}</v-chip>
                  </div>
                  <div v-else
                    :class="['d-flex', 'mb-4', item.senderEmail === senderEmail ? 'flex-row-reverse' : 'flex-row', 'align-end']">
                    <div :class="['message-bubble', item.senderEmail === senderEmail ? 'sent' : 'received', { 'media-bubble': item.fileUrls && item.fileUrls.length > 0 }]">
                      <div class="font-weight-bold" v-if="item.senderEmail !== senderEmail">{{ item.senderEmail }}</div>
                      <div v-if="item.message">{{ item.message }}</div>
                      
                      <!-- 파일 표시 -->
                      <div v-if="item.fileUrls && item.fileUrls.length > 0" class="mt-2">
                        <div v-for="(url, index) in item.fileUrls" :key="index" class="my-1">
                          <v-img v-if="isImage(url)" :src="url" class="rounded-lg" aspect-ratio="1.7778"></v-img>
                          <video v-else-if="isVideo(url)" :src="url" controls></video>
                          <audio v-else-if="isAudio(url)" :src="url" controls></audio>
                          <a v-else :href="url" target="_blank" rel="noopener noreferrer">{{ url.split('/').pop() }}</a>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex align-end mx-2">
                      <div class="text-caption text-grey-darken-1" v-if="item.unreadCount > 0">{{ item.unreadCount }}</div>
                      <div class="text-caption text-grey-darken-1 ml-1">{{ formatTime(item.sendTime) }}</div>
                    </div>
                  </div>
                </template>
              </v-card-text>
              
              <v-divider></v-divider>
              
              <!-- 메시지 입력 -->
              <v-card-actions class="pa-4">
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
                  :disabled="!stompClient?.connected"
                ></v-textarea>
                <v-btn 
                  icon="mdi-send" 
                  color="primary" 
                  @click="sendMessage"
                  :disabled="!stompClient?.connected"
                ></v-btn>
              </v-card-actions>
              
              <!-- 선택된 파일 표시 -->
              <div v-if="selectedFiles.length > 0" class="pa-2 text-caption">
                <strong>선택된 파일:</strong>
                <ul>
                  <li v-for="file in selectedFiles" :key="file.name">{{ file.name }}</li>
                </ul>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- 참여자 목록 사이드바 -->
    <v-navigation-drawer v-model="drawer" location="right">
      <v-list-item title="참여자 목록"></v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item v-for="participant in participants" :key="participant.email" :value="participant.email">
          <template v-slot:prepend>
            <v-badge dot :color="isOnline(participant) ? 'green' : 'grey'" location="bottom end" offset-x="5" offset-y="5">
              <v-avatar size="32">
                <v-icon>mdi-account-circle</v-icon>
              </v-avatar>
            </v-badge>
          </template>
          <v-list-item-title class="ml-4">{{ participant.email }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 연결 상태 스낵바 -->
    <v-snackbar v-model="showConnectionSnackbar" :color="connectionSnackbarColor" timeout="3000">
      {{ connectionSnackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showConnectionSnackbar = false">닫기</v-btn>
      </template>
    </v-snackbar>
    
    <!-- 나가기 확인 다이얼로그 -->
    <v-dialog v-model="showLeaveDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-center">
          채팅방 나가기
        </v-card-title>
        <v-card-text class="text-center">
          <v-icon size="64" color="warning" class="mb-4">mdi-alert-circle</v-icon>
          <p>정말로 이 채팅방을 나가시겠습니까?</p>
          <p class="text-caption text-grey-darken-1">
            나가면 채팅방에 다시 참여할 수 없습니다.
          </p>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn 
            color="grey-darken-1" 
            variant="outlined" 
            @click="showLeaveDialog = false"
          >
            취소
          </v-btn>
          <v-btn 
            color="error" 
            @click="leaveChatRoom"
            :loading="leaving"
          >
            나가기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<style scoped>
.chat-container {
  height: 90vh;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 70%;
  word-wrap: break-word;
}

.media-bubble {
  min-width: 250px;
}

.sent {
  background-color: #1976D2;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0;
}

.received {
  background-color: #f0f0f0;
  color: black;
  align-self: flex-start;
  border-bottom-left-radius: 0;
}

video, audio {
  max-width: 100%;
  border-radius: 10px;
}
</style>
