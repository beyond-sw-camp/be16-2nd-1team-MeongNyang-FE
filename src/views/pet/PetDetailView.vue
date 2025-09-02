<template>
  <div class="pet-detail-container">
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
      <!-- 메인 정보 섹션 -->
      <div class="main-info-section">
        <!-- 좌측: 프로필 사진 -->
        <div class="profile-image-section">
          <v-avatar size="200" class="profile-avatar" @click="startEditImage">
                <v-img
                  v-if="pet.url"
                  :src="pet.url"
                  :alt="pet.name"
                  cover
                  class="pet-image"
                />
                <div v-else class="avatar-placeholder">
              <v-icon :size="100" color="#E87D7D" :icon="getSpeciesIcon(pet.petOrder)" />
                </div>
              </v-avatar>
              
              <!-- 대표 반려동물 배지 -->
              <div v-if="isRepresentative" class="representative-badge">
            <v-icon color="amber" size="24">mdi-star</v-icon>
                <span>대표</span>
              </div>
          
          <!-- 이미지 업로드 입력 (숨김) -->
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageChange"
          />
          </div>
          
        <!-- 우측: 기본 정보 -->
        <div class="basic-info-section">
          <div class="info-grid">
            <div class="info-item" @click="!editingFields.name && startEditField('name')">
              <div class="info-label">
                이름
                <v-icon v-if="!editingFields.name" size="16" color="#E87D7D">mdi-pencil</v-icon>
            </div>
              <div v-if="!editingFields.name" class="info-value">{{ pet.name }}</div>
              <div v-else class="edit-field">
                <v-text-field
                  v-model="editData.name"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="inline-edit-input"
                  @click.stop
                  @keyup.enter="saveField('name')"
                />
                <div class="edit-actions">
                  <v-btn
                    size="x-small"
                    color="success"
                    variant="flat"
                    @click.stop="saveField('name')"
                    class="save-btn"
                  >
                    저장
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="outlined"
                    @click.stop="cancelEditField('name')"
                    class="cancel-btn"
                  >
                    취소
                  </v-btn>
          </div>
        </div>
      </div>

            <div class="info-item" @click="!editingFields.species && startEditField('species')">
              <div class="info-label">
                종류
                <v-icon v-if="!editingFields.species" size="16" color="#E87D7D">mdi-pencil</v-icon>
              </div>
              <div v-if="!editingFields.species" class="info-value">{{ pet.species }}</div>
              <div v-else class="edit-field">
                <v-autocomplete
                  v-model="editData.speciesId"
                  :items="speciesOptions"
                  item-title="species"
                  item-value="speciesId"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="inline-edit-input"
                  @click.stop
                  @update:model-value="onSpeciesChange"
                />
                <div class="edit-actions">
          <v-btn
                     size="x-small"
                     color="success"
                     variant="flat"
                     @click.stop="saveField('species')"
                     class="save-btn"
                   >
                     저장
          </v-btn>
          <v-btn
                     size="small"
                     color="error"
            variant="outlined"
                     @click.stop="cancelEditField('species')"
                     class="cancel-btn"
                   >
                     취소
          </v-btn>
                </div>
              </div>
            </div>
            
            <div class="info-item" @click="!editingFields.gender && startEditField('gender')">
              <div class="info-label">
                성별
                <v-icon v-if="!editingFields.gender" size="16" color="#E87D7D">mdi-pencil</v-icon>
              </div>
              <div v-if="!editingFields.gender" class="info-value">{{ getGenderLabel(pet.gender) }}</div>
              <div v-else class="edit-field">
                <v-select
                  v-model="editData.gender"
                  :items="genderOptions"
                  item-title="title"
                  item-value="value"
            variant="outlined"
                  density="compact"
                  hide-details
                  class="inline-edit-input"
                  @click.stop
                />
                <div class="edit-actions">
                                     <v-btn
                     size="x-small"
                     color="success"
                     variant="flat"
                     @click.stop="saveField('gender')"
                     class="save-btn"
                   >
                     저장
                   </v-btn>
                   <v-btn
                     size="x-small"
            color="error"
                     variant="outlined"
                     @click.stop="cancelEditField('gender')"
                     class="cancel-btn"
                   >
                     취소
          </v-btn>
                </div>
        </div>
      </div>

            <div class="info-item" @click="!editingFields.age && !pet.birthday && startEditField('age')">
              <div class="info-label">
                나이
                <v-icon v-if="!editingFields.age && !pet.birthday" size="16" color="#E87D7D">mdi-pencil</v-icon>
                <v-icon v-else-if="pet.birthday" size="16" color="#9CA3AF" title="생일이 있으면 나이가 자동으로 계산됩니다">mdi-calculator</v-icon>
            </div>
              <div v-if="!editingFields.age" class="info-value">
                {{ pet.age }}살
                <span v-if="pet.birthday" class="age-hint">(생일 기준 자동 계산)</span>
            </div>
              <div v-else class="edit-field">
                <v-text-field
                  v-model.number="editData.age"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="inline-edit-input"
                  @click.stop
                  @keyup.enter="saveField('age')"
                />
                <div class="edit-actions">
                  <v-btn
                    size="x-small"
                    color="success"
                    variant="flat"
                    @click.stop="saveField('age')"
                    class="save-btn"
                  >
                    저장
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="outlined"
                    @click.stop="cancelEditField('age')"
                    class="cancel-btn"
                  >
                    취소
                  </v-btn>
          </div>
            </div>
          </div>
          
            <div class="info-item" @click="!editingFields.weight && startEditField('weight')">
              <div class="info-label">
                체중
                <v-icon v-if="!editingFields.weight" size="16" color="#E87D7D">mdi-pencil</v-icon>
              </div>
              <div v-if="!editingFields.weight" class="info-value">{{ pet.weight }}kg</div>
              <div v-else class="edit-field">
                <v-text-field
                  v-model.number="editData.weight"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  suffix="kg"
                  class="inline-edit-input"
                  @click.stop
                  @keyup.enter="saveField('weight')"
                />
                <div class="edit-actions">
                  <v-btn
                    size="x-small"
                    color="success"
                    variant="flat"
                    @click.stop="saveField('weight')"
                    class="save-btn"
                  >
                    저장
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="outlined"
                    @click.stop="cancelEditField('weight')"
                    class="cancel-btn"
                  >
                    취소
                  </v-btn>
            </div>
            </div>
          </div>
          
            <div class="info-item" @click="!editingFields.birthday && startEditField('birthday')">
              <div class="info-label">
                생일
                <v-icon v-if="!editingFields.birthday" size="16" color="#E87D7D">mdi-pencil</v-icon>
            </div>
              <div v-if="!editingFields.birthday" class="info-value">{{ formatBirthday(pet.birthday) }}</div>
              <div v-else class="edit-field">
                <div class="birthday-input-container">
                  <v-text-field
                    :model-value="formatDateForInput(editData.birthday)"
                    placeholder="생일을 선택하세요"
                    readonly
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="inline-edit-input"
                    prepend-inner-icon="mdi-calendar"
                    @click.stop="showBirthdayPicker = true"
                  />
          </div>
          
                <!-- 생일 선택기 모달 -->
                <v-dialog v-model="showBirthdayPicker" max-width="400">
                  <v-card>
                    <v-card-title class="text-h6">생일 선택</v-card-title>
                    <v-card-text>
                      <v-date-picker
                        v-model="editData.birthday"
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
                
                <div class="edit-actions">
                  <v-btn
                    size="x-small"
                    color="success"
                    variant="flat"
                    @click.stop="saveField('birthday')"
                    class="save-btn"
                  >
                    저장
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="outlined"
                    @click.stop="cancelEditField('birthday')"
                    class="cancel-btn"
                  >
                    취소
                  </v-btn>
            </div>
            </div>
          </div>
            </div>
            </div>
          </div>
          
      <!-- 소개글 섹션 -->
      <div class="introduction-section" @click="!editingFields.introduce && startEditField('introduce')">
        <h3 class="section-title">
          소개
          <v-icon v-if="!editingFields.introduce" size="16" color="#E87D7D" class="ml-2">mdi-pencil</v-icon>
        </h3>
        <div v-if="!editingFields.introduce" class="introduction-content">
          {{ pet.introduce || '소개글이 없습니다.' }}
        </div>
        <div v-else class="edit-field">
          <v-textarea
            v-model="editData.introduce"
            variant="outlined"
            rows="4"
            auto-grow
            placeholder="반려동물에 대한 소개를 입력하세요"
            class="inline-edit-textarea"
            @click.stop
            @keyup.enter="saveField('introduce')"
          />
          <div class="edit-actions">
        <v-btn
               size="x-small"
               color="success"
               variant="flat"
               @click.stop="saveField('introduce')"
               class="save-btn"
             >
               저장
             </v-btn>
             <v-btn
               size="x-small"
               color="error"
          variant="outlined"
               @click.stop="cancelEditField('introduce')"
               class="cancel-btn"
             >
               취소
        </v-btn>
      </div>
    </div>
    </div>

      <!-- 액션 버튼 섹션 -->
      <div class="action-section">
        <div class="action-buttons">
            <v-btn
            v-if="!isRepresentative"
            variant="elevated"
            color="#E87D7D"
              rounded="xl"
            size="large"
            prepend-icon="mdi-star"
            @click="setAsRepresentative"
            class="action-btn primary-action"
            >
            대표로 설정
            </v-btn>

            <v-btn
            variant="outlined"
            color="error"
              rounded="xl"
            size="large"
            prepend-icon="mdi-delete"
            @click="showDeleteConfirm = true"
            class="action-btn"
            >
            삭제
            </v-btn>
          </div>
        </div>
    </div>



    <!-- 삭제 확인 모달 -->
    <ModalDialog
      v-model="showDeleteConfirm"
      title="반려동물 삭제"
      :max-width="1000"
    >
      <div class="delete-confirm-content">
        <div class="delete-icon-container">
          <v-icon size="64" color="error">mdi-delete-alert</v-icon>
        </div>
        <h3 class="text-h5 mb-3">정말 삭제하시겠습니까?</h3>
        <p class="text-body-1 text-grey-darken-1 mb-4">
          <strong>"{{ pet?.name }}"</strong>을(를) 삭제하면 복구할 수 없습니다.
        </p>
        <div class="delete-warning">
          <v-icon size="20" color="warning" class="mr-2">mdi-alert</v-icon>
          <span>이 작업은 되돌릴 수 없습니다.</span>
        </div>
      </div>
      
      <template #actions>
        <div class="delete-actions">
          <v-btn
            variant="outlined"
            @click="showDeleteConfirm = false"
            size="large"
            rounded="xl"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            @click="deletePet"
            :loading="deleting"
            size="large"
            rounded="xl"
            prepend-icon="mdi-delete"
          >
            삭제
          </v-btn>
        </div>
      </template>
    </ModalDialog>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePetStore } from '@/stores/pet'

import ModalDialog from '@/components/ui/organisms/ModalDialog.vue'

const route = useRoute()
const router = useRouter()
const petStore = usePetStore()

// 반응형 데이터
const pet = ref(null)
const loading = ref(true)

const showDeleteConfirm = ref(false)
const deleting = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('mdi-check-circle')

// 인라인 편집 상태
const editingFields = ref({
  name: false,
  species: false,
  gender: false,
  age: false,
  weight: false,
  birthday: false,
  introduce: false
})

// 편집 데이터
const editData = ref({
  name: '',
  speciesId: null,
  species: '',
  gender: '',
  age: null,
  weight: null,
  birthday: null,
  introduce: ''
})

// 종류 옵션
const speciesOptions = computed(() => {
  const species = petStore.getSpecies
  
  if (species && species.length > 0) {
    // 백엔드 데이터 구조에 맞게 매핑
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

// computed properties
const isRepresentative = computed(() => {
  if (!pet.value || !petStore.representativePet) return false
  return pet.value.id === petStore.representativePet.id
})



// 계산된 속성
const petId = computed(() => route.params.id)



// 펫 정보 로드
const loadPet = async () => {
  if (!petId.value) {
    console.error('펫 ID가 없습니다:', petId.value)
    return
  }
  
  try {
    loading.value = true
    console.log('=== 펫 상세 로딩 디버깅 ===')
    console.log('요청된 펫 ID:', petId.value)
    console.log('펫 ID 타입:', typeof petId.value)
    
    // 펫 목록이 없다면 먼저 로드
    if (petStore.getPets.length === 0) {
      console.log('펫 목록이 비어있음, 펫 목록을 다시 로드합니다...')
      await petStore.fetchPets()
    }
    
    const allPets = petStore.getPets
    console.log('전체 펫 목록:', allPets)
    console.log('펫 목록 개수:', allPets.length)
    
    // ID 매칭 (문자열과 숫자 모두 고려)
    pet.value = allPets.find(p => {
      console.log(`펫 ID 비교: ${p.id} (${typeof p.id}) vs ${petId.value} (${typeof petId.value})`)
      return p.id == petId.value || String(p.id) === String(petId.value)
    })
    
    console.log('찾은 펫:', pet.value)
    
    if (!pet.value) {
      console.error('펫을 찾을 수 없습니다!')
      console.log('사용 가능한 펫 ID들:', allPets.map(p => p.id))
      console.log('요청된 펫 ID:', petId.value)
      throw new Error(`ID ${petId.value}인 펫을 찾을 수 없습니다.`)
    }
    
    console.log('=== 펫 상세 로딩 디버깅 끝 ===')
  } catch (error) {
    console.error('펫 정보 로드 실패:', error)
    showMessage('펫 정보를 불러오는데 실패했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

// 인라인 편집 함수들
const startEditField = (fieldName) => {
  console.log(`🔄 ${fieldName} 항목 편집 시작`)
  
  // 편집 데이터 초기화
  if (fieldName === 'species') {
    // 종류의 경우 speciesId 찾기
    const foundSpecies = speciesOptions.value.find(s => s.species === pet.value.species)
    editData.value.speciesId = foundSpecies ? foundSpecies.speciesId : null
    console.log('🐕 species 편집 시작:', { 
      currentSpecies: pet.value.species, 
      foundSpeciesId: editData.value.speciesId,
      speciesOptions: speciesOptions.value
    })
  } else if (fieldName === 'birthday') {
    // 생일의 경우 날짜 형식 변환
    editData.value[fieldName] = pet.value[fieldName] ? formatDateForInput(pet.value[fieldName]) : ''
    
    // 생일이 있으면 나이도 함께 초기화 (자동 계산을 위해)
    if (pet.value.birthday) {
      editData.value.age = pet.value.age
    }
    
    console.log('🎂 생일 편집 시작:', { 
      original: pet.value[fieldName], 
      formatted: editData.value[fieldName],
      currentAge: editData.value.age
    })
  } else {
    editData.value[fieldName] = pet.value[fieldName]
  }
  
  editingFields.value[fieldName] = true
      // species 필드의 경우 speciesId를 출력
    if (fieldName === 'species') {
      console.log(`${fieldName} 편집 데이터 (speciesId):`, editData.value.speciesId)
    } else {
      console.log(`${fieldName} 편집 데이터:`, editData.value[fieldName])
    }
}

const cancelEditField = (fieldName) => {
  console.log(`❌ ${fieldName} 항목 편집 취소`)
  editData.value[fieldName] = pet.value[fieldName]
  editingFields.value[fieldName] = false
}

                const saveField = async (fieldName) => {
                  console.log(`💾 ${fieldName} 항목 저장 시작`)
                  console.log('🔍 pet.value:', pet.value)
                  console.log('🔍 pet.value.id:', pet.value?.id)
                  console.log('🔍 pet.value.id 타입:', typeof pet.value?.id)
                  
                  try {
                    // petId가 유효한지 확인하고, 유효하지 않다면 다시 로드 시도
                    if (!pet.value?.id) {
                      console.log('펫 데이터가 유효하지 않음, 다시 로드 시도...')
                      await loadPet()
                      
                      if (!pet.value?.id) {
                        throw new Error('펫 ID를 가져올 수 없습니다. 페이지를 새로고침해주세요.')
                      }
                    }
                    
                    let fieldValue = editData.value[fieldName]
                    
                    // 기존 펫 데이터를 기반으로 수정
                    console.log('🔍 speciesOptions:', speciesOptions.value)
                    console.log('🔍 pet.value.species:', pet.value.species)
                    
                    const speciesId = pet.value.speciesId || getSpeciesIdFromSpecies(pet.value.species)
                    console.log('🔍 speciesId 계산:', { 
                      original: pet.value.speciesId, 
                      species: pet.value.species, 
                      calculated: speciesId,
                      speciesOptions: speciesOptions.value
                    })
                    
                    const existingPetData = {
                      name: pet.value.name,
                      speciesId: speciesId,
                      gender: pet.value.gender,
                      age: pet.value.age,
                      weight: pet.value.weight,
                      birthday: pet.value.birthday,
                      introduce: pet.value.introduce
                    }
                    
                    // 특별한 처리가 필요한 필드들
                    if (fieldName === 'species') {
                      // species 필드 수정 시 speciesId를 전송 (등록 로직과 동일하게)
                      fieldValue = editData.value.speciesId
                      // existingPetData의 speciesId도 업데이트
                      existingPetData.speciesId = editData.value.speciesId
                      console.log('🐕 species 필드 수정 (speciesId 전송):', { 
                        speciesId: editData.value.speciesId, 
                        originalSpecies: pet.value.species,
                        fieldValue: fieldValue,
                        updatedExistingPetData: existingPetData
                      })
                    } else if (fieldName === 'birthday' && fieldValue) {
                      if (typeof fieldValue === 'string' && fieldValue.includes('.')) {
                        fieldValue = fieldValue.replace(/\./g, ' ').trim().replace(/\s+/g, '-')
                      }
                      
                      // 생일이 변경되면 나이도 함께 업데이트
                      if (editData.value.age !== undefined) {
                        existingPetData.age = editData.value.age
                        console.log('🎂 생일 변경으로 나이 함께 업데이트:', {
                          birthday: fieldValue,
                          age: editData.value.age
                        })
                      }
                    }
                    
                    console.log('🔍 existingPetData:', existingPetData)
                    
                    const result = await petStore.updateField(pet.value.id, fieldName, fieldValue, existingPetData)
                    
                    if (result.success) {
                      editingFields.value[fieldName] = false
                      await loadPet()
                      showMessage(`${fieldName}이(가) 성공적으로 수정되었습니다.`, 'success')
                      console.log(`✅ ${fieldName} 항목 저장 완료`)
                    } else {
                      showMessage(result.message || `${fieldName} 수정에 실패했습니다.`, 'error')
                    }
                  } catch (error) {
                    console.error(`${fieldName} 항목 저장 실패:`, error)
                    showMessage(`${fieldName} 수정에 실패했습니다.`, 'error')
                  }
                }

// 종류 이름으로 speciesId 찾기
const getSpeciesIdFromSpecies = (speciesName) => {
  if (!speciesName || !speciesOptions.value) return null
  
  const species = speciesOptions.value.find(s => s.species === speciesName)
  return species ? species.speciesId : null
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
    console.log('🎂 생일 변경으로 나이 자동 계산:', { 
      birthday: editData.value.birthday, 
      calculatedAge: age 
    })
    
    // 생일이 변경되면 나이도 함께 저장
    setTimeout(() => {
      saveField('birthday')
    }, 100)
  }
}

// 종류 변경 시 디버깅
const onSpeciesChange = (newSpeciesId) => {
  console.log('🔄 종류 변경 감지:', { 
    newSpeciesId: newSpeciesId,
    editDataSpeciesId: editData.value.speciesId,
    speciesOptions: speciesOptions.value
  })
  
  // 선택된 종의 정보 찾기
  const selectedSpecies = speciesOptions.value.find(s => s.speciesId === newSpeciesId)
  if (selectedSpecies) {
    console.log('✅ 선택된 종 정보:', selectedSpecies)
  }
}

// 날짜 포맷 함수
const formatDateForInput = (dateStr) => {
  if (!dateStr) return ''
  
  try {
    const date = new Date(dateStr)
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 날짜:', dateStr)
      return ''
    }
    
    // YYYY-MM-DD 형식으로 변환
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    const formattedDate = `${year}-${month}-${day}`
    console.log('📅 날짜 형식 변환:', { original: dateStr, formatted: formattedDate })
    
    return formattedDate
  } catch (error) {
    console.error('날짜 형식 변환 실패:', error)
    return ''
  }
}

// 이미지 편집 관련
const imageInput = ref(null)
const imageFile = ref(null)
const imagePreviewUrl = ref(null)
const showImageConfirm = ref(false)

// 생일 선택기 관련
const showBirthdayPicker = ref(false)
const maxDate = computed(() => new Date().toISOString().split('T')[0])
const minDate = computed(() => new Date(1900, 0, 1).toISOString().split('T')[0])

const startEditImage = () => {
  imageInput.value?.click()
}

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage('파일 크기는 5MB 이하여야 합니다.', 'error')
        return
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        showMessage('이미지 파일만 선택할 수 있습니다.', 'error')
        return
      }
      
      imageFile.value = file
      imagePreviewUrl.value = URL.createObjectURL(file)
      
      // 이미지 변경 확인 모달 표시
      showImageConfirm.value = true
    }
  }

  const saveImage = async () => {
    if (!imageFile.value) return
    
    try {
      // 백엔드가 기대하는 multipart/form-data 구조로 전송
      const formData = new FormData()
      
      // PetRegisterReq를 JSON Blob으로 추가 (기존 펫 데이터 유지)
      const petData = {
        name: pet.value.name,
        speciesId: pet.value.speciesId || getSpeciesIdFromSpecies(pet.value.species),
        gender: pet.value.gender,
        age: pet.value.age,
        weight: pet.value.weight,
        birthday: pet.value.birthday,
        introduce: pet.value.introduce
      }
      
      const petDataBlob = new Blob([JSON.stringify(petData)], {
        type: 'application/json'
      })
      formData.append('PetRegisterReq', petDataBlob)
      
      // 새 이미지 파일 추가
      formData.append('url', imageFile.value)
      
      console.log('📷 이미지 업데이트 FormData 생성:', {
        petData: petData,
        imageFile: imageFile.value.name,
        imageSize: imageFile.value.size
      })
      
      const result = await petStore.updatePetImage(pet.value.id, formData)
      
      if (result.success) {
        // 이미지 업로드 성공 시 바로 화면에 반영
        if (imagePreviewUrl.value) {
          // 미리보기 URL을 실제 이미지 URL로 교체
          pet.value.url = imagePreviewUrl.value
          console.log('🖼️ 이미지 즉시 업데이트됨:', imagePreviewUrl.value)
        }
        
        // 초기화
        imageFile.value = null
        imagePreviewUrl.value = null
        showImageConfirm.value = false
        if (imageInput.value) {
          imageInput.value.value = ''
        }
        
        showMessage('프로필 사진이 성공적으로 변경되었습니다.', 'success')
      } else {
        // 실패 시 에러 메시지 표시
        showMessage(result.message || '프로필 사진 변경에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      showMessage('프로필 사진 변경에 실패했습니다.', 'error')
    }
  }
  
  const cancelImageChange = () => {
    // 이미지 변경 취소 시 원본으로 복원
    imageFile.value = null
    imagePreviewUrl.value = null
    showImageConfirm.value = false
    if (imageInput.value) {
      imageInput.value.value = ''
    }
    console.log('🖼️ 이미지 변경 취소됨')
}

// 대표 반려동물 설정
const setAsRepresentative = async () => {
  if (!pet.value) return
  
  try {
    const result = await petStore.setRepresentativePet(pet.value)
    
    if (result.success) {
      showMessage('대표 반려동물이 설정되었습니다.', 'success')
      // 펫 정보 새로고침
      loadPet()
    } else {
      showMessage(result.message || '대표 반려동물 설정에 실패했습니다.', 'error')
    }
  } catch (error) {
    console.error('대표 반려동물 설정 실패:', error)
    showMessage('대표 반려동물 설정에 실패했습니다.', 'error')
  }
}

// 펫 삭제
const deletePet = async () => {
  if (!pet.value) return
  
  try {
    deleting.value = true
    const result = await petStore.deletePet(pet.value.id)
    
    if (result.success) {
      showMessage('반려동물이 삭제되었습니다.', 'success')
      // 목록 페이지로 이동
      setTimeout(() => {
        router.push('/pets')
      }, 1500)
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

// 종류에 따른 아이콘 반환 (백엔드 응답의 petOrder 직접 사용)
const getSpeciesIcon = (petOrder) => {
  if (petOrder === '강아지') return 'mdi-dog'
  if (petOrder === '고양이') return 'mdi-cat'
  return 'mdi-paw'
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
  
  // 이미 'YYYY. MM. DD.' 형식인 경우 그대로 반환
  if (typeof birthday === 'string' && birthday.includes('.')) {
    return birthday
  }
  
  // Date 객체로 변환하여 형식화
  try {
  const date = new Date(birthday)
    if (isNaN(date.getTime())) return '알 수 없음'
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`
  } catch (error) {
    return '알 수 없음'
  }
}







// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  console.log('PetDetailView 마운트됨, 펫 ID:', petId.value)
  
  // 펫 목록이 로드되지 않았다면 먼저 로드
  if (petStore.getPets.length === 0) {
    console.log('펫 목록이 비어있음, 펫 목록 로드 중...')
    await petStore.fetchPets()
  }
  
  // 종류 데이터 로드
  await petStore.fetchSpecies()
  
  await loadPet()
  
  // 5초 후에도 펫을 찾지 못했다면 목록으로 리다이렉트 (선택사항)
  // setTimeout(() => {
  //   if (!pet.value && !loading.value) {
  //     console.log('펫을 찾지 못해 목록으로 리다이렉트합니다.')
  //     router.push('/pets')
  //   }
  // }, 5000)
})
</script>

<style scoped>
.pet-detail-container {
  min-height: 100vh;
  background: var(--v-theme-surface-light);
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background-color: var(--v-theme-surface-light);
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  position: relative;
}

/* 히어로 섹션 */
.pet-hero-section {
  position: relative;
  height: 400px;
  border-radius: 20px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: transparent;
}

.pet-avatar-container {
  position: relative;
  margin-bottom: 20px;
}

.pet-avatar-wrapper {
  position: relative;
}

.pet-avatar {
  border: 5px solid white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.avatar-placeholder {
  height: 160px;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  border: 2px dashed #d1d5db;
}

.representative-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  padding: 10px 16px;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 10;
  border: none;
}

.pet-info-header {
  text-align: center;
  color: #1f2937;
  padding: 0 20px;
}

.pet-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #1f2937;
}

.pet-species {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #6b7280;
}

.pet-description {
  font-size: 1rem;
  margin-top: 15px;
  color: #6b7280;
}

.action-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  padding: 12px 24px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.primary-action {
  background: #E87D7D;
  color: white;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4);

}

.info-section {
  padding: 0 20px 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--v-theme-on-surface);
  margin-bottom: 25px;
  text-align: center;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, var(--v-theme-primary), var(--v-theme-secondary));
  border-radius: 2px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  padding: 0 10px;
}

.info-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.card-icon {
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon .v-icon {
  font-size: 2.5rem;
  color: #6366f1;
}

.card-content {
  flex-grow: 1;
}

.card-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--v-theme-on-surface-variant);
  margin-bottom: 5px;
}

.card-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--v-theme-on-surface);
}

.bottom-actions {
  padding: 0 20px 30px;
  text-align: center;
}

.back-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  padding: 12px 24px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.edit-mode-container {
  padding: 0 20px 30px;
}

.edit-card {
  background: white;
  border: 1px solid var(--v-border-color);
  transition: all 0.3s ease;
}

.edit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.edit-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: none;
  background: transparent;
}

.edit-title {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.edit-title .text-h4 {
  color: #374151;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  padding: 8px;
}

.edit-content {
  padding: 24px;
}



/* 새로운 레이아웃 스타일 */
.main-info-section {
  display: flex;
  gap: 60px;
  margin-bottom: 60px;
  align-items: flex-start;
  padding: 30px 0;
  position: relative;
}

.profile-image-section {
  position: relative;
  flex-shrink: 0;
  padding: 30px;
  background: white;
  border-radius: 24px;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.profile-avatar {
  border: 4px solid #e9ecef;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.profile-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}



.image-upload-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.basic-info-section {
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  position: relative;
}

.info-item {
  background: white;
  padding: 28px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  cursor: pointer;
}

.info-item:hover {
  border-color: #E87D7D;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.info-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-weight: 700;
  color: #1f2937;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.info-label:hover {
  color: #E87D7D;
}

.info-label .v-icon {
  color: #E87D7D;
  transition: all 0.3s ease;
}

.info-label:hover .v-icon {
  transform: scale(1.1);
}

.info-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  transition: all 0.3s ease;
}

.info-item:hover .info-value {
  color: #E87D7D;
}

.introduction-section {
  background: white;
  padding: 36px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.introduction-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #E87D7D;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-title:hover {
  color: #E87D7D;
}

.introduction-content {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  min-height: 60px;
}

.action-section {
  padding: 20px 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  padding: 14px 20px;
  font-size: 0.95rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 130px;
  border-radius: 16px;
  border: 2px solid #e9ecef;
  background: white;
  color: #6b7280;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(232, 125, 125, 0.1), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover {
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(232, 125, 125, 0.2);
  background: #f9fafb;
}

.action-btn:hover::before {
  left: 100%;
}

.primary-action {
  background: #E87D7D !important;
  color: white !important;
  border-color: #E87D7D !important;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3) !important;
  position: relative;
  overflow: hidden;
}

.primary-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.primary-action:hover {
  background: #FF6B6B !important;
  border-color: #FF6B6B !important;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 25px rgba(232, 125, 125, 0.4) !important;
}

.primary-action:hover::before {
  left: 100%;
}

/* 수정 모드 스타일 */
.edit-input {
  width: 100%;
}

.edit-textarea {
  width: 100%;
}

/* 반응형 */
@media (max-width: 768px) {
  .main-info-section {
    flex-direction: column;
    gap: 30px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
  }
}

.debug-info {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
}

.debug-info .v-chip {
  font-size: 0.9rem;
}



.delete-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.delete-icon-container {
  margin-bottom: 20px;
}

.delete-icon-container .v-icon {
  font-size: 64px;
  color: var(--v-theme-error);
}

.delete-confirm-content .text-h5 {
  margin-bottom: 15px;
}

.delete-confirm-content .text-body-1 {
  margin-bottom: 20px;
}

.delete-warning {
  display: flex;
  align-items: center;
  color: var(--v-theme-on-surface-variant);
  font-size: 0.9rem;
  font-weight: 500;
}

.delete-warning .v-icon {
  font-size: 20px;
  color: var(--v-theme-warning);
  margin-right: 8px;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.delete-actions .v-btn {
  padding: 12px 24px;
  font-size: 1rem;
}

.v-snackbar {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .pet-detail-content {
    padding: 0 15px;
  }
  .info-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 960px) {
  .pet-hero-section {
    height: 350px;
  }
  .pet-name {
    font-size: 3rem;
  }
  .pet-species {
    font-size: 1.3rem;
  }
  .pet-description {
    font-size: 1rem;
  }
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  .action-btn {
    width: 100%;
    min-width: 200px;
  }
  .info-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .info-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .card-icon {
    width: 100%;
    justify-content: flex-start;
  }
  .card-icon .v-icon {
    font-size: 2rem;
  }
  .card-content {
    text-align: left;
  }
  .card-label {
    font-size: 0.9rem;
  }
  .card-value {
    font-size: 1rem;
  }
  .bottom-actions {
    padding: 0 15px 20px;
  }
  .back-btn {
    width: 100%;
    min-width: 200px;
  }
  .edit-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .edit-title {
    justify-content: center;
  }
  .edit-title .v-icon {
    margin-right: 0;
  }
  .close-btn {
    align-self: flex-end;
  }
  .edit-content {
    padding: 15px;
  }
  .not-found-content {
    padding: 30px 15px;
  }
  .debug-info {
    flex-direction: column;
    gap: 10px;
  }
  .debug-info .v-chip {
    width: 100%;
    justify-content: center;
  }
  .not-found-actions {
    flex-direction: column;
    gap: 10px;
  }

}

@media (max-width: 768px) {
  .pet-hero-section {
    height: 300px;
  }
  .pet-name {
    font-size: 2.5rem;
  }
  .pet-species {
    font-size: 1.1rem;
  }
  .pet-description {
    font-size: 0.9rem;
  }
  .representative-badge {
    top: 5px;
    right: 5px;
    padding: 4px 8px;
    font-size: 0.6rem;
  }
  .representative-badge .v-icon {
    font-size: 14px;
  }
  .representative-badge span {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .pet-hero-section {
    height: 250px;
  }
  .pet-name {
    font-size: 2rem;
  }
  .pet-species {
    font-size: 1rem;
  }
  .pet-description {
    font-size: 0.8rem;
  }
  .action-btn {
    font-size: 0.9rem;
    padding: 10px 20px;
  }
  .primary-action {
    font-size: 0.9rem;
  }
  .info-card {
    padding: 15px;
  }
  .card-icon .v-icon {
    font-size: 2rem;
  }
  .card-label {
    font-size: 0.8rem;
  }
  .card-value {
    font-size: 0.9rem;
  }
  .back-btn {
    font-size: 0.9rem;
    padding: 10px 20px;
  }
  .edit-header {
    padding: 15px;
  }
  .edit-title {
    font-size: 1.8rem;
  }
  .edit-title .v-icon {
    font-size: 2rem;
  }
  .close-btn {
    padding: 6px;
  }
  .edit-content {
    padding: 10px;
  }
}

.v-card-title .v-icon {
  margin-right: 8px;
}

/* 인라인 편집 스타일 */
.info-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 8px;
}

.info-item:hover {
  background-color: rgba(232, 125, 125, 0.05);
}

.info-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.edit-field {
  margin-top: 8px;
}

.inline-edit-input {
  margin-bottom: 8px;
}

.inline-edit-textarea {
  margin-bottom: 8px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
  align-items: center;
}

.save-btn {
  min-width: 60px;
    font-size: 0.8rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 25px;
  background: #E87D7D;
  color: white;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
  border: none;
}

.save-btn:hover {
  background: #FF6B6B;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.cancel-btn {
  min-width: 60px;
    font-size: 0.8rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 25px;
  border: 2px solid #E87D7D;
  color: #E87D7D;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
}

.cancel-btn:hover {
  background: #E87D7D;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.age-hint {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-left: 8px;
  font-style: italic;
}

.birthday-input-container {
  position: relative;
  width: 100%;
}

.introduction-section {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 16px;
}

.introduction-section:hover {
  background-color: rgba(232, 125, 125, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
}

</style>


