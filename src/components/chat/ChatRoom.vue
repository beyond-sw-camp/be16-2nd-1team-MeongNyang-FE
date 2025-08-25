<template>
  <v-card class="chat-room-container d-flex flex-column" flat tile>
    <!-- 채팅방 헤더 -->
    <div class="chat-header">
      <div class="header-content">
        <div class="room-info">
          <h2 class="room-title">{{ currentRoom?.roomName || '채팅' }}</h2>
        </div>
        
        <div class="header-spacer"></div>
        
        <div class="header-actions">
          <v-btn 
            icon 
            variant="outlined"
            @click="showParticipants"
            class="action-btn"
            title="참여자 목록"
            size="large"
            color="white"
          >
            <v-icon size="24">mdi-account-group</v-icon>
          </v-btn>
          
          <v-btn 
            icon 
            variant="outlined"
            @click="inviteParticipants"
            class="action-btn"
            title="초대하기"
            size="large"
            color="white"
          >
            <v-icon size="24">mdi-account-plus</v-icon>
          </v-btn>
          
          <v-menu offset="8">
            <template v-slot:activator="{ props }">
              <v-btn 
                icon 
                v-bind="props"
                variant="outlined"
                class="action-btn"
                title="더보기"
                size="large"
                color="white"
              >
                <v-icon size="24">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list class="room-options-menu">
              <v-list-item @click="showParticipants" class="menu-item">
                <template v-slot:prepend>
                  <v-icon color="primary" size="22" class="menu-icon">mdi-account-group</v-icon>
                </template>
                <v-list-item-title class="menu-title">참여자 목록</v-list-item-title>
                <v-list-item-subtitle class="menu-subtitle">{{ participants.length }}명 참여</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item @click="inviteParticipants" class="menu-item">
                <template v-slot:prepend>
                  <v-icon color="info" size="22" class="menu-icon">mdi-account-plus</v-icon>
                </template>
                <v-list-item-title class="menu-title">초대하기</v-list-item-title>
                <v-list-item-subtitle class="menu-subtitle">새 멤버 초대</v-list-item-subtitle>
              </v-list-item>
              
              <v-divider class="menu-divider"></v-divider>
              
              <v-list-item @click="confirmLeaveRoom" class="menu-item leave-item">
                <template v-slot:prepend>
                  <v-icon color="error" size="22" class="menu-icon">mdi-exit-to-app</v-icon>
                </template>
                <v-list-item-title class="menu-title text-error">채팅방 나가기</v-list-item-title>
                <v-list-item-subtitle class="menu-subtitle text-error">채팅방에서 나가기</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>
    <v-divider></v-divider>
    <v-card-text 
      class="chat-messages-container flex-grow-1 pa-4" 
      ref="chatBox"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @scroll="handleScroll"
    >
      <!-- 드래그 앤 드롭 오버레이 -->
      <div 
        v-if="isDragOver" 
        class="drag-drop-overlay"
      >
        <div class="drag-drop-content">
          <v-icon size="64" color="primary">mdi-cloud-upload</v-icon>
          <div class="text-h6 mt-4">파일을 여기에 놓아주세요</div>
          <div class="text-body-2 text-grey-darken-1">이미지, 문서, 미디어 파일 등을 첨부할 수 있습니다</div>
        </div>
      </div>
      
        <!-- 메시지 목록 - 로딩이 완료되었을 때만 표시 -->
        <div v-if="!loading && !error">
          <template v-for="item in messagesWithDateSeparators" :key="item.id">
            <div v-if="item.type === 'date-separator'" class="text-center my-4">
              <v-chip small>{{ item.date }}</v-chip>
            </div>
            <div v-else :class="['message-row', 'mb-2', item.senderEmail === senderEmail ? 'sent-message' : 'received-message']">
              <!-- 아바타 영역 -->
              <div class="avatar-area">
                <v-avatar v-if="item.senderEmail !== senderEmail && item.showAvatarAndEmail" size="40">
                  <v-img 
                    v-if="getParticipantProfileImage(item.senderEmail)" 
                    :src="getParticipantProfileImage(item.senderEmail)" 
                    alt="프로필 이미지"
                    cover
                  ></v-img>
                  <div v-else class="message-avatar-placeholder">
                    {{ getInitials(item.senderEmail) }}
                  </div>
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
        </div>
      
      <!-- 빈 채팅방 상태 - 메시지가 없고 로딩이 완료되었을 때만 -->
      <div v-if="!loading && messages.length === 0 && !error" class="empty-chat-state">
        <div class="empty-chat-content">
          <div class="welcome-icon">💬</div>
          <h3 class="welcome-title">{{ currentRoom?.roomName || '새로운 채팅방' }}에 오신 것을 환영합니다!</h3>
          <p class="welcome-message">
            이제 대화를 시작해보세요. 메시지를 보내거나 파일을 공유할 수 있습니다.
          </p>
          
          <!-- 대화 시작 팁 -->
          <div class="conversation-tips">
            <h4 class="tips-title">💡 대화 시작하기</h4>
            <div class="tips-grid">
              <div class="tip-item">
                <div class="tip-icon">👋</div>
                <div class="tip-text">간단한 인사말로 시작</div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">📷</div>
                <div class="tip-text">사진이나 파일 공유</div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">❓</div>
                <div class="tip-text">질문이나 의견 나누기</div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">🎉</div>
                <div class="tip-text">즐거운 대화 시작하기</div>
              </div>
            </div>
          </div>
          
          <!-- 빠른 메시지 버튼들 -->
          <div class="quick-message-buttons">
            <v-btn
              v-for="(quickMsg, index) in quickMessages"
              :key="index"
              @click="sendQuickMessage(quickMsg)"
              variant="outlined"
              color="primary"
              size="small"
              class="quick-msg-btn"
            >
              {{ quickMsg }}
            </v-btn>
          </div>
        </div>
      </div>
      
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-chat-state">
        <div class="loading-content">
          <!-- 메인 로딩 애니메이션 -->
          <div class="loading-animation">
            <div class="chat-bubble-loader">
              <div class="bubble bubble-1"></div>
              <div class="bubble bubble-2"></div>
              <div class="bubble bubble-3"></div>
            </div>
          </div>
          
          <!-- 로딩 텍스트 -->
          <div class="loading-text">
            <span class="loading-dots">
              채팅방을 불러오는 중<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
            </span>
          </div>
          
          <!-- 부가 정보 -->
          <div class="loading-info">
            <div class="loading-tip">
              <v-icon size="16" color="primary" class="tip-icon">mdi-lightbulb-outline</v-icon>
              <span>잠시만 기다려주세요</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 에러 상태 -->
      <div v-if="error && !loading" class="error-chat-state">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">채팅방을 불러올 수 없습니다</h3>
          <p class="error-message">{{ error }}</p>
          <v-btn
            @click="retryLoad"
            color="primary"
            variant="outlined"
            size="large"
            class="retry-btn"
          >
            다시 시도
          </v-btn>
        </div>
      </div>
      
      <!-- 맨 아래로 버튼 - 스크롤과 함께 움직이는 고정 버튼 -->
      <div v-show="showScrollToBottomButton" class="scroll-to-bottom-button-sticky">
        <v-btn
          @click="scrollToBottom"
          class="scroll-to-bottom-btn"
          color="primary"
          icon
          size="large"
          elevation="6"
          :ripple="false"
          title="맨 아래로 이동"
        >
          <v-icon size="24">mdi-chevron-down</v-icon>
        </v-btn>
      </div>

    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="chat-input-container pa-4">
      <!-- 파일 선택 영역 -->
      <div class="file-selection-area d-flex flex-column w-100">
        <!-- 선택된 파일 미리보기 -->
        <div v-if="selectedFiles.length > 0" class="selected-files-preview mb-3">
          <div class="d-flex align-center mb-3">
            <div class="files-header-icon">
              <v-icon size="20" color="primary">mdi-file-multiple</v-icon>
            </div>
            <span class="files-header-text">선택된 파일 ({{ selectedFiles.length }}개)</span>
            <v-chip 
              color="primary" 
              variant="tonal" 
              size="small" 
              class="ml-2 files-count-chip"
            >
              {{ selectedFiles.length }}
            </v-chip>
          </div>
          <div class="selected-files-grid">
            <div 
              v-for="(file, index) in selectedFiles" 
              :key="index"
              class="file-preview-item"
            >
              <!-- 파일 타입별 아이콘 -->
              <div class="file-icon-container">
                <v-icon 
                  :color="getFileIconColor(file.type)"
                  size="28"
                >
                  {{ getFileIcon(file.type) }}
                </v-icon>
              </div>
              
              <!-- 파일 정보 -->
              <div class="file-info">
                <div class="file-name text-caption">{{ truncateFileName(file.name, 20) }}</div>
                <div class="file-size text-caption text-grey-darken-1">{{ formatFileSize(file.size) }}</div>
              </div>
              
              <!-- 삭제 버튼 -->
              <v-btn 
                icon 
                size="small" 
                color="error" 
                variant="text"
                @click="removeFile(index)"
                class="remove-file-btn"
              >
                <v-icon size="18">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
        
        <!-- 입력 영역 -->
        <div class="input-area d-flex align-end">
          <v-btn 
            icon 
            @click="triggerFileInput" 
            class="mr-2 file-attach-btn"
            :disabled="!stompClient?.connected || isSending"
            color="primary"
            variant="outlined"
            size="large"
          >
            <v-icon size="24">mdi-paperclip</v-icon>
          </v-btn>
          
          <input 
            type="file" 
            ref="fileInput" 
            @change="onFileChange" 
            multiple 
            style="display: none;" 
          />
          
          <v-textarea
            v-model="newMessage"
            label="메세지 입력"
            @keydown="handleKeydown"
            hide-details
            outlined
            dense
            rows="1"
            auto-grow
            class="mr-2 flex-grow-1 message-input"
            :disabled="!stompClient?.connected || isSending"
            placeholder="메시지를 입력하거나 파일을 첨부하세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
          ></v-textarea>
          
          <v-btn 
            icon="mdi-send" 
            color="primary" 
            @click="sendMessage"
            :disabled="!stompClient?.connected || isSending || (!newMessage.trim() && selectedFiles.length === 0)"
            :loading="isSending"
            class="send-btn"
            size="large"
          ></v-btn>
        </div>
      </div>
    </v-card-actions>
  </v-card>

  <!-- 참여자 목록 모달 -->
  <v-dialog 
    v-model="showParticipantsDialog" 
    max-width="500"
    @click:outside="showParticipantsDialog = false"
  >
    <v-card class="participants-dialog">
      <!-- 헤더 -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="28" color="white">mdi-account-group</v-icon>
          </div>
          <div class="header-text">
            <h3 class="dialog-title">참여자 목록</h3>
            <p class="dialog-subtitle">{{ participants.length }}명이 참여 중</p>
          </div>
          <v-btn 
            icon 
            variant="outlined"
            @click="showParticipantsDialog = false"
            class="close-btn"
            size="large"
            color="white"
          >
            <v-icon size="24">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- 참여자 목록 -->
      <div class="participants-content">
        <div class="participants-list">
          <div 
            v-for="participant in participants" 
            :key="participant.email"
            class="participant-item"
            :class="{ 'online': isOnline(participant.email) }"
          >
            <div class="participant-avatar">
              <div class="avatar-circle">
                <v-img 
                  v-if="participant.profileImage" 
                  :src="participant.profileImage" 
                  alt="프로필 이미지"
                  cover
                ></v-img>
                <span v-else class="avatar-text">{{ getInitials(participant.email) }}</span>
              </div>
              <div 
                class="online-indicator"
                :class="{ 'active': isOnline(participant.email) }"
              ></div>
            </div>
            
            <div class="participant-info">
              <div class="participant-name">{{ participant.email }}</div>
              <div class="participant-status">
                {{ isOnline(participant.email) ? '온라인' : '오프라인' }}
              </div>
            </div>

            <!-- <div class="participant-actions">
              <v-btn
                icon
                variant="text"
                size="small"
                class="action-icon"
                @click="viewProfile(participant)"
                title="프로필 보기"
              >
                <v-icon size="18">mdi-account</v-icon>
              </v-btn>
            </div> -->
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-if="participants.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <div class="empty-text">아직 참여자가 없습니다</div>
        </div>
      </div>

      <!-- 푸터 -->
      <div class="dialog-footer">
        <v-btn
          color="primary"
          variant="outlined"
          @click="inviteParticipants"
          class="invite-btn"
          prepend-icon="mdi-account-plus"
        >
          새 참여자 초대
        </v-btn>
      </div>
    </v-card>
  </v-dialog>

  <!-- 초대하기 모달 -->
  <UserSelectionModal
    v-model="showInviteDialog"
    mode="invite"
    :existingParticipants="participants"
    @users-selected="inviteSelectedUsers"
  />

  <!-- 채팅방 나가기 확인 다이얼로그 -->
  <v-dialog 
    v-model="showLeaveConfirmDialog" 
    max-width="480" 
    persistent
    aria-labelledby="leave-room-title"
    aria-describedby="leave-room-description"
  >
    <v-card class="leave-room-dialog" elevation="24" role="dialog">
      <!-- 헤더 섹션 -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="48" color="error">mdi-exit-to-app</v-icon>
          </div>
          <div class="header-text">
            <h2 id="leave-room-title" class="dialog-title">채팅방 나가기</h2>
            <p id="leave-room-description" class="dialog-subtitle">이 채팅방에서 나가시겠습니까?</p>
          </div>
        </div>
      </div>

      <!-- 경고 메시지 섹션 -->
      <div class="warning-section">
        <div class="warning-icon">
          <v-icon size="24" color="warning">mdi-alert-circle</v-icon>
          <h4 class="warning-title">주의사항</h4>
        </div>
        <div class="warning-content">
          <ul class="warning-list">
            <li>채팅방을 나가면 모든 메시지 기록에 접근할 수 없습니다</li>
            <li>다시 입장하려면 초대를 받아야 합니다</li>
            <li>업로드한 파일들도 더 이상 볼 수 없습니다</li>
          </ul>
        </div>
      </div>

      <!-- 액션 버튼들 -->
      <div class="dialog-actions">
        <v-btn
          variant="outlined"
          size="large"
          @click="showLeaveConfirmDialog = false"
          class="cancel-btn"
          min-width="120"
        >
          <v-icon left>mdi-close</v-icon>
          취소
        </v-btn>
        <v-btn
          color="error"
          size="large"
          @click="leaveRoom"
          class="leave-btn"
          min-width="120"
          :loading="isLeaving"
        >
          <v-icon left>mdi-exit-to-app</v-icon>
          채팅방 나가기
        </v-btn>
      </div>
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
import UserSelectionModal from './UserSelectionModal.vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'

export default {
  name: 'ChatRoom',
  components: {
    FileGrid,
    UserSelectionModal
  },
  props: {
    roomId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const chatStore = useChatStore()
    const router = useRouter()
    const showMessage = inject('showMessage', null)
    
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
    
    // 빠른 메시지 옵션
    const quickMessages = ref([
      '안녕하세요! 👋',
      '반갑습니다 😊',
      '오늘 날씨가 좋네요 ☀️',
      '무슨 일 하시나요? 🤔',
      '좋은 하루 되세요! ✨'
    ])
    
    // 파일 입력 참조
    const fileInput = ref(null)
    const chatBox = ref(null)
    
    // 드래그 앤 드롭 상태
    const isDragOver = ref(false)
    const dragCounter = ref(0)
    
    // 모달 상태
    const showParticipantsDialog = ref(false)
    const showInviteDialog = ref(false)
    const showLeaveConfirmDialog = ref(false)
    const isLeaving = ref(false)

    // 스크롤 관련 상태
    const showScrollToBottomButton = ref(false)
    const isAtBottom = ref(true)

    // 미디어 로딩 상태 추적
    const mediaLoadingStates = ref(new Map())
    const mediaLoadPromises = ref([])
    const resizeObserver = ref(null)

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
        // 로딩 시작
        loading.value = true
        error.value = null
        console.log('🔄 채팅방 데이터 로딩 시작, loading:', loading.value)
        
        // 채팅방 목록이 비어있으면 먼저 가져오기
        if (chatStore.chatRoomList.length === 0) {
          await chatStore.fetchChatRoomList()
        }
        
        // 스토어에서 채팅방 정보 찾기
        const roomFromStore = chatStore.getChatRoomById(props.roomId)
        console.log('roomFromStore!!!', roomFromStore)
        if (roomFromStore) {
          // 스토어에 있는 정보 사용
          currentRoom.value = {
            id: roomFromStore.id,
            roomName: roomFromStore.roomName,
            createdAt: roomFromStore.lastMessageTime || new Date().toISOString()
          }
        } else {
          // 스토어에 없으면 기본값 설정
          currentRoom.value = {
            id: props.roomId,
            roomName: `채팅방 #${props.roomId}`,
            createdAt: new Date().toISOString()
          }
        }
        
        // 메시지와 참여자는 채팅 스토어를 통해 로드
        await chatStore.getMessages(props.roomId)
        await chatStore.getParticipants(props.roomId)
        
        // 스토어에서 데이터 가져오기
        messages.value = chatStore.messages
        participants.value = chatStore.participants
        
        // 로딩 완료
        loading.value = false
        console.log('✅ 채팅방 데이터 로딩 완료, loading:', loading.value, 'messages count:', messages.value.length)
      } catch (err) {
        console.error('❌ 채팅방 데이터 로드 실패:', err)
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

      // 중복 실행 방지를 위한 즉시 상태 설정
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

        // 메시지 전송 후 입력창과 파일 선택 초기화
        newMessage.value = ''
        selectedFiles.value = []
        if (fileInput.value) fileInput.value.value = null
        
        // 메시지 전송 후 약간의 지연을 두고 최하단으로 스크롤
        setTimeout(() => {
          // 파일이 첨부된 메시지라면 미디어 로딩 완료 후 스크롤
          if (fileUrls.length > 0) {
            // 새로 전송된 메시지의 미디어 로딩 등록
            const sentMessage = {
              fileUrls: fileUrls
            }
            registerMessageMediaLoad(sentMessage)
            scrollToBottomAfterMediaLoad()
          } else {
            // 텍스트만 있는 메시지는 즉시 스크롤
            scrollToBottom()
          }
          
          // 하단 상태로 설정
          isAtBottom.value = true
          showScrollToBottomButton.value = false
        }, 100)
      } catch (err) {
        error.value = '메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.'
        console.error('메시지 전송 실패:', err)
      } finally {
        isSending.value = false
      }
    }
    
    // 빠른 메시지 전송
    const sendQuickMessage = (messageText) => {
      if (!stompClient.value?.connected) return
      
      newMessage.value = messageText
      sendMessage()
    }
    
    const scrollToBottom = (force = false) => {
      // 강제 스크롤이 아니고 사용자가 위로 스크롤한 상태라면 자동 스크롤하지 않음
      if (!force && !isAtBottom.value) {
        return
      }
      
      // DOM 업데이트와 레이아웃 안정화를 위해 더 긴 지연 사용
      setTimeout(() => {
        const chatContainer = chatBox.value?.$el || chatBox.value
        if (chatContainer) {
          // 스크롤 위치를 정확하게 계산
          const scrollHeight = chatContainer.scrollHeight
          const clientHeight = chatContainer.clientHeight
          
          // 더 확실한 스크롤을 위해 scrollHeight보다 큰 값으로 설정
          chatContainer.scrollTop = scrollHeight + 1000
          
          // 스크롤이 실제로 적용되었는지 확인
          setTimeout(() => {
            if (chatContainer.scrollTop < scrollHeight - clientHeight) {
              // 스크롤이 제대로 적용되지 않았다면 다시 시도
              chatContainer.scrollTop = chatContainer.scrollHeight + 1000
            }
          }, 50)
          
          // 스크롤 후 하단 상태로 설정
          isAtBottom.value = true
          showScrollToBottomButton.value = false
        }
      }, 150) // DOM 업데이트를 위한 충분한 시간
    }
    
    // 미디어 로딩 완료 후 스크롤
    const scrollToBottomAfterMediaLoad = async () => {
      try {
        // 모든 미디어 로딩 완료 대기
        if (mediaLoadPromises.value.length > 0) {
          await Promise.all(mediaLoadPromises.value)
        }
        
        // 레이아웃 안정화를 위해 더 긴 지연 사용
        setTimeout(() => {
          scrollToBottom(true)
        }, 200)
      } catch (error) {
        console.warn('미디어 로딩 중 오류 발생:', error)
        // 오류 발생 시에도 스크롤 실행
        setTimeout(() => {
          scrollToBottom(true)
        }, 300)
      }
    }
    
    const handleScroll = () => {
      const chatContainer = chatBox.value?.$el || chatBox.value
      if (!chatContainer) return
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      const threshold = 100 // 하단에서 100px 이내면 하단으로 간주 (더 관대하게)
      
      // 현재 스크롤 위치가 하단에 가까운지 확인
      const atBottom = scrollTop + clientHeight >= scrollHeight - threshold
      
      // 하단 상태가 변경되었는지 확인
      if (isAtBottom.value !== atBottom) {
        isAtBottom.value = atBottom
      }
      
      // 하단이 아니고 스크롤이 위로 올라갔을 때만 버튼 표시 (더 민감하게)
      const shouldShowButton = !atBottom && scrollTop > 20
      showScrollToBottomButton.value = shouldShowButton
    }
    
    // 버튼 위치 조정 (더 이상 필요하지 않음 - CSS로 처리)
    const adjustButtonPosition = () => {
      // 버튼이 이제 채팅 메시지 컨테이너 내부에 고정되어 있으므로
      // 별도의 위치 조정이 필요하지 않음
    }
    
    const triggerFileInput = () => {
      if (fileInput.value) fileInput.value.click()
    }
    
    const onFileChange = (event) => {
      selectedFiles.value = Array.from(event.target.files)
    }
    
    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
      // 파일 입력 필드 초기화
      if (fileInput.value) fileInput.value.value = null
    }
    
    const getFileIcon = (fileType) => {
      if (fileType.startsWith('image/')) return 'mdi-image'
      if (fileType.startsWith('video/')) return 'mdi-video'
      if (fileType.startsWith('audio/')) return 'mdi-music'
      if (fileType.includes('pdf')) return 'mdi-file-pdf-box'
      if (fileType.includes('word') || fileType.includes('document')) return 'mdi-file-word-box'
      if (fileType.includes('text')) return 'mdi-file-document'
      if (fileType.includes('zip') || fileType.includes('rar')) return 'mdi-folder-zip'
      return 'mdi-file'
    }
    
    const getFileIconColor = (fileType) => {
      if (fileType.startsWith('image/')) return 'green'
      if (fileType.startsWith('video/')) return 'red'
      if (fileType.startsWith('audio/')) return 'purple'
      if (fileType.includes('pdf')) return 'red'
      if (fileType.includes('word') || fileType.includes('document')) return 'blue'
      if (fileType.includes('text')) return 'grey'
      if (fileType.includes('zip') || fileType.includes('rar')) return 'orange'
      return 'grey'
    }
    
    const truncateFileName = (fileName, maxLength) => {
      if (fileName.length <= maxLength) return fileName
      const extension = fileName.split('.').pop()
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
      const truncatedName = nameWithoutExt.substring(0, maxLength - 3)
      return `${truncatedName}...${extension ? '.' + extension : ''}`
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
    
    const handleKeydown = (event) => {
      // Enter 키만 눌렀을 때 (Shift나 Ctrl 없이)
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault() // 기본 동작 방지
        // 한글 입력 중일 때는 전송하지 않음 (isComposing 체크)
        if (!event.isComposing) {
          sendMessage()
        }
      }
      // Ctrl+Enter 또는 Cmd+Enter로 강제 전송
      else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        // Ctrl+Enter도 한글 입력 중이면 전송하지 않음
        if (!event.isComposing) {
          sendMessage()
        }
      }
      // Shift+Enter는 줄바꿈 허용 (기본 동작)
    }
    
    const handleDragEnter = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter.value++
      isDragOver.value = true
    }
    
    const handleDragOver = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    
    const handleDragLeave = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter.value--
      if (dragCounter.value === 0) {
        isDragOver.value = false
      }
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter.value = 0
      isDragOver.value = false
      
      const files = Array.from(event.dataTransfer.files)
      if (files.length > 0) {
        // 기존 선택된 파일에 추가
        selectedFiles.value = [...selectedFiles.value, ...files]
        
        // 성공 메시지 표시
        if (showMessage) {
          showMessage({
            type: 'success',
            text: `${files.length}개 파일이 첨브되었습니다.`
          })
        }
      }
    }
    
    const preventDefault = (event) => {
      event.preventDefault()
      event.stopPropagation()
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

    const getInitials = (email) => {
      if (!email) return '?';
      const parts = email.split('@')[0];
      if (parts.length >= 2) {
        return parts.substring(0, 2).toUpperCase();
      }
      return parts.substring(0, 1).toUpperCase();
    }

    const getParticipantProfileImage = (email) => {
      const participant = participants.value.find(p => p.email === email);
      return participant?.profileImage || null;
    }

    const viewProfile = (participant) => {
      // 프로필 보기 로직 (나중에 구현)
      console.log('프로필 보기:', participant);
    }

    const showParticipants = () => {
      showParticipantsDialog.value = true;
    }

    const inviteParticipants = () => {
      showInviteDialog.value = true;
    }

    const inviteSelectedUsers = async (selectedUsersArray) => {
      if (!selectedUsersArray || selectedUsersArray.length === 0) {
        alert('초대할 사용자를 선택해주세요.');
        return;
      }

      try {
        const inviteData = selectedUsersArray.map(user => ({ inviteeEmail: user.userEmail }));
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-rooms/${props.roomId}/participants`, inviteData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        console.log(`${selectedUsersArray.length}명의 사용자에게 초대 메시지를 보냈습니다.`);
        showInviteDialog.value = false;
        
        // 성공 메시지를 부모 컴포넌트로 전달
        if (showMessage) {
          showMessage({
            type: 'success',
            text: `${selectedUsersArray.length}명의 사용자를 초대했습니다.`
          });
        }
        
        // 참여자 목록 새로고침
        await chatStore.getParticipants(props.roomId);
        participants.value = chatStore.participants;
        
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
        isLeaving.value = true;
        
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
        
        // 성공 메시지를 부모 컴포넌트로 전달
        if (showMessage) {
          showMessage({
            type: 'success',
            text: '채팅방에서 나갔습니다.'
          });
        }
        
        // 채팅방 나가기 후 채팅방 목록으로 리다이렉트
        router.push({ name: 'Chat' });
        
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('채팅방 나가기에 실패했습니다.');
        }
      } finally {
        isLeaving.value = false;
      }
    }
    
    watch(() => props.roomId, async (newRoomId, oldRoomId) => {
      if (newRoomId && newRoomId !== oldRoomId) {
        // 새 채팅방으로 이동할 때 로딩 상태 설정
        loading.value = true
        error.value = null
        messages.value = []
        participants.value = []
        
        disconnectWebsocket()
        await loadRoomData()
        connectWebsocket()
      }
    })
    
    watch(messages, () => {
      // 사용자가 하단에 있을 때만 자동으로 스크롤
      if (isAtBottom.value) {
        // 새 메시지가 추가되었을 때만 처리
        if (messages.value.length > 0) {
          const lastMessage = messages.value[messages.value.length - 1]
          
          // 새 메시지의 미디어 로딩 등록
          if (lastMessage.fileUrls && lastMessage.fileUrls.length > 0) {
            registerMessageMediaLoad(lastMessage)
            
            // 미디어가 포함된 메시지라면 로딩 완료 후 스크롤
            scrollToBottomAfterMediaLoad()
          } else {
            // 미디어가 없는 메시지는 즉시 스크롤
            scrollToBottom()
          }
        } else {
          scrollToBottom()
        }
      }
    }, { deep: true })
    
    watch(showInviteDialog, (newValue) => {
      if (!newValue) {
        // 다이얼로그가 닫힐 때 초기화
        // 필요한 초기화 로직은 UserSelectionModal 컴포넌트에서 처리됨
      }
    })
    
    onMounted(async () => {
      senderEmail.value = localStorage.getItem('email')
      if (props.roomId) {
        // 초기 로딩 상태 설정
        loading.value = true
        
        await loadRoomData()
        connectWebsocket()
        
        // 초기 메시지들의 미디어 로딩 등록
        messages.value.forEach(message => {
          registerMessageMediaLoad(message)
        })
        
        // ResizeObserver 설정
        nextTick(() => {
          setupResizeObserver()
          
          // 초기 스크롤 상태 설정
          const chatContainer = chatBox.value?.$el || chatBox.value
          if (chatContainer) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainer
            const atBottom = scrollTop + clientHeight >= scrollHeight - 50
            isAtBottom.value = atBottom
            showScrollToBottomButton.value = false
          }
          
          // 모든 미디어 로딩 완료 후 초기 스크롤 (더 안정적인 타이밍)
          setTimeout(() => {
            if (mediaLoadPromises.value.length > 0) {
              scrollToBottomAfterMediaLoad()
            } else {
              scrollToBottom()
            }
          }, 300) // DOM과 레이아웃이 완전히 안정화될 때까지 대기
        })
      }
      window.addEventListener('beforeunload', disconnectWebsocket)
      
      // 전체 페이지에 드래그 이벤트 추가 (브라우저 기본 동작 방지)
      window.addEventListener('dragover', preventDefault)
      window.addEventListener('drop', preventDefault)
      
      // 버튼이 이제 CSS로 고정되어 있으므로 ResizeObserver가 필요하지 않음
    })
    
    onUnmounted(() => {
      disconnectWebsocket()
      window.removeEventListener('beforeunload', disconnectWebsocket)
      
      // 전체 페이지 드래그 이벤트 리스너 제거
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
      
      // ResizeObserver 정리
      cleanupResizeObserver()
    })
    
    // 미디어 로딩 상태 등록
    const registerMediaLoad = (mediaUrl, mediaType) => {
      if (!mediaUrl) return
      
      const loadPromise = new Promise((resolve) => {
        if (mediaType === 'image') {
          const img = new Image()
          img.onload = () => {
            mediaLoadingStates.value.set(mediaUrl, 'loaded')
            resolve()
          }
          img.onerror = () => {
            mediaLoadingStates.value.set(mediaUrl, 'error')
            resolve() // 에러가 발생해도 로딩 완료로 간주
          }
          img.src = mediaUrl
        } else if (mediaType === 'video') {
          const video = document.createElement('video')
          video.onloadedmetadata = () => {
            mediaLoadingStates.value.set(mediaUrl, 'loaded')
            resolve()
          }
          video.onerror = () => {
            mediaLoadingStates.value.set(mediaUrl, 'error')
            resolve() // 에러가 발생해도 로딩 완료로 간주
          }
          video.src = mediaUrl
        } else {
          // 기타 파일은 즉시 로딩 완료로 간주
          mediaLoadingStates.value.set(mediaUrl, 'loaded')
          resolve()
        }
      })
      
      mediaLoadPromises.value.push(loadPromise)
      return loadPromise
    }
    
    // 메시지의 모든 미디어 로딩 등록
    const registerMessageMediaLoad = (message) => {
      if (!message.fileUrls || message.fileUrls.length === 0) return
      
      message.fileUrls.forEach(fileUrl => {
        if (isImageFile(fileUrl)) {
          registerMediaLoad(fileUrl, 'image')
        } else if (isVideoFile(fileUrl)) {
          registerMediaLoad(fileUrl, 'video')
        }
      })
    }
    
    // 파일 타입 체크 함수들
    const isImageFile = (url) => {
      if (!url) return false
      const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
      const extension = url.split('.').pop().toLowerCase()
      return imageExtensions.includes(extension)
    }
    
    const isVideoFile = (url) => {
      if (!url) return false
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v', '3gp', 'flv']
      const extension = url.split('.').pop().toLowerCase()
      return videoExtensions.includes(extension)
    }
    
    // ResizeObserver 설정
    const setupResizeObserver = () => {
      if (!chatBox.value) return
      
      const chatContainer = chatBox.value.$el || chatBox.value
      if (!chatContainer) return
      
      resizeObserver.value = new ResizeObserver(() => {
        // 사용자가 하단에 있을 때만 자동 스크롤 조정
        if (isAtBottom.value) {
          // 약간의 지연 후 스크롤 조정 (레이아웃 안정화를 위해)
          setTimeout(() => {
            scrollToBottom(true)
          }, 50)
        }
      })
      
      resizeObserver.value.observe(chatContainer)
    }
    
    // ResizeObserver 정리
    const cleanupResizeObserver = () => {
      if (resizeObserver.value) {
        resizeObserver.value.disconnect()
        resizeObserver.value = null
      }
    }
    
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
      isDragOver,
      displayedMessages,
      messagesWithDateSeparators,
      retryLoad,
      connectWebsocket,
      disconnectWebsocket,
      sendMessage,
      scrollToBottom,
      handleScroll,
      triggerFileInput,
      onFileChange,
      removeFile,
      getFileIcon,
      getFileIconColor,
      truncateFileName,
      formatFileSize,
      handleKeydown,
      handleDragEnter,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      preventDefault,
      uploadFiles,
      formatTime,
      isSending,
      showParticipantsDialog,
      showInviteDialog,
      showLeaveConfirmDialog,
      isLeaving,
      isOnline,
      getInitials,
      getParticipantProfileImage,
      viewProfile,
      showParticipants,
      inviteParticipants,
      inviteSelectedUsers,
      isAlreadyParticipant,
      confirmLeaveRoom,
      leaveRoom,
      // 스크롤 관련
      showScrollToBottomButton,
      isAtBottom,
      adjustButtonPosition,
      // 새로운 함수들
      scrollToBottomAfterMediaLoad,
      registerMediaLoad,
      registerMessageMediaLoad,
      isImageFile,
      isVideoFile,
      setupResizeObserver,
      cleanupResizeObserver,
      // 빠른 메시지 관련
      quickMessages,
      sendQuickMessage
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
  background: var(--mm-surface);
  border-radius: 0;
}

/* 채팅 헤더 고정 높이 */
.chat-header {
  flex-shrink: 0;
  min-height: 72px;
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  position: relative;
  overflow: hidden;
  /* Vuetify toolbar의 기본 정렬 문제 해결 */
  display: flex;
  align-items: center;
}

.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
  /* 더 정확한 세로 중앙 정렬 */
  height: 100%;
  min-height: 72px;
}

.header-spacer {
  flex: 1;
}

.room-info {
  display: flex;
  align-items: center;
  height: 100%;
  /* 제목이 너무 왼쪽에 붙지 않도록 여백 추가 */
  padding-left: 24px;
}

.room-title {
  color: white;
  font-weight: 600;
  font-size: var(--mm-text-lg);
  line-height: 1.3;
  /* 제목의 세로 중앙 정렬 개선 */
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0;
  /* h2 기본 스타일 제거 */
  font-size: inherit;
  font-weight: inherit;
}



.room-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--mm-text-sm);
  color: rgba(255, 255, 255, 0.8);
}

.participant-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.online-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.action-btn {
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  transition: all var(--mm-transition-normal);
  border-radius: 16px !important;
  min-width: 56px !important;
  height: 56px !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  /* 버튼 내부 아이콘의 세로 중앙 정렬 개선 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn .v-icon {
  transition: all var(--mm-transition-fast);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.action-btn:hover .v-icon {
  transform: scale(1.1);
}

/* 헤더 구분선 */
.header-divider {
  border-color: rgba(255, 255, 255, 0.2);
  margin: 0;
}

/* 메시지 컨테이너 스크롤 영역 */
.chat-messages-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 200px);
  max-height: calc(100vh - 200px);
  scroll-behavior: smooth;
  position: relative;
  background: var(--mm-surface);
}

.messages-wrapper {
  padding: 16px 0;
}

/* 날짜 구분선 */
.date-separator {
  text-align: center;
  margin: 24px 0;
}

.date-chip {
  background: rgba(232, 125, 125, 0.1);
  border-color: #E87D7D;
  color: #E87D7D;
  font-weight: 500;
}

/* Grid 레이아웃 기반 메시지 구조 */
.message-row {
  display: grid;
  gap: 12px;
  align-items: start;
  margin-bottom: 16px;
}

.received-message {
  grid-template-columns: 36px 1fr;
  justify-items: start;
}

.sent-message {
  grid-template-columns: 1fr 36px;
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
  align-items: flex-start;
}

.message-avatar {
  border: 2px solid var(--mm-border);
  transition: all var(--mm-transition-normal);
}

.message-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.message-content {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.sender-info {
  margin-bottom: 6px;
}

.sender-name {
  font-size: var(--mm-text-sm);
  font-weight: 500;
  color: var(--mm-on-surface-variant);
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
  border-radius: 20px;
  max-width: 70%;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  text-align: left;
  box-shadow: var(--mm-shadow-sm);
  transition: all var(--mm-transition-normal);
  position: relative;
}

.message-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  opacity: 0;
  transition: opacity var(--mm-transition-normal);
}

.message-bubble:hover::before {
  opacity: 0.05;
}

.media-bubble {
  min-width: 280px;
  max-width: 70%;
}

.media-bubble video,
.media-bubble img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

.message-text {
  line-height: 1.5;
  font-size: var(--mm-text-base);
}

.sent {
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  color: white;
  border-top-right-radius: 6px;
}

.sent::before {
  background: linear-gradient(135deg, #d65a5a 0%, #E87D7D 100%);
}

.received {
  background: var(--mm-surface-variant);
  color: var(--mm-on-surface);
  border-top-left-radius: 6px;
  border: 1px solid var(--mm-border-light);
}

.received::before {
  background: var(--mm-border);
}

.message-files {
  margin-top: 12px;
}

.message-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: fit-content;
}

.meta-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--mm-text-xs);
  color: var(--mm-on-surface-variant);
}

.unread-count {
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
  padding: 0 6px;
}

.timestamp {
  opacity: 0.8;
}

/* ===== 채팅 입력 영역 스타일 ===== */

/* 입력 컨테이너 */
.chat-input-container {
  flex-shrink: 0;
  min-height: 128px;
  background: linear-gradient(180deg, var(--mm-surface) 0%, rgba(232, 125, 125, 0.02) 100%);
  border-top: 1px solid rgba(232, 125, 125, 0.1);
  position: relative;
  overflow: hidden;
}

.chat-input-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 125, 125, 0.3), transparent);
}

/* 입력 영역 */
.input-area {
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 24px;
  border: 1px solid rgba(232, 125, 125, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all var(--mm-transition-normal);
}

.input-area:focus-within {
  border-color: rgba(232, 125, 125, 0.4);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

/* 파일 첨부 버튼 */
.file-attach-btn {
  border-radius: 16px !important;
  border: 2px solid rgba(232, 125, 125, 0.3) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%) !important;
  color: #E87D7D !important;
  transition: all var(--mm-transition-normal);
  min-width: 56px !important;
  height: 56px !important;
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.2);
}

.file-attach-btn:hover:not(:disabled) {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.4);
  border-color: rgba(232, 125, 125, 0.6) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%) !important;
}

.file-attach-btn:active {
  transform: scale(0.95);
}

.file-attach-btn .v-icon {
  transition: all var(--mm-transition-fast);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.file-attach-btn:hover .v-icon {
  transform: scale(1.2);
  color: #FF6B6B !important;
}

/* 메시지 입력창 */
.message-input {
  border-radius: 20px !important;
  transition: all var(--mm-transition-normal);
  background: rgba(255, 255, 255, 0.8) !important;
  border: 2px solid rgba(232, 125, 125, 0.2) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.message-input:focus-within {
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.2), 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(232, 125, 125, 0.6) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  transform: translateY(-1px);
}

.message-input .v-field__outline {
  display: none !important;
}

.message-input .v-field__input {
  padding: 16px 20px !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  color: #2c3e50 !important;
}

.message-input .v-field__input::placeholder {
  color: rgba(44, 62, 80, 0.6) !important;
  font-style: italic;
}

/* 전송 버튼 */
.send-btn {
  border-radius: 16px !important;
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%) !important;
  color: white !important;
  transition: all var(--mm-transition-normal);
  min-width: 56px !important;
  height: 56px !important;
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.3);
  border: none !important;
  position: relative;
  overflow: hidden;
}

.send-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 12px 32px rgba(232, 125, 125, 0.5);
  background: linear-gradient(135deg, #FF6B6B 0%, #E87D7D 100%) !important;
}

.send-btn:hover::before {
  left: 100%;
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.6;
  transform: none !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.send-btn .v-icon {
  transition: all var(--mm-transition-fast);
  font-size: 24px !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.send-btn:hover .v-icon {
  transform: scale(1.1);
}

/* ===== 파일 선택 영역 스타일 ===== */

.file-selection-area {
  width: 100%;
}

.selected-files-preview {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(232, 125, 125, 0.15);
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all var(--mm-transition-normal);
}

.selected-files-preview:hover {
  border-color: rgba(232, 125, 125, 0.25);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 파일 헤더 */
.files-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%);
  border-radius: 12px;
  margin-right: 12px;
  border: 1px solid rgba(232, 125, 125, 0.2);
}

.files-header-text {
  font-weight: 600;
  color: var(--mm-on-surface);
  font-size: 14px;
  flex: 1;
}

.files-count-chip {
  font-weight: 600;
  border-radius: 12px !important;
}

/* 파일 그리드 */
.selected-files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* 파일 아이템 */
.file-preview-item {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(232, 125, 125, 0.2);
  position: relative;
  transition: all var(--mm-transition-normal);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.file-preview-item:hover {
  border-color: rgba(232, 125, 125, 0.4);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.15);
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
}

.file-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 16px;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%);
  border-radius: 14px;
  border: 1px solid rgba(232, 125, 125, 0.2);
  transition: all var(--mm-transition-normal);
}

.file-preview-item:hover .file-icon-container {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%);
  border-color: rgba(232, 125, 125, 0.4);
  transform: scale(1.05);
}

.file-info {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.file-name {
  font-weight: 600;
  color: var(--mm-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.file-size {
  color: var(--mm-on-surface-variant);
  font-size: 11px;
  font-weight: 500;
  opacity: 0.8;
}

/* 파일 삭제 버튼 */
.remove-file-btn {
  opacity: 0.6;
  transition: all var(--mm-transition-fast);
  border-radius: 12px !important;
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
  min-width: 36px !important;
  height: 36px !important;
}

.remove-file-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  background: rgba(239, 68, 68, 0.2) !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.remove-file-btn:active {
  transform: scale(0.95);
}

/* ===== 반응형 디자인 ===== */

@media (max-width: 768px) {
  .input-area {
    padding: 16px;
    gap: 12px;
    border-radius: 20px;
  }
  
  .file-attach-btn,
  .send-btn {
    min-width: 48px !important;
    height: 48px !important;
  }
  
  .file-attach-btn .v-icon,
  .send-btn .v-icon {
    font-size: 20px !important;
  }
  
  .message-input .v-field__input {
    padding: 12px 16px !important;
    font-size: 14px !important;
  }
  
  .selected-files-preview {
    padding: 16px;
    border-radius: 16px;
  }
  
  .selected-files-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .file-preview-item {
    padding: 12px;
    border-radius: 14px;
  }
  
  .file-icon-container {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .file-icon-container .v-icon {
    font-size: 20px !important;
  }
  
  .file-name {
    font-size: 12px;
  }
  
  .file-size {
    font-size: 10px;
  }
  
  .remove-file-btn {
    min-width: 32px !important;
    height: 32px !important;
  }
  
  .remove-file-btn .v-icon {
    font-size: 16px !important;
  }
  
  .files-header-icon {
    width: 28px;
    height: 28px;
    margin-right: 10px;
  }
  
  .files-header-text {
    font-size: 13px;
  }
  
  .files-count-chip {
    font-size: 11px !important;
  }
}

@media (max-width: 480px) {
  .input-area {
    padding: 12px;
    gap: 8px;
    border-radius: 16px;
  }
  
  .file-attach-btn,
  .send-btn {
    min-width: 44px !important;
    height: 44px !important;
  }
  
  .file-attach-btn .v-icon,
  .send-btn .v-icon {
    font-size: 18px !important;
  }
  
  .message-input .v-field__input {
    padding: 10px 14px !important;
    font-size: 13px !important;
  }
  
  .selected-files-preview {
    padding: 12px;
    border-radius: 14px;
  }
  
  .file-preview-item {
    padding: 10px;
    border-radius: 12px;
  }
  
  .file-icon-container {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
  
  .file-icon-container .v-icon {
    font-size: 18px !important;
  }
  
  .remove-file-btn {
    min-width: 28px !important;
    height: 28px !important;
  }
  
  .remove-file-btn .v-icon {
    font-size: 14px !important;
  }
}

/* 스크롤바 스타일링 */
.chat-messages-container::-webkit-scrollbar {
  width: 8px;
}

.chat-messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages-container::-webkit-scrollbar-thumb {
  background: var(--mm-border);
  border-radius: var(--mm-radius-full);
  transition: background var(--mm-transition-fast);
}

.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--mm-on-surface-variant);
}

/* 빈 채팅방 상태 */
.empty-chat-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  text-align: center;
}

/* 로딩 상태 */
.loading-chat-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 24px;
  margin: 20px;
  backdrop-filter: blur(10px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* 채팅 버블 로더 애니메이션 */
.loading-animation {
  position: relative;
  width: 120px;
  height: 80px;
}

.chat-bubble-loader {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bubble {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  position: absolute;
  animation: bubbleFloat 2s ease-in-out infinite;
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.3);
}

.bubble-1 {
  left: 20px;
  animation-delay: 0s;
}

.bubble-2 {
  left: 50px;
  animation-delay: 0.3s;
}

.bubble-3 {
  left: 80px;
  animation-delay: 0.6s;
}

@keyframes bubbleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-20px) scale(1.1);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) scale(1.05);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-15px) scale(1.15);
    opacity: 0.8;
  }
}

/* 로딩 텍스트 */
.loading-text {
  font-size: var(--mm-text-xl);
  font-weight: 600;
  color: var(--mm-on-surface);
  text-align: center;
}

.loading-dots {
  position: relative;
}

.dot {
  display: inline-block;
  animation: dotPulse 1.4s infinite;
  opacity: 0;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 60%, 100% {
    opacity: 0;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

/* 부가 정보 */
.loading-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%);
  border-radius: 20px;
  border: 1px solid rgba(232, 125, 125, 0.2);
  color: var(--mm-on-surface-variant);
  font-size: var(--mm-text-sm);
  font-weight: 500;
  backdrop-filter: blur(10px);
  animation: tipGlow 3s ease-in-out infinite;
}

@keyframes tipGlow {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(232, 125, 125, 0.1);
  }
  50% {
    box-shadow: 0 8px 24px rgba(232, 125, 125, 0.2);
  }
}



/* 에러 상태 */
.error-chat-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  text-align: center;
}

.error-content {
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.error-title {
  font-size: var(--mm-text-xl);
  font-weight: 700;
  color: var(--mm-error);
  margin-bottom: 16px;
  line-height: 1.4;
}

.error-message {
  font-size: var(--mm-text-base);
  color: var(--mm-on-surface-variant);
  margin-bottom: 32px;
  line-height: 1.6;
}

.retry-btn {
  border-radius: 20px !important;
  border: 2px solid rgba(232, 125, 125, 0.3) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%) !important;
  color: #E87D7D !important;
  font-weight: 600 !important;
  transition: all var(--mm-transition-normal);
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.2);
  text-transform: none !important;
  letter-spacing: normal !important;
}

.retry-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.4);
  border-color: rgba(232, 125, 125, 0.6) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%) !important;
}

.retry-btn:active {
  transform: translateY(0) scale(0.98);
}

.empty-chat-content {
  max-width: 500px;
  width: 100%;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.welcome-title {
  font-size: var(--mm-text-xl);
  font-weight: 700;
  color: var(--mm-on-surface);
  margin-bottom: 16px;
  line-height: 1.4;
}

.welcome-message {
  font-size: var(--mm-text-base);
  color: var(--mm-on-surface-variant);
  margin-bottom: 32px;
  line-height: 1.6;
}

.conversation-tips {
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid rgba(232, 125, 125, 0.15);
  backdrop-filter: blur(10px);
}

.tips-title {
  font-size: var(--mm-text-lg);
  font-weight: 600;
  color: var(--mm-on-surface);
  margin-bottom: 20px;
  text-align: center;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(232, 125, 125, 0.2);
  transition: all var(--mm-transition-normal);
  backdrop-filter: blur(10px);
}

.tip-item:hover {
  transform: translateY(-2px);
  border-color: rgba(232, 125, 125, 0.4);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.15);
  background: rgba(255, 255, 255, 0.95);
}

.tip-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.tip-text {
  font-size: var(--mm-text-sm);
  font-weight: 500;
  color: var(--mm-on-surface);
  text-align: center;
  line-height: 1.3;
}

.quick-message-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.quick-msg-btn {
  border-radius: 20px !important;
  border: 2px solid rgba(232, 125, 125, 0.3) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%) !important;
  color: #E87D7D !important;
  font-weight: 600 !important;
  transition: all var(--mm-transition-normal);
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.2);
  text-transform: none !important;
  letter-spacing: normal !important;
}

.quick-msg-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.4);
  border-color: rgba(232, 125, 125, 0.6) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%) !important;
}

.quick-msg-btn:active {
  transform: translateY(0) scale(0.98);
}

/* 맨 아래로 버튼 */
.scroll-to-bottom-button-sticky {
  position: sticky;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.scroll-to-bottom-btn {
  pointer-events: auto;
  border-radius: 50% !important;
  transition: all var(--mm-transition-normal);
  backdrop-filter: blur(10px);
  background: rgba(232, 125, 125, 0.95) !important;
  border: 2px solid rgba(255, 255, 255, 0.9) !important;
  animation: pulse 2s infinite;
}

.scroll-to-bottom-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.4) !important;
  background: rgba(232, 125, 125, 1) !important;
  animation: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(232, 125, 125, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(232, 125, 125, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(232, 125, 125, 0);
  }
}

/* 드래그 앤 드롭 스타일 */
.drag-drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(232, 125, 125, 0.1);
  border: 3px dashed #E87D7D;
  border-radius: var(--mm-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.drag-drop-content {
  text-align: center;
  color: #E87D7D;
}

/* 모달 스타일 */
.participants-dialog,
.invite-dialog,
.leave-dialog {
  border-radius: var(--mm-radius-lg);
}

.dialog-header {
  background: var(--mm-surface-variant);
  border-bottom: 1px solid var(--mm-border-light);
  padding: 20px 24px;
}

.participants-content,
.invite-content,
.leave-content {
  padding: 24px;
}

.participant-item {
  border-radius: var(--mm-radius-md);
  margin: 4px 0;
  transition: all var(--mm-transition-fast);
}

.participant-item:hover {
  background: var(--mm-surface-variant);
}

.status-chip {
  font-size: 11px;
  font-weight: 500;
}

.invite-tabs {
  border-bottom: 1px solid var(--mm-border-light);
}

.invite-tab {
  font-weight: 500;
  text-transform: none;
}

.search-section,
.followers-section,
.followings-section {
  padding: 16px 0;
}

.search-input {
  margin-bottom: 16px;
}

.search-results,
.followers-list,
.followings-list {
  background: transparent;
}

.search-result-item,
.follower-item,
.following-item {
  border-radius: var(--mm-radius-md);
  margin: 4px 0;
  transition: all var(--mm-transition-fast);
}

.search-result-item:hover,
.follower-item:hover,
.following-item:hover {
  background: var(--mm-surface-variant);
}

.invite-user-btn {
  border-radius: var(--mm-radius-md);
  font-weight: 500;
  transition: all var(--mm-transition-fast);
}

.invite-user-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.loading-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--mm-on-surface-variant);
}

.no-results-alert,
.no-followers-alert,
.no-followings-alert {
  border-radius: var(--mm-radius-lg);
  margin: 16px 0;
}

.room-options-menu {
  border-radius: var(--mm-radius-lg);
  box-shadow: var(--mm-shadow-lg);
  background: var(--mm-surface);
  min-width: 220px;
  border: 1px solid var(--mm-border-light);
}

.menu-item {
  border-radius: var(--mm-radius-md);
  margin: var(--mm-space-1) var(--mm-space-2);
  padding: var(--mm-space-3) var(--mm-space-4);
  transition: all var(--mm-transition-fast);
  cursor: pointer;
}

.menu-item:hover {
  background: var(--mm-surface-variant);
  transform: translateY(-1px);
}

.leave-item:hover {
  background: rgba(239, 68, 68, 0.08);
}

.menu-icon {
  margin-right: var(--mm-space-3);
}

.menu-title {
  font-weight: var(--mm-font-weight-semibold);
  font-size: var(--mm-text-sm);
  color: var(--mm-on-surface);
  line-height: 1.4;
}

.menu-subtitle {
  font-size: var(--mm-text-xs);
  color: var(--mm-on-surface-variant);
  font-weight: var(--mm-font-weight-normal);
  line-height: 1.3;
}

.menu-divider {
  margin: var(--mm-space-2) var(--mm-space-4);
  border-color: var(--mm-border-light);
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .room-options-menu {
    background: #2d2d2d;
    border-color: #404040;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  
  .menu-item:hover {
    background: #404040;
  }
  
  .menu-title {
    color: #ecf0f1;
  }
  
  .menu-subtitle {
    color: #bdc3c7;
  }
  
  .menu-divider {
    border-color: #404040;
  }
}

.leave-actions {
  padding: 20px 24px;
  border-top: 1px solid var(--mm-border-light);
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-room-container {
    background: #2d2d2d;
  }
  
  .chat-messages-container {
    background: #2d2d2d;
  }
  
  .chat-input-container {
    background: #2d2d2d;
    border-top-color: #404040;
  }
  
  .selected-files-preview {
    background: #404040;
    border-color: #505050;
  }
  
  .file-preview-item {
    background: #404040;
    border-color: #505050;
  }
  
  .file-preview-item:hover {
    background: #505050;
  }
  
  .file-icon-container {
    background: #505050;
  }
  
  .message-bubble.received {
    background: #404040;
    border-color: #505050;
    color: #e0e0e0;
  }
  
  .date-chip {
    background: rgba(232, 125, 125, 0.15);
    border-color: #E87D7D;
    color: #FFB3B3;
  }
  
  /* 빈 채팅방 상태 다크 모드 */
  .conversation-tips {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(64, 64, 64, 0.2) 100%);
    border-color: #505050;
  }
  
  .tip-item {
    background: #404040;
    border-color: #505050;
    color: #e0e0e0;
  }
  
  .tip-item:hover {
    background: #505050;
    border-color: #E87D7D;
  }
  
  .tip-text {
    color: #e0e0e0;
  }
  
  /* 로딩 상태 다크 모드 */
  .loading-chat-state {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.05) 0%, rgba(64, 64, 64, 0.1) 100%);
  }
  
  .loading-tip {
    background: linear-gradient(135deg, rgba(232, 125, 125, 0.15) 0%, rgba(64, 64, 64, 0.2) 100%);
    border-color: #505050;
    color: #e0e0e0;
  }
  
  /* 에러 상태 다크 모드 */
  .error-title {
    color: #ff6b6b;
  }
  
  .error-message {
    color: #b0b0b0;
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

.message-row {
  animation: fadeInUp 0.3s ease-out;
}

.message-bubble {
  animation: fadeInUp 0.2s ease-out;
}

/* 호버 효과 개선 */
.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: var(--mm-shadow-md);
}

.chat-room-item:hover {
  transform: translateX(4px);
}

/* 포커스 상태 */
.message-input:focus-within {
  border-color: var(--mm-primary);
}

/* 로딩 상태 */
.loading-state {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 참여자 목록 다이얼로그 스타일 */
.participants-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  padding: 24px;
  color: white;
  position: relative;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0.8;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.dialog-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  line-height: 1.2;
}

.dialog-subtitle {
  font-size: 16px;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  line-height: 1.4;
}

.warning-section {
  padding: 24px;
  background: #FFF5F5;
  border: 1px solid #FFE5E5;
  border-radius: 16px;
  margin: 24px;
  position: relative;
}

.warning-section::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #FFE5E5, #FFF5F5);
  border-radius: 18px;
  z-index: -1;
}

.warning-icon {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.warning-title {
  font-size: 18px;
  font-weight: 600;
  color: #D32F2F;
  margin: 0;
}

.warning-content {
  flex: 1;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list li {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  line-height: 1.5;
}

.warning-list li::before {
  content: '⚠️';
  position: absolute;
  left: 0;
  top: 0;
  font-size: 12px;
}

.warning-list li:last-child {
  margin-bottom: 0;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0 24px 24px 24px;
}

.cancel-btn,
.leave-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-width: 140px !important;
  height: 48px !important;
}

.cancel-btn {
  background: #F5F5F5 !important;
  color: #666 !important;
  border: 2px solid #E0E0E0 !important;
}

.cancel-btn:hover:not(:disabled) {
  background: #EEEEEE !important;
  border-color: #BDBDBD !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.leave-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF5252) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
}

.leave-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #FF5252, #FF1744) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.6);
}

.leave-btn:active {
  transform: translateY(0);
}

.cancel-btn:active,
.leave-btn:active {
  transform: translateY(0) scale(0.98);
}

.cancel-btn .v-icon,
.leave-btn .v-icon {
  transition: all 0.2s ease;
  margin-right: 8px;
}

.cancel-btn:hover .v-icon,
.leave-btn:hover .v-icon {
  transform: scale(1.1);
}

/* 모바일 반응형 디자인 */
@media (max-width: 600px) {
  .leave-room-dialog {
    margin: 16px;
    border-radius: 16px;
  }
  
  .dialog-header {
    padding: 20px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .dialog-title {
    font-size: 20px;
  }
  
  .dialog-subtitle {
    font-size: 14px;
  }
  
  .warning-section {
    margin: 16px;
    padding: 20px;
  }
  
  .dialog-actions {
    flex-direction: column;
    gap: 12px;
    padding: 0 16px 20px 16px;
  }
  
  .cancel-btn,
  .leave-btn {
    width: 100%;
    min-width: auto;
  }
}

.close-btn {
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  transition: all var(--mm-transition-normal);
  border-radius: 16px !important;
  min-width: 56px !important;
  height: 56px !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  margin-left: auto;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.close-btn:active {
  transform: scale(0.95);
}

.close-btn .v-icon {
  transition: all var(--mm-transition-fast);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.close-btn:hover .v-icon {
  transform: scale(1.1);
}

.participants-content {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: var(--mm-surface);
  border: 1px solid var(--mm-border-light);
  transition: all var(--mm-transition-normal);
  position: relative;
}

.participant-item:hover {
  background: var(--mm-surface-variant);
  border-color: #FF6B6B;
  transform: translateY(-2px);
  box-shadow: var(--mm-shadow-md);
}

.participant-item.online {
  border-left: 4px solid #E87D7D;
}

.participant-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: var(--mm-text-lg);
  position: relative;
  overflow: hidden;
}

.avatar-circle .v-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid white;
  transition: all var(--mm-transition-normal);
}

.online-indicator.active {
  background: #E87D7D;
  box-shadow: 0 0 8px rgba(232, 125, 125, 0.4);
}

.participant-info {
  flex: 1;
  min-width: 0;
}

.participant-name {
  font-weight: 600;
  font-size: var(--mm-text-base);
  color: var(--mm-on-surface);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.participant-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--mm-text-sm);
  color: var(--mm-on-surface-variant);
  font-weight: 500;
}

.participant-item.online .participant-status {
  color: #E87D7D;
  font-weight: 600;
}



.participant-actions {
  flex-shrink: 0;
}

.action-icon {
  color: var(--mm-on-surface-variant) !important;
  transition: all var(--mm-transition-normal);
}

.action-icon:hover {
  color: var(--mm-primary) !important;
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--mm-on-surface-variant);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: var(--mm-text-base);
  font-weight: 500;
}

.dialog-footer {
  padding: 24px;
  border-top: 1px solid var(--mm-border-light);
  background: var(--mm-surface);
  display: flex;
  justify-content: center;
}

.invite-btn {
  border-radius: 16px !important;
  border: 2px solid rgba(232, 125, 125, 0.3) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%) !important;
  color: #E87D7D !important;
  transition: all var(--mm-transition-normal);
  min-width: 200px !important;
  height: 48px !important;
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.2);
}

.invite-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(232, 125, 125, 0.4);
  border-color: rgba(232, 125, 125, 0.6) !important;
  background: linear-gradient(135deg, rgba(232, 125, 125, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%) !important;
}

/* 초대하기 모달 스타일 */
.invite-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.invite-header {
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
}

.invite-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  margin-right: 16px;
}

.selection-chip {
  border-color: rgba(255, 255, 255, 0.6) !important;
  color: white !important;
  font-weight: 600;
}

.invite-selected-btn {
  border-color: rgba(255, 255, 255, 0.6) !important;
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
  transition: all var(--mm-transition-normal);
  border-radius: 16px !important;
  height: 40px !important;
  backdrop-filter: blur(10px);
}

.invite-selected-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.8) !important;
}

.invite-content {
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
}

.tab-navigation {
  margin-bottom: 24px;
}

.custom-tabs {
  background: var(--mm-surface-variant);
  border-radius: 16px;
  padding: 4px;
}

.custom-tab {
  border-radius: 12px !important;
  margin: 4px !important;
  transition: all var(--mm-transition-normal);
}

.custom-tab:hover {
  background: rgba(232, 125, 125, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-room-container {
    height: 100vh;
  }
  
  .chat-messages-container {
    height: calc(100vh - 180px);
    max-height: calc(100vh - 180px);
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .media-bubble {
    min-width: 240px;
    max-width: 85%;
  }
  
  .scroll-to-bottom-button-sticky {
    bottom: 16px;
    right: 16px;
  }
  
  .scroll-to-bottom-btn {
    width: 48px !important;
    height: 48px !important;
  }
  
  .room-title {
    font-size: var(--mm-text-base);
  }
  
  .room-status {
    font-size: var(--mm-text-xs);
    gap: 8px;
  }
  
  /* 빈 채팅방 상태 반응형 */
  .empty-chat-state {
    min-height: 300px;
    padding: 20px 16px;
  }
  
  .welcome-icon {
    font-size: 60px;
    margin-bottom: 20px;
  }
  
  .welcome-title {
    font-size: var(--mm-text-lg);
    margin-bottom: 12px;
  }
  
  .welcome-message {
    font-size: var(--mm-text-sm);
    margin-bottom: 24px;
  }
  
  .conversation-tips {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .tips-title {
    font-size: var(--mm-text-base);
    margin-bottom: 16px;
  }
  
  .tips-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .tip-item {
    padding: 12px;
  }
  
  .tip-icon {
    font-size: 24px;
  }
  
  .tip-text {
    font-size: 11px;
  }
  
  .quick-message-buttons {
    gap: 8px;
  }
  
  .quick-msg-btn {
    font-size: 12px !important;
    padding: 8px 16px !important;
  }
  
  /* 로딩 상태 반응형 */
  .loading-chat-state {
    min-height: 300px;
    padding: 20px 16px;
    margin: 16px;
    border-radius: 20px;
  }
  
  .loading-animation {
    width: 100px;
    height: 70px;
  }
  
  .bubble {
    width: 16px;
    height: 16px;
  }
  
  .bubble-1 {
    left: 16px;
  }
  
  .bubble-2 {
    left: 42px;
  }
  
  .bubble-3 {
    left: 68px;
  }
  
  .loading-text {
    font-size: var(--mm-text-lg);
  }
  
  .loading-tip {
    padding: 10px 16px;
    font-size: 12px;
  }
  
  /* 에러 상태 반응형 */
  .error-chat-state {
    min-height: 300px;
    padding: 20px 16px;
  }
  
  .error-icon {
    font-size: 60px;
    margin-bottom: 20px;
  }
  
  .error-title {
    font-size: var(--mm-text-lg);
    margin-bottom: 12px;
  }
  
  .error-message {
    font-size: var(--mm-text-sm);
    margin-bottom: 24px;
  }
  
  .retry-btn {
    font-size: 14px !important;
    padding: 12px 24px !important;
  }
}

.leave-room-dialog {
  border-radius: 20px;
  overflow: hidden;
  transform: scale(0.9);
  opacity: 0;
  animation: modalEnter 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes modalEnter {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.leave-room-dialog:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

.dialog-header {
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  padding: 24px;
  color: white;
  position: relative;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.dialog-title {
  font-size: var(--mm-text-xl);
  font-weight: 700;
  margin: 0 0 4px 0;
  color: white;
}

.dialog-subtitle {
  font-size: var(--mm-text-sm);
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.warning-section {
  padding: 24px;
  background: #FFF5F5;
  border: 1px solid #FFE5E5;
  border-radius: 16px;
  margin: 24px;
  position: relative;
}

.warning-section::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #FFE5E5, #FFF5F5);
  border-radius: 18px;
  z-index: -1;
}

.warning-icon {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.warning-title {
  font-size: 18px;
  font-weight: 600;
  color: #D32F2F;
  margin: 0;
}

.warning-content {
  flex: 1;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list li {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  line-height: 1.5;
}

.warning-list li::before {
  content: '⚠️';
  position: absolute;
  left: 0;
  top: 0;
  font-size: 12px;
}

.warning-list li:last-child {
  margin-bottom: 0;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0 24px 24px 24px;
}

.cancel-btn,
.leave-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-width: 140px !important;
  height: 48px !important;
}

.cancel-btn {
  background: #F5F5F5 !important;
  color: #666 !important;
  border: 2px solid #E0E0E0 !important;
}

.cancel-btn:hover:not(:disabled) {
  background: #EEEEEE !important;
  border-color: #BDBDBD !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.leave-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF5252) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
}

.leave-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #FF5252, #FF1744) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.6);
}

.leave-btn:active {
  transform: translateY(0);
}

.cancel-btn:active,
.leave-btn:active {
  transform: translateY(0) scale(0.98);
}

.cancel-btn .v-icon,
.leave-btn .v-icon {
  transition: all 0.2s ease;
  margin-right: 8px;
}

.cancel-btn:hover .v-icon,
.leave-btn:hover .v-icon {
  transform: scale(1.1);
}
</style>
