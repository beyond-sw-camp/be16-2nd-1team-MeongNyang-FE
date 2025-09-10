<template>
  <div class="post-image-container">
    <!-- 단일 이미지인 경우 -->
    <div v-if="!mediaList || mediaList.length <= 1" class="single-image">
      <v-img 
        :src="mediaList?.[0] || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop&crop=center'" 
        class="post-image clickable-image"
        :aspect-ratio="16/9"
        max-height="500"
        contain
        @click="openImageModal(0)"
      ></v-img>
    </div>
    
    <!-- 다중 이미지인 경우 -->
    <div v-else class="multi-image-slider">
      <div class="image-slider">
        <v-img 
          :src="mediaList[currentImageIndex]" 
          class="post-image clickable-image"
          :aspect-ratio="16/9"
          max-height="500"
          contain
          @click="openImageModal(currentImageIndex)"
        ></v-img>
        
        <!-- 이미지 네비게이션 버튼 -->
        <div class="image-navigation">
          <v-btn 
            icon 
            class="nav-btn prev-btn"
            @click="previousImage"
            :disabled="currentImageIndex === 0"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn 
            icon 
            class="nav-btn next-btn"
            @click="nextImage"
            :disabled="currentImageIndex === mediaList.length - 1"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        
        <!-- 이미지 인디케이터 -->
        <div class="image-indicators">
          <div 
            v-for="(image, index) in mediaList" 
            :key="index"
            class="indicator"
            :class="{ active: index === currentImageIndex }"
            @click="currentImageIndex = index"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- 이미지 모달 -->
    <div
      v-if="showImageModal"
      class="image-modal-overlay"
      @click="closeImageModal"
    >
      <div class="image-modal-content" @click.stop>
        <img
          :src="modalImage"
          alt="이미지 상세보기"
          class="modal-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  mediaList: { type: Array, default: () => [] },
});

const currentImageIndex = ref(0);
const showImageModal = ref(false);
const modalImage = ref('');

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (props.mediaList && currentImageIndex.value < props.mediaList.length - 1) {
    currentImageIndex.value++;
  }
};

// 이미지 모달 관련 함수들
const openImageModal = (index) => {
  if (props.mediaList && props.mediaList.length > 0 && index < props.mediaList.length) {
    modalImage.value = props.mediaList[index];
    showImageModal.value = true;
    // 모달이 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden';
  }
};

const closeImageModal = () => {
  showImageModal.value = false;
  modalImage.value = '';
  // 모달이 닫힐 때 body 스크롤 복원
  document.body.style.overflow = 'auto';
};
</script>

<style scoped>
.post-image-container {
  position: relative;
  border: 2px solid #e3f2fd;
  border-radius: 8px;
  margin: 16px;
  background: #f8f9fa;
}

.single-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-image {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
}

.clickable-image {
  cursor: pointer;
}

/* 다중 이미지 슬라이더 스타일 */
.multi-image-slider {
  position: relative;
  width: 100%;
}

.image-slider {
  position: relative;
  width: 100%;
}

.image-navigation {
  position: absolute;
  top: 50%;
  left: 16px;
  right: 16px;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.6) !important;
  color: white !important;
  pointer-events: auto;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.8) !important;
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.image-indicators {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background: #FF8B8B;
  border-color: #FF8B8B;
  transform: scale(1.2);
}

.indicator:hover {
  background: #FF8B8B;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .post-image-container {
    min-height: 350px;
  }
  
  .image-slider {
    padding: 12px;
  }
  
  .image-navigation {
    left: 12px;
    right: 12px;
  }
  
  .image-indicators {
    bottom: 24px;
  }
}

/* 이미지 모달 스타일 */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 20px;
  overflow: hidden;
}

.modal-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .image-modal-content {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 15px;
  }

  .modal-image {
    max-height: 70vh;
  }
}
</style>
