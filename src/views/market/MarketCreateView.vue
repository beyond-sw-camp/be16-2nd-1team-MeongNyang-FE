<template>
  <div class="market-create-page">
    <!-- 메인 컨테이너 -->
    <v-container class="create-container">
      <!-- 폼 컨테이너 -->
      <!-- 목록으로 버튼 -->
      <div class="back-btn-wrapper">
        <button @click="$router.push('/market')" class="back-btn">
          <v-icon icon="mdi-arrow-left" size="20" />
          목록으로
        </button>
      </div>

      <div class="form-container">
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <!-- 상품 이미지 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">상품 이미지</h3>
            </div>
            
            <div class="image-upload-section">
              <!-- 메인 업로드 영역 -->
              <div class="main-upload-area" :class="{ 'has-images': imageUrls.length > 0 }">
                <!-- 파일 입력 -->
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept="image/*"
                  class="hidden-file-input"
                  @change="handleImageChange"
                />
                
                <!-- 이미지가 없을 때 업로드 안내 -->
                <div v-if="imageUrls.length === 0" class="upload-content" @click="triggerFileInput">
                                     <div class="upload-icon">
                     <v-icon icon="mdi-cloud-upload" size="48" color="white" />
                   </div>
                  <h4 class="upload-title">사진을 업로드하세요</h4>
                  <p class="upload-subtitle">최대 10장까지 등록 가능합니다</p>
                  <div class="upload-hint">
                    <v-icon icon="mdi-information" size="16" color="#7f8c8d" />
                    <span>클릭하여 이미지 선택</span>
                  </div>
                </div>
                
                <!-- 이미지가 있을 때 슬라이더 -->
                <div v-else class="image-slider-container">
                  <!-- 이미지 슬라이더 -->
                  <div class="image-slider">
                    <div 
                      v-for="(url, index) in imageUrls" 
                      :key="index"
                      class="slide"
                      :class="{ 'active': index === currentSlide }"
                      :style="{ transform: `translateX(${(index - currentSlide) * 100}%)` }"
                    >
                      <img
                        :src="url"
                        class="slide-image"
                        alt="상품 이미지"
                      />
                      
                      <!-- 대표 이미지 표시 -->
                      <div class="main-image-checkbox" @click.stop="setMainImage(index)">
                        <div class="checkbox" :class="{ 'checked': index === mainImageIndex }">
                          <span v-if="index === mainImageIndex" class="check-mark">✓</span>
                        </div>
                      </div>
                      
                      <!-- 이미지 제거 버튼 -->
                      <button
                        @click.stop="removeImage(index)"
                        class="remove-image-btn"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <!-- 네비게이션 버튼 -->
                  <div class="slider-nav">
                    <button
                      @click="previousSlide"
                      :disabled="currentSlide === 0"
                      class="nav-btn prev-btn"
                    >
                      <v-icon icon="mdi-chevron-left" size="24" />
                    </button>
                    
                    <div class="slide-indicators">
                      <div
                        v-for="(url, index) in imageUrls"
                        :key="index"
                        class="indicator"
                        :class="{ 'active': index === currentSlide }"
                        @click="goToSlide(index)"
                      ></div>
                    </div>
                    
                    <button
                      @click="nextSlide"
                      :disabled="currentSlide === imageUrls.length - 1"
                      class="nav-btn next-btn"
                    >
                      <v-icon icon="mdi-chevron-right" size="24" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 기본 정보 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">기본 정보</h3>
            </div>
            
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">상품명 *</label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="상품명을 입력해주세요"
                  class="form-input"
                  required
                  @input="handleTitleInput"
                  @change="handleTitleChange"
                />
              </div>

              <div class="form-field">
                <label class="field-label">카테고리 *</label>
                <div class="category-buttons">
                  <button
                    v-for="category in categoryOptions"
                    :key="category.value"
                    :class="[
                      'category-btn', 
                      { 
                        'active': form.category === category.value 
                      }
                    ]"
                    @click.prevent="selectCategory(category.value)"
                    type="button"
                    :data-category="category.value"
                    :title="`현재 선택: ${form.category}, 이 버튼: ${category.value}`"
                  >
                    {{ category.label }}
                  </button>
                </div>
                <div v-if="form.category && form.category !== null" class="category-selected">
                  <div class="selected-category-content">
                    <v-icon icon="mdi-check-circle" size="20" color="#E87D7D" />
                    <span class="selected-text">선택된 카테고리: <strong>{{ categoryOptions.find(c => c.value === form.category)?.label }}</strong></span>
                    <span class="debug-info">(값: {{ form.category }})</span>
                  </div>
                </div>
                <div v-else class="category-hint">
                  <v-icon icon="mdi-information" size="16" color="#6c757d" />
                  <span>카테고리를 선택해주세요</span>
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">가격 *</label>
                <div class="price-input-container">
                  <input
                    v-model="form.price"
                    type="number"
                    placeholder="가격을 입력해주세요"
                    class="form-input price-input"
                    required
                    min="0"
                    step="1"
                    @input="handlePriceInput"
                    @change="handlePriceChange"
                  />
                  <span class="price-unit">원</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 상세 설명 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">상세 설명</h3>
            </div>
            
            <div class="description-section">
              <textarea
                v-model="form.description"
                placeholder="상품의 상태, 특징, 거래 조건 등을 자세히 설명해주세요..."
                class="form-textarea"
                rows="6"
                required
                @input="handleDescriptionInput"
                @change="handleDescriptionChange"
              ></textarea>
              
              <div class="description-hint">
                <v-icon icon="mdi-lightbulb" size="16" color="#E87D7D" />
                <span>구체적이고 정확한 정보를 제공하면 더 빠른 거래가 가능합니다</span>
              </div>
            </div>
          </div>

          <!-- 지역 정보 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">거래 지역</h3>
            </div>
            
            <div class="region-section">
              <!-- 지도 기반 위치 선택 -->
              <div class="map-selection-section">
                <div class="map-header">
                  <div class="map-icon">
                    <v-icon icon="mdi-map-marker-radius" size="28" color="#E87D7D" />
                  </div>
                  <div class="map-title-content">
                    <h4 class="section-subtitle">지도에서 거래 장소 선택</h4>
                    <p class="map-description">지도를 클릭하거나 핀을 드래그하여 정확한 거래 장소를 지정하세요</p>
                  </div>
                </div>
                
                <div class="map-container">
                  <div class="map-wrapper">
                    <div id="location-map" class="location-map"></div>
                    <div v-if="!mapLoaded" class="map-overlay">
                      <div class="map-status">
                        <v-icon icon="mdi-crosshairs-gps" size="16" color="#E87D7D" />
                        <span>지도를 클릭하거나 핀을 드래그하여 위치를 설정하세요</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="map-controls">
                    <button
                      @click="resetMapLocation"
                      class="map-btn secondary-btn"
                    >
                      <v-icon icon="mdi-refresh" size="18" />
                      위치 초기화
                    </button>
                  </div>
                </div>
                
                <!-- 선택된 위치 정보 -->
                <div v-if="selectedLocation" class="location-info">
                  <div class="info-header">
                    <div class="info-icon">
                      <v-icon icon="mdi-map-marker-check" size="20" color="white" />
                    </div>
                    <span>선택된 거래 장소</span>
                  </div>
                  <div class="info-content">
                    <div class="address-display">
                      <v-icon icon="mdi-map-marker" size="16" color="#E87D7D" />
                      <p class="address-text">{{ selectedLocation.address }}</p>
                    </div>
                    <div class="coordinate-display">
                      <v-icon icon="mdi-crosshairs-gps" size="16" color="#7f8c8d" />
                      <p class="coordinate-text">
                        위도: {{ selectedLocation.lat.toFixed(6) }}, 
                        경도: {{ selectedLocation.lng.toFixed(6) }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="map-hint">
                  <div class="hint-icon">
                    <v-icon icon="mdi-lightbulb-on" size="18" color="#E87D7D" />
                  </div>
                  <div class="hint-content">
                    <span class="hint-title">사용 팁</span>
                    <span class="hint-text">지도에서 핀을 드래그하여 정확한 위치를 조정할 수 있습니다. 클릭으로도 위치를 변경할 수 있어요!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="action-section">
            <button
              type="button"
              @click="$router.push('/market')"
              class="cancel-btn"
            >
              <v-icon icon="mdi-close" size="18" />
              취소
            </button>
            
            <button
              type="submit"
              :disabled="!valid || loading"
              class="submit-btn"
            >
              <v-icon v-if="!loading" icon="mdi-check" size="18" />
              <div v-else class="loading-spinner-small"></div>
              {{ loading ? '등록 중...' : '등록하기' }}
            </button>
          </div>
        </v-form>
      </div>
    </v-container>

    <!-- 성공/실패 알림 -->
    <div v-if="snackbar.show" class="snackbar" :class="snackbar.color">
      <div class="snackbar-content">
        <v-icon :icon="snackbar.icon" size="18" />
        <span>{{ snackbar.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { marketAPI } from '@/services/api'

export default {
  name: 'MarketCreateView',
  setup() {
    const router = useRouter()
    
    const form = reactive({
      title: '',
      category: null, // null로 초기화하여 명확하게 구분
      price: null,
      description: ''
    })

    // 폼 초기화 후 상태 확인
    console.log('폼 초기 상태:', {
      title: form.title,
      category: form.category,
      price: form.price,
      description: form.description
    })

    // 폼 데이터 변경 감지를 위한 watcher 추가
    const logFormChanges = () => {
      console.log('=== 폼 데이터 변경 감지 ===')
      console.log('form.title:', `"${form.title}"`)
      console.log('form.category:', form.category)
      console.log('form.price:', form.price)
      console.log('form.description:', `"${form.description}"`)
      console.log('========================')
    }

    // 가격 입력 처리 함수
    const handlePriceInput = (event) => {
      const value = event.target.value
      console.log('가격 입력 이벤트:', value, '타입:', typeof value)
      
      // 빈 문자열이면 null로 설정
      if (value === '' || value === null || value === undefined) {
        form.price = null
      } else {
        // 숫자로 변환
        const numValue = parseInt(value, 10)
        if (!isNaN(numValue) && numValue >= 0) {
          form.price = numValue
        } else {
          form.price = null
        }
      }
      
      console.log('가격 처리 후:', form.price)
      validateForm()
    }

    const handlePriceChange = (event) => {
      const value = event.target.value
      console.log('가격 변경 이벤트:', value, '타입:', typeof value)
      
      // 최종 값 검증 및 설정
      if (value === '' || value === null || value === undefined) {
        form.price = null
      } else {
        const numValue = parseInt(value, 10)
        if (!isNaN(numValue) && numValue >= 0) {
          form.price = numValue
        } else {
          form.price = null
        }
      }
      
      console.log('가격 최종 설정:', form.price)
      logFormChanges()
      validateForm()
    }

    // 제목 입력 처리 함수
    const handleTitleInput = (event) => {
      const value = event.target.value
      console.log('제목 입력 이벤트:', value, '타입:', typeof value)
      
      // 값 설정
      form.title = value
      
      console.log('제목 처리 후:', form.title)
      validateForm()
    }

    const handleTitleChange = (event) => {
      const value = event.target.value
      console.log('제목 변경 이벤트:', value, '타입:', typeof value)
      
      // 최종 값 설정
      form.title = value
      
      console.log('제목 최종 설정:', form.title)
      logFormChanges()
      validateForm()
    }

    // 설명 입력 처리 함수
    const handleDescriptionInput = (event) => {
      const value = event.target.value
      console.log('설명 입력 이벤트:', value, '타입:', typeof value)
      
      // 값 설정
      form.description = value
      
      console.log('설명 처리 후:', form.description)
      validateForm()
    }

    const handleDescriptionChange = (event) => {
      const value = event.target.value
      console.log('설명 변경 이벤트:', value, '타입:', typeof value)
      
      // 최종 값 설정
      form.description = value
      
      console.log('설명 최종 설정:', form.description)
      logFormChanges()
      validateForm()
    }

    const valid = ref(false)
    const loading = ref(false)
    const images = ref([])
    const imageUrls = ref([])
    const mainImageIndex = ref(0)
    const currentSlide = ref(0)
    
    // 지도 관련 상태
    const map = ref(null)
    const marker = ref(null)
    const selectedLocation = ref(null)
    const mapLoaded = ref(false)
    
    // 스낵바 상태
    const snackbar = reactive({
      show: false,
      message: '',
      color: 'success',
      icon: 'mdi-check-circle'
    })

    // 카테고리 옵션
    const categoryOptions = ref([
      { label: '장난감', value: 'TOY' },
      { label: '사료', value: 'FEED' },
      { label: '의류', value: 'CLOTH' },
      { label: '기타', value: 'OTHER' }
    ])

    // 카테고리 선택
    const selectCategory = (category) => {
      try {
        console.log('=== 카테고리 선택 시작 ===')
        console.log('선택할 카테고리:', category)
        console.log('선택 전 form.category:', form.category)
        console.log('전체 form 객체:', form)
        console.log('카테고리 옵션들:', categoryOptions.value)
        
        // 유효한 카테고리인지 확인
        const validCategory = categoryOptions.value.find(c => c.value === category)
        if (!validCategory) {
          console.error('유효하지 않은 카테고리:', category)
          snackbar.message = '유효하지 않은 카테고리입니다'
          snackbar.color = 'error'
          snackbar.icon = 'mdi-alert-circle'
          snackbar.show = true
          return
        }
        
        // 카테고리 값 설정 (반응성 보장)
        form.category = category
        
        console.log('선택 후 form.category:', form.category)
        console.log('form 객체 업데이트 확인:', form)
        console.log('카테고리 버튼 활성화 상태 확인:')
        categoryOptions.value.forEach(c => {
          console.log(`${c.label}(${c.value}): ${form.category === c.value}`)
        })
        
        // 강제로 반응성 업데이트
        nextTick(() => {
          console.log('nextTick 후 form.category:', form.category)
          console.log('DOM 업데이트 확인')
          console.log('폼 유효성 검사 시작...')
          validateForm()
        })
        
        // 스낵바로 선택 확인
        snackbar.message = `카테고리: ${validCategory.label} 선택됨`
        snackbar.color = 'success'
        snackbar.icon = 'mdi-check-circle'
        snackbar.show = true
        
        // 2초 후 스낵바 숨기기
        setTimeout(() => {
          snackbar.show = false
        }, 2000)
        
      } catch (error) {
        console.error('카테고리 선택 중 오류 발생:', error)
        snackbar.message = '카테고리 선택 중 오류가 발생했습니다'
        snackbar.color = 'error'
        snackbar.icon = 'mdi-alert-circle'
        snackbar.show = true
      }
    }

    // 파일 입력 트리거
    const triggerFileInput = () => {
      const fileInput = document.querySelector('.hidden-file-input')
      if (fileInput) {
        fileInput.click()
      }
    }

    // 이미지 변경 처리
    const handleImageChange = (event) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      // 기존 URL 정리
      imageUrls.value.forEach(url => {
        try {
          URL.revokeObjectURL(url)
        } catch (e) {
          console.warn('Error revoking URL:', e)
        }
      })

      // 파일 유효성 검사 및 URL 생성
      const validFiles = Array.from(files).filter(file => {
        if (!file || !(file instanceof File)) return false
        if (!file.type.startsWith('image/')) return false
        return true
      })

      if (validFiles.length === 0) {
        snackbar.message = '유효한 이미지 파일을 선택해주세요'
        snackbar.color = 'error'
        snackbar.icon = 'mdi-alert-circle'
        snackbar.show = true
        return
      }

      // 파일과 URL 모두 저장
      images.value = validFiles
      try {
        imageUrls.value = validFiles.map(file => URL.createObjectURL(file))
        if (mainImageIndex.value >= imageUrls.value.length) {
          mainImageIndex.value = 0
        }
        currentSlide.value = 0
      } catch (error) {
        console.error('Error creating object URLs:', error)
        imageUrls.value = []
        images.value = []
        mainImageIndex.value = 0
      }
    }

    // 이미지 제거
    const removeImage = (index) => {
      try {
        if (imageUrls.value[index]) {
          URL.revokeObjectURL(imageUrls.value[index])
        }
        imageUrls.value.splice(index, 1)
        images.value.splice(index, 1)
        if (mainImageIndex.value >= imageUrls.value.length) {
          mainImageIndex.value = Math.max(0, imageUrls.value.length - 1)
        }
        if (currentSlide.value >= imageUrls.value.length) {
          currentSlide.value = Math.max(0, imageUrls.value.length - 1)
        }
      } catch (error) {
        console.error('Error removing image:', error)
      }
    }

    // 대표 이미지 설정
    const setMainImage = (index) => {
      mainImageIndex.value = index
    }
    
    // 슬라이더 관련 함수들
    const nextSlide = () => {
      if (currentSlide.value < imageUrls.value.length - 1) {
        currentSlide.value++
      }
    }
    
    const previousSlide = () => {
      if (currentSlide.value > 0) {
        currentSlide.value--
      }
    }
    
    const goToSlide = (index) => {
      currentSlide.value = index
    }

    // 폼 validation 함수
    const validateForm = () => {
      // 문자열 필드는 공백 제거 후 검사
      const hasTitle = form.title && form.title.trim().length > 0
      const hasCategory = !!form.category
      // 가격은 0보다 큰 숫자인지 확인
      const hasPrice = form.price !== null && form.price !== undefined && form.price > 0
      const hasDescription = form.description && form.description.trim().length > 0
      const hasLocation = !!selectedLocation.value
      
      console.log('=== 폼 유효성 검사 ===')
      console.log('제목:', `"${form.title}"`, '→', hasTitle)
      console.log('카테고리:', form.category, '→', hasCategory)
      console.log('가격:', form.price, '→', hasPrice)
      console.log('설명:', `"${form.description}"`, '→', hasDescription)
      console.log('위치:', selectedLocation.value, '→', hasLocation)
      
      valid.value = hasTitle && hasCategory && hasPrice && hasDescription && hasLocation
      
      console.log('최종 유효성:', valid.value)
      console.log('========================')
    }

    // 지도 관련 함수들
    const initMap = () => {
      if (typeof window.kakao === 'undefined') {
        console.warn('Kakao Map API not loaded')
        return
      }

      try {
        const mapContainer = document.getElementById('location-map')
        if (!mapContainer) return

        const mapOption = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
          level: 3
        }

        map.value = new window.kakao.maps.Map(mapContainer, mapOption)
        
        // 마커 생성
        marker.value = new window.kakao.maps.Marker({
          position: mapOption.center,
          draggable: true
        })

        // 마커를 지도에 표시
        marker.value.setMap(map.value)

        // 마커 드래그 이벤트
        window.kakao.maps.event.addListener(marker.value, 'dragend', function() {
          const position = marker.value.getPosition()
          updateLocationFromCoordinates(position.getLat(), position.getLng())
        })

        // 지도 클릭 이벤트
        window.kakao.maps.event.addListener(map.value, 'click', function(mouseEvent) {
          const latlng = mouseEvent.latLng
          marker.value.setPosition(latlng)
          updateLocationFromCoordinates(latlng.getLat(), latlng.getLng())
        })

        console.log('Map initialized successfully')
        mapLoaded.value = true
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    const updateLocationFromCoordinates = (lat, lng) => {
      if (typeof window.kakao === 'undefined') return

      const geocoder = new window.kakao.maps.services.Geocoder()
      const coords = new window.kakao.maps.LatLng(lat, lng)
      
      geocoder.coord2Address(coords.getLng(), coords.getLat(), function(result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0].address.address_name
          selectedLocation.value = {
            address: address,
            lat: lat,
            lng: lng
          }
          validateForm()
        }
      })
    }

    const resetMapLocation = () => {
      if (map.value && marker.value) {
        const center = new window.kakao.maps.LatLng(37.5665, 126.9780)
        map.value.setCenter(center)
        marker.value.setPosition(center)
        selectedLocation.value = null
        validateForm()
        
        snackbar.message = '위치가 초기화되었습니다'
        snackbar.color = 'info'
        snackbar.icon = 'mdi-information'
        snackbar.show = true
      }
    }

    // 컴포넌트 마운트 후 지도 초기화
    onMounted(() => {
      // 초기 폼 유효성 검사
      nextTick(() => {
        validateForm()
      })
      
      // Kakao Map API가 로드될 때까지 대기
      const checkKakaoMap = () => {
        if (typeof window.kakao !== 'undefined' && window.kakao.maps) {
          initMap()
        } else {
          setTimeout(checkKakaoMap, 100)
        }
      }
      checkKakaoMap()
    })

    // 폼 제출
    const submitForm = async () => {
      if (!valid.value) return

      loading.value = true
      
      try {
        const formData = new FormData()
        formData.append('mainImageIndex', mainImageIndex.value)
        formData.append('title', form.title)
        formData.append('category', form.category)
        formData.append('price', form.price)
        formData.append('description', form.description)
        
        // 지도에서 선택된 위치 정보 추가
        if (selectedLocation.value) {
          formData.append('latitude', selectedLocation.value.lat)
          formData.append('longitude', selectedLocation.value.lng)
        }
        
        if (images.value) {
          images.value.forEach((file) => {
            formData.append('images', file)
          })
        }

        // API 호출을 위한 데이터 준비
        const postData = {
          title: form.title,
          category: form.category,
          price: form.price,
          description: form.description,
          latitude: selectedLocation.value?.lat,
          longitude: selectedLocation.value?.lng,
          mainImageIndex: mainImageIndex.value
        }
        
        console.log('=== API 호출 준비 ===')
        console.log('전송할 데이터:', postData)
        console.log('이미지 파일들:', images.value)
        console.log('이미지 개수:', images.value?.length || 0)
        console.log('위치 정보:', selectedLocation.value)
        console.log('========================')
        
        try {
          // API 호출
          console.log('API 호출 시작...')
          
          // 요청 헤더 확인
          const token = localStorage.getItem('accessToken')
          console.log('=== 요청 정보 ===')
          console.log('토큰:', token)
          console.log('토큰 길이:', token?.length)
          console.log('토큰 형식:', token?.substring(0, 20) + '...')
          console.log('================')
          
          const response = await marketAPI.create(postData, images.value)
          
          console.log('=== API 응답 ===')
          console.log('응답 상태:', response.status)
          console.log('응답 데이터:', response.data)
          console.log('응답 헤더:', response.headers)
          console.log('================')
          
          if (response.status === 200 || response.status === 201) {
            // 성공 메시지
            snackbar.message = '거래글이 성공적으로 등록되었습니다!'
            snackbar.color = 'success'
            snackbar.icon = 'mdi-check-circle'
            snackbar.show = true
            
            setTimeout(() => {
              router.push('/market')
            }, 2000)
          } else {
            throw new Error(`서버 응답이 성공이 아닙니다. 상태: ${response.status}`)
          }
        } catch (apiError) {
          console.error('API 호출 중 오류:', apiError)
          console.error('오류 상세:', {
            message: apiError.message,
            response: apiError.response,
            status: apiError.response?.status,
            data: apiError.response?.data,
            headers: apiError.response?.headers
          })
          
          // 403 오류인 경우 인증 문제일 가능성이 높음
          if (apiError.response?.status === 403) {
            console.error('=== 403 오류 분석 ===')
            console.error('인증 토큰 확인 필요')
            console.error('현재 토큰:', localStorage.getItem('accessToken'))
            console.error('====================')
          }
          
          throw apiError
        }
        
      } catch (error) {
        console.error('거래글 등록 실패:', error)
        snackbar.message = '거래글 등록에 실패했습니다. 다시 시도해주세요.'
        snackbar.color = 'error'
        snackbar.icon = 'mdi-alert-circle'
        snackbar.show = true
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      valid,
      loading,
      images,
      imageUrls,
      mainImageIndex,
      currentSlide,
      snackbar,
      categoryOptions,
      // 지도 관련 변수들
      map,
      marker,
      selectedLocation,
      mapLoaded,
      selectCategory,
      triggerFileInput,
      handleImageChange,
      removeImage,
      setMainImage,
      nextSlide,
      previousSlide,
      goToSlide,
      validateForm,
      logFormChanges,
      handleTitleInput,
      handleTitleChange,
      handlePriceInput,
      handlePriceChange,
      handleDescriptionInput,
      handleDescriptionChange,
      submitForm,
      initMap,
      updateLocationFromCoordinates,
      resetMapLocation
    }
  }
}
</script>

<style scoped>
/* 전역 스타일 추가 - scoped 스타일의 우선순위 문제 해결 */
</style>

<style>
/* 카테고리 버튼 활성화 상태를 위한 전역 스타일 */
.category-btn.active {
  border-color: #E87D7D !important;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.5) !important;
  transform: translateY(-4px) !important;
  font-weight: 700 !important;
  z-index: 100 !important;
  position: relative !important;
  border-width: 3px !important;
}

.category-btn.active:hover {
  border-color: #E87D7D !important;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  box-shadow: 0 12px 30px rgba(232, 125, 125, 0.6) !important;
  transform: translateY(-6px) !important;
}

.category-btn.active::after {
  content: '✓' !important;
  position: absolute !important;
  top: -8px !important;
  right: -8px !important;
  width: 24px !important;
  height: 24px !important;
  background: #28a745 !important;
  color: white !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 14px !important;
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
  z-index: 101 !important;
}
</style>

<style scoped>

/* 뒤로가기 버튼 */
.back-btn-wrapper {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
}

.back-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.9rem;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
}

/* 메인 컨테이너 */
.create-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* 폼 컨테이너 */
.form-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 폼 섹션 */
.form-section {
  padding: 32px;
  border-bottom: 1px solid #f1f3f4;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  border-radius: 2px;
}

/* 폼 그리드 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* 폼 필드 */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

/* 폼 입력 */
.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #E87D7D;
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.1);
}

.form-input::placeholder {
  color: #adb5bd;
}

/* 가격 입력 */
.price-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.price-input {
  padding-right: 60px;
}

.price-unit {
  position: absolute;
  right: 20px;
  color: #6c757d;
  font-weight: 500;
  font-size: 0.95rem;
}



/* 이미지 업로드 섹션 */
.image-upload-section {
  margin-top: 16px;
}

.main-upload-area {
  border: 2px dashed #e9ecef;
  border-radius: 16px;
  min-height: 300px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.main-upload-area:hover {
  border-color: #E87D7D;
  background: #fff5f5;
}

.main-upload-area.has-images {
  border: none;
  min-height: auto;
}

/* 업로드 콘텐츠 */
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  cursor: pointer;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}
:
.upload-content:hover {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.15);
}

.upload-icon {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  border-radius: 50%;
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.upload-content:hover .upload-icon {
  transform: scale(1.1);
  box-shadow: 0 12px 30px rgba(232, 125, 125, 0.4);
}

.upload-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.upload-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0 0 16px 0;
}

.upload-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* 숨겨진 파일 입력 */
.hidden-file-input {
  display: none;
}

/* 이미지 슬라이더 */
.image-slider-container {
  width: 100%;
}

.image-slider {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 16px;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 대표 이미지 체크박스 */
.main-image-checkbox {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  cursor: pointer;
}

.checkbox {
  width: 32px;
  height: 32px;
  border: 3px solid white;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.checkbox.checked {
  background: #E87D7D;
  border-color: white;
}

.check-mark {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

/* 이미지 제거 버튼 */
.remove-image-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.remove-image-btn:hover {
  background: rgba(220, 53, 69, 0.9);
  transform: scale(1.1);
}

/* 슬라이더 네비게이션 */
.slider-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 0 16px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 슬라이드 인디케이터 */
.slide-indicators {
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dee2e6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator.active {
  background: #E87D7D;
  transform: scale(1.2);
}

/* 지역 섹션 */
.region-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 지도 선택 섹션 */
.map-selection-section {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  overflow: hidden;
}

.map-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #fff5f5, #fff);
  border-bottom: 1px solid #e9ecef;
}


.map-title-content {
  flex: 1;
}

.map-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 8px 0 0 0;
  line-height: 1.5;
}

/* 지도 컨테이너 */
.map-container {
  padding: 24px;
}

.map-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.location-map {
  width: 100%;
  height: 300px;
  border-radius: 12px;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.map-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 0.9rem;
}

/* 지도 컨트롤 */
.map-controls {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.map-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.secondary-btn:hover {
  background: #e9ecef;
  color: #495057;
}

/* 위치 정보 */
.location-info {
  margin-top: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  font-weight: 600;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.info-content {
  padding: 20px;
}

.address-display,
.coordinate-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.address-display:last-child,
.coordinate-display:last-child {
  margin-bottom: 0;
}

.address-text,
.coordinate-text {
  margin: 0;
  font-size: 0.95rem;
  color: #2c3e50;
  line-height: 1.4;
}

/* 지도 힌트 */
.map-hint {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
}


.hint-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-title {
  font-weight: 600;
  color: #856404;
  font-size: 0.9rem;
}

.hint-text {
  color: #856404;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
}

/* 상세 설명 섹션 */
.description-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-textarea {
  width: 100%;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #E87D7D;
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.1);
}

.form-textarea::placeholder {
  color: #adb5bd;
}

.description-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

/* 액션 섹션 */
.action-section {
  display: flex;
  gap: 16px;
  padding: 32px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #e9ecef;
  color: #6c757d;
}

.cancel-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.submit-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

/* 스낵바 */
.snackbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  animation: slideUp 0.3s ease;
}

.snackbar.success {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.snackbar.error {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.snackbar.warning {
  background: linear-gradient(135deg, #ffc107, #e0a800);
}

.snackbar.info {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* 카테고리 버튼 */
.category-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}

/* 카테고리 버튼 기본 스타일 강화 */
.category-buttons .category-btn {
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 카테고리 버튼 hover 효과 강화 */
.category-buttons .category-btn:hover:not(.active),
.category-btn:hover:not(.active) {
  border-color: #E87D7D;
  background: #fff5f5;
  color: #E87D7D;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.2);
}

/* 활성화된 카테고리 버튼 - 최고 우선순위로 적용되도록 강화 */
.category-btn.active,
.category-btn[data-category].active,
button.category-btn.active,
div.category-buttons .category-btn.active,
div.category-buttons button.category-btn.active,
div.category-buttons .category-btn[data-category].active {
  border-color: #E87D7D !important;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.5) !important;
  transform: translateY(-4px) !important;
  font-weight: 700 !important;
  z-index: 100 !important;
  position: relative !important;
  border-width: 3px !important;
}

.category-btn.active:hover,
.category-btn[data-category].active:hover,
button.category-btn.active:hover,
div.category-buttons .category-btn.active:hover,
div.category-buttons button.category-btn.active:hover,
div.category-buttons .category-btn[data-category].active:hover {
  border-color: #E87D7D !important;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  box-shadow: 0 12px 30px rgba(232, 125, 125, 0.6) !important;
  transform: translateY(-6px) !important;
}

/* 선택된 카테고리 버튼에 추가 효과 */
.category-btn.active::after,
.category-btn[data-category].active::after,
button.category-btn.active::after,
div.category-buttons .category-btn.active::after,
div.category-buttons button.category-btn.active::after,
div.category-buttons .category-btn[data-category].active::after {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  z-index: 101;
}

/* 선택된 카테고리 표시 */
.category-selected {
  margin-top: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff5f5, #fff);
  border: 3px solid #E87D7D;
  border-radius: 16px;
  font-size: 1rem;
  color: #E87D7D;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.2);
  position: relative;
  overflow: hidden;
}

.category-selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
}

.selected-category-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selected-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: #E87D7D;
}

.selected-text strong {
  color: #FF6B6B;
  font-weight: 800;
}

/* 디버깅 정보 */
.debug-info {
  color: #6c757d;
  font-size: 0.8rem;
  font-family: monospace;
  margin-left: 8px;
}

/* 카테고리 힌트 */
.category-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1976d2;
  border-left: 3px solid #1976d2;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .create-container {
    padding: 16px;
  }
  
  .form-section {
    padding: 24px 20px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .category-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-section {
    flex-direction: column;
    padding: 24px 20px;
  }
  
  .map-controls {
    flex-direction: column;
  }
  
  .slider-nav {
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .create-container {
    padding: 12px;
  }
  
  .form-section {
    padding: 20px 16px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .form-input,
  .form-textarea {
    padding: 14px 16px;
  }
}
</style>
