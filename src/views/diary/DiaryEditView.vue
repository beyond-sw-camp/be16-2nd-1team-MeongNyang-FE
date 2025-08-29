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
          {{ mediaList.length === 0 ? '이미지 필요' : '수정' }}
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
                v-if="currentMedia && currentMedia.type === 'image'"
                :src="currentMedia.url" 
                class="main-media"
                cover
                @error="handleImageError(currentMediaIndex.value)"
              ></v-img>
              
              <!-- 비디오 미리보기 -->
              <video 
                v-else-if="currentMedia && currentMedia.type === 'video'"
                :src="currentMedia.url" 
                class="main-media"
                controls
                preload="metadata"
                @error="handleImageError(currentMediaIndex.value)"
              ></video>
              
              <!-- 미디어가 없을 때 -->
              <div v-else-if="!currentMedia" class="no-media">
                <v-icon size="64" color="#CBD5E1">mdi-image-off</v-icon>
                <p>미디어를 불러올 수 없습니다</p>
              </div>
              
              <!-- 삭제 버튼 -->
              <v-btn 
                v-if="currentMedia"
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
              @click="setCurrentMediaIndex(index)"
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
        style="white-space: normal !important; word-wrap: break-word !important; overflow-wrap: break-word !important; word-break: break-all !important; overflow-x: hidden !important; max-width: 100% !important; box-sizing: border-box !important;"
      ></v-textarea>
    </div>

    <!-- 파일 업로드 (숨김) -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp,image/gif,image/bmp,image/tiff"
      @change="handleFileSelect"
      style="display: none"
    >
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { validatePetAndRedirect } from '@/utils/petValidation'
import { useRouter, useRoute } from 'vue-router'
import { postAPI } from '@/services/api'
import { handleApiError } from '@/utils/errorHandler'
import { resizeMultipleImages, isImageFile } from '@/utils/imageResizer'

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
    
    // 기존 미디어 데이터 (원본 상태 보존)
    const originalMediaList = ref([])
    
    // 현재 미디어
    const currentMedia = computed(() => {
      if (mediaList.value.length === 0) return null
      const safeIndex = Math.min(currentMediaIndex.value, mediaList.value.length - 1)
      return mediaList.value[safeIndex]
    })
    
    // 제출 가능 여부
    const canSubmit = computed(() => {
      return content.value.trim() && mediaList.value.length > 0
    })
    
    // 미디어 인덱스 범위 감시
    watch([currentMediaIndex, mediaList], ([index, list]) => {
      if (list.length > 0 && index >= list.length) {
        currentMediaIndex.value = Math.max(0, list.length - 1)
      }
    })
    
    // 수정사항이 있는지 확인
    const hasChanges = computed(() => {
      // 내용 변경 확인
      const contentChanged = originalContent.value !== content.value
      
      // 미디어 변경 확인
      const mediaChanged = (() => {
        // 개수 변경 확인
        if (originalMediaList.value.length !== mediaList.value.length) {
          return true
        }
        
        // 기존 미디어 URL 비교
        const originalUrls = originalMediaList.value.map(m => m.url).sort()
        const currentUrls = mediaList.value
          .filter(m => m.isExisting)
          .map(m => m.url)
          .sort()
        
        if (originalUrls.length !== currentUrls.length) {
          return true
        }
        
        for (let i = 0; i < originalUrls.length; i++) {
          if (originalUrls[i] !== currentUrls[i]) {
            return true
          }
        }
        
        // 새 파일이 있는지 확인
        const hasNewFiles = mediaList.value.some(m => !m.isExisting)
        return hasNewFiles
      })()
      
      return contentChanged || mediaChanged
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
          
          // 내용 로드
          const rawContent = post.content || ''
          const singleLineContent = rawContent.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ')
          content.value = singleLineContent
          originalContent.value = singleLineContent
          
          // 기존 미디어 설정
          if (post.mediaList && post.mediaList.length > 0) {
            console.log('기존 미디어 리스트:', post.mediaList)
            
            const validMedia = []
            
            for (let i = 0; i < post.mediaList.length; i++) {
              const media = post.mediaList[i]
              const mediaUrl = typeof media === 'string' ? media : media.url || media.fileName
              
              if (mediaUrl && mediaUrl.trim() !== '') {
                try {
                  new URL(mediaUrl)
                  
                  const mediaType = mediaUrl.includes('.mp4') ? 'video' : 'image'
                  
                  const mediaItem = {
                    url: mediaUrl,
                    type: mediaType,
                    isExisting: true,
                    originalData: media
                  }
                  
                  validMedia.push(mediaItem)
                  console.log(`기존 미디어 ${i} 설정:`, mediaItem)
                } catch (error) {
                  console.warn(`기존 미디어 ${i} (유효하지 않음):`, media)
                }
              }
            }
            
            originalMediaList.value = [...validMedia]
            mediaList.value = [...validMedia]
            console.log('설정된 기존 미디어:', validMedia)
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
    
    // 미디어 추가
    const addImage = () => {
      if (mediaList.value.length >= 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      fileInput.value.click()
    }
    
    // 파일 선택 처리
    const handleFileSelect = async (event) => {
      console.log('=== 파일 선택 처리 시작 ===')
      const files = Array.from(event.target.files)
      console.log('선택된 파일들:', files)
      
      if (mediaList.value.length + files.length > 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      
      // 이미지 파일 필터링
      const imageFiles = files.filter(file => isImageFile(file))
      const nonImageFiles = files.filter(file => !isImageFile(file))
      
      // 지원하지 않는 파일 형식 알림
      if (nonImageFiles.length > 0) {
        alert(`지원하지 않는 파일 형식입니다: ${nonImageFiles.map(f => f.name).join(', ')}\n이미지 파일(.jpg, .jpeg, .png, .svg, .webp, .gif, .bmp, .tiff)만 업로드 가능합니다.`)
      }
      
      if (imageFiles.length === 0) {
        event.target.value = ''
        return
      }
      
      try {
        // 이미지 리사이즈 (1200x800, 품질 0.8)
        const resizedFiles = await resizeMultipleImages(imageFiles, 1200, 800, 0.8)
        
        // 리사이즈된 이미지들을 미디어 리스트에 추가
        for (let i = 0; i < resizedFiles.length; i++) {
          const resizedFile = resizedFiles[i]
          const reader = new FileReader()
          
          reader.onload = (e) => {
            const newMedia = {
              url: e.target.result,
              type: 'image',
              file: resizedFile, // 리사이즈된 파일 사용
              isExisting: false,
              name: resizedFile.name,
              originalSize: imageFiles[i].size, // 원본 크기 저장
              resizedSize: resizedFile.size // 리사이즈된 크기 저장
            }
            
            console.log(`새 미디어 ${i + 1} 추가 (리사이즈됨):`, newMedia)
            console.log(`원본 크기: ${(imageFiles[i].size / 1024 / 1024).toFixed(2)}MB`)
            console.log(`리사이즈 크기: ${(resizedFile.size / 1024 / 1024).toFixed(2)}MB`)
            
            mediaList.value.push(newMedia)
            
            // 현재 미디어 인덱스를 새로 추가된 파일로 설정
            currentMediaIndex.value = mediaList.value.length - 1
          }
          
          reader.onerror = (error) => {
            console.error(`파일 ${resizedFile.name} 로드 실패:`, error)
            alert(`${resizedFile.name} 파일을 읽는 중 오류가 발생했습니다.`)
          }
          
          reader.readAsDataURL(resizedFile)
        }
      } catch (error) {
        console.error('이미지 리사이즈 실패:', error)
        alert('이미지 처리 중 오류가 발생했습니다.')
      }
      
      // 파일 입력 초기화
      event.target.value = ''
      console.log('=== 파일 선택 처리 완료 ===')
    }
    
    // 현재 미디어 제거
    const removeCurrentMedia = () => {
      console.log('=== 현재 미디어 제거 시작 ===')
      console.log('삭제 전 미디어 리스트:', mediaList.value)
      console.log('삭제 전 현재 인덱스:', currentMediaIndex.value)
      
      if (mediaList.value.length > 0) {
        const mediaToRemove = mediaList.value[currentMediaIndex.value]
        console.log('삭제할 미디어:', mediaToRemove)
        
        // 현재 인덱스의 미디어만 삭제
        mediaList.value.splice(currentMediaIndex.value, 1)
        
        console.log('삭제 후 미디어 리스트:', mediaList.value)
        
        // 인덱스 조정
        if (currentMediaIndex.value >= mediaList.value.length) {
          currentMediaIndex.value = Math.max(0, mediaList.value.length - 1)
        }
        
        console.log('조정 후 현재 인덱스:', currentMediaIndex.value)
        console.log('=== 현재 미디어 제거 완료 ===')
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
    
    // 키보드 네비게이션 (비활성화)
    const handleKeydown = (event) => {
      if (mediaList.value.length <= 1) return
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          event.preventDefault()
          break
      }
    }
    
    // 제출 처리
    const handleSubmit = async () => {
      if (!content.value.trim()) {
        alert('내용을 입력해주세요.')
        return
      }
      
      if (mediaList.value.length === 0) {
        alert('최소 하나의 이미지를 업로드해주세요.')
        return
      }
      
      console.log('=== 다이어리 수정 파일 분석 ===')
      
      // 삭제된 파일명 추출
      const deletedFiles = originalMediaList.value
        .filter(originalMedia => 
          !mediaList.value.some(currentMedia => 
            currentMedia.isExisting && currentMedia.url === originalMedia.url
          )
        )
        .map(media => {
          const urlParts = media.url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          return decodeURIComponent(fileName)
        })
      
      console.log('🗑️ 삭제된 파일명:', deletedFiles)
      
      // 백엔드에 전송할 기존 파일명 (유지되는 파일)
      const existingFiles = mediaList.value
        .filter(media => media.isExisting)
        .map(media => {
          const urlParts = media.url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          return decodeURIComponent(fileName)
        })
      
      console.log('📁 백엔드에 전송할 파일명 (기존):', existingFiles)
      
      // 백엔드에 전송할 새 파일명
      const newFiles = mediaList.value
        .filter(media => !media.isExisting)
        .map(media => media.file.name)
      
      console.log('🆕 백엔드에 전송할 파일명 (새로 추가):', newFiles)
      
      console.log('=== 파일 분석 완료 ===')
      
      if (!hasChanges.value) {
        console.log('수정사항이 없음 - API 호출 생략')
        alert('다이어리 수정에 성공했습니다!')
        $router.push(`/diary/${$route.params.id}`)
        return
      }
      
      try {
        const formData = new FormData()
        
        const newFiles = mediaList.value
          .filter(media => !media.isExisting)
          .map(media => media.file)
          .filter(file => file && file.size > 0)
        
        // 기존 파일들을 URL에서 File 객체로 변환하여 전송
        const existingFiles = []
        for (const media of mediaList.value) {
          if (media.isExisting) {
            try {
              console.log(`기존 파일 변환 시작:`, media.url)
              const response = await fetch(media.url)
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }
              
              const blob = await response.blob()
              const urlParts = media.url.split('/')
              const fileName = decodeURIComponent(urlParts[urlParts.length - 1])
              
              const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' })
              existingFiles.push(file)
              console.log(`기존 파일 변환 완료:`, fileName, file.size)
            } catch (error) {
              console.error(`기존 파일 변환 실패:`, media.url, error)
            }
          }
        }
        
        // 모든 파일 (기존 + 새)을 FormData에 추가
        const allFiles = [...existingFiles, ...newFiles]
        
        if (allFiles.length === 0) {
          console.log('전송할 파일이 없음 - 빈 파일 추가')
          const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' })
          formData.append('files', emptyFile)
        } else {
          allFiles.forEach((file) => {
            formData.append('files', file)
          })
        }
        
        const existingMediaUrls = mediaList.value
          .filter(media => media.isExisting)
          .map(media => media.url)
        
        const contentText = content.value.trim()
        
        const postEditReq = {
          content: contentText,
          existingMediaUrls: existingMediaUrls
        }
        
        const jsonBlob = new Blob([JSON.stringify(postEditReq)], {
          type: 'application/json'
        })
        formData.append('postEditReq', jsonBlob)
        
        // FormData 디버깅
        console.log('=== FormData 디버깅 ===')
        console.log('기존 파일 개수:', existingFiles.length)
        console.log('기존 파일들:', existingFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))
        console.log('새 파일 개수:', newFiles.length)
        console.log('새 파일들:', newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))
        console.log('전체 파일 개수:', allFiles.length)
        console.log('전체 파일들:', allFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))
        console.log('JSON 요청 데이터:', postEditReq)
        
        console.log('FormData 내용:')
        for (let [key, value] of formData.entries()) {
          if (key === 'files') {
            console.log(`${key}:`, {
              name: value.name,
              size: value.size,
              type: value.type
            })
          } else if (key === 'postEditReq') {
            console.log(`${key}: [Blob 객체]`, {
              size: value.size,
              type: value.type
            })
          } else {
            console.log(`${key}:`, value)
          }
        }
        console.log('=== FormData 디버깅 완료 ===')
        
        const postId = $route.params.id
        const response = await postAPI.update(postId, formData)
        
        if (response.status === 200) {
          alert('다이어리 수정에 성공했습니다!')
          $router.push(`/diary/${postId}`)
        } else {
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
    
    const handleDrop = async (e) => {
      e.preventDefault()
      console.log('=== 드래그 앤 드롭 처리 시작 ===')
      
      const files = Array.from(e.dataTransfer.files)
      console.log('드롭된 파일들:', files)
      
      if (mediaList.value.length + files.length > 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      
      // 이미지 파일 필터링
      const imageFiles = files.filter(file => isImageFile(file))
      const nonImageFiles = files.filter(file => !isImageFile(file))
      
      // 지원하지 않는 파일 형식 알림
      if (nonImageFiles.length > 0) {
        alert(`지원하지 않는 파일 형식입니다: ${nonImageFiles.map(f => f.name).join(', ')}\n이미지 파일(.jpg, .jpeg, .png, .svg, .webp, .gif, .bmp, .tiff)만 업로드 가능합니다.`)
      }
      
      if (imageFiles.length === 0) {
        console.log('=== 드래그 앤 드롭 처리 완료 (이미지 파일 없음) ===')
        return
      }
      
      try {
        // 이미지 리사이즈 (1200x800, 품질 0.8)
        const resizedFiles = await resizeMultipleImages(imageFiles, 1200, 800, 0.8)
        
        // 리사이즈된 이미지들을 미디어 리스트에 추가
        for (let i = 0; i < resizedFiles.length; i++) {
          const resizedFile = resizedFiles[i]
          const reader = new FileReader()
          
          reader.onload = (e) => {
            const newMedia = {
              url: e.target.result,
              type: 'image',
              file: resizedFile, // 리사이즈된 파일 사용
              isExisting: false,
              name: resizedFile.name,
              originalSize: imageFiles[i].size, // 원본 크기 저장
              resizedSize: resizedFile.size // 리사이즈된 크기 저장
            }
            
            console.log(`드롭된 미디어 ${i + 1} 추가 (리사이즈됨):`, newMedia)
            console.log(`원본 크기: ${(imageFiles[i].size / 1024 / 1024).toFixed(2)}MB`)
            console.log(`리사이즈 크기: ${(resizedFile.size / 1024 / 1024).toFixed(2)}MB`)
            
            mediaList.value.push(newMedia)
            
            // 현재 미디어 인덱스를 새로 추가된 파일로 설정
            currentMediaIndex.value = mediaList.value.length - 1
          }
          
          reader.onerror = (error) => {
            console.error(`드롭 파일 ${resizedFile.name} 로드 실패:`, error)
            alert(`${resizedFile.name} 파일을 읽는 중 오류가 발생했습니다.`)
          }
          
          reader.readAsDataURL(resizedFile)
        }
      } catch (error) {
        console.error('드래그 앤 드롭 이미지 리사이즈 실패:', error)
        alert('이미지 처리 중 오류가 발생했습니다.')
      }
      
      console.log('=== 드래그 앤 드롭 처리 완료 ===')
    }
    
    // 이미지 로드 실패 처리
    const handleImageError = (index) => {
      console.log('=== 이미지 로드 실패 처리 시작 ===')
      console.log('실패한 이미지 인덱스:', index)
      
      if (index < mediaList.value.length) {
        const removedMedia = mediaList.value[index]
        console.log('제거할 미디어:', removedMedia)
        
        mediaList.value.splice(index, 1)
        
        // 현재 인덱스 조정
        if (currentMediaIndex.value >= mediaList.value.length) {
          currentMediaIndex.value = Math.max(0, mediaList.value.length - 1)
        }
        
        console.log('이미지 로드 실패로 미디어 제거됨. 현재 미디어 개수:', mediaList.value.length)
      }
      
      console.log('=== 이미지 로드 실패 처리 완료 ===')
    }

    // 미디어 인디케이터 클릭 시 현재 미디어 인덱스 변경
    const setCurrentMediaIndex = (index) => {
      console.log('=== 미디어 인디케이터 클릭 ===')
      console.log('클릭된 인덱스:', index)
      
      if (index >= 0 && index < mediaList.value.length) {
        currentMediaIndex.value = index;
        console.log('인덱스 변경됨:', currentMediaIndex.value)
      }
      
      console.log('=== 미디어 인디케이터 클릭 완료 ===')
    };
    
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
      handleSubmit,
      handleImageError,
      setCurrentMediaIndex
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

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.write-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.3);
}

.image-upload-section {
  margin-bottom: 32px;
}

.image-container {
  background: white;
  border: 2px dashed #CBD5E1;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.image-container:hover {
  border-color: #FF8B8B;
  background: #FFFAF0;
}

.empty-image-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-text {
  color: #64748B;
  font-size: 1.1rem;
  margin: 0;
}

.media-gallery {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
}

.media-slider {
  width: 100%;
  height: 100%;
  position: relative;
}

.media-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.main-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.no-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #64748B;
}

.no-media p {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
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
  z-index: 10;
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
  z-index: 10;
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
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  word-break: break-all !important;
  hyphens: auto !important;
  overflow-x: hidden !important;
}

.content-input :deep(.v-field__input textarea) {
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  word-break: break-all !important;
  hyphens: auto !important;
  overflow-x: hidden !important;
  line-height: 1.6 !important;
  font-size: 1rem !important;
  color: #1E293B !important;
}

.content-input :deep(.v-field__outline) {
  border-color: #E2E8F0 !important;
}

.content-input :deep(.v-field--focused .v-field__outline) {
  border-color: #FF8B8B !important;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .diary-edit-page {
    padding: 16px;
  }
  
  .header {
    margin-bottom: 24px;
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .image-container {
    padding: 24px;
  }
  
  .media-gallery {
    height: 400px;
  }
  
  .upload-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .diary-edit-page {
    padding: 12px;
  }
  
  .header {
    padding: 0 12px;
  }
  
  .image-container {
    padding: 16px;
  }
  
  .media-gallery {
    height: 300px;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
}
</style>
