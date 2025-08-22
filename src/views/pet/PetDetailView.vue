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
      <!-- 헤더 섹션 -->
      <div class="pet-hero-section">
        <div class="hero-background"></div>
        
        <div class="hero-content">
          <div class="pet-avatar-container">
            <div class="pet-avatar-wrapper">
              <v-avatar size="160" class="pet-avatar">
                <v-img
                  v-if="pet.url"
                  :src="pet.url"
                  :alt="pet.name"
                  cover
                  class="pet-image"
                />
                <div v-else class="avatar-placeholder">
                  <v-icon :size="80" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
                </div>
              </v-avatar>
              
              <!-- 대표 반려동물 배지 -->
              <div v-if="isRepresentative" class="representative-badge">
                <v-icon color="amber" size="20">mdi-star</v-icon>
                <span>대표</span>
              </div>
            </div>
          </div>
          
          <div class="pet-info-header">
            <h1 class="pet-name">{{ petName }}</h1>
            <div class="pet-species">
              <v-icon :size="24" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
              <span>{{ petSpecies }}</span>
            </div>
            <p class="pet-description">{{ petDescription }}</p>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 섹션 -->
      <div class="action-section">
        <div class="action-buttons">
          <v-btn
            v-if="!isRepresentative"
            variant="elevated"
            color="amber"
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
            color="primary"
            rounded="xl"
            size="large"
            prepend-icon="mdi-pencil"
            @click="isEditMode = true"
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

      <!-- 정보 카드 섹션 -->
      <div class="info-section">
        <h2 class="section-title">기본 정보</h2>
        
        <div class="info-cards">
          <div class="info-card">
            <div class="card-icon">
              <v-icon size="28" color="primary">mdi-account</v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-label">이름</h3>
              <p class="card-value">{{ pet.name }}</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">
              <v-icon :size="28" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
            </div>
            <div class="card-content">
              <h3 class="card-label">종류</h3>
              <p class="card-value">{{ pet.species || '알 수 없음' }}</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">
              <v-icon 
                size="28" 
                :color="pet.gender === 'MALE' ? 'blue' : 'red'"
              >
                mdi-gender-{{ pet.gender === 'MALE' ? 'male' : 'female' }}
              </v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-label">성별</h3>
              <p class="card-value">{{ getGenderLabel(pet.gender) }}</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">
              <v-icon size="28" color="orange">mdi-cake-variant</v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-label">나이</h3>
              <p class="card-value">{{ pet.age }}살</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">
              <v-icon size="28" color="teal">mdi-weight</v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-label">체중</h3>
              <p class="card-value">{{ pet.weight }}kg</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon">
              <v-icon size="28" color="indigo">mdi-calendar</v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-label">생일</h3>
              <p class="card-value">{{ formatBirthday(pet.birthday) }}</p>
            </div>
          </div>
          

        </div>
      </div>

      <!-- 하단 액션 버튼 -->
      <div class="bottom-actions">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-arrow-left"
          @click="$router.push('/pets')"
          class="back-btn"
          size="large"
          rounded="xl"
        >
          목록으로 돌아가기
        </v-btn>
      </div>
    </div>

    <!-- 펫 수정 폼 (수정 모드) -->
    <div v-else-if="pet && isEditMode" class="edit-mode-container">
      <v-card class="edit-card" elevation="8" rounded="xl">
        <v-card-title class="edit-header">
          <div class="edit-title">
            <v-icon size="32" color="primary" class="mr-3">mdi-pencil</v-icon>
            <span class="text-h4">{{ pet.name }} 수정</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="large"
            @click="exitEditMode"
            title="수정 취소"
            class="close-btn"
          />
        </v-card-title>

        <v-card-text class="edit-content">
          <PetForm
            :pet="pet"
            :is-edit="true"
            @close="exitEditMode"
            @success="handleEditSuccess"
          />
        </v-card-text>
      </v-card>
    </div>

    <!-- 펫을 찾을 수 없음 -->
    <div v-else-if="!loading" class="not-found-container">
      <v-card class="not-found-card" elevation="8" rounded="xl">
        <div class="not-found-content">
          <v-icon size="80" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <h3 class="text-h4 mb-3">펫을 찾을 수 없습니다</h3>
          <p class="text-body-1 text-grey-darken-1 mb-6">
            요청하신 펫 정보를 찾을 수 없습니다.
          </p>
          
          <div class="debug-info mb-6">
            <v-chip variant="outlined" class="ma-1" color="info">
              요청 ID: {{ petId }}
            </v-chip>
            <v-chip variant="outlined" class="ma-1" color="warning">
              펫 개수: {{ petStore.getPets.length }}
            </v-chip>
          </div>
          
          <div class="not-found-actions">
            <v-btn
              variant="outlined"
              color="info"
              @click="reloadPets"
              prepend-icon="mdi-refresh"
              size="large"
              rounded="xl"
            >
              다시 로드
            </v-btn>
            <v-btn
              color="primary"
              @click="$router.push('/pets')"
              prepend-icon="mdi-arrow-left"
              size="large"
              rounded="xl"
            >
              목록으로 돌아가기
            </v-btn>
          </div>
        </div>
      </v-card>
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
import PetForm from '@/components/pet/PetForm.vue'
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

// computed properties
const isRepresentative = computed(() => {
  if (!pet.value || !petStore.representativePet) return false
  return pet.value.id === petStore.representativePet.id
})

const petName = computed(() => pet.value?.name || '알 수 없음')
const petSpecies = computed(() => pet.value?.species || '알 수 없음')
const petDescription = computed(() => {
  if (!pet.value) return ''
  
  // 소개글이 있으면 소개글 표시, 없으면 기본 메시지
  if (pet.value.introduce && pet.value.introduce.trim() && pet.value.introduce !== '1') {
    return pet.value.introduce
  }
  
  // 기본 메시지 (더 따뜻하고 개성 있는 메시지)
  const defaultMessages = [
    `${pet.value.name}와(과) 함께하는 특별한 순간들을 기록해보세요`,
    `${pet.value.name}와(과)의 행복한 일상을 담아보세요`,
    `${pet.value.name}와(과) 함께하는 소중한 추억을 만들어가요`,
    `${pet.value.name}와(과)의 사랑스러운 모습을 기록해보세요`
  ]
  
  // 랜덤하게 기본 메시지 선택
  const randomIndex = Math.floor(Math.random() * defaultMessages.length)
  return defaultMessages[randomIndex]
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
const exitEditMode = () => {
  isEditMode.value = false
}

// 수정 성공 처리
const handleEditSuccess = (message) => {
  showMessage(message, 'success')
  exitEditMode()
  // 펫 정보 새로고침
  loadPet()
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

// 종류에 따른 아이콘 색상 반환 (백엔드 응답의 petOrder 직접 사용)
const getSpeciesIconColor = (petOrder) => {
  if (petOrder === '강아지') return 'primary'
  if (petOrder === '고양이') return 'secondary'
  return 'info'
}

const getGenderLabel = (gender) => {
  if (!gender) return '알 수 없음'
  return gender === 'MALE' ? '수컷' : '암컷'
}

const formatBirthday = (birthday) => {
  if (!birthday) return '알 수 없음'
  const date = new Date(birthday)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  console.log('PetDetailView 마운트됨, 펫 ID:', petId.value)
  
  // 펫 목록이 로드되지 않았다면 먼저 로드
  if (petStore.getPets.length === 0) {
    console.log('펫 목록이 비어있음, 펫 목록 로드 중...')
    await petStore.fetchPets()
  }
  
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
  background-color: var(--v-theme-surface);
  padding: 20px 0;
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
  background-color: var(--v-theme-surface);
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-text {
  font-size: 1.2rem;
  color: var(--v-theme-on-surface-variant);
}

.pet-detail-content {
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  box-sizing: border-box;
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
  background: linear-gradient(135deg, var(--mm-primary), var(--mm-secondary));
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--mm-primary), var(--mm-secondary));
  opacity: 0.9;
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
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
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
  background: rgba(var(--v-theme-primary), 0.9);
  color: white;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
}

.pet-info-header {
  text-align: center;
  color: white;
  padding: 0 20px;
}

.pet-name {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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
  color: var(--v-theme-on-surface-variant);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
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
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
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
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon .v-icon {
  font-size: 2.5rem;
  color: var(--v-theme-primary);
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
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.2);
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
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  gap: 16px;
}

.edit-title {
  display: flex;
  align-items: center;
}

.edit-title .v-icon {
  margin-right: 8px;
}

.close-btn {
  padding: 8px;
}

.edit-content {
  padding: 24px;
}

.not-found-container {
  padding: 0 20px 30px;
}

.not-found-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid var(--v-border-color);
  transition: all 0.3s ease;
}

.not-found-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.not-found-content {
  text-align: center;
  padding: 40px 20px;
}

.not-found-content .v-icon {
  font-size: 80px;
  color: var(--v-theme-error);
  margin-bottom: 20px;
}

.not-found-content .text-h4 {
  margin-bottom: 15px;
}

.not-found-content .text-body-1 {
  margin-bottom: 25px;
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

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
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
  .not-found-actions .v-btn {
    width: 100%;
    min-width: 200px;
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
  .not-found-content {
    padding: 20px 15px;
  }
  .not-found-content .text-h4 {
    font-size: 1.8rem;
  }
  .not-found-content .text-body-1 {
    font-size: 0.8rem;
  }
  .debug-info .v-chip {
    font-size: 0.8rem;
  }
  .not-found-actions .v-btn {
    font-size: 0.9rem;
    padding: 10px 20px;
  }
}

.v-card-title .v-icon {
  margin-right: 8px;
}


</style>
