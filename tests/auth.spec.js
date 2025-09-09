const { test, expect } = require('@playwright/test')

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('http://localhost:3000')
  })

  test.describe('회원가입 플로우', () => {
    test('회원가입 페이지 접근 및 기본 검증', async ({ page }) => {
      // 회원가입 페이지로 이동
      await page.click('text=회원가입')
      await expect(page).toHaveURL('http://localhost:3000/auth/register')
      
      // 페이지 제목 확인
      await expect(page.locator('h1')).toContainText('회원가입')
      
      // 필수 필드들이 존재하는지 확인
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[placeholder*="닉네임"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toHaveCount(2)
      await expect(page.locator('input[type="checkbox"]')).toBeVisible()
      
      // 이메일 인증 섹션이 존재하는지 확인
      await expect(page.locator('button:has-text("이메일 인증번호 발송")')).toBeVisible()
      await expect(page.locator('button:has-text("인증번호 확인")')).toBeVisible()
    })

    test('이메일 인증 기능 테스트', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/register')
      
      // 이메일 입력
      await page.fill('input[type="email"]', 'test@example.com')
      
      // 이메일 인증번호 발송 버튼이 활성화되었는지 확인
      const sendButton = page.locator('button:has-text("이메일 인증번호 발송")')
      await expect(sendButton).toBeEnabled()
      
      // 이메일 인증번호 발송 (실제로는 모킹 필요)
      await sendButton.click()
      
      // 알림창 처리
      page.on('dialog', dialog => dialog.accept())
      
      // 인증번호 입력 필드가 활성화되었는지 확인
      await expect(page.locator('input[placeholder*="인증번호"]')).toBeEnabled()
    })

    test('폼 검증 테스트', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/register')
      
      // 빈 폼 제출 시도
      await page.click('button:has-text("회원가입")')
      
      // 에러 메시지들이 표시되는지 확인
      await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible()
      await expect(page.locator('text=닉네임을 입력해주세요')).toBeVisible()
      await expect(page.locator('text=비밀번호를 입력해주세요')).toBeVisible()
    })

    test('비밀번호 정책 검증', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/register')
      
      // 약한 비밀번호 입력
      await page.fill('input[type="password"]', 'weak')
      
      // 비밀번호 정책 에러 메시지 확인
      await expect(page.locator('text=비밀번호는 8자 이상이어야 합니다')).toBeVisible()
      await expect(page.locator('text=비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')).toBeVisible()
    })
  })

  test.describe('로그인 플로우', () => {
    test('로그인 페이지 접근 및 기본 검증', async ({ page }) => {
      // 로그인 페이지로 이동
      await page.click('text=로그인')
      await expect(page).toHaveURL('http://localhost:3000/auth/login')
      
      // 페이지 제목 확인
      await expect(page.locator('h1')).toContainText('로그인')
      
      // 필수 필드들이 존재하는지 확인
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('input[type="checkbox"]')).toBeVisible()
      
      // 비밀번호 표시/숨김 버튼 확인
      await expect(page.locator('button[aria-label*="비밀번호"]')).toBeVisible()
    })

    test('비밀번호 표시/숨김 기능', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // 비밀번호 입력
      await page.fill('input[type="password"]', 'testpassword')
      
      // 비밀번호 표시 버튼 클릭
      await page.click('button[aria-label*="비밀번호"]')
      
      // 비밀번호가 텍스트로 표시되는지 확인
      await expect(page.locator('input[type="text"]')).toHaveValue('testpassword')
    })

    test('잘못된 로그인 시도', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // 잘못된 자격 증명 입력
      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      
      // 로그인 버튼 클릭
      await page.click('button:has-text("로그인")')
      
      // 에러 메시지 확인
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('이메일 또는 비밀번호가 올바르지 않습니다')
        dialog.accept()
      })
    })

    test('로그인 상태 유지 체크박스', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // 로그인 상태 유지 체크박스 확인
      const rememberMe = page.locator('input[type="checkbox"]')
      await expect(rememberMe).toBeVisible()
      
      // 체크박스 클릭
      await rememberMe.click()
      await expect(rememberMe).toBeChecked()
    })
  })

  test.describe('비밀번호 찾기 플로우', () => {
    test('비밀번호 찾기 페이지 접근', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // 비밀번호 찾기 링크 클릭
      await page.click('text=비밀번호 찾기')
      await expect(page).toHaveURL('http://localhost:3000/auth/forgot-password')
      
      // 페이지 제목 확인
      await expect(page.locator('h1')).toContainText('비밀번호 찾기')
      
      // 필수 필드 확인
      await expect(page.locator('input[placeholder*="이름"]')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })

    test('비밀번호 찾기 폼 검증', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/forgot-password')
      
      // 빈 폼 제출
      await page.click('button:has-text("임시 비밀번호 발급")')
      
      // 에러 메시지 확인
      await expect(page.locator('text=이름을 입력해주세요')).toBeVisible()
      await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible()
    })
  })

  test.describe('계정 잠금 해제 플로우', () => {
    test('계정 잠금 해제 페이지 접근', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // 계정 잠금 해제 링크 클릭
      await page.click('text=계정 잠금 해제')
      await expect(page).toHaveURL('http://localhost:3000/auth/unlock-account')
      
      // 페이지 제목 확인
      await expect(page.locator('h1')).toContainText('계정 잠금 해제')
      
      // 필수 필드 확인
      await expect(page.locator('input[placeholder*="이름"]')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })
  })

  test.describe('네비게이션 및 라우팅', () => {
    test('인증 페이지 간 네비게이션', async ({ page }) => {
      // 로그인 페이지에서 회원가입으로 이동
      await page.goto('http://localhost:3000/auth/login')
      await page.click('text=회원가입')
      await expect(page).toHaveURL('http://localhost:3000/auth/register')
      
      // 회원가입 페이지에서 로그인으로 이동
      await page.click('text=이미 계정이 있으신가요? 로그인')
      await expect(page).toHaveURL('http://localhost:3000/auth/login')
    })

    test('홈페이지로 돌아가기', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // 홈 버튼 클릭
      await page.click('text=홈')
      await expect(page).toHaveURL('http://localhost:3000/')
    })
  })

  test.describe('반응형 디자인', () => {
    test('모바일 화면에서의 레이아웃', async ({ page }) => {
      // 모바일 화면 크기로 설정
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('http://localhost:3000/auth/login')
      
      // 모바일에서도 모든 요소가 보이는지 확인
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button:has-text("로그인")')).toBeVisible()
    })

    test('태블릿 화면에서의 레이아웃', async ({ page }) => {
      // 태블릿 화면 크기로 설정
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await page.goto('http://localhost:3000/auth/register')
      
      // 태블릿에서도 모든 요소가 보이는지 확인
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[placeholder*="닉네임"]')).toBeVisible()
      await expect(page.locator('button:has-text("회원가입")')).toBeVisible()
    })
  })

  test.describe('접근성 테스트', () => {
    test('키보드 네비게이션', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // Tab 키로 필드 간 이동
      await page.keyboard.press('Tab')
      await expect(page.locator('input[type="email"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('input[type="password"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('input[type="checkbox"]')).toBeFocused()
    })

    test('스크린 리더 지원', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login')
      
      // 라벨이 제대로 연결되어 있는지 확인
      const emailInput = page.locator('input[type="email"]')
      
      await expect(emailInput).toHaveAttribute('aria-labelledby')
      // 또는 for 속성으로 연결되어 있는지 확인
    })
  })
})
