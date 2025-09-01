<template>
  <div class="pet-detail-modal">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular 
        indeterminate 
        size="80" 
        color="#E87D7D"
        class="loading-spinner"
      ></v-progress-circular>
      <p class="loading-text">반려동물 정보를 불러오는 중...</p>
    </div>

    <!-- 펫 정보 표시 -->
    <div v-else-if="pet" class="pet-detail-content">
      <!-- 대표 반려동물 섹션 (펫 목록과 동일한 스타일) -->
      <div class="representative-pet-section">
        <div class="representative-header">
          <h3 class="representative-title">반려동물 상세정보</h3>
          <div v-if="isRepresentative" class="representative-badge">
            <v-icon color="amber" size="20">mdi-star</v-icon>
            <span>대표</span>
          </div>
        </div>
        
        <!-- 대표동물 전체 정보 -->
        <div class="representative-content">
          <div class="pet-image-large">
            <v-img
              v-if="pet.url && pet.url.trim() !== ''"
              :src="pet.url"
              :alt="pet.name"
              class="large-pet-image"
              aspect-ratio="1"
              cover
              @click="startEditImage"
            >
              <template v-slot:error>
                <div class="large-image-placeholder" @click="startEditImage">
                  <v-icon :size="80" color="#E87D7D" :icon="getSpeciesIcon(pet.petOrder)" />
                </div>
              </template>
            </v-img>
            <div v-else class="large-image-placeholder" @click="startEditImage">
              <v-icon :size="80" color="#E87D7D" :icon="getSpeciesIcon(pet.petOrder)" />
            </div>
          </div>
          
          <div class="pet-details-large">
            <h2 class="pet-name-large">{{ pet.name }}</h2>
            
            <!-- 기본 정보 태그들 -->
            <div class="pet-tags-large">
              <v-chip 
                size="medium" 
                variant="tonal" 
                color="#E87D7D"
                :prepend-icon="getSpeciesIcon(pet.petOrder)"
                @click="startEditField('species')"
                class="editable-chip"
              >
                {{ pet.species || '알 수 없음' }}
                <v-icon size="16" color="#E87D7D" class="edit-icon">mdi-pencil</v-icon>
              </v-chip>
              
              <v-chip 
                size="medium" 
                variant="tonal" 
                color="#E87D7D"
                :prepend-icon="getGenderIcon(pet.gender)"
                @click="startEditField('gender')"
                class="editable-chip"
              >
                {{ getGenderLabel(pet.gender) }}
                <v-icon size="16" color="#E87D7D" class="edit-icon">mdi-pencil</v-icon>
              </v-chip>
              
              <v-chip 
                size="medium" 
                variant="tonal" 
                color="orange"
                prepend-icon="mdi-cake-variant"
                @click="startEditField('age')"
                class="editable-chip"
              >
                {{ pet.age }}살
                <v-icon size="16" color="#E87D7D" class="edit-icon">mdi-pencil</v-icon>
              </v-chip>
            </div>
            
            <!-- 추가 정보 -->
            <div class="additional-info-large">
              <div class="info-row" @click="startEditField('weight')">
                <v-icon size="20" color="grey-darken-1">mdi-weight</v-icon>
                <span>{{ pet.weight || '알 수 없음' }}kg</span>
                <v-icon size="16" color="#E87D7D" class="edit-icon">mdi-pencil</v-icon>
              </div>
              <div class="info-row" @click="startEditField('birthday')">
                <v-icon size="20" color="grey-darken-1">mdi-calendar</v-icon>
                <span>{{ formatBirthday(pet.birthday) }}</span>
                <v-icon size="16" color="#E87D7D" class="edit-icon">mdi-pencil</v-icon>
              </div>
            </div>

            <!-- 소개글 -->
            <div class="introduction-large" @click="startEditField('introduce')">
              <h4 class="introduction-title">
                소개글
                <v-icon size="16" color="#E87D7D" class="edit-icon">mdi-pencil</v-icon>
              </h4>
              <p v-if="pet.introduce" class="introduction-text">{{ pet.introduce }}</p>
              <p v-else class="introduction-text no-introduction">소개글이 등록되지 않았습니다.</p>
            </div>
            
            <!-- 액션 버튼들 -->
            <div class="action-buttons-large">
              <v-btn
                color="#E87D7D"
                variant="flat"
                prepend-icon="mdi-star"
                @click="setAsRepresentative(pet)"
                size="large"
                rounded="xl"
                class="representative-btn"
                v-if="!isRepresentative"
              >
                대표로 설정
              </v-btn>
              
              <v-btn
                color="#E87D7D"
                variant="outlined"
                prepend-icon="mdi-delete"
                @click="confirmDelete(pet)"
                size="large"
                rounded="xl"
                class="delete-btn"
              >
                삭제
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- 이미지 업로드 입력 (숨김) -->
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleImageChange"
      />

      <!-- 수정 모달 -->
      <v-dialog v-model="showEditModal" max-width="500" persistent>
        <v-card rounded="xl">
          <v-card-title class="text-center pa-6">
            <v-icon color="#E87D7D" size="32" class="mb-2">mdi-pencil</v-icon>
            <h3>{{ getEditModalTitle() }}</h3>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <!-- 이름 수정 -->
            <div v-if="editingField === 'name'" class="edit-field">
              <v-text-field
                v-model="editData.name"
                label="이름"
                variant="outlined"
                rounded="lg"
                :rules="[v => !!v || '이름을 입력해주세요']"
                autofocus
              />
            </div>

            <!-- 종류 수정 -->
            <div v-if="editingField === 'species'" class="edit-field">
              <v-autocomplete
                v-model="editData.speciesId"
                :items="speciesOptions"
                item-title="species"
                item-value="speciesId"
                label="종류"
                variant="outlined"
                rounded="lg"
                :rules="[v => !!v || '종류를 선택해주세요']"
                autofocus
              />
            </div>

            <!-- 성별 수정 -->
            <div v-if="editingField === 'gender'" class="edit-field">
              <v-select
                v-model="editData.gender"
                :items="genderOptions"
                item-title="title"
                item-value="value"
                label="성별"
                variant="outlined"
                rounded="lg"
                :rules="[v => !!v || '성별을 선택해주세요']"
                autofocus
              />
            </div>

            <!-- 나이 수정 -->
            <div v-if="editingField === 'age'" class="edit-field">
              <v-text-field
                v-model.number="editData.age"
                type="number"
                label="나이"
                variant="outlined"
                rounded="lg"
                suffix="살"
                :rules="[v => v >= 0 || '나이는 0 이상이어야 합니다']"
                autofocus
              />
            </div>

            <!-- 체중 수정 -->
            <div v-if="editingField === 'weight'" class="edit-field">
              <v-text-field
                v-model.number="editData.weight"
                type="number"
                label="체중"
                variant="outlined"
                rounded="lg"
                suffix="kg"
                :rules="[v => v > 0 || '체중은 0보다 커야 합니다']"
                autofocus
              />
            </div>

            <!-- 생일 수정 -->
            <div v-if="editingField === 'birthday'" class="edit-field">
              <v-text-field
                :model-value="formatDateForInput(editData.birthday)"
                label="생일"
                variant="outlined"
                rounded="lg"
                readonly
                prepend-inner-icon="mdi-calendar"
                @click="showBirthdayPicker = true"
                autofocus
              />
            </div>

            <!-- 소개글 수정 -->
            <div v-if="editingField === 'introduce'" class="edit-field">
              <v-textarea
                v-model="editData.introduce"
                label="소개글"
                variant="outlined"
                rounded="lg"
                rows="4"
                auto-grow
                placeholder="반려동물에 대한 소개를 입력하세요"
                autofocus
              />
            </div>
          </v-card-text>
          
          <v-card-actions class="justify-center pa-6">
            <v-btn
              color="grey"
              variant="outlined"
              @click="cancelEdit"
              class="mr-4"
              rounded="lg"
            >
              취소
            </v-btn>
            <v-btn
              color="#E87D7D"
              variant="flat"
              @click="saveEdit"
              :loading="saving"
              rounded="lg"
            >
              저장
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 생일 선택기 -->
      <v-dialog v-model="showBirthdayPicker" max-width="400">
        <v-card rounded="xl">
          <v-card-title class="text-center pa-4">생일 선택</v-card-title>
          <v-card-text class="pa-4">
            <v-date-picker
              v-model="editData.birthday"
              :max="maxDate"
              :min="minDate"
              @update:model-value="onBirthdayChange"
            />
          </v-card-text>
          <v-card-actions class="justify-center pa-4">
            <v-btn
              color="#E87D7D"
              variant="flat"
              @click="showBirthdayPicker = false"
              rounded="lg"
            >
              확인
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 이미지 변경 확인 모달 -->
      <v-dialog v-model="showImageConfirm" max-width="400" persistent>
        <v-card rounded="xl" elevation="8">
          <v-card-title class="text-center text-h6 font-weight-bold pa-4">
            프로필 사진 변경
          </v-card-title>
          
          <v-card-text class="text-center pa-4">
            <div class="mb-4">
              <v-avatar size="120" class="mb-3">
                <v-img
                  v-if="imagePreviewUrl"
                  :src="imagePreviewUrl"
                  cover
                  class="preview-image"
                />
              </v-avatar>
              <div class="text-body-2 text-medium-emphasis">
                선택한 이미지로 프로필 사진을 변경하시겠습니까?
              </div>
            </div>
          </v-card-text>
          
          <v-card-actions class="pa-4 pt-0">
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              @click="cancelImageChange"
              rounded="lg"
            >
              취소
            </v-btn>
            <v-btn
              color="primary"
              @click="saveImage"
              rounded="lg"
              prepend-icon="mdi-check"
            >
              변경하기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 성공/에러 메시지 -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        timeout="4000"
        location="top"
        rounded="lg"
      >
        <div class="d-flex align-center">
          <v-icon class="me-3">{{ snackbarIcon }}</v-icon>
          <span class="font-weight-medium">{{ snackbarMessage }}</span>
        </div>
      </v-snackbar>

      <!-- 삭제 확인 모달 -->
      <v-dialog v-model="showDeleteConfirm" max-width="500">
        <v-card rounded="xl">
          <v-card-title class="text-center pa-6">
            <v-icon color="error" size="48" class="mb-4">mdi-alert-circle</v-icon>
            <h3>반려동물 삭제</h3>
          </v-card-title>
          <v-card-text class="text-center">
            <p>정말로 <strong>{{ petToDelete?.name }}</strong>을(를) 삭제하시겠습니까?</p>
            <p class="text-error">이 작업은 되돌릴 수 없습니다.</p>
          </v-card-text>
          <v-card-actions class="justify-center pa-6">
            <v-btn
              color="grey"
              variant="outlined"
              @click="showDeleteConfirm = false"
              class="mr-4"
            >
              취소
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              @click="deletePet"
              :loading="deleting"
            >
              삭제
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePetStore } from '@/stores/pet'

// Vue 3 Composition API에서 defineProps와 defineEmits는 자동으로 사용 가능
// ESLint 에러 방지를 위해 주석 추가
/* global defineProps, defineEmits */

const props = defineProps({
  pet: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update', 'delete'])

const petStore = usePetStore()

// 반응형 데이터
const loading = ref(false)

const showDeleteConfirm = ref(false)
const deleting = ref(false)
const petToDelete = ref(null)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('mdi-check-circle')

// 이미지 관련
const imageInput = ref(null)
const showImageConfirm = ref(false)
const imagePreviewUrl = ref(null)

// 수정 관련
const showEditModal = ref(false)
const editingField = ref('')
const saving = ref(false)
const editData = ref({
  name: '',
  speciesId: null,
  gender: '',
  age: null,
  weight: null,
  birthday: null,
  introduce: ''
})

// 생일 선택기
const showBirthdayPicker = ref(false)
const maxDate = computed(() => new Date().toISOString().split('T')[0])
const minDate = computed(() => new Date(1900, 0, 1).toISOString().split('T')[0])

// computed properties
const isRepresentative = computed(() => {
  if (!props.pet || !petStore.representativePet) return false
  return props.pet.id === petStore.representativePet.id
})

// 종류 옵션
const speciesOptions = computed(() => {
  const species = petStore.getSpecies
  if (species && species.length > 0) {
    return species.map(s => ({
      species: s.species,
      speciesId: s.id || s.speciesId || null
    }))
  }
  return []
})

// 성별 옵션
const genderOptions = [
  { value: 'MALE', title: '수컷' },
  { value: 'FEMALE', title: '암컷' },
        { value: 'NEUTRALITY', title: '중성' }
]

// 수정 시작
const startEditField = (fieldName) => {
  editingField.value = fieldName
  
  // 편집 데이터 초기화
  if (fieldName === 'species') {
    const foundSpecies = speciesOptions.value.find(s => s.species === props.pet.species)
    editData.value.speciesId = foundSpecies ? foundSpecies.speciesId : null
  } else if (fieldName === 'birthday') {
    editData.value[fieldName] = props.pet[fieldName] ? formatDateForInput(props.pet[fieldName]) : ''
    if (props.pet.birthday) {
      editData.value.age = props.pet.age
    }
  } else {
    editData.value[fieldName] = props.pet[fieldName]
  }
  
  showEditModal.value = true
}

// 수정 취소
const cancelEdit = () => {
  showEditModal.value = false
  editingField.value = ''
  editData.value = {
    name: '',
    speciesId: null,
    gender: '',
    age: null,
    weight: null,
    birthday: null,
    introduce: ''
  }
}

// 수정 저장
const saveEdit = async () => {
  try {
    saving.value = true
    
    let fieldValue = editData.value[editingField.value]
    
    // 특별한 처리가 필요한 필드들
    if (editingField.value === 'species') {
      fieldValue = editData.value.speciesId
    } else if (editingField.value === 'birthday' && fieldValue) {
      if (typeof fieldValue === 'string' && fieldValue.includes('.')) {
        fieldValue = fieldValue.replace(/\./g, ' ').trim().replace(/\s+/g, '-')
      }
    }
    
    const result = await petStore.updateField(props.pet.id, editingField.value, fieldValue)
    
    if (result.success) {
      showMessage(`${getEditModalTitle()}이(가) 성공적으로 수정되었습니다.`, 'success')
      showEditModal.value = false
      editingField.value = ''
      
      // 부모 컴포넌트에 업데이트 알림
      emit('update', { ...props.pet, [editingField.value]: fieldValue })
    } else {
      showMessage(result.message || `${getEditModalTitle()} 수정에 실패했습니다.`, 'error')
    }
  } catch (error) {
    console.error('수정 실패:', error)
    showMessage(`${getEditModalTitle()} 수정에 실패했습니다.`, 'error')
  } finally {
    saving.value = false
  }
}

// 수정 모달 제목
const getEditModalTitle = () => {
  const titles = {
    name: '이름',
    species: '종류',
    gender: '성별',
    age: '나이',
    weight: '체중',
    birthday: '생일',
    introduce: '소개글'
  }
  return titles[editingField.value] || '정보'
}

// 생일 변경 시 나이 자동 계산
const onBirthdayChange = () => {
  if (editData.value.birthday) {
    const birthDate = new Date(editData.value.birthday)
    const today = new Date()
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    editData.value.age = age
  }
}

// 날짜 포맷 함수
const formatDateForInput = (dateStr) => {
  if (!dateStr) return ''
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('날짜 형식 변환 실패:', error)
    return ''
  }
}

// 이미지 편집 시작
const startEditImage = () => {
  if (imageInput.value) {
    imageInput.value.click()
  }
}

// 이미지 변경 처리
const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target.result
      showImageConfirm.value = true
    }
    reader.readAsDataURL(file)
  }
}

// 이미지 변경 취소
const cancelImageChange = () => {
  showImageConfirm.value = false
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// 이미지 저장
const saveImage = async () => {
  if (!imageInput.value?.files[0]) return
  
  try {
    // 여기에 이미지 업로드 로직 추가
    // await petStore.uploadPetImage(props.pet.id, file)
    
    showMessage('프로필 사진이 변경되었습니다.', 'success')
    showImageConfirm.value = false
    imagePreviewUrl.value = null
    
    // 부모 컴포넌트에 업데이트 알림
    emit('update', { ...props.pet, url: imagePreviewUrl.value })
  } catch (error) {
    console.error('이미지 저장 실패:', error)
    showMessage('이미지 저장에 실패했습니다.', 'error')
  }
}

// 대표 반려동물 설정
const setAsRepresentative = async (pet) => {
  if (!pet) return
  
  try {
    const result = await petStore.setRepresentativePet(pet)
    
    if (result.success) {
      showMessage('대표 반려동물이 설정되었습니다.', 'success')
      // 부모 컴포넌트에 업데이트 알림
      emit('update', pet)
    } else {
      showMessage(result.message || '대표 반려동물 설정에 실패했습니다.', 'error')
    }
  } catch (error) {
    console.error('대표 반려동물 설정 실패:', error)
    showMessage('대표 반려동물 설정에 실패했습니다.', 'error')
  }
}

// 삭제 확인
const confirmDelete = (pet) => {
  petToDelete.value = pet
  showDeleteConfirm.value = true
}

// 반려동물 삭제
const deletePet = async () => {
  if (!petToDelete.value) return
  
  try {
    deleting.value = true
    const result = await petStore.deletePet(petToDelete.value.id)
    
    if (result.success) {
      showMessage('반려동물이 삭제되었습니다.', 'success')
      // 부모 컴포넌트에 삭제 알림
      emit('delete', petToDelete.value.id)
      emit('close')
    } else {
      showMessage(result.message || '반려동물 삭제에 실패했습니다.', 'error')
    }
  } catch (error) {
    console.error('펫 삭제 실패:', error)
    showMessage('반려동물 삭제에 실패했습니다.', 'error')
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}

// 메시지 표시
const showMessage = (message, type = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = type
  snackbarIcon.value = type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
  showSnackbar.value = true
}

// 종류에 따른 아이콘 반환
const getSpeciesIcon = (petOrder) => {
  if (petOrder === '강아지') return 'mdi-dog'
  if (petOrder === '고양이') return 'mdi-cat'
  return 'mdi-paw'
}

const getGenderIcon = (gender) => {
  if (gender === 'MALE') return 'mdi-gender-male'
  if (gender === 'FEMALE') return 'mdi-gender-female'
  if (gender === 'NEUTRALITY') return 'mdi-gender-non-binary'
  return 'mdi-help-circle'
}

const getGenderLabel = (gender) => {
  if (!gender) return '알 수 없음'
  if (gender === 'MALE') return '수컷'
  if (gender === 'FEMALE') return '암컷'
  if (gender === 'NEUTRALITY') return '중성'
  return '알 수 없음'
}

const formatBirthday = (birthday) => {
  if (!birthday) return '알 수 없음'
  
  if (typeof birthday === 'string' && birthday.includes('.')) {
    return birthday
  }
  
  try {
    const date = new Date(birthday)
    if (isNaN(date.getTime())) return '알 수 없음'
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`
  } catch (error) {
    return '알 수 없음'
  }
}
</script>

<style scoped>
.pet-detail-modal {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  width: 100%;
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-text {
  font-size: 1.2rem;
  color: #6b7280;
}

.pet-detail-content {
  width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border: none;
  position: relative;
}

/* 대표 반려동물 섹션 (펫 목록과 동일) */
.representative-pet-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  width: 100%;
  margin-bottom: 40px;
}

.representative-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.representative-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.representative-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.representative-content {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.pet-image-large {
  flex-shrink: 0;
}

.large-pet-image {
  width: 240px;
  height: 240px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
}

.large-image-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 20px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  cursor: pointer;
}

.pet-details-large {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pet-name-large {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.pet-tags-large {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.editable-chip {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.editable-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
}

.edit-icon {
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.editable-chip:hover .edit-icon {
  opacity: 1;
}

.additional-info-large {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-row:hover {
  background: rgba(232, 125, 125, 0.05);
  color: #E87D7D;
}

.introduction-large {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #E87D7D;
  cursor: pointer;
  transition: all 0.3s ease;
}

.introduction-large:hover {
  background: rgba(232, 125, 125, 0.05);
}

.introduction-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.introduction-text {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.introduction-text.no-introduction {
  color: #9ca3af;
  font-style: italic;
}

.action-buttons-large {
  display: flex;
  gap: 12px;
  margin-top: auto;
  align-items: center;
}

.representative-btn {
  background: #E87D7D !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.representative-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.delete-btn {
  background: transparent !important;
  color: #E87D7D !important;
  border: 2px solid #E87D7D !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #E87D7D !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

/* 수정 모달 스타일 */
.edit-field {
  margin-bottom: 20px;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .representative-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .pet-image-large {
    margin-bottom: 20px;
  }
  
  .action-buttons-large {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .representative-pet-section {
    padding: 20px;
  }
  
  .large-pet-image,
  .large-image-placeholder {
    width: 180px;
    height: 180px;
  }
  
  .pet-name-large {
    font-size: 1.5rem;
  }
}
</style>
