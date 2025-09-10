<template>
  <div class="diary-create-page">
    <!-- 헤더 -->
    <div class="header">
      <div class="header-left">
        <h1 class="page-title">새 일기</h1>
      </div>
      <div class="header-right">
        <button 
          type="button"
          class="write-btn"
          @click="handleSubmit"
          :disabled="!canSubmit || isSubmitting"
        >
          <div v-if="!isSubmitting" class="btn-content">
            <v-icon icon="mdi-check" size="18" />
            작성
          </div>
          <div v-else class="btn-content">
            <div class="loading-spinner-small"></div>
            작성 중...
          </div>
        </button>
      </div>
    </div>

    <!-- 이미지 업로드 영역 -->
    <div class="image-upload-section">
      <div class="image-container" @click="addImage">
        <div v-if="mediaList.length === 0" class="empty-image-state">
          <v-icon size="64" color="#CBD5E1">mdi-image-plus</v-icon>
          <p class="upload-text">드래그 또는 + 버튼을 눌러 이미지를 삽입하세요(최대 10장)</p>
        </div>
        
        <div v-else class="media-gallery">
          <div class="media-slider" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag" @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag">
            <div class="media-wrapper">
              <!-- 이미지 미리보기 -->
              <v-img 
                v-if="currentMedia.type === 'image'"
                :src="currentMedia.url" 
                class="main-media"
                contain
              ></v-img>
              
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
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    >
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { validatePetAndRedirect } from '@/utils/petValidation'
import { useRouter } from 'vue-router'
import { postAPI } from '@/services/api'
import { handleApiError } from '@/utils/errorHandler'
import { convertImageForBrowser, isHeicFile, validateImageFile } from '@/utils/imageConverter'

export default {
  name: 'DiaryCreateView',
  setup() {
    const $router = useRouter()
    const fileInput = ref(null)
    
    // 폼 데이터
    const content = ref('')
    const mediaList = ref([])
    const currentMediaIndex = ref(0)
    const isDragging = ref(false)
    const dragStartX = ref(0)
    const dragStartIndex = ref(0)
    const isSubmitting = ref(false)
    
    // 현재 미디어
    const currentMedia = computed(() => {
      if (mediaList.value.length === 0) return null
      return mediaList.value[currentMediaIndex.value]
    })
        

    
    // 제출 가능 여부
    const canSubmit = computed(() => {
      return content.value.trim() && mediaList.value.length > 0 && !isSubmitting.value
    })
    
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
      const files = Array.from(event.target.files)
      
      if (mediaList.value.length + files.length > 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      
      for (const file of files) {
        // 파일 유효성 검사
        const validation = validateImageFile(file, 10 * 1024 * 1024)
        if (!validation.isValid) {
          alert(validation.error)
          continue
        }
        
        try {
          // HEIC 파일인 경우 변환
          let processedFile = file
          if (isHeicFile(file)) {
            console.log('🔄 HEIC 파일 감지, 변환 시작...')
            processedFile = await convertImageForBrowser(file)
            console.log('✅ HEIC 파일 변환 완료')
          }
          
          const reader = new FileReader()
          reader.onload = (e) => {
            mediaList.value.push({
              url: e.target.result,
              type: 'image',
              file: processedFile
            })
          }
          reader.readAsDataURL(processedFile)
        } catch (error) {
          console.error('❌ 이미지 처리 실패:', error)
          alert(`이미지 처리 중 오류가 발생했습니다: ${error.message}`)
        }
      }
      
      // 파일 입력 초기화
      event.target.value = ''
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
      const threshold = 100 // 드래그 임계값 증가
      
      if (Math.abs(dragDistance) > threshold) {
        if (dragDistance > 0 && currentMediaIndex.value < mediaList.value.length - 1) {
          // 왼쪽으로 드래그 - 다음 미디어
          nextMedia()
        } else if (dragDistance < 0 && currentMediaIndex.value > 0) {
          // 오른쪽으로 드래그 - 이전 미디어
          previousMedia()
        }
      }
      
      isDragging.value = false
    }
    
    // 콘텐츠 입력 처리
    const handleContentInput = () => {
      // 해시태그 실시간 강조를 위한 추가 처리
      // v-model이 자동으로 처리하므로 별도 로직 불필요
    }
    
    // 키보드 네비게이션
    const handleKeydown = (event) => {
      // 텍스트 입력 필드에 포커스가 있다면 기본 동작 허용
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        return
      }

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
      // 이미 제출 중이면 중복 제출 방지
      if (isSubmitting.value) {
        return
      }
      
      if (!content.value.trim()) {
        alert('내용을 입력해주세요.')
        return
      }
      
      if (mediaList.value.length === 0) {
        alert('최소 하나의 이미지를 업로드해주세요.')
        return
      }
      
      // 제출 시작
      isSubmitting.value = true
      
      try {
        console.log('=== 다이어리 작성 시작 ===')
        console.log('내용:', content.value)
        console.log('미디어 개수:', mediaList.value.length)
        
        const formData = new FormData()
        
        // 미디어 파일들을 비동기적으로 처리
        const filePromises = mediaList.value.map(async (media, index) => {
          console.log(`미디어 ${index} 처리:`, media)
          
          if (media.isExisting) {
            // 기존 S3 파일인 경우
            console.log(`기존 미디어 ${index} 변환 시작:`, media.url)
            
            try {
              const response = await fetch(media.url)
              const blob = await response.blob()
              const file = new File([blob], `existing_media_${index}.jpg`, {
                type: 'image/jpeg'
              })
              console.log(`기존 미디어 ${index} 변환 완료:`, file)
              return file
            } catch (error) {
              console.error(`기존 미디어 ${index} 변환 실패:`, error)
              throw new Error(`이미지 로드 실패: ${media.url}`)
            }
          } else {
            // 새로 업로드된 파일인 경우
            console.log(`새 미디어 ${index} 추가:`, media.file)
            return media.file
          }
        })
        
        // 모든 파일 처리가 완료될 때까지 대기
        const files = await Promise.all(filePromises)
        
        // 파일들을 FormData에 추가
        files.forEach(file => {
          formData.append('files', file)
        })
        
        // JSON 데이터를 별도의 RequestPart로 추가
        const postCreateRequest = {
          content: content.value.trim()
        }
        
        const jsonBlob = new Blob([JSON.stringify(postCreateRequest)], {
          type: 'application/json'
        })
        formData.append('postCreateRequest', jsonBlob)
        
        console.log('FormData 구성 완료')
        console.log('FormData 내용:')
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value)
        }
        
        const response = await postAPI.create(formData)
        console.log('다이어리 작성 응답:', response)
        
        if (response.status === 201) {
          console.log('다이어리 작성 성공')
          alert('다이어리 작성에 성공했습니다!')
          $router.push('/diarys')
        } else {
          console.error('다이어리 작성 실패 - 예상치 못한 응답:', response)
          throw new Error('다이어리 작성에 실패했습니다.')
        }
      } catch (error) {
        console.error('다이어리 작성 실패:', error)
        handleApiError(error, $router, '다이어리 작성에 실패했습니다.')
      } finally {
        // 제출 완료 (성공/실패 관계없이)
        isSubmitting.value = false
      }
    }
    
    // 드래그 앤 드롭 이벤트
    const handleDragOver = (e) => {
      e.preventDefault()
    }
    
    const handleDrop = async (e) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      
      if (mediaList.value.length + files.length > 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      
      for (const file of files) {
        // 파일 유효성 검사
        const validation = validateImageFile(file, 10 * 1024 * 1024)
        if (!validation.isValid) {
          alert(validation.error)
          continue
        }
        
        try {
          // HEIC 파일인 경우 변환
          let processedFile = file
          if (isHeicFile(file)) {
            console.log('🔄 HEIC 파일 감지, 변환 시작...')
            processedFile = await convertImageForBrowser(file)
            console.log('✅ HEIC 파일 변환 완료')
          }
          
          const reader = new FileReader()
          reader.onload = (e) => {
            mediaList.value.push({
              url: e.target.result,
              type: 'image',
              file: processedFile
            })
          }
          reader.readAsDataURL(processedFile)
        } catch (error) {
          console.error('❌ 이미지 처리 실패:', error)
          alert(`이미지 처리 중 오류가 발생했습니다: ${error.message}`)
        }
      }
    }
    
    onMounted(async () => {
      // 펫 등록 여부 확인
      const hasPet = await validatePetAndRedirect($router)
      if (!hasPet) return
      
      // 드래그 앤 드롭 이벤트 리스너 추가
      const imageContainer = document.querySelector('.image-container')
      if (imageContainer) {
        imageContainer.addEventListener('dragover', handleDragOver)
        imageContainer.addEventListener('drop', handleDrop)
      }
      
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
        mediaList,
        currentMediaIndex,
        currentMedia,
        canSubmit,
        isSubmitting,
        addImage,
        handleFileSelect,
        removeCurrentMedia,
        previousMedia,
        nextMedia,
        startDrag,
        onDrag,
        endDrag,
        handleContentInput,
        handleSubmit
      }
  }
}
</script>

<style scoped>
.diary-create-page {
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
  font-weight: 600;
  text-transform: none;
  border-radius: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3) !important;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease !important;
  border: none !important;
  font-size: 1rem !important;
}

.write-btn:hover:not(:disabled) {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4) !important;
}

.write-btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* 로딩 스피너 */
.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  object-fit: contain;
  background-color: #f8f9fa;
}

.delete-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #f87171 0%, #fca5a5 100%) !important;
  color: white !important;
  z-index: 10;
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.25) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(10px) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
}

.delete-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 20px rgba(248, 113, 113, 0.35) !important;
  background: linear-gradient(135deg, #fb7185 0%, #f87171 100%) !important;
}

.delete-btn:active {
  transform: translateY(0) scale(0.95) !important;
  box-shadow: 0 2px 8px rgba(248, 113, 113, 0.25) !important;
}

.add-btn {
  position: absolute;
  top: 16px;
  right: 60px;
  background: linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%) !important;
  color: white !important;
  z-index: 10;
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.25) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(10px) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
}

.add-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 20px rgba(96, 165, 250, 0.35) !important;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important;
}

.add-btn:active {
  transform: translateY(0) scale(0.95) !important;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.25) !important;
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
  background: transparent !important;
  background-color: transparent !important;
  color: white !important;
  pointer-events: auto;
  transition: color 0.3s ease, transform 0.3s ease;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  min-width: 60px !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  box-shadow: none !important;
  border: none !important;
}

.nav-btn .v-icon {
  font-size: 36px !important;
}

.nav-btn :deep(.v-btn__overlay) {
  background: transparent !important;
  opacity: 0 !important;
}

.nav-btn :deep(.v-btn__underlay) {
  background: transparent !important;
  opacity: 0 !important;
}

.nav-btn :deep(.v-ripple__container) {
  display: none !important;
}

.nav-btn :deep(.v-btn__ripple) {
  display: none !important;
}

.nav-btn:hover {
  background: transparent !important;
  background-color: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  transform: scale(1.1);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  box-shadow: none !important;
}

.nav-btn:disabled {
  opacity: 0.3;
  transform: none;
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
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
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background: #FF8B8B;
  border-color: #FF8B8B;
  transform: scale(1.2);
}

.indicator:hover {
  background: #FF8B8B;
  transform: scale(1.1);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}



.content-input {
  background: white;
  border-radius: 12px;
}

.content-input :deep(.v-field) {
  border-radius: 12px;
}

.content-input :deep(.v-field__input) {
  min-height: 200px;
}

/* 반응형 */
@media (max-width: 768px) {
  .diary-create-page {
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
