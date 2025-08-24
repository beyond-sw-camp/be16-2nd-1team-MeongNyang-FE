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
          
          <v-menu>
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
                  <v-icon color="primary">mdi-account-group</v-icon>
                </template>
                <v-list-item-title>참여자 목록 ({{ participants.length }})</v-list-item-title>
              </v-list-item>
              <v-list-item @click="inviteParticipants" class="menu-item">
                <template v-slot:prepend>
                  <v-icon color="info">mdi-account-plus</v-icon>
                </template>
                <v-list-item-title>초대하기</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="confirmLeaveRoom" class="menu-item leave-item">
                <template v-slot:prepend>
                  <v-icon color="error">mdi-exit-to-app</v-icon>
                </template>
                <v-list-item-title class="text-error">채팅방 나가기</v-list-item-title>
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
            variant="text" 
            @click="showParticipantsDialog = false"
            class="close-btn"
            size="large"
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
                <span class="avatar-text">{{ getInitials(participant.email) }}</span>
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

            <div class="participant-actions">
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
            </div>
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
import { inject } from 'vue'

export default {
  name: 'ChatRoom',
  components: {
    FileGrid
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
    
    // 스크롤 관련 상태
    const showScrollToBottomButton = ref(false)
    const isAtBottom = ref(true)

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
          scrollToBottom()
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
    
    const scrollToBottom = () => {
      nextTick(() => {
        const chatContainer = chatBox.value?.$el || chatBox.value
        if (chatContainer) {
          // 더 확실한 스크롤을 위해 scrollHeight보다 큰 값으로 설정
          chatContainer.scrollTop = chatContainer.scrollHeight + 1000
          
          // 스크롤 후 하단 상태로 설정
          isAtBottom.value = true
          showScrollToBottomButton.value = false
        }
      })
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

    const viewProfile = (participant) => {
      // 프로필 보기 로직 (나중에 구현)
      console.log('프로필 보기:', participant);
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
      // 사용자가 하단에 있을 때만 자동으로 스크롤
      if (isAtBottom.value) {
        scrollToBottom()
      }
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
        // 초기 로드 후 하단으로 스크롤
        nextTick(() => {
          scrollToBottom()
          // 초기 스크롤 상태 설정
          const chatContainer = chatBox.value?.$el || chatBox.value
          if (chatContainer) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainer
            const atBottom = scrollTop + clientHeight >= scrollHeight - 50
            isAtBottom.value = atBottom
            showScrollToBottomButton.value = false
          }
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
      getInitials,
      viewProfile,
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
      isUserSelected,
      // 스크롤 관련
      showScrollToBottomButton,
      isAtBottom,
      adjustButtonPosition
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
}

.menu-item {
  border-radius: var(--mm-radius-md);
  margin: 4px;
  transition: all var(--mm-transition-fast);
}

.menu-item:hover {
  background: var(--mm-surface-variant);
}

.leave-item:hover {
  background: rgba(239, 68, 68, 0.1);
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

.close-btn {
  color: white !important;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  margin-left: auto;
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

  
}
</style>
