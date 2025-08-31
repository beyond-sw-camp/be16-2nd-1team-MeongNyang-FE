<template>
  <div v-if="previewComments && previewComments.length > 0" class="comments-preview">
    <div class="comments-preview-header">
      <span class="comments-preview-title">댓글 {{ commentsCount }}개</span>
      <span 
        v-if="commentsCount > 5" 
        class="view-all-comments"
        @click="$emit('toggle-comments-modal')"
      >
        모두 보기
      </span>
    </div>
    <div class="comments-preview-list">
      <div 
        v-for="comment in previewComments.slice(0, 5)" 
        :key="comment.id" 
        class="comment-preview-item"
      >
        <div class="comment-user-info">
          <v-avatar 
            size="24" 
            class="comment-avatar"
            @click="$emit('go-to-user-diary', comment.replyUserId || comment.userId)"
          >
            <v-img 
              :src="comment.profileImage || comment.userImage || '/default-avatar.png'" 
              alt="User Avatar"
            />
          </v-avatar>
          <span 
            class="comment-author clickable"
            @click="$emit('go-to-user-diary', comment.replyUserId || comment.userId)"
          >
            {{ comment.replyUserName || comment.userName || comment.user?.userName || comment.author?.userName || comment.petName || '익명' }}
          </span>
        </div>
        <span class="comment-content">
          <template v-for="(part, index) in formatCommentText(comment.content, comment.mentionUserId)" :key="index">
            <span 
              v-if="part.isTag" 
              class="tag-mention clickable"
              @click="$emit('go-to-user-diary', part.userId)"
            >
              {{ part.text }}
            </span>
            <span v-else>{{ part.text }}</span>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  commentsCount: { type: Number, default: 0 },
  previewComments: { type: Array, default: () => [] },
});

const emit = defineEmits([
  'toggle-comments-modal',
  'go-to-user-diary',
]);

// Dummy usage to satisfy ESLint
// eslint-disable-next-line no-unused-vars
const _props = props;
// eslint-disable-next-line no-unused-vars
const _emit = emit;

// Helper function for formatting comment text (copied from DiaryDetailView)
const formatCommentText = (text, mentionUserId = null) => {
  if (!text) return [];
  
  const parts = [];
  const tagRegex = /@([a-zA-Z0-9가-힣_]+)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = tagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isTag: false
      });
    }
    parts.push({
      text: match[0],
      isTag: true,
      userId: mentionUserId || match[1]
    });
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isTag: false
    });
  }
  
  return parts;
};
</script>

<style scoped>
.comments-preview {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}

.comments-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comments-preview-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1E293B;
}

.view-all-comments {
  font-size: 0.8rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.2s ease;
}

.view-all-comments:hover {
  color: #FF8B8B;
}

.comments-preview-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-preview-item {
  display: flex;
  gap: 6px;
  font-size: 0.85rem;
  line-height: 1.4;
  align-items: flex-start;
}

.comment-author {
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
}

.comment-content {
  color: #495057;
  word-break: break-word;
  margin-top: 2px;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-avatar {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.comment-avatar:hover {
  opacity: 0.8;
}

.comment-author.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.comment-author.clickable:hover {
  color: #FF8B8B;
}

.tag-mention {
  font-weight: 700;
  color: #FF8B8B;
}

.tag-mention.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.tag-mention.clickable:hover {
  color: #e67e7e;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .comments-preview {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
