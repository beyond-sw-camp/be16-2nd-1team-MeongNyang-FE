<template>
  <div class="pet-form-container">
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
        <h2>프로필 사진 선택하기</h2>
        <p>마음에 드는 반려동물 사진이 있나요? 지금 업로드하세요.</p>
      </div>
      
      <div class="image-upload-section">
        <div class="image-container">
          <v-avatar
            :size="200"
            class="pet-avatar"
            color="grey-lighten-4"
          >
            <!-- 이미지 제거 상태이거나 이미지가 없는 경우: 기본 아이콘 표시 -->
            <v-icon 
              v-if="imageRemoved || !previewImage" 
              :size="80" 
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
            />
          </v-avatar>
          
          <div class="image-actions">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-camera"
              @click="handleImageClick"
              class="upload-btn"
              rounded="lg"
              size="large"
            >
              {{ previewImage ? '이미지 변경' : '이미지 추가' }}
            </v-btn>
            
            <v-btn
              v-if="previewImage && !imageRemoved"
              variant="text"
              size="small"
              @click="clearImage"
              class="remove-btn"
              color="error"
            >
              제거
            </v-btn>
          </div>
          
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
        <h2>기본 정보 입력</h2>
        <p>반려동물의 기본 정보를 입력해주세요.</p>
      </div>
      
      <v-form ref="form" v-model="isValid">
        <div class="form-fields-section">
          <div class="form-grid">
            <!-- 반려동물 이름 -->
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

            <!-- 반려동물 종류 -->
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
              <label class="field-label">성별</label>
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
              />
            </div>

            <!-- 나이 -->
            <div class="form-field">
              <label class="field-label">나이</label>
              <v-text-field
                v-model="petData.age"
                type="number"
                placeholder="나이를 입력하세요"
                variant="outlined"
                rounded="lg"
                class="form-input"
                hide-details="auto"
                density="comfortable"
                min="0"
                max="30"
              />
            </div>

            <!-- 몸무게 -->
            <div class="form-field">
              <label class="form-field">
                <label class="field-label">몸무게 (kg)</label>
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
                />
              </label>
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
                  @click="showBirthdayPicker = true"
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
        <h2>소개글 작성</h2>
        <p>반려동물을 소개해주세요.</p>
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
          {{ isEdit ? '수정' : '등록' }}
        </v-btn>
      </div>
    </div>



          <!-- 반려동물 종류 -->
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
              @update:model-value="handleSpeciesIdChange"
            />
          </div>

          <!-- 성별 -->
          <div class="form-field">
            <label class="field-label">성별</label>
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
            />
          </div>

          <!-- 나이 -->
          <div class="form-field">
            <label class="field-label">나이</label>
            <v-text-field
              v-model="petData.age"
              type="number"
              :placeholder="petData.birthday ? '생일로 자동 계산됨' : '나이를 입력하세요'"
              variant="outlined"
              rounded="lg"
              class="form-input"
              hide-details="auto"
              density="comfortable"
              min="0"
              max="30"
              :readonly="!!petData.birthday"
              :disabled="!!petData.birthday"
            />
            <div class="field-hint" v-if="petData.birthday">
              <span>생일이 설정되어 나이가 자동 계산됩니다</span>
            </div>
          </div>

          <!-- 몸무게 -->
          <div class="form-field">
            <label class="field-label">몸무게 (kg)</label>
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
            />
          </div>

          <!-- 생일 -->
          <div class="form-field">
            <label class="field-label">생일 (선택사항)</label>
            <div class="birthday-input-container">
              <v-menu
                v-model="showBirthdayPicker"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedBirthday"
                    placeholder="생일을 선택하세요"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    rounded="lg"
                    class="form-input"
                    hide-details="auto"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar"
                  />
                </template>
                <div class="custom-date-picker">
                  <div class="date-picker-header">
                    <div class="month-year-display" @click="openYearPicker">
                      {{ currentMonthYear }}
                      <v-icon icon="mdi-chevron-down" size="small" class="dropdown-icon" />
                    </div>
                    <div class="navigation-buttons">
                      <v-btn
                        icon="mdi-chevron-left"
                        variant="text"
                        size="small"
                        @click="previousMonth"
                        class="nav-btn"
                      />
                      <v-btn
                        icon="mdi-chevron-right"
                        variant="text"
                        size="small"
                        @click="nextMonth"
                        class="nav-btn"
                      />
                    </div>
                  </div>
                  
                  <div class="weekdays-header">
                    <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                  </div>
                  
                  <div class="dates-grid">
                    <div
                      v-for="date in calendarDates"
                      :key="date.key"
                      class="date-cell"
                      :class="{
                        'other-month': date.otherMonth,
                        'selected': isSelectedDate(date.date),
                        'today': isTodayDate(date.date)
                      }"
                      @click="selectDate(date.date)"
                    >
                      {{ date.day }}
                    </div>
                  </div>
                  
                  <div class="date-picker-actions">
                    <v-btn
                      variant="text"
                      @click="clearBirthday"
                      class="cancel-btn"
                    >
                      취소
                    </v-btn>
                    <v-btn
                      variant="text"
                      @click="confirmBirthday"
                      class="confirm-btn"
                    >
                      확인
                    </v-btn>
                  </div>
                </div>
                
                <!-- 연도 선택 화면 -->
                <div v-if="showYearPicker" class="year-picker-overlay">
                  <div class="year-picker">
                    <div class="year-picker-header">
                      <div class="year-range-display">
                        {{ yearRange }}
                      </div>
                      <div class="year-navigation">
                        <v-btn
                          icon="mdi-chevron-left"
                          variant="text"
                          size="small"
                          @click="previousYearRange"
                          class="nav-btn"
                        />
                        <v-btn
                          icon="mdi-chevron-right"
                          variant="text"
                          size="small"
                          @click="nextYearRange"
                          class="nav-btn"
                        />
                      </div>
                    </div>
                    
                    <div class="years-grid">
                      <div
                        v-for="year in availableYears"
                        :key="year"
                        class="year-cell"
                        :class="{ 'selected': year === ensureCurrentDate().getFullYear() }"
                        @click="selectYear(year)"
                      >
                        {{ year }}
                      </div>
                    </div>
                    
                    <div class="year-picker-actions">
                      <v-btn
                        variant="text"
                        @click="closeYearPicker"
                        class="cancel-btn"
                      >
                        취소
                      </v-btn>
                      <v-btn
                        variant="text"
                        @click="closeYearPicker"
                        class="confirm-btn"
                      >
                        확인
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-menu>
              
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

        <!-- 소개글 -->
        <div class="form-field full-width">
          <label class="field-label">소개글 (선택사항)</label>
          <v-textarea
            v-model="petData.introduce"
            placeholder="반려동물을 소개해주세요"
            variant="outlined"
            rounded="lg"
            class="form-input"
            hide-details="auto"
            rows="3"
            max-rows="5"
            counter="500"
            maxlength="500"
            density="comfortable"
          />
          <div class="field-hint">
            <span>반려동물의 성격이나 특징을 자유롭게 작성해주세요 (최대 500자)</span>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="form-actions">
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
          type="submit"
          color="primary"
          :loading="submitting"
          :disabled="!isValid || submitting"
          class="submit-btn"
          rounded="lg"
          size="large"
        >
          {{ isEdit ? '수정' : '등록' }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { usePetStore } from '@/stores/pet'

export default {
  name: 'PetForm',
  components: {
    // SpeciesAutocomplete 대신 v-autocomplete 사용
  },
  
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
    const petStore = usePetStore()
    const form = ref(null)
    const fileInput = ref(null)
    
    // 반응형 데이터
    const previewImage = ref(null)
    const imageFile = ref(null)
    const imageRemoved = ref(false) // 🔥 이미지 제거 상태 추가
    const submitting = ref(false)
    
    // 펫 데이터 - 먼저 선언
    const petData = reactive({
      name: '',
      speciesId: null,
      speciesName: '',
      gender: '',
      age: null,
      weight: null,
      birthday: null,
      introduce: ''  // 백엔드 Pet.java에서 추가된 소개글 필드
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
    
    // 폼 유효성 검사 - petData 선언 후에 정의
    const isValid = computed(() => {
      console.log('폼 유효성 검사:', {
        name: petData.name,
        speciesId: petData.speciesId,
        gender: petData.gender,
        age: petData.age,
        weight: petData.weight,
        birthday: petData.birthday
      })
      
      // 기본 필수 필드 검사
      const hasRequiredFields = petData.name && 
                               petData.speciesId && 
                               petData.gender && 
                               petData.weight !== null
      
      // 나이 검사: 생일이 있으면 자동 계산되거나, 없으면 수동 입력 필요 (0살 허용)
      const ageValue = Number(petData.age)
      const hasValidAge = petData.age !== null && 
                         petData.age !== '' && 
                         !isNaN(ageValue) &&
                         ageValue >= 0 && 
                         ageValue <= 30
      
      return hasRequiredFields && hasValidAge
    })
    
    // 단계 관리
    const currentStep = ref(1)
    
    // 로딩 상태
    const loading = computed(() => petStore.isLoading)
    
    // 종류 옵션
    const speciesOptions = computed(() => {
      const species = petStore.getSpecies
      console.log('=== 종 데이터 구조 확인 ===')
      console.log('전체 종 데이터:', species)
      if (species && species.length > 0) {
        console.log('첫 번째 종:', species[0])
        console.log('ID 필드:', species[0]?.id, typeof species[0]?.id)
        console.log('species 필드:', species[0]?.species, typeof species[0]?.species)
        console.log('전체 키들:', Object.keys(species[0]))
      }
      console.log('=== 종 데이터 구조 확인 완료 ===')
      return species
    })
    
    // 달력 관련 상태
    const showBirthdayPicker = ref(false)
    const showYearPicker = ref(false)
    const currentDate = ref(new Date())
    const yearRangeStart = ref(new Date().getFullYear() - 6) // 현재 연도 기준으로 설정
    
    // currentDate가 항상 유효한지 확인
    onMounted(() => {
      if (!currentDate.value) {
        currentDate.value = new Date()
      }
    })
    
    // currentDate 안전성 보장 함수
    const ensureCurrentDate = () => {
      if (!currentDate.value) {
        currentDate.value = new Date()
      }
      return currentDate.value
    }
    
    // 날짜 제한 (최대: 오늘, 최소: 30년 전)
    const maxDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })
    
    const minDate = computed(() => {
      const today = new Date()
      const thirtyYearsAgo = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate())
      return thirtyYearsAgo.toISOString().split('T')[0]
    })
    
    // 커스텀 달력 관련 computed 속성들
    const currentMonthYear = computed(() => {
      try {
        const date = ensureCurrentDate()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}년 ${month}월`
      } catch (error) {
        console.error('현재 년월 표시 오류:', error)
        return '날짜 오류'
      }
    })
    
    const yearRange = computed(() => {
      try {
        return `${yearRangeStart.value} - ${yearRangeStart.value + 11}`
      } catch (error) {
        console.error('연도 범위 계산 오류:', error)
        return '2020 - 2031'
      }
    })
    
    const availableYears = computed(() => {
      try {
        const years = []
        for (let i = 0; i < 12; i++) {
          years.push(yearRangeStart.value + i)
        }
        return years
      } catch (error) {
        console.error('사용 가능한 연도 계산 오류:', error)
        return [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031]
      }
    })
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    
    const calendarDates = computed(() => {
      try {
        const date = ensureCurrentDate()
        
        const year = date.getFullYear()
        const month = date.getMonth()
        
        const firstDay = new Date(year, month, 1)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())
        
        const dates = []
        
        for (let i = 0; i < 42; i++) {
          const dateObj = new Date(startDate)
          dateObj.setDate(startDate.getDate() + i)
          
          dates.push({
            date: dateObj.toISOString().split('T')[0],
            day: dateObj.getDate(),
            otherMonth: dateObj.getMonth() !== month,
            key: `date-${i}`
          })
        }
        
        return dates
      } catch (error) {
        console.error('달력 날짜 생성 오류:', error)
        return []
      }
    })
    
    // 포맷된 생일 표시 (사용자 친화적)
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
    
    // 나이 계산 함수 - 먼저 선언
    const calculateAge = (birthday) => {
      if (!birthday) return null
      const today = new Date()
      const birthDate = new Date(birthday)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }
    

    
    // 성별 옵션 (백엔드 Enum과 정확히 일치)
    const genderOptions = [
      { value: 'MALE', title: '수컷' },
      { value: 'FEMALE', title: '암컷' },
      { value: 'NEUTRALITY', title: '중성' }
    ]
    
    // 수정 모드일 때 기존 데이터 로드
    watch(() => props.pet, (newPet) => {
      console.log('🔄 watch props.pet 트리거됨')
      console.log('새 펫 데이터:', newPet)
      console.log('props.isEdit:', props.isEdit)
      
      if (newPet) {
        console.log('🔍 수정 모드 - 기존 펫 데이터:', newPet)
        
        petData.name = newPet.name || ''
        
        // 🔥 종 정보: species 이름으로 speciesId 찾기
        if (newPet.species) {
          const foundSpecies = petStore.getSpecies.find(s => s.species === newPet.species)
          if (foundSpecies) {
            petData.speciesId = foundSpecies.speciesId
            console.log('✅ 종 정보 매칭됨:', newPet.species, '→', foundSpecies.speciesId)
          } else {
            console.log('⚠️ 종 정보 매칭 실패:', newPet.species)
            petData.speciesId = null
          }
        } else if (newPet.speciesId) {
          // fallback: speciesId가 직접 있는 경우
          petData.speciesId = parseInt(newPet.speciesId)
        } else {
          petData.speciesId = null
        }
        
        petData.gender = newPet.gender || ''
        petData.age = newPet.age !== undefined && newPet.age !== null ? parseInt(newPet.age) : null
        petData.weight = newPet.weight !== undefined && newPet.weight !== null ? parseFloat(newPet.weight) : null
        petData.birthday = newPet.birthday || null
        petData.introduce = newPet.introduce || ''
        
        // 기존 이미지 상태 초기화
        console.log('🖼️ 이미지 상태 초기화 시작')
        console.log('기존 펫 이미지 URL:', newPet.url)
        console.log('수정 모드 여부:', props.isEdit)
        console.log('현재 previewImage:', previewImage.value)
        console.log('현재 imageFile:', imageFile.value)
        console.log('현재 imageRemoved:', imageRemoved.value)
        
        // 수정 모드일 때만 기존 이미지 보존
        if (props.isEdit) {
          // 🚨 수정 모드: 기존 이미지 절대 삭제하지 않음!
          imageFile.value = null  // 새 파일은 없음
          imageRemoved.value = false  // 🔥 제거 상태를 false로 강제 설정
          
          // 기존 이미지가 있으면 미리보기 설정
          if (newPet.url && newPet.url.trim() !== '') {
            previewImage.value = newPet.url
            console.log('✅ 수정 모드 - 기존 이미지 미리보기 유지:', newPet.url)
            console.log('🔥 imageRemoved 강제 false 설정:', imageRemoved.value)
          } else {
            previewImage.value = null
            console.log('✅ 수정 모드 - 기존 이미지 없음')
          }
        } else {
          // 새 등록 모드: 모든 상태 초기화
          imageFile.value = null
          imageRemoved.value = false
          previewImage.value = null
          console.log('✅ 새 등록 모드 - 모든 이미지 상태 초기화')
        }
        
        // 강제로 상태 동기화
        nextTick(() => {
          console.log('🔄 nextTick - 이미지 상태 최종 확인:', {
            previewImage: previewImage.value,
            imageFile: imageFile.value,
            imageRemoved: imageRemoved.value,
            isEdit: props.isEdit
          })
        })
      } else {
        console.log('🔄 펫 데이터가 null - 새 등록 모드로 추정')
        // 펫 데이터가 없으면 새 등록 모드
        imageFile.value = null
        imageRemoved.value = false
        previewImage.value = null
        console.log('✅ 새 등록 모드 (null) - 모든 이미지 상태 초기화')
      }
    }, { immediate: true })

    // isEdit 상태 변화 감지
    watch(() => props.isEdit, (newIsEdit, oldIsEdit) => {
      console.log('🔄 watch props.isEdit 트리거됨')
      console.log('이전 isEdit:', oldIsEdit, '→ 새 isEdit:', newIsEdit)
      console.log('현재 pet:', props.pet)
      console.log('현재 previewImage:', previewImage.value)
    }, { immediate: true })

    // 생일 변경 시 나이 자동 계산
    watch(() => petData.birthday, (newBirthday) => {
      if (newBirthday) {
        const calculatedAge = calculateAge(newBirthday)
        if (calculatedAge !== null && calculatedAge >= 0 && calculatedAge <= 30) {
          // 🔥 생일이 설정되면 항상 나이를 자동 계산 (덮어쓰기)
          petData.age = calculatedAge
          console.log('✅ 생일 기반으로 나이 자동 계산:', calculatedAge)
        }
      } else {
        // 🔥 생일이 삭제되면 나이도 초기화 (수동 입력 가능하게)
        if (petData.age !== null) {
          console.log('🔄 생일이 삭제되어 나이를 초기화합니다')
          petData.age = null
        }
      }
    })



    // 이미지 클릭 처리 (안전한 DOM 접근)
    const handleImageClick = () => {
      if (fileInput.value) {
        fileInput.value.click()
      } else {
        console.error('파일 입력 요소가 아직 준비되지 않았습니다.')
      }
    }

    // 종류 ID 변경 처리 (v-model용)
    const handleSpeciesIdChange = (speciesId) => {
      console.log('=== handleSpeciesIdChange 호출 ===')
      console.log('받은 speciesId:', speciesId, typeof speciesId)
      
      // 🔥 강제 숫자 변환! 문자열이 들어와도 숫자로 변환
      const numericSpeciesId = parseInt(speciesId) || null
      console.log('숫자 변환 후:', numericSpeciesId, typeof numericSpeciesId)
      
      petData.speciesId = numericSpeciesId
      
      // 종류명도 자동으로 설정
      if (numericSpeciesId) {
        // speciesId로 종 찾기 (백엔드 데이터 구조가 id가 아니라 speciesId)
        const selectedSpecies = petStore.getSpecies.find(s => s.speciesId === numericSpeciesId)
        console.log('선택된 종 객체:', selectedSpecies)
        if (selectedSpecies) {
          petData.speciesName = selectedSpecies.species
          console.log('설정된 종류명:', petData.speciesName)
        }
      } else {
        petData.speciesName = ''
      }
      
      console.log('최종 petData.speciesId:', petData.speciesId, typeof petData.speciesId)
      console.log('최종 petData.speciesName:', petData.speciesName)
      console.log('=== handleSpeciesIdChange 완료 ===')
    }

    // handleSpeciesChange 제거 - v-autocomplete가 직접 처리

    // 이미지 변경 처리
    const handleImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        // 파일 크기 검증 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('이미지 크기는 5MB 이하여야 합니다.')
          return
        }
        
        imageFile.value = file
        
        // 미리보기 생성
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    // 이미지 제거 - 사용자가 명시적으로 삭제 버튼을 클릭했을 때만 호출
    const clearImage = () => {
      console.log('🗑️ 사용자 의도적 이미지 제거 버튼 클릭됨')
      console.log('제거 전 상태:', {
        imageFile: imageFile.value,
        previewImage: previewImage.value,
        imageRemoved: imageRemoved.value
      })
      
      // 사용자가 명시적으로 이미지 삭제를 요청한 상태로 설정
      imageFile.value = null
      previewImage.value = null
      imageRemoved.value = true  // 🔥 사용자 의도적 삭제 표시
      
      console.log('🗑️ 사용자 의도적 이미지 제거 완료:', {
        imageFile: imageFile.value,
        previewImage: previewImage.value,
        imageRemoved: imageRemoved.value
      })
      
      // 강제로 UI 업데이트 - 여러 방법 시도
      nextTick(() => {
        console.log('🔄 nextTick 완료')
        // 추가 강제 업데이트
        imageRemoved.value = true
      })
      
      // 추가 강제 업데이트
      setTimeout(() => {
        imageRemoved.value = true
        console.log('⏰ setTimeout 강제 업데이트 완료')
      }, 100)
    }
    
    // 메시지 표시
    const showMessage = (message, type = 'success') => {
      // 간단한 alert로 표시 (나중에 스낵바로 변경 가능)
      if (type === 'error') {
        alert(`❌ ${message}`)
      } else {
        alert(`✅ ${message}`)
      }
    }

    // 폼 제출 처리
    const handleSubmit = async () => {
      // 폼이 마운트되지 않았을 경우 처리
      if (!form.value) {
        console.error('폼이 아직 마운트되지 않았습니다.')
        return
      }
      
      // 폼 유효성 검사
      const validationResult = form.value.validate()
      if (!validationResult) return
      
      try {
        submitting.value = true
        
        // 폼 데이터 준비 (백엔드 Pet.java와 일치하도록)
        const submitData = {
          name: petData.name,
          speciesId: parseInt(petData.speciesId) || null,  // 🔥 강제 숫자 변환!
          gender: petData.gender,
          age: petData.age !== null && petData.age !== '' ? parseInt(petData.age) : null,  // 🔥 0살 허용!
          weight: parseFloat(petData.weight) || null,       // 🔥 몸무게도 숫자 변환!
          birthday: petData.birthday,
          introduce: petData.introduce || ''
        }
        
        console.log('=== 전송할 데이터 최종 확인 ===')
        console.log('submitData:', submitData)
        console.log('submitData.speciesId:', submitData.speciesId, typeof submitData.speciesId)
        console.log('submitData의 모든 필드 타입:')
        Object.keys(submitData).forEach(key => {
          console.log(`  ${key}:`, submitData[key], typeof submitData[key])
        })
        console.log('=== 전송할 데이터 확인 완료 ===')
        
        let result
        if (props.isEdit) {
          // 수정 모드
          console.log('🔄 펫 수정 모드')
          console.log('이미지 제거 상태:', imageRemoved.value)
          console.log('새 이미지 파일:', imageFile.value)
          
          // 이미지 처리 로직:
          // 1. imageRemoved가 true이고 imageFile이 null이면 → 이미지 제거
          // 2. imageFile이 있으면 → 새 이미지로 교체
          // 3. 둘 다 없으면 → 기존 이미지 유지 (백엔드에 이미지 필드를 보내지 않음)
          let imageToSend = null
          
          console.log('🔍 이미지 처리 상태 분석:')
          console.log('  - imageRemoved.value:', imageRemoved.value)
          console.log('  - imageFile.value:', imageFile.value)
          console.log('  - previewImage.value:', previewImage.value)
          
          // 🚨 이미지 처리 로직 강화 - 의도하지 않은 삭제 방지
          if (imageRemoved.value === true && !imageFile.value) {
            // 사용자가 명시적으로 이미지 제거 버튼을 클릭한 경우만
            imageToSend = 'REMOVE_IMAGE'
            console.log('🗑️ 사용자 의도적 이미지 제거 요청 - 삭제 버튼 클릭됨')
          } else if (imageFile.value && imageFile.value instanceof File) {
            // 사용자가 새 이미지를 선택한 경우
            imageToSend = imageFile.value
            console.log('📷 새 이미지 업로드:', imageFile.value.name)
          } else {
            // 🔥 기존 이미지 유지 (아무 변경 없음) - 가장 안전한 옵션
            imageToSend = null
            console.log('🛡️ 기존 이미지 보존 - 백엔드에 이미지 필드 전송하지 않음')
            console.log('   → imageRemoved:', imageRemoved.value)
            console.log('   → imageFile:', imageFile.value)
          }
          
          result = await petStore.updatePet(props.pet.id, submitData, imageToSend)
        } else {
          // 등록 모드
          result = await petStore.registerPet(submitData, imageFile.value)
        }
        
        if (result.success) {
          showMessage(result.message || '반려동물이 성공적으로 처리되었습니다.', 'success')
          emit('success', result.message || '반려동물이 성공적으로 처리되었습니다.')
        } else {
          showMessage(result.message || '처리에 실패했습니다.', 'error')
        }
      } catch (error) {
        console.error('펫 처리 실패:', error)
        showMessage('처리 중 오류가 발생했습니다.', 'error')
      } finally {
        submitting.value = false
      }
    }
    
    // 컴포넌트 마운트 시 종류 목록 로드
    onMounted(async () => {
      console.log('🔄 PetForm 마운트됨')
      console.log('마운트 시 props.pet:', props.pet)
      console.log('마운트 시 props.isEdit:', props.isEdit)
      console.log('마운트 시 previewImage:', previewImage.value)
      
      if (petStore.getSpecies.length === 0) {
        console.log('fetchSpecies', await petStore.fetchSpecies())
      }
    })

    // 나이 힌트 메시지 계산
    const getAgeHint = () => {
      if (petData.birthday) {
        const age = calculateAge(petData.birthday)
        if (age !== null && age >= 0 && age <= 30) {
          return `생일 기반 계산: ${age}살 (수동 입력도 가능)`
        }
      }
      return '나이를 직접 입력하거나 생일을 입력하여 자동 계산할 수 있습니다'
    }

    // 생일 힌트 메시지 계산
    const getBirthdayHint = () => {
      if (petData.birthday) {
        const age = calculateAge(petData.birthday)
        if (age !== null && age >= 0 && age <= 30) {
          return `자동 계산된 나이: ${age}살 (나이 입력 필드에서 확인)`
        }
      }
      return '생일을 입력하면 나이가 자동으로 계산됩니다 (선택사항)'
    }

    // 생일 기반으로 나이 계산 버튼 클릭 시 호출되는 함수
    const calculateAgeFromBirthday = () => {
      const calculatedAge = calculateAge(petData.birthday)
      if (calculatedAge !== null && calculatedAge >= 0 && calculatedAge <= 30) {
        petData.age = calculatedAge
        console.log('생일 기반으로 나이 자동 계산:', calculatedAge)
      } else {
        console.warn('생일 기반으로 나이 계산 실패 또는 범위 초과:', calculatedAge)
        alert('생일 기반으로 나이를 계산할 수 없거나, 범위를 벗어났습니다.')
      }
    }
    
    // 커스텀 달력 관련 메서드들
    const previousMonth = () => {
      try {
        if (!currentDate.value) return
        const newDate = new Date(currentDate.value)
        newDate.setMonth(newDate.getMonth() - 1)
        currentDate.value = newDate
      } catch (error) {
        console.error('이전 달 이동 오류:', error)
      }
    }
    
    const nextMonth = () => {
      try {
        if (!currentDate.value) return
        const newDate = new Date(currentDate.value)
        newDate.setMonth(newDate.getMonth() + 1)
        currentDate.value = newDate
      } catch (error) {
        console.error('다음 달 이동 오류:', error)
      }
    }
    
    const isTodayDate = (date) => {
      try {
        const today = new Date()
        const dateObj = new Date(date)
        return dateObj.toDateString() === today.toDateString()
      } catch (error) {
        return false
      }
    }
    
    const isSelectedDate = (date) => {
      try {
        if (!petData.birthday) return false
        
        // 날짜 문자열 비교
        const selectedDate = new Date(petData.birthday)
        const currentDate = new Date(date)
        
        // 날짜만 비교 (시간 제외)
        return selectedDate.getDate() === currentDate.getDate() && 
               selectedDate.getMonth() === currentDate.getMonth() && 
               selectedDate.getFullYear() === currentDate.getFullYear()
      } catch (error) {
        return false
      }
    }
    
    const selectDate = (date) => {
      try {
        if (!currentDate.value) return
        
        const dateObj = new Date(date)
        const currentMonth = currentDate.value.getMonth()
        
        // 다른 달의 날짜는 선택 불가
        if (dateObj.getMonth() !== currentMonth) return
        
        // 최대 날짜 제한 (오늘까지만)
        const today = new Date()
        if (dateObj > today) return
        
        // 시간대 문제 해결: 로컬 날짜로 정확하게 변환
        const localDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
        const localDateString = localDate.toISOString().split('T')[0]
        
        petData.birthday = localDateString
        console.log('선택된 날짜:', date, '→ 저장된 날짜:', localDateString)
        
        showBirthdayPicker.value = false
      } catch (error) {
        console.error('날짜 선택 오류:', error)
      }
    }
    
    // 생일 변경 이벤트 핸들러
    const onBirthdayChange = (newDate) => {
      console.log('🎂 생일 변경:', newDate)
      petData.birthday = newDate
      showBirthdayPicker.value = false  // 달력 닫기
    }
    
    // 생일 초기화
    const clearBirthday = () => {
      petData.birthday = null
      console.log('🗑️ 생일 초기화됨 - 수동 나이 입력 가능')
    }
    
    // 생일 확인
    const confirmBirthday = () => {
      showBirthdayPicker.value = false
    }
    
    // 연도 선택 관련 메서드들
    const previousYearRange = () => {
      try {
        yearRangeStart.value = Math.max(1900, yearRangeStart.value - 12)
      } catch (error) {
        console.error('이전 연도 범위 이동 오류:', error)
      }
    }
    
    const nextYearRange = () => {
      try {
        yearRangeStart.value = Math.min(2100, yearRangeStart.value + 12)
      } catch (error) {
        console.error('다음 연도 범위 이동 오류:', error)
      }
    }
    
    const selectYear = (year) => {
      try {
        if (!currentDate.value) {
          currentDate.value = new Date()
        }
        
        const newDate = new Date(currentDate.value)
        newDate.setFullYear(year)
        currentDate.value = newDate
        showYearPicker.value = false
        console.log('✅ 연도 선택 성공:', year)
      } catch (error) {
        console.error('❌ 연도 선택 오류:', error)
        showYearPicker.value = false
      }
    }
    
    const openYearPicker = () => {
      try {
        if (!currentDate.value) return
        const currentYear = currentDate.value.getFullYear()
        yearRangeStart.value = Math.floor(currentYear / 12) * 12
        showYearPicker.value = true
      } catch (error) {
        console.error('연도 선택기 열기 오류:', error)
        showYearPicker.value = false
      }
    }
    
    const closeYearPicker = () => {
      try {
        showYearPicker.value = false
      } catch (error) {
        console.error('연도 선택기 닫기 오류:', error)
      }
    }

    // 유틸리티 함수들
    const getSpeciesIcon = () => {
      if (petData.speciesId) {
        // speciesId로 종 찾기 (백엔드 데이터 구조가 id가 아니라 speciesId)
        const species = petStore.getSpecies.find(s => s.speciesId === petData.speciesId)
        if (species && species.petOrder === 'DOG') return 'mdi-dog'
        if (species && species.petOrder === 'CAT') return 'mdi-cat'
        return 'mdi-paw'
      }
      return 'mdi-paw'
    }

    const getSpeciesIconColor = () => {
      if (petData.speciesId) {
        // speciesId로 종 찾기 (백엔드 데이터 구조가 id가 아니라 speciesId)
        const species = petStore.getSpecies.find(s => s.speciesId === petData.speciesId)
        if (species && species.petOrder === 'DOG') return 'primary'
        if (species && species.petOrder === 'CAT') return 'secondary'
        return 'info'
      }
      return 'info'
    }

    // 종류 ID에 따른 종류 이름 반환 - 이미 위에서 선언됨
    
    return {
      form,
      fileInput,
      isValid,
      petData,
      loading,
      speciesOptions,
      previewImage,
      imageFile,
      submitting,
      genderOptions,
      calculateAge,
      handleImageClick,
      handleSpeciesIdChange,
      handleImageChange,
      clearImage,
      handleSubmit,
      getAgeHint,
      getBirthdayHint,
      calculateAgeFromBirthday,
      onBirthdayChange,
      clearBirthday,
      showBirthdayPicker,
      maxDate,
      minDate,
      formattedBirthday,
      getSpeciesIconColor,
      getSpeciesIcon,
      // 커스텀 달력 관련
      currentDate,
      currentMonthYear,
      weekdays,
      calendarDates,
      previousMonth,
      nextMonth,
      isTodayDate,
      isSelectedDate,
      selectDate,
      confirmBirthday,
      // 연도 선택 관련
      showYearPicker,
      yearRange,
      availableYears,
      previousYearRange,
      nextYearRange,
      selectYear,
      openYearPicker,
      closeYearPicker,
      // 안전성 보장 함수
      ensureCurrentDate,
      // 단계 관리
      currentStep,
      nextStep,
      previousStep
    }
  }
}
</script>

<style scoped>
.pet-form-container {
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* 단계별 진행 표시 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 32px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d1d5db;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #ec4899;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.step.active .step-label {
  color: #ec4899;
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
  padding: 32px;
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

/* 단계별 액션 버튼 */
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.next-btn {
  background: #ec4899 !important;
  color: white !important;
  border: none !important;
}

.next-btn:hover {
  background: #db2777 !important;
}

.next-btn:disabled {
  background: #f3e8ff !important;
  color: #a855f7 !important;
}

/* 이미지 업로드 섹션 */
.image-upload-section {
  padding: 40px 32px 32px;
  text-align: center;
  background: #ffffff;
}

.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pet-avatar {
  border: 3px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
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
  border-color: #d1d5db;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.remove-btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: #fef2f2;
}

.image-hint {
  color: #9ca3af;
  font-size: 14px;
  font-weight: 400;
}

/* 폼 필드 섹션 */
.form-fields-section {
  padding: 0 32px 32px;
  background: #ffffff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-field {
  width: 100%;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.4;
}

.form-input {
  width: 100%;
}

.form-input :deep(.v-field) {
  border-radius: 12px;
  background-color: #ffffff;
}

.form-input :deep(.v-field__outline) {
  border-radius: 12px;
  border-color: #d1d5db;
}

.form-input :deep(.v-field--focused .v-field__outline) {
  border-color: #3b82f6;
  border-width: 2px;
}

.form-input :deep(.v-field__input) {
  color: #111827;
  font-size: 16px;
}

.form-input :deep(.v-field__input::placeholder) {
  color: #9ca3af;
}

.field-hint {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

/* 생일 입력 컨테이너 */
.birthday-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.birthday-input-container .form-input {
  flex: 1;
}

.clear-birthday-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

/* 커스텀 달력 스타일 */
.custom-date-picker {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 24px;
  min-width: 320px;
  border: 1px solid #e5e7eb;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.month-year-display {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.navigation-buttons {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background-color: #f3f4f6;
  color: #ec4899;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.weekday {
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  padding: 8px 0;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 20px;
}

.date-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #111827;
}

.date-cell:hover:not(.other-month) {
  background-color: #fdf2f8;
  color: #ec4899;
}

.date-cell.other-month {
  color: #d1d5db;
  cursor: not-allowed;
}

.date-cell.selected {
  background-color: #ec4899;
  color: white;
  font-weight: 600;
}

.date-cell.today {
  border: 2px solid #ec4899;
  color: #ec4899;
  font-weight: 600;
}

.date-cell.today.selected {
  background-color: #ec4899;
  color: white;
  border-color: #ec4899;
}

.date-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.cancel-btn {
  color: #000000;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 20px;
  padding: 12px 24px;
  background-color: white;
  border: 2px solid #e5e7eb;
  min-width: 80px;
  height: 44px;
}

.cancel-btn:hover {
  color: #000000;
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.confirm-btn {
  color: white;
  font-weight: 600;
  transition: all 0.2s ease;
  border-radius: 20px;
  padding: 12px 24px;
  background-color: #ff6b9d;
  border: 2px solid #ff6b9d;
  min-width: 80px;
  height: 44px;
}

.confirm-btn:hover {
  color: white;
  background-color: #ff5a8a;
  border-color: #ff5a8a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

/* 연도 선택 화면 스타일 */
.year-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.year-picker {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 24px;
  min-width: 320px;
  border: 1px solid #e5e7eb;
}

.year-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.year-range-display {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  background-color: #f3f4f6;
  padding: 8px 16px;
  border-radius: 20px;
}

.year-navigation {
  display: flex;
  gap: 8px;
}

.years-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.year-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000000;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}

.year-cell:hover {
  background-color: #fdf2f8;
  color: #000000;
  border-color: #ec4899;
}

.year-cell.selected {
  background-color: #ec4899;
  color: white;
  border-color: #ec4899;
  font-weight: 600;
}

.year-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

/* 년월 표시 드롭다운 아이콘 */
.month-year-display {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.month-year-display:hover {
  background-color: #fdf2f8;
  color: #ec4899;
}

.dropdown-icon {
  color: #9ca3af;
  transition: all 0.2s ease;
}

.month-year-display:hover .dropdown-icon {
  color: #ec4899;
}

/* 생일 선택기 */
.birthday-picker {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* 액션 버튼 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 32px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  min-width: 120px;
  height: 48px;
  border-color: #d1d5db;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.submit-btn {
  min-width: 120px;
  height: 48px;
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:disabled {
  background-color: #9ca3af;
  transform: none;
  box-shadow: none;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pet-form-container {
    margin: 16px;
    border-radius: 12px;
  }
  
  .image-upload-section {
    padding: 32px 24px 24px;
  }
  
  .image-actions {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .form-fields-section {
    padding: 0 24px 24px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
    padding: 20px 24px;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .pet-form-container {
    margin: 8px;
    border-radius: 8px;
  }
  
  .image-upload-section {
    padding: 24px 20px 20px;
  }
  
  .form-fields-section {
    padding: 0 20px 20px;
  }
  
  .form-actions {
    padding: 16px 20px;
  }
}

/* 닫기 버튼 스타일 */
.close-btn {
  color: #6b7280;
  transition: all 0.2s ease;
  padding: 8px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 50%;
}

.close-btn:hover {
  color: #374151;
  background: rgba(107, 114, 128, 0.1) !important;
}

.close-btn::before {
  background: transparent !important;
}

.close-btn::after {
  background: transparent !important;
}

.close-btn .v-btn__content {
  background: transparent !important;
}

.close-btn .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}

.close-btn:hover .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}

.close-btn:focus .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}

.close-btn:active .v-btn__overlay {
  background: transparent !important;
  opacity: 0 !important;
}
</style>

