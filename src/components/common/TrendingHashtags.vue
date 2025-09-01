<template>
  <v-card class="insight-card">
    <div class="insight-header">
      <v-icon color="#FF8B8B" size="24">mdi-pound</v-icon>
      <div class="insight-title">인기 해시태그</div>
    </div>
    <div class="hashtag-list">
      <div class="hashtag-item" v-for="tag in hashtags" :key="tag.name">
        <span class="hashtag-text">#{{ tag.name }}</span>
        <span class="hashtag-count">{{ tag.count }}회</span>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'TrendingHashtags',
  props: {
    hashtags: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>

<style scoped>
/* 인사이트 카드 */
.insight-card {
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.insight-card:last-child {
  margin-bottom: 0;
}

.insight-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.insight-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  margin-left: 12px;
}

/* 해시태그 리스트 */
.hashtag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hashtag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.hashtag-text {
  font-size: 0.875rem;
  color: #FF8B8B;
  font-weight: 500;
}

.hashtag-count {
  font-size: 0.75rem;
  color: #6B7280;
  background: #F1F5F9;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .hashtag-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
