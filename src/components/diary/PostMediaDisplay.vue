<template>
  <div class="post-image-container">
    <!-- 단일 이미지인 경우 -->
    <div v-if="!mediaList || mediaList.length <= 1" class="single-image">
      <v-img 
        :src="mediaList?.[0] || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop&crop=center'" 
        class="post-image"
        cover
      ></v-img>
    </div>
    
    <!-- 다중 이미지인 경우 -->
    <div v-else class="multi-image-slider">
      <div class="image-slider">
        <v-img 
          :src="mediaList[currentImageIndex]" 
          class="post-image"
          cover
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
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 500px;
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
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.7) !important;
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .post-image {
    height: 400px;
  }
}
</style>
