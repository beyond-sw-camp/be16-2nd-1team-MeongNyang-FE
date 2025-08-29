<template>
  <Transition name="comments-slide">
    <div v-if="show" :class="sidebarMode ? 'comments-sidebar' : 'comments-overlay'">
      <div :class="sidebarMode ? 'comments-sidebar-modal' : 'comments-modal'">
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
          <!-- 로딩 상태 -->
          <div v-if="isLoadingComments" class="loading-comments">
            <v-progress-circular indeterminate color="#FF8B8B" size="32"></v-progress-circular>
            <p>댓글을 불러오는 중...</p>
          </div>
          
          <!-- 댓글 목록 -->
          <div v-else class="comments-list">
            <!-- 댓글 목록이 있을 때 -->
            <template v-if="displayCommentsList.length > 0">
              <div 
                v-for="comment in displayCommentsList" 
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
              'edit-mode': editingItem,
              'has-tags': hasTags
            }"
            :disabled="isSubmitting"
            @keyup.enter="addComment"
            @keydown="handleKeydown"
            @input="onInputChange"
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
import { postAPI } from '@/services/api'

export default {
  name: 'CommentsModal',
  emits: ['close', 'comment-added', 'comment-updated', 'comment-deleted'],
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
      required: false,
      default: null
    },
    sidebarMode: {
      type: Boolean,
      default: false
    }
  },
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
      contextMenuData: null,
      localCommentsList: [], // 로컬 댓글 목록 (props와 구분)
      isLoadingComments: false,
      

    }
  },
  watch: {
    // 부모에서 전달받은 commentsList 변경 감지
    commentsList: {
      handler(newCommentsList, oldCommentsList) {
        console.log('=== commentsList 변경 감지 ===')
        console.log('이전 commentsList 길이:', oldCommentsList?.length || 0)
        console.log('새로운 commentsList 길이:', newCommentsList?.length || 0)
        console.log('새로운 commentsList:', newCommentsList)
        
        // 부모에서 commentsList를 전달받으면 localCommentsList도 업데이트
        if (newCommentsList && newCommentsList.length > 0) {
          this.localCommentsList = [...newCommentsList]
          console.log('localCommentsList 업데이트됨:', this.localCommentsList.length)
        }
      },
      deep: true
    }
  },
  mounted() {
    console.log('=== CommentsModal mounted ===')
    console.log('초기 postId:', this.postId)
    console.log('초기 modelValue:', this.modelValue)
    console.log('초기 show 상태:', this.show)
    
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
    },
    // 댓글 목록 통합 (props 우선, 없으면 로컬)
    displayCommentsList() {
      return this.$props.commentsList && this.$props.commentsList.length > 0 
        ? this.$props.commentsList 
        : this.localCommentsList
    },
    // 태그가 있는지 확인
    hasTags() {
      if (!this.newComment) return false
      const tagRegex = /@([a-zA-Z0-9가-힣_]+)/g
      return tagRegex.test(this.newComment)
    },
    

  },
  methods: {
    // 댓글 목록 가져오기
    async fetchComments() {
      console.log('=== fetchComments 시작 ===')
      console.log('postId:', this.postId)
      console.log('postId 타입:', typeof this.postId)
      console.log('show 상태:', this.show)
      console.log('modelValue 상태:', this.modelValue)
      
      if (!this.postId) {
        console.error('postId가 없어서 댓글을 가져올 수 없습니다.')
        return
      }
      
      try {
        this.isLoadingComments = true
        console.log('댓글 목록 가져오기 시작:', this.postId)
        console.log('API 호출 전 - postAPI.getComments 호출 예정')
        
        // API 호출 전 로그
        console.log('=== API 호출 시작 ===')
        const response = await postAPI.getComments(this.postId, { page: 0, size: 50 })
        console.log('=== API 호출 완료 ===')
        
        console.log('전체 응답 객체:', response)
        console.log('응답 상태:', response.status)
        console.log('응답 헤더:', response.headers)
        console.log('응답 데이터:', response.data)
        
        // 응답 데이터 구조 분석
        if (response.data) {
          console.log('response.data 구조:')
          console.log('- isSuccess:', response.data.isSuccess)
          console.log('- data 필드 존재:', !!response.data.data)
          console.log('- data 타입:', typeof response.data.data)
          console.log('- data가 배열인가:', Array.isArray(response.data.data))
          
          if (response.data.data) {
            if (Array.isArray(response.data.data)) {
              console.log('- data는 배열, 길이:', response.data.data.length)
              console.log('- 배열 첫 번째 요소:', response.data.data[0])
            } else if (response.data.data.content) {
              console.log('- data.content 존재, 길이:', response.data.data.content.length)
              console.log('- content 첫 번째 요소:', response.data.data.content[0])
            } else {
              console.log('- data는 객체:', response.data.data)
            }
          }
        }
        
        if (response.data && response.data.isSuccess) {
          let commentsData = []
          
          if (response.data.data) {
            if (Array.isArray(response.data.data)) {
              commentsData = response.data.data
              console.log('배열 형태로 댓글 데이터 추출:', commentsData.length)
            } else if (response.data.data.content) {
              commentsData = response.data.data.content
              console.log('Page 형태로 댓글 데이터 추출:', commentsData.length)
            } else {
              commentsData = response.data.data
              console.log('객체 형태로 댓글 데이터 추출')
            }
          }
          
          console.log('최종 추출된 댓글 데이터:', commentsData)
          console.log('댓글 개수:', commentsData.length)
          
          this.localCommentsList = commentsData || []
          console.log('localCommentsList 설정 완료:', this.localCommentsList.length)
          console.log('첫 번째 댓글:', this.localCommentsList[0])
        } else {
          console.log('댓글 API 응답이 성공이 아님:', response.data)
          console.log('응답 구조:', JSON.stringify(response.data, null, 2))
          this.localCommentsList = []
        }
      } catch (error) {
        console.error('=== 댓글 목록 가져오기 실패 ===')
        console.error('에러 객체:', error)
        console.error('에러 메시지:', error.message)
        console.error('에러 스택:', error.stack)
        
        if (error.response) {
          console.error('에러 응답 상태:', error.response.status)
          console.error('에러 응답 데이터:', error.response.data)
          console.error('에러 응답 헤더:', error.response.headers)
        } else if (error.request) {
          console.error('요청은 보냈지만 응답을 받지 못함:', error.request)
        } else {
          console.error('요청 설정 중 에러:', error.message)
        }
        
        this.localCommentsList = []
      } finally {
        this.isLoadingComments = false
        console.log('=== fetchComments 완료 ===')
        console.log('최종 localCommentsList 길이:', this.localCommentsList.length)
        console.log('displayCommentsList 길이:', this.displayCommentsList.length)
      }
    },
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
              
              // 원본 태그 보호
              const originalContent = this.editingItem.content || this.editingItem.text || ''
              const originalTags = this.extractTags(originalContent)
              const finalContent = originalTags ? `${originalTags} ${this.newComment}`.trim() : this.newComment
              
              this.$emit('edit-comment', {
                commentId: this.editingItem.commentId || this.editingItem.id,
                content: finalContent
              })
            } else if (this.editingType === 'reply') {
              console.log('답글 수정:', this.editingItem)
              // 답글의 경우 replyId 필드를 우선적으로 사용
              const replyId = this.editingItem.replyId || this.editingItem.id
              console.log('사용할 replyId:', replyId)
              
              // 원본 태그 보호
              const originalContent = this.editingItem.content || this.editingItem.text || ''
              const originalTags = this.extractTags(originalContent)
              const finalContent = originalTags ? `${originalTags} ${this.newComment}`.trim() : this.newComment
              
              this.$emit('edit-reply', {
                replyId: replyId,
                content: finalContent
              })
            }
            this.newComment = ''
            this.editingItem = null
            this.editingType = null
            console.log('=== 수정 모드 처리 완료 ===')
            
            // 부모 컴포넌트에 댓글 목록 새로고침 요청
            this.$emit('refresh-comments')
            
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
            
            // 부모 컴포넌트에 댓글 목록 새로고침 요청
            this.$emit('refresh-comments')
            
            return // 답글 모드일 때는 여기서 종료
          } else {
            // 일반 댓글 모드일 때
            console.log('=== 일반 댓글 모드 처리 ===')
            console.log('일반 댓글 전송:', this.newComment)
            this.$emit('add-comment', this.newComment)
            this.newComment = ''
            console.log('=== 일반 댓글 모드 처리 완료 ===')
            
            // 부모 컴포넌트에 댓글 목록 새로고침 요청
            this.$emit('refresh-comments')
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
        const allComments = this.displayCommentsList || []
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
    
    // 태그 제거 함수
    removeTags(content) {
      if (!content) return ''
      // @로 시작하는 태그 부분을 제거
      return content.replace(/@[a-zA-Z0-9가-힣_]+/g, '').trim()
    },
    
    // 태그 추출 함수
    extractTags(content) {
      if (!content) return ''
      const tagMatches = content.match(/@[a-zA-Z0-9가-힣_]+/g) || []
      return tagMatches.join(' ')
    },
    
    // 태그 이후 텍스트만 추출
    getTextAfterTags(content) {
      if (!content) return ''
      // 태그 부분을 제거하고 앞뒤 공백 제거
      return content.replace(/@[a-zA-Z0-9가-힣_]+/g, '').trim()
    },
    
    // 댓글 수정
    async editComment(comment) {
      // 펫 등록 여부 확인
      const hasPet = await checkPetExist()
      if (!hasPet) {
        this.$router.back()
        return
      }
      
      // 태그 부분을 제거한 내용으로 수정
      const contentWithoutTags = this.removeTags(comment.content)
      
      this.$emit('edit-comment', {
        commentId: comment.commentId || comment.id,
        content: contentWithoutTags
      })
      
      // 부모 컴포넌트에 댓글 목록 새로고침 요청
      this.$emit('refresh-comments')
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
      
      // 부모 컴포넌트에 댓글 목록 새로고침 요청
      this.$emit('refresh-comments')
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
      
      // 태그 부분을 제거한 내용으로 수정
      const contentWithoutTags = this.removeTags(reply.content)
      
      this.$emit('edit-reply', {
        replyId: replyId,
        content: contentWithoutTags
      })
      
      // 부모 컴포넌트에 댓글 목록 새로고침 요청
      this.$emit('refresh-comments')
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
      
      // 부모 컴포넌트에 댓글 목록 새로고침 요청
      this.$emit('refresh-comments')
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
        
        // 태그 이후 텍스트만 입력 영역에 설정
        const content = this.contextMenuData.content || this.contextMenuData.text || ''
        const tags = this.extractTags(content)
        const textAfterTags = this.getTextAfterTags(content)
        
        // 태그가 있으면 태그 이후 텍스트만 설정, 없으면 전체 텍스트 설정
        this.newComment = tags ? textAfterTags : content
        
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
        
        const content = possibleContentFields.find(field => field && typeof field === 'string') || ''
        console.log('최종 선택된 답글 내용:', content)
        console.log('newComment 길이:', content.length)
        console.log('=== 답글 수정 디버깅 완료 ===')
        
        // 태그 이후 텍스트만 입력 영역에 설정
        const tags = this.extractTags(content)
        const textAfterTags = this.getTextAfterTags(content)
        
        // 태그가 있으면 태그 이후 텍스트만 설정, 없으면 전체 텍스트 설정
        this.newComment = tags ? textAfterTags : content
        
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
      
      // 수정 모드에서 태그 보호
      if (this.editingItem && (event.key === 'Backspace' || event.key === 'Delete')) {
        this.protectTags(event)
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
        return `${this.replyingTo.userName || this.replyingTo.username}님에게 답글을 작성합니다...`
      } else if (this.editingItem) {
        // 수정 모드일 때 태그가 있으면 태그 이후부터 입력하도록 안내
        const tags = this.extractTags(this.editingItem.content || this.editingItem.text)
        if (tags) {
          return `${tags}에게 답글을 작성합니다`
        }
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
    },
    
    // 태그 보호 함수
    protectTags(event) {
      const input = event.target
      const cursorPosition = input.selectionStart
      const selectionEnd = input.selectionEnd
      const text = this.newComment
      
      // @로 시작하는 태그 패턴 찾기
      const tagRegex = /@([a-zA-Z0-9가-힣_]+)/g
      let match
      let tags = []
      
      while ((match = tagRegex.exec(text)) !== null) {
        tags.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        })
      }
      
      // 선택된 텍스트가 태그와 겹치는지 확인
      const selectionOverlapsTag = tags.some(tag => {
        return (cursorPosition < tag.end && selectionEnd > tag.start)
      })
      
      // 현재 커서 위치가 태그 내부에 있는지 확인
      const currentTag = tags.find(tag => 
        cursorPosition > tag.start && cursorPosition <= tag.end
      )
      
      if (selectionOverlapsTag || currentTag) {
        // 태그와 겹치는 삭제 시도 시 이벤트 취소
        event.preventDefault()
        
        if (selectionOverlapsTag) {
          // 선택된 텍스트가 태그와 겹치는 경우, 태그 외부로 커서 이동
          const firstTag = tags.find(tag => cursorPosition < tag.end && selectionEnd > tag.start)
          if (firstTag) {
            if (event.key === 'Backspace') {
              // Backspace: 첫 번째 태그 시작 부분으로 커서 이동
              input.setSelectionRange(firstTag.start, firstTag.start)
            } else if (event.key === 'Delete') {
              // Delete: 마지막 태그 끝 부분으로 커서 이동
              const lastTag = tags.reverse().find(tag => cursorPosition < tag.end && selectionEnd > tag.start)
              if (lastTag) {
                input.setSelectionRange(lastTag.end, lastTag.end)
              }
            }
          }
        } else if (currentTag) {
          // 커서가 태그 내부에 있는 경우
          if (event.key === 'Backspace') {
            // Backspace: 태그 시작 부분으로 커서 이동
            input.setSelectionRange(currentTag.start, currentTag.start)
          } else if (event.key === 'Delete') {
            // Delete: 태그 끝 부분으로 커서 이동
            input.setSelectionRange(currentTag.end, currentTag.end)
          }
        }
        
        // 사용자에게 알림
        this.showTagProtectionMessage()
      }
    },
    
    // 태그 보호 메시지 표시
    showTagProtectionMessage() {
      // 간단한 토스트 메시지 또는 알림
      console.log('태그는 삭제할 수 없습니다. 태그 전체를 선택하고 삭제하거나, 태그 외부에서 삭제하세요.')
      
      // 시각적 메시지 표시
      this.showVisualMessage('태그는 삭제할 수 없습니다!', 'warning')
      
      // 브라우저 알림 표시 (사용자가 허용한 경우)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('태그 보호', {
          body: '태그는 삭제할 수 없습니다. 태그 외부에서 삭제하세요.',
          icon: '/favicon.ico'
        })
      }
    },
    
    // 시각적 메시지 표시
    showVisualMessage(message, type = 'info') {
      // 기존 메시지 제거
      const existingMessage = document.querySelector('.tag-protection-message')
      if (existingMessage) {
        existingMessage.remove()
      }
      
      // 새 메시지 생성
      const messageElement = document.createElement('div')
      messageElement.className = 'tag-protection-message'
      messageElement.textContent = message
      
      // 타입에 따른 스타일 적용
      if (type === 'warning') {
        messageElement.style.background = '#FF8B8B'
      } else if (type === 'error') {
        messageElement.style.background = '#EF4444'
      } else {
        messageElement.style.background = '#3B82F6'
      }
      
      document.body.appendChild(messageElement)
      
      // 3초 후 자동 제거
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.remove()
        }
      }, 3000)
    },
    
    // 입력 변경 처리
    onInputChange() {
      console.log('댓글 입력:', this.newComment)
      
      // 태그가 있는 경우 시각적 피드백
      if (this.hasTags) {
        console.log('태그가 감지되었습니다:', this.newComment.match(/@([a-zA-Z0-9가-힣_]+)/g))
      }
    },
    

  }
}
</script>

<style scoped>
/* 댓글 사이드바 (기본 스타일 - 중앙 모달용) */
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
  z-index: 1000;
}



.comments-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
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

/* 우클릭 메시지 제거 */

.reply-content.my-comment {
  position: relative;
}

/* 우클릭 메시지 제거 */

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

/* 사이드바 모드 스타일 */
.comments-sidebar {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  left: auto !important;
  bottom: auto !important;
  width: 400px !important;
  height: 100vh !important;
  background: white !important;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1) !important;
  z-index: 1000 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  border-left: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.comments-sidebar-modal {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  background: white !important;
  overflow: hidden !important;
  border-radius: 0 !important;
  max-width: none !important;
  box-shadow: none !important;
}

/* 중앙 모달 모드 스타일 */
.comments-overlay {
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
  z-index: 1000;
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

/* 로딩 상태 */
.loading-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.loading-comments p {
  color: #6B7280;
  font-size: 0.9rem;
  margin: 0;
}

/* 댓글 목록 */
.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* 태그 보호 관련 스타일 */
.comment-field.has-tags {
  border-color: #FF8B8B !important;
  box-shadow: 0 0 0 1px rgba(255, 139, 139, 0.2) !important;
}

.comment-field.has-tags .v-field__input {
  color: #1E293B;
}

.comment-field.has-tags .v-field__outline {
  border-color: #FF8B8B !important;
}

/* 태그 보호 메시지 */
.tag-protection-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #FF8B8B;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.3);
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
