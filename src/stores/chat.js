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

    async createChatRoom(roomName, participantEmails = [], marketPostId = null) {
      try {
        // 현재 로그인한 사용자의 이메일 가져오기
        const currentUserEmail = localStorage.getItem('email')
        
        // 참여자 목록에 현재 사용자 이메일도 포함 (중복 제거)
        const allParticipantEmails = [...new Set([currentUserEmail, ...participantEmails])]
        const roomData = { 
          roomName,
          participantEmails: allParticipantEmails,
          marketPostId
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
          marketPostId: marketPostId,
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
      console.log(`setCurrentRoom 호출됨 - room:`, room)
      this.currentRoom = room
      console.log(`현재 채팅방이 설정되었습니다:`, this.currentRoom)
    },

    updateMessageCount(roomId, count) {
      const room = this.chatRoomList.find(r => r.id === roomId)
      if (room) {
        room.newMessageCount = count
      }
    },

    clearError() {
      this.error = null
    },

    // 채팅방 목록의 마지막 메시지 업데이트
    updateChatRoomLastMessage(roomId, messageData) {
      const room = this.chatRoomList.find(r => r.id == roomId)
      if (room) {
        // 마지막 메시지 업데이트
        room.lastMessage = messageData.message
        
        // 마지막 메시지 시간 업데이트 (messageData에 있으면 사용, 없으면 현재 시간)
        if (messageData.createdAt) {
          room.lastMessageTime = messageData.createdAt
        } else if (messageData.timestamp) {
          room.lastMessageTime = messageData.timestamp
        } else {
          room.lastMessageTime = new Date().toISOString()
        }
        
        // 현재 사용자가 보낸 메시지가 아니고, 현재 접속 중인 채팅방이 아닌 경우에만 새 메시지 카운트 증가
        const currentUserEmail = localStorage.getItem('email')
        const isCurrentRoom = this.currentRoom && this.currentRoom.id == roomId
        
        if (messageData.senderEmail !== currentUserEmail && !isCurrentRoom) {
          room.newMessageCount = (room.newMessageCount || 0) + 1
          console.log(`채팅방 ${roomId}의 새 메시지 카운트가 ${room.newMessageCount}로 증가했습니다. (현재 접속 중: ${isCurrentRoom})`)
        } else {
          console.log(`채팅방 ${roomId}의 메시지는 카운트에 반영되지 않습니다. (현재 접속 중: ${isCurrentRoom})`)
        }
        
        // 해당 채팅방을 목록 맨 위로 이동 (최근 메시지 순)
        this.chatRoomList = this.chatRoomList.filter(r => r.id != roomId)
        this.chatRoomList.unshift(room)
        
        console.log('채팅방 목록 업데이트됨:', room.roomName, room.lastMessage, room.lastMessageTime, isCurrentRoom ? '(현재 접속 중)' : '')
      } else {
        console.warn(`채팅방 ${roomId}를 찾을 수 없어서 메시지를 업데이트할 수 없습니다.`)
      }
    },

    // 새 메시지 카운트 초기화 (채팅방 입장 시)
    resetMessageCount(roomId) {
      console.log(`resetMessageCount 호출됨 - roomId: ${roomId}, 타입: ${typeof roomId}`)
      console.log(`현재 채팅방 목록:`, this.chatRoomList.map(r => ({ id: r.id, type: typeof r.id, roomName: r.roomName })))
      
      const room = this.chatRoomList.find(r => r.id == roomId)
      if (room) {
        const oldCount = room.newMessageCount
        room.newMessageCount = 0
        console.log(`채팅방 ${roomId}의 새 메시지 카운트가 ${oldCount}에서 0으로 초기화되었습니다.`)
      } else {
        console.warn(`채팅방 ${roomId}를 찾을 수 없어서 메시지 카운트를 초기화할 수 없습니다.`)
        console.warn(`채팅방 목록에 있는 ID들:`, this.chatRoomList.map(r => r.id))
      }
    },

    // SSE로 새 채팅방 추가
    addNewChatRoom(roomData) {
      // 이미 존재하는 채팅방인지 확인
      const existingRoom = this.chatRoomList.find(r => r.id === roomData.id)
      if (!existingRoom) {
        const newRoom = {
          id: roomData.id,
          roomName: roomData.roomName,
          lastMessage: roomData.lastMessage || "메세지를 보내 채팅을 시작해보세요!",
          lastMessageTime: roomData.lastMessageTime,
          newMessageCount: roomData.newMessageCount || 0,
          marketPostId: roomData.marketPostId || null,
          isPurchaseApproved: roomData.isPurchaseApproved || false
        }
        this.chatRoomList.unshift(newRoom)
        console.log('새 채팅방이 SSE로 추가되었습니다:', newRoom)
      } else {
        console.log('이미 존재하는 채팅방입니다:', roomData.id)
      }
    },

    // SSE로 채팅방 정보 업데이트
    updateChatRoom(updateData) {
      const room = this.chatRoomList.find(r => r.id === updateData.id)
      if (room) {
        // 업데이트 가능한 필드들만 업데이트
        if (updateData.roomName) room.roomName = updateData.roomName
        if (updateData.lastMessage) room.lastMessage = updateData.lastMessage
        if (updateData.lastMessageTime) room.lastMessageTime = updateData.lastMessageTime
        if (updateData.newMessageCount !== undefined) room.newMessageCount = updateData.newMessageCount
        if (updateData.marketPostId !== undefined) room.marketPostId = updateData.marketPostId
        if (updateData.isPurchaseApproved !== undefined) room.isPurchaseApproved = updateData.isPurchaseApproved
        
        console.log('채팅방 정보가 SSE로 업데이트되었습니다:', room)
      }
    },

    // SSE로 상품 정보 업데이트 (결제 완료 시 상품 상태 변경)
    updateMarketPostStatus(roomId, marketPostData) {
      const room = this.chatRoomList.find(r => r.id === roomId)
      if (room && room.marketPostId) {
        // 상품 정보 업데이트 이벤트 발생
        console.log('상품 정보 업데이트 SSE 메시지 수신:', marketPostData)
        
        // 상품 정보가 변경되었음을 알리는 이벤트 발생
        // ChatRoom 컴포넌트에서 이 이벤트를 감지하여 상품 정보를 새로고침할 수 있음
        window.dispatchEvent(new CustomEvent('marketPostUpdated', {
          detail: { roomId, marketPostData }
        }))
      }
    },

    // 사용자 온라인/오프라인 상태 업데이트
    updateUserOnlineStatus(email, isOnline) {
      if (isOnline) {
        // 온라인 사용자 목록에 추가 (중복 방지)
        if (!this.onlineParticipants.includes(email)) {
          this.onlineParticipants.push(email)
        }
      } else {
        // 오프라인 사용자 목록에서 제거
        this.onlineParticipants = this.onlineParticipants.filter(e => e !== email)
      }
      
      console.log(`사용자 ${email} 온라인 상태: ${isOnline}`)
    }
  }
})
