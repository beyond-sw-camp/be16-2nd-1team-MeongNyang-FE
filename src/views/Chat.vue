<template>
  <div class="chat-container">
    <v-container fluid class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold text-primary mb-6">실시간 채팅</h1>
          <p class="text-body-1 text-grey-darken-1 mb-8">
            다른 반려인들과 실시간으로 소통하세요
          </p>
          
          <!-- 임시 채팅방 목록 -->
          <v-card class="mb-4" v-for="room in rooms" :key="room.id">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-avatar size="50" class="mr-4">
                  <v-icon size="30">mdi-account-group</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-medium mb-1">{{ room.name }}</h3>
                  <p class="text-body-2 text-grey-darken-1 mb-2">
                    마지막 메시지: 안녕하세요! 반려동물 관련 질문이 있어요...
                  </p>
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-caption text-grey-darken-1">{{ room.lastMessageAt }}</span>
                    <v-chip color="primary" size="small">{{ room.participants }}명 참여중</v-chip>
                  </div>
                </div>
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="enterChat(room.id)"
                >
                  입장하기
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { Client as StompClient } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export default {
  name: 'ChatPage',
  data() {
    return {
      apiBaseUrl: 'http://localhost:8080',
      rooms: [
        { id: 1, name: '반려동물 수다방', participants: 3, lastMessageAt: '5분 전' },
        { id: 2, name: '댕냥 정보공유', participants: 8, lastMessageAt: '12분 전' },
        { id: 3, name: '지역별 산책 메이트', participants: 2, lastMessageAt: '1시간 전' }
      ],
      stomp: null,
      connected: false
    }
  },
  methods: {
    enterChat(roomId) {
      this.$router.push({ path: `/chat/${roomId}` })
    },
    createStompClient() {
      const socketUrl = `${this.apiBaseUrl}/ws`
      const sock = new SockJS(socketUrl)
      const client = new StompClient({
        webSocketFactory: () => sock,
        reconnectDelay: 3000,
        debug: () => {}
      })
      client.onConnect = () => {
        this.connected = true
      }
      client.onStompError = () => {
        this.connected = false
      }
      this.stomp = client
      this.stomp.activate()
    }
  },
  mounted() {
    this.createStompClient()
  },
  beforeUnmount() {
    if (this.stomp && this.stomp.active) {
      this.stomp.deactivate()
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-container {
  min-height: calc(100vh - 68px);
  background: linear-gradient(135deg, rgba(255, 154, 139, 0.05) 0%, rgba(168, 230, 207, 0.05) 100%);
}
</style>
