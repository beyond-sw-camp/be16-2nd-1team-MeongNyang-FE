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
          <div class="video-container">
            <video 
              :src="video" 
              controls 
              class="rounded video-player"
              preload="metadata"
              :poster="getVideoPoster()"
              @loadedmetadata="onVideoLoaded"
              @error="onVideoError"
            >
              <source :src="video" :type="getVideoMimeType(video)">
              브라우저에서 비디오를 지원하지 않습니다.
            </video>
            <div v-if="videoLoadingStates[video]" class="video-loading-overlay">
              <v-progress-circular indeterminate color="white" size="48"></v-progress-circular>
            </div>
            <div v-if="videoErrors[video]" class="video-error-overlay">
              <v-icon size="48" color="white">mdi-play-circle-outline</v-icon>
              <div class="text-caption text-white mt-2">{{ getFileName(video) }}</div>
            </div>
          </div>
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

    <!-- 향상된 이미지 뷰어 다이얼로그 -->
    <v-dialog 
      v-model="imageViewerOpen" 
      fullscreen 
      hide-overlay 
      transition="dialog-bottom-transition"
      @keydown.esc="closeImageViewer"
      @keydown.left="previousImage"
      @keydown.right="nextImage"
    >
      <v-card class="image-viewer-container" color="black">
        <!-- 상단 툴바 -->
        <v-app-bar 
          v-if="!toolbarHidden"
          color="rgba(0,0,0,0.8)" 
          dark 
          flat 
          class="image-viewer-toolbar"
          :class="{ 'toolbar-hidden': toolbarHidden }"
        >
          <v-btn icon @click="closeImageViewer" class="mr-2 toolbar-btn" style="margin-left: 8px;">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
          
          <v-toolbar-title class="text-subtitle-1 toolbar-text">
            {{ getFileName(groupedFiles.images[currentImageIndex]) }}
          </v-toolbar-title>
          
          <v-spacer></v-spacer>
          
          <!-- 이미지 카운터 -->
          <span class="text-caption mr-4 toolbar-text">
            {{ currentImageIndex + 1 }} / {{ groupedFiles.images.length }}
          </span>
          
          <!-- 확대/축소 컨트롤 -->
          <v-btn icon @click="zoomOut" :disabled="zoomLevel <= 0.5" class="mr-1 toolbar-btn">
            <v-icon color="white">mdi-magnify-minus</v-icon>
          </v-btn>
          <span class="text-caption mx-2 toolbar-text">{{ Math.round(zoomLevel * 100) }}%</span>
          <v-btn icon @click="zoomIn" :disabled="zoomLevel >= 3" class="mr-2 toolbar-btn">
            <v-icon color="white">mdi-magnify-plus</v-icon>
          </v-btn>
          
          <!-- 원본 크기 보기 -->
          <v-btn icon @click="resetZoom" class="mr-2 toolbar-btn">
            <v-icon color="white">mdi-fit-to-screen</v-icon>
          </v-btn>
          
          <!-- 다운로드 버튼 -->
          <v-btn icon @click="downloadCurrentImage" class="mr-2 toolbar-btn">
            <v-icon color="white">mdi-download</v-icon>
          </v-btn>
          
          <!-- 정보 토글 -->
          <v-btn icon @click="toggleImageInfo" class="toolbar-btn">
            <v-icon color="white">mdi-information-outline</v-icon>
          </v-btn>
        </v-app-bar>

        <!-- 메인 이미지 영역 -->
        <div 
          class="image-viewer-content"
          @click="toggleToolbar"
          @wheel="onImageWheel"
          @mousedown="onImageMouseDown"
          @mousemove="onImageMouseMove"
          @mouseup="onImageMouseUp"
          @mouseleave="onImageMouseUp"
          @touchstart="onImageTouchStart"
          @touchmove="onImageTouchMove"
          @touchend="onImageTouchEnd"
        >
          <div 
            class="image-container"
            :style="imageContainerStyle"
            ref="imageContainer"
          >
            <v-img 
              :src="groupedFiles.images[currentImageIndex]" 
              class="viewer-image"
              :style="imageStyle"
              @load="onImageLoad"
              @error="onImageError"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="white" size="64"></v-progress-circular>
                </div>
              </template>
            </v-img>
          </div>

          <!-- 이전/다음 버튼 -->
          <v-btn 
            v-if="groupedFiles.images.length > 1 && currentImageIndex !== 0"
            icon 
            size="large"
            class="nav-btn nav-btn-left"
            :class="{ 'nav-hidden': toolbarHidden }"
            @click.stop="previousImage"
          >
            <v-icon size="32">mdi-chevron-left</v-icon>
          </v-btn>
          
          <v-btn 
            v-if="groupedFiles.images.length > 1 && currentImageIndex !== groupedFiles.images.length - 1"
            icon 
            size="large"
            class="nav-btn nav-btn-right"
            :class="{ 'nav-hidden': toolbarHidden }"
            @click.stop="nextImage"
          >
            <v-icon size="32">mdi-chevron-right</v-icon>
          </v-btn>
        </div>

        <!-- 하단 이미지 정보 패널 -->
        <v-sheet 
          v-if="showImageInfo"
          color="rgba(0,0,0,0.9)" 
          class="image-info-panel pa-4"
        >
          <div class="d-flex align-center">
            <v-icon color="white" class="mr-2">mdi-image</v-icon>
            <div class="text-white">
              <div class="text-subtitle-2">{{ getFileName(groupedFiles.images[currentImageIndex]) }}</div>
              <div class="text-caption text-grey-lighten-1">
                <span v-if="currentImageSize && currentImageSize.width && currentImageSize.height">
                  {{ currentImageSize.width }} × {{ currentImageSize.height }}px
                </span>
                <span v-if="getFileSize(groupedFiles.images[currentImageIndex])" class="ml-3">
                  {{ getFileSize(groupedFiles.images[currentImageIndex]) }}
                </span>
              </div>
            </div>
          </div>
        </v-sheet>

        <!-- 하단 썸네일 네비게이션 -->
        <div 
          v-if="groupedFiles.images.length > 1 && !toolbarHidden"
          class="thumbnail-navigation pa-2"
        >
          <div class="thumbnail-container">
            <div 
              v-for="(image, index) in groupedFiles.images" 
              :key="`thumb-${index}`"
              class="thumbnail-item"
              :class="{ 'thumbnail-active': index === currentImageIndex }"
              @click="currentImageIndex = index"
            >
              <v-img 
                :src="image" 
                aspect-ratio="1"
                cover
                class="thumbnail-image"
              ></v-img>
            </div>
          </div>
        </div>
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
    const videoLoadingStates = ref({})
    const videoErrors = ref({})
    
    // 이미지 뷰어 관련 상태
    const zoomLevel = ref(1)
    const panX = ref(0)
    const panY = ref(0)
    const toolbarHidden = ref(false)
    const showImageInfo = ref(false)
    const currentImageSize = ref(null)
    const isDragging = ref(false)
    const dragStart = ref({ x: 0, y: 0 })
    const lastPanX = ref(0)
    const lastPanY = ref(0)
    const imageContainer = ref(null)
    
    // 터치 관련 상태
    const touchStartDistance = ref(0)
    const touchStartZoom = ref(1)
    const touchStartPan = ref({ x: 0, y: 0 })

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

    // 이미지 뷰어 스타일 계산
    const imageContainerStyle = computed(() => ({
      transform: `translate(${panX.value}px, ${panY.value}px)`,
      cursor: isDragging.value ? 'grabbing' : (zoomLevel.value > 1 ? 'grab' : 'default')
    }))

    const imageStyle = computed(() => ({
      transform: `scale(${zoomLevel.value})`,
      transformOrigin: 'center center',
      transition: isDragging.value ? 'none' : 'transform 0.3s ease'
    }))

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

    // 비디오 관련 함수들
    const getVideoMimeType = (url) => {
      const extension = getFileExtension(url).toLowerCase()
      const mimeTypes = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'm4v': 'video/mp4',
        '3gp': 'video/3gpp',
        'flv': 'video/x-flv'
      }
      return mimeTypes[extension] || 'video/mp4'
    }

    const getVideoPoster = () => {
      // 실제 환경에서는 서버에서 썸네일 이미지를 제공하거나
      // 비디오에서 첫 프레임을 추출한 이미지 URL을 반환해야 합니다.
      // 현재는 기본 포스터를 사용하지 않습니다.
      return null
    }

    const onVideoLoaded = (event) => {
      const video = event.target
      const videoUrl = video.src
      videoLoadingStates.value[videoUrl] = false
      videoErrors.value[videoUrl] = false
      
      // 비디오가 로드되면 첫 프레임을 보여주기 위해 currentTime을 설정
      video.currentTime = 0.1
    }

    const onVideoError = (event) => {
      const video = event.target
      const videoUrl = video.src
      videoLoadingStates.value[videoUrl] = false
      videoErrors.value[videoUrl] = true
      console.warn('비디오 로드 실패:', videoUrl)
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
      resetImageViewer()
    }

    const closeImageViewer = () => {
      imageViewerOpen.value = false
      resetImageViewer()
    }

    const resetImageViewer = () => {
      zoomLevel.value = 1
      panX.value = 0
      panY.value = 0
      toolbarHidden.value = false
      showImageInfo.value = false
      isDragging.value = false
      currentImageSize.value = null
    }

    const nextImage = () => {
      if (currentImageIndex.value < groupedFiles.value.images.length - 1) {
        currentImageIndex.value++
        resetImagePosition()
      }
    }

    const previousImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--
        resetImagePosition()
      }
    }

    const resetImagePosition = () => {
      zoomLevel.value = 1
      panX.value = 0
      panY.value = 0
    }

    // 확대/축소 함수들
    const zoomIn = () => {
      if (zoomLevel.value < 3) {
        zoomLevel.value = Math.min(3, zoomLevel.value * 1.5)
      }
    }

    const zoomOut = () => {
      if (zoomLevel.value > 0.5) {
        zoomLevel.value = Math.max(0.5, zoomLevel.value / 1.5)
        
        // 축소 시 패닝 조정
        if (zoomLevel.value === 1) {
          panX.value = 0
          panY.value = 0
        }
      }
    }

    const resetZoom = () => {
      zoomLevel.value = 1
      panX.value = 0
      panY.value = 0
    }

    // UI 토글 함수들
    const toggleToolbar = () => {
      toolbarHidden.value = !toolbarHidden.value
    }

    const toggleImageInfo = () => {
      showImageInfo.value = !showImageInfo.value
    }

    const downloadCurrentImage = () => {
      if (groupedFiles.value.images[currentImageIndex.value]) {
        downloadFile(groupedFiles.value.images[currentImageIndex.value])
      }
    }

    // 이미지 로드 이벤트
    const onImageLoad = (event) => {
      try {
        // Vuetify v-img에서 이벤트 구조가 다를 수 있으므로 안전하게 처리
        const img = event.target || event.srcElement
        if (img && img.naturalWidth && img.naturalHeight) {
          currentImageSize.value = {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        } else {
          // 이미지 크기를 가져올 수 없는 경우 null로 설정
          currentImageSize.value = null
        }
      } catch (error) {
        console.warn('이미지 크기 정보를 가져올 수 없습니다:', error)
        currentImageSize.value = null
      }
    }

    const onImageError = (event) => {
      console.warn('이미지 로드 실패:', event)
      currentImageSize.value = null
    }

    // 마우스 이벤트 핸들러
    const onImageWheel = (event) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -1 : 1
      const zoomFactor = 1.1
      
      if (delta > 0 && zoomLevel.value < 3) {
        zoomLevel.value = Math.min(3, zoomLevel.value * zoomFactor)
      } else if (delta < 0 && zoomLevel.value > 0.5) {
        zoomLevel.value = Math.max(0.5, zoomLevel.value / zoomFactor)
        
        if (zoomLevel.value === 1) {
          panX.value = 0
          panY.value = 0
        }
      }
    }

    const onImageMouseDown = (event) => {
      if (zoomLevel.value > 1) {
        isDragging.value = true
        dragStart.value = { x: event.clientX, y: event.clientY }
        lastPanX.value = panX.value
        lastPanY.value = panY.value
        event.preventDefault()
      }
    }

    const onImageMouseMove = (event) => {
      if (isDragging.value && zoomLevel.value > 1) {
        const deltaX = event.clientX - dragStart.value.x
        const deltaY = event.clientY - dragStart.value.y
        panX.value = lastPanX.value + deltaX
        panY.value = lastPanY.value + deltaY
      }
    }

    const onImageMouseUp = () => {
      isDragging.value = false
    }

    // 터치 이벤트 핸들러
    const getTouchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const onImageTouchStart = (event) => {
      if (event.touches.length === 2) {
        // 핀치 줌 시작
        touchStartDistance.value = getTouchDistance(event.touches)
        touchStartZoom.value = zoomLevel.value
        touchStartPan.value = { x: panX.value, y: panY.value }
      } else if (event.touches.length === 1 && zoomLevel.value > 1) {
        // 단일 터치 드래그 시작
        isDragging.value = true
        dragStart.value = { 
          x: event.touches[0].clientX, 
          y: event.touches[0].clientY 
        }
        lastPanX.value = panX.value
        lastPanY.value = panY.value
      }
      event.preventDefault()
    }

    const onImageTouchMove = (event) => {
      if (event.touches.length === 2) {
        // 핀치 줌
        const currentDistance = getTouchDistance(event.touches)
        const scale = currentDistance / touchStartDistance.value
        const newZoom = Math.max(0.5, Math.min(3, touchStartZoom.value * scale))
        
        zoomLevel.value = newZoom
        
        if (newZoom === 1) {
          panX.value = 0
          panY.value = 0
        }
      } else if (event.touches.length === 1 && isDragging.value && zoomLevel.value > 1) {
        // 단일 터치 드래그
        const deltaX = event.touches[0].clientX - dragStart.value.x
        const deltaY = event.touches[0].clientY - dragStart.value.y
        panX.value = lastPanX.value + deltaX
        panY.value = lastPanY.value + deltaY
      }
      event.preventDefault()
    }

    const onImageTouchEnd = (event) => {
      if (event.touches.length === 0) {
        isDragging.value = false
      }
    }

    return {
      groupedFiles,
      imageViewerOpen,
      currentImageIndex,
      videoLoadingStates,
      videoErrors,
      
      // 이미지 뷰어 상태
      zoomLevel,
      panX,
      panY,
      toolbarHidden,
      showImageInfo,
      currentImageSize,
      imageContainer,
      imageContainerStyle,
      imageStyle,
      
      isImage,
      isVideo,
      isAudio,
      getFileName,
      getFileExtension,
      getFileIcon,
      getFileSize,
      formatFileSize,
      downloadFile,
      getVideoMimeType,
      getVideoPoster,
      onVideoLoaded,
      onVideoError,
      getImageGridClass,
      
      // 이미지 뷰어 함수들
      openImageViewer,
      closeImageViewer,
      nextImage,
      previousImage,
      zoomIn,
      zoomOut,
      resetZoom,
      toggleToolbar,
      toggleImageInfo,
      downloadCurrentImage,
      onImageLoad,
      onImageError,
      onImageWheel,
      onImageMouseDown,
      onImageMouseMove,
      onImageMouseUp,
      onImageTouchStart,
      onImageTouchMove,
      onImageTouchEnd
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
  height: auto;
  align-items: stretch;
}

.image-grid-item {
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 0;
}

.image-hover:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

.image-grid:has(.single-image) {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  max-height: 300px;
  min-height: 200px;
}

.single-image {
  grid-column: 1 / -1;
  height: 100%;
  min-height: 0;
}

.single-image .v-img {
  height: 100% !important;
  width: 100% !important;
}

.image-grid:has(.two-images) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  max-height: 300px;
  min-height: 200px;
}

.two-images {
  height: 100%;
  min-height: 0;
}

.two-images .v-img {
  height: 100% !important;
  width: 100% !important;
}

.image-grid:has(.three-images-main) {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-height: 300px;
  min-height: 200px;
}

.three-images-main {
  grid-row: 1 / 3;
  height: 100%;
  min-height: 0;
}

.three-images-main .v-img {
  height: 100% !important;
  width: 100% !important;
}

.three-images-sub {
  grid-column: 2;
  height: 100%;
  min-height: 0;
}

.three-images-sub .v-img {
  height: 100% !important;
  width: 100% !important;
}

.image-grid:has(.four-images) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-height: 300px;
  min-height: 200px;
}

.four-images {
  height: 100%;
  min-height: 0;
}

.four-images .v-img {
  height: 100% !important;
  width: 100% !important;
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

.video-container {
  position: relative;
  max-width: 300px;
}

.video-player {
  width: 100%;
  height: auto;
  background-color: #000;
  border-radius: 8px;
}

.video-loading-overlay,
.video-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.video-error-overlay {
  cursor: pointer;
}

.video-error-overlay:hover {
  background-color: rgba(0, 0, 0, 0.8);
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

/* 이미지 뷰어 스타일 */
.image-viewer-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Vuetify 앱바 기본 스타일 오버라이드 */
.image-viewer-container .v-app-bar {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.image-viewer-toolbar {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 1000;
  transition: transform 0.3s ease;
  margin: 0 !important;
  padding: 0 !important;
}

/* 툴바 버튼 스타일 */
.toolbar-btn {
  color: white !important;
}

.toolbar-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.toolbar-btn:disabled {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 툴바 텍스트 스타일 */
.toolbar-text {
  color: white !important;
}

/* 툴바 컨텐츠 정렬 */
.image-viewer-toolbar .v-toolbar__content {
  width: 100% !important;
  padding: 0 16px !important;
  margin: 0 !important;
}

.toolbar-hidden {
  transform: translateY(-100%);
}

.image-viewer-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.6) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgba(0, 0, 0, 0.8) !important;
  transform: translateY(-50%) scale(1.1);
}

.nav-btn-left {
  left: 20px;
}

.nav-btn-right {
  right: 20px;
}

.nav-hidden {
  opacity: 0;
  pointer-events: none;
}

.image-info-panel {
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
  z-index: 1000;
}

.thumbnail-navigation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.thumbnail-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.thumbnail-container::-webkit-scrollbar {
  display: none;
}

.thumbnail-item {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.thumbnail-item:hover {
  transform: scale(1.1);
}

.thumbnail-active {
  border-color: #42a5f5;
  transform: scale(1.1);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .nav-btn-left {
    left: 10px;
  }
  
  .nav-btn-right {
    right: 10px;
  }
  
  .thumbnail-item {
    width: 50px;
    height: 50px;
  }
  
  .image-viewer-toolbar .v-btn {
    margin: 0 2px;
  }
  
  .image-viewer-toolbar .text-caption {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .image-grid,
  .video-container,
  .video-player,
  .audio-card,
  .file-attachment {
    max-width: 100%;
  }
  
  .thumbnail-navigation {
    padding: 4px;
  }
  
  .thumbnail-item {
    width: 40px;
    height: 40px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
  }
  
  .image-info-panel {
    bottom: 60px;
  }
}
</style>
