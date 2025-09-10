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
          :loading="isSubmitting"
        >
          {{ isSubmitting ? '수정 중...' : '수정' }}
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
                @error="handleImageError(currentMediaIndex.value)"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
    const mediaList = ref([])
    const currentMediaIndex = ref(0)
    const isDragging = ref(false)
    const dragStartX = ref(0)
    const isLoading = ref(true)
    const isSubmitting = ref(false)
    
    // 현재 미디어
    const currentMedia = computed(() => {
      if (mediaList.value.length === 0) return null
      const safeIndex = Math.min(currentMediaIndex.value, mediaList.value.length - 1)
      return mediaList.value[safeIndex]
    })
    
    // 제출 가능 여부 - 미디어가 있고 내용이 있으면 제출 가능
    const canSubmit = computed(() => {
      return content.value.trim() && mediaList.value.length > 0 && !isSubmitting.value
    })
    
    // 미디어 인덱스 범위 감시
    watch([currentMediaIndex, mediaList], ([index, list]) => {
      if (list.length === 0) {
        // 미디어가 없으면 인덱스를 0으로 설정
        currentMediaIndex.value = 0
      } else if (index >= list.length) {
        // 인덱스가 범위를 벗어나면 마지막 인덱스로 조정
        currentMediaIndex.value = list.length - 1
      } else if (index < 0) {
        // 인덱스가 음수면 0으로 조정
        currentMediaIndex.value = 0
      }
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
                  const mediaType = 'image'
                  
                  console.log(`기존 미디어 ${i}:`, {
                    url: mediaUrl,
                    type: mediaType
                  })
                  
                  validMedia.push({
                    url: mediaUrl,
                    type: mediaType,
                    isExisting: true,
                    originalUrl: mediaUrl, // 원본 URL 보존
                    name: extractFileNameFromUrl(mediaUrl) // 파일명 추가
                  })
                } catch (error) {
                  console.warn(`기존 미디어 ${i} (유효하지 않음):`, media)
                }
              }
            }
            
            mediaList.value = validMedia
            console.log('설정된 유효한 기존 미디어:', mediaList.value)
            
            // 기존 미디어가 있으면 첫 번째 미디어를 현재 미디어로 설정
            if (validMedia.length > 0) {
              currentMediaIndex.value = 0
            }
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
    
    // URL을 File 객체로 변환 (기존 이미지 유지를 위해 필요)
    const urlToFile = async (url, fileName) => {
      try {
        console.log('URL을 File로 변환 시작:', url)
        
        // URL 유효성 검사
        if (!url || typeof url !== 'string') {
          throw new Error('유효하지 않은 URL입니다')
        }
        
        // fetch 타임아웃 설정 (10초)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(url, {
          signal: controller.signal,
          mode: 'cors',
          cache: 'no-cache'
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
        }
        
        const blob = await response.blob()
        
        if (blob.size === 0) {
          throw new Error('빈 파일입니다')
        }
        
        // 파일 크기 제한 (10MB)
        if (blob.size > 10 * 1024 * 1024) {
          throw new Error('파일 크기가 너무 큽니다 (10MB 초과)')
        }
        
        // MIME 타입 검사
        if (!blob.type.startsWith('image/')) {
          throw new Error('이미지 파일이 아닙니다')
        }
        
        const file = new File([blob], fileName, { type: blob.type })
        
        console.log('File 객체 생성 완료:', {
          name: file.name,
          type: file.type,
          size: file.size
        })
        
        return file
      } catch (error) {
        console.error('URL을 File로 변환 실패:', error)
        
        // 구체적인 에러 메시지 제공
        if (error.name === 'AbortError') {
          throw new Error('파일 다운로드 시간이 초과되었습니다')
        } else if (error.message.includes('CORS')) {
          throw new Error('파일 접근 권한이 없습니다')
        } else if (error.message.includes('HTTP error')) {
          throw new Error(`파일을 가져올 수 없습니다: ${error.message}`)
        } else {
          throw new Error(`파일 처리 중 오류가 발생했습니다: ${error.message}`)
        }
      }
    }
    
    // URL에서 파일명 추출
    const extractFileNameFromUrl = (url) => {
      if (!url) return 'unknown.jpg'
      
      try {
        const urlParts = url.split('/')
        const fullFileName = urlParts[urlParts.length - 1]
        const decodedFileName = decodeURIComponent(fullFileName)
        
        // - 이후 부분 추출
        const dashIndex = decodedFileName.lastIndexOf('-')
        if (dashIndex !== -1) {
          return decodedFileName.substring(dashIndex + 1)
        }
        
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
    
    // 파일 추가 공통 함수
    const addFilesToMediaList = (files, source = 'file') => {
      console.log(`=== ${source} 파일 추가 시작 ===`)
      console.log('추가할 파일들:', files)
      
      if (mediaList.value.length + files.length > 10) {
        alert('최대 10개까지만 업로드할 수 있습니다.')
        return
      }
      
      // 파일 유효성 검사 및 처리
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.`)
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
      
      if (validFiles.length === 0) {
        console.log('유효한 파일이 없음')
        return
      }
      
      // 파일을 미디어 리스트에 추가
      let addedCount = 0
      validFiles.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newMedia = {
            url: e.target.result,
            type: 'image',
            file: file,
            isExisting: false,
            name: file.name
          }
          
          console.log(`새 미디어 추가 (${index + 1}/${validFiles.length}):`, newMedia)
          mediaList.value.push(newMedia)
          addedCount++
          
          // 첫 번째 파일이 추가되면 해당 파일로 이동
          if (addedCount === 1) {
            currentMediaIndex.value = mediaList.value.length - 1
          }
        }
        
        reader.onerror = (error) => {
          console.error(`파일 ${file.name} 로드 실패:`, error)
          alert(`${file.name} 파일을 읽는 중 오류가 발생했습니다.`)
        }
        
        reader.readAsDataURL(file)
      })
      
      console.log(`=== ${source} 파일 추가 완료 ===`)
    }
    
    // 파일 선택 처리
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      addFilesToMediaList(files, '선택')
      
      // 파일 입력 초기화
      event.target.value = ''
    }
    
    // 현재 미디어 제거
    const removeCurrentMedia = () => {
      if (mediaList.value.length > 0) {
        console.log('미디어 제거 전:', {
          currentIndex: currentMediaIndex.value,
          totalLength: mediaList.value.length,
          mediaToRemove: mediaList.value[currentMediaIndex.value]
        })
        
        mediaList.value.splice(currentMediaIndex.value, 1)
        
        // 인덱스 조정: 삭제 후 배열이 비어있지 않다면 적절한 인덱스로 조정
        if (mediaList.value.length > 0) {
          // 현재 인덱스가 배열 길이보다 크거나 같으면 마지막 인덱스로 조정
          if (currentMediaIndex.value >= mediaList.value.length) {
            currentMediaIndex.value = mediaList.value.length - 1
          }
          // 현재 인덱스가 유효한 범위 내에 있으면 그대로 유지
        } else {
          // 배열이 비어있으면 인덱스를 0으로 설정
          currentMediaIndex.value = 0
        }
        
        console.log('미디어 제거 후:', {
          currentIndex: currentMediaIndex.value,
          totalLength: mediaList.value.length
        })
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
    
    // 제출 처리 - 모든 미디어를 파일로 변환하여 전송
    const handleSubmit = async () => {
      if (isSubmitting.value) {
        console.log('이미 제출 중입니다.')
        return
      }
      
      if (!content.value.trim()) {
        alert('내용을 입력해주세요.')
        return
      }
      
      if (mediaList.value.length === 0) {
        alert('미디어를 하나 이상 추가해주세요.')
        return
      }
      
      try {
        isSubmitting.value = true
        console.log('=== 다이어리 수정 시작 ===')
        console.log('내용:', content.value)
        console.log('미디어 개수:', mediaList.value.length)
        
        const formData = new FormData()
        
        // 모든 미디어를 File 객체로 변환하여 FormData에 추가
        const allFiles = []
        
        for (let i = 0; i < mediaList.value.length; i++) {
          const media = mediaList.value[i]
          
          if (media.isExisting) {
            // 기존 파일: URL에서 실제 파일 데이터를 가져와서 File 객체 생성
            try {
              console.log(`기존 파일 ${i} 처리 시작:`, media.originalUrl)
              const file = await urlToFile(media.originalUrl, media.name || extractFileNameFromUrl(media.originalUrl))
              console.log(`기존 파일 ${i} 변환 완료:`, file.name, file.type, file.size)
              
              if (file.size > 0) {
                allFiles.push(file)
              } else {
                console.warn(`기존 파일 ${i} 크기가 0이므로 제외`)
                // 크기가 0인 파일도 제출 실패를 방지하기 위해 사용자에게 알림
                alert(`기존 이미지 "${media.name}"를 처리할 수 없습니다. 다시 시도해주세요.`)
                return
              }
            } catch (error) {
              console.error(`기존 파일 ${i} 변환 실패:`, error)
              // 변환 실패 시 사용자에게 알림하고 제출 중단
              alert(`기존 이미지 "${media.name}"를 처리할 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.`)
              return
            }
          } else {
            // 새 파일: 실제 파일 사용
            console.log(`새 파일 ${i} 처리:`, media.file.name, media.file.type, media.file.size)
            
            if (media.file.size > 0) {
              allFiles.push(media.file)
            } else {
              console.warn(`새 파일 ${i} 크기가 0이므로 제외`)
              alert(`새 이미지 "${media.file.name}"를 처리할 수 없습니다.`)
              return
            }
          }
        }
        
        console.log('전체 파일 목록:', allFiles.map(f => f.name))
        console.log('전체 파일 개수:', allFiles.length)
        
        // 모든 파일을 FormData에 추가 (백엔드에서 fileList로 받기 때문에 'fileList'로 키명 변경)
        allFiles.forEach((file, index) => {
          console.log(`파일 ${index} 추가:`, file.name, file.type, file.size)
          formData.append('fileList', file)
        })
        
        // content를 FormData에 직접 추가 (백엔드 @ModelAttribute 방식에 맞춤)
        formData.append('content', content.value.trim())
        
        console.log('전송할 FormData 내용:')
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value)
        }
        
        const postId = $route.params.id
        const response = await postAPI.update(postId, formData)
        console.log('다이어리 수정 응답:', response)
        
        if (response.status === 200) {
          console.log('다이어리 수정 성공')
          alert('다이어리 수정에 성공했습니다!')
          $router.push(`/diary/${postId}`)
        } else {
          console.error('다이어리 수정 실패 - 예상치 못한 응답:', response)
          throw new Error('다이어리 수정에 실패했습니다.')
        }
      } catch (error) {
        console.error('다이어리 수정 실패:', error)
        handleApiError(error, $router, '다이어리 수정에 실패했습니다.')
      } finally {
        isSubmitting.value = false
      }
    }
    
    // 드래그 앤 드롭 이벤트
    const handleDragOver = (e) => {
      e.preventDefault()
    }
    
    const handleDrop = (e) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      addFilesToMediaList(files, '드롭')
    }
    
    // 이미지 로드 실패 처리
    const handleImageError = (index) => {
      console.warn(`이미지 로드 실패 (인덱스 ${index}):`, mediaList.value[index])
      
      if (index < mediaList.value.length) {
        const media = mediaList.value[index]
        
        if (media.isExisting) {
          // 기존 이미지 로드 실패 시 사용자에게 알림
          console.warn(`기존 이미지 로드 실패: ${media.originalUrl}`)
          // 기존 이미지는 제거하지 않고 유지 (제출 시 다시 시도)
          console.log('기존 이미지 로드 실패 - 제거하지 않고 유지')
        } else {
          // 새로 추가된 이미지인 경우에만 제거
          console.log('새 이미지 로드 실패 - 제거됨')
          mediaList.value.splice(index, 1)
          
          // 현재 인덱스 조정
          if (mediaList.value.length > 0) {
            // 현재 인덱스가 배열 길이보다 크거나 같으면 마지막 인덱스로 조정
            if (currentMediaIndex.value >= mediaList.value.length) {
              currentMediaIndex.value = mediaList.value.length - 1
            }
            // 삭제된 인덱스가 현재 인덱스보다 작거나 같으면 현재 인덱스를 조정
            else if (index <= currentMediaIndex.value) {
              currentMediaIndex.value = Math.max(0, currentMediaIndex.value - 1)
            }
          } else {
            // 배열이 비어있으면 인덱스를 0으로 설정
            currentMediaIndex.value = 0
          }
        }
        
        console.log('이미지 처리 후 현재 미디어 개수:', mediaList.value.length)
      }
    }

    // 미디어 인디케이터 클릭 시 현재 미디어 인덱스 변경
    const setCurrentMediaIndex = (index) => {
      if (index >= 0 && index < mediaList.value.length) {
        currentMediaIndex.value = index;
      }
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
      mediaList,
      currentMediaIndex,
      currentMedia,
      canSubmit,
      isLoading,
      isSubmitting,
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
      setCurrentMediaIndex,
      addFilesToMediaList
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
