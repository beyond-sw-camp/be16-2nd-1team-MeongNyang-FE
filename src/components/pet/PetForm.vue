<template>
  <v-card class="no-inner-surface" variant="text" elevation="0">
    <!-- 단계별 진행 표시 -->
    <div class="step-indicator">
      <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-label">이미지 업로드</div>
      </div>
      <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
      <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <div class="step-label">기본 정보</div>
      </div>
      <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
      <div class="step" :class="{ active: currentStep === 3 }">
        <div class="step-number">3</div>
        <div class="step-label">소개글</div>
      </div>
    </div>

    <!-- 1단계: 이미지 업로드 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="step-header">
        <h2>{{ isEditMode ? '프로필 사진 수정' : '프로필 사진 선택하기' }}</h2>
        <p>{{ isEditMode ? '기존 사진을 유지하거나 새로운 사진으로 변경하세요.' : '마음에 드는 반려동물 사진이 있나요? 지금 업로드하세요.' }}</p>
      </div>
      
      <div class="image-upload-section">
        <div class="image-container upload-surface">
          <v-avatar
            :size="240"
            class="pet-avatar clickable-avatar"
            color="grey-lighten-4"
            @click="handleImageClick"
          >
            <!-- 이미지 제거 상태이거나 이미지가 없는 경우: 기본 아이콘 표시 -->
            <v-icon 
              v-if="imageRemoved || !previewImage" 
              :size="100" 
              :color="getSpeciesIconColor()" 
              :icon="getSpeciesIcon()" 
            />
            <!-- 이미지가 있고 제거되지 않은 경우: 이미지 표시 -->
            <v-img 
              v-else-if="previewImage && !imageRemoved"
              :src="previewImage" 
              :alt="`${petData.name || '반려동물'} 사진`"
              cover
              :key="`preview-${previewImage}`"
              class="clickable-image"
              @dblclick="clearImage"
            />
          </v-avatar>
          
          <div class="image-hint">
            <span>이미지 크기는 5MB 이하 권장</span>
          </div>
          
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageChange"
          />
        </div>
      </div>

      <div class="step-actions">
        <v-btn
          variant="outlined"
          @click="$emit('close')"
          class="cancel-btn"
          rounded="lg"
          size="large"
        >
          취소
        </v-btn>
        
        <v-btn
          :disabled="!previewImage || imageRemoved"
          @click="nextStep"
          class="next-btn"
          rounded="lg"
          size="large"
        >
          다음
        </v-btn>
      </div>
    </div>
    
    

    <!-- 2단계: 기본 정보 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="step-header">
        <h2>{{ isEditMode ? '기본 정보 수정' : '기본 정보 입력' }}</h2>
        <p>{{ isEditMode ? '반려동물의 기본 정보를 수정해주세요.' : '반려동물의 기본 정보를 입력해주세요.' }}</p>
      </div>
      
      <v-form ref="form" v-model="isValid">
      <div class="form-fields-section">
          <!-- 이름 -->
          <div class="form-field">
            <label class="field-label">반려동물 이름 *</label>
            <v-text-field
              v-model="petData.name"
              placeholder="반려동물 이름을 입력하세요"
              :rules="[v => !!v || '반려동물 이름은 필수입니다']"
              required
              variant="outlined"
              rounded="lg"
              class="form-input"
              hide-details="auto"
              density="comfortable"
            />
          </div>

          <!-- 종류 -->
          <div class="form-field">
            <label class="field-label">반려동물 종류 *</label>
            <v-autocomplete
              v-model="petData.speciesId"
              :items="speciesOptions"
              item-title="species"
              item-value="speciesId"
              placeholder="종류를 검색하세요"
              :rules="[v => !!v || '반려동물 종류는 필수입니다']"
              required
              variant="outlined"
              rounded="lg"
              class="form-input"
              hide-details="auto"
              density="comfortable"
            />
          </div>

          <!-- 성별 -->
          <div class="form-field">
            <label class="field-label">성별 *</label>
            <v-select
              v-model="petData.gender"
              :items="genderOptions"
              item-title="title"
              item-value="value"
              placeholder="성별을 선택하세요"
              variant="outlined"
              rounded="lg"
              class="form-input"
              hide-details="auto"
              density="comfortable"
              required
              :rules="[v => !!v || '성별을 선택해주세요']"
            />
          </div>

          <!-- 나이 -->
          <div class="form-field">
            <label class="field-label">나이 *</label>
            <v-text-field
              v-model="petData.age"
              type="number"
              placeholder="자동 계산됨"
              variant="outlined"
              rounded="lg"
              class="form-input"
              hide-details="auto"
              density="comfortable"
              min="0"
              max="30"
              readonly
              :disabled="true"
              required
              :rules="[v => v !== null && v !== undefined || '나이를 입력해주세요']"
            />
          </div>

          <!-- 몸무게 -->
          <div class="form-field">
            <label class="field-label">몸무게 (kg) *</label>
            <v-text-field
              v-model="petData.weight"
              type="number"
              placeholder="몸무게를 입력하세요"
              variant="outlined"
              rounded="lg"
              class="form-input"
              hide-details="auto"
              density="comfortable"
              min="0"
              max="100"
              step="0.1"
              required
              :rules="[v => !!v || '몸무게를 입력해주세요']"
            />
          </div>

          <!-- 생일 -->
          <div class="form-field">
            <label class="field-label">생일 (선택사항)</label>
            <div class="birthday-input-container">
                  <v-text-field
                :model-value="formattedBirthday"
                    placeholder="생일을 선택하세요"
                    readonly
                    variant="outlined"
                    rounded="lg"
                    class="form-input"
                    hide-details="auto"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar"
                @click="openBirthdayPicker"
              />
              
              <!-- 생일 삭제 버튼 -->
              <v-btn
                v-if="petData.birthday"
                icon="mdi-close"
                variant="text"
                size="small"
                color="error"
                @click="clearBirthday"
                class="clear-birthday-btn"
                aria-label="생일 삭제"
              />
            </div>
            
            <div class="field-hint">
              <span>생일을 입력하면 나이가 자동으로 계산됩니다</span>
            </div>
          </div>
        </div>
      </v-form>
      
      <div class="step-actions">
        <v-btn
          variant="outlined"
          @click="previousStep"
          class="cancel-btn"
          rounded="lg"
          size="large"
        >
          이전
        </v-btn>
        
        <!-- 수정 모드일 때만 사진 변경 버튼 표시 -->
        <v-btn
          v-if="isEditMode"
          variant="outlined"
          @click="goToImageStep"
          class="image-edit-btn"
          rounded="lg"
          size="large"
          prepend-icon="mdi-image-edit"
        >
          사진 변경
        </v-btn>
        
        <v-btn
          :disabled="!isValid"
          @click="nextStep"
          class="next-btn"
          rounded="lg"
          size="large"
        >
          다음
        </v-btn>
      </div>
      

    </div>

    <!-- 3단계: 소개글 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="step-header">
        <h2>{{ isEditMode ? '소개글 수정' : '소개글 작성' }}</h2>
        <p>{{ isEditMode ? '반려동물 소개글을 수정해주세요.' : '반려동물을 소개해주세요.' }}</p>
      </div>
      
      <div class="form-fields-section">
        <div class="form-field full-width">
          <label class="field-label">소개글 (선택사항)</label>
          <v-textarea
            v-model="petData.introduce"
            placeholder="반려동물을 소개해주세요"
            variant="outlined"
            rounded="lg"
            class="form-input"
            hide-details="auto"
            rows="5"
            max-rows="8"
            counter="500"
            maxlength="500"
            density="comfortable"
            no-resize
          />
          <div class="field-hint">
            <span>반려동물의 성격이나 특징을 자유롭게 작성해주세요 (최대 500자)</span>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <v-btn
          variant="outlined"
          @click="previousStep"
          class="cancel-btn"
          rounded="lg"
          size="large"
        >
          이전
        </v-btn>
        
        <v-btn
          type="submit"
          :loading="submitting"
          :disabled="submitting"
          @click="handleSubmit"
          class="submit-btn"
          rounded="lg"
          size="large"
        >
          {{ isEditMode ? '수정' : '등록' }}
        </v-btn>
      </div>
  </div>

    <!-- 생일 선택기 모달 - 사진 형식대로 -->
    <v-dialog 
      v-model="showBirthdayPicker" 
      max-width="400"
      @click:outside="showBirthdayPicker = false"
      content-class="date-picker-dialog"
    >
      <v-card class="date-picker-card">
                  <!-- 첫 화면: 일반 달력 -->
          <div v-if="!showYearPicker && !showMonthPicker" class="date-picker-main">
                                  <div class="date-picker-header">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                @click="previousMonth"
                class="nav-btn"
              />
              <span class="current-month-year" @click="showYearPicker = true">{{ currentDate.getFullYear() }}년 {{ currentDate.getMonth() + 1 }}월</span>
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                @click="nextMonth"
                class="nav-btn"
              />
            </div>
            
            <!-- 요일 헤더 -->
            <div class="weekdays-header">
              <div class="weekday">일</div>
              <div class="weekday">월</div>
              <div class="weekday">화</div>
              <div class="weekday">수</div>
              <div class="weekday">목</div>
              <div class="weekday">금</div>
              <div class="weekday">토</div>
            </div>
            
            <!-- 날짜 그리드 -->
            <div class="calendar-grid">
              <div
                v-for="date in calendarDates"
                :key="date.key"
                :class="['calendar-day', {
                  'other-month': !date.isCurrentMonth,
                  'selected': date.isSelected,
                  'today': date.isToday,
                  'disabled': date.isDisabled
                }]"
                @click="!date.isDisabled && selectDate(date)"
              >
                {{ date.day }}
              </div>
            </div>
          
                      <div class="date-picker-actions">
              <v-btn
                variant="outlined"
                @click="cancelDateSelection"
                class="cancel-btn"
              >
                취소
              </v-btn>
              <v-btn
                color="#007bff"
                @click="confirmDateSelection"
                class="confirm-btn"
              >
                확인
              </v-btn>
            </div>
        </div>
        
        <!-- 연도 선택 화면 -->
        <div v-if="showYearPicker" class="year-picker">
          <div class="year-picker-header">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click="previousYearRange"
              class="nav-btn"
            />
                          <span class="year-range" @click="showYearPicker = false; showMonthPicker = true">{{ yearRangeStart }} - {{ yearRangeEnd }}</span>
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              @click="nextYearRange"
              class="nav-btn"
            />
          </div>
          
          <div class="year-grid">
            <div
              v-for="year in yearRange"
              :key="year"
                              :class="['year-cell', {
                  'selected': year === currentDate.getFullYear()
                }]"
              @click="selectYear(year)"
            >
              {{ year }}
            </div>
          </div>
          
          <div class="date-picker-actions">
            <v-btn
              variant="outlined"
              @click="backToMain"
              class="cancel-btn"
            >
              뒤로
            </v-btn>
            <v-btn
              color="#007bff"
              @click="confirmYearSelection"
              class="confirm-btn"
            >
              확인
            </v-btn>
          </div>
        </div>
        
        <!-- 월 선택 화면 -->
        <div v-if="showMonthPicker" class="month-picker">
                      <div class="month-picker-header">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                @click="previousYear"
                class="nav-btn"
              />
              <span class="current-year">{{ currentDate.getFullYear() }}년</span>
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                @click="nextYear"
                class="nav-btn"
              />
            </div>
          
          <div class="month-grid">
            <div
              v-for="month in 12"
              :key="month"
              :class="['month-cell', {
                'selected': month === selectedMonth
              }]"
              @click="selectMonth(month)"
            >
              {{ month }}월
            </div>
          </div>
          
          <div class="date-picker-actions">
            <v-btn
              variant="outlined"
              @click="backToMain"
              class="cancel-btn"
            >
              뒤로
            </v-btn>
            <v-btn
              color="#007bff"
              @click="confirmMonthSelection"
              class="confirm-btn"
            >
              확인
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { usePetStore } from '@/stores/pet'

export default {
  name: 'PetForm',
  
  props: {
    pet: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'success'],
  
  setup(props, { emit }) {
    try {
      console.log('🔄 PetForm setup 시작')
      console.log('props:', props)
      console.log('isEdit:', props?.isEdit)
      console.log('pet:', props?.pet)
      
      // props 안전하게 처리 (기본값 설정)
      const isEditMode = computed(() => {
        try {
          const value = props?.isEdit
          console.log('🔍 isEdit prop 값:', value, typeof value)
          return Boolean(value)
        } catch (error) {
          console.error('❌ isEdit prop 처리 오류:', error)
          return false
        }
      })
      
      const petDataFromProps = computed(() => {
        try {
          const value = props?.pet
          console.log('🔍 pet prop 값:', value, typeof value)
          return value || null
        } catch (error) {
          console.error('❌ pet prop 처리 오류:', error)
          return null
        }
      })
    
    const petStore = usePetStore()
    const form = ref(null)
    const fileInput = ref(null)
    
    // 단계 관리
    const currentStep = ref(1)
    
    // 반응형 데이터
    const previewImage = ref(null)
    const imageFile = ref(null)
    const imageRemoved = ref(false)
    const submitting = ref(false)
    const showBirthdayPicker = ref(false)
    
    // 달력 관련 변수들
    const currentDate = ref(new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"})))
    const selectedDate = ref(null)
    const showYearPicker = ref(false)
    const showMonthPicker = ref(false)
    const selectedMonth = ref(null)
    const yearRangeStart = ref(2017)
    const yearRangeEnd = ref(2028)
    
    // 펫 데이터 (로컬 상태)
    const petData = reactive({
      name: '',
      speciesId: null,
      speciesName: '',
      gender: '',
      age: null,
      weight: null,
      birthday: null,
      introduce: ''
    })
    
    // 단계 이동 메서드들
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }
    
    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }
    
    // 이미지 단계로 이동 (수정 모드용)
    const goToImageStep = () => {
      currentStep.value = 1
      console.log('🔄 이미지 단계로 이동 (사진 변경)')
    }
    
    // 폼 유효성 검사
    const isValid = computed(() => {
      // 2단계에서만 검사
      if (currentStep.value !== 2) return true
      
      const hasRequiredFields = petData.name && 
                               petData.speciesId && 
                               petData.gender && 
                               petData.weight !== null && 
                               petData.weight !== ''
      
      const ageValue = Number(petData.age)
      const hasValidAge = petData.age !== null && 
                         petData.age !== '' && 
                         !isNaN(ageValue) &&
                         ageValue >= 0 && 
                         ageValue <= 30
      
      return hasRequiredFields && hasValidAge
    })
    
    // 로딩 상태
    const loading = computed(() => petStore.isLoading)
    
    // 종류 옵션
    const speciesOptions = computed(() => {
      const species = petStore.getSpecies
      console.log('🔍 petStore.getSpecies:', species)
      
      if (species && species.length > 0) {
        // 백엔드 데이터 구조에 맞게 매핑
        const mapped = species.map(s => {
          console.log('🔍 개별 species 객체:', s)
          console.log('🔍 s.species:', s.species)
          console.log('🔍 s.id:', s.id)
          console.log('🔍 s.speciesId:', s.speciesId)
          
          return {
            species: s.species,
            speciesId: s.id || s.speciesId || null
          }
        })
        console.log('🔍 mapped speciesOptions:', mapped)
        return mapped
      }
      console.log('⚠️ species가 비어있음')
      return []
    })
    
    // 성별 옵션
    const genderOptions = [
      { value: 'MALE', title: '수컷' },
      { value: 'FEMALE', title: '암컷' },
      { value: 'NEUTRALITY', title: '중성' }
    ]
    
    // 날짜 제한
    const maxDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })
    
    const minDate = computed(() => {
      const today = new Date()
      const thirtyYearsAgo = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate())
      return thirtyYearsAgo.toISOString().split('T')[0]
    })
    
    // 포맷된 생일 표시
    const formattedBirthday = computed(() => {
      if (!petData.birthday) return ''
      
      const date = new Date(petData.birthday)
      const today = new Date()
      const age = calculateAge(petData.birthday)
      
      // 올해 생일이 지났는지 확인
      const thisYearBirthday = new Date(today.getFullYear(), date.getMonth(), date.getDate())
      const isBirthdayPassed = thisYearBirthday <= today
      
      // 다음 생일까지 남은 일수 계산
      let nextBirthday
      if (isBirthdayPassed) {
        nextBirthday = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate())
      } else {
        nextBirthday = thisYearBirthday
      }
      
      const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24))
      
      // 포맷된 날짜 반환
      const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      return `${formattedDate} (${age}살, ${daysUntilBirthday}일 후)`
    })
    
    // 나이 계산 함수 (더 정확한 계산)
    const calculateAge = (birthday) => {
      if (!birthday) return null
      
      // 현재 날짜를 명시적으로 설정 (브라우저 시간에 의존하지 않음)
      const today = new Date()
      const birthDate = new Date(birthday)
      
      // 날짜 파싱 확인
      if (isNaN(birthDate.getTime())) {
        console.error('❌ 잘못된 생일 형식:', birthday)
        return null
      }
      
      // 미래 날짜 체크
      if (birthDate > today) {
        console.warn('⚠️ 미래 날짜가 입력되었습니다:', birthday)
        return 0
      }
      
      // 더 정확한 나이 계산
      let age = today.getFullYear() - birthDate.getFullYear()
      
      // 생일이 지나지 않았으면 1살 빼기
      const currentMonth = today.getMonth()
      const birthMonth = birthDate.getMonth()
      const currentDay = today.getDate()
      const birthDay = birthDate.getDate()
      
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        age--
      }
      
      console.log('📅 나이 계산 상세:', {
        birthday,
        today: today.toISOString().split('T')[0],
        todayYear: today.getFullYear(),
        birthDate: birthDate.toISOString().split('T')[0],
        birthYear: birthDate.getFullYear(),
        currentMonth,
        birthMonth,
        currentDay,
        birthDay,
        rawAge: today.getFullYear() - birthDate.getFullYear(),
        calculatedAge: age,
        isBirthdayPassed: !(currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)),
        expectedAge: 2025 - 2019 // 2025년 기준으로 6살이어야 함
      })
      
      // 0살도 허용
      return Math.max(0, age)
    }
    
    // 생일 변경 시 나이 자동 계산
    const onBirthdayChange = (birthday) => {
      if (birthday) {
        const age = calculateAge(birthday)
        petData.age = age
      }
      showBirthdayPicker.value = false
    }
    
    // 생일 삭제
    const clearBirthday = () => {
      petData.birthday = null
      petData.age = null
    }
    

    
    // 이미지 관련 메서드들
    const handleImageClick = () => {
      fileInput.value?.click()
    }
    
    const handleImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('이미지 크기는 5MB 이하로 선택해주세요.')
          return
        }
        
        imageFile.value = file
        previewImage.value = URL.createObjectURL(file)
          imageRemoved.value = false
      }
    }
    
    const clearImage = () => {
        imageFile.value = null
        previewImage.value = null
      imageRemoved.value = true
    }
    
    // 종류 변경 시 종류 이름 업데이트
    const handleSpeciesIdChange = () => {
      const selectedSpecies = speciesOptions.value.find(s => s.speciesId === petData.speciesId)
      if (selectedSpecies) {
        petData.speciesName = selectedSpecies.species
      }
    }
    
    // 종류 아이콘 관련
    const getSpeciesIcon = () => {
      if (petData.speciesId) {
        return 'mdi-paw'
      }
      return 'mdi-plus'
    }
    
    const getSpeciesIconColor = () => {
      if (petData.speciesId) {
        return '#ec4899'
      }
      return '#9ca3af'
    }
    
    // 폼 제출
    const handleSubmit = async () => {
      console.log('=== handleSubmit 시작 ===')
      console.log('isValid:', isValid.value)
      console.log('currentStep:', currentStep.value)
      console.log('petData:', petData)
      console.log('imageFile:', imageFile.value)
      console.log('imageRemoved:', imageRemoved.value)
      
      if (!isValid.value) {
        console.log('❌ 폼이 유효하지 않음')
        return
      }
      
      submitting.value = true
      
      try {
        const formData = new FormData()
        
        // speciesName 자동 설정
        if (!petData.speciesName && petData.speciesId) {
          const selectedSpecies = speciesOptions.value.find(s => s.speciesId === petData.speciesId)
          if (selectedSpecies) {
            petData.speciesName = selectedSpecies.species
            console.log(`✅ speciesName 자동 설정됨:`, selectedSpecies.species)
          }
        }
        
        // speciesId가 문자열인 경우 숫자로 변환
        if (petData.speciesId && typeof petData.speciesId === 'string') {
          console.log('🔍 speciesId 변환 시작:', petData.speciesId)
          console.log('🔍 speciesOptions:', speciesOptions.value)
          
          const selectedSpecies = speciesOptions.value.find(s => s.species === petData.speciesId)
          if (selectedSpecies && selectedSpecies.speciesId) {
            petData.speciesId = selectedSpecies.speciesId
            petData.speciesName = selectedSpecies.species
            console.log(`✅ speciesId 변환됨: "${petData.speciesId}" -> ${selectedSpecies.speciesId}`)
      } else {
            console.log(`❌ speciesId 변환 실패: "${petData.speciesId}"에 해당하는 종을 찾을 수 없음`)
            console.log('사용 가능한 종들:', speciesOptions.value)
            // 변환 실패 시 원본 값 유지
            console.log('⚠️ 원본 speciesId 값 유지:', petData.speciesId)
          }
        }
        
        // 기존에 잘 되던 로직으로 되돌리기 (백엔드 구조에 맞게)
        // 1. 개별 필드들을 FormData에 추가
        Object.keys(petData).forEach(key => {
          if (petData[key] !== null && petData[key] !== '') {
            formData.append(key, petData[key])
            console.log(`✅ ${key} 추가됨:`, petData[key])
          } else {
            console.log(`⚠️ ${key} 값 없음:`, petData[key])
          }
        })
        
        // 2. 이미지 파일 추가 (기존 키 'image' 사용)
        if (imageFile.value && !imageRemoved.value) {
          console.log('🖼️ 이미지 파일 상세 정보:', {
            name: imageFile.value.name,
            size: imageFile.value.size,
            type: imageFile.value.type,
            lastModified: imageFile.value.lastModified
          })
          
          formData.append('image', imageFile.value)  // 기존 키 사용
          console.log('✅ 이미지 파일 추가됨 (image 키):', imageFile.value.name)
      } else {
          console.log('⚠️ 이미지 파일 없음 또는 제거됨')
        }
        
        console.log('=== FormData 내용 ===')
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value)
        }
        
        console.log('=== 최종 FormData 검증 ===')
        console.log('이미지 파일 존재:', !!imageFile.value)
        console.log('이미지 제거 상태:', imageRemoved.value)
        console.log('FormData 크기:', formData.entries().length)
        
        // FormData 내용을 다시 한번 확인
        console.log('=== 최종 FormData 내용 재확인 ===')
        const formDataArray = []
        for (let [key, value] of formData.entries()) {
          formDataArray.push({ key, value })
          console.log(`🔍 ${key}:`, value)
        }
        console.log('FormData 배열:', formDataArray)
        
        if (isEditMode.value) {
          // 수정 모드
          console.log('🔄 수정 모드 - updatePet 호출')
          
          // 수정 모드일 때 이미지가 변경되지 않았으면 기존 이미지 URL 유지
          if (!imageFile.value && !imageRemoved.value && previewImage.value) {
            console.log('📸 기존 이미지 유지:', previewImage.value)
            // 기존 이미지 URL을 petData에 추가
            petData.url = previewImage.value
          }
          
          await petStore.updatePet(petDataFromProps.value.id, petData, imageFile.value)
          emit('success', petData)
        } else {
          // 등록 모드
          console.log('🆕 등록 모드 - registerPet 호출')
          
          console.log('=== 전송할 데이터 확인 ===')
          console.log('petData 객체:', {
            name: petData.name,
            speciesId: petData.speciesId,
            speciesName: petData.speciesName,
            gender: petData.gender,
            age: petData.age,
            weight: petData.weight,
            birthday: petData.birthday,
            introduce: petData.introduce
          })
          console.log('이미지 파일:', imageFile.value)
          
          // ✅ 올바른 방식: petData 객체와 imageFile을 별도로 전달
          await petStore.registerPet(petData, imageFile.value)
          emit('success', '반려동물이 등록되었습니다.')
        }
        
        console.log('✅ 성공적으로 저장됨')
        emit('close')
      } catch (error) {
        console.error('❌ 펫 저장 오류:', error)
        console.error('에러 상세:', error.message)
        console.error('에러 스택:', error.stack)
        alert('저장 중 오류가 발생했습니다.')
      } finally {
        submitting.value = false
        console.log('=== handleSubmit 완료 ===')
      }
    }
    
    // 수정 모드일 때 기존 데이터 로드
    watch(() => petDataFromProps.value, (newPet) => {
      console.log('🔄 PetForm watch pet 변경 감지:', newPet)
      console.log('isEdit 상태:', isEditMode.value)
      console.log('speciesOptions 로드됨:', speciesOptions.value.length)
      
      if (newPet && isEditMode.value) {
        console.log('🔄 수정 모드: 기존 데이터 로드 시작', newPet)
        
        // 펫 데이터 복사
        petData.name = newPet.name || ''
        
        // speciesId와 speciesName 매핑 개선
        if (newPet.speciesId) {
          petData.speciesId = newPet.speciesId
          petData.speciesName = newPet.speciesName || newPet.species || ''
          console.log('✅ speciesId 직접 사용:', petData.speciesId)
        } else if (newPet.species) {
          // species가 있는 경우 speciesId 찾기
          console.log('🔍 species로 speciesId 찾기:', newPet.species)
          const speciesOption = speciesOptions.value.find(s => s.species === newPet.species)
          if (speciesOption) {
            petData.speciesId = speciesOption.speciesId
            petData.speciesName = speciesOption.species
            console.log('✅ species로 speciesId 찾음:', petData.speciesId)
          } else {
            console.log('❌ species에 해당하는 speciesId를 찾을 수 없음')
          }
        }
        
        petData.gender = newPet.gender || ''
        petData.age = newPet.age || null
        petData.weight = newPet.weight || null
        petData.birthday = newPet.birthday || null
        petData.introduce = newPet.introduce || ''
        
        console.log('📝 복사된 petData:', petData)
        
        // 기존 이미지가 있으면 표시 (url 또는 imageUrl 필드 확인)
        if (newPet.url && newPet.url.trim() !== '') {
          previewImage.value = newPet.url
          imageRemoved.value = false
          console.log('📸 기존 이미지 로드 (url):', newPet.url)
        } else if (newPet.imageUrl && newPet.imageUrl.trim() !== '') {
          previewImage.value = newPet.imageUrl
          imageRemoved.value = false
          console.log('📸 기존 이미지 로드 (imageUrl):', newPet.imageUrl)
        }
        
        // 수정 모드일 때는 2단계(기본 정보)부터 시작
        currentStep.value = 2
        console.log('✅ 수정 모드: 데이터 로드 완료, 2단계로 이동')
        console.log('현재 단계:', currentStep.value)
      } else {
        console.log('⚠️ 수정 모드가 아니거나 pet 데이터가 없음')
        console.log('newPet 존재:', !!newPet)
        console.log('isEdit 값:', props.isEdit)
      }
    }, { immediate: true })
    
    // 컴포넌트 마운트 시 종류 데이터 로드
    onMounted(async () => {
      console.log('🔄 PetForm 마운트 시작')
      await petStore.fetchSpecies()
      console.log('✅ 종류 데이터 로드 완료')
      
      // 수정 모드이고 pet 데이터가 있으면 다시 데이터 로드
      if (isEditMode.value && petDataFromProps.value) {
        console.log('🔄 마운트 후 수정 모드 데이터 재로드')
        // 약간의 지연 후 데이터 로드
        setTimeout(() => {
          console.log('⏰ 지연 후 데이터 로드 실행')
        }, 100)
      }
    })
    
    // 달력 관련 함수들
    const yearRange = computed(() => {
      const years = []
      for (let i = yearRangeStart.value; i <= yearRangeEnd.value; i++) {
        years.push(i)
      }
      return years
    })
    
    const previousYear = () => {
      const newDate = new Date(currentDate.value)
      newDate.setFullYear(newDate.getFullYear() - 1)
      currentDate.value = newDate
    }
    
    const nextYear = () => {
      const newDate = new Date(currentDate.value)
      newDate.setFullYear(newDate.getFullYear() + 1)
      currentDate.value = newDate
    }
    
    const previousMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() - 1)
      currentDate.value = newDate
    }
    
    const nextMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + 1)
      currentDate.value = newDate
    }
    
    const calendarDates = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const dates = []
      const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
      today.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
      
      // 6주(42일) 또는 마지막 날짜까지 표시
      const totalDays = Math.max(42, startDate.getDate() + lastDay.getDate() + (6 - Math.ceil((startDate.getDate() + lastDay.getDate()) / 7)) * 7)
      
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
        date.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
        
        dates.push({
          key: i,
          day: date.getDate(),
          date: date,
          isCurrentMonth: date.getMonth() === month,
          isSelected: selectedDate.value && date.toDateString() === selectedDate.value.toDateString(),
          isToday: date.toDateString() === today.toDateString(),
          isDisabled: date > today // 오늘 이후 날짜는 비활성화
        })
      }
      
      return dates
    })
    
    const selectDate = (date) => {
      selectedDate.value = date.date
    }
    
    const previousYearRange = () => {
      yearRangeStart.value -= 12
      yearRangeEnd.value -= 12
    }
    
    const nextYearRange = () => {
      yearRangeStart.value += 12
      yearRangeEnd.value += 12
    }
    
    const selectMonth = (month) => {
      selectedMonth.value = month
      showMonthPicker.value = true
    }
    
    const selectYear = (year) => {
      currentDate.value = new Date(year, currentDate.value.getMonth(), 1)
      showYearPicker.value = false
    }
    
    const backToMain = () => {
      showYearPicker.value = false
      showMonthPicker.value = false
      selectedMonth.value = null
    }
    
    const confirmYearSelection = () => {
      showYearPicker.value = false
    }
    
    const confirmMonthSelection = () => {
      if (selectedMonth.value) {
        currentDate.value = new Date(currentDate.value.getFullYear(), selectedMonth.value - 1, 1)
        showMonthPicker.value = false
        selectedMonth.value = null
      }
    }
    
    const cancelDateSelection = () => {
      showBirthdayPicker.value = false
      showYearPicker.value = false
      showMonthPicker.value = false
      selectedDate.value = null
      selectedMonth.value = null
    }
    
    const openBirthdayPicker = () => {
      // DB에 저장된 날짜가 있으면 해당 날짜로 달력 이동
      if (petData.birthday) {
        const savedDate = new Date(petData.birthday)
        currentDate.value = new Date(savedDate.getFullYear(), savedDate.getMonth(), 1)
        selectedDate.value = savedDate
        console.log('📅 달력 열기 - DB 날짜로 이동:', savedDate)
      }
      showBirthdayPicker.value = true
    }
    
    const confirmDateSelection = () => {
      if (selectedDate.value) {
        petData.birthday = selectedDate.value.toISOString().substr(0, 10)
        
        // 생일 변경 시 나이 자동 계산
        if (petData.birthday) {
          const age = calculateAge(petData.birthday)
          petData.age = age
          console.log('📅 생일 변경으로 나이 자동 계산:', { birthday: petData.birthday, age })
        }
        
        showBirthdayPicker.value = false
        showYearPicker.value = false
        showMonthPicker.value = false
        selectedDate.value = null
        selectedMonth.value = null
      }
    }
    
    return {
      // 단계 관리
      currentStep,
      nextStep,
      previousStep,
      goToImageStep,
      
      // 폼 관련
      form,
      fileInput,
      isValid,
      submitting,
      
      // 데이터
      petData,
      previewImage,
      imageFile,
      imageRemoved,
      loading,
      speciesOptions,
      genderOptions,
      isEditMode,
      
      // UI 상태
      showBirthdayPicker,
      maxDate,
      minDate,
      formattedBirthday,
      // 달력 관련 변수들
      currentDate,
      selectedDate,
      showYearPicker,
      showMonthPicker,
      selectedMonth,
      yearRangeStart,
      yearRangeEnd,
      
      // 메서드들
      handleImageClick,
      handleImageChange,
      clearImage,
      handleSpeciesIdChange,
      onBirthdayChange,
      clearBirthday,
      getSpeciesIcon,
      getSpeciesIconColor,
      handleSubmit,
      // 달력 관련 함수들
      yearRange,
      previousYear,
      nextYear,
      previousMonth,
      nextMonth,
      calendarDates,
      selectDate,
      previousYearRange,
      nextYearRange,
      selectMonth,
      selectYear,
      backToMain,
      confirmYearSelection,
      confirmMonthSelection,
      cancelDateSelection,
      openBirthdayPicker,
      confirmDateSelection
    }
    } catch (error) {
      console.error('❌ PetForm setup 오류:', error)
      // 기본값 반환
      return {
        currentStep: ref(1),
        isEditMode: computed(() => false),
        petData: reactive({}),
        loading: computed(() => false),
        isValid: computed(() => false),
        submitting: ref(false)
      }
    }
  }
}
</script>

<style scoped>
/* no-inner-surface 클래스 - 내부 카드 느낌 제거 */
.no-inner-surface {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  border-radius: 0 !important;
}

.pet-form-container {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

/* 단계별 진행 표시 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 60px 40px;
  background: transparent;
  border-bottom: none;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #f43f5e;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.step.active .step-label {
  color: #f43f5e;
  font-weight: 600;
}

.step.completed .step-label {
  color: #10b981;
  font-weight: 600;
}

.step-line {
  width: 80px;
  height: 2px;
  background: #d1d5db;
  margin: 0 16px;
  transition: all 0.3s ease;
}

.step-line.completed {
  background: #10b981;
}



/* 단계별 콘텐츠 */
.step-content {
  padding: 48px 60px;
  min-height: 600px;
  overflow-y: visible !important;
  max-height: none;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.step-header p {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

/* 이미지 업로드 섹션 */
.image-upload-section {
  padding: 0;
  text-align: center;
  background: #ffffff;
}

.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin-bottom: 40px;
}

.upload-surface {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.pet-avatar {
  border: none;
  box-shadow: none;
  transition: all 0.2s ease;
}

.clickable-avatar {
  cursor: pointer;
}

.clickable-avatar:hover {
  transform: scale(1.02);
  opacity: 0.9;
}

.clickable-image {
  cursor: pointer;
}

.clickable-image:hover {
  opacity: 0.9;
}



.pet-avatar:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.upload-btn {
  border-color: #cbd5e1;
  color: #334155;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
}

.upload-btn:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.remove-btn {
  font-size: 12px;
  padding: 4px 8px;
  min-width: auto;
}

.remove-btn:hover {
  background-color: #fef2f2;
}

.image-hint {
  color: #64748b;
  font-size: 13px;
  font-weight: 400;
}

/* 입력 필드 섹션 */
.form-fields-section {
  padding: 0 0 24px;
}

/* 평면 레이어 입력 필드 */
.form-fields-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-input {
  border-radius: 8px;
}

.field-hint {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

/* 생일 입력 컨테이너 */
.birthday-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.clear-birthday-btn {
  position: absolute;
  right: 8px;
  z-index: 1;
}

/* 단계별 액션 버튼 */
.step-actions {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding-top: 40px;
  border-top: 1px solid #f1f5f9;
  margin-top: 40px;
}

/* 버튼 스타일 */
.cancel-btn {
  border-color: #cbd5e1;
  color: #334155;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
}

.cancel-btn:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.next-btn {
  background: #f43f5e !important;
  color: white !important;
  border: none !important;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
}

.next-btn:hover {
  background: #db2777 !important;
}

.next-btn:disabled {
  background: #f3e8ff !important;
  color: #a855f7 !important;
}

.image-edit-btn {
  border-color: #E87D7D;
  color: #E87D7D;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
}

  .image-edit-btn:hover {
    background-color: #E87D7D;
    color: white;
  }

  /* 사진과 동일한 달력 스타일 */
  .date-picker-dialog {
    background: transparent !important;
    box-shadow: none !important;
  }

  .date-picker-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    border: 1px solid #e0e0e0;
  }

  /* 첫 화면 스타일 */
  .date-picker-main {
    padding: 20px;
  }

  .date-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0;
  }

  .nav-btn {
    color: #666 !important;
    border-radius: 50% !important;
    transition: all 0.2s ease;
    background: transparent !important;
    min-width: 32px;
    height: 32px;
    padding: 0 !important;
    margin: 0 8px;
    border: none !important;
    box-shadow: none !important;
  }

  .nav-btn:hover {
    background: #ffe6e6 !important;
    color: #d32f2f !important;
    transform: none !important;
  }

  .current-year {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
  }

  .month-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .month-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    background: white;
  }

  .month-cell:hover {
    background: #ffe6e6 !important;
    border-color: #f44336;
    transform: scale(1.05);
    color: #d32f2f;
  }

  .month-cell.selected {
    background: #ffe6e6 !important;
    color: #d32f2f !important;
    box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
    transform: scale(1.05);
    border-color: #f44336;
  }

  /* 연도 선택 화면 */
  .year-picker {
    padding: 20px;
  }

  .year-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0;
  }

  .year-range {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
  }

  .year-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .year-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    background: white;
  }

  .year-cell:hover {
    background: #ffe6e6 !important;
    border-color: #f44336;
    transform: scale(1.05);
    color: #d32f2f;
  }

  .year-cell.selected {
    background: #ffe6e6 !important;
    color: #d32f2f !important;
    box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
    transform: scale(1.05);
    border-color: #f44336;
  }

  /* 월 선택 화면 */
  .month-picker {
    padding: 20px;
  }

  .month-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0;
  }

  /* 일반 달력 스타일 */
  .date-picker-main {
    padding: 20px;
  }

  .date-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0;
  }

  .current-month-year {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .current-month-year:hover {
    background: #ffe6e6 !important;
    color: #d32f2f;
    border-color: #f44336;
  }

  .weekdays-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #666;
    text-align: center;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .calendar-day {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    background: white;
  }

  .calendar-day:hover {
    background: #ffe6e6 !important;
    border-color: #f44336;
    color: #d32f2f;
  }

  .calendar-day.other-month {
    color: #ccc;
  }

  .calendar-day.selected {
    background: #ffe6e6 !important;
    color: #d32f2f !important;
    box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
    border-color: #f44336;
    font-weight: 600;
  }

  .calendar-day.today {
    background: #e3f2fd;
    border-color: #2196f3;
    color: #1976d2;
    font-weight: 600;
  }

  .calendar-day.disabled {
    color: #ccc !important;
    cursor: not-allowed !important;
    background: #f8f9fa !important;
    border-color: #e9ecef !important;
  }

  .calendar-day.disabled:hover {
    background: #f8f9fa !important;
    border-color: #e9ecef !important;
    transform: none !important;
  }

  /* 공통 액션 버튼 */
  .date-picker-actions {
    padding: 16px 20px;
    background: white !important;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .cancel-btn {
    border-color: #495057;
    color: #495057 !important;
    background: white !important;
    border-radius: 20px !important;
    font-weight: 600;
    padding: 10px 20px;
    min-width: 80px;
    border: 1px solid #495057;
  }

  .confirm-btn {
    color: white;
    background: #f44336 !important;
    border-radius: 20px !important;
    font-weight: 500;
    padding: 10px 20px;
    min-width: 80px;
    border: none;
  }

.submit-btn {
  background: #3b82f6 !important;
  color: white !important;
  border: none !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #2563eb !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:disabled {
  background: #9ca3af !important;
  transform: none;
  box-shadow: none;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pet-form-container {
    margin: 16px;
    border-radius: 12px;
  }
  
  .step-content {
    padding: 24px;
  }
  
  .form-fields-section {
    gap: 20px;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .image-upload-section {
    padding: 32px 24px 24px;
  }
  
  .image-actions {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .pet-form-container {
    margin: 8px;
    border-radius: 8px;
  }
  
  .step-content {
    padding: 20px;
  }
  
  .image-upload-section {
    padding: 24px 20px 20px;
  }
}

/* PetForm 내부 스크롤바 비활성화 */
.v-card .step-content::-webkit-scrollbar,
.step-content::-webkit-scrollbar,
.pet-form-container .step-content::-webkit-scrollbar,
.v-card::-webkit-scrollbar {
  display: none !important;
}

/* PetForm 내부 Firefox 스크롤바 비활성화 */
.v-card .step-content,
.step-content,
.pet-form-container .step-content,
.v-card {
  scrollbar-width: none !important;
}

/* 텍스트 영역 스크롤바 */
.v-textarea::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.v-textarea::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 6px;
  margin: 2px 0;
}

.v-textarea::-webkit-scrollbar-thumb {
  background: #E87D7D;
  border-radius: 6px;
  border: 1px solid #f8f9fa;
}

.v-textarea::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B;
}

.v-textarea::-webkit-scrollbar-corner {
  background: #f8f9fa;
}

/* 텍스트 영역 Firefox 스크롤바 */
.v-textarea {
  scrollbar-width: thin;
  scrollbar-color: #E87D7D #f8f9fa;
}
</style>

