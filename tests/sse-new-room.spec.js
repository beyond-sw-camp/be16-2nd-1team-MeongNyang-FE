import { test, expect } from '@playwright/test';

test.describe('SSE New Room Event Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태로 시작
    await page.goto('http://localhost:3000/login');
    
    // 테스트용 계정으로 로그인 (실제 테스트 환경에 맞게 수정 필요)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 로그인 완료 대기
    await page.waitForURL('**/dashboard');
  });

  test('새 채팅방이 SSE로 추가되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 초기 채팅방 개수 확인
    const initialRoomCount = await page.locator('[data-testid="chat-room-item"]').count();
    
    // SSE 이벤트 시뮬레이션 (실제로는 서버에서 보내는 이벤트)
    // 브라우저 콘솔에서 SSE 이벤트를 시뮬레이션
    await page.evaluate(() => {
      // SSE 서비스 import 및 새 채팅방 이벤트 시뮬레이션
      import('@/services/sse').then((SseService) => {
        const sseService = SseService.default;
        
        // new-room 이벤트 데이터 시뮬레이션
        const newRoomData = {
          id: 34,
          roomName: "admin와의 채팅",
          lastMessage: "메세지를 보내 채팅을 시작해보세요!",
          lastMessageTime: "2025-08-25T15:46:06.931218",
          newMessageCount: 0
        };
        
        // handleNewRoom 메서드 직접 호출
        sseService.handleNewRoom(newRoomData);
      });
    });
    
    // 새 채팅방이 추가될 때까지 대기 (최대 5초)
    await page.waitForFunction(() => {
      // 채팅 스토어에서 새 채팅방 확인
      return window.__VUE_APP__?.config?.globalProperties?.$pinia?.state?.value?.chat?.chatRoomList?.some(room => room.id === 34);
    }, { timeout: 5000 });
    
    // 채팅방 목록에서 새 채팅방 확인
    const newRoomElement = page.locator('[data-testid="chat-room-item"]').filter({ hasText: 'admin와의 채팅' });
    await expect(newRoomElement).toBeVisible();
    
    // 채팅방 개수가 1개 증가했는지 확인
    const finalRoomCount = await page.locator('[data-testid="chat-room-item"]').count();
    expect(finalRoomCount).toBe(initialRoomCount + 1);
  });

  test('중복 채팅방이 추가되지 않는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 초기 채팅방 개수 확인
    const initialRoomCount = await page.locator('[data-testid="chat-room-item"]').count();
    
    // 같은 채팅방을 두 번 추가 시도
    await page.evaluate(() => {
      import('@/services/sse').then((SseService) => {
        const sseService = SseService.default;
        
        const newRoomData = {
          id: 35,
          roomName: "테스트 채팅방",
          lastMessage: "메세지를 보내 채팅을 시작해보세요!",
          lastMessageTime: "2025-08-25T15:46:06.931218",
          newMessageCount: 0
        };
        
        // 첫 번째 추가
        sseService.handleNewRoom(newRoomData);
        
        // 두 번째 추가 (중복)
        sseService.handleNewRoom(newRoomData);
      });
    });
    
    // 잠시 대기
    await page.waitForTimeout(2000);
    
    // 채팅방 개수가 1개만 증가했는지 확인 (중복 방지)
    const finalRoomCount = await page.locator('[data-testid="chat-room-item"]').count();
    expect(finalRoomCount).toBe(initialRoomCount + 1);
  });
});
