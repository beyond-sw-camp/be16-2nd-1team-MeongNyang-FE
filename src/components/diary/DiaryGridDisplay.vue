<template>
  <div class="diary-grid">
    <div class="grid-container">
      <DiaryCard
        v-for="(diary, index) in diaryList"
        :key="diary.id"
        :diary="diary"
        :is-featured="index === 0"
        @click="$emit('view-diary', diary.id)"
      />
      
      <!-- 로딩 인디케이터 -->
      <div v-if="isLoading" class="loading-indicator">
        <v-progress-circular indeterminate color="#FF8B8B" size="32"></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import DiaryCard from './DiaryCard.vue';

defineProps({
  diaryList: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
});

defineEmits(['view-diary']);
</script>

<style scoped>
.diary-grid {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  grid-column: 1 / -1;
}

/* 반응형 */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .diary-grid {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
