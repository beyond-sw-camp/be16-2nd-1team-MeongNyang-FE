<template>
  <v-dialog v-model="show" max-width="600" persistent content-class="image-cropper-dialog" :draggable="false">
    <v-card class="image-cropper-card">
      <!-- 헤더 섹션 -->
      <div class="cropper-header">
        <h2>이미지 크롭</h2>
        <p>원하는 영역을 선택하여 프로필 사진을 크롭하세요</p>
      </div>
      
      <!-- 크롭 영역 -->
      <div class="cropper-content">
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
              class="zoom-btn"
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
              color="#E87D7D"
              track-color="#e5e7eb"
            ></v-slider>
            
            <v-btn 
              icon 
              @click="zoomIn" 
              :disabled="zoomLevel >= 3"
              class="zoom-btn"
              size="small"
            >
              <v-icon>mdi-magnify-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
      
      <!-- 액션 버튼 -->
      <div class="cropper-actions">
        <v-btn 
          @click="cancel" 
          class="cancel-btn action-btn"
          rounded="lg"
          size="large"
        >
          취소
        </v-btn>
        <v-btn 
          @click="crop" 
          :loading="cropping"
          :disabled="cropping"
          class="crop-btn action-btn"
          rounded="lg"
          size="large"
        >
          크롭
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'

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
const zoomCenter = ref({ x: 50, y: 50 }) // 줌 중심점 (퍼센트 기준)

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
  
  const rect = imageWrapper.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  // 마우스 위치를 이미지 내에서의 상대적 위치로 변환 (0-1 범위)
  const relativeX = mouseX / rect.width
  const relativeY = mouseY / rect.height
  
  const oldZoom = zoomLevel.value
  const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9
  const newZoom = Math.max(0.5, Math.min(3, oldZoom * zoomFactor))
  
  if (newZoom !== oldZoom) {
    // 줌 중심점을 마우스 위치로 설정
    zoomCenter.value = {
      x: relativeX * 100,
      y: relativeY * 100
    }
    
    // 줌 레벨 업데이트
    zoomLevel.value = newZoom
    
    // 크롭 위치도 마우스 위치로 조정
    cropPosition.value = {
      x: relativeX * 100,
      y: relativeY * 100
    }
  }
}

// 이미지 스타일
const imageStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
  transformOrigin: `${zoomCenter.value.x}% ${zoomCenter.value.y}%`
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
    console.log('🎯 크롭 시작')
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 캔버스 크기 설정 (원형 크롭을 위한 정사각형)
    const size = cropSize.value
    canvas.width = size
    canvas.height = size
    
    console.log('📐 캔버스 크기:', { width: size, height: size })
    
    // 이미지 요소와 래퍼 가져오기
    const img = imageElement.value
    const wrapper = imageWrapper.value
    
    if (!img || !wrapper) {
      throw new Error('이미지 또는 래퍼를 찾을 수 없습니다')
    }
    
    console.log('🖼️ 이미지 정보:', {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.offsetWidth,
      displayHeight: img.offsetHeight
    })
    
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
    
    console.log('📍 크롭 위치:', { 
      cropX, cropY, cropWidth, cropHeight, 
      cropPosition: cropPosition.value,
      scaleX, scaleY
    })
    
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
    
    console.log('🎨 캔버스 그리기 완료')
    
    // 캔버스를 Blob으로 변환
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('✅ Blob 생성 성공:', {
          size: blob.size,
          type: blob.type
        })
        
        // Blob을 File 객체로 변환 (서버 전송을 위해)
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
        console.log('📁 File 객체 생성:', {
          name: file.name,
          size: file.size,
          type: file.type
        })
        
        const croppedUrl = URL.createObjectURL(blob)
        emit('crop', { blob: file, url: croppedUrl })
        show.value = false
        cropping.value = false
      } else {
        console.error('❌ Blob 생성 실패')
        throw new Error('Blob 생성 실패')
      }
    }, 'image/jpeg', 0.9)
    
  } catch (error) {
    console.error('❌ 크롭 실패:', error)
    cropping.value = false
  }
}

// 취소
const cancel = () => {
  show.value = false
}

// 드래그 방지 함수
const preventDrag = (event) => {
  event.preventDefault()
  event.stopPropagation()
  return false
}

// 컴포넌트 언마운트 시 이벤트 리스너 정리
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  
  // 드래그 방지 이벤트 리스너 제거
  const dialog = document.querySelector('.image-cropper-dialog')
  if (dialog) {
    dialog.removeEventListener('dragstart', preventDrag)
    dialog.removeEventListener('drag', preventDrag)
    dialog.removeEventListener('dragend', preventDrag)
  }
})

// 모달이 열릴 때 드래그 방지 이벤트 추가
watch(show, (newValue) => {
  if (newValue) {
    // 다음 틱에서 DOM이 업데이트된 후 실행
    nextTick(() => {
      const dialog = document.querySelector('.image-cropper-dialog')
      if (dialog) {
        dialog.addEventListener('dragstart', preventDrag)
        dialog.addEventListener('drag', preventDrag)
        dialog.addEventListener('dragend', preventDrag)
      }
    })
  }
})
</script>

<style scoped>
/* 다이얼로그 배경 */
.image-cropper-dialog {
  background: transparent !important;
  box-shadow: none !important;
}

/* 드래그 비활성화 - 더 강력한 설정 */
.image-cropper-dialog,
.image-cropper-dialog *,
.image-cropper-card,
.image-cropper-card * {
  user-select: none !important;
  -webkit-user-drag: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  pointer-events: auto !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -khtml-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

/* 모달 자체 드래그 방지 */
.image-cropper-dialog .v-overlay__content {
  pointer-events: auto !important;
  user-select: none !important;
  -webkit-user-drag: none !important;
}

/* Vuetify v-card 기본 스타일 오버라이드 */
.image-cropper-dialog .v-card {
  border-radius: 50px !important;
}

/* 메인 카드 - 매우 둥글게 */
.image-cropper-card {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 50px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

/* 헤더 섹션 */
.cropper-header {
  text-align: center;
  padding: 48px 60px 32px;
  background: transparent;
}

.cropper-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.cropper-header p {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

/* 콘텐츠 영역 */
.cropper-content {
  padding: 0 60px 32px;
}

.cropper-container {
  position: relative;
  background: #f8fafc;
  border-radius: 40px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.cropper-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
  border-radius: 30px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 40px 40px;
}

.zoom-btn {
  color: #E87D7D !important;
  border: 2px solid #E87D7D !important;
  background: white !important;
  border-radius: 20px !important;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background: #E87D7D !important;
  color: white !important;
}

.zoom-btn:disabled {
  color: #9ca3af !important;
  border-color: #e5e7eb !important;
  background: #f9fafb !important;
}

.zoom-slider {
  flex: 1;
  margin: 0 16px;
}

/* 액션 버튼 */
.cropper-actions {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding: 32px 60px 48px;
  border-top: 1px solid #f1f5f9;
  background: white;
}

.action-btn {
  min-width: 100px;
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
}

.cancel-btn {
  border: 2px solid #cbd5e1 !important;
  color: #334155 !important;
  background: white !important;
  border-radius: 30px !important;
}

.cancel-btn:hover {
  border-color: #9ca3af !important;
  background-color: #f9fafb !important;
}

.crop-btn {
  background: #E87D7D !important;
  color: white !important;
  border: none !important;
  border-radius: 30px !important;
}

.crop-btn:hover {
  background: #d65a5a !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
}

.crop-btn:disabled {
  background: #9ca3af !important;
  transform: none;
  box-shadow: none;
}

/* 반응형 디자인 - 매우 둥글게 */
@media (max-width: 768px) {
  .image-cropper-dialog .v-card {
    border-radius: 40px !important;
  }
  
  .image-cropper-card {
    margin: 16px;
    border-radius: 40px !important;
  }
  
  .cropper-header {
    padding: 32px 24px 24px;
  }
  
  .cropper-content {
    padding: 0 24px 24px;
  }
  
  .cropper-actions {
    padding: 24px 24px 32px;
    flex-direction: column;
    gap: 12px;
  }
  
  .image-wrapper {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .image-cropper-dialog .v-card {
    border-radius: 30px !important;
  }
  
  .image-cropper-card {
    margin: 8px;
    border-radius: 30px !important;
  }
  
  .cropper-header {
    padding: 24px 20px 20px;
  }
  
  .cropper-content {
    padding: 0 20px 20px;
  }
  
  .cropper-actions {
    padding: 20px 20px 24px;
  }
  
  .image-wrapper {
    height: 250px;
  }
}

/* 스크롤바 스타일 */
.image-cropper-dialog::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.image-cropper-dialog::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 6px;
}

.image-cropper-dialog::-webkit-scrollbar-thumb {
  background: #E87D7D;
  border-radius: 6px;
  border: 1px solid #f8f9fa;
}

.image-cropper-dialog::-webkit-scrollbar-thumb:hover {
  background: #d65a5a;
}

/* Firefox */
.image-cropper-dialog {
  scrollbar-width: thin;
  scrollbar-color: #E87D7D #f8f9fa;
}
</style>
