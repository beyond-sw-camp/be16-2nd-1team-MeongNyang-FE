<template>
  <div v-if="show" class="comments-sidebar">
    <div class="comments-modal">
      <!-- 헤더 -->
      <div class="modal-header">
        <div class="header-content">
          <span class="header-title">댓글</span>
          <v-btn icon size="small" @click="closeModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      
      <!-- 댓글 목록 -->
      <div class="modal-content">
        <div class="comments-list">
          <div 
            v-for="comment in commentsList" 
            :key="comment.id" 
            class="comment-item"
          >
                                    <v-avatar size="28" class="comment-avatar">
              <v-img :src="comment.profileImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center'"></v-img>
            </v-avatar>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-username">{{ comment.username }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
                                        <div class="comment-text">
                            <template v-for="(part, index) in formatCommentText(comment.text)" :key="index">
                              <span v-if="part.isTag" class="tag-mention">{{ part.text }}</span>
                              <span v-else>{{ part.text }}</span>
                            </template>
                          </div>
              <v-btn text size="x-small" class="reply-btn" @click="replyToComment(comment)">
                답글
              </v-btn>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 댓글 입력 -->
      <div class="comment-input-section">
        <v-text-field
          v-model="newComment"
          placeholder="댓글을 입력하세요..."
          variant="outlined"
          density="compact"
          hide-details
          class="comment-field"
          @keyup.enter="addComment"
        >
          <template v-slot:append>
                                    <v-btn 
                          icon 
                          size="small" 
                          :disabled="!newComment.trim()"
                          @click="addComment"
                          class="send-btn"
                        >
                          <v-icon color="#FF8B8B">mdi-send</v-icon>
                        </v-btn>
          </template>
        </v-text-field>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentsModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    commentsList: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'add-comment'],
  data() {
    return {
      newComment: ''
    }
  },
  computed: {
    show: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    closeModal() {
      this.show = false
      this.newComment = ''
    },
    addComment() {
      if (this.newComment.trim()) {
        this.$emit('add-comment', this.newComment)
        this.newComment = ''
      }
    },
    replyToComment(comment) {
      this.newComment = `@${comment.username} `
      // 포커스를 입력 필드로 이동
      this.$nextTick(() => {
        const input = this.$el.querySelector('.comment-field input')
        if (input) {
          input.focus()
        }
      })
    },
    formatCommentText(text) {
      // @태그를 감지하여 배열로 분리
      const parts = []
      let lastIndex = 0
      const tagRegex = /(@\w+)/g
      let match
      
      while ((match = tagRegex.exec(text)) !== null) {
        // 태그 이전 텍스트
        if (match.index > lastIndex) {
          parts.push({
            text: text.slice(lastIndex, match.index),
            isTag: false
          })
        }
        // 태그
        parts.push({
          text: match[1],
          isTag: true
        })
        lastIndex = match.index + match[1].length
      }
      
      // 마지막 텍스트
      if (lastIndex < text.length) {
        parts.push({
          text: text.slice(lastIndex),
          isTag: false
        })
      }
      
      return parts.length > 0 ? parts : [{ text: text, isTag: false }]
    }
  }
}
</script>

<style scoped>
.comments-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.comments-modal {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.12);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  color: #64748B;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #1E293B;
  transform: scale(1.1);
}

.modal-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
}

.comments-list {
  padding: 16px 0;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.comment-item:hover {
  background: linear-gradient(135deg, rgba(255, 139, 139, 0.03) 0%, rgba(255, 193, 193, 0.03) 100%);
}

.comment-avatar {
  flex-shrink: 0;
  border: 2px solid #FF8B8B;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
  width: 28px !important;
  height: 28px !important;
}

.comment-content {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  justify-content: flex-start;
}

.comment-username {
  font-weight: 600;
  font-size: 0.8rem;
  color: #1E293B;
}

.comment-time {
  font-size: 0.7rem;
  color: #64748B;
}

.comment-text {
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.4;
  margin-bottom: 4px;
  text-align: left;
  word-break: break-word;
}

.tag-mention {
  font-weight: 700 !important;
  color: #FF8B8B !important;
}

.reply-btn {
  color: #1E293B !important;
  font-size: 0.7rem;
  min-width: auto;
  padding: 0;
  height: auto;
  transition: all 0.3s ease;
  text-align: left;
  justify-content: flex-start;
  background: transparent !important;
  box-shadow: none !important;
  font-weight: 600;
  margin-top: 4px;
}

.reply-btn:hover {
  color: #FF8B8B !important;
  transform: translateX(2px);
  background: transparent !important;
}

.comment-input-section {
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  bottom: 0;
}

.comment-field {
  font-size: 0.85rem;
}

.comment-field :deep(.v-field) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 139, 139, 0.2);
}

.comment-field :deep(.v-field:hover) {
  border-color: rgba(255, 139, 139, 0.4);
}

.comment-field :deep(.v-field--focused) {
  border-color: #FF8B8B;
  box-shadow: 0 0 0 2px rgba(255, 139, 139, 0.1);
}

.send-btn {
  color: #FF8B8B !important;
  background: transparent !important;
  transition: all 0.3s ease;
}

.send-btn:hover {
  color: #FF8B8B !important;
  background: transparent !important;
  transform: scale(1.1);
}

.send-btn:disabled {
  color: #CBD5E1 !important;
  background: transparent !important;
}

/* 반응형 */
@media (max-width: 768px) {
  .comments-sidebar {
    width: 100%;
  }
  
  .comments-modal {
    border-left: none;
  }
  
  .modal-header,
  .comment-item,
  .comment-input-section {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
