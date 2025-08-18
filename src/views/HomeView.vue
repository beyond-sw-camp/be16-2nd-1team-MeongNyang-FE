<template>
  <div class="home-view">
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-line">멍멍냥냥에</span>
            <span class="title-line">오신 것을 환영합니다!</span>
          </h1>
          <p class="hero-subtitle">
            반려동물과 함께하는 즐거운 커뮤니티입니다.
            <br>다이어리, 마켓플레이스, 채팅 등 다양한 기능을 이용해보세요!
          </p>
          
          <div class="hero-actions">
            <v-btn
              v-if="!isLoggedIn"
              size="x-large"
              variant="elevated"
              class="hero-btn login-btn"
              @click="$router.push('/auth/login')"
            >
              <v-icon class="me-3">mdi-login</v-icon>
              로그인
            </v-btn>
            <v-btn
              v-if="!isLoggedIn"
              size="x-large"
              variant="outlined"
              class="hero-btn register-btn"
              @click="$router.push('/auth/register')"
            >
              <v-icon class="me-3">mdi-account-plus</v-icon>
              회원가입
            </v-btn>
            <v-btn
              v-if="isLoggedIn"
              size="x-large"
              variant="elevated"
              class="hero-btn dashboard-btn"
              @click="$router.push('/dashboard')"
            >
              <v-icon class="me-3">mdi-view-dashboard</v-icon>
              대시보드로 이동
            </v-btn>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="pet-illustrations">
            <div class="pet pet-dog">
              <span class="emoji">🐕</span>
            </div>
            <div class="pet pet-cat">
              <span class="emoji">🐱</span>
            </div>
            <div class="pet pet-bird">
              <span class="emoji">🦜</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 기능 소개 섹션 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">주요 기능</h2>
        <div class="features-grid">
          <div class="feature-card palette-pet">
            <div class="feature-icon">
              <v-icon size="48">mdi-paw</v-icon>
            </div>
            <h3 class="feature-title">반려동물 관리</h3>
            <p class="feature-description">
              반려동물의 정보를 체계적으로 관리하고 건강 상태를 추적해보세요.
            </p>
          </div>
          
          <div class="feature-card palette-diary">
            <div class="feature-icon">
              <v-icon size="48">mdi-book-open</v-icon>
            </div>
            <h3 class="feature-title">다이어리</h3>
            <p class="feature-description">
              반려동물과의 특별한 순간들을 기록하고 추억을 남겨보세요.
            </p>
          </div>
          
          <div class="feature-card palette-market">
            <div class="feature-icon">
              <v-icon size="48">mdi-store</v-icon>
            </div>
            <h3 class="feature-title">마켓플레이스</h3>
            <p class="feature-description">
              반려동물 용품을 거래하고 필요한 물건을 찾아보세요.
            </p>
          </div>
          
          <div class="feature-card palette-community">
            <div class="feature-icon">
              <v-icon size="48">mdi-chat</v-icon>
            </div>
            <h3 class="feature-title">커뮤니티</h3>
            <p class="feature-description">
              다른 반려동물 가족들과 소통하고 정보를 공유해보세요.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 통계 섹션 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">1000+</div>
            <div class="stat-label">활성 사용자</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5000+</div>
            <div class="stat-label">등록된 반려동물</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">10000+</div>
            <div class="stat-label">공유된 다이어리</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">거래된 상품</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HomeView',
  setup() {
    const authStore = useAuthStore()
    
    const isLoggedIn = computed(() => authStore.isAuthenticated)
    
    return {
      isLoggedIn
    }
  }
}
</script>

<style scoped>
/* 홈뷰 전체 스타일 */
.home-view {
  min-height: 100vh;
}

/* 히어로 섹션 */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%);
  z-index: -2;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.0);
  z-index: -1;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  z-index: 1;
}

.hero-text {
  color: #111111;
  text-align: left;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.title-line {
  display: block;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 48px;
  opacity: 0.95;
  color: #4B5563;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-btn {
  border-radius: 16px;
  font-weight: 600;
  padding: 16px 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  line-height: 1;
  text-transform: none;
}

.hero-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.login-btn {
  background: linear-gradient(135deg, #FF8B8B 0%, #FF6B6B 100%) !important;
  color: #fff !important;
}

.register-btn {
  border: 2px solid #FF8B8B;
  color: #FF8B8B !important;
  background: transparent !important;
}

.register-btn:hover {
  background: #FF8B8B !important;
  color: #ffffff !important;
}

.dashboard-btn {
  background: linear-gradient(135deg, #FF8B8B 0%, #FF6B6B 100%) !important;
}

/* 히어로 비주얼 */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pet-illustrations {
  position: relative;
  width: 300px;
  height: 300px;
}

.pet {
  position: absolute;
  font-size: 80px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  animation: bounce 3s ease-in-out infinite;
}

.pet-dog {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.pet-cat {
  bottom: 0;
  left: 20%;
  animation-delay: 1s;
}

.pet-bird {
  bottom: 0;
  right: 20%;
  animation-delay: 2s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 기능 소개 섹션 */
.features-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF !important;
  margin-bottom: 64px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: #FFFFFF;
  padding: 40px 32px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 팔레트 변형: 카드별 배경/아이콘/텍스트 컬러 차별화 */
.palette-pet { background: linear-gradient(135deg, #FFF5F5 0%, #FFECEC 100%); }
.palette-pet .feature-icon { background: linear-gradient(135deg, #FFE3E3 0%, #FFD6D6 100%); }
.palette-pet .feature-title { color: #7F1D1D; }

.palette-diary { background: linear-gradient(135deg, #F5FFF7 0%, #ECFFEE 100%); }
.palette-diary .feature-icon { background: linear-gradient(135deg, #DFFBE5 0%, #CCF7D5 100%); }
.palette-diary .feature-title { color: #065F46; }

.palette-market { background: linear-gradient(135deg, #F5F8FF 0%, #ECF2FF 100%); }
.palette-market .feature-icon { background: linear-gradient(135deg, #DDE7FF 0%, #CCD9FF 100%); }
.palette-market .feature-title { color: #1E3A8A; }

.palette-community { background: linear-gradient(135deg, #FFF9F0 0%, #FFF2E0 100%); }
.palette-community .feature-icon { background: linear-gradient(135deg, #FFE6C7 0%, #FFD8A8 100%); }
.palette-community .feature-title { color: #9A3412; }

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 139, 139, 0.06), transparent);
  transition: left 0.5s;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

.feature-icon {
  margin-bottom: 24px;
  display: inline-block;
  padding: 20px;
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE8D6 100%);
  border-radius: 20px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 16px;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #475569;
}

/* 통계 섹션 */
.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #FFFAF0 0%, #FFF7EC 100%);
  color: #1E293B;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 48px;
  text-align: center;
}

.stat-item {
  padding: 32px 16px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: #0F172A;
}

.stat-label {
  font-size: 1.125rem;
  opacity: 0.9;
  font-weight: 500;
  color: #334155;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .pet-illustrations {
    width: 250px;
    height: 250px;
  }
  
  .pet {
    font-size: 60px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 0 16px;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  /* 다크 모드에서도 동일 팔레트 유지 */
  .features-section {
    background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
  }
  .feature-card {
    background: #FFFFFF;
    border-color: rgba(0, 0, 0, 0.06);
  }
  .feature-title { color: #1E293B; }
  .feature-description { color: #475569; }
  .section-title { color: #FFFFFF !important; }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .shape,
  .pet,
  .hero-btn,
  .feature-card {
    animation: none;
    transition: none;
  }
  
  .hero-btn:hover,
  .feature-card:hover {
    transform: none;
  }
}
</style>
