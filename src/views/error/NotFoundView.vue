<template>
  <div class="not-found-page">
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
          <div class="error-icon">
            <v-icon size="120" color="white">mdi-alert-circle-outline</v-icon>
          </div>
          <h1 class="hero-title">
            <span class="title-line">404</span>
            <span class="title-line">페이지를 찾을 수 없습니다</span>
          </h1>
          <p class="hero-subtitle">
            요청하신 페이지가 존재하지 않거나<br>
            이동되었을 수 있습니다.
          </p>
          
          <div class="hero-actions">
            <v-btn
              size="x-large"
              variant="elevated"
              class="hero-btn login-btn"
              @click="$router.push('/')"
            >
              <v-icon class="me-3">mdi-home</v-icon>
              홈으로 돌아가기
            </v-btn>
            <v-btn
              size="x-large"
              variant="outlined"
              class="hero-btn register-btn"
              @click="$router.go(-1)"
            >
              <v-icon class="me-3">mdi-arrow-left</v-icon>
              이전 페이지
            </v-btn>
          </div>
        </div>
        
        <!-- 이미지 영역 -->
        <div class="hero-image">
          <div class="error-illustration">
            <div class="illustration-circle">
              <v-icon size="80" color="#FF6B6B">mdi-paw</v-icon>
            </div>
            <div class="illustration-text">멍멍냥냥</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
/* 홈뷰와 동일한 스타일 */
.not-found-page {
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
  background: rgba(255, 107, 107, 0.1);
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

.error-icon {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
  margin-bottom: 32px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #111111;
}

.title-line {
  display: block;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #666666;
  margin-bottom: 40px;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0;
  transition: all 0.3s ease;
}

.login-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E) !important;
  color: white !important;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.4);
}

.register-btn {
  border: 2px solid #FF6B6B !important;
  color: #FF6B6B !important;
  background: transparent !important;
}

.register-btn:hover {
  background: #FF6B6B !important;
  color: white !important;
  transform: translateY(-2px);
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-illustration {
  text-align: center;
}

.illustration-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE5E5, #FFF0F0);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.2);
}

.illustration-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #FF6B6B;
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
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 16px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .error-icon {
    width: 120px;
    height: 120px;
  }
  
  .illustration-circle {
    width: 160px;
    height: 160px;
  }
}
</style>
