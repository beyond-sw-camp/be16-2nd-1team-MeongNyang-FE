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
      return state.chatRoomList.find(room => room.id === roomId)
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
        this.chatRoomList = response.data.data || []
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error)
        this.error = '채팅방 목록을 불러오는데 실패했습니다.'
        this.chatRoomList = []
      } finally {
        this.loading = false
      }
    },

    async createChatRoom(roomName) {
      try {
        const response = await chatAPI.createRoom({ roomName })
        const newRoom = response.data.data
        this.chatRoomList.push(newRoom)
        return newRoom
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
        await chatAPI.leaveRoom(roomId)
        
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
        console.error('채팅방 나가기 실패:', error)
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
