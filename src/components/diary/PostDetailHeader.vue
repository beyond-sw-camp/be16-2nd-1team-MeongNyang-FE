<template>
  <div class="post-header">
    <div class="profile-info">
      <v-avatar 
        size="40" 
        class="profile-avatar clickable"
        @click="$emit('go-to-user-diary', postData?.userId)"
      >
        <v-img 
          :src="postData?.petImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center&q=90'" 
          cover
        ></v-img>
      </v-avatar>
      <div class="user-info">
        <span class="username clickable" @click="$emit('go-to-user-diary', postData?.userId)">{{ postData?.userName || postData?.petName || '로딩 중...' }}</span>
        <span class="date">{{ postData?.date || '로딩 중...' }}</span>
      </div>
    </div>
    <!-- 팔로우/언팔로우 버튼 (내 게시글이 아닌 경우에만) -->
    <div v-if="postData?.userId !== currentUserId" class="follow-section">
      <v-btn
        v-if="!postData?.isFollowing"
        size="small"
        variant="filled"
        color="#FF8B8B"
        class="follow-btn"
        @click="$emit('follow-user')"
        :disabled="followProcessing"
        :loading="followProcessing"
      >
        팔로우
      </v-btn>
      <v-btn
        v-else
        size="small"
        variant="outlined"
        color="#6c757d"
        class="unfollow-btn"
        @click="$emit('unfollow-user')"
        :disabled="followProcessing"
        :loading="followProcessing"
      >
        팔로잉
      </v-btn>
    </div>
    <!-- 포스트 옵션 메뉴 -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon size="x-small" class="options-btn" v-bind="props">
          <v-icon color="#1E293B" size="18">mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list class="options-menu">
        <template v-if="postData?.userId === currentUserId">
          <v-list-item @click="$emit('edit-post')" class="menu-item">
            <v-list-item-title class="menu-text">수정</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('show-delete-confirm')" class="menu-item">
            <v-list-item-title class="menu-text delete-text">삭제</v-list-item-title>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item @click="$emit('report-post')" class="menu-item">
            <v-list-item-title class="menu-text report-text">신고</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  postData: Object,
  currentUserId: [String, Number],
  followProcessing: Boolean,
});

defineEmits([
  'go-to-user-diary',
  'follow-user',
  'unfollow-user',
  'edit-post',
  'show-delete-confirm',
  'report-post',
]);
</script>

<style scoped>
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  border: 2px solid #FF8B8B;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
  overflow: hidden;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  text-align: left;
}

.username {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a1a;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.date {
  font-size: 0.8rem;
  color: #666;
}

.options-btn {
  color: #1E293B;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  padding: 4px;
}

.options-btn:hover {
  background: transparent !important;
  transform: scale(1.05);
  color: #FF8B8B;
}

.follow-section {
  margin-right: 4px;
  margin-left: auto; /* 오른쪽 정렬 */
}

.follow-btn {
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 20px;
  text-transform: none;
  color: white !important;
  background-color: #FF8B8B !important;
}

.follow-btn :deep(.v-btn__content) {
  color: white !important;
}

.unfollow-btn {
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 20px;
  text-transform: none;
}

/* 더보기 메뉴 스타일 */
.options-menu {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.15);
  min-width: 120px;
  padding: 8px 0;
}

.menu-item {
  padding: 12px 20px;
  transition: all 0.3s ease;
  text-align: center;
  justify-content: center;
}

.menu-item:hover {
  background: linear-gradient(135deg, rgba(255, 139, 139, 0.08) 0%, rgba(255, 193, 193, 0.08) 100%);
  transform: translateY(-1px);
}

.menu-text {
  font-size: 0.9rem;
  color: #1E293B;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

.delete-text {
  color: #EF4444 !important;
  font-weight: 600;
}

.report-text {
  color: #dc3545 !important;
  font-weight: 600;
}
</style>
