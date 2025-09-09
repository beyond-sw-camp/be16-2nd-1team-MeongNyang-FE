import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Overlay Tests', () => {
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

  test('드래그 앤 드롭 오버레이가 채팅 메시지 영역에만 표시되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 채팅방 컨테이너 대기
    await page.waitForSelector('.chat-room-container', { timeout: 10000 });
    
    // 작은 테스트 파일 생성
    const testFile = Buffer.from('test content');
    
    // 드래그 이벤트 시뮬레이션
    await page.evaluate((fileData) => {
      const file = new File([fileData], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // 채팅방 컨테이너에 드래그 이벤트 발생
      const chatContainer = document.querySelector('.chat-room-container');
      const dragEnterEvent = new DragEvent('dragenter', {
        dataTransfer: dataTransfer,
        bubbles: true
      });
      
      chatContainer.dispatchEvent(dragEnterEvent);
    }, testFile);
    
    // 드래그 오버레이가 나타나는지 확인
    await page.waitForSelector('.drag-drop-overlay', { timeout: 5000 });
    const overlay = page.locator('.drag-drop-overlay');
    await expect(overlay).toBeVisible();
    
    // 오버레이가 채팅 메시지 영역에만 표시되는지 확인
    const overlayPosition = await overlay.boundingBox();
    const chatMessagesContainer = page.locator('.chat-messages-container');
    const containerPosition = await chatMessagesContainer.boundingBox();
    
    // 오버레이가 메시지 컨테이너 내부에 있는지 확인
    expect(overlayPosition.x).toBeGreaterThanOrEqual(containerPosition.x);
    expect(overlayPosition.y).toBeGreaterThanOrEqual(containerPosition.y);
    expect(overlayPosition.x + overlayPosition.width).toBeLessThanOrEqual(containerPosition.x + containerPosition.width);
    expect(overlayPosition.y + overlayPosition.height).toBeLessThanOrEqual(containerPosition.y + containerPosition.height);
  });

  test('드래그 앤 드롭 오버레이가 스크롤과 함께 움직이지 않는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 채팅방 컨테이너 대기
    await page.waitForSelector('.chat-room-container', { timeout: 10000 });
    
    // 작은 테스트 파일 생성
    const testFile = Buffer.from('test content');
    
    // 드래그 이벤트 시뮬레이션
    await page.evaluate((fileData) => {
      const file = new File([fileData], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const chatContainer = document.querySelector('.chat-room-container');
      const dragEnterEvent = new DragEvent('dragenter', {
        dataTransfer: dataTransfer,
        bubbles: true
      });
      
      chatContainer.dispatchEvent(dragEnterEvent);
    }, testFile);
    
    // 드래그 오버레이가 나타나는지 확인
    await page.waitForSelector('.drag-drop-overlay', { timeout: 5000 });
    
    // 스크롤 전 오버레이 위치 저장
    const overlayBefore = page.locator('.drag-drop-overlay');
    const positionBefore = await overlayBefore.boundingBox();
    
    // 채팅 메시지 컨테이너 스크롤
    const chatMessagesContainer = page.locator('.chat-messages-container');
    await chatMessagesContainer.evaluate((el) => {
      el.scrollTop = 100;
    });
    
    // 잠시 대기
    await page.waitForTimeout(1000);
    
    // 스크롤 후 오버레이 위치 확인
    const positionAfter = await overlayBefore.boundingBox();
    
    // 오버레이가 스크롤과 함께 움직이지 않았는지 확인 (position: absolute이므로)
    expect(positionAfter.x).toBe(positionBefore.x);
    expect(positionAfter.y).toBe(positionBefore.y);
  });

  test('드래그 앤 드롭 오버레이에 파일 크기 제한 안내가 표시되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 채팅방 컨테이너 대기
    await page.waitForSelector('.chat-room-container', { timeout: 10000 });
    
    // 작은 테스트 파일 생성
    const testFile = Buffer.from('test content');
    
    // 드래그 이벤트 시뮬레이션
    await page.evaluate((fileData) => {
      const file = new File([fileData], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const chatContainer = document.querySelector('.chat-room-container');
      const dragEnterEvent = new DragEvent('dragenter', {
        dataTransfer: dataTransfer,
        bubbles: true
      });
      
      chatContainer.dispatchEvent(dragEnterEvent);
    }, testFile);
    
    // 드래그 오버레이가 나타나는지 확인
    await page.waitForSelector('.drag-drop-overlay', { timeout: 5000 });
    
    // 파일 크기 제한 안내 텍스트 확인
    const sizeLimitText = page.locator('.drag-drop-content .text-caption');
    await expect(sizeLimitText).toContainText('50MB');
  });

  test('드래그 앤 드롭 오버레이가 드롭 후 사라지는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 채팅방 컨테이너 대기
    await page.waitForSelector('.chat-room-container', { timeout: 10000 });
    
    // 작은 테스트 파일 생성
    const testFile = Buffer.from('test content');
    
    // 드래그 이벤트 시뮬레이션
    await page.evaluate((fileData) => {
      const file = new File([fileData], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const chatContainer = document.querySelector('.chat-room-container');
      const dragEnterEvent = new DragEvent('dragenter', {
        dataTransfer: dataTransfer,
        bubbles: true
      });
      
      chatContainer.dispatchEvent(dragEnterEvent);
    }, testFile);
    
    // 드래그 오버레이가 나타나는지 확인
    await page.waitForSelector('.drag-drop-overlay', { timeout: 5000 });
    await expect(page.locator('.drag-drop-overlay')).toBeVisible();
    
    // 드롭 이벤트 시뮬레이션
    await page.evaluate((fileData) => {
      const file = new File([fileData], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const chatContainer = document.querySelector('.chat-room-container');
      const dropEvent = new DragEvent('drop', {
        dataTransfer: dataTransfer,
        bubbles: true
      });
      
      chatContainer.dispatchEvent(dropEvent);
    }, testFile);
    
    // 드래그 오버레이가 사라지는지 확인
    await page.waitForFunction(() => {
      return !document.querySelector('.drag-drop-overlay');
    }, { timeout: 5000 });
    
    await expect(page.locator('.drag-drop-overlay')).not.toBeVisible();
  });
});
