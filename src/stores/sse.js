import { defineStore } from 'pinia';
import sseService from '@/services/sse';

export const useSseStore = defineStore('sse', {
  state: () => ({
    isConnected: false,
    connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
    lastMessage: null,
    error: null
  }),

  getters: {
    sseConnected: (state) => state.isConnected,
    sseConnectionStatus: (state) => state.connectionStatus,
    sseLastMessage: (state) => state.lastMessage,
    sseError: (state) => state.error,
    isConnecting: (state) => state.connectionStatus === 'connecting',
    hasError: (state) => state.connectionStatus === 'error'
  },

  actions: {
    // SSE 연결
    async connect() {
      try {
        this.connectionStatus = 'connecting';
        
        await sseService.connect();
        
        // 연결 성공 시 상태 업데이트
        this.connectionStatus = 'connected';
        this.isConnected = true;
        this.error = null;
        
        console.log('SSE connection established successfully');

      } catch (error) {
        this.error = error.message;
        this.connectionStatus = 'error';
        this.isConnected = false;
        console.error('SSE connection failed:', error);
      }
    },

    // SSE 연결 해제
    async disconnect() {
      try {
        await sseService.disconnect();
        this.connectionStatus = 'disconnected';
        this.isConnected = false;
        this.lastMessage = null;
        this.error = null;
        console.log('SSE connection disconnected');
      } catch (error) {
        this.error = error.message;
        console.error('SSE disconnection failed:', error);
      }
    },

    // 메시지 처리 (필요에 따라 확장 가능)
    handleMessage(message) {
      console.log('SSE message handled:', message);
      this.lastMessage = message;
      // 여기에 메시지 타입별 처리 로직을 추가할 수 있습니다
      // 예: 채팅 메시지, 알림, 실시간 업데이트 등
    },

    // 연결 재시도 (수동)
    async reconnect() {
      try {
        this.connectionStatus = 'connecting';
        this.error = null;
        
        await sseService.connect();
        
        this.connectionStatus = 'connected';
        this.isConnected = true;
        
        console.log('SSE manual reconnection successful');
      } catch (error) {
        this.error = error.message;
        this.connectionStatus = 'error';
        this.isConnected = false;
        console.error('SSE manual reconnection failed:', error);
      }
    },

    // 재연결 중단
    cancelReconnect() {
      sseService.cancelReconnect();
      this.connectionStatus = 'disconnected';
    }
  }
});
