<template>
  <div>
    <div class="engagement-bar">
      <div class="engagement-left">
        <v-btn 
          icon 
          size="x-small" 
          class="like-btn" 
          @click="$emit('toggle-like')"
          :disabled="isLikeProcessing"
        >
          <v-icon 
            v-if="!isLikeProcessing" 
            :color="isLiked ? 'red' : '#1E293B'" 
            size="20"
          >
            mdi-heart
          </v-icon>
          <v-progress-circular 
            v-else 
            indeterminate 
            size="16" 
            width="2" 
            color="#FF8B8B"
          ></v-progress-circular>
        </v-btn>
        <span class="like-count">{{ likeCount || 0 }}</span>
        <v-btn 
          icon 
          size="x-small" 
          class="comment-btn" 
          @click="$emit('toggle-comments-modal')"
        >
          <v-icon color="#1E293B" size="20">mdi-comment-outline</v-icon>
        </v-btn>
        <span class="comment-count">{{ commentsCount }}</span>
      </div>
    </div>

    <!-- 좋아요 정보 -->
    <div class="likes-info">
      <span 
        class="likes-text clickable" 
        @click="$emit('handle-likes-text-click')"
      >
        {{ likesText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  likeCount: Number,
  commentsCount: Number,
  isLiked: Boolean,
  isLikeProcessing: Boolean,
});

const emit = defineEmits([
  'toggle-like',
  'toggle-comments-modal',
  'handle-likes-text-click',
]);

// Dummy usage to satisfy ESLint
// eslint-disable-next-line no-unused-vars
const _props = props;
// eslint-disable-next-line no-unused-vars
const _emit = emit;

const likesText = computed(() => {
  const count = props.likeCount || 0;
  if (count === 0) return '좋아요를 눌러보세요';
  if (count === 1) return '1명이 좋아합니다';
  return `${count}명이 좋아합니다`;
});
</script>

<style scoped>
.engagement-bar {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.engagement-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.like-btn, .comment-btn {
  color: #1E293B;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  padding: 4px;
}

.like-btn:hover, .comment-btn:hover {
  background: transparent !important;
  transform: scale(1.05);
  color: #FF8B8B;
}

.like-count, .comment-count {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  margin-right: 20px;
}

.likes-info {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.likes-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1E293B;
  cursor: default;
}

.likes-text.clickable {
  cursor: pointer;
  transition: color 0.3s ease;
}

.likes-text.clickable:hover {
  color: #FF8B8B;
}

@media (max-width: 768px) {
  .engagement-bar,
  .likes-info {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
