<template>
  <div class="pet-form-container">
    <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
      <!-- 반려동물 이미지 업로드 -->
      <div class="image-upload-section">
        <div class="image-container">
          <v-avatar
            :image="previewImage || (isEdit && pet?.url ? pet.url : null)"
            :size="140"
            class="pet-avatar"
            color="grey-lighten-3"
          >
            <v-icon v-if="!previewImage && !(isEdit && pet?.url)" :size="64" :color="getSpeciesIconColor()" :icon="getSpeciesIcon()" />
            <v-img v-else-if="previewImage || (isEdit && pet?.url)" :src="previewImage || pet.url" cover />
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
              {{ previewImage || (isEdit && pet?.url) ? '이미지 변경' : '이미지 추가' }}
            </v-btn>
            
            <v-btn
              v-if="previewImage || (isEdit && pet?.url)"
              color="error"
              variant="text"
              size="small"
              @click="clearImage"
              class="mm-btn"
              rounded="lg"
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
              item-value="id"
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
              placeholder="나이를 입력하세요"
              variant="outlined"
              rounded="xl"
              class="mm-input"
              hide-details="auto"
              min="0"
              max="30"
            />
            <div class="field-hint">
              <v-icon size="16" color="info">mdi-information</v-icon>
              <span>나이를 직접 입력하거나 생일을 입력하여 자동 계산할 수 있습니다</span>
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
            <div class="field-hint">
              <v-icon size="16" color="info">mdi-information</v-icon>
              <span>생일을 입력하면 나이가 자동으로 계산됩니다 (선택사항)</span>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
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
    const submitting = ref(false)
    
    // 펫 데이터 - 먼저 선언
    const petData = reactive({
      name: '',
      speciesId: null,
      speciesName: '',
      gender: '',
      age: null,
      weight: null,
      birthday: null
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
      
      // 나이 검사: 생일이 있으면 자동 계산되거나, 없으면 수동 입력 필요
      const hasValidAge = petData.age !== null && 
                         petData.age !== '' && 
                         petData.age >= 0 && 
                         petData.age <= 30
      
      return hasRequiredFields && hasValidAge
    })
    
    // 로딩 상태
    const loading = computed(() => petStore.isLoading)
    
    // 종류 옵션
    const speciesOptions = computed(() => petStore.getSpecies)
    
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
    
    // 종류 ID에 따른 종류 이름 반환 - 먼저 선언
    const getSpeciesName = (speciesId) => {
      if (speciesId) {
        const species = petStore.getSpeciesById(speciesId)
        return species ? species.species : ''
      }
      return ''
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
        petData.name = newPet.name || ''
        petData.speciesId = newPet.speciesId || null
        petData.speciesName = getSpeciesName(newPet.speciesId) || ''
        petData.gender = newPet.gender || ''
        petData.age = newPet.age || null
        petData.weight = newPet.weight || null
        petData.birthday = newPet.birthday || null
        
        // 기존 이미지가 있으면 미리보기 설정
        if (newPet.url) {
          previewImage.value = newPet.url
        }
      }
    }, { immediate: true })

    // 생일 변경 시 나이 자동 계산
    watch(() => petData.birthday, (newBirthday) => {
      if (newBirthday) {
        const calculatedAge = calculateAge(newBirthday)
        if (calculatedAge !== null && calculatedAge >= 0 && calculatedAge <= 30) {
          // 생일이 변경되었을 때만 나이를 자동 계산
          // 사용자가 이미 나이를 입력했다면 덮어쓰지 않음
          if (petData.age === null || petData.age === '') {
            petData.age = calculatedAge
            console.log('생일 기반으로 나이 자동 계산:', calculatedAge)
          } else {
            console.log('사용자가 이미 나이를 입력했으므로 자동 계산하지 않음')
          }
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
      petData.speciesId = speciesId
      // 종류명도 자동으로 설정
      if (speciesId) {
        const selectedSpecies = petStore.getSpeciesById(speciesId)
        if (selectedSpecies) {
          petData.speciesName = selectedSpecies.species
        }
      } else {
        petData.speciesName = ''
      }
      console.log('종류 ID 변경됨:', speciesId, petData.speciesName)
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
      imageFile.value = null
      previewImage.value = null
      // 수정 모드에서 기존 이미지도 제거
      if (props.isEdit && props.pet?.url) {
        // 기존 이미지 URL 제거 (백엔드에서 처리)
        emit('image-removed')
      }
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
        
        // 폼 데이터 준비 (백엔드에서 speciesName은 필요없음)
        const submitData = {
          name: petData.name,
          speciesId: petData.speciesId,
          gender: petData.gender,
          age: petData.age,
          weight: petData.weight,
          birthday: petData.birthday
        }
        
        console.log('전송할 데이터:', submitData)
        
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
    
    // 생일 변경 처리
    const onBirthdayChange = (newBirthday) => {
      console.log('생일 변경됨:', newBirthday)
      if (newBirthday) {
        const calculatedAge = calculateAge(newBirthday)
        if (calculatedAge !== null && calculatedAge >= 0 && calculatedAge <= 30) {
          // 생일이 변경되었을 때만 나이를 자동 계산
          // 사용자가 이미 나이를 입력했다면 덮어쓰지 않음
          if (petData.age === null || petData.age === '') {
            petData.age = calculatedAge
            console.log('생일 기반으로 나이 자동 계산:', calculatedAge)
          } else {
            console.log('사용자가 이미 나이를 입력했으므로 자동 계산하지 않음')
          }
        }
      }
      // 달력 닫기
      showBirthdayPicker.value = false
    }
    
    // 생일 초기화
    const clearBirthday = () => {
      petData.birthday = ''
      console.log('생일 초기화됨')
    }

    // 유틸리티 함수들
    const getSpeciesIcon = () => {
      if (petData.speciesId) {
        const species = petStore.getSpeciesById(petData.speciesId)
        if (species && species.petOrder === 'DOG') return 'mdi-dog'
        if (species && species.petOrder === 'CAT') return 'mdi-cat'
        return 'mdi-paw'
      }
      return 'mdi-paw'
    }

    const getSpeciesIconColor = () => {
      if (petData.speciesId) {
        const species = petStore.getSpeciesById(petData.speciesId)
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
