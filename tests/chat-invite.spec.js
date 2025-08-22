import { test, expect } from '@playwright/test';

test.describe('채팅 초대 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('http://localhost:3000/login');
    
    // 로그인
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat');
    
    // 채팅방이 로드될 때까지 대기
    await page.waitForSelector('.chat-room-container', { timeout: 10000 });
  });

  test('초대하기 버튼 클릭 시 초대 다이얼로그가 열리는지 확인', async ({ page }) => {
    // 초대하기 버튼 클릭
    await page.click('button[aria-label="초대하기"]');
    
    // 초대 다이얼로그가 표시되는지 확인
    await expect(page.locator('text=초대하기')).toBeVisible();
    
    // 탭들이 표시되는지 확인
    await expect(page.locator('text=이메일 검색')).toBeVisible();
    await expect(page.locator('text=팔로워')).toBeVisible();
    await expect(page.locator('text=팔로잉')).toBeVisible();
  });

  test('팔로워 탭에서 사용자 목록이 표시되는지 확인', async ({ page }) => {
    // 초대하기 버튼 클릭
    await page.click('button[aria-label="초대하기"]');
    
    // 팔로워 탭 클릭
    await page.click('text=팔로워');
    
    // 팔로워 검색 필드가 표시되는지 확인
    await expect(page.locator('input[placeholder="이름이나 이메일로 검색하세요"]')).toBeVisible();
    
    // 새로고침 버튼이 표시되는지 확인
    await expect(page.locator('button[aria-label="새로고침"]')).toBeVisible();
  });

  test('팔로잉 탭에서 사용자 목록이 표시되는지 확인', async ({ page }) => {
    // 초대하기 버튼 클릭
    await page.click('button[aria-label="초대하기"]');
    
    // 팔로잉 탭 클릭
    await page.click('text=팔로잉');
    
    // 팔로잉 검색 필드가 표시되는지 확인
    await expect(page.locator('input[placeholder="이름이나 이메일로 검색하세요"]')).toBeVisible();
    
    // 새로고침 버튼이 표시되는지 확인
    await expect(page.locator('button[aria-label="새로고침"]')).toBeVisible();
  });

  test('이메일 검색 탭에서 사용자 검색이 작동하는지 확인', async ({ page }) => {
    // 초대하기 버튼 클릭
    await page.click('button[aria-label="초대하기"]');
    
    // 이메일 검색 탭이 기본으로 선택되어 있는지 확인
    await expect(page.locator('text=이메일 검색')).toHaveClass(/v-tab--selected/);
    
    // 검색 필드에 이메일 입력
    await page.fill('input[placeholder="이메일로 검색하세요"]', 'test@example.com');
    
    // 검색 필드가 제대로 입력되었는지 확인
    await expect(page.locator('input[placeholder="이메일로 검색하세요"]')).toHaveValue('test@example.com');
  });

  test('초대 다이얼로그 닫기 시 모든 필드가 초기화되는지 확인', async ({ page }) => {
    // 초대하기 버튼 클릭
    await page.click('button[aria-label="초대하기"]');
    
    // 각 탭에서 검색어 입력
    await page.fill('input[placeholder="이메일로 검색하세요"]', 'test@example.com');
    await page.click('text=팔로워');
    await page.fill('input[placeholder="이름이나 이메일로 검색하세요"]', 'follower');
    await page.click('text=팔로잉');
    await page.fill('input[placeholder="이름이나 이메일로 검색하세요"]', 'following');
    
    // 다이얼로그 닫기
    await page.click('button[aria-label="닫기"]');
    
    // 다시 초대하기 버튼 클릭
    await page.click('button[aria-label="초대하기"]');
    
    // 모든 검색 필드가 비어있는지 확인
    await expect(page.locator('input[placeholder="이메일로 검색하세요"]')).toHaveValue('');
    await page.click('text=팔로워');
    await expect(page.locator('input[placeholder="이름이나 이메일로 검색하세요"]')).toHaveValue('');
    await page.click('text=팔로잉');
    await expect(page.locator('input[placeholder="이름이나 이메일로 검색하세요"]')).toHaveValue('');
  });
});
