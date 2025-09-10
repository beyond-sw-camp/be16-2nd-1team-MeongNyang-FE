// import { useAuthStore } from '@/stores/auth';

class SseService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.reader = null;
    this.decoder = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1초
    this.reconnectTimer = null;
  }

  // SSE 연결 (JWT 토큰 포함)
  async connect() {
    // const authStore = useAuthStore();

    // if (!authStore.isLoggedIn) {
    //   console.log('사용자가 로그인되어 있지 않아 SSE 연결을 시도하지 않습니다.');
    //   return;
    // }

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
      this.reconnectAttempts = 0; // 연결 성공 시 재연결 시도 횟수 초기화
      this.readStream();

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.isConnected = false;
      this.scheduleReconnect();
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
          this.scheduleReconnect();
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
      this.scheduleReconnect();
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
      // 알림 구조인지 확인 (다양한 필드명 지원)
      else if ((data.content || data.message || data.title) && 
               (data.alarmType || data.type || data.alarm_type)) {
        eventName = 'notification';
      }
      // 구매 승인 상태 변경인지 확인
      else if (data.roomId && data.isPurchaseApproved !== undefined) {
        eventName = 'approval-status';
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
      case 'approval-status':
        this.handleApprovalStatus(data);
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
      // 알림 스토어와 UI 스토어 import
      Promise.all([
        import('@/stores/alarm'),
        import('@/stores/ui')
      ]).then(([{ useAlarmStore }, { useUIStore }]) => {
        const alarmStore = useAlarmStore();
        const uiStore = useUIStore();
        
        // 알림 스토어에 새 알림 추가
        alarmStore.addAlarm(notificationData);
        
        // 스낵바로 알림 표시
        uiStore.showSnackbar({
          title: '새 알림',
          message: notificationData.content || notificationData.message || notificationData.title || '새로운 알림이 있습니다',
          type: 'info'
        });
        
        console.log('SSE 알림이 처리되었습니다:', notificationData);
      });
    } catch (error) {
      console.error('알림 처리 중 오류:', error);
    }
  }

  // 구매 승인 상태 변경 처리
  handleApprovalStatus(approvalData) {
    try {
      // 채팅 스토어 import
      import('@/stores/chat').then(({ useChatStore }) => {
        const chatStore = useChatStore();
        
        // 채팅방 정보 업데이트
        chatStore.updateChatRoom({
          id: approvalData.roomId,
          isPurchaseApproved: approvalData.isPurchaseApproved
        });
        
        console.log('구매 승인 상태가 SSE로 업데이트되었습니다:', approvalData);
      });
    } catch (error) {
      console.error('구매 승인 상태 처리 중 오류:', error);
    }
  }

  // 재연결 스케줄링
  scheduleReconnect() {
    // 이미 재연결이 스케줄되어 있으면 중복 호출 방지
    if (this.reconnectTimer) {
      console.log('SSE 재연결이 이미 스케줄되어 있습니다. 중복 호출을 무시합니다.');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('SSE 최대 재연결 시도 횟수에 도달했습니다. 재연결을 중단합니다.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 지수 백오프
    
    console.log(`SSE 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`);
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null; // 타이머 완료 시 null로 설정
      try {
        await this.connect();
      } catch (error) {
        console.error('SSE 재연결 실패:', error);
        // 재연결 실패 시 다시 스케줄링
        this.scheduleReconnect();
      }
    }, delay);
  }

  // 재연결 중단
  cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  // SSE 연결 해제
  async disconnect() {
    this.cancelReconnect(); // 재연결 중단
    
    // 서버에 SSE 연결 해제 알림 (선택적)
    try {
      await this.notifyServerDisconnect();
    } catch (error) {
      console.warn('SSE 서버 disconnect 알림 실패:', error);
      // 서버 알림 실패해도 클라이언트 disconnect는 진행
    }
    
    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
    }
    this.isConnected = false;
    console.log('SSE disconnected');
  }

  // 서버에 SSE 연결 해제 알림
  async notifyServerDisconnect() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return; // 토큰이 없으면 서버 알림 생략
    }

    try {
      const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/sse`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`SSE disconnect API 오류: ${response.status}`);
      }

      console.log('SSE 서버 disconnect 알림 완료');
    } catch (error) {
      console.error('SSE 서버 disconnect 알림 실패:', error);
      throw error;
    }
  }

  // 연결 상태 확인
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SseService();
