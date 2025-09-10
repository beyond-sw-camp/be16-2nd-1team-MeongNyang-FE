<template>
  <div class="pet-detail-modal modal-container modal-gpu-accelerated">
    <!-- 로딩 상태 -->
    <Transition name="modal-scale" appear>
      <div v-if="loading" class="loading-container">
        <v-progress-circular 
          indeterminate 
          size="80" 
          color="#E87D7D"
          class="loading-spinner"
        ></v-progress-circular>
        <p class="loading-text">반려동물 정보를 불러오는 중...</p>
      </div>
    </Transition>

    <!-- 펫 정보 표시 -->
    <Transition name="modal-stagger" appear>
      <div v-if="pet && !loading" class="pet-detail-content modal-optimized">
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
              class="large-pet-image modal-gpu-accelerated"
              aspect-ratio="1"
              cover
              loading="lazy"
              @click="startEditImage"
            >
              <template v-slot:placeholder>
                <div class="image-loading-placeholder">
                  <v-progress-circular indeterminate color="#E87D7D" size="40" />
                </div>
              </template>
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
      <v-dialog 
        v-model="showEditModal" 
        max-width="500" 
        persistent
        transition="modal-scale"
        class="modal-optimized"
      >
        <v-card rounded="xl" class="modal-content modal-gpu-accelerated">
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
      <v-dialog 
        v-model="showBirthdayPicker" 
        max-width="400"
        transition="modal-scale"
        class="modal-optimized"
      >
        <v-card rounded="xl" class="modal-content modal-gpu-accelerated">
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
      <v-dialog 
        v-model="showImageConfirm" 
        max-width="400" 
        persistent
        transition="modal-scale"
        class="modal-optimized"
      >
        <v-card rounded="xl" elevation="8" class="modal-content modal-gpu-accelerated">
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


      <!-- 삭제 확인 모달 - PetForm 스타일 적용 -->
      <v-dialog
        v-model="showDeleteConfirm"
        width="600"
        class="delete-dialog modal-optimized"
        @click:outside="showDeleteConfirm = false"
        :scrim="false"
        persistent
        transition="modal-scale"
      >
        <v-card class="delete-modal-card modal-content modal-gpu-accelerated" rounded="xl">
          <v-card-title class="delete-header">
            <div class="delete-title-section">
              <v-icon size="32" color="white">mdi-delete</v-icon>
              <span class="text-h5">반려동물 삭제</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              @click="showDeleteConfirm = false"
              class="close-btn"
            />
          </v-card-title>
          
          <v-card-text class="delete-content">
            <div class="delete-icon-container">
              <div class="delete-icon-circle">
                <v-img
                  v-if="petToDelete?.url"
                  :src="petToDelete.url"
                  :alt="petToDelete.name"
                  class="delete-pet-image"
                  cover
                />
                <v-icon v-else size="48" color="white">mdi-delete</v-icon>
              </div>
            </div>
            
            <div class="delete-message-section">
              <h3 class="delete-pet-name">{{ petToDelete?.name }}</h3>
              <p class="delete-description">
                이 반려동물을 삭제하면 복구할 수 없습니다.
              </p>
              <div class="delete-warning">
                <v-icon size="20" color="#FF9800" class="warning-icon">mdi-alert-circle</v-icon>
                <span>이 작업은 되돌릴 수 없습니다.</span>
              </div>
            </div>
          </v-card-text>
          
          <v-card-actions class="delete-actions">
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              @click="showDeleteConfirm = false"
              class="cancel-btn"
              size="large"
              rounded="lg"
            >
              취소
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              @click="deletePet"
              :loading="deleting"
              class="delete-btn"
              size="large"
              rounded="lg"
            >
              삭제
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
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
      showEditModal.value = false
      editingField.value = ''
      
      // 부모 컴포넌트에 업데이트 알림
      emit('update', { ...props.pet, [editingField.value]: fieldValue })
    }
  } catch (error) {
    console.error('수정 실패:', error)
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
    
    showImageConfirm.value = false
    imagePreviewUrl.value = null
    
    // 부모 컴포넌트에 업데이트 알림
    emit('update', { ...props.pet, url: imagePreviewUrl.value })
  } catch (error) {
    console.error('이미지 저장 실패:', error)
  }
}

// 대표 반려동물 설정
const setAsRepresentative = async (pet) => {
  if (!pet) return
  
  try {
    const result = await petStore.setRepresentativePet(pet)
    
    if (result.success) {
      // 부모 컴포넌트에 업데이트 알림
      emit('update', pet)
    }
  } catch (error) {
    console.error('대표 반려동물 설정 실패:', error)
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
      // 부모 컴포넌트에 삭제 알림
      emit('delete', petToDelete.value.id)
      emit('close')
    }
  } catch (error) {
    console.error('펫 삭제 실패:', error)
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
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

// 성능 최적화: 모달 마운트 시 GPU 가속 활성화
onMounted(() => {
  nextTick(() => {
    // GPU 가속 강제 활성화
    const modalElement = document.querySelector('.pet-detail-modal')
    if (modalElement) {
      modalElement.style.transform = 'translateZ(0)'
      modalElement.style.willChange = 'transform, opacity'
    }
  })
})

// 성능 최적화: 모달 언마운트 시 정리
onUnmounted(() => {
  // 메모리 정리
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
})
</script>

<style scoped>
@import '@/assets/styles/modal-animations.css';

.pet-detail-modal {
  width: 100%;
  contain: layout style paint;
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
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.large-pet-image:hover {
  transform: scale(1.02);
}

.image-loading-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 20px;
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
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  will-change: transform, box-shadow;
}

.editable-chip:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
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
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: background-color, color, transform;
}

.info-row:hover {
  background: rgba(232, 125, 125, 0.05);
  color: #E87D7D;
  transform: translateX(4px);
}

.introduction-large {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #E87D7D;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: background-color, transform;
}

.introduction-large:hover {
  background: rgba(232, 125, 125, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.1);
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
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, box-shadow;
}

.representative-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.4);
}

.delete-btn {
  background: transparent !important;
  color: #E87D7D !important;
  border: 2px solid #E87D7D !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, box-shadow, background-color, color;
}

.delete-btn:hover {
  background: #E87D7D !important;
  color: white !important;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.4);
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

/* 삭제 확인 모달 - PetForm 스타일 적용 */
.delete-dialog {
  z-index: 2000;
}

.delete-dialog .v-overlay__content {
  width: 600px !important;
  max-width: 600px !important;
}

.delete-modal-card {
  width: 600px !important;
  min-width: 600px !important;
  max-width: 600px !important;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.delete-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.delete-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delete-title-section .text-h5 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.delete-content {
  padding: 48px 60px;
  text-align: center;
  background: white;
}

.delete-icon-container {
  margin-bottom: 32px;
}

.delete-icon-circle {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(244, 67, 54, 0.3);
  overflow: hidden;
}

.delete-pet-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.delete-message-section {
  margin-bottom: 32px;
}

.delete-pet-name {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  margin-top: 0;
}

.delete-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 24px;
}

.delete-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff3e0;
  color: #e65100;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid #ffcc02;
  font-size: 14px;
  font-weight: 600;
  max-width: 300px;
  margin: 0 auto;
}

.warning-icon {
  flex-shrink: 0;
}

.delete-actions {
  padding: 24px 32px 32px;
  display: flex;
  gap: 16px;
  justify-content: center;
  background: #f8f9fa;
}

.cancel-btn {
  min-width: 120px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.delete-btn {
  min-width: 120px;
  font-weight: 600;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .delete-modal-card {
    margin: 16px;
    border-radius: 16px;
  }
  
  .delete-header {
    padding: 20px 24px;
  }
  
  .delete-title-section .text-h5 {
    font-size: 20px;
  }
  
  .delete-content {
    padding: 32px 24px;
  }
  
  .delete-pet-name {
    font-size: 24px;
  }
  
  .delete-actions {
    padding: 20px 24px 24px;
    flex-direction: column;
  }
  
  .cancel-btn,
  .delete-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .delete-modal-card {
    margin: 8px;
    border-radius: 12px;
  }
  
  .delete-header {
    padding: 16px 20px;
  }
  
  .delete-content {
    padding: 24px 20px;
  }
  
  .delete-icon-circle {
    width: 80px;
    height: 80px;
  }
  
  .delete-pet-name {
    font-size: 20px;
  }
}
</style>
