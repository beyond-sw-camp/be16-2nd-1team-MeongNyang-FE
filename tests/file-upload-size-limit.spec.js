import { test, expect } from '@playwright/test';

test.describe('File Upload Size Limit Tests', () => {
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

  test('50MB 이하 파일은 정상적으로 선택되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 파일 첨부 버튼 클릭
    const fileAttachBtn = page.locator('.file-attach-btn');
    await fileAttachBtn.click();
    
    // 작은 테스트 파일 생성 (1KB)
    const smallFile = Buffer.from('test content'.repeat(100)); // 약 1KB
    
    // 파일 입력에 작은 파일 설정
    await page.setInputFiles('input[type="file"]', {
      name: 'small-test.txt',
      mimeType: 'text/plain',
      buffer: smallFile
    });
    
    // 파일이 정상적으로 선택되었는지 확인
    await page.waitForSelector('.selected-files-preview', { timeout: 5000 });
    const selectedFiles = page.locator('.file-preview-item');
    await expect(selectedFiles).toHaveCount(1);
    
    // 파일 이름이 표시되는지 확인
    const fileName = page.locator('.file-name');
    await expect(fileName).toContainText('small-test.txt');
  });

  test('50MB 초과 파일은 선택되지 않는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 파일 첨부 버튼 클릭
    const fileAttachBtn = page.locator('.file-attach-btn');
    await fileAttachBtn.click();
    
    // 큰 테스트 파일 생성 (51MB)
    const largeFile = Buffer.alloc(51 * 1024 * 1024); // 51MB
    
    // 파일 입력에 큰 파일 설정
    await page.setInputFiles('input[type="file"]', {
      name: 'large-test.txt',
      mimeType: 'text/plain',
      buffer: largeFile
    });
    
    // 에러 메시지가 표시되는지 확인
    await page.waitForFunction(() => {
      // 에러 메시지나 경고가 표시되었는지 확인
      const errorElements = document.querySelectorAll('.v-snackbar, .v-alert, [class*="error"]');
      return errorElements.length > 0 || 
             document.body.textContent.includes('50MB') ||
             document.body.textContent.includes('초과');
    }, { timeout: 5000 });
    
    // 파일이 선택되지 않았는지 확인 (선택된 파일 미리보기가 없어야 함)
    const selectedFilesPreview = page.locator('.selected-files-preview');
    await expect(selectedFilesPreview).not.toBeVisible();
  });

  test('드래그 앤 드롭으로 50MB 초과 파일을 놓았을 때 거부되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 큰 테스트 파일 생성 (51MB)
    const largeFile = Buffer.alloc(51 * 1024 * 1024); // 51MB
    
    // 드래그 앤 드롭 시뮬레이션
    await page.evaluate((fileData) => {
      const file = new File([fileData], 'large-test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const dropEvent = new DragEvent('drop', {
        dataTransfer: dataTransfer,
        bubbles: true
      });
      
      document.dispatchEvent(dropEvent);
    }, largeFile);
    
    // 에러 메시지가 표시되는지 확인
    await page.waitForFunction(() => {
      return document.body.textContent.includes('50MB') ||
             document.body.textContent.includes('초과');
    }, { timeout: 5000 });
    
    // 파일이 선택되지 않았는지 확인
    const selectedFilesPreview = page.locator('.selected-files-preview');
    await expect(selectedFilesPreview).not.toBeVisible();
  });

  test('파일 크기 제한 안내 텍스트가 표시되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 파일 첨부 버튼 근처에 50MB 제한 텍스트가 있는지 확인
    const sizeLimitText = page.locator('.file-size-limit');
    await expect(sizeLimitText).toContainText('50MB');
    
    // 드래그 앤 드롭 영역에 파일 크기 제한 안내가 있는지 확인
    const dragDropText = page.locator('.drag-drop-content .text-caption');
    await expect(dragDropText).toContainText('50MB');
  });

  test('혼합 파일 선택 시 유효한 파일만 선택되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방 목록이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chat-room-list"]', { timeout: 10000 });
    
    // 첫 번째 채팅방 클릭
    const firstRoom = page.locator('[data-testid="chat-room-item"]').first();
    await firstRoom.click();
    
    // 파일 첨부 버튼 클릭
    const fileAttachBtn = page.locator('.file-attach-btn');
    await fileAttachBtn.click();
    
    // 작은 파일과 큰 파일을 함께 선택
    const smallFile = Buffer.from('test content'.repeat(100)); // 약 1KB
    const largeFile = Buffer.alloc(51 * 1024 * 1024); // 51MB
    
    // 여러 파일 선택 시뮬레이션
    await page.evaluate((smallFileData, largeFileData) => {
      const smallFile = new File([smallFileData], 'small-test.txt', { type: 'text/plain' });
      const largeFile = new File([largeFileData], 'large-test.txt', { type: 'text/plain' });
      
      const input = document.querySelector('input[type="file"]');
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(smallFile);
      dataTransfer.items.add(largeFile);
      input.files = dataTransfer.files;
      
      // change 이벤트 발생
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, smallFile, largeFile);
    
    // 에러 메시지가 표시되는지 확인
    await page.waitForFunction(() => {
      return document.body.textContent.includes('50MB') ||
             document.body.textContent.includes('초과');
    }, { timeout: 5000 });
    
    // 작은 파일만 선택되었는지 확인
    const selectedFiles = page.locator('.file-preview-item');
    await expect(selectedFiles).toHaveCount(1);
    
    const fileName = page.locator('.file-name');
    await expect(fileName).toContainText('small-test.txt');
  });
});
