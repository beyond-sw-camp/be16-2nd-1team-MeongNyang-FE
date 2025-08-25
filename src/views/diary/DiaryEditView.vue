<template>
  <div class="diary-edit-page">
    <!-- 헤더 -->
    <div class="header">
      <div class="header-left">
        <h1 class="page-title">일기 수정</h1>
      </div>
      <div class="header-right">
        <v-btn 
          color="#FF8B8B" 
          class="write-btn"
          @click="handleSubmit"
          :disabled="!canSubmit"
        >
          수정
        </v-btn>
      </div>
    </div>

    <!-- 이미지 업로드 영역 -->
    <div class="image-upload-section">
      <div 
        class="image-container" 
        @click="addImage"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <div v-if="mediaList.length === 0" class="empty-image-state">
          <v-icon size="64" color="#CBD5E1">mdi-image-plus</v-icon>
          <p class="upload-text">드래그 또는 + 버튼을 눌러 미디어를 삽입하세요(최대 10장)</p>
        </div>
        
        <div v-else class="media-gallery">
          <div class="media-slider" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag" @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag">
            <div class="media-wrapper">
              <!-- 이미지 미리보기 -->
              <v-img 
                v-if="currentMedia.type === 'image'"
                :src="currentMedia.url" 
                class="main-media"
                cover
              ></v-img>
              
              <!-- 비디오 미리보기 -->
              <video 
                v-else-if="currentMedia.type === 'video'"
                :src="currentMedia.url" 
                class="main-media"
                controls
                preload="metadata"
              ></video>
              
              <!-- 삭제 버튼 -->
              <v-btn 
                icon 
                class="delete-btn"
                @click.stop="removeCurrentMedia"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              
              <!-- 미디어 네비게이션 -->
              <div v-if="mediaList.length > 1" class="media-navigation">
                <v-btn 
                  icon 
                  class="nav-btn prev-btn"
                  @click.stop="previousMedia"
                  :disabled="currentMediaIndex === 0"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  class="nav-btn next-btn"
                  @click.stop="nextMedia"
                  :disabled="currentMediaIndex === mediaList.length - 1"
                >
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
              
              <!-- 추가 버튼 -->
              <v-btn 
                icon 
                class="add-btn"
                @click.stop="addImage"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
          
          <!-- 미디어 인디케이터 -->
          <div v-if="mediaList.length > 1" class="media-indicators">
            <div 
              v-for="(media, index) in mediaList" 
              :key="index"
              class="indicator"
              :class="{ active: index === currentMediaIndex }"
              @click="currentMediaIndex = index"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력 필드 -->
    <div class="input-section">
      <v-textarea
        v-model="content"
        placeholder="내용을 입력하세요(#을 입력하면 해시태그)"
        variant="outlined"
        class="content-input"
        auto-grow
        rows="8"
        hide-details
        @input="handleContentInput"
      ></v-textarea>
    </div>

    <!-- 파일 업로드 (숨김) -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*,video/*"
      @change="handleFileSelect"
      style="display: none"
    >
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { validatePetAndRedirect } from '@/utils/petValidation'
import { useRouter, useRoute } from 'vue-router'
import { postAPI } from '@/services/api'
import { handleApiError } from '@/utils/errorHandler'

export default {
  name: 'DiaryEditView',
  setup() {
    const $router = useRouter()
    const $route = useRoute()
    const fileInput = ref(null)
    
    // 폼 데이터
    const content = ref('')
    const originalContent = ref('') // 원본 내용 저장
    const mediaList = ref([])
    const currentMediaIndex = ref(0)
    const isDragging = ref(false)
    const dragStartX = ref(0)
    const dragStartIndex = ref(0)
    const isLoading = ref(true)
    
    // 기존 미디어 데이터 (URL만 저장)
    const existingMedia = ref([])
    
    // 현재 미디어
    const currentMedia = computed(() => {
      if (mediaList.value.length === 0) return null
      return mediaList.value[currentMediaIndex.value]
    })
    
    // 제출 가능 여부
    const canSubmit = computed(() => {
      return content.value.trim() && mediaList.value.length > 0
    })
    
               // 수정사항이 있는지 확인
           const hasChanges = computed(() => {
             console.log('=== 수정사항 확인 시작 ===')
             console.log('기존 미디어 개수:', existingMedia.value.length)
             console.log('현재 미디어 리스트:', mediaList.value)
             
             // 내용이 변경되었는지 확인
             const originalPost = existingMedia.value.length > 0 ? {
               content: originalContent.value, // 원본 내용과 비교
               mediaCount: existingMedia.value.length
             } : null
             
             console.log('원본 포스트 데이터:', originalPost)
             
             if (!originalPost) {
               console.log('새로 생성된 포스트 - 수정사항 있음')
               return true // 새로 생성된 경우
             }
             
             // 현재 상태와 비교
             const currentState = {
               content: content.value,
               mediaCount: mediaList.value.length
             }
             
             console.log('현재 상태:', currentState)
             
             const contentChanged = originalPost.content !== currentState.content
             const mediaCountChanged = originalPost.mediaCount !== currentState.mediaCount
             
             // 미디어 내용 변경 확인 (기존 파일 삭제/추가/교체)
             const mediaContentChanged = (() => {
               // 기존 미디어와 현재 미디어 비교
               const existingMediaUrls = existingMedia.value.map(media => media.url).sort()
               const currentMediaUrls = mediaList.value
                 .filter(media => media.isExisting)
                 .map(media => media.url)
                 .sort()
               
               console.log('기존 미디어 URL들:', existingMediaUrls)
               console.log('현재 기존 미디어 URL들:', currentMediaUrls)
               
               // URL 배열이 다르면 내용 변경
               if (existingMediaUrls.length !== currentMediaUrls.length) {
                 console.log('미디어 URL 개수 다름 - 내용 변경됨')
                 return true
               }
               
               for (let i = 0; i < existingMediaUrls.length; i++) {
                 if (existingMediaUrls[i] !== currentMediaUrls[i]) {
                   console.log('미디어 URL 내용 다름 - 내용 변경됨')
                   return true
                 }
               }
               
               // 새로 추가된 파일이 있는지 확인
               const hasNewFiles = mediaList.value.some(media => !media.isExisting)
               if (hasNewFiles) {
                 console.log('새로 추가된 파일 있음 - 내용 변경됨')
                 return true
               }
               
               console.log('미디어 내용 변경 없음')
               return false
             })()
             
             console.log('내용 변경:', contentChanged, `"${originalPost.content}" -> "${currentState.content}"`)
             console.log('미디어 개수 변경:', mediaCountChanged, `${originalPost.mediaCount} -> ${currentState.mediaCount}`)
             console.log('미디어 내용 변경:', mediaContentChanged)
             
             const hasChangesResult = contentChanged || mediaCountChanged || mediaContentChanged
             console.log('최종 수정사항 여부:', hasChangesResult)
             console.log('=== 수정사항 확인 완료 ===')
             
             return hasChangesResult
           })
    
    // 포스트 데이터 가져오기
    const fetchPostData = async () => {
      try {
        isLoading.value = true
        const postId = $route.params.id
        console.log('포스트 데이터 조회 시작 - postId:', postId)
        
        const response = await postAPI.getDetail(postId)
        console.log('포스트 데이터 응답:', response)
        
        if (response.data && response.data.data) {
          const post = response.data.data
          content.value = post.content || ''
          originalContent.value = post.content || '' // 원본 내용 저장
          
          // 기존 미디어 설정
          if (post.mediaList && post.mediaList.length > 0) {
            console.log('기존 미디어 리스트:', post.mediaList)
            existingMedia.value = post.mediaList.map((media, index) => {
              // media가 문자열인지 객체인지 확인
              const mediaUrl = typeof media === 'string' ? media : media.url || media.fileName
              const mediaType = mediaUrl.includes('.mp4') ? 'video' : 'image'
              
              console.log(`기존 미디어 ${index}:`, {
                original: media,
                url: mediaUrl,
                type: mediaType
              })
              
              return {
                url: mediaUrl,
                type: mediaType,
                isExisting: true,
                index: index,
                originalData: media // 원본 데이터 보존
              }
            })
            mediaList.value = [...existingMedia.value]
            console.log('설정된 기존 미디어:', existingMedia.value)
          }
          
          console.log('포스트 데이터 설정 완료')
        } else {
          console.error('포스트 데이터가 없음')
          throw new Error('포스트 데이터를 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('포스트 데이터 조회 실패:', error)
        handleApiError(error, $router, '포스트를 불러오는데 실패했습니다.')
        $router.push('/diarys')
      } finally {
        isLoading.value = false
      }
    }
    

    
    // URL을 File 객체로 변환
    const urlToFile = async (url, fileName) => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const blob = await response.blob()
        const file = new File([blob], fileName, { type: blob.type })
        return file
      } catch (error) {
        console.error('URL을 File로 변환 실패:', error)
        throw error
      }
    }
    
    // URL에서 파일명 추출 (마지막 - 이후 부분)
    const extractFileNameFromUrl = (url) => {
      if (!url) return 'unknown.jpg'
      
      try {
        // URL에서 파일명 부분 추출
        const urlParts = url.split('/')
        const fullFileName = urlParts[urlParts.length - 1]
        
        // URL 디코딩
        const decodedFileName = decodeURIComponent(fullFileName)
        
        // - 이후 부분 추출
        const dashIndex = decodedFileName.lastIndexOf('-')
        if (dashIndex !== -1) {
          const fileName = decodedFileName.substring(dashIndex + 1)
          console.log('파일명 추출:', { original: decodedFileName, extracted: fileName })
          return fileName
        }
        
        // -가 없으면 전체 파일명 사용
        console.log('파일명 추출 (대시 없음):', decodedFileName)
        return decodedFileName
      } catch (error) {
        console.error('파일명 추출 실패:', error)
        return 'unknown.jpg'
      }
    }
    
    // 미디어 추가
    const addImage = () => {
      if (mediaList.value.length >= 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      fileInput.value.click()
    }
    
    // 파일 선택 처리
    const handleFileSelect = (event) => {
      console.log('=== 파일 선택 처리 시작 ===')
      const files = Array.from(event.target.files)
      console.log('선택된 파일들:', files)
      
      if (mediaList.value.length + files.length > 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      
      // 파일 유효성 검사 및 처리
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다. 이미지나 비디오 파일만 업로드 가능합니다.`)
          return false
        }
        
        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}의 파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.`)
          return false
        }
        
        return true
      })
      
      console.log('유효한 파일들:', validFiles)
      
      // 파일을 미디어 리스트에 추가
      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const mediaType = file.type.startsWith('image/') ? 'image' : 'video'
          const newMedia = {
            url: e.target.result,
            type: mediaType,
            file: file,
            isExisting: false,
            name: file.name,
            size: file.size
          }
          
          console.log(`새 미디어 추가:`, newMedia)
          mediaList.value.push(newMedia)
          
          // 현재 미디어 인덱스를 새로 추가된 파일로 설정
          currentMediaIndex.value = mediaList.value.length - 1
        }
        
        reader.onerror = (error) => {
          console.error(`파일 ${file.name} 로드 실패:`, error)
          alert(`${file.name} 파일을 읽는 중 오류가 발생했습니다.`)
        }
        
        reader.readAsDataURL(file)
      })
      
      // 파일 입력 초기화
      event.target.value = ''
      console.log('=== 파일 선택 처리 완료 ===')
    }
    
    // 현재 미디어 제거
    const removeCurrentMedia = () => {
      if (mediaList.value.length > 0) {
        mediaList.value.splice(currentMediaIndex.value, 1)
        if (currentMediaIndex.value >= mediaList.value.length) {
          currentMediaIndex.value = Math.max(0, mediaList.value.length - 1)
        }
      }
    }
    
    // 미디어 네비게이션
    const previousMedia = () => {
      if (currentMediaIndex.value > 0) {
        currentMediaIndex.value--
      }
    }
    
    const nextMedia = () => {
      if (currentMediaIndex.value < mediaList.value.length - 1) {
        currentMediaIndex.value++
      }
    }
    
    // 드래그 기능
    const startDrag = (event) => {
      if (mediaList.value.length <= 1) return
      isDragging.value = true
      dragStartX.value = event.clientX || event.touches[0].clientX
      dragStartIndex.value = currentMediaIndex.value
      event.preventDefault()
    }
    
    const onDrag = (event) => {
      if (!isDragging.value) return
      event.preventDefault()
    }
    
    const endDrag = (event) => {
      if (!isDragging.value) return
      
      const dragEndX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX)
      const dragDistance = dragStartX.value - dragEndX
      const threshold = 100
      
      if (Math.abs(dragDistance) > threshold) {
        if (dragDistance > 0 && currentMediaIndex.value < mediaList.value.length - 1) {
          nextMedia()
        } else if (dragDistance < 0 && currentMediaIndex.value > 0) {
          previousMedia()
        }
      }
      
      isDragging.value = false
    }
    
    // 콘텐츠 입력 처리
    const handleContentInput = () => {
      // v-model이 자동으로 처리하므로 별도 로직 불필요
    }
    
    // 키보드 네비게이션
    const handleKeydown = (event) => {
      if (mediaList.value.length <= 1) return
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          previousMedia()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextMedia()
          break
      }
    }
    
    // 제출 처리
    const handleSubmit = async () => {
      if (!content.value.trim()) {
        alert('내용을 입력해주세요.')
        return
      }
      
                   // 수정사항이 없는 경우 API 호출 없이 성공 처리
             console.log('=== 제출 전 수정사항 확인 ===')
             console.log('hasChanges.value:', hasChanges.value)
             
             if (!hasChanges.value) {
               console.log('수정사항이 없음 - API 호출 생략')
               console.log('성공 메시지 표시 후 상세 페이지로 이동')
               alert('다이어리 수정에 성공했습니다!')
               $router.push(`/diary/${$route.params.id}`)
               return
             }
             
             console.log('수정사항이 있음 - API 호출 진행')
      
      try {
        console.log('=== 다이어리 수정 시작 ===')
        console.log('내용:', content.value)
        console.log('미디어 개수:', mediaList.value.length)
        
        const formData = new FormData()
        
        // 모든 미디어를 File 객체로 변환하여 FormData에 추가
        const allFiles = []
        
        for (let i = 0; i < mediaList.value.length; i++) {
          const media = mediaList.value[i]
          
          if (media.isExisting) {
            // 기존 파일: URL에서 실제 이미지 데이터를 가져와서 File 객체 생성
            try {
              console.log(`기존 파일 ${i} 처리 시작:`, media.url)
              const file = await urlToFile(media.url, extractFileNameFromUrl(media.url))
              console.log(`기존 파일 ${i} 변환 완료:`, file.name, file.type, file.size)
              allFiles.push(file)
            } catch (error) {
              console.error(`기존 파일 ${i} 변환 실패:`, error)
              // 변환 실패 시 빈 파일로 대체
              const fileName = extractFileNameFromUrl(media.url)
              const emptyFile = new File([''], fileName, { type: 'image/jpeg' })
              allFiles.push(emptyFile)
            }
          } else {
            // 새 파일: 실제 파일 사용
            console.log(`새 파일 ${i} 처리:`, media.file.name, media.file.type, media.file.size)
            allFiles.push(media.file)
          }
        }
        
        console.log('전체 파일 목록:', allFiles.map(f => f.name))
        console.log('전체 파일 개수:', allFiles.length)
        
        // 모든 파일을 FormData에 추가
        allFiles.forEach((file, index) => {
          console.log(`파일 ${index} 추가:`, file.name, file.type, file.size)
          formData.append('files', file)
        })
        
        // 기존 미디어 URL들을 JSON에 포함 (삭제된 파일은 제외)
        const existingMediaUrls = mediaList.value
          .filter(media => media.isExisting)
          .map(media => media.url)
        
        console.log('기존 미디어 URL들:', existingMediaUrls)
        console.log('기존 미디어 개수:', existingMediaUrls.length)
        
        // 전체 미디어 리스트 상태 확인
        console.log('=== 전체 미디어 리스트 상태 ===')
        mediaList.value.forEach((media, index) => {
          console.log(`미디어 ${index}:`, {
            url: media.url.substring(0, 50) + '...',
            type: media.type,
            isExisting: media.isExisting,
            hasFile: !!media.file,
            name: media.name || '기존 파일'
          })
        })
        
        // 파일이 없으면 빈 파일 추가 (백엔드 요구사항)
        if (allFiles.length === 0) {
          const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' })
          formData.append('files', emptyFile)
        }
        
        // 해시태그 추출 및 로깅 (해시태그 뒤 글자도 포함)
        const contentText = content.value.trim()
        const hashtagRegex = /#\S+/g
        const extractedHashtags = contentText.match(hashtagRegex) || []
        
        console.log('=== 해시태그 디버깅 ===')
        console.log('원본 내용:', contentText)
        console.log('추출된 해시태그:', extractedHashtags)
        console.log('해시태그 개수:', extractedHashtags.length)
        
        // 해시태그 뒤 글자 확인
        extractedHashtags.forEach((hashtag, index) => {
          const hashtagIndex = contentText.indexOf(hashtag)
          const afterHashtag = contentText.substring(hashtagIndex + hashtag.length)
          console.log(`해시태그 ${index + 1}: "${hashtag}" 뒤 글자: "${afterHashtag}"`)
        })
        
        // JSON 데이터를 별도의 RequestPart로 추가
        const postEditReq = {
          content: contentText,
          existingMediaUrls: existingMediaUrls
        }
        
        console.log('=== JSON 요청 데이터 ===')
        console.log('내용:', postEditReq.content)
        console.log('내용 길이:', postEditReq.content.length)
        console.log('기존 미디어 URL 배열:', postEditReq.existingMediaUrls)
        console.log('기존 미디어 URL 개수:', postEditReq.existingMediaUrls.length)
        console.log('전송할 전체 파일 개수:', allFiles.length)
        
        const jsonBlob = new Blob([JSON.stringify(postEditReq)], {
          type: 'application/json'
        })
        formData.append('postEditReq', jsonBlob)
        
        console.log('FormData 구성 완료')
        console.log('FormData 내용:')
        for (let [key, value] of formData.entries()) {
          if (key === 'postEditReq') {
            try {
              console.log(`${key}:`, JSON.parse(value))
            } catch (error) {
              console.log(`${key}: [JSON 파싱 실패]`, value)
            }
          } else {
            console.log(`${key}:`, value)
          }
        }
        
        console.log('=== 최종 전송 데이터 확인 ===')
        console.log('전송할 내용:', contentText)
        console.log('전송할 해시태그:', extractedHashtags)
        console.log('전송할 파일 개수:', allFiles.length)
        
        const postId = $route.params.id
        const response = await postAPI.update(postId, formData)
        console.log('다이어리 수정 응답:', response)
        console.log('응답 데이터:', response.data)
        
        if (response.status === 200) {
          console.log('다이어리 수정 성공')
          console.log('=== 수정 완료 확인 ===')
          console.log('전송한 해시태그:', extractedHashtags)
          console.log('백엔드 응답 해시태그:', response.data?.data?.hashTagList || '응답에 해시태그 정보 없음')
          alert('다이어리 수정에 성공했습니다!')
          $router.push(`/diary/${postId}`)
        } else {
          console.error('다이어리 수정 실패 - 예상치 못한 응답:', response)
          throw new Error('다이어리 수정에 실패했습니다.')
        }
      } catch (error) {
        console.error('다이어리 수정 실패:', error)
        handleApiError(error, $router, '다이어리 수정에 실패했습니다.')
      }
    }
    
    // 드래그 앤 드롭 이벤트
    const handleDragOver = (e) => {
      e.preventDefault()
    }
    
    const handleDrop = (e) => {
      e.preventDefault()
      console.log('=== 드래그 앤 드롭 처리 시작 ===')
      
      const files = Array.from(e.dataTransfer.files)
      console.log('드롭된 파일들:', files)
      
      if (mediaList.value.length + files.length > 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      
      // 파일 유효성 검사 및 처리
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다. 이미지나 비디오 파일만 업로드 가능합니다.`)
          return false
        }
        
        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}의 파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.`)
          return false
        }
        
        return true
      })
      
      console.log('유효한 드롭 파일들:', validFiles)
      
      // 파일을 미디어 리스트에 추가
      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const mediaType = file.type.startsWith('image/') ? 'image' : 'video'
          const newMedia = {
            url: e.target.result,
            type: mediaType,
            file: file,
            isExisting: false,
            name: file.name,
            size: file.size
          }
          
          console.log(`드롭된 미디어 추가:`, newMedia)
          mediaList.value.push(newMedia)
          
          // 현재 미디어 인덱스를 새로 추가된 파일로 설정
          currentMediaIndex.value = mediaList.value.length - 1
        }
        
        reader.onerror = (error) => {
          console.error(`드롭 파일 ${file.name} 로드 실패:`, error)
          alert(`${file.name} 파일을 읽는 중 오류가 발생했습니다.`)
        }
        
        reader.readAsDataURL(file)
      })
      
      console.log('=== 드래그 앤 드롭 처리 완료 ===')
    }
    
    onMounted(async () => {
      // 펫 등록 여부 확인
      const hasPet = await validatePetAndRedirect($router)
      if (!hasPet) return
      
      // 기존 데이터 불러오기
      fetchPostData()
      
      // 키보드 이벤트 리스너 추가
      document.addEventListener('keydown', handleKeydown)
    })
    
    onUnmounted(() => {
      // 키보드 이벤트 리스너 제거
      document.removeEventListener('keydown', handleKeydown)
    })
    
    return {
      fileInput,
      content,
      originalContent,
      mediaList,
      currentMediaIndex,
      currentMedia,
      canSubmit,
      hasChanges,
      isLoading,
      addImage,
      handleFileSelect,
      removeCurrentMedia,
      previousMedia,
      nextMedia,
      startDrag,
      onDrag,
      endDrag,
      handleDragOver,
      handleDrop,
      handleContentInput,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.diary-edit-page {
  min-height: 100vh;
  background: #FFFAF0;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 20px;
}

.header-left {
  margin-left: -10px;
}

.header-right {
  margin-right: -20px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.write-btn {
  font-weight: 700;
  text-transform: none;
  border-radius: 8px;
  padding: 12px 24px;
  background-color: #FF8B8B !important;
  color: white !important;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-section {
  margin-bottom: 32px;
}

.image-container {
  background: white;
  border-radius: 16px;
  border: 2px dashed #E2E8F0;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-container:hover {
  border-color: #FF8B8B;
}

.empty-image-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.upload-text {
  margin-top: 16px;
  color: #64748B;
  font-size: 0.9rem;
  line-height: 1.5;
}

.media-gallery {
  width: 100%;
  height: 100%;
}

.media-slider {
  position: relative;
  width: 100%;
  height: 400px;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.media-slider:active {
  cursor: grabbing;
}

.media-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.main-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  z-index: 10;
}

.add-btn {
  position: absolute;
  top: 16px;
  right: 60px;
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  z-index: 10;
}

.media-navigation {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  pointer-events: auto;
}

.media-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}



.content-input {
  background: white;
  border-radius: 12px;
  min-height: 200px;
}

.content-input :deep(.v-field) {
  border-radius: 12px;
}

.content-input :deep(.v-field__input) {
  min-height: 200px;
}

/* 반응형 */
@media (max-width: 768px) {
  .diary-edit-page {
    padding: 16px;
  }
  
  .header {
    padding: 0 10px;
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .write-btn {
    padding: 10px 20px;
  }
  
  .image-container {
    min-height: 350px;
  }
  
  .media-slider {
    height: 350px;
  }
  
  .upload-text {
    font-size: 0.85rem;
  }
}
</style>
