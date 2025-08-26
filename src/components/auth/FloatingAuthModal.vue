<template>
  <v-dialog
    id="floating-auth-modal"
    v-model="dialog"
    persistent
    max-width="480"
    class="floating-auth-modal"
    :transition="false"
    :overlay="false"
  >
    <v-card class="auth-modal-card" elevation="24" rounded="xl">
      <!-- 헤더 + 탭 통합 -->
      <v-card-title class="auth-modal-header pa-8 pb-4">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <!-- 헤더 제목 제거 -->
          </div>
          
          <!-- 탭 네비게이션을 헤더 중앙에 배치 -->
          <div class="auth-tabs-container">
            <div class="auth-tabs">
              <button 
                :class="['auth-tab', { 'active': activeTab === 'login' }]"
                @click="activeTab = 'login'"
              >
                로그인
              </button>
              <button 
                :class="['auth-tab', { 'active': activeTab === 'register' }]"
                @click="activeTab = 'register'"
              >
                회원 가입
              </button>
            </div>
          </div>
          
          <v-btn
            icon
            variant="text"
            @click="closeModal"
            class="close-btn"
          >
            <v-icon size="24">mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <!-- 로그인 폼 -->
      <v-window v-model="activeTab">
        <v-window-item value="login">
          <v-card-text class="pa-8 pt-6">
            <!-- 일반 로그인 (위쪽) -->
            <v-form ref="loginFormRef" @submit.prevent="handleLogin">
              <v-text-field
                v-model="loginForm.email"
                label="이메일 주소"
                type="email"
                placeholder="이메일 주소 입력..."
                :rules="emailRules"
                :disabled="busy"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                class="mb-4"
                hide-details="auto"
                height="48"
              />

              <v-text-field
                v-model="loginForm.password"
                label="비밀번호"
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호를 입력하세요..."
                :rules="passwordRules"
                :disabled="busy"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                class="mb-4"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                hide-details="auto"
                height="48"
              />

              <!-- 계정 잠금 안내 문구 -->
              <div class="account-lock-notice mb-4">
                <v-alert
                  type="warning"
                  variant="tonal"
                  density="compact"
                  rounded="lg"
                  class="mb-0"
                >
                  <template #prepend>
                    <v-icon size="16" color="warning">mdi-alert-circle</v-icon>
                  </template>
                  <span class="text-caption">
                    <strong>보안 안내:</strong> 로그인 5번 실패 시 계정이 자동으로 잠깁니다.
                  </span>
                </v-alert>
              </div>

              <div class="d-flex justify-space-between align-center mb-6">
                <v-btn
                  variant="text"
                  color="primary"
                  :disabled="busy"
                  @click="openForgotPasswordModal"
                  class="forgot-password-btn"
                  density="compact"
                >
                  비밀번호를 잊으셨어요?
                </v-btn>
                <v-btn
                  variant="text"
                  color="primary"
                  :disabled="busy"
                  @click="openUnlockAccountModal"
                  class="unlock-account-btn"
                  density="compact"
                >
                  계정 잠금 해제
                </v-btn>
              </div>

              <v-alert
                v-if="errorMsg"
                type="error"
                variant="tonal"
                class="mb-4"
                density="compact"
                rounded="lg"
              >
                <template #prepend>
                  <v-icon>mdi-alert-circle</v-icon>
                </template>
                {{ errorMsg }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="busy"
                rounded="lg"
                height="48"
                class="mb-6"
              >
                로그인
              </v-btn>
            </v-form>

            <v-divider class="my-6">
              <span class="px-4 text-medium-emphasis">또는</span>
            </v-divider>

            <!-- OAuth 로그인 (아래쪽) -->
            <div class="oauth-section">
              <v-btn
                variant="outlined"
                block
                size="large"
                :disabled="busy"
                class="social-btn google-btn mb-3"
                height="48"
                rounded="lg"
                @click="handleOAuthLogin('google')"
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="social-icon me-3" />
                Google로 계속하기
              </v-btn>

              <v-btn
                variant="outlined"
                block
                size="large"
                :disabled="busy"
                class="social-btn kakao-btn mb-3"
                height="48"
                rounded="lg"
                @click="handleOAuthLogin('kakao')"
              >
                <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" alt="Kakao" class="social-icon me-3" />
                카카오로 계속하기
              </v-btn>

              <!-- OAuth 연동 안내 메시지 -->
              <div class="oauth-info-notice mt-4">
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  rounded="lg"
                  class="mb-0"
                >
                  <template #prepend>
                    <v-icon size="16" color="info">mdi-information</v-icon>
                  </template>
                  <span class="text-caption">
                    <strong>소셜 로그인 안내:</strong> Google/카카오 계정으로 간편하게 로그인하고, 
                    기존 계정과 연동할 수도 있습니다.
                  </span>
                </v-alert>
              </div>
            </div>
          </v-card-text>
        </v-window-item>

        <!-- 회원가입 폼 -->
        <v-window-item value="register">
          <v-card-text class="pa-8 pt-6">
            <!-- OAuth 로그인 (상단) - basic 단계에서만 표시 -->
            <div v-if="registerStep === 'basic'" class="oauth-section mb-6">
              <v-btn
                variant="outlined"
                block
                size="large"
                :disabled="busy"
                class="social-btn google-btn mb-3"
                height="48"
                rounded="lg"
                @click="handleOAuthLogin('google')"
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="social-icon me-3" />
                Google로 계속하기
              </v-btn>

              <v-btn
                variant="outlined"
                block
                size="large"
                :disabled="busy"
                class="social-btn kakao-btn mb-3"
                height="48"
                rounded="lg"
                @click="handleOAuthLogin('kakao')"
              >
                <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" alt="Kakao" class="social-icon me-3" />
                카카오로 계속하기
              </v-btn>

              <!-- OAuth 연동 안내 메시지 -->
              <div class="oauth-info-notice mt-4">
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  rounded="lg"
                  class="mb-0"
                >
                  <template #prepend>
                    <v-icon size="16" color="info">mdi-information</v-icon>
                  </template>
                  <span class="text-caption">
                    <strong>소셜 로그인 안내:</strong> Google/카카오 계정으로 간편하게 로그인하고, 
                    기존 계정과 연동할 수도 있습니다.
                  </span>
                </v-alert>
              </div>
            </div>

            <!-- 구분선 - basic 단계에서만 표시 -->
            <v-divider v-if="registerStep === 'basic'" class="my-6">
              <span class="px-4 text-medium-emphasis">또는 이메일로 계속하기</span>
            </v-divider>

            <!-- 회원가입 단계별 폼 -->
            <div v-if="registerStep === 'basic'">
              <v-form ref="registerFormRef" @submit.prevent="handleRegisterStep1">
                <v-text-field
                  v-model="registerForm.email"
                  label="이메일 주소"
                  type="email"
                  placeholder="이메일 주소 입력..."
                  :rules="emailRules"
                  :disabled="busy"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="mb-4"
                  hide-details="auto"
                  height="48"
                />

                <v-text-field
                  v-model="registerForm.password"
                  label="비밀번호"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="비밀번호를 입력하세요..."
                  :rules="passwordRules"
                  :disabled="busy"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="mb-4"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  hide-details="auto"
                  height="48"
                />

                <v-text-field
                  v-model="registerForm.confirmPassword"
                  label="비밀번호 확인"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="비밀번호를 다시 입력하세요..."
                  :rules="confirmPasswordRules"
                  :disabled="busy"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="mb-4"
                  hide-details="auto"
                  height="48"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  block
                  size="large"
                  :loading="busy"
                  rounded="lg"
                  height="48"
                  class="mb-4"
                >
                  다음 단계
                </v-btn>
              </v-form>
            </div>

            <!-- OTP 인증 단계 -->
            <div v-else-if="registerStep === 'otp'" class="verify-email-container">
              <!-- 헤더 -->
              <div class="verify-email-header">
                <v-btn
                  icon
                  variant="text"
                  @click="registerStep = 'basic'"
                  class="back-btn"
                >
                  <v-icon size="24">mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  @click="closeModal"
                  class="close-btn"
                >
                  <v-icon size="24">mdi-close</v-icon>
                </v-btn>
              </div>

              <!-- 이메일 아이콘 -->
              <div class="verify-email-icon">
                <v-icon size="32" color="white">mdi-email</v-icon>
              </div>

              <!-- 제목 -->
              <h2 class="verify-email-title">Verify Your Email</h2>

              <!-- 설명 -->
              <p class="verify-email-description">
                We've sent an email to <strong>{{ registerForm.email }}</strong> with a link to verify your email. 
                You may click the button in the email or enter the verification code below.
              </p>




            </div>

            <!-- 최종 정보 입력 단계 -->
            <div v-else-if="registerStep === 'final'">
              <div class="text-center mb-6">
                <v-icon size="48" color="success" class="mb-3">mdi-check-circle</v-icon>
                <h3 class="text-h6 font-weight-medium mb-2">이메일 인증 완료!</h3>
                <p class="text-body-2 text-medium-emphasis">
                  마지막으로 기본 정보를 입력해주세요
                </p>
              </div>

              <v-form ref="finalFormRef" @submit.prevent="handleFinalRegistration">
                <v-text-field
                  v-model="registerForm.name"
                  label="이름"
                  placeholder="실명을 입력하세요..."
                  :rules="nameRules"
                  :disabled="busy"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="mb-4"
                  hide-details="auto"
                  height="48"
                />

                <v-text-field
                  v-model="registerForm.nickname"
                  label="닉네임"
                  placeholder="닉네임을 입력하세요..."
                  :rules="nicknameRules"
                  :disabled="busy"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  class="mb-4"
                  hide-details="auto"
                  height="48"
                />

                <v-checkbox
                  v-model="registerForm.agreeTerms"
                  :rules="[v => !!v || '이용약관에 동의해주세요']"
                  color="primary"
                  density="compact"
                  class="mb-6"
                  hide-details="auto"
                >
                  <template v-slot:label>
                    <span class="text-body-2">
                      <v-btn
                        variant="text"
                        color="primary"
                        density="compact"
                        class="pa-0 text-body-2"
                        @click.stop
                      >
                        이용약관
                      </v-btn>
                      및
                      <v-btn
                        variant="text"
                        color="primary"
                        density="compact"
                        class="pa-0 text-body-2"
                        @click.stop
                      >
                        개인정보처리방침
                      </v-btn>
                      에 동의합니다
                    </span>
                  </template>
                </v-checkbox>

                <div class="d-flex gap-3">
                  <v-btn
                    variant="outlined"
                    block
                    size="large"
                    :disabled="busy"
                    rounded="lg"
                    height="48"
                    @click="registerStep = 'otp'"
                  >
                    이전
                  </v-btn>
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    :loading="busy"
                    rounded="lg"
                    height="48"
                  >
                    계정 생성
                  </v-btn>
                </div>
              </v-form>
            </div>

            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              class="mt-4"
              density="compact"
              rounded="lg"
            >
              <template #prepend>
                <v-icon>mdi-alert-circle</v-icon>
              </template>
              {{ errorMsg }}
            </v-alert>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>

  <!-- 비밀번호 찾기 모달 -->
  <v-dialog
    v-model="showForgotPasswordModal"
    :transition="false"
    :overlay="false"
    max-width="520"
    persistent
  >
    <v-card class="auth-modal-card" elevation="24" rounded="xl">
      <v-card-title class="auth-modal-header pa-8 pb-4">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <!-- 헤더 제목 제거 -->
          </div>
          <v-btn
            icon
            variant="text"
            @click="closeForgotPasswordModal"
            class="close-btn"
          >
            <v-icon size="24">mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-8 pt-6">
        <div class="text-center mb-6">
          <div class="forgot-password-icon mb-3">
            <v-icon size="32" color="white">mdi-lock-reset</v-icon>
          </div>
          <h3 class="text-h6 font-weight-semibold mb-2 text-dark">비밀번호 찾기</h3>
          <p class="text-body-2 text-medium-emphasis">
            가입한 이름과 이메일을 입력하시면 임시 비밀번호를 발송해드립니다
          </p>
        </div>

        <v-form ref="forgotPasswordFormRef" @submit.prevent="handleForgotPassword">
          <v-text-field
            v-model="forgotPasswordForm.name"
            label="이름"
            placeholder="가입한 이름을 입력하세요..."
            :rules="nameRules"
            :disabled="busy"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-4"
            hide-details="auto"
            height="48"
          />

          <v-text-field
            v-model="forgotPasswordForm.email"
            label="이메일 주소"
            type="email"
            placeholder="가입한 이메일 주소를 입력하세요..."
            :rules="emailRules"
            :disabled="busy"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-6"
            hide-details="auto"
            height="48"
          />

          <v-alert
            v-if="forgotPasswordErrorMsg"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
            rounded="lg"
          >
            <template #prepend>
              <v-icon>mdi-alert-circle</v-icon>
            </template>
            {{ forgotPasswordErrorMsg }}
          </v-alert>

          <v-alert
            v-if="forgotPasswordSuccessMsg"
            type="success"
            variant="tonal"
            class="mb-4"
            density="compact"
            rounded="lg"
          >
            <template #prepend>
              <v-icon>mdi-check-circle</v-icon>
            </template>
            {{ forgotPasswordSuccessMsg }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="busy"
            rounded="lg"
            height="48"
            class="mb-4"
          >
            임시 비밀번호 발송
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- 계정 잠금 해제 모달 -->
  <v-dialog
    v-model="showUnlockAccountModal"
    :transition="false"
    :overlay="false"
    max-width="520"
    persistent
  >
    <v-card class="auth-modal-card" elevation="24" rounded="xl">
      <v-card-title class="auth-modal-header pa-8 pb-4">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <!-- 헤더 제목 제거 -->
          </div>
          <v-btn
            icon
            variant="text"
            @click="closeUnlockAccountModal"
            class="close-btn"
          >
            <v-icon size="24">mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-8 pt-6">
        <div class="text-center mb-6">
          <div class="unlock-account-icon mb-3">
            <v-icon size="32" color="white">mdi-account-lock</v-icon>
          </div>
          <h3 class="text-h6 font-weight-semibold mb-2 text-dark">계정 잠금 해제</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            계정이 잠긴 경우 이름과 이메일을 입력하여 잠금을 해제할 수 있습니다
          </p>
          
          <!-- 계정 잠금 상세 안내 -->
          <div class="account-lock-details">
            <v-alert
              type="warning"
              variant="tonal"
              density="compact"
              rounded="lg"
              class="mb-0"
            >
              <template #prepend>
                <v-icon size="16" color="warning">mdi-information</v-icon>
              </template>
              <div class="text-left">
                <div class="text-caption font-weight-medium mb-2">🔒 계정 잠금 안내:</div>
                <ul class="text-caption mb-0" style="margin-left: 16px; padding-left: 0;">
                  <li>로그인 5번 실패 시 자동으로 계정이 잠깁니다</li>
                  <li>잠긴 계정은 보안을 위해 일시적으로 접근이 제한됩니다</li>
                  <li>이름과 이메일 확인 후 잠금을 해제할 수 있습니다</li>
                  <li>잠금 해제 후 새로운 비밀번호로 로그인하세요</li>
                </ul>
              </div>
            </v-alert>
          </div>
        </div>

        <v-form ref="unlockAccountFormRef" @submit.prevent="handleUnlockAccount">
          <v-text-field
            v-model="unlockAccountForm.name"
            label="이름"
            placeholder="가입한 이름을 입력하세요..."
            :rules="nameRules"
            :disabled="busy"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-4"
            hide-details="auto"
            height="48"
          />

          <v-text-field
            v-model="unlockAccountForm.email"
            label="이메일 주소"
            type="email"
            placeholder="잠긴 계정의 이메일 주소를 입력하세요..."
            :rules="emailRules"
            :disabled="busy"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-6"
            hide-details="auto"
            height="48"
          />

          <v-alert
            v-if="unlockAccountErrorMsg"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
            rounded="lg"
          >
            <template #prepend>
              <v-icon>mdi-alert-circle</v-icon>
            </template>
            {{ unlockAccountErrorMsg }}
          </v-alert>

          <v-alert
            v-if="unlockAccountSuccessMsg"
            type="success"
            variant="tonal"
            class="mb-4"
            density="compact"
            rounded="lg"
          >
            <template #prepend>
              <v-icon>mdi-check-circle</v-icon>
            </template>
            {{ unlockAccountSuccessMsg }}
          </v-alert>

          <v-btn
            type="submit"
            color="warning"
            block
            size="large"
            :loading="busy"
            rounded="lg"
            height="48"
            class="mb-4"
          >
            계정 잠금 해제
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- 소셜 로그인 연동 확인 모달 -->
  <v-dialog
    v-model="showSocialLinkModal"
    max-width="500"
    persistent
    class="social-link-modal"
  >
    <v-card class="pa-6" rounded="lg">
      <v-card-title class="text-h5 text-center mb-4">
        <v-icon size="32" color="primary" class="me-3">
          {{ socialLinkData?.provider === 'google' ? 'mdi-google' : 'mdi-chat' }}
        </v-icon>
        계정 연동 확인
      </v-card-title>

      <v-card-text class="text-center">
        <div class="mb-4">
          <p class="text-body-1 mb-2">
            <strong>{{ socialLinkData?.email }}</strong>으로 가입된 계정이 이미 존재합니다.
          </p>
          <p class="text-body-2 text-medium-emphasis">
            이 {{ socialLinkData?.provider === 'google' ? 'Google' : '카카오' }} 계정을 기존 계정과 연동하시겠습니까?
          </p>
        </div>

        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mb-4"
        >
          <template #prepend>
            <v-icon size="16" color="info">mdi-information</v-icon>
          </template>
          <span class="text-caption">
            <strong>연동 시:</strong> 소셜 계정으로 간편하게 로그인할 수 있습니다.
          </span>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-0">
        <v-btn
          variant="outlined"
          block
          size="large"
          @click="handleSocialLink('new')"
          class="mb-3"
          height="48"
          rounded="lg"
        >
          새 계정으로 가입
        </v-btn>
        
        <v-btn
          color="primary"
          block
          size="large"
          @click="handleSocialLink('link')"
          height="48"
          rounded="lg"
        >
          기존 계정과 연동
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- OAuth 추가정보 입력 모달 -->
  <v-dialog
    v-model="showOAuthExtraModal"
    :transition="false"
    :overlay="false"
    max-width="480"
    persistent
  >
    <v-card class="verify-email-modal-card">
      <v-card-title class="verify-email-header">
        <div class="verify-email-title">
          <v-icon size="24" color="primary" class="verify-email-icon">mdi-account-plus</v-icon>
          <span>추가정보 입력</span>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="closeOAuthExtraModal"
          class="close-btn"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="verify-email-container">
        <!-- 타이머 섹션 -->
        <div class="timer-section">
          <div class="timer-header">
            <v-icon size="20" color="warning">mdi-alert-circle</v-icon>
            <span class="timer-text">남은 시간: {{ formatTime(oauthExtraTimeLeft) }}</span>
          </div>
          <v-progress-linear
            :model-value="(oauthExtraTimeLeft / 600) * 100"
            color="warning"
            height="4"
            rounded
          ></v-progress-linear>
        </div>

        <!-- 이름 입력 -->
        <v-text-field
          v-model="oauthExtraForm.name"
          label="이름"
          placeholder="실명을 입력하세요..."
          :rules="nameRules"
          :disabled="busy"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          class="mb-4"
          hide-details="auto"
          height="48"
        />

        <!-- 닉네임 입력 -->
        <div class="nickname-section">
          <v-text-field
            v-model="oauthExtraForm.nickname"
            label="닉네임"
            placeholder="닉네임을 입력하세요..."
            :rules="nicknameRules"
            :disabled="busy"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="flex-grow-1"
            hide-details="auto"
            height="48"
          />
          <v-btn
            variant="outlined"
            color="primary"
            :disabled="busy || !oauthExtraForm.nickname"
            @click="checkNicknameDuplicate"
            rounded="lg"
            height="48"
            min-width="100"
          >
            중복확인
          </v-btn>
        </div>

        <!-- 에러/성공 메시지 -->
        <v-alert
          v-if="oauthExtraErrorMsg"
          type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
            rounded="lg"
          >
            <template #prepend>
              <v-icon>mdi-alert-circle</v-icon>
            </template>
            {{ oauthExtraErrorMsg }}
          </v-alert>

          <v-alert
            v-if="nicknameCheckResult"
            :type="nicknameCheckResult.success ? 'success' : 'error'"
            variant="tonal"
            class="mb-4"
            density="compact"
            rounded="lg"
          >
            <template #prepend>
              <v-icon :color="nicknameCheckResult.success ? 'success' : 'error'">
                {{ nicknameCheckResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
            </template>
            {{ nicknameCheckResult.message }}
          </v-alert>

          <!-- 완료 버튼 -->
          <v-btn
            color="primary"
            variant="elevated"
            block
            size="large"
            :disabled="!oauthExtraForm.name || !oauthExtraForm.nickname || nicknameCheckResult !== 'available' || busy"
            :loading="busy"
            rounded="lg"
            height="48"
            class="oauth-extra-submit-btn mb-3"
            @click="handleOAuthExtraSubmit"
          >
            완료하고 시작하기
          </v-btn>

          <!-- 건너뛰기 버튼 -->
          <v-btn
            variant="outlined"
            color="grey"
            block
            size="large"
            :disabled="busy"
            rounded="lg"
            height="48"
            class="oauth-extra-skip-btn"
            @click="handleOAuthExtraSkip"
          >
            건너뛰기
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>


</template>

<script setup>
/* eslint-disable no-undef */
import { ref, reactive, computed, watch, inject, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/services/api'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialTab: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// Composables
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

        // App.vue에서 제공하는 함수들 주입
        const openOtpModal = inject('openOtpModal')
        
        // App.vue에서 호출할 수 있도록 함수 제공
        const proceedToNextRegistrationStep = () => {
          console.log('proceedToNextRegistrationStep 호출됨')
          console.log('현재 registerStep:', registerStep.value)
          registerStep.value = 'final'
          console.log('registerStep을 final로 변경:', registerStep.value)
        }
        
        // App.vue에 함수 제공
        provide('proceedToNextRegistrationStep', proceedToNextRegistrationStep)
        
        // OTP 인증 성공 시 직접 단계 변경하는 함수도 제공
        const setOtpSuccess = () => {
          console.log('setOtpSuccess 호출됨')
          registerStep.value = 'final'
          console.log('registerStep을 final로 변경:', registerStep.value)
        }
        
        // App.vue에 함수 제공
        provide('setOtpSuccess', setOtpSuccess)

// Refs
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref(props.initialTab)
const loginFormRef = ref(null)
const registerFormRef = ref(null)
// OTP 관련 refs는 더 이상 사용하지 않음
// const otpFormRef = ref(null)
const finalFormRef = ref(null)
const showPassword = ref(false)
const busy = ref(false)
const errorMsg = ref('')
// 원래대로 ref로 관리
const registerStep = ref('basic') // 'basic', 'otp', 'final'


// 새로운 모달 상태
const showForgotPasswordModal = ref(false)
const showUnlockAccountModal = ref(false)
const showSocialLinkModal = ref(false)
const socialLinkData = ref(null)

const forgotPasswordFormRef = ref(null)
const unlockAccountFormRef = ref(null)

const forgotPasswordErrorMsg = ref('')
const forgotPasswordSuccessMsg = ref('')
const unlockAccountErrorMsg = ref('')
const unlockAccountSuccessMsg = ref('')
const oauthExtraErrorMsg = ref('')

const oauthExtraTimeLeft = ref(600) // 10분 (600초)
const nicknameCheckResult = ref(null)

// OTP 관련 변수 (resetForms에서 사용)
const otpCode = ref('')



// Forms
const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  name: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const forgotPasswordForm = reactive({
  name: '',
  email: ''
})

const unlockAccountForm = reactive({
  name: '',
  email: ''
})



// Validation rules
const emailRules = [
  v => !!v || '이메일을 입력해주세요',
  v => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다'
]

const passwordRules = [
  v => !!v || '비밀번호를 입력해주세요',
  v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
  v => /^(?=.*[A-Za-z])(?=.*\d)/.test(v) || '영문과 숫자를 포함해야 합니다'
]

const nameRules = [
  v => !!v || '이름을 입력해주세요',
  v => v.length >= 2 || '이름은 2자 이상이어야 합니다',
  v => v.length <= 20 || '이름은 20자 이하여야 합니다'
]

const nicknameRules = [
  v => !!v || '닉네임을 입력해주세요',
  v => v.length >= 2 || '닉네임은 2자 이상이어야 합니다',
  v => v.length <= 20 || '닉네임은 20자 이하여야 합니다'
]

const confirmPasswordRules = [
  v => !!v || '비밀번호 확인을 입력해주세요',
  v => v === registerForm.password || '비밀번호가 일치하지 않습니다'
]

// OTP 규칙은 더 이상 사용하지 않음
// const otpRules = [
//   v => !!v || '인증번호를 입력해주세요',
//   v => v.length === 6 || '인증번호는 6자리여야 합니다',
//   v => /^\d{6}$/.test(v) || '인증번호는 숫자 6자리여야 합니다'
// ]

// Methods
const closeModal = () => {
  try {
    console.log('🔒 모달 닫기 시작')
    
    // 먼저 모달 상태를 false로 설정
    dialog.value = false
    
    // 그 다음 폼 초기화 (에러가 발생해도 모달은 닫힘)
    resetForms()
    
    console.log('✅ 모달 닫기 완료')
  } catch (error) {
    console.error('❌ 모달 닫기 중 에러 발생:', error)
    // 에러가 발생해도 모달은 닫히도록 함
    dialog.value = false
  }
}



// 비밀번호 찾기 모달 관련 메서드
const openForgotPasswordModal = () => {
  showForgotPasswordModal.value = true
  forgotPasswordErrorMsg.value = ''
  forgotPasswordSuccessMsg.value = ''
}

const closeForgotPasswordModal = () => {
  showForgotPasswordModal.value = false
  forgotPasswordForm.name = ''
  forgotPasswordForm.email = ''
  forgotPasswordErrorMsg.value = ''
  forgotPasswordSuccessMsg.value = ''
}

const handleForgotPassword = async () => {
  const { valid } = await forgotPasswordFormRef.value?.validate()
  if (!valid) return

  busy.value = true
  forgotPasswordErrorMsg.value = ''
  forgotPasswordSuccessMsg.value = ''

  try {
    console.log('비밀번호 찾기 요청:', { name: forgotPasswordForm.name, email: forgotPasswordForm.email })
    
    // 기존 API 호출 로직 사용
    const response = await authStore.lostPassword({
      name: forgotPasswordForm.name,
      email: forgotPasswordForm.email
    })
    
    console.log('비밀번호 찾기 응답:', response)
    
    // 응답에 따라 다른 메시지 표시
    if (response?.isSuccess) {
      forgotPasswordSuccessMsg.value = '임시 비밀번호가 이메일로 발송되었습니다. 스팸함도 확인해보세요.'
    } else {
      forgotPasswordSuccessMsg.value = response?.message || '요청이 처리되었습니다. 이메일을 확인해주세요.'
    }
    
    setTimeout(() => {
      closeForgotPasswordModal()
    }, 3000)
  } catch (error) {
    console.error('비밀번호 찾기 실패:', error)
    console.error('에러 응답:', error.response?.data)
    
    // 더 자세한 에러 메시지 제공
    if (error.response?.status === 404) {
      forgotPasswordErrorMsg.value = '해당 이름과 이메일로 가입된 계정을 찾을 수 없습니다.'
    } else if (error.response?.status === 429) {
      forgotPasswordErrorMsg.value = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    } else {
      forgotPasswordErrorMsg.value = error.response?.data?.message || '비밀번호 찾기에 실패했습니다. 잠시 후 다시 시도해주세요.'
    }
  } finally {
    busy.value = false
  }
}

// 계정 잠금 해제 모달 관련 메서드
const openUnlockAccountModal = () => {
  showUnlockAccountModal.value = true
  unlockAccountErrorMsg.value = ''
  unlockAccountSuccessMsg.value = ''
}

const closeUnlockAccountModal = () => {
  showUnlockAccountModal.value = false
  unlockAccountForm.name = ''
  unlockAccountForm.email = ''
  unlockAccountErrorMsg.value = ''
  unlockAccountSuccessMsg.value = ''
}



const handleUnlockAccount = async () => {
  const { valid } = await unlockAccountFormRef.value?.validate()
  if (!valid) return

  busy.value = true
  unlockAccountErrorMsg.value = ''
  unlockAccountSuccessMsg.value = ''

  try {
    console.log('계정 잠금 해제 요청:', { name: unlockAccountForm.name, email: unlockAccountForm.email })
    
    // 기존 API 호출 로직 사용
    const response = await authStore.unlock({
      name: unlockAccountForm.name,
      email: unlockAccountForm.email
    })
    
    console.log('계정 잠금 해제 응답:', response)
    
    // 응답에 따라 다른 메시지 표시
    if (response?.isSuccess) {
      unlockAccountSuccessMsg.value = '계정 잠금이 해제되었습니다. 이제 로그인할 수 있습니다.'
    } else {
      unlockAccountSuccessMsg.value = response?.message || '계정 잠금 해제 요청이 처리되었습니다.'
    }
    
    setTimeout(() => {
      closeUnlockAccountModal()
    }, 3000)
  } catch (error) {
    console.error('계정 잠금 해제 실패:', error)
    console.error('에러 응답:', error.response?.data)
    
    // 더 자세한 에러 메시지 제공
    if (error.response?.status === 404) {
      unlockAccountErrorMsg.value = '해당 이름과 이메일로 가입된 계정을 찾을 수 없습니다.'
    } else if (error.response?.status === 400) {
      unlockAccountErrorMsg.value = '계정이 잠기지 않았거나 이미 해제되었습니다.'
    } else {
      unlockAccountErrorMsg.value = error.response?.data?.message || '계정 잠금 해제에 실패했습니다. 잠시 후 다시 시도해주세요.'
    }
  } finally {
    busy.value = false
  }
}





const resetForms = () => {
  try {
    // 로그인 폼 초기화
    loginForm.email = ''
    loginForm.password = ''
    
    // 회원가입 폼 초기화
    registerForm.email = ''
    registerForm.name = ''
    registerForm.nickname = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.agreeTerms = false
    
    // OTP 관련 변수 초기화
    otpCode.value = ''
    registerStep.value = 'basic'
    errorMsg.value = ''
    activeTab.value = 'login'
    
    console.log('✅ 폼 초기화 완료')
  } catch (error) {
    console.error('❌ 폼 초기화 중 에러 발생:', error)
    // 에러가 발생해도 모달은 닫히도록 함
  }
}

const handleLogin = async () => {
  const { valid } = await loginFormRef.value?.validate()
  if (!valid) return

  busy.value = true
  errorMsg.value = ''

  try {
    console.log('🔐 로그인 시도 시작')
    console.log('📧 이메일:', loginForm.email)
    console.log('🔑 비밀번호:', loginForm.password ? '***' : '비어있음')
    
    const result = await authStore.login({
      email: loginForm.email,
      password: loginForm.password
    })
    
    console.log('✅ 로그인 성공:', result)
    emit('success', 'login')
    closeModal()
    
    // 홈 화면으로 자동 이동
    router.push('/')
  } catch (error) {
    console.error('❌ 로그인 실패:', error)
    console.error('❌ 에러 응답:', error.response)
    console.error('❌ 에러 상태:', error.response?.status)
    console.error('❌ 에러 데이터:', error.response?.data)
    console.error('❌ 에러 메시지:', error.message)
    
    // 계정 잠금 상태 확인 및 적절한 메시지 표시
    const errorData = error.response?.data
    if (errorData?.status?.code === 423) {
      // 계정이 잠긴 경우
      errorMsg.value = '🔒 계정이 잠겼습니다. 보안을 위해 계정이 일시적으로 잠겼습니다. "계정 잠금 해제"를 클릭하여 잠금을 해제해주세요.'
    } else if (errorData?.status?.code === 429) {
      // 로그인 시도 횟수 초과
      errorMsg.value = '⚠️ 로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도하거나 "계정 잠금 해제"를 이용해주세요.'
    } else if (errorData?.status?.code === 401) {
      // 인증 실패
      errorMsg.value = '❌ 이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.'
    } else {
      // 기타 오류
      errorMsg.value = errorData?.status?.message || '로그인에 실패했습니다.'
    }
  } finally {
    busy.value = false
  }
}

const handleOAuthLogin = async (provider) => {
  const origin = window.location.origin
  
  // 콜백 URL 생성
  const cbUrl = (p) => `${origin}/oauth/${p}/redirect`
  
  try {
    // OAuth 연동 시작 메시지
    const providerName = provider === 'google' ? 'Google' : '카카오'
    console.log(`🔗 ${providerName} OAuth 연동 시작`)
    
    if (provider === 'google') {
      const client = process.env.VUE_APP_GOOGLE_CLIENT_ID
      if (!client) { 
        console.error('❌ VUE_APP_GOOGLE_CLIENT_ID 미설정')
        errorMsg.value = 'Google 로그인 설정이 완료되지 않았습니다.'
        return 
      }

      const params = new URLSearchParams({
        client_id: client,
        redirect_uri: cbUrl('google'),
        response_type: 'code',
        scope: 'openid email profile',
        state: 'google',
      })
      
      console.log('🔗 Google OAuth 리다이렉트 시작')
      window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
    } else if (provider === 'kakao') {
      const client = process.env.VUE_APP_KAKAO_CLIENT_ID // REST API 키
      if (!client) { 
        console.error('❌ VUE_APP_KAKAO_CLIENT_ID 미설정')
        errorMsg.value = '카카오 로그인 설정이 완료되지 않았습니다.'
        return 
      }

      const params = new URLSearchParams({
        client_id: client,
        redirect_uri: cbUrl('kakao'),
        response_type: 'code',
        state: 'google',
      })
      
      console.log('🔗 카카오 OAuth 리다이렉트 시작')
      window.location.assign(`https://kauth.kakao.com/oauth/authorize?${params}`)
    }
  } catch (error) {
    console.error(`❌ ${provider} OAuth 로그인 실패:`, error)
    errorMsg.value = `${provider === 'google' ? 'Google' : '카카오'} 로그인에 실패했습니다.`
  }
}

// 소셜 로그인 연동 확인 함수 (백엔드에서 필요시 호출)
const showSocialLinkConfirmation = (provider, email, name) => {
  socialLinkData.value = { provider, email, name }
  showSocialLinkModal.value = true
}

// OAuth 연동 모달 열기 (App.vue에서 호출)
// eslint-disable-next-line no-unused-vars
const openOAuthLinkModal = inject('openOAuthLinkModal', null)

// OAuth 연동 데이터가 전달되었을 때 처리
watch(() => route.query, (query) => {
  if (query.openOAuthLink === 'true' && query.provider && query.email && query.linkTicket) {
    console.log('OAuth 연동 데이터 감지:', query)
    // openOAuthLinkModal 함수를 통해 연동 모달 표시
    if (openOAuthLinkModal) {
      openOAuthLinkModal({
        provider: query.provider,
        email: query.email,
        linkTicket: query.linkTicket
      })
    } else {
      // fallback: 직접 연동 모달 표시
      showSocialLinkConfirmation(
        query.provider,
        query.email,
        query.linkTicket
      )
    }
  }
}, { immediate: true })

// 소셜 로그인 연동 처리
const handleSocialLink = async (action) => {
  try {
    if (action === 'link') {
      // 기존 계정과 연동
      console.log('🔗 기존 계정과 연동 처리')
      // TODO: 백엔드 API 호출하여 연동 처리
      showSuccessMessage('계정이 성공적으로 연동되었습니다!')
    } else {
      // 새 계정 생성
      console.log('🆕 새 계정 생성 처리')
      // TODO: 백엔드 API 호출하여 새 계정 생성
      showSuccessMessage('새 계정이 생성되었습니다!')
    }
    
    showSocialLinkModal.value = false
    socialLinkData.value = null
    
    // 홈 화면으로 이동
    router.push('/')
  } catch (error) {
    console.error('❌ 소셜 로그인 연동 실패:', error)
    errorMsg.value = '소셜 로그인 연동에 실패했습니다.'
  }
}



const handleRegisterStep1 = async () => {
  const { valid } = await registerFormRef.value?.validate()
  if (!valid) return

  busy.value = true
  errorMsg.value = ''

  try {
    // 1. 이메일 중복 확인
    try {
      await userAPI.checkEmail(registerForm.email)
      // 이메일이 사용 가능한 경우
    } catch (emailError) {
      if (emailError.response?.status === 400) {
        // 이메일 중복인 경우
        errorMsg.value = '이미 사용 중인 이메일입니다. 다른 이메일 주소를 사용해주세요.'
        
        // 이메일 필드에 포커스
        setTimeout(() => {
          const emailInput = document.querySelector('input[type="email"]')
          if (emailInput) {
            emailInput.focus()
            emailInput.select()
          }
        }, 100)
        
        return
      }
      throw emailError
    }

    // 2. OTP 발송
    try {
      await authStore.verifyEmail(registerForm.email)
      console.log('OTP 발송 완료')
      
      // OTP 모달 열기 (App.vue에서 관리)
      console.log('openOtpModal 함수 확인:', openOtpModal)
      console.log('openOtpModal 타입:', typeof openOtpModal)
      
      if (openOtpModal) {
        console.log('openOtpModal 호출 시작:', registerForm.email)
        try {
          openOtpModal(registerForm.email, registerForm.password)
          console.log('openOtpModal 호출 완료')
        } catch (error) {
          console.error('openOtpModal 호출 중 에러:', error)
        }
      } else {
        console.error('openOtpModal 함수가 App.vue에서 제대로 주입되지 않았습니다.')
      }
    } catch (otpError) {
      console.error('OTP 발송 실패:', otpError)
      errorMsg.value = '인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'
    }
  } catch (error) {
    console.error('회원가입 1단계 실패:', error)
    errorMsg.value = error.response?.data?.message || '회원가입에 실패했습니다.'
  } finally {
    busy.value = false
  }
}















const handleFinalRegistration = async () => {
  const { valid } = await finalFormRef.value?.validate()
  if (!valid) return

  busy.value = true
  errorMsg.value = ''

  try {
    // 최종 회원가입 데이터 전송
    // TODO: 백엔드 API 호출 - 이메일, 비밀번호, 이름, 닉네임
    const finalData = {
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name,
      nickname: registerForm.nickname
    }
    
    console.log('최종 회원가입 데이터:', finalData)
    
    // 성공 시 모달 닫기
    emit('success', 'register')
    closeModal()
  } catch (error) {
    console.error('최종 회원가입 실패:', error)
    errorMsg.value = error.response?.data?.message || '회원가입에 실패했습니다.'
  } finally {
    busy.value = false
  }
}



// Watch for tab changes to reset error message
watch(activeTab, () => {
  errorMsg.value = ''
  if (activeTab.value === 'register') {
    registerStep.value = 'basic'
  }
})

// Watch for dialog changes to set initial tab
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    activeTab.value = props.initialTab
    registerStep.value = 'basic'
  }
}, { immediate: true })
</script>

<style scoped>
.floating-auth-modal {
  backdrop-filter: blur(8px);
}

.auth-modal-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  max-width: 520px !important;
  width: 100%;
}

.auth-modal-header {
  background: #ffffff;
  border-bottom: none;
  box-shadow: none;
}

.modal-logo {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.close-btn {
  color: #94a3b8;
  transition: all 0.2s ease;
  background: transparent !important;
  box-shadow: none !important;
}

.close-btn:hover {
  color: #64748b;
  transform: scale(1.1);
}

.auth-tabs-container {
  padding: 0;
}

.auth-tabs {
  display: flex;
  gap: 48px;
  background: transparent;
  border: none;
}

.auth-tab {
  background: transparent;
  border: none;
  padding: 16px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.auth-tab.active {
  color: #111827;
}

.auth-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  background: #3b82f6;
  border-radius: 999px;
}

.auth-tab:hover {
  color: #111827;
}

.forgot-password-btn {
  font-size: 0.875rem;
  text-decoration: none;
}

.forgot-password-btn:hover {
  text-decoration: underline;
}

.oauth-section {
  margin-bottom: 24px;
}

.oauth-section h3 {
  color: #495057;
  margin-bottom: 16px;
}

.social-auth-section {
  margin-top: 16px;
}

.social-btn {
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #333333;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}



.social-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* 계정 잠금 안내 스타일 */
.account-lock-notice .v-alert {
  border: 1px solid rgba(245, 158, 11, 0.2);
  background: rgba(254, 243, 199, 0.3);
}

.account-lock-notice .v-alert .v-icon {
  margin-right: 8px;
}

/* OAuth 연동 안내 스타일 */
.oauth-info-notice .v-alert {
  border: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(239, 246, 255, 0.3);
}

.oauth-info-notice .v-alert .v-icon {
  margin-right: 8px;
}

.oauth-info-notice .text-caption {
  font-size: 0.75rem;
  line-height: 1.4;
}



/* Google 버튼 스타일 */
.google-btn {
  border-color: #dadce0;
  color: #5f6368;
  background: #ffffff;
}

.google-btn:hover {
  border-color: #4285f4;
  color: #4285f4;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.12);
}

/* Kakao 버튼 스타일 */
.kakao-btn {
  border-color: #fee500;
  color: #333333;
  background: #ffffff;
}

.kakao-btn:hover {
  background: #ffffff;
  color: #333333;
  border-color: #f4c430;
  box-shadow: 0 2px 8px rgba(254, 229, 0, 0.25);
}

/* Vuetify 스타일 오버라이드 */
:deep(.v-tab) {
  display: none;
}

:deep(.v-field) {
  border-radius: 12px;
}

:deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary)) !important;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .auth-modal-card {
    background: rgba(33, 37, 41, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .auth-modal-header {
    background: linear-gradient(135deg, #495057 0%, #343a40 100%);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .auth-tabs {
    background: rgba(73, 80, 87, 0.8);
  }
}

.floating-auth-modal .v-dialog {
  transition: none !important;
  transform: none !important;
}

.floating-auth-modal .v-overlay__scrim {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  backdrop-filter: blur(8px);
}

.floating-auth-modal .v-dialog__content {
  transition: none !important;
  transform: none !important;
}

/* Vuetify 기본 애니메이션 완전 제거 */
.floating-auth-modal .v-dialog--active .v-dialog__content,
.floating-auth-modal .v-dialog--inactive .v-dialog__content {
  transform: none !important;
  transition: none !important;
}

/* 모달 등장 애니메이션 - 중앙에서 확대 */
.floating-auth-modal .v-dialog--active .v-dialog__content {
  animation: modalCenterIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
}

.floating-auth-modal .v-dialog--active .v-overlay__scrim {
  animation: backdropFadeIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
}

/* 모달 사라짐 애니메이션 - 중앙에서 축소 */
.floating-auth-modal .v-dialog--inactive .v-dialog__content {
  animation: modalCenterOut 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
}

.floating-auth-modal .v-dialog--inactive .v-overlay__scrim {
  animation: backdropFadeOut 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
}

@keyframes modalCenterIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.6) !important;
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(0.9) !important;
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) !important;
  }
}

@keyframes modalCenterOut {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) !important;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.6) !important;
  }
}

@keyframes backdropFadeIn {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

@keyframes backdropFadeOut {
  0% {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
  100% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
}

/* Vuetify 기본 애니메이션 완전 차단 */
.floating-auth-modal .v-dialog,
.floating-auth-modal .v-dialog__content,
.floating-auth-modal .v-overlay__content,
.floating-auth-modal .v-overlay__scrim,
.floating-auth-modal .v-overlay__backdrop {
  transform: none !important;
  transition: none !important;
  animation: none !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}

.floating-auth-modal .v-dialog--active,
.floating-auth-modal .v-dialog--inactive,
.floating-auth-modal .v-overlay--active,
.floating-auth-modal .v-overlay--inactive {
  transform: none !important;
  transition: none !important;
  animation: none !important;
}

/* 전역 Vuetify 애니메이션 차단 */
.floating-auth-modal * {
  transition: none !important;
}

.floating-auth-modal .v-dialog__content {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
}

/* 비밀번호 찾기 & 계정 잠금 해제 버튼 스타일 */
.forgot-password-btn,
.unlock-account-btn {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: -0.025em !important;
  padding: 0 !important;
  border-radius: 0 !important;
  transition: color 0.2s ease !important;
  min-height: auto !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.forgot-password-btn {
  color: #3b82f6 !important;
}

.forgot-password-btn:hover {
  background: transparent !important;
  color: #2563eb !important;
  transform: none !important;
  text-decoration: underline !important;
}

.unlock-account-btn {
  color: #ef4444 !important;
}

.unlock-account-btn:hover {
  background: transparent !important;
  color: #dc2626 !important;
  transform: none !important;
  text-decoration: underline !important;
}

/* 모달 아이콘 스타일 */
.forgot-password-icon,
.unlock-account-icon,
.otp-email-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.forgot-password-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.unlock-account-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.otp-email-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

/* Verify Email 스타일 */
.verify-email-container {
  padding: 0;
}

.verify-email-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn,
.close-btn {
  color: #6b7280 !important;
  transition: color 0.2s ease !important;
}

.back-btn:hover,
.close-btn:hover {
  color: #374151 !important;
}

.verify-email-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.verify-email-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 16px;
}

.verify-email-description {
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
  font-size: 0.875rem;
}

.verification-code-section {
  margin-bottom: 32px;
}

.verification-code-label {
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.verification-code-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
}



.verification-code-input {
  width: 48px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  background: white;
  transition: all 0.2s ease;
}

.verification-code-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.verification-code-input.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.verification-code-input:not(:placeholder-shown) {
  border-color: #10b981;
}

.resend-email-btn {
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
  background: white !important;
  font-weight: 500 !important;
}

.resend-email-btn:hover {
  background: #f8fafc !important;
  border-color: #2563eb !important;
  color: #2563eb !important;
}

/* OTP 입력 토글 스타일 */
.verification-code-label.clickable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.verification-code-label.clickable:hover {
  color: #2563eb !important;
}

.verification-code-label.clickable .v-icon {
  transition: transform 0.2s ease;
}

.verification-code-label.clickable .v-icon.rotated {
  transform: rotate(180deg);
}

.otp-input-container {
  margin-top: 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.countdown-section {
  text-align: center;
  margin-top: 16px;
}

.countdown-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.countdown-text strong {
  color: #3b82f6;
  font-weight: 600;
}

.resend-section {
  margin-top: 16px;
}

/* OAuth 추가정보 모달 스타일 */
.timer-section {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.timer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.timer-text {
  font-weight: 600;
  color: #92400e;
  font-size: 0.875rem;
}

.nickname-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.nickname-section .v-text-field {
  flex: 1;
}

.duplicate-check-btn {
  min-width: 100px;
  white-space: nowrap;
}

.oauth-extra-submit-btn {
  margin-bottom: 12px;
}

.oauth-extra-skip-btn {
  border-color: #d1d5db;
  color: #6b7280;
}

.oauth-extra-skip-btn:hover {
  border-color: #9ca3af;
  color: #374151;
  background: #f9fafb;
}

/* 호버 효과 개선 */
.social-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.google-btn:hover {
  border-color: #4285f4;
  color: #4285f4;
  background: rgba(66, 133, 244, 0.05);
}

.kakao-btn:hover {
  background: #fee500;
  color: #333333;
  border-color: #fee500;
  box-shadow: 0 8px 25px rgba(254, 229, 0, 0.3);
}

/* 소셜 로그인 연동 모달 스타일 */
.social-link-modal .v-card {
  border-radius: 16px;
}

.social-link-modal .v-card-title {
  color: #1f2937;
  font-weight: 600;
}

.social-link-modal .v-card-text {
  color: #4b5563;
}

.social-link-modal .v-btn {
  font-weight: 500;
  text-transform: none;
}
</style>
