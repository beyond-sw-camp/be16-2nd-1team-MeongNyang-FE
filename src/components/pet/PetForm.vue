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
        <h2>프로필 사진 선택하기</h2>
        <p>마음에 드는 반려동물 사진이 있나요? 지금 업로드하세요.</p>
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
        <h2>기본 정보 입력</h2>
        <p>반려동물의 기본 정보를 입력해주세요.</p>
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
              placeholder="나이를 입력하세요"
              variant="outlined"
              rounded="lg"
              class="form-input"
              hide-details="auto"
              density="comfortable"
              min="0"
              max="30"
              required
              :rules="[v => !!v || '나이를 입력해주세요']"
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

    <!-- 생일 선택기 모달 -->
    <v-dialog v-model="showBirthdayPicker" max-width="400">
      <v-card>
        <v-card-title class="text-h6">생일 선택</v-card-title>
        <v-card-text>
          <v-date-picker
            v-model="petData.birthday"
            :max="maxDate"
            :min="minDate"
            @update:model-value="onBirthdayChange"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showBirthdayPicker = false"
          >
            확인
          </v-btn>
        </v-card-actions>
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
    
    // 펫 데이터
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
    
    // 나이 계산 함수
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
        
        if (props.isEdit) {
          // 수정 모드
          console.log('🔄 수정 모드 - updatePet 호출')
          await petStore.updatePet(props.pet.id, petData, imageFile.value)
          emit('success', '반려동물이 수정되었습니다.')
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
    watch(() => props.pet, (newPet) => {
      if (newPet && props.isEdit) {
        petData.name = newPet.name || ''
        petData.speciesId = newPet.speciesId || null
        petData.speciesName = newPet.speciesName || ''
        petData.gender = newPet.gender || ''
        petData.age = newPet.age || null
        petData.weight = newPet.weight || null
        petData.birthday = newPet.birthday || null
        petData.introduce = newPet.introduce || ''
        
        // 기존 이미지가 있으면 표시
        if (newPet.imageUrl) {
          previewImage.value = newPet.imageUrl
          imageRemoved.value = false
        }
      }
    }, { immediate: true })
    
    // 컴포넌트 마운트 시 종류 데이터 로드
    onMounted(async () => {
      await petStore.fetchSpecies()
    })
    
    return {
      // 단계 관리
      currentStep,
      nextStep,
      previousStep,
      
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
      
      // UI 상태
      showBirthdayPicker,
      maxDate,
      minDate,
      formattedBirthday,
      
      // 메서드들
      handleImageClick,
      handleImageChange,
      clearImage,
      handleSpeciesIdChange,
      onBirthdayChange,
      clearBirthday,
      getSpeciesIcon,
      getSpeciesIconColor,
      handleSubmit
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
</style>

