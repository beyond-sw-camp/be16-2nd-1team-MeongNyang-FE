import { defineStore } from 'pinia'
import { chatAPI } from '@/services/api'

export const useChatStore = defineStore('chat', {
  state: () => ({
    chatRoomList: [],
    currentRoom: null,
    messages: [],
    participants: [],
    onlineParticipants: [],
    loading: false,
    error: null
  }),

  getters: {
    getChatRoomById: (state) => (roomId) => {
      return state.chatRoomList.find(room => room.id == roomId)
    },
    
    getUnreadCount: (state) => (roomId) => {
      const room = state.getChatRoomById(roomId)
      return room ? room.newMessageCount : 0
    }
  },

  actions: {
    async fetchChatRoomList() {
      this.loading = true
      this.error = null
      
      try {
        const response = await chatAPI.getRooms()
        // ChatRoomSummaryRes DTO 구조에 맞춰 데이터 매핑
        this.chatRoomList = response.data.data || []
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error)
        this.error = '채팅방 목록을 불러오는데 실패했습니다.'
        this.chatRoomList = []
      } finally {
        this.loading = false
      }
    },

    async createChatRoom(roomName, participantEmails = []) {
      try {
        // 현재 로그인한 사용자의 이메일 가져오기
        const currentUserEmail = localStorage.getItem('email')
        
        // 참여자 목록에 현재 사용자 이메일도 포함 (중복 제거)
        const allParticipantEmails = [...new Set([currentUserEmail, ...participantEmails])]
        const roomData = { 
          roomName,
          participantEmails: allParticipantEmails
        }
        const response = await chatAPI.createRoom(roomData)
        
        // API 응답 구조 로깅
        console.log('채팅방 생성 응답:', response.data)
        
        // roomId 추출 - 응답 구조에 따라 적절히 처리
        let roomId
        if (response.data && response.data.data) {
          // response.data.data가 객체인 경우 id 필드에서 추출
          if (typeof response.data.data === 'object' && response.data.data.id) {
            roomId = response.data.data.id
          } else {
            // response.data.data가 직접 ID인 경우
            roomId = response.data.data
          }
        } else if (response.data && response.data.id) {
          // response.data에 직접 id가 있는 경우
          roomId = response.data.id
        } else {
          throw new Error('채팅방 ID를 찾을 수 없습니다.')
        }
        
        console.log('추출된 roomId:', roomId, typeof roomId)
        
        // 새로 생성된 채팅방 정보를 목록에 추가
        const newRoom = {
          id: roomId,
          roomName: roomName,
          lastMessage: "메세지를 보내 채팅을 시작해보세요!",
          newMessageCount: 0
        }
        this.chatRoomList.unshift(newRoom)
        
        return roomId
      } catch (error) {
        console.error('채팅방 생성 실패:', error)
        throw error
      }
    },

    async joinChatRoom(roomId) {
      try {
        const response = await chatAPI.addParticipants(roomId, [])
        
        // 채팅방 참여 성공 시 목록 새로고침
        await this.fetchChatRoomList()
        return response.data
      } catch (error) {
        console.error('채팅방 참여 실패:', error)
        throw error
      }
    },

    async getMessages(roomId) {
      try {
        const response = await chatAPI.getMessages(roomId)
        this.messages = response.data.data || []
        return this.messages
      } catch (error) {
        console.error('메시지 조회 실패:', error)
        throw error
      }
    },

    async getParticipants(roomId) {
      try {
        const response = await chatAPI.getParticipants(roomId)
        this.participants = response.data.data || []
        return this.participants
      } catch (error) {
        console.error('참여자 조회 실패:', error)
        throw error
      }
    },

    async leaveRoom(roomId) {
      try {
        // 백엔드 API 호출은 이미 ChatRoom 컴포넌트에서 완료됨
        // 여기서는 로컬 상태만 정리
        
        // 현재 채팅방에서 나가는 경우 상태 정리
        if (this.currentRoom?.id === roomId) {
          this.currentRoom = null
          this.messages = []
          this.participants = []
        }
        
        // 채팅방 목록에서 제거
        this.chatRoomList = this.chatRoomList.filter(room => room.id !== roomId)
        
        return true
      } catch (error) {
        console.error('채팅방 상태 정리 실패:', error)
        throw error
      }
    },

    setCurrentRoom(room) {
      this.currentRoom = room
    },

    updateMessageCount(roomId, count) {
      const room = this.chatRoomList.find(r => r.id === roomId)
      if (room) {
        room.newMessageCount = count
      }
    },

    clearError() {
      this.error = null
    }
  }
})
