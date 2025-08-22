<template>
  <div class="pet-form-container">
    <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
      <!-- 반려동물 이미지 업로드 -->
      <div class="image-upload-section">
        <div class="image-container">
          <v-avatar
            :size="140"
            class="pet-avatar"
            color="grey-lighten-3"
            :key="`avatar-${imageRemoved}-${previewImage ? 'preview' : 'no-preview'}-${isEdit ? 'edit' : 'new'}`"
          >
            <!-- 이미지 제거 상태이거나 이미지가 없는 경우: 기본 아이콘 표시 -->
            <v-icon 
              v-if="imageRemoved || !previewImage" 
              :size="64" 
              :color="getSpeciesIconColor()" 
              :icon="getSpeciesIcon()" 
            />
            <!-- 이미지가 있는 경우: 이미지 표시 -->
            <v-img 
              v-else
              :src="previewImage" 
              cover 
            />
          </v-avatar>
          
          <div class="image-actions">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-camera"
              @click="handleImageClick"
              class="mm-btn"
              rounded="xl"
            >
              {{ previewImage ? '이미지 변경' : '이미지 추가' }}
            </v-btn>
            
            <v-btn
              v-if="previewImage"
              color="error"
              variant="outlined"
              size="small"
              @click="clearImage"
              class="mm-btn image-remove-btn"
              rounded="lg"
              prepend-icon="mdi-delete"
            >
              이미지 제거
            </v-btn>
          </div>
          
          <div class="image-hint">
            <v-icon size="16" color="info">mdi-information</v-icon>
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

      <!-- 입력 필드 섹션 -->
      <div class="form-fields-section">
        <div class="mm-grid mm-grid-cols-2">
          <!-- 반려동물 이름 -->
          <div class="form-field">
            <label class="field-label">
              <v-icon size="20" color="primary">mdi-account</v-icon>
              <span>반려동물 이름 *</span>
            </label>
            <v-text-field
              v-model="petData.name"
              placeholder="반려동물 이름을 입력하세요"
              :rules="[v => !!v || '반려동물 이름은 필수입니다']"
              required
              variant="outlined"
              rounded="xl"
              class="mm-input"
              hide-details="auto"
            />
          </div>

          <!-- 반려동물 종류 -->
          <div class="form-field">
            <label class="field-label">
              <v-icon size="20" color="secondary">mdi-magnify</v-icon>
              <span>반려동물 종류 *</span>
            </label>
            <v-autocomplete
              v-model="petData.speciesId"
              :items="speciesOptions"
              item-title="species"
              item-value="speciesId"
              placeholder="종류를 검색하세요 (예: 토이푸들, 먼치킨)"
              :rules="[v => !!v || '반려동물 종류는 필수입니다']"
              required
              variant="outlined"
              rounded="xl"
              class="mm-input"
              hide-details="auto"
              prepend-inner-icon="mdi-paw"
              @update:model-value="handleSpeciesIdChange"
            />
          </div>

          <!-- 성별 -->
          <div class="form-field">
            <label class="field-label">
              <v-icon size="20" color="pink">mdi-gender-male-female</v-icon>
              <span>성별</span>
            </label>
            <v-select
              v-model="petData.gender"
              :items="genderOptions"
              item-title="title"
              item-value="value"
              placeholder="성별을 선택하세요"
              variant="outlined"
              rounded="xl"
              class="mm-input"
              hide-details="auto"
            />
          </div>

          <!-- 나이 -->
          <div class="form-field">
            <label class="field-label">
              <v-icon size="20" color="orange">mdi-cake-variant</v-icon>
              <span>나이</span>
            </label>
            <v-text-field
              v-model="petData.age"
              type="number"
              :placeholder="petData.birthday ? '생일로 자동 계산됨' : '나이를 입력하세요 (0살부터 가능)'"
              variant="outlined"
              rounded="xl"
              class="mm-input"
              hide-details="auto"
              min="0"
              max="30"
              :readonly="!!petData.birthday"
              :disabled="!!petData.birthday"
            />
            <div class="field-hint">
              <v-icon size="16" color="info">mdi-information</v-icon>
              <span v-if="petData.birthday">생일이 설정되어 나이가 자동 계산됩니다. 나이를 변경하려면 생일을 수정하세요.</span>
              <span v-else>나이를 직접 입력하거나 생일을 입력하여 자동 계산할 수 있습니다 (0살부터 등록 가능)</span>
            </div>
          </div>

          <!-- 몸무게 -->
          <div class="form-field">
            <label class="field-label">
              <v-icon size="20" color="teal">mdi-weight-kilogram</v-icon>
              <span>몸무게 (kg)</span>
            </label>
            <v-text-field
              v-model="petData.weight"
              type="number"
              placeholder="몸무게를 입력하세요"
              variant="outlined"
              rounded="xl"
              class="mm-input"
              hide-details="auto"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <!-- 생일 -->
          <div class="form-field">
            <label class="field-label">
              <v-icon size="20" color="indigo">mdi-cake</v-icon>
              <span>생일 (선택사항)</span>
            </label>
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
                    rounded="xl"
                    class="mm-input"
                    hide-details="auto"
                    prepend-inner-icon="mdi-calendar"
                  />
                </template>
                <v-date-picker
                  v-model="petData.birthday"
                  @update:model-value="onBirthdayChange"
                  :max="maxDate"
                  color="primary"
                  class="birthday-picker"
                />
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
              <v-icon size="16" color="info">mdi-information</v-icon>
              <span>생일을 입력하면 나이가 자동으로 계산됩니다 (선택사항)</span>
            </div>
          </div>

          <!-- 소개글 -->
          <div class="form-field">
            <label class="field-label">
              <v-icon size="20" color="purple">mdi-text</v-icon>
              <span>소개글 (선택사항)</span>
            </label>
            <v-textarea
              v-model="petData.introduce"
              placeholder="반려동물을 소개해주세요"
              variant="outlined"
              rounded="xl"
              class="mm-input"
              hide-details="auto"
              rows="3"
              max-rows="5"
              counter="500"
              maxlength="500"
            />
            <div class="field-hint">
              <v-icon size="16" color="info">mdi-information</v-icon>
              <span>반려동물의 성격이나 특징을 자유롭게 작성해주세요 (최대 500자)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="form-actions">
        <v-btn
          variant="outlined"
          color="secondary"
          @click="$emit('close')"
          class="mm-btn"
          size="large"
          rounded="xl"
        >
          취소
        </v-btn>
        <v-btn
          type="submit"
          color="primary"
          :loading="submitting"
          :disabled="!isValid || submitting"
          class="mm-btn mm-btn-primary"
          size="large"
          rounded="xl"
        >
          {{ isEdit ? '수정' : '등록' }}
        </v-btn>
      </div>
    </v-form>
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
        
        // 기존 이미지가 있으면 미리보기 설정
        if (newPet.url) {
          previewImage.value = newPet.url
          imageRemoved.value = false // 🔥 이미지 제거 상태 초기화
        } else {
          imageRemoved.value = false // 🔥 이미지가 없어도 상태 초기화
        }
        
        // 강제로 상태 동기화
        nextTick(() => {
          imageRemoved.value = false
        })
      }
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
    
    // 이미지 제거
    const clearImage = () => {
      console.log('🗑️ 이미지 제거 함수 호출됨')
      
      // 모든 이미지 관련 상태 완전 초기화
      imageFile.value = null
      previewImage.value = null
      imageRemoved.value = true
      
      console.log('✅ 이미지 제거 완료:', {
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
          result = await petStore.updatePet(props.pet.id, submitData, imageFile.value)
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
      getSpeciesIcon
    }
  }
}
</script>

<style scoped>
.pet-form-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--mm-surface);
  border-radius: var(--mm-radius-2xl);
  box-shadow: var(--mm-shadow-xl);
  overflow: hidden;
}

/* 이미지 업로드 섹션 */
.image-upload-section {
  text-align: center;
  padding: var(--mm-space-8);
  background: linear-gradient(135deg, var(--mm-surface-variant), var(--mm-border-light));
  border-bottom: 1px solid var(--mm-border);
}

.image-container {
  position: relative;
  display: inline-block;
}

.pet-avatar {
  border: 4px solid var(--mm-border);
  box-shadow: var(--mm-shadow-lg);
  transition: all var(--mm-transition-normal);
}

.pet-avatar:hover {
  transform: scale(1.05);
  box-shadow: var(--mm-shadow-xl);
}

.image-actions {
  margin-top: var(--mm-space-4);
  display: flex;
  gap: var(--mm-space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.image-hint {
  margin-top: var(--mm-space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mm-space-2);
  color: var(--mm-on-surface-variant);
  font-size: var(--mm-text-sm);
  font-weight: var(--mm-font-weight-medium);
}

/* 폼 필드 섹션 */
.form-fields-section {
  padding: var(--mm-space-8);
}

.form-field {
  margin-bottom: var(--mm-space-6);
  width: 100%;
}

.form-field .mm-input {
  width: 100%;
}

.field-label {
  display: flex;
  align-items: center;
  gap: var(--mm-space-3);
  margin-bottom: var(--mm-space-3);
  font-size: var(--mm-text-lg);
  font-weight: var(--mm-font-weight-semibold);
  color: var(--mm-on-surface);
}

.field-hint {
  margin-top: var(--mm-space-2);
  display: flex;
  align-items: center;
  gap: var(--mm-space-2);
  color: var(--mm-on-surface-variant);
  font-size: var(--mm-text-sm);
  font-weight: var(--mm-font-weight-medium);
}

/* 입력 필드 스타일 */
.mm-input {
  width: 100%;
}

.mm-input :deep(.v-field) {
  border-radius: var(--mm-radius-xl);
  width: 100%;
}

.mm-input :deep(.v-field__outline) {
  border-radius: var(--mm-radius-xl);
  width: 100%;
}

.mm-input :deep(.v-field--focused .v-field__outline) {
  border-color: var(--v-theme-primary);
  border-width: 2px;
}

/* 생일 입력 컨테이너 */
.birthday-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--mm-space-2);
}

.birthday-input-container .mm-input {
  flex: 1;
}

.clear-birthday-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

/* 생일 선택기 */
.birthday-picker {
  border-radius: var(--mm-radius-xl);
  overflow: hidden;
  box-shadow: var(--mm-shadow-xl);
}

/* 액션 버튼 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mm-space-4);
  padding: var(--mm-space-6) var(--mm-space-8);
  background: var(--mm-surface-variant);
  border-top: 1px solid var(--mm-border);
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .pet-form-container {
    margin: var(--mm-space-4);
  }
  
  .image-upload-section {
    padding: var(--mm-space-6);
  }
  
  .form-fields-section {
    padding: var(--mm-space-6);
  }
  
  .form-actions {
    padding: var(--mm-space-4) var(--mm-space-6);
  }
}

@media (max-width: 768px) {
  .pet-form-container {
    margin: var(--mm-space-3);
  }
  
  .image-upload-section {
    padding: var(--mm-space-4);
  }
  
  .image-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--mm-space-2);
  }
  
  .form-fields-section .mm-grid {
    grid-template-columns: 1fr;
  }
  
  .form-field {
    margin-bottom: var(--mm-space-4);
  }
  
  .field-label {
    font-size: var(--mm-text-base);
    gap: var(--mm-space-2);
  }
  
  .form-actions {
    flex-direction: column;
    gap: var(--mm-space-3);
    padding: var(--mm-space-4);
  }
  
  .form-actions .mm-btn {
    width: 100%;
  }
}

/* 이미지 제거 버튼 특별 스타일 */
.image-remove-btn {
  border-color: var(--v-theme-error) !important;
  color: var(--v-theme-error) !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

.image-remove-btn:hover {
  background-color: var(--v-theme-error) !important;
  color: white !important;
  transform: scale(1.05);
}

@media (max-width: 480px) {
  .pet-form-container {
    margin: var(--mm-space-2);
    border-radius: var(--mm-radius-xl);
  }
  
  .image-upload-section {
    padding: var(--mm-space-3);
  }
  
  .pet-avatar {
    width: 120px !important;
    height: 120px !important;
  }
  
  .image-hint {
    font-size: var(--mm-text-xs);
    gap: var(--mm-space-1);
  }
  
  .form-fields-section {
    padding: var(--mm-space-4);
  }
  
  .field-label {
    font-size: var(--mm-text-sm);
    margin-bottom: var(--mm-space-2);
  }
  
  .field-hint {
    font-size: var(--mm-text-xs);
    gap: var(--mm-space-1);
  }
  
  .form-actions {
    padding: var(--mm-space-3);
  }
}
</style>
