<template>
  <Transition name="comments-slide">
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
            <!-- 댓글 목록이 있을 때 -->
            <template v-if="commentsList.length > 0">
              <div 
                v-for="comment in commentsList" 
                :key="comment.commentId || comment.id" 
                class="comment-item"
              >
                <v-avatar 
                  size="28" 
                  class="comment-avatar clickable"
                  @click="goToUserDiary(comment.userId)"
                >
                  <v-img :src="comment.profileImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=32&h=32&fit=crop&crop=center'"></v-img>
                </v-avatar>
                <div 
                  class="comment-content"
                  :class="{ 'my-comment': isMyComment(comment) }"
                  @contextmenu.prevent.stop="showContextMenu($event, 'comment', comment)"
                >
                  <div class="comment-header">
                    <span class="comment-username clickable" @click="goToUserDiary(comment.userId)">{{ comment.petName || comment.userName || comment.username }}</span>
                    <span class="comment-time">{{ formatDate(comment.createdAt) || comment.time }}</span>
                  </div>
                  <div class="comment-text">
                    <template v-for="(part, index) in formatCommentText(comment.content || comment.text, comment.userId)" :key="index">
                      <span 
                        v-if="part.isTag" 
                        class="tag-mention clickable"
                        @click="goToUserDiary(part.userId)"
                      >
                        {{ part.text }}
                      </span>
                      <span v-else>{{ part.text }}</span>
                    </template>
                  </div>
                  
                  <!-- 답글 목록 -->
                  <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
                    <div 
                      v-for="reply in comment.replies" 
                      :key="reply.id" 
                      class="reply-item"
                    >
                      <v-avatar 
                        size="24" 
                        class="reply-avatar clickable"
                        @click="goToUserDiary(reply.replyUserId || reply.userId)"
                      >
                        <v-img :src="reply.profileImage || reply.userImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=24&h=24&fit=crop&crop=center'"></v-img>
                      </v-avatar>
                      <div 
                        class="reply-content" 
                        :class="{ 'my-comment': isMyReply(reply) }"
                        @contextmenu.prevent.stop="showContextMenu($event, 'reply', reply)"
                      >
                        <div class="reply-header">
                          <span class="reply-username clickable" @click="goToUserDiary(reply.replyUserId || reply.userId)">
                            {{ reply.replyPetName || reply.replyUserName }}
                          </span>
                          <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
                        </div>
                        <div class="reply-text">
                          <template v-for="(part, partIndex) in formatCommentText(reply.content, reply.mentionUserId)" :key="partIndex">
                            <span 
                              v-if="part.isTag" 
                              class="tag-mention clickable" 
                              @click="goToUserDiary(part.userId)"
                            >
                              {{ part.text }}
                            </span>
                            <span v-else>{{ part.text }}</span>
                          </template>
                        </div>
                        
                        <!-- 답글의 답글 버튼 -->
                        <v-btn text size="x-small" class="reply-btn reply-to-reply-btn" @click="replyToReply(reply, comment)">
                          답글
                        </v-btn>
                      </div>
                    </div>
                  </div>
                  
                  <v-btn text size="x-small" class="reply-btn" @click="replyToComment(comment)">
                    답글
                  </v-btn>
                </div>
              </div>
            </template>
            
            <!-- 댓글 목록이 없을 때 -->
            <div v-else class="empty-comments">
              <v-icon size="48" color="#CBD5E1">mdi-comment-outline</v-icon>
              <p class="empty-text">아직 댓글이 없습니다</p>
              <p class="empty-subtext">첫 번째 댓글을 작성해보세요!</p>
            </div>
          </div>
        </div>
        
        <!-- 댓글 입력 -->
        <div class="comment-input-section animate-input">
          <v-text-field
            ref="commentInput"
            v-model="newComment"
            :placeholder="getInputPlaceholder()"
            variant="outlined"
            density="compact"
            hide-details
            class="comment-field"
            :class="{ 
              'reply-mode': replyingTo,
              'edit-mode': editingItem 
            }"
            :disabled="isSubmitting"
            @keyup.enter="addComment"
            @input="console.log('댓글 입력:', newComment)"
          >
            <template v-slot:append>
              <v-btn 
                icon 
                size="small" 
                :disabled="!newComment.trim() || isSubmitting"
                @click="addComment"
                class="send-btn"
                @mousedown="console.log('댓글 전송 버튼 클릭됨', { newComment: newComment, trimmed: newComment.trim(), isSubmitting })"
              >
                <v-icon v-if="!isSubmitting" color="#FF8B8B">
                  {{ editingItem ? 'mdi-check' : 'mdi-send' }}
                </v-icon>
                <v-progress-circular v-else indeterminate size="16" color="#FF8B8B"></v-progress-circular>
              </v-btn>
            </template>
          </v-text-field>
          
          <!-- 수정 모드일 때 취소 버튼 -->
          <div v-if="editingItem" class="edit-actions">
            <v-btn 
              text 
              size="small" 
              @click="cancelEdit"
              class="cancel-edit-btn"
            >
              취소
            </v-btn>
          </div>
        </div>

      </div>
    </div>
  </Transition>
  
  <!-- 컨텍스트 메뉴 -->
  <div 
    v-if="showContextMenuFlag" 
    class="context-menu"
    :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
  >
    <div class="context-menu-item" @click="handleEdit">
      <v-icon size="16" class="context-menu-icon">mdi-pencil</v-icon>
      <span>수정</span>
    </div>
    <div class="context-menu-item delete-item" @click="handleDelete">
      <v-icon size="16" class="context-menu-icon">mdi-delete</v-icon>
      <span>삭제</span>
    </div>
  </div>
</template>

<script>
import { checkPetExist } from '@/utils/petValidation'
import { useAuthStore } from '@/stores/auth'

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
    },
    postId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['update:modelValue', 'add-comment', 'add-reply', 'edit-comment', 'delete-comment', 'edit-reply', 'delete-reply', 'refresh-comments'],
  setup() {
    const authStore = useAuthStore()
    
    return {
      authStore
    }
  },
  data() {
    return {
      newComment: '',
      isSubmitting: false,
      replyingTo: null, // 답글 대상 댓글
      editingItem: null, // 수정 중인 아이템 (댓글 또는 답글)
      editingType: null, // 'comment' 또는 'reply'
      showContextMenuFlag: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuType: '', // 'comment' 또는 'reply'
      contextMenuData: null
    }
  },
  mounted() {
    // ESC 키로 컨텍스트 메뉴 닫기
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    // 이벤트 리스너 정리
    document.removeEventListener('keydown', this.handleKeydown)
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
      this.replyingTo = null
      this.editingItem = null
      this.editingType = null
    },
    
    // 사용자 다이어리로 이동하는 메서드
    goToUserDiary(userId) {
      if (userId) {
        this.$router.push(`/diarys/${userId}`)
      }
    },
    

    
    async addComment() {
      if (this.newComment.trim() && !this.isSubmitting) {
        try {
          // 펫 등록 여부 확인
          const hasPet = await checkPetExist()
          if (!hasPet) {
            this.$router.back()
            return
          }
          
          this.isSubmitting = true
          console.log('=== addComment 메서드 시작 ===')
          console.log('댓글 내용:', this.newComment)
          console.log('답글 모드 여부:', !!this.replyingTo)
          console.log('수정 모드 여부:', !!this.editingItem)
          console.log('replyingTo 객체:', this.replyingTo)
          console.log('editingItem 객체:', this.editingItem)
          
          // 수정 모드일 때
          if (this.editingItem) {
            console.log('=== 수정 모드 처리 ===')
            console.log('editingItem:', this.editingItem)
            console.log('editingType:', this.editingType)
            
            if (this.editingType === 'comment') {
              console.log('댓글 수정:', this.editingItem)
              this.$emit('edit-comment', {
                commentId: this.editingItem.commentId || this.editingItem.id,
                content: this.newComment
              })
            } else if (this.editingType === 'reply') {
              console.log('답글 수정:', this.editingItem)
              // 답글의 경우 replyId 필드를 우선적으로 사용
              const replyId = this.editingItem.replyId || this.editingItem.id
              console.log('사용할 replyId:', replyId)
              this.$emit('edit-reply', {
                replyId: replyId,
                content: this.newComment
              })
            }
            this.newComment = ''
            this.editingItem = null
            this.editingType = null
            console.log('=== 수정 모드 처리 완료 ===')
            return
          }
          
          if (this.replyingTo) {
            // 답글 모드일 때 (부모 댓글에 대한 답글 또는 답글의 답글)
            console.log('답글 대상 댓글:', this.replyingTo)
            
            // 답글의 답글인지 확인 (replyId가 있으면 답글의 답글)
            const isReplyToReply = this.replyingTo.replyId
            
            if (isReplyToReply) {
              // 답글의 답글인 경우 - 부모 댓글의 ID를 사용
              console.log('답글의 답글 작성:', this.replyingTo)
              
              const commentId = this.replyingTo.commentId || this.replyingTo.parentCommentId
              const mentionUserId = this.replyingTo.mentionUserId || this.replyingTo.replyUserId || this.replyingTo.userId || this.replyingTo.user?.id || this.replyingTo.replyUser?.id
              
              console.log('답글의 답글 데이터 전송:', {
                commentId: commentId,
                content: this.newComment,
                mentionUserId: mentionUserId,
                replyingTo: this.replyingTo
              })
              
              // mentionUserId가 null인지 확인
              if (!mentionUserId) {
                console.error('mentionUserId가 null입니다!')
                console.error('replyingTo 객체:', this.replyingTo)
                alert('답글 작성자 정보를 찾을 수 없습니다.')
                return
              }
              
              this.$emit('add-reply', {
                commentId: commentId,
                content: this.newComment,
                mentionUserId: mentionUserId
              })
            } else {
              // 일반 답글인 경우
              console.log('일반 답글 작성:', this.replyingTo)
              
              // 댓글 ID 추출 (다양한 필드명 시도)
              const commentId = this.replyingTo.commentId || 
                               this.replyingTo.id || 
                               this.replyingTo.comment_id
              
              console.log('답글 전송:', commentId, this.newComment)
              
              // 사용자 ID 추출 (다양한 필드명 시도)
              const mentionUserId = this.replyingTo.userId || 
                                   this.replyingTo.user_id || 
                                   this.replyingTo.user?.id || 
                                   this.replyingTo.user?.userId || 
                                   this.replyingTo.user?.user_id || 
                                   this.replyingTo.id // fallback으로 댓글 ID 사용
              
              console.log('답글 대상 댓글 상세:', {
                전체: this.replyingTo,
                키목록: Object.keys(this.replyingTo),
                userId: this.replyingTo.userId,
                user_id: this.replyingTo.user_id,
                'user.id': this.replyingTo.user?.id,
                'user.userId': this.replyingTo.user?.userId,
                'user.user_id': this.replyingTo.user?.user_id,
                추출된_mentionUserId: mentionUserId
              })
              
              console.log('답글 데이터 전송:', {
                commentId: commentId,
                content: this.newComment,
                mentionUserId: mentionUserId,
                originalComment: this.replyingTo
              })
              
              this.$emit('add-reply', {
                commentId: commentId,
                content: this.newComment,
                mentionUserId: mentionUserId
              })
            }
            
            console.log('=== 답글 모드 처리 완료, 함수 종료 ===')
            this.newComment = ''
            this.replyingTo = null // 답글 모드 초기화
            return // 답글 모드일 때는 여기서 종료
          } else {
            // 일반 댓글 모드일 때
            console.log('=== 일반 댓글 모드 처리 ===')
            console.log('일반 댓글 전송:', this.newComment)
            this.$emit('add-comment', this.newComment)
            this.newComment = ''
            console.log('=== 일반 댓글 모드 처리 완료 ===')
          }
        } catch (error) {
          console.error('댓글 작성 실패:', error)
        } finally {
          this.isSubmitting = false
        }
      }
    },
    
    replyToComment(comment) {
      // 부모 댓글에 대한 답글 모드 설정
      this.replyingTo = comment
      
      // 사용자 이름을 다양한 필드에서 찾기
      const userName = comment.userName || comment.username || comment.petName || comment.user?.name || comment.user?.petName || '사용자'
      this.newComment = `@${userName} `
      
      // 포커스를 입력 필드로 이동
      this.$nextTick(() => {
        if (this.$refs.commentInput && this.$refs.commentInput.$el) {
          const input = this.$refs.commentInput.$el.querySelector('input')
          if (input) {
            input.focus()
          }
        }
      })
    },
    
    replyToReply(reply, parentComment) {
      console.log('=== replyToReply 호출 ===')
      console.log('reply 객체:', reply)
      console.log('parentComment 객체:', parentComment)
      console.log('reply 객체의 모든 키:', Object.keys(reply))
      
      // 답글 작성자 ID 찾기 (replyUserName을 기반으로 찾기)
      let replyUserId = reply.replyUserId || reply.userId || reply.user?.id || reply.replyUser?.id || reply.user?.userId
      
      // replyUserName이 있으면 해당 사용자의 ID를 찾기
      if (!replyUserId && reply.replyUserName) {
        console.log('replyUserName으로 사용자 ID 찾기 시도:', reply.replyUserName)
        // 현재 댓글 목록에서 해당 사용자 이름을 가진 사용자 찾기
        const allComments = this.commentsList || []
        for (const comment of allComments) {
          if (comment.userName === reply.replyUserName || comment.petName === reply.replyUserName) {
            replyUserId = comment.userId
            console.log('찾은 사용자 ID:', replyUserId)
            break
          }
          // 답글들도 확인
          if (comment.replies && Array.isArray(comment.replies)) {
            for (const replyItem of comment.replies) {
              if (replyItem.replyUserName === reply.replyUserName) {
                // 답글 작성자의 ID는 부모 댓글에서 찾아야 할 수도 있음
                replyUserId = comment.userId // 임시로 부모 댓글 작성자 ID 사용
                console.log('답글에서 찾은 사용자 ID (부모 댓글 작성자):', replyUserId)
                break
              }
            }
          }
        }
      }
      
      console.log('최종 찾은 답글 작성자 ID:', replyUserId)
      
      // 답글에 대한 답글 모드 설정 (부모 댓글의 ID 사용, 답글의 작성자 ID 사용)
      this.replyingTo = {
        ...reply,
        // 답글의 작성자 정보를 사용
        userName: reply.replyUserName,
        username: reply.replyUserName,
        // 부모 댓글의 ID를 사용 (답글의 답글은 부모 댓글에 달려야 함)
        commentId: parentComment.commentId || parentComment.id,
        parentCommentId: parentComment.commentId || parentComment.id,
        // 답글의 ID도 저장
        replyId: reply.id,
        // 답글 작성자의 ID를 mentionUserId로 사용
        mentionUserId: replyUserId,
        id: reply.id
      }
      
      console.log('설정된 replyingTo:', this.replyingTo)
      
      // 답글 작성자 이름을 다양한 필드에서 찾기
      const replyUserName = reply.replyUserName || reply.replyPetName || reply.userName || reply.username || reply.petName || reply.user?.name || reply.user?.petName || '사용자'
      this.newComment = `@${replyUserName} `
      
      // 포커스를 입력 필드로 이동
      this.$nextTick(() => {
        if (this.$refs.commentInput && this.$refs.commentInput.$el) {
          const input = this.$refs.commentInput.$el.querySelector('input')
          if (input) {
            input.focus()
          }
        }
      })
    },
    
    // 댓글 수정
    async editComment(comment) {
      // 펫 등록 여부 확인
      const hasPet = await checkPetExist()
      if (!hasPet) {
        this.$router.back()
        return
      }
      
      this.$emit('edit-comment', {
        commentId: comment.commentId || comment.id,
        content: comment.content
      })
    },
    
    // 댓글 삭제
    async deleteComment(comment) {
      // 펫 등록 여부 확인
      const hasPet = await checkPetExist()
      if (!hasPet) {
        this.$router.back()
        return
      }
      
      this.$emit('delete-comment', {
        commentId: comment.commentId || comment.id
      })
    },
    
    // 답글 수정
    async editReply(reply) {
      // 펫 등록 여부 확인
      const hasPet = await checkPetExist()
      if (!hasPet) {
        this.$router.back()
        return
      }
      
      console.log('=== editReply 메서드 실행 ===')
      console.log('받은 reply 객체:', reply)
      console.log('reply.id:', reply?.id)
      console.log('reply.replyId:', reply?.replyId)
      
      // 답글의 경우 replyId 필드를 우선적으로 사용
      const replyId = reply.replyId || reply.id
      console.log('사용할 replyId:', replyId)
      
      this.$emit('edit-reply', {
        replyId: replyId,
        content: reply.content
      })
    },
    
    // 답글 삭제
    async deleteReply(reply) {
      // 펫 등록 여부 확인
      const hasPet = await checkPetExist()
      if (!hasPet) {
        this.$router.back()
        return
      }
      
      console.log('=== deleteReply 메서드 실행 ===')
      console.log('받은 reply 객체:', reply)
      console.log('reply.id:', reply?.id)
      console.log('reply.replyId:', reply?.replyId)
      
      // 답글의 경우 replyId 필드를 우선적으로 사용
      const replyId = reply.replyId || reply.id
      console.log('사용할 replyId:', replyId)
      
      this.$emit('delete-reply', {
        replyId: replyId
      })
    },
    
    // 컨텍스트 메뉴 표시
    showContextMenu(event, type, data) {
      event.preventDefault()
      console.log('=== 컨텍스트 메뉴 표시 ===')
      console.log('타입:', type)
      console.log('데이터:', data)
      
      // 현재 사용자 ID 가져오기
      const currentUserId = this.authStore.user?.userId || this.authStore.user?.id
      console.log('현재 사용자 ID:', currentUserId)
      
      // 댓글 작성자 ID 확인
      let commentUserId
      if (type === 'comment') {
        commentUserId = data.userId
      } else if (type === 'reply') {
        commentUserId = data.replyUserId || data.userId
      }
      console.log('댓글 작성자 ID:', commentUserId)
      
      // 본인 댓글이 아니면 컨텍스트 메뉴 표시하지 않음
      if (currentUserId !== commentUserId) {
        console.log('본인 댓글이 아니므로 컨텍스트 메뉴를 표시하지 않습니다.')
        return
      }
      
      this.contextMenuType = type
      this.contextMenuData = data
      this.contextMenuX = event.clientX
      this.contextMenuY = event.clientY
      this.showContextMenuFlag = true
      
      // 다른 곳 클릭 시 메뉴 닫기
      setTimeout(() => {
        document.addEventListener('click', this.hideContextMenu, { once: true })
      }, 0)
    },
    
    // 컨텍스트 메뉴 숨기기
    hideContextMenu() {
      this.showContextMenuFlag = false
    },
    
    // 수정 처리
    async handleEdit() {
      // 펫 등록 여부 확인
      const hasPet = await checkPetExist()
      if (!hasPet) {
        this.$router.back()
        return
      }
      
      console.log('=== 수정 처리 시작 ===')
      console.log('컨텍스트 메뉴 타입:', this.contextMenuType)
      console.log('컨텍스트 메뉴 데이터:', this.contextMenuData)
      
      if (this.contextMenuType === 'comment') {
        console.log('댓글 수정 모드로 전환')
        this.editingItem = this.contextMenuData
        this.editingType = 'comment'
        this.newComment = this.contextMenuData.content
        this.replyingTo = null // 답글 모드 초기화
      } else if (this.contextMenuType === 'reply') {
        console.log('답글 수정 모드로 전환')
        console.log('=== 답글 수정 디버깅 시작 ===')
        console.log('contextMenuData:', this.contextMenuData)
        console.log('contextMenuData 타입:', typeof this.contextMenuData)
        console.log('contextMenuData가 null인가?', this.contextMenuData === null)
        console.log('contextMenuData가 undefined인가?', this.contextMenuData === undefined)
        
        this.editingItem = this.contextMenuData
        this.editingType = 'reply'
        
        // 답글 객체의 모든 필드 확인
        console.log('=== 답글 객체 상세 분석 ===')
        console.log('답글 객체 전체:', this.contextMenuData)
        console.log('답글 객체 키 목록:', Object.keys(this.contextMenuData))
        
        // 각 필드별로 값 확인
        const fieldsToCheck = ['content', 'text', 'replyContent', 'replyText', 'message', 'description', 'comment', 'reply']
        fieldsToCheck.forEach(field => {
          console.log(`${field}:`, this.contextMenuData[field], `(타입: ${typeof this.contextMenuData[field]})`)
        })
        
        // 모든 가능한 필드에서 내용 찾기
        const possibleContentFields = [
          this.contextMenuData.content,
          this.contextMenuData.text,
          this.contextMenuData.replyContent,
          this.contextMenuData.replyText,
          this.contextMenuData.message,
          this.contextMenuData.description,
          this.contextMenuData.comment,
          this.contextMenuData.reply
        ]
        
        this.newComment = possibleContentFields.find(field => field && typeof field === 'string') || ''
        console.log('최종 선택된 답글 내용:', this.newComment)
        console.log('newComment 길이:', this.newComment.length)
        console.log('=== 답글 수정 디버깅 완료 ===')
        
        this.replyingTo = null // 답글 모드 초기화
      }
      
      // 입력 필드에 포커스
      this.$nextTick(() => {
        if (this.$refs.commentInput && this.$refs.commentInput.$el) {
          const input = this.$refs.commentInput.$el.querySelector('input')
          if (input) {
            input.focus()
            input.select() // 텍스트 전체 선택
          }
        }
      })
      
      this.hideContextMenu()
    },
    
    // 삭제 처리
    async handleDelete() {
      // 펫 등록 여부 확인
      const hasPet = await checkPetExist()
      if (!hasPet) {
        this.$router.back()
        return
      }
      
      console.log('=== 삭제 처리 시작 ===')
      console.log('컨텍스트 메뉴 타입:', this.contextMenuType)
      console.log('컨텍스트 메뉴 데이터:', this.contextMenuData)
      
      if (this.contextMenuType === 'comment') {
        console.log('댓글 삭제 실행')
        this.deleteComment(this.contextMenuData)
      } else if (this.contextMenuType === 'reply') {
        console.log('답글 삭제 실행')
        this.deleteReply(this.contextMenuData)
      }
      this.hideContextMenu()
    },
    
    // 키보드 이벤트 처리
    handleKeydown(event) {
      if (event.key === 'Escape' && this.showContextMenuFlag) {
        this.hideContextMenu()
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now - date) / (1000 * 60))
        
        if (diffInMinutes < 1) return '방금 전'
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`
        
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}시간 전`
        
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}일 전`
        
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        return dateString
      }
    },
    
    formatCommentText(text, mentionUserId = null) {
      if (!text) return []
      
      const parts = []
      // @username 패턴을 더 정확하게 매칭 (한글, 영문, 숫자, 언더스코어 포함)
      const tagRegex = /@([a-zA-Z0-9가-힣_]+)/g
      let lastIndex = 0
      let match
      
      while ((match = tagRegex.exec(text)) !== null) {
        // 태그 이전 텍스트
        if (match.index > lastIndex) {
          parts.push({
            text: text.slice(lastIndex, match.index),
            isTag: false
          })
        }
        
        // 태그 부분
        parts.push({
          text: match[0], // @username
          isTag: true,
          userId: mentionUserId || match[1] // mentionUserId가 있으면 사용, 없으면 username 사용
        })
        
        lastIndex = match.index + match[0].length
      }
      
      // 마지막 텍스트
      if (lastIndex < text.length) {
        parts.push({
          text: text.slice(lastIndex),
          isTag: false
        })
      }
      
      return parts.length > 0 ? parts : [{ text: text, isTag: false }]
    },
    
    getInputPlaceholder() {
      if (this.replyingTo) {
        return `${this.replyingTo.userName || this.replyingTo.username}님에게 답글 작성 중...`
      } else if (this.editingItem) {
        return '댓글을 수정하세요...'
      }
      return '댓글을 입력하세요...'
    },
    
    cancelEdit() {
      this.editingItem = null
      this.newComment = ''
    },

    isMyComment(comment) {
      const currentUserId = this.authStore.user?.userId || this.authStore.user?.id
      return currentUserId === comment.userId
    },

    isMyReply(reply) {
      const currentUserId = this.authStore.user?.userId || this.authStore.user?.id
      return currentUserId === reply.replyUserId || currentUserId === reply.userId
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
  color: #FF8B8B !important;
  background-color: #FF8B8B !important;
  transition: all 0.3s ease;
}

.close-btn :deep(.v-btn__content) {
  color: white !important;
}

.close-btn :deep(.v-icon) {
  color: white !important;
}

.close-btn:hover {
  background-color: #FF6B6B !important;
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
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.comment-content.my-comment {
  position: relative;
  cursor: context-menu;
}

.comment-content.my-comment::after {
  content: '우클릭으로 수정/삭제';
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.7rem;
  color: #94A3B8;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.comment-content.my-comment:hover::after {
  opacity: 1;
}

.reply-content.my-comment {
  position: relative;
}

.reply-content.my-comment::after {
  content: '우클릭으로 수정/삭제';
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.7rem;
  color: #94A3B8;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.reply-content.my-comment:hover::after {
  opacity: 1;
}

.comment-username {
  font-weight: 600;
  font-size: 0.8rem;
  color: #1E293B;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  opacity: 0.8;
  transform: scale(1.02);
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

.tag-mention.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.tag-mention.clickable:hover {
  color: #e67e7e !important;
  text-decoration: underline;
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

/* 댓글 사이드바 애니메이션 */
.comments-slide-enter-active,
.comments-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.comments-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.comments-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.comments-slide-enter-to,
.comments-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* 댓글 아이템 애니메이션 */
.comment-item {
  animation: commentSlideIn 0.5s ease-out;
  animation-fill-mode: both;
}

.comment-item:nth-child(1) { animation-delay: 0.1s; }
.comment-item:nth-child(2) { animation-delay: 0.2s; }
.comment-item:nth-child(3) { animation-delay: 0.3s; }
.comment-item:nth-child(4) { animation-delay: 0.4s; }
.comment-item:nth-child(5) { animation-delay: 0.5s; }
.comment-item:nth-child(6) { animation-delay: 0.6s; }
.comment-item:nth-child(7) { animation-delay: 0.7s; }
.comment-item:nth-child(8) { animation-delay: 0.8s; }
.comment-item:nth-child(9) { animation-delay: 0.9s; }
.comment-item:nth-child(10) { animation-delay: 1.0s; }

@keyframes commentSlideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 댓글 입력 섹션 애니메이션 */
.animate-input {
  animation: inputSlideUp 0.6s ease-out 0.3s both;
}

@keyframes inputSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 빈 댓글 상태 스타일 */
.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

/* 답글 모드 스타일 */
.reply-mode {
  border-color: #FF8B8B !important;
  background-color: rgba(255, 139, 139, 0.05) !important;
}

.reply-mode .v-field__outline {
  border-color: #FF8B8B !important;
}

/* 수정 모드 스타일 */
.edit-mode {
  border-color: #3B82F6 !important;
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.edit-mode .v-field__outline {
  border-color: #3B82F6 !important;
}

/* 수정 액션 버튼 */
.edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.cancel-edit-btn {
  color: #64748B !important;
  font-size: 0.8rem;
  text-transform: none;
  min-width: auto;
  padding: 4px 12px;
  height: auto;
  background: transparent !important;
  box-shadow: none !important;
}

.cancel-edit-btn:hover {
  color: #1E293B !important;
  background: rgba(0, 0, 0, 0.05) !important;
}

/* 답글 스타일 */
.replies-section {
  margin-top: 8px;
  margin-left: 20px;
  border-left: 2px solid #E2E8F0;
  padding-left: 12px;
}

.reply-to-reply-btn {
  margin-left: 8px;
  font-size: 0.75rem;
  color: #64748B;
}

/* 컨텍스트 메뉴 스타일 */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 9999;
  min-width: 120px;
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background-color: #F8FAFC;
}

.context-menu-icon {
  color: #6B7280;
}

.delete-item {
  color: #EF4444;
}

.delete-item .context-menu-icon {
  color: #EF4444;
}

/* 댓글/답글 호버 효과 */
.comment-header:hover,
.reply-content:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.reply-item {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.reply-avatar {
  cursor: pointer;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.reply-avatar:hover {
  opacity: 0.8;
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-username.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.reply-username.clickable:hover {
  color: #FF8B8B;
}

.reply-username {
  font-weight: 600;
  font-size: 0.8rem;
  color: #1E293B;
}

.reply-text {
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.4;
}

.reply-time {
  font-size: 0.7rem;
  color: #64748B;
}

/* 반응형 */
@media (max-width: 768px) {
  .comments-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .comments-modal {
    width: 95%;
    max-width: none;
    max-height: 90vh;
    border-left: none;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15);
  }
  
  .modal-header,
  .comment-item,
  .comment-input-section {
    padding-left: 20px;
    padding-right: 20px;
  }
}

/* 로그인 필요 메시지 */
.login-required-section {
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  bottom: 0;
}

.login-required-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
  background: rgba(203, 213, 225, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(203, 213, 225, 0.2);
}

.login-required-message p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748B;
  font-weight: 500;
}
</style>
