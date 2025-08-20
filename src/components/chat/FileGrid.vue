<template>
  <div class="file-grid-container">
    <!-- 이미지 그리드 -->
    <div v-if="groupedFiles.images.length > 0" class="file-group mb-3">
      <div class="file-group-header">
        <v-icon size="small" class="mr-1">mdi-image-multiple</v-icon>
        <span class="text-caption font-weight-medium">이미지 ({{ groupedFiles.images.length }})</span>
      </div>
      <div class="image-grid">
        <div 
          v-for="(image, index) in groupedFiles.images" 
          :key="`image-${index}`"
          :class="getImageGridClass(groupedFiles.images.length, index)"
          class="image-grid-item"
          @click="openImageViewer(image, index)"
        >
          <v-img 
            :src="image" 
            :aspect-ratio="1"
            cover
            class="rounded cursor-pointer image-hover"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
              </div>
            </template>
          </v-img>
        </div>
      </div>
    </div>

    <!-- 비디오 그리드 -->
    <div v-if="groupedFiles.videos.length > 0" class="file-group mb-3">
      <div class="file-group-header">
        <v-icon size="small" class="mr-1">mdi-video-box</v-icon>
        <span class="text-caption font-weight-medium">비디오 ({{ groupedFiles.videos.length }})</span>
      </div>
      <div class="video-grid">
        <div 
          v-for="(video, index) in groupedFiles.videos" 
          :key="`video-${index}`"
          class="video-grid-item"
        >
          <video 
            :src="video" 
            controls 
            class="rounded video-player"
            preload="metadata"
          ></video>
        </div>
      </div>
    </div>

    <!-- 오디오 그리드 -->
    <div v-if="groupedFiles.audios.length > 0" class="file-group mb-3">
      <div class="file-group-header">
        <v-icon size="small" class="mr-1">mdi-music-box-multiple</v-icon>
        <span class="text-caption font-weight-medium">오디오 ({{ groupedFiles.audios.length }})</span>
      </div>
      <div class="audio-grid">
        <div 
          v-for="(audio, index) in groupedFiles.audios" 
          :key="`audio-${index}`"
          class="audio-grid-item"
        >
          <v-card class="audio-card" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="primary">mdi-music</v-icon>
                <span class="text-caption font-weight-medium">{{ getFileName(audio) }}</span>
              </div>
              <audio :src="audio" controls class="audio-player"></audio>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>

    <!-- 기타 파일 그리드 -->
    <div v-if="groupedFiles.others.length > 0" class="file-group mb-3">
      <div class="file-group-header">
        <v-icon size="small" class="mr-1">mdi-file-multiple</v-icon>
        <span class="text-caption font-weight-medium">파일 ({{ groupedFiles.others.length }})</span>
      </div>
      <div class="other-files-grid">
        <v-card 
          v-for="(file, index) in groupedFiles.others" 
          :key="`file-${index}`"
          class="file-attachment" 
          elevation="1" 
          @click="downloadFile(file)"
        >
          <v-card-text class="pa-3 d-flex align-center">
            <v-icon class="mr-3" size="32" color="primary">
              {{ getFileIcon(file) }}
            </v-icon>
            <div class="flex-grow-1">
              <div class="file-name text-subtitle-2 font-weight-medium">
                {{ getFileName(file) }}
              </div>
              <div class="file-info text-caption text-grey-darken-1">
                <span>{{ getFileExtension(file).toUpperCase() }} 파일</span>
                <span v-if="getFileSize(file)" class="ml-2">• {{ getFileSize(file) }}</span>
              </div>
            </div>
            <v-icon color="grey-darken-1">mdi-download</v-icon>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- 이미지 뷰어 다이얼로그 -->
    <v-dialog v-model="imageViewerOpen" max-width="90vw" max-height="90vh">
      <v-card>
        <v-card-actions class="justify-space-between pa-2">
          <v-btn icon @click="previousImage" :disabled="currentImageIndex === 0">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <span class="text-caption">{{ currentImageIndex + 1 }} / {{ groupedFiles.images.length }}</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="nextImage" :disabled="currentImageIndex === groupedFiles.images.length - 1">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn icon @click="imageViewerOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text class="pa-0">
          <v-img 
            :src="groupedFiles.images[currentImageIndex]" 
            max-height="80vh"
            contain
          ></v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'FileGrid',
  props: {
    files: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const imageViewerOpen = ref(false)
    const currentImageIndex = ref(0)
    const fileSizes = ref({})

    // 파일들을 종류별로 그룹화
    const groupedFiles = computed(() => {
      const groups = {
        images: [],
        videos: [],
        audios: [],
        others: []
      }

      props.files.forEach(file => {
        if (isImage(file)) {
          groups.images.push(file)
        } else if (isVideo(file)) {
          groups.videos.push(file)
        } else if (isAudio(file)) {
          groups.audios.push(file)
        } else {
          groups.others.push(file)
        }
      })

      return groups
    })

    // 파일 타입 체크 함수들
    const isImage = (url) => {
      if (!url) return false
      const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
      const extension = url.split('.').pop().toLowerCase()
      return imageExtensions.includes(extension)
    }

    const isVideo = (url) => {
      if (!url) return false
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v', '3gp', 'flv']
      const extension = url.split('.').pop().toLowerCase()
      return videoExtensions.includes(extension)
    }

    const isAudio = (url) => {
      if (!url) return false
      const audioExtensions = ['mp3', 'ogg', 'wav', 'flac', 'aac', 'm4a']
      const extension = url.split('.').pop().toLowerCase()
      return audioExtensions.includes(extension)
    }

    // 파일 정보 함수들
    const getFileName = (url) => {
      return url.split('/').pop() || '알 수 없는 파일'
    }

    const getFileExtension = (url) => {
      const fileName = getFileName(url)
      const lastDot = fileName.lastIndexOf('.')
      return lastDot > 0 ? fileName.substring(lastDot + 1) : ''
    }

    const getFileIcon = (url) => {
      const extension = getFileExtension(url).toLowerCase()
      
      // 문서 파일
      if (['pdf'].includes(extension)) return 'mdi-file-pdf-box'
      if (['doc', 'docx'].includes(extension)) return 'mdi-file-word-box'
      if (['xls', 'xlsx'].includes(extension)) return 'mdi-file-excel-box'
      if (['ppt', 'pptx'].includes(extension)) return 'mdi-file-powerpoint-box'
      if (['txt'].includes(extension)) return 'mdi-file-document-outline'
      
      // 압축 파일
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'mdi-folder-zip-outline'
      
      // 코드 파일
      if (['js', 'ts', 'jsx', 'tsx', 'vue', 'html', 'css', 'scss', 'json', 'xml'].includes(extension)) return 'mdi-file-code-outline'
      if (['java', 'py', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(extension)) return 'mdi-file-code-outline'
      
      // 기본 파일 아이콘
      return 'mdi-file-outline'
    }

    const getFileSize = (url) => {
      // 이미 캐시된 크기가 있으면 반환
      if (fileSizes.value[url]) {
        return fileSizes.value[url]
      }
      
      // 파일 크기를 비동기적으로 가져오기
      fetch(url, { method: 'HEAD' })
        .then(response => {
          const contentLength = response.headers.get('Content-Length')
          if (contentLength) {
            fileSizes.value[url] = formatFileSize(parseInt(contentLength))
          }
        })
        .catch(() => {
          // 오류 시 기본값 설정하지 않음 (크기 표시 안함)
        })
      
      return null // 첫 로드시에는 null 반환
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const downloadFile = (url) => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    // 이미지 그리드 클래스 계산
    const getImageGridClass = (totalImages, index) => {
      if (totalImages === 1) return 'single-image'
      if (totalImages === 2) return 'two-images'
      if (totalImages === 3) {
        return index === 0 ? 'three-images-main' : 'three-images-sub'
      }
      if (totalImages === 4) return 'four-images'
      // 5개 이상은 최대 4개까지만 표시하고 나머지는 +N 표시
      if (totalImages >= 5) {
        if (index < 3) return 'four-images'
        if (index === 3) return 'four-images more-images'
        return 'hidden'
      }
    }

    // 이미지 뷰어 함수들
    const openImageViewer = (image, index) => {
      currentImageIndex.value = index
      imageViewerOpen.value = true
    }

    const nextImage = () => {
      if (currentImageIndex.value < groupedFiles.value.images.length - 1) {
        currentImageIndex.value++
      }
    }

    const previousImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--
      }
    }

    return {
      groupedFiles,
      imageViewerOpen,
      currentImageIndex,
      isImage,
      isVideo,
      isAudio,
      getFileName,
      getFileExtension,
      getFileIcon,
      getFileSize,
      formatFileSize,
      downloadFile,
      getImageGridClass,
      openImageViewer,
      nextImage,
      previousImage
    }
  }
}
</script>

<style scoped>
.file-grid-container {
  max-width: 100%;
}

.file-group {
  margin-bottom: 12px;
}

.file-group-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: rgba(0,0,0,0.6);
}

/* 이미지 그리드 스타일 */
.image-grid {
  display: grid;
  gap: 4px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 300px;
}

.image-grid-item {
  position: relative;
  overflow: hidden;
}

.image-hover:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

.single-image {
  grid-column: 1 / -1;
  max-height: 200px;
}

.two-images {
  grid-template-columns: 1fr 1fr;
}

.image-grid:has(.three-images-main) {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.three-images-main {
  grid-row: 1 / 3;
}

.three-images-sub {
  grid-column: 2;
}

.image-grid:has(.four-images) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.four-images {
  aspect-ratio: 1;
}

.more-images::after {
  content: '+' attr(data-count);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

/* 비디오 그리드 스타일 */
.video-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.video-player {
  width: 100%;
  max-width: 300px;
  height: auto;
}

/* 오디오 그리드 스타일 */
.audio-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.audio-card {
  max-width: 300px;
  border-radius: 12px !important;
}

.audio-player {
  width: 100%;
  height: 32px;
}

/* 기타 파일 그리드 스타일 */
.other-files-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.file-attachment {
  max-width: 300px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px !important;
}

.file-attachment:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
  transform: translateY(-1px);
}

.file-name {
  word-break: break-word;
  line-height: 1.2;
  max-width: 180px;
}

.file-info {
  margin-top: 2px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.cursor-pointer {
  cursor: pointer;
}

.hidden {
  display: none;
}

/* 반응형 스타일 */
@media (max-width: 480px) {
  .image-grid,
  .video-player,
  .audio-card,
  .file-attachment {
    max-width: 100%;
  }
}
</style>
