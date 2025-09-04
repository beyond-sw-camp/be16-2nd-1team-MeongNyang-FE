<template>
  <div 
    class="diary-item"
    :class="{ 'featured': isFeatured }"
    @click="$emit('click', diary.id)"
  >
    <v-img 
      :src="diary.thumbnail || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center'" 
      class="diary-image"
      cover
    ></v-img>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  diary: { type: Object, required: true },
  isFeatured: { type: Boolean, default: false },
});

defineEmits(['click']);
</script>

<style scoped>
.diary-item {
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.diary-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.diary-item.featured {
  grid-column: span 1;
  grid-row: span 1;
}

.diary-image {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.diary-item:hover .diary-image {
  transform: scale(1.05);
}
</style>
