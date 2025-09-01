<template>
  <v-dialog v-model="show" max-width="600" persistent>
    <v-card class="image-cropper-dialog">
      <v-card-title class="text-h6">
        이미지 크롭
      </v-card-title>
      
      <v-card-text>
        <div class="cropper-container">
          <div 
            ref="imageWrapper"
            class="image-wrapper"
            @mousedown="startDrag"
            @touchstart="startDrag"
            @wheel="handleWheel"
          >
            <img
              ref="imageElement"
              :src="imageUrl"
              :style="imageStyle"
              class="cropper-image"
              @load="onImageLoad"
              alt="크롭할 이미지"
            />
            
            <div :style="overlayStyle">
              <div :style="circleStyle"></div>
            </div>
          </div>
          
          <div class="zoom-controls">
            <v-btn 
              icon 
              @click="zoomOut" 
              :disabled="zoomLevel <= 0.5"
              color="primary"
              variant="outlined"
              size="small"
            >
              <v-icon>mdi-magnify-minus</v-icon>
            </v-btn>
            
            <v-slider
              v-model="zoomLevel"
              :min="0.5"
              :max="3"
              :step="0.1"
              class="zoom-slider"
              @update:model-value="updateZoom"
              color="primary"
              track-color="grey-lighten-2"
            ></v-slider>
            
            <v-btn 
              icon 
              @click="zoomIn" 
              :disabled="zoomLevel >= 3"
              color="primary"
              variant="outlined"
              size="small"
            >
              <v-icon>mdi-magnify-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn 
          @click="cancel" 
          variant="outlined"
          color="grey-darken-1"
        >
          취소
        </v-btn>
        <v-btn 
          @click="crop" 
          color="primary" 
          :loading="cropping"
          :disabled="cropping"
          variant="elevated"
        >
          크롭
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

/* eslint-disable no-undef */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'crop'])
/* eslint-enable no-undef */

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// DOM 요소들
const imageWrapper = ref(null)
const imageElement = ref(null)

// 크롭 상태
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const cropPosition = ref({ x: 50, y: 50 }) // 퍼센트 기준
const cropSize = ref(200) // 크롭 원의 크기 (px)
const zoomLevel = ref(1)

// 이미지 로드 완료 시
const onImageLoad = () => {
  // 이미지 중앙에 크롭 원 위치
  cropPosition.value = { x: 50, y: 50 }
  // 초기 줌 레벨을 1로 설정
  zoomLevel.value = 1
}

// 줌 컨트롤
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.2, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.2, 0.5)
}

const updateZoom = (value) => {
  zoomLevel.value = value
}

// 마우스 휠 이벤트 처리
const handleWheel = (event) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 이미지 스타일
const imageStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
  transformOrigin: 'center'
}))

// 오버레이 스타일
const overlayStyle = computed(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  cursor: 'move'
}))

// 크롭 원 스타일
const circleStyle = computed(() => ({
  position: 'absolute',
  left: `${cropPosition.value.x}%`,
  top: `${cropPosition.value.y}%`,
  width: `${cropSize.value}px`,
  height: `${cropSize.value}px`,
  borderRadius: '50%',
  border: '2px solid #fff',
  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none'
}))

// 드래그 시작
const startDrag = (event) => {
  isDragging.value = true
  const rect = imageWrapper.value.getBoundingClientRect()
  const clientX = event.clientX || event.touches[0].clientX
  const clientY = event.clientY || event.touches[0].clientY
  
  dragStart.value = {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

// 드래그 중
const onDrag = (event) => {
  if (!isDragging.value) return
  
  const rect = imageWrapper.value.getBoundingClientRect()
  const clientX = event.clientX || event.touches[0].clientX
  const clientY = event.clientY || event.touches[0].clientY
  
  const x = ((clientX - rect.left) / rect.width) * 100
  const y = ((clientY - rect.top) / rect.height) * 100
  
  cropPosition.value = {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y))
  }
}

// 드래그 종료
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// 크롭 실행
const cropping = ref(false)
const crop = async () => {
  cropping.value = true
  
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 캔버스 크기 설정 (원형 크롭을 위한 정사각형)
    const size = cropSize.value
    canvas.width = size
    canvas.height = size
    
    // 이미지 요소와 래퍼 가져오기
    const img = imageElement.value
    const wrapper = imageWrapper.value
    
    if (!img || !wrapper) {
      throw new Error('이미지 또는 래퍼를 찾을 수 없습니다')
    }
    
    // 이미지의 실제 크기와 화면에 표시되는 크기 계산
    const imgRect = img.getBoundingClientRect()
    const wrapperRect = wrapper.getBoundingClientRect()
    
    // 이미지가 래퍼 내에서 실제로 차지하는 영역 계산
    const imgDisplayWidth = imgRect.width
    const imgDisplayHeight = imgRect.height
    
    // 원본 이미지 크기
    const imgNaturalWidth = img.naturalWidth
    const imgNaturalHeight = img.naturalHeight
    
    // 스케일 비율 계산
    const scaleX = imgNaturalWidth / imgDisplayWidth
    const scaleY = imgNaturalHeight / imgDisplayHeight
    
    // 크롭 원의 화면상 위치를 원본 이미지 좌표로 변환
    const cropCenterX = (cropPosition.value.x / 100) * wrapperRect.width
    const cropCenterY = (cropPosition.value.y / 100) * wrapperRect.height
    
    // 이미지 내에서의 실제 크롭 위치 계산
    const imgLeft = imgRect.left - wrapperRect.left
    const imgTop = imgRect.top - wrapperRect.top
    
    const cropX = (cropCenterX - imgLeft) * scaleX - (size / 2) * scaleX
    const cropY = (cropCenterY - imgTop) * scaleY - (size / 2) * scaleY
    
    // 크롭 크기를 원본 이미지 스케일로 변환
    const cropWidth = size * scaleX
    const cropHeight = size * scaleY
    
    // 원형 마스크 생성
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
    ctx.clip()
    
    // 이미지 그리기 (원본 이미지에서 크롭)
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, size, size
    )
    
    ctx.restore()
    
    // 캔버스를 Blob으로 변환
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob)
        emit('crop', { blob, url: croppedUrl })
        show.value = false
        cropping.value = false
      } else {
        throw new Error('Blob 생성 실패')
      }
    }, 'image/jpeg', 0.9)
    
  } catch (error) {
    console.error('크롭 실패:', error)
    cropping.value = false
  }
}

// 취소
const cancel = () => {
  show.value = false
}

// 컴포넌트 언마운트 시 이벤트 리스너 정리
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.image-cropper-dialog {
  border-radius: 12px;
}

.cropper-container {
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.zoom-slider {
  flex: 1;
  margin: 0 16px;
}

/* 스크롤바 스타일 */
.image-cropper-dialog::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.image-cropper-dialog::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.image-cropper-dialog::-webkit-scrollbar-thumb {
  background: #E87D7D;
  border-radius: 5px;
}

.image-cropper-dialog::-webkit-scrollbar-thumb:hover {
  background: #d65a5a;
}

/* Firefox */
.image-cropper-dialog {
  scrollbar-width: thin;
  scrollbar-color: #E87D7D #f1f1f1;
}
</style>
