<template>
  <div class="pet-detail-container">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular 
        indeterminate 
        size="80" 
        color="primary"
        class="loading-spinner"
      ></v-progress-circular>
      <p class="loading-text">반려동물 정보를 불러오는 중...</p>
    </div>

    <!-- 펫 정보 표시 (읽기 모드) -->
    <div v-else-if="pet && !isEditMode" class="pet-detail-content">
      <!-- 메인 정보 섹션 -->
      <div class="main-info-section">
        <!-- 좌측: 프로필 사진 -->
        <div class="profile-image-section">
          <v-avatar size="200" class="profile-avatar">
            <v-img
              v-if="pet.url"
              :src="pet.url"
              :alt="pet.name"
              cover
              class="pet-image"
            />
            <div v-else class="avatar-placeholder">
              <v-icon :size="100" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
            </div>
          </v-avatar>
          
          <!-- 대표 반려동물 배지 -->
          <div v-if="isRepresentative" class="representative-badge">
            <v-icon color="amber" size="24">mdi-star</v-icon>
            <span>대표</span>
          </div>
        </div>
        
        <!-- 우측: 기본 정보 -->
        <div class="basic-info-section">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-account</v-icon>
                이름
              </div>
              <div class="info-value">{{ pet.name }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-paw</v-icon>
                종류
              </div>
              <div class="info-value">{{ pet.species }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-gender-male</v-icon>
                성별
              </div>
              <div class="info-value">{{ getGenderLabel(pet.gender) }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-cake-variant</v-icon>
                나이
              </div>
              <div class="info-value">{{ pet.age }}살</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-weight</v-icon>
                체중
              </div>
              <div class="info-value">{{ pet.weight }}kg</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-calendar</v-icon>
                생일
              </div>
              <div class="info-value">{{ formatBirthday(pet.birthday) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 소개글 섹션 -->
      <div class="introduction-section">
        <h3 class="section-title">소개</h3>
        <div class="introduction-content">
          {{ pet.introduce || '소개글이 없습니다.' }}
        </div>
      </div>

      <!-- 액션 버튼 섹션 -->
      <div class="action-section">
        <div class="action-buttons">
          <v-btn
            v-if="!isRepresentative"
            variant="elevated"
            background="linear-gradient(135deg, #ec4899, #db2777)"
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
            color="#ec4899"
            rounded="xl"
            size="large"
            prepend-icon="mdi-pencil"
            @click="enterEditMode"
            class="action-btn"
          >
            수정
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

    <!-- 수정 모드 -->
    <div v-if="pet && isEditMode" class="pet-detail-content">
      <!-- 메인 정보 섹션 (수정 모드) -->
      <div class="main-info-section">
        <!-- 좌측: 프로필 사진 (수정 가능) -->
        <div class="profile-image-section">
          <v-avatar size="200" class="profile-avatar">
            <v-img
              v-if="editData.profileImageUrl || pet.url"
              :src="editData.profileImageUrl || pet.url"
              :alt="pet.name"
              cover
              class="pet-image"
            />
            <div v-else class="avatar-placeholder">
              <v-icon :size="100" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
            </div>
          </v-avatar>
          
          <!-- 이미지 업로드 버튼 -->
          <v-btn
            icon="mdi-camera"
            size="small"
            color="#ec4899"
            class="image-upload-btn"
            @click="triggerImageUpload"
          />
          
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            style="display: none"
          />
        </div>
        
        <!-- 우측: 기본 정보 (수정 가능) -->
        <div class="basic-info-section">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-account</v-icon>
                이름 *
              </div>
              <v-text-field
                v-model="editData.name"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="edit-input"
                required
              />
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-paw</v-icon>
                종류 *
              </div>
              <v-autocomplete
                v-model="editData.speciesId"
                :items="speciesOptions"
                item-title="species"
                item-value="speciesId"
                placeholder="종류를 검색하세요"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="edit-input"
                required
              />
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-gender-male</v-icon>
                성별 *
              </div>
              <v-select
                v-model="editData.gender"
                :items="genderOptions"
                item-title="title"
                item-value="value"
                placeholder="성별을 선택하세요"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="edit-input"
                required
              />
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-cake-variant</v-icon>
                나이 *
              </div>
              <v-text-field
                v-model.number="editData.age"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="edit-input"
                required
              />
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-weight</v-icon>
                체중 (kg) *
              </div>
              <v-text-field
                v-model.number="editData.weight"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="edit-input"
                suffix="kg"
                required
              />
            </div>
            
            <div class="info-item">
              <div class="info-label">
                <v-icon :size="20" color="#ec4899">mdi-calendar</v-icon>
                생일
              </div>
              <v-text-field
                v-model="editData.birthday"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="edit-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 소개글 섹션 (수정 가능) -->
      <div class="introduction-section">
        <h3 class="section-title">소개</h3>
        <v-textarea
          v-model="editData.introduce"
          variant="outlined"
          rows="4"
          auto-grow
          placeholder="반려동물에 대한 소개를 입력하세요"
          class="edit-textarea"
        />
      </div>

      <!-- 액션 버튼 섹션 (수정 모드) -->
      <div class="action-section">
        <div class="action-buttons">
          <v-btn
            v-if="!isRepresentative"
            variant="elevated"
            background="linear-gradient(135deg, #ec4899, #db2777)"
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
            prepend-icon="mdi-close"
            @click="cancelEdit"
            class="action-btn"
          >
            취소
          </v-btn>
          <v-btn
            :disabled="!isFormDirty"
            variant="elevated"
            background="linear-gradient(135deg, #ec4899, #db2777)"
            rounded="xl"
            size="large"
            prepend-icon="mdi-content-save"
            @click="saveEdit"
            class="action-btn"
          >
            수정
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
      :max-width="500"
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
const isEditMode = ref(false)
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('mdi-check-circle')

// 수정 모드 데이터
const editData = ref({
  name: '',
  speciesId: null,
  species: '',
  gender: '',
  age: null,
  weight: null,
  birthday: null,
  introduce: '',
  profileImageUrl: null,
  imageFile: null
})
const imageInput = ref(null)

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

// 수정 모드 computed
const isFormDirty = computed(() => {
  if (!pet.value) return false
  
  return (
    editData.value.name !== pet.value.name ||
    editData.value.species !== pet.value.species ||
    editData.value.gender !== pet.value.gender ||
    editData.value.age !== pet.value.age ||
    editData.value.weight !== pet.value.weight ||
    editData.value.birthday !== pet.value.birthday ||
    editData.value.introduce !== pet.value.introduce ||
    editData.value.imageFile !== null
  )
})

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
    }
    
    console.log('=== 펫 상세 로딩 디버깅 끝 ===')
  } catch (error) {
    console.error('펫 정보 로드 실패:', error)
    showMessage('펫 정보를 불러오는데 실패했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

// 수정 모드 종료


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

// 종류에 따른 아이콘 색상 반환 (백엔드 응답의 petOrder 직접 사용)
const getSpeciesIconColor = (petOrder) => {
  if (petOrder === '강아지') return 'primary'
  if (petOrder === '고양이') return 'secondary'
  return 'info'
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

// 수정 모드 메서드들
const enterEditMode = () => {
  console.log('🔄 수정 모드 진입')
  
  // 현재 펫 데이터를 수정 데이터로 복사
  Object.assign(editData.value, {
    name: pet.value.name || '',
    species: pet.value.species || '',
    gender: pet.value.gender || '',
    age: pet.value.age || null,
    weight: pet.value.weight || null,
    birthday: pet.value.birthday || null,
    introduce: pet.value.introduce || '',
    profileImageUrl: null,
    imageFile: null
  })
  
  // 종류 ID 찾기 (speciesOptions에서 현재 펫의 종류와 일치하는 것 찾기)
  if (speciesOptions.value.length > 0) {
    const matchingSpecies = speciesOptions.value.find(s => s.species === pet.value.species)
    if (matchingSpecies) {
      editData.value.speciesId = matchingSpecies.speciesId
      console.log('✅ 종류 ID 찾음:', matchingSpecies.speciesId, '종류:', matchingSpecies.species)
    } else {
      console.log('⚠️ 종류 ID를 찾을 수 없음:', pet.value.species)
    }
  }
  
  // birthday 형식 정규화 (YYYY-MM-DD로 변환)
  if (editData.value.birthday && typeof editData.value.birthday === 'string') {
    if (editData.value.birthday.includes('.')) {
      // '2025. 08. 28.' -> '2025-08-28'
      editData.value.birthday = editData.value.birthday.replace(/\./g, ' ').trim().replace(/\s+/g, '-')
    }
  }
  
  isEditMode.value = true
  console.log('✅ 수정 데이터 초기화 완료:', editData.value)
}

const cancelEdit = () => {
  console.log('🔄 수정 모드 취소')
  isEditMode.value = false
  
  // 수정 데이터 초기화
  Object.assign(editData.value, {
    name: '',
    species: '',
    gender: '',
    age: null,
    weight: null,
    birthday: null,
    introduce: '',
    profileImageUrl: null,
    imageFile: null
  })
  
  console.log('✅ 수정 모드 취소 완료')
}

const saveEdit = async () => {
  if (!isFormDirty.value) {
    showMessage('변경된 내용이 없습니다.', 'warning')
    return
  }
  
  console.log('🔄 수정 저장 시작')
  
  try {
    // 수정할 데이터 준비
    const updateData = {
      name: editData.value.name,
      species: editData.value.species,
      gender: editData.value.gender,
      age: editData.value.age,
      weight: editData.value.weight,
      birthday: editData.value.birthday,
      introduce: editData.value.introduce
    }
    
    // birthday 형식 정규화 (YYYY-MM-DD로 변환)
    if (updateData.birthday && typeof updateData.birthday === 'string') {
      if (updateData.birthday.includes('.')) {
        // '2025. 08. 28.' -> '2025-08-28'
        updateData.birthday = updateData.birthday.replace(/\./g, ' ').trim().replace(/\s+/g, '-')
      }
    }
    
    // 이미지가 변경된 경우 FormData 사용
    let payload = updateData
    if (editData.value.imageFile) {
      const form = new FormData()
      Object.keys(updateData).forEach(key => {
        if (updateData[key] != null) {
          form.append(key, updateData[key])
        }
      })
      form.append('profileImage', editData.value.imageFile)
      payload = form
    }
    
    // API 호출
    const result = await petStore.updatePet(pet.value.id, payload)
    
    if (result.success) {
      showMessage('반려동물 정보가 수정되었습니다.', 'success')
      
      // 수정 모드 종료
      isEditMode.value = false
      
      // 펫 데이터 새로고침
      await loadPet()
    } else {
      showMessage(result.message || '수정에 실패했습니다.', 'error')
    }
  } catch (error) {
    console.error('수정 저장 실패:', error)
    showMessage('수정 중 오류가 발생했습니다.', 'error')
  }
}

// 이미지 업로드 관련 메서드들
const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showMessage('이미지 크기는 5MB 이하로 선택해주세요.', 'error')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      showMessage('이미지 파일만 업로드할 수 있습니다.', 'error')
      return
    }
    
    // 미리보기 URL 생성
    if (editData.value.profileImageUrl) {
      URL.revokeObjectURL(editData.value.profileImageUrl)
    }
    
    editData.value.profileImageUrl = URL.createObjectURL(file)
    editData.value.imageFile = file
    
    showMessage('이미지가 선택되었습니다.', 'success')
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
  background-color: #fafafa;
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
  overflow: hidden;
  position: relative;
}

/* 히어로 섹션 */
.pet-hero-section {
  position: relative;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  opacity: 1;
  z-index: -1;
}

.hero-content {
  position: relative;
  z-index: 1;
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
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 50%;
  border: 1px solid var(--v-border-color);
}

.representative-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.pet-info-header {
  text-align: center;
  color: #374151;
  padding: 0 20px;
}

.pet-name {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 10px;
  color: #111827;
}

.pet-species {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--v-theme-on-surface-variant);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.pet-description {
  font-size: 1.1rem;
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
  letter-spacing: 0.5px;
  padding: 12px 24px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.primary-action {
  background: linear-gradient(135deg, var(--v-theme-primary), var(--v-theme-secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.3);
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
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
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
  gap: 50px;
  margin-bottom: 50px;
  align-items: flex-start;
  padding: 20px 0;
}

.profile-image-section {
  position: relative;
  flex-shrink: 0;
  padding: 20px;
}

.profile-avatar {
  border: 6px solid rgba(255, 139, 139, 0.2);
  box-shadow: 0 20px 40px rgba(255, 139, 139, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 25px 50px rgba(255, 139, 139, 0.4);
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
  gap: 20px;
}

.info-item {
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-item:hover {
  border-color: #E87D7D;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.15);
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.introduction-section {
  background: white;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
}

.introduction-content {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  text-align: center;
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
  padding: 12px 18px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 120px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  background: white;
  color: #6c757d;
}

.action-btn:hover {
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.15);
}

.primary-action {
  background: #E87D7D !important;
  color: white !important;
  border-color: #E87D7D !important;
}

.primary-action:hover {
  background: #d66b6b !important;
  border-color: #d66b6b !important;
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


</style>

