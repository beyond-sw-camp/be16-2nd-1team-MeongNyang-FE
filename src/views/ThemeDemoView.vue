<template>
  <v-container fluid class="theme-demo">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>테마 시스템 데모</span>
            <ThemeToggle />
          </v-card-title>
          <v-card-text>
            <p>현재 테마: <strong>{{ currentThemeName }}</strong></p>
            <p>이 페이지는 Vuetify 테마 시스템이 모든 컴포넌트에 적용되는 것을 보여줍니다.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 색상 팔레트 섹션 -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">색상 팔레트</h2>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>브랜드 색상</v-card-title>
          <v-card-text>
            <div class="color-grid">
              <div class="color-item primary">
                <span class="color-label">Primary</span>
                <span class="color-value">#1976D2</span>
              </div>
              <div class="color-item secondary">
                <span class="color-label">Secondary</span>
                <span class="color-value">#424242</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>상태 색상</v-card-title>
          <v-card-text>
            <div class="color-grid">
              <div class="color-item success">
                <span class="color-label">Success</span>
                <span class="color-value">#4CAF50</span>
              </div>
              <div class="color-item warning">
                <span class="color-label">Warning</span>
                <span class="color-value">#FF9800</span>
              </div>
              <div class="color-item error">
                <span class="color-label">Error</span>
                <span class="color-value">#F44336</span>
              </div>
              <div class="color-item info">
                <span class="color-label">Info</span>
                <span class="color-value">#2196F3</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 버튼 컴포넌트 섹션 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">버튼 컴포넌트</h2>
      </v-col>
      
      <v-col cols="12">
        <v-card>
          <v-card-title>BaseButton 변형</v-card-title>
          <v-card-text>
            <div class="component-demo">
              <div class="demo-section">
                <h3 class="text-h6 mb-3">기본 버튼</h3>
                <div class="demo-items">
                  <BaseButton text="Primary" />
                  <BaseButton text="Secondary" color="secondary" />
                  <BaseButton text="Success" color="success" />
                  <BaseButton text="Warning" color="warning" />
                  <BaseButton text="Error" color="error" />
                  <BaseButton text="Info" color="info" />
                </div>
              </div>
              
              <div class="demo-section">
                <h3 class="text-h6 mb-3">버튼 변형</h3>
                <div class="demo-items">
                  <BaseButton text="Elevated" variant="elevated" />
                  <BaseButton text="Flat" variant="flat" />
                  <BaseButton text="Tonal" variant="tonal" />
                  <BaseButton text="Outlined" variant="outlined" />
                  <BaseButton text="Text" variant="text" />
                  <BaseButton text="Plain" variant="plain" />
                </div>
              </div>
              
              <div class="demo-section">
                <h3 class="text-h6 mb-3">버튼 크기</h3>
                <div class="demo-items">
                  <BaseButton text="X-Small" size="x-small" />
                  <BaseButton text="Small" size="small" />
                  <BaseButton text="Default" size="default" />
                  <BaseButton text="Large" size="large" />
                  <BaseButton text="X-Large" size="x-large" />
                </div>
              </div>
              
              <div class="demo-section">
                <h3 class="text-h6 mb-3">아이콘 버튼</h3>
                <div class="demo-items">
                  <BaseButton icon="mdi-heart" aria-label="좋아요" />
                  <BaseButton icon="mdi-star" color="warning" aria-label="즐겨찾기" />
                  <BaseButton icon="mdi-share" color="info" aria-label="공유" />
                  <BaseButton icon="mdi-delete" color="error" aria-label="삭제" />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 입력 필드 컴포넌트 섹션 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">입력 필드 컴포넌트</h2>
      </v-col>
      
      <v-col cols="12">
        <v-card>
          <v-card-title>BaseInput 변형</v-card-title>
          <v-card-text>
            <div class="component-demo">
              <div class="demo-section">
                <h3 class="text-h6 mb-3">기본 입력 필드</h3>
                <div class="demo-items">
                  <BaseInput
                    v-model="formData.name"
                    label="이름"
                    placeholder="이름을 입력하세요"
                    class="demo-input"
                  />
                  <BaseInput
                    v-model="formData.email"
                    label="이메일"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    class="demo-input"
                  />
                </div>
              </div>
              
              <div class="demo-section">
                <h3 class="text-h6 mb-3">입력 필드 변형</h3>
                <div class="demo-items">
                  <BaseInput
                    v-model="formData.outlined"
                    label="Outlined"
                    variant="outlined"
                    class="demo-input"
                  />
                  <BaseInput
                    v-model="formData.filled"
                    label="Filled"
                    variant="filled"
                    class="demo-input"
                  />
                  <BaseInput
                    v-model="formData.solo"
                    label="Solo"
                    variant="solo"
                    class="demo-input"
                  />
                </div>
              </div>
              
              <div class="demo-section">
                <h3 class="text-h6 mb-3">상태별 입력 필드</h3>
                <div class="demo-items">
                  <BaseInput
                    v-model="formData.success"
                    label="성공 상태"
                    :success-messages="['입력이 완료되었습니다']"
                    class="demo-input"
                  />
                  <BaseInput
                    v-model="formData.error"
                    label="오류 상태"
                    :error-messages="['필수 입력 항목입니다']"
                    class="demo-input"
                  />
                  <BaseInput
                    v-model="formData.disabled"
                    label="비활성화"
                    disabled
                    class="demo-input"
                  />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 카드 컴포넌트 섹션 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">카드 컴포넌트</h2>
      </v-col>
      
      <v-col cols="12" md="4">
        <BaseCard
          title="기본 카드"
          subtitle="카드 서브타이틀"
          content="이것은 기본 카드 컴포넌트입니다. 테마에 따라 색상이 자동으로 조정됩니다."
        >
          <template #actions>
            <BaseButton text="액션 1" size="small" />
            <BaseButton text="액션 2" variant="outlined" size="small" />
          </template>
        </BaseCard>
      </v-col>
      
      <v-col cols="12" md="4">
        <BaseCard
          title="아이콘 카드"
          subtitle="아이콘이 포함된 카드"
          :loading="cardLoading"
        >
          <template #header>
            <div class="d-flex align-center">
              <BaseIcon icon="mdi-star" color="warning" class="me-2" />
              <span>아이콘 카드</span>
            </div>
          </template>
          <template #default>
            <p>아이콘과 함께 표시되는 카드입니다.</p>
          </template>
          <template #actions>
            <BaseButton text="좋아요" icon="mdi-heart" size="small" />
          </template>
        </BaseCard>
      </v-col>
      
      <v-col cols="12" md="4">
        <BaseCard
          title="클릭 가능한 카드"
          subtitle="링크 기능이 있는 카드"
          link
          @click="handleCardClick"
        >
          <template #default>
            <p>이 카드는 클릭할 수 있습니다. 호버 효과도 적용됩니다.</p>
          </template>
        </BaseCard>
      </v-col>
    </v-row>

    <!-- 폼 필드 컴포넌트 섹션 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">폼 필드 컴포넌트</h2>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>FormField 데모</v-card-title>
          <v-card-text>
            <FormField
              v-model="formData.formField"
              label="폼 필드"
              description="이것은 FormField 컴포넌트입니다."
              placeholder="값을 입력하세요"
              required
            />
            
            <FormField
              v-model="formData.formFieldWithIcon"
              label="아이콘 폼 필드"
              prepend-icon="mdi-account"
              placeholder="사용자 이름"
              class="mt-4"
            />
            
            <FormField
              v-model="formData.formFieldWithError"
              label="오류 상태"
              :error-messages="['이 필드는 필수입니다']"
              class="mt-4"
            />
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>ButtonGroup 데모</v-card-title>
          <v-card-text>
            <ButtonGroup class="mb-4">
              <BaseButton text="왼쪽" />
              <BaseButton text="중앙" />
              <BaseButton text="오른쪽" />
            </ButtonGroup>
            
            <ButtonGroup orientation="vertical" class="mb-4">
              <BaseButton text="위" />
              <BaseButton text="중앙" />
              <BaseButton text="아래" />
            </ButtonGroup>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 타이포그래피 섹션 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">타이포그래피</h2>
      </v-col>
      
      <v-col cols="12">
        <v-card>
          <v-card-title>폰트 크기 및 굵기</v-card-title>
          <v-card-text>
            <div class="typography-demo">
              <h1 class="text-h1">제목 1 (H1)</h1>
              <h2 class="text-h2">제목 2 (H2)</h2>
              <h3 class="text-h3">제목 3 (H3)</h3>
              <h4 class="text-h4">제목 4 (H4)</h4>
              <h5 class="text-h5">제목 5 (H5)</h5>
              <h6 class="text-h6">제목 6 (H6)</h6>
              
              <p class="text-body-1">본문 텍스트 (Body 1) - 기본 본문 크기입니다.</p>
              <p class="text-body-2">본문 텍스트 (Body 2) - 작은 본문 크기입니다.</p>
              
              <p class="text-caption">캡션 텍스트 - 작은 설명 텍스트입니다.</p>
              <p class="text-overline">오버라인 텍스트 - 대문자 작은 텍스트입니다.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import BaseButton from '@/components/ui/atoms/BaseButton.vue'
import BaseInput from '@/components/ui/atoms/BaseInput.vue'
import BaseCard from '@/components/ui/atoms/BaseCard.vue'
import BaseIcon from '@/components/ui/atoms/BaseIcon.vue'
import ThemeToggle from '@/components/ui/atoms/ThemeToggle.vue'
import FormField from '@/components/ui/molecules/FormField.vue'
import ButtonGroup from '@/components/ui/molecules/ButtonGroup.vue'

export default {
  name: 'ThemeDemoView',
  components: {
    BaseButton,
    BaseInput,
    BaseCard,
    BaseIcon,
    ThemeToggle,
    FormField,
    ButtonGroup
  },
  
  setup() {
    const theme = useTheme()
    
    const formData = ref({
      name: '',
      email: '',
      outlined: '',
      filled: '',
      solo: '',
      success: '성공한 입력',
      error: '',
      disabled: '비활성화된 값',
      formField: '',
      formFieldWithIcon: '',
      formFieldWithError: ''
    })
    
    const cardLoading = ref(false)
    
    const currentThemeName = computed(() => {
      return theme.global.current.value.dark ? '다크 모드' : '라이트 모드'
    })
    
    const handleCardClick = () => {
      console.log('카드가 클릭되었습니다!')
    }
    
    return {
      formData,
      cardLoading,
      currentThemeName,
      handleCardClick
    }
  }
}
</script>

<style scoped>
.theme-demo {
  padding: 24px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  color: white;
  text-align: center;
  min-height: 80px;
  justify-content: center;
}

.color-item.primary {
  background-color: var(--v-theme-primary);
}

.color-item.secondary {
  background-color: var(--v-theme-secondary);
}

.color-item.success {
  background-color: var(--v-theme-success);
}

.color-item.warning {
  background-color: var(--v-theme-warning);
  color: black;
}

.color-item.error {
  background-color: var(--v-theme-error);
}

.color-item.info {
  background-color: var(--v-theme-info);
}

.color-label {
  font-weight: 600;
  margin-bottom: 4px;
}

.color-value {
  font-size: 0.75rem;
  opacity: 0.9;
}

.component-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.demo-section {
  border-bottom: 1px solid var(--v-border-color);
  padding-bottom: 24px;
}

.demo-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.demo-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.demo-input {
  min-width: 200px;
}

.typography-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.typography-demo h1,
.typography-demo h2,
.typography-demo h3,
.typography-demo h4,
.typography-demo h5,
.typography-demo h6 {
  margin: 0;
  color: var(--v-theme-on-surface);
}

.typography-demo p {
  margin: 0;
  color: var(--v-theme-on-surface);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .theme-demo {
    padding: 16px;
  }
  
  .demo-items {
    flex-direction: column;
    align-items: stretch;
  }
  
  .demo-input {
    min-width: auto;
  }
  
  .color-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .demo-section {
    border-color: var(--v-border-color);
  }
}
</style>
