class SseService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.reader = null;
    this.decoder = null;
  }

  // SSE 연결 (JWT 토큰 포함)
  async connect() {
    if (this.isConnected) {
      console.log('SSE already connected');
      return;
    }

    // JWT 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('JWT 토큰이 없습니다. 로그인 상태를 확인해 주세요.');
      throw new Error('JWT 토큰이 없습니다.');
    }

    try {
      const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/sse`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태: ${response.status}`);
      }

      // 스트림을 읽어서 이벤트 처리
      this.reader = response.body.getReader();
      this.decoder = new TextDecoder();
      this.isConnected = true;

      console.log('SSE connected successfully');
      this.readStream();

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.isConnected = false;
      throw error;
    }
  }

  // 스트림 읽기
  async readStream() {
    let buffer = '';
    
    try {
      while (this.isConnected) {
        const { done, value } = await this.reader.read();
        if (done) {
          console.log('SSE 스트림이 닫혔습니다.');
          this.isConnected = false;
          break;
        }

        const chunk = this.decoder.decode(value, { stream: true });
        buffer += chunk;

        // \n\n (이벤트 구분자)를 기준으로 이벤트 파싱
        const events = buffer.split('\n\n');
        buffer = events.pop(); // 마지막 불완전한 이벤트는 버퍼에 남겨둠

        events.forEach(event => {
          // event와 data를 분리해서 파싱
          const lines = event.split('\n');
          let eventName = 'message'; // 기본값
          let data = '';
          
          lines.forEach(line => {
            if (line.startsWith('event:')) {
              eventName = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              data = line.substring(5).trim();
            }
          });
          
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              console.log(`SSE 이벤트 [${eventName}]:`, parsedData);
              
              // 이벤트 타입별로 처리
              this.handleEventByType(eventName, parsedData);
            } catch (e) {
              console.log(`SSE 이벤트 [${eventName}] (파싱 실패):`, data);
            }
          }
        });
      }
    } catch (error) {
      console.error('SSE 스트림 읽기 오류:', error);
      this.isConnected = false;
    }
  }

  // 이벤트 타입별 처리
  handleEventByType(eventName, data) {
    // event 필드가 없거나 'message'인 경우, 데이터 구조를 보고 자동으로 타입 추정
    if (eventName === 'message' || !eventName) {
      // 채팅 메시지 구조인지 확인
      if (data.chatRoomId && data.message && data.senderEmail) {
        eventName = 'chat-message';
      }
      // 새 채팅방 구조인지 확인 (roomName, lastMessage, lastMessageTime, newMessageCount 포함)
      else if (data.id && data.roomName && data.lastMessage && data.lastMessageTime) {
        eventName = 'new-room';
      }
      // 알림 구조인지 확인
      else if (data.title && data.message && (data.type || data.type === 'info')) {
        eventName = 'notification';
      }
    }

    switch (eventName) {
      case 'chat-message':
        this.handleChatMessage(data);
        break;
      case 'new-room':
        this.handleNewRoom(data);
        break;
      case 'room-update':
        this.handleRoomUpdate(data);
        break;
      case 'user-online':
        this.handleUserOnline(data);
        break;
      case 'user-offline':
        this.handleUserOffline(data);
        break;
      case 'notification':
        this.handleNotification(data);
        break;
      default:
        console.log('알 수 없는 SSE 이벤트 타입:', eventName, data);
        break;
    }
  }

  // 채팅 메시지 처리
  handleChatMessage(messageData) {
    try {
      // 채팅 스토어 import (동적 import로 순환 참조 방지)
      import('@/stores/chat').then(({ useChatStore }) => {
        const chatStore = useChatStore();
        
        // 채팅방 목록의 마지막 메시지만 업데이트 (STOMP에서 이미 메시지를 추가하므로 중복 방지)
        chatStore.updateChatRoomLastMessage(messageData.chatRoomId, messageData);
        
        console.log('SSE 채팅 메시지가 채팅방 목록에 반영되었습니다:', messageData);
      });
    } catch (error) {
      console.error('채팅 메시지 처리 중 오류:', error);
    }
  }

  // 새 채팅방 처리
  handleNewRoom(roomData) {
    try {
      import('@/stores/chat').then(({ useChatStore }) => {
        const chatStore = useChatStore();
        
        // 새 채팅방을 목록에 추가 (중복 방지)
        chatStore.addNewChatRoom(roomData);
        
        console.log('새 채팅방이 SSE로 추가되었습니다:', roomData);
        
        // 디버깅: 브라우저 콘솔에서 확인할 수 있도록 전역 함수로 노출
        if (typeof window !== 'undefined') {
          window.debugSSENewRoom = (testData) => {
            console.log('테스트용 SSE new-room 이벤트 시뮬레이션:', testData);
            this.handleNewRoom(testData);
          };
        }
      });
    } catch (error) {
      console.error('새 채팅방 처리 중 오류:', error);
    }
  }

  // 채팅방 업데이트 처리
  handleRoomUpdate(updateData) {
    try {
      import('@/stores/chat').then(({ useChatStore }) => {
        const chatStore = useChatStore();
        
        // 채팅방 정보 업데이트
        chatStore.updateChatRoom(updateData);
        
        console.log('채팅방 정보가 SSE로 업데이트되었습니다:', updateData);
      });
    } catch (error) {
      console.error('채팅방 업데이트 처리 중 오류:', error);
    }
  }

  // 사용자 온라인 처리
  handleUserOnline(userData) {
    try {
      import('@/stores/chat').then(({ useChatStore }) => {
        const chatStore = useChatStore();
        
        // 사용자 온라인 상태 업데이트
        chatStore.updateUserOnlineStatus(userData.email, true);
        
        console.log('사용자가 온라인 상태가 되었습니다:', userData.email);
      });
    } catch (error) {
      console.error('사용자 온라인 처리 중 오류:', error);
    }
  }

  // 사용자 오프라인 처리
  handleUserOffline(userData) {
    try {
      import('@/stores/chat').then(({ useChatStore }) => {
        const chatStore = useChatStore();
        
        // 사용자 오프라인 상태 업데이트
        chatStore.updateUserOnlineStatus(userData.email, false);
        
        console.log('사용자가 오프라인 상태가 되었습니다:', userData.email);
      });
    } catch (error) {
      console.error('사용자 오프라인 처리 중 오류:', error);
    }
  }

  // 알림 처리
  handleNotification(notificationData) {
    try {
      // UI 스토어 import
      import('@/stores/ui').then(({ useUIStore }) => {
        const uiStore = useUIStore();
        
        // 스낵바로 알림 표시
        uiStore.showSnackbar({
          title: notificationData.title || '알림',
          message: notificationData.message,
          type: notificationData.type || 'info'
        });
        
        console.log('SSE 알림이 표시되었습니다:', notificationData);
      });
    } catch (error) {
      console.error('알림 처리 중 오류:', error);
    }
  }

  // SSE 연결 해제
  disconnect() {
    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
    }
    this.isConnected = false;
    console.log('SSE disconnected');
  }

  // 연결 상태 확인
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SseService();
