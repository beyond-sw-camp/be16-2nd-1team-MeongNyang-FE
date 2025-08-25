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
          const data = event.substring(event.indexOf('data:') + 5).trim();
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              console.log('새로운 SSE 메시지:', parsedData);
              // 여기에 메시지 처리 로직을 추가할 수 있습니다
            } catch (e) {
              console.log('SSE 메시지 (파싱 실패):', data);
            }
          }
        });
      }
    } catch (error) {
      console.error('SSE 스트림 읽기 오류:', error);
      this.isConnected = false;
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

  // 메시지 리스너 추가 (기존 EventSource 방식과의 호환성을 위해)
  addMessageListener(callback) {
    // fetch API 방식에서는 이벤트 리스너 대신 콜백을 직접 호출
    this.messageCallback = callback;
  }

  // 에러 리스너 추가 (기존 EventSource 방식과의 호환성을 위해)
  addErrorListener(callback) {
    // fetch API 방식에서는 에러 콜백을 직접 호출
    this.errorCallback = callback;
  }
}

export default new SseService();
