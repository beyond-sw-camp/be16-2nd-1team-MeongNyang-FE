<template>
  <v-card class="chat-room-container d-flex flex-column" flat tile>
    <v-toolbar color="white" flat class="chat-header">
      <v-toolbar-title>{{ currentRoom?.roomName || '채팅' }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="showParticipants">
            <v-list-item-title>
              <v-icon start>mdi-account-group</v-icon>
              참여자 목록 ({{ participants.length }})
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="inviteParticipants">
            <v-list-item-title>
              <v-icon start>mdi-account-plus</v-icon>
              초대하기
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="confirmLeaveRoom" color="error">
            <v-list-item-title class="text-error">
              <v-icon start>mdi-exit-to-app</v-icon>
              채팅방 나가기
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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

  <!-- 참여자 목록 모달 -->
  <v-dialog v-model="showParticipantsDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-account-group</v-icon>
        참여자 목록
        <v-spacer></v-spacer>
        <v-btn icon @click="showParticipantsDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="participant in participants" :key="participant.email">
            <template v-slot:prepend>
              <v-avatar size="32">
                <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="avatar"></v-img>
              </v-avatar>
            </template>
            <v-list-item-title>{{ participant.email }}</v-list-item-title>
            <template v-slot:append>
              <v-chip 
                :color="isOnline(participant.email) ? 'green' : 'grey'" 
                size="small"
                variant="outlined"
              >
                {{ isOnline(participant.email) ? '온라인' : '오프라인' }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- 초대하기 모달 -->
  <v-dialog v-model="showInviteDialog" max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-account-plus</v-icon>
        초대하기
        <v-spacer></v-spacer>
        <div class="d-flex align-center mr-4" v-if="getSelectedUsersCount() > 0">
          <v-chip color="primary" variant="outlined" class="mr-2">
            {{ getSelectedUsersCount() }}명 선택됨
          </v-chip>
          <v-btn 
            color="primary" 
            size="small"
            @click="inviteSelectedUsers"
            :disabled="getSelectedUsersCount() === 0"
          >
            선택된 사용자 초대
          </v-btn>
        </div>
        <v-btn icon @click="showInviteDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <!-- 탭 네비게이션 -->
        <v-tabs v-model="inviteTab" color="primary" class="mb-4" @change="onTabChange">
          <v-tab value="search">이메일 검색</v-tab>
          <v-tab value="followers">팔로워</v-tab>
          <v-tab value="followings">팔로잉</v-tab>
        </v-tabs>

        <!-- 이메일 검색 탭 -->
        <v-window v-model="inviteTab">
          <v-window-item value="search">
            <div class="d-flex align-center mb-3" v-if="searchResults.length > 0">
              <v-checkbox
                v-model="selectAll"
                label="전체 선택"
                @change="toggleSelectAll"
                hide-details
                class="mr-4"
              ></v-checkbox>
            </div>
            <v-text-field
              v-model="inviteSearchQuery"
              label="사용자 검색"
              placeholder="이메일로 검색하세요"
              prepend-inner-icon="mdi-magnify"
              clearable
              @input="searchUsers"
            ></v-text-field>
            <v-list v-if="searchResults.length > 0">
              <v-list-item 
                v-for="user in searchResults" 
                :key="user.email"
                @click="toggleUserSelection(user)"
                class="cursor-pointer"
              >
                <template v-slot:prepend>
                  <v-checkbox
                    :model-value="isUserSelected(user)"
                    @click.stop
                    @change="toggleUserSelection(user)"
                    :disabled="isAlreadyParticipant(user.email)"
                    hide-details
                  ></v-checkbox>
                  <v-avatar size="32">
                    <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="avatar"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ user.email }}</v-list-item-title>
                <template v-slot:append>
                  <v-btn 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    :disabled="isAlreadyParticipant(user.email)"
                    @click.stop="inviteUser(user)"
                  >
                    {{ isAlreadyParticipant(user.email) ? '이미 참여중' : '초대' }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <v-alert 
              v-else-if="inviteSearchQuery && !searching" 
              type="info" 
              variant="tonal"
            >
              검색 결과가 없습니다.
            </v-alert>
          </v-window-item>

          <!-- 팔로워 탭 -->
          <v-window-item value="followers">
            <div class="d-flex align-center mb-3">
              <v-text-field
                v-model="followerSearchQuery"
                label="팔로워 검색"
                placeholder="이름이나 이메일로 검색하세요"
                prepend-inner-icon="mdi-magnify"
                clearable
                @input="searchFollowers"
                class="flex-grow-1 mr-2"
              ></v-text-field>
              <v-btn icon @click="loadFollowers" :loading="loadingFollowers">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
            <div class="d-flex align-center mb-3" v-if="filteredFollowers.length > 0">
              <v-checkbox
                v-model="selectAll"
                label="전체 선택"
                @change="toggleSelectAll"
                hide-details
                class="mr-4"
              ></v-checkbox>
            </div>
            <div v-if="loadingFollowers" class="text-center py-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-2">팔로워 목록을 불러오는 중...</div>
            </div>
            <v-list v-else-if="filteredFollowers.length > 0">
              <v-list-item 
                v-for="user in filteredFollowers" 
                :key="user.userEmail"
                @click="toggleUserSelection(user)"
                class="cursor-pointer"
              >
                <template v-slot:prepend>
                  <v-checkbox
                    :model-value="isUserSelected(user)"
                    @click.stop
                    @change="toggleUserSelection(user)"
                    :disabled="isAlreadyParticipant(user.userEmail)"
                    hide-details
                  ></v-checkbox>
                  <v-avatar size="32">
                    <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="avatar"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ user.userEmail }}</v-list-item-title>
                <v-list-item-subtitle v-if="user.userName">{{ user.userName }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    :disabled="isAlreadyParticipant(user.userEmail)"
                    @click.stop="inviteUser(user)"
                  >
                    {{ isAlreadyParticipant(user.userEmail) ? '이미 참여중' : '초대' }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <v-alert 
              v-else-if="followerSearchQuery" 
              type="info" 
              variant="tonal"
            >
              검색 결과가 없습니다.
            </v-alert>
            <v-alert 
              v-else-if="!loadingFollowers && filteredFollowers.length === 0" 
              type="info" 
              variant="tonal"
            >
              팔로워가 없습니다. 다른 사용자에게 팔로우를 받아보세요.
            </v-alert>
          </v-window-item>

          <!-- 팔로잉 탭 -->
          <v-window-item value="followings">
            <div class="d-flex align-center mb-3">
              <v-text-field
                v-model="followingSearchQuery"
                label="팔로잉 검색"
                placeholder="이름이나 이메일로 검색하세요"
                prepend-inner-icon="mdi-magnify"
                clearable
                @input="searchFollowings"
                class="flex-grow-1 mr-2"
              ></v-text-field>
              <v-btn icon @click="loadFollowings" :loading="loadingFollowings">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
            <div class="d-flex align-center mb-3" v-if="filteredFollowings.length > 0">
              <v-checkbox
                v-model="selectAll"
                label="전체 선택"
                @change="toggleSelectAll"
                hide-details
                class="mr-4"
              ></v-checkbox>
            </div>
            <div v-if="loadingFollowings" class="text-center py-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-2">팔로잉 목록을 불러오는 중...</div>
            </div>
            <v-list v-else-if="filteredFollowings.length > 0">
              <v-list-item 
                v-for="user in filteredFollowings" 
                :key="user.userEmail"
                @click="toggleUserSelection(user)"
                class="cursor-pointer"
              >
                <template v-slot:prepend>
                  <v-checkbox
                    :model-value="isUserSelected(user)"
                    @click.stop
                    @change="toggleUserSelection(user)"
                    :disabled="isAlreadyParticipant(user.userEmail)"
                    hide-details
                  ></v-checkbox>
                  <v-avatar size="32">
                    <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="avatar"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ user.userEmail }}</v-list-item-title>
                <v-list-item-subtitle v-if="user.userName">{{ user.userName }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    :disabled="isAlreadyParticipant(user.userEmail)"
                    @click.stop="inviteUser(user)"
                  >
                    {{ isAlreadyParticipant(user.userEmail) ? '이미 참여중' : '초대' }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <v-alert 
              v-else-if="followingSearchQuery" 
              type="info" 
              variant="tonal"
            >
              검색 결과가 없습니다.
            </v-alert>
            <v-alert 
              v-else-if="!loadingFollowings && filteredFollowings.length === 0" 
              type="info" 
              variant="tonal"
            >
              팔로잉이 없습니다. 다른 사용자를 팔로우해보세요.
            </v-alert>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- 채팅방 나가기 확인 다이얼로그 -->
  <v-dialog v-model="showLeaveConfirmDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
        채팅방 나가기
      </v-card-title>
      <v-card-text>
        정말로 이 채팅방을 나가시겠습니까?
        <br>
        <small class="text-grey">나가면 다시 들어올 수 없습니다.</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="showLeaveConfirmDialog = false">취소</v-btn>
        <v-btn color="error" @click="leaveRoom">나가기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import axios from 'axios'
import FileGrid from './FileGrid.vue'
import { userAPI } from '@/services/api'
import { useRouter } from 'vue-router'

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
    const router = useRouter()
    
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
    
    // 모달 상태
    const showParticipantsDialog = ref(false)
    const showInviteDialog = ref(false)
    const showLeaveConfirmDialog = ref(false)

    // 초대 관련 상태
    const inviteTab = ref('search') // 탭 모델
    const inviteSearchQuery = ref('')
    const searchResults = ref([])
    const searching = ref(false)
    const followerSearchQuery = ref('')
    const followingSearchQuery = ref('')
    const loadingFollowers = ref(false)
    const loadingFollowings = ref(false)
    const filteredFollowers = ref([])
    const filteredFollowings = ref([])
    
    // 다중 선택 관련 상태
    const selectedUsers = ref(new Set())
    const selectAll = ref(false)

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

    const isOnline = (email) => {
      return onlineParticipants.value.some(p => p.email === email);
    }

    const showParticipants = () => {
      showParticipantsDialog.value = true;
    }

    const inviteParticipants = () => {
      showInviteDialog.value = true;
      inviteTab.value = 'followers'; // 기본적으로 팔로워 탭 선택
      // 팔로워와 팔로잉 데이터가 없으면 로드
      if (filteredFollowers.value.length === 0) {
        loadFollowers();
      }
      if (filteredFollowings.value.length === 0) {
        loadFollowings();
      }
    }

    const searchUsers = async () => {
      if (!inviteSearchQuery.value) {
        searchResults.value = [];
        return;
      }
      searching.value = true;
      try {
        const res = await userAPI.searchUsersByEmail(inviteSearchQuery.value);
        searchResults.value = res.data.data;
      } catch (error) {
        console.error('사용자 검색 실패:', error);
        searchResults.value = [];
      } finally {
        searching.value = false;
      }
    }

    // 팔로워 로드
    const loadFollowers = async () => {
      loadingFollowers.value = true;
      try {
        const res = await userAPI.getFollowers({ page: 0, size: 100 });
        const followers = res.data.data.content || [];
        if (Array.isArray(followers)) {
          filteredFollowers.value = followers;
        } else {
          console.warn('팔로워 데이터가 배열이 아닙니다:', followers);
          filteredFollowers.value = [];
        }
      } catch (error) {
        console.error('팔로워 로드 실패:', error);
        filteredFollowers.value = [];
      } finally {
        loadingFollowers.value = false;
      }
    }

    // 팔로잉 로드
    const loadFollowings = async () => {
      loadingFollowings.value = true;
      try {
        const res = await userAPI.getFollowings({ page: 0, size: 100 });
        const followings = res.data.data.content || [];
        if (Array.isArray(followings)) {
          filteredFollowings.value = followings;
        } else {
          console.warn('팔로잉 데이터가 배열이 아닙니다:', followings);
          filteredFollowings.value = [];
        }
      } catch (error) {
        console.error('팔로잉 로드 실패:', error);
        filteredFollowings.value = [];
      } finally {
        loadingFollowings.value = false;
      }
    }

    // 팔로워 검색
    const searchFollowers = () => {
      if (!followerSearchQuery.value) {
        // 검색어가 없으면 원본 데이터로 복원
        loadFollowers();
        return;
      }
      const query = followerSearchQuery.value.toLowerCase();
      // 원본 데이터에서 필터링 (API에서 다시 로드하지 않음)
      userAPI.getFollowers({ page: 0, size: 100 }).then(res => {
        const allFollowers = res.data.data.content || [];
        if (Array.isArray(allFollowers)) {
          filteredFollowers.value = allFollowers.filter(user => 
            (user.userEmail && user.userEmail.toLowerCase().includes(query)) || 
            (user.userName && user.userName.toLowerCase().includes(query))
          );
        } else {
          console.warn('팔로워 데이터가 배열이 아닙니다:', allFollowers);
          filteredFollowers.value = [];
        }
      }).catch(error => {
        console.error('팔로워 검색 중 오류:', error);
        filteredFollowers.value = [];
      });
    }

    // 팔로잉 검색
    const searchFollowings = () => {
      if (!followingSearchQuery.value) {
        // 검색어가 없으면 원본 데이터로 복원
        loadFollowings();
        return;
      }
      const query = followingSearchQuery.value.toLowerCase();
      // 원본 데이터에서 필터링 (API에서 다시 로드하지 않음)
      userAPI.getFollowings({ page: 0, size: 100 }).then(res => {
        const allFollowings = res.data.data.content || [];
        console.log(allFollowings);
        if (Array.isArray(allFollowings)) {
          filteredFollowings.value = allFollowings.filter(user => 
            (user.userEmail && user.userEmail.toLowerCase().includes(query)) || 
            (user.userName && user.userName.toLowerCase().includes(query))
          );
        } else {
          console.warn('팔로잉 데이터가 배열이 아닙니다:', allFollowings);
          filteredFollowings.value = [];
        }
      }).catch(error => {
        console.error('팔로잉 검색 중 오류:', error);
        filteredFollowings.value = [];
      });
    }

    // 다중 선택 관련 함수들
    const toggleUserSelection = (user) => {
      const userEmail = user.userEmail || user.email;
      
      // 이미 참여중인 사용자는 선택할 수 없음
      if (isAlreadyParticipant(userEmail)) {
        return;
      }
      
      if (selectedUsers.value.has(userEmail)) {
        selectedUsers.value.delete(userEmail);
      } else {
        selectedUsers.value.add(userEmail);
      }
    }

    const toggleSelectAll = () => {
      if (selectAll.value) {
        // 모든 사용자 선택 (이미 참여중인 사용자 제외)
        const currentUsers = getCurrentTabUsers();
        currentUsers.forEach(user => {
          const userEmail = user.userEmail || user.email;
          if (!isAlreadyParticipant(userEmail)) {
            selectedUsers.value.add(userEmail);
          }
        });
      } else {
        // 모든 선택 해제
        selectedUsers.value.clear();
      }
    }

    const getCurrentTabUsers = () => {
      let users = [];
      switch (inviteTab.value) {
        case 'followers':
          users = filteredFollowers.value;
          break;
        case 'followings':
          users = filteredFollowings.value;
          break;
        case 'search':
          users = searchResults.value;
          break;
        default:
          return [];
      }
      
      // 이미 참여중인 사용자 제외
      return users.filter(user => {
        const userEmail = user.userEmail || user.email;
        return !isAlreadyParticipant(userEmail);
      });
    }

    const getSelectedUsersCount = () => {
      // 이미 참여중인 사용자는 카운트에서 제외
      let count = 0;
      selectedUsers.value.forEach(email => {
        if (!isAlreadyParticipant(email)) {
          count++;
        }
      });
      return count;
    }

    const isUserSelected = (user) => {
      const userEmail = user.userEmail || user.email;
      return selectedUsers.value.has(userEmail);
    }

    // 탭 변경 시 데이터 로드
    const onTabChange = (newTab) => {
      if (newTab === 'followers') {
        // 팔로워 데이터가 없으면 로드
        if (filteredFollowers.value.length === 0) {
          loadFollowers();
        }
      } else if (newTab === 'followings') {
        // 팔로잉 데이터가 없으면 로드
        if (filteredFollowings.value.length === 0) {
          loadFollowings();
        }
      }
    }

         const inviteUser = async (user) => {
       // 사용자 객체에서 이메일 추출 (팔로워/팔로잉은 userEmail, 검색결과는 email)
       const userEmail = user.userEmail || user.email;
       if (isAlreadyParticipant(userEmail)) {
         console.warn(`${userEmail}는 이미 참여자입니다.`);
         return;
       }
       try {
         const inviteData = [{ inviteeEmail: userEmail }];
         await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-rooms/${props.roomId}/participants`, inviteData, {
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
           }
         });
         console.log(`${userEmail}에게 초대 메시지를 보냈습니다.`);
         showInviteDialog.value = false;
         inviteSearchQuery.value = '';
         searchResults.value = [];
         followerSearchQuery.value = '';
         followingSearchQuery.value = '';
         filteredFollowers.value = [];
         filteredFollowings.value = [];
         selectedUsers.value.clear();
       } catch (error) {
         console.error('초대 실패:', error);
         if (error.response && error.response.data && error.response.data.message) {
           alert(error.response.data.message);
         } else {
           alert('초대에 실패했습니다.');
         }
       }
     }

    // 다중 초대 함수
    const inviteSelectedUsers = async () => {
      // 이미 참여중인 사용자 제외하고 실제 초대 가능한 사용자만 필터링
      const validUsers = Array.from(selectedUsers.value).filter(email => !isAlreadyParticipant(email));
      
      if (validUsers.length === 0) {
        alert('초대할 사용자를 선택해주세요.');
        return;
      }

      try {
        const inviteData = validUsers.map(email => ({ inviteeEmail: email }));
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-rooms/${props.roomId}/participants`, inviteData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        console.log(`${validUsers.length}명의 사용자에게 초대 메시지를 보냈습니다.`);
        showInviteDialog.value = false;
        
        // 초기화
        inviteSearchQuery.value = '';
        searchResults.value = [];
        followerSearchQuery.value = '';
        followingSearchQuery.value = '';
        filteredFollowers.value = [];
        filteredFollowings.value = [];
        selectedUsers.value.clear();
        selectAll.value = false;
      } catch (error) {
        console.error('다중 초대 실패:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('초대에 실패했습니다.');
        }
      }
    }

    const isAlreadyParticipant = (email) => {
      return participants.value.some(p => p.email === email);
    }

    const confirmLeaveRoom = () => {
      showLeaveConfirmDialog.value = true;
    }

    const leaveRoom = async () => {
      try {
        // 백엔드 API로 채팅방 나가기
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/chat-rooms/${props.roomId}/participants/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        console.log(`채팅방 ${props.roomId}에서 나갔습니다.`);
        
        // 채팅 스토어에서도 채팅방 제거
        await chatStore.leaveRoom(props.roomId);
        
        // 채팅방 목록 새로고침 (백엔드에서 최신 상태 가져오기)
        await chatStore.fetchChatRoomList();
        
        // 채팅방 나가기 후 채팅방 목록으로 리다이렉트
        router.push({ name: 'Chat' });
        
        // 성공 메시지를 localStorage에 저장하여 부모 컴포넌트에서 표시
        localStorage.setItem('chatLeaveMessage', JSON.stringify({
          type: 'success',
          text: '채팅방에서 나갔습니다.'
        }));
        
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('채팅방 나가기에 실패했습니다.');
        }
      }
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
    
    watch(showInviteDialog, (newValue) => {
      if (!newValue) {
        // 다이얼로그가 닫힐 때 초기화
        inviteSearchQuery.value = '';
        searchResults.value = [];
        followerSearchQuery.value = '';
        followingSearchQuery.value = '';
        filteredFollowers.value = [];
        filteredFollowings.value = [];
        inviteTab.value = 'search';
        // 선택 상태 초기화
        selectedUsers.value.clear();
        selectAll.value = false;
      }
    })
    
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
      isSending,
      showParticipantsDialog,
      showInviteDialog,
      showLeaveConfirmDialog,
      inviteTab,
      inviteSearchQuery,
      searchResults,
      searching,
      followerSearchQuery,
      followingSearchQuery,
      loadingFollowers,
      loadingFollowings,
      filteredFollowers,
      filteredFollowings,
      isOnline,
      showParticipants,
      inviteParticipants,
      searchUsers,
      loadFollowers,
      loadFollowings,
      searchFollowers,
      searchFollowings,
      onTabChange,
      inviteUser,
      inviteSelectedUsers,
      isAlreadyParticipant,
      confirmLeaveRoom,
      leaveRoom,
      // 다중 선택 관련
      selectedUsers,
      selectAll,
      toggleUserSelection,
      toggleSelectAll,
      getSelectedUsersCount,
      isUserSelected
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
  border-top-right-radius: 4px;
}

.received {
  background-color: #f1f3f4;
  color: black;
  border-top-left-radius: 4px;
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

.cursor-pointer {
  cursor: pointer;
}
</style>
