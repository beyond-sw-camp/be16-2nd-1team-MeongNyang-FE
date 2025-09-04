<template>
  <div class="post-image-container">
    <!-- 단일 이미지인 경우 -->
    <div v-if="!mediaList || mediaList.length <= 1" class="single-image">
      <v-img 
        :src="mediaList?.[0] || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop&crop=center'" 
        class="post-image"
        :aspect-ratio="16/9"
        max-height="500"
      ></v-img>
    </div>
    
    <!-- 다중 이미지인 경우 -->
    <div v-else class="multi-image-slider">
      <div class="image-slider">
        <v-img 
          :src="mediaList[currentImageIndex]" 
          class="post-image"
          :aspect-ratio="16/9"
          max-height="500"
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
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  mediaList: { type: Array, default: () => [] },
});

const currentImageIndex = ref(0);

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
</style>
