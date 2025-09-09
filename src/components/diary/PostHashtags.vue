<template>
  <div class="hashtags" v-if="hashTagList && hashTagList.length > 0">
    <span 
      v-for="tag in hashTagList" 
      :key="tag" 
      class="hashtag"
      @click="$emit('search-by-hashtag', tag)"
    >
      #{{ tag }}
    </span>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  hashTagList: { type: Array, default: () => [] },
});

defineEmits(['search-by-hashtag']);
</script>

<style scoped>
.hashtags {
  padding: 8px 20px 20px 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hashtag {
  color: #FF8B8B;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 139, 139, 0.05);
  border: 1px solid rgba(255, 139, 139, 0.1);
}

.hashtag:hover {
  background: rgba(255, 139, 139, 0.1);
  border-color: rgba(255, 139, 139, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
}

@media (max-width: 768px) {
  .hashtags {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
