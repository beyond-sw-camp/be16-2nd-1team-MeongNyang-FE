import { test, expect } from '@playwright/test'

test.describe('채팅 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('http://localhost:3000')
    
    // 로그인이 필요한 경우 로그인 처리
    const loginButton = page.locator('text=로그인')
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await page.waitForURL('**/auth/login')
      
      // 로그인 폼 작성 (테스트용 계정 정보 필요)
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      
      // 로그인 완료 후 대기
      await page.waitForURL('**/dashboard')
    }
  })

  test('채팅 목록 페이지가 제대로 로드되는지 확인', async ({ page }) => {
    // 채팅 링크 클릭
    await page.click('text=채팅')
    await page.waitForURL('**/chat')
    
    // 채팅 목록 페이지 제목 확인
    await expect(page.locator('text=내 채팅방 목록')).toBeVisible()
    
    // 새 채팅방 생성 버튼 확인
    await expect(page.locator('button[icon="mdi-plus"]')).toBeVisible()
  })

  test('새 채팅방 생성 모달이 제대로 작동하는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat')
    
    // 새 채팅방 생성 버튼 클릭
    await page.click('button[icon="mdi-plus"]')
    
    // 모달이 표시되는지 확인
    await expect(page.locator('text=새로운 채팅방 생성')).toBeVisible()
    
    // 방 제목 입력 필드 확인
    await expect(page.locator('label=방 제목')).toBeVisible()
    
    // 취소 버튼 클릭으로 모달 닫기
    await page.click('text=취소')
    
    // 모달이 닫혔는지 확인
    await expect(page.locator('text=새로운 채팅방 생성')).not.toBeVisible()
  })

  test('채팅방이 없을 때 빈 상태 메시지가 표시되는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat')
    
    // 빈 상태 메시지 확인
    await expect(page.locator('text=아직 참여 중인 채팅방이 없습니다.')).toBeVisible()
    
    // 첫 번째 채팅방 만들기 버튼 확인
    await expect(page.locator('text=첫 번째 채팅방 만들기')).toBeVisible()
  })

  test('채팅방 생성 시 유효성 검사가 작동하는지 확인', async ({ page }) => {
    // 채팅 페이지로 이동
    await page.goto('http://localhost:3000/chat')
    
    // 새 채팅방 생성 버튼 클릭
    await page.click('button[icon="mdi-plus"]')
    
    // 빈 제목으로 생성 시도
    await page.click('text=생성')
    
    // 에러 메시지 확인
    await expect(page.locator('text=방 제목을 입력해주세요.')).toBeVisible()
  })
})
