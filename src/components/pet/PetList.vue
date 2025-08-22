<template>
  <div class="pet-list">
    <!-- 헤더 섹션 -->
    <div class="pet-list-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="mm-section-title">내 반려동물</h1>
          <p class="mm-section-subtitle">
            소중한 가족들을 관리하고 건강한 생활을 기록하세요
          </p>
        </div>
      </div>
      
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="showAddForm = true"
        class="add-pet-btn mm-btn mm-btn-primary"
        elevation="0"
        rounded="xl"
      >
        + 새 가족 추가
      </v-btn>
    </div>

    <!-- 통계 카드 섹션 -->
    <div class="stats-section">
      <div class="mm-grid mm-grid-cols-3">
        <div class="stat-card dog-card mm-card mm-hover-lift">
          <div class="stat-content">
            <div class="stat-icon">
              <v-icon size="40" color="success">mdi-dog</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ getDogCount() }}</div>
              <div class="stat-label">강아지</div>
              <div class="stat-change success">이번 달 +{{ getDogCount() }}</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card cat-card mm-card mm-hover-lift">
          <div class="stat-content">
            <div class="stat-icon">
              <v-icon size="40" color="info">mdi-cat</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ getCatCount() }}</div>
              <div class="stat-label">고양이</div>
              <div class="stat-change neutral">= 변화 없음</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card total-card mm-card mm-hover-lift">
          <div class="stat-content">
            <div class="stat-icon">
              <v-icon size="40" color="primary">mdi-paw-multiple</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ pets.length }}</div>
              <div class="stat-label">등록된 반려동물</div>
              <div class="stat-change primary">총 {{ pets.length }}마리</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 간격 조정 -->
    <div class="section-spacer"></div>

    <!-- 대표 반려동물 섹션 -->
    <div v-if="representativePet" class="representative-pet-section">
      <div class="mm-section-header">
        <h2 class="mm-section-title">대표 반려동물</h2>
        <p class="mm-section-subtitle">가장 소중한 가족을 대표로 설정해보세요</p>
      </div>
      
      <div class="representative-pet-card mm-card mm-hover-lift">
        <div class="representative-pet-content">
          <div class="pet-avatar-section">
            <div class="avatar-wrapper">
              <v-avatar :size="120" class="pet-avatar">
                <v-img
                  v-if="representativePet.url"
                  :src="representativePet.url"
                  :alt="representativePet.name"
                  cover
                  class="pet-image"
                />
                <v-icon v-else :size="60" :color="getSpeciesIconColor(representativePet.speciesId)" :icon="getSpeciesIcon(representativePet.speciesId)" />
              </v-avatar>
              
              <div class="representative-badge">
                <v-icon color="amber" size="20">mdi-star</v-icon>
                <span>대표</span>
              </div>
            </div>
          </div>
          
          <div class="pet-info-section">
            <h3 class="pet-name">{{ representativePet.name }}</h3>
            <div class="pet-details">
              <div class="detail-item">
                <v-icon :size="20" :color="getSpeciesIconColor(representativePet.speciesId)" :icon="getSpeciesIcon(representativePet.speciesId)" />
                <span>{{ getSpeciesName(representativePet.speciesId) }}</span>
              </div>
              <div class="detail-item">
                <v-icon size="20" color="orange">mdi-cake-variant</v-icon>
                <span>{{ representativePet.age }}살</span>
              </div>
              <div class="detail-item">
                <v-icon size="20" color="blue">mdi-gender-{{ representativePet.gender === 'MALE' ? 'male' : 'female' }}</v-icon>
                <span>{{ getGenderLabel(representativePet.gender) }}</span>
              </div>
            </div>
            
            <div class="pet-actions">
              <v-btn
                variant="outlined"
                color="primary"
                prepend-icon="mdi-pencil"
                @click="editPet(representativePet)"
                class="mm-btn"
                rounded="xl"
              >
                수정
              </v-btn>
              <v-btn
                variant="outlined"
                color="secondary"
                prepend-icon="mdi-eye"
                @click="viewPet(representativePet)"
                class="mm-btn"
                rounded="xl"
              >
                상세보기
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 반려동물 목록 -->
    <div class="pets-section">
      <div class="mm-section-header">
        <h2 class="mm-section-title">반려동물 목록</h2>
        <p class="mm-section-subtitle">등록된 모든 반려동물을 한눈에 확인하세요</p>
      </div>
      
      <div class="pets-grid mm-grid mm-grid-cols-4">
        <div
          v-for="pet in filteredPets"
          :key="pet.id"
          class="pet-card-wrapper"
        >
          <PetCard
            :pet="pet"
            :representative-pet="representativePet"
            @set-representative="setAsRepresentative"
            @edit="editPet"
            @delete="confirmDelete"
            @view-details="viewPet"
          />
        </div>
      </div>
      
      <!-- 빈 상태 -->
      <div v-if="filteredPets.length === 0 && !loading" class="empty-state">
        <div class="empty-content">
          <v-icon size="80" color="grey-lighten-1">mdi-paw-off</v-icon>
          <h3 class="empty-title">등록된 반려동물이 없습니다</h3>
          <p class="empty-description">
            첫 번째 반려동물을 등록해보세요!
          </p>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="showAddForm = true"
            class="mm-btn mm-btn-primary"
            rounded="xl"
          >
            반려동물 등록하기
          </v-btn>
        </div>
      </div>
    </div>

    <!-- 펫 추가/수정 폼 모달 -->
    <v-dialog
      v-model="showAddForm"
      max-width="800"
      persistent
      class="pet-form-dialog"
    >
      <v-card class="pet-form-card mm-card" rounded="xl">
        <v-card-title class="form-header">
          <div class="form-title">
            <v-icon size="32" color="primary" class="mr-3">mdi-paw</v-icon>
            <span class="text-h4">{{ editingPet ? '반려동물 수정' : '새 반려동물 등록' }}</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="large"
            @click="closeForm"
            class="close-btn"
          />
        </v-card-title>

        <v-card-text class="form-content">
          <PetForm
            :pet="editingPet"
            :is-edit="!!editingPet"
            @close="closeForm"
            @success="handleFormSuccess"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

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
          <strong>"{{ petToDelete?.name }}"</strong>을(를) 삭제하면 복구할 수 없습니다.
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
            class="mm-btn"
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
            class="mm-btn"
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

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/stores/pet'
import { useAuthStore } from '@/stores/auth'
import { useSnackbar } from '@/composables/useSnackbar'
import ModalDialog from '@/components/ui/organisms/ModalDialog.vue'
import PetCard from './PetCard.vue'
import PetForm from './PetForm.vue'

export default {
  name: 'PetList',
  components: {
    ModalDialog,
    PetCard,
    PetForm
  },
  
  setup() {
    const router = useRouter()
    const petStore = usePetStore()
    const authStore = useAuthStore()
    const { showSnackbar } = useSnackbar()
    
    // 반응형 데이터
    const showAddForm = ref(false)
    const showDeleteConfirm = ref(false)
    const editingPet = ref(null)
    const petToDelete = ref(null)
    
    // 계산된 속성
    const pets = computed(() => {
      const petsData = petStore.getPets || []
      console.log('=== PetList pets computed ===')
      console.log('petStore.getPets:', petStore.getPets)
      console.log('petsData:', petsData)
      
      if (petsData.length > 0) {
        console.log('첫 번째 펫:', petsData[0])
        console.log('첫 번째 펫 ID:', petsData[0]?.id)
      }
      
      return petsData
    })
    const representativePet = computed(() => {
      // authStore에서 마이페이지 정보 가져오기
      if (authStore.myPageInfo?.mainPetId) {
        // mainPetId로 해당 펫 찾기
        const mainPet = pets.value.find(pet => pet.id === authStore.myPageInfo.mainPetId)
        if (mainPet) {
          return mainPet
        }
      }
      // fallback: petStore에서 가져오기
      return petStore.getRepresentativePet
    })
    const loading = computed(() => petStore.isLoading)
    
    // 반려동물 목록 (필터링 없음)
    const filteredPets = computed(() => pets.value)
    
    // 유틸리티 함수들
    const getSpeciesName = (speciesId) => {
      if (speciesId) {
        const species = petStore.getSpeciesById(speciesId)
        return species ? species.species : '알 수 없음'
      }
      return '알 수 없음'
    }

    // 종류에 따른 아이콘 반환
    const getSpeciesIcon = (speciesId) => {
      if (speciesId) {
        const species = petStore.getSpeciesById(speciesId)
        if (species && species.petOrder === 'DOG') return 'mdi-dog'
        if (species && species.petOrder === 'CAT') return 'mdi-cat'
        return 'mdi-paw'
      }
      return 'mdi-paw'
    }

    // 종류에 따른 아이콘 색상 반환
    const getSpeciesIconColor = (speciesId) => {
      if (speciesId) {
        const species = petStore.getSpeciesById(speciesId)
        if (species && species.petOrder === 'DOG') return 'primary'
        if (species && species.petOrder === 'CAT') return 'secondary'
        return 'info'
      }
      return 'info'
    }

    const getGenderLabel = (gender) => {
      if (!gender) return '알 수 없음'
      return gender === 'MALE' ? '수컷' : '암컷'
    }

    // 펫 상세보기
    const viewPet = (pet) => {
      router.push(`/pets/${pet.id}`)
    }
    
    // 통계 카드용 함수들
    const getDogCount = () => {
      return pets.value.filter(pet => 
        pet.speciesId && petStore.getSpeciesById(pet.speciesId)?.petOrder === 'DOG'
      ).length
    }
    
    const getCatCount = () => {
      return pets.value.filter(pet => 
        pet.speciesId && petStore.getSpeciesById(pet.speciesId)?.petOrder === 'CAT'
      ).length
    }
    

    

    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR')
    }
    
    // 이벤트 핸들러
    const selectPet = (pet) => {
      console.log('=== selectPet 디버깅 ===')
      console.log('전체 펫 객체:', pet)
      console.log('펫 ID:', pet.id)
      console.log('펫 ID 타입:', typeof pet.id)
      console.log('펫 이름:', pet.name)
      
      // 백엔드에서 ID가 전송되지 않는 경우를 대비한 임시 처리
      let petId = pet.id
      if (!petId) {
        // pets 배열에서 해당 펫의 인덱스를 찾아 임시 ID 생성
        const petIndex = pets.value.findIndex(p => 
          p.name === pet.name && 
          p.speciesId === pet.speciesId &&
          p.gender === pet.gender
        )
        
        if (petIndex !== -1) {
          petId = `temp_${petIndex + 1}`
          console.log('⚠️ 백엔드에서 ID가 전송되지 않음. 임시 ID 생성:', petId)
          showSnackbar('백엔드에서 ID가 전송되지 않아 임시 ID를 사용합니다.', 'warning')
        } else {
          console.error('펫을 찾을 수 없습니다!')
          showSnackbar('펫을 찾을 수 없습니다.', 'error')
          return
        }
      }
      
      petStore.selectPet(pet)
      // 상세 페이지로 이동
      const url = `/pets/${petId}`
      console.log('이동할 URL:', url)
      router.push(url)
      console.log('=== selectPet 디버깅 끝 ===')
    }
    
    const editPet = (pet) => {
      if (!pet.id) {
        showSnackbar('ID가 없어 수정할 수 없습니다. 백엔드 관리자에게 문의하세요.', 'error')
        return
      }
      editingPet.value = pet
      showAddForm.value = true
    }
    
    const setAsRepresentative = async (pet) => {
      try {
        petStore.setRepresentativePet(pet)
        showSnackbar('대표 반려동물이 설정되었습니다.', 'success')
      } catch (error) {
        showSnackbar('대표 반려동물 설정에 실패했습니다.', 'error')
      }
    }
    
    const confirmDelete = (pet) => {
      if (!pet.id) {
        showSnackbar('ID가 없어 삭제할 수 없습니다. 백엔드 관리자에게 문의하세요.', 'error')
        return
      }
      petToDelete.value = pet
      showDeleteConfirm.value = true
    }
    
    const deletePet = async () => {
      if (!petToDelete.value) return
      
      try {
        const result = await petStore.deletePet(petToDelete.value.id)
        if (result.success) {
          showSnackbar('반려동물이 삭제되었습니다.', 'success')
          showDeleteConfirm.value = false
          petToDelete.value = null
        }
      } catch (error) {
        showSnackbar('반려동물 삭제에 실패했습니다.', 'error')
      }
    }
    
    const closeForm = () => {
      showAddForm.value = false
      editingPet.value = null
    }
    
    const handleFormSuccess = async (message) => {
      console.log('=== handleFormSuccess 시작 ===')
      console.log('성공 메시지:', message)
      
      showSnackbar(message, 'success')
      closeForm()
      
      // 펫 등록/수정 후 목록 새로고침
      console.log('폼 성공 후 목록 새로고침 시작')
      try {
        await petStore.fetchPets()
        console.log('목록 새로고침 완료')
        console.log('새로고침 후 펫 목록:', petStore.getPets)
      } catch (error) {
        console.error('목록 새로고침 실패:', error)
      }
      console.log('=== handleFormSuccess 완료 ===')
    }
    
    // 컴포넌트 마운트 시 데이터 로드
    onMounted(async () => {
      await petStore.fetchPets()
      await petStore.fetchSpecies()
      await authStore.fetchMyPageInfo() // 마이페이지 정보 가져오기
    })
    
    return {
      // 반응형 데이터
      showAddForm,
      showDeleteConfirm,
      editingPet,
      petToDelete,
      
      // 계산된 속성
      pets,
      representativePet,
      loading,
      filteredPets,
      
      // 메서드
      getGenderLabel,
      getSpeciesName,
      getSpeciesIcon,
      getSpeciesIconColor,
      formatDate,
      getDogCount,
      getCatCount,

      selectPet,
      editPet,
      setAsRepresentative,
      confirmDelete,
      deletePet,
      closeForm,
      handleFormSuccess,
      viewPet
    }
  }
}
</script>

<style scoped>
.pet-list {
  padding: var(--mm-space-8) var(--mm-space-6);
  max-width: 1400px;
  margin: 0 auto;
}

/* 헤더 섹션 */
.pet-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--mm-space-12);
  gap: var(--mm-space-8);
}

.header-content {
  flex: 1;
}

.title-section {
  max-width: 600px;
}

.add-pet-btn {
  white-space: nowrap;
  min-width: 180px;
}

/* 통계 카드 섹션 */
.stats-section {
  margin-bottom: var(--mm-space-12);
}

.stat-card {
  padding: var(--mm-space-8);
  height: 160px;
  display: flex;
  align-items: center;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--mm-space-6);
  width: 100%;
}

.stat-icon {
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: var(--mm-radius-2xl);
  padding: var(--mm-space-4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: var(--mm-text-4xl);
  font-weight: var(--mm-font-weight-black);
  color: var(--mm-on-surface);
  margin-bottom: var(--mm-space-2);
}

.stat-label {
  font-size: var(--mm-text-lg);
  font-weight: var(--mm-font-weight-semibold);
  color: var(--mm-on-surface);
  margin-bottom: var(--mm-space-3);
}

.stat-change {
  font-size: var(--mm-text-sm);
  font-weight: var(--mm-font-weight-medium);
  padding: var(--mm-space-1) var(--mm-space-3);
  border-radius: var(--mm-radius-full);
  display: inline-block;
}

.stat-change.success {
  background: rgba(var(--v-theme-success), 0.1);
  color: var(--v-theme-success);
}

.stat-change.neutral {
  background: rgba(var(--mm-on-surface-variant), 0.1);
  color: var(--mm-on-surface-variant);
}

.stat-change.primary {
  background: rgba(var(--v-theme-primary), 0.1);
  color: var(--v-theme-primary);
}

/* 섹션 간격 */
.section-spacer {
  height: var(--mm-space-12);
}

/* 대표 반려동물 섹션 */
.representative-pet-section {
  margin-bottom: var(--mm-space-12);
}

.representative-pet-card {
  padding: var(--mm-space-8);
}

.representative-pet-content {
  display: flex;
  align-items: center;
  gap: var(--mm-space-8);
}

.pet-avatar-section {
  position: relative;
}

.avatar-wrapper {
  position: relative;
}

.pet-avatar {
  border: 4px solid var(--mm-border);
  box-shadow: var(--mm-shadow-lg);
}

.representative-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  border-radius: var(--mm-radius-full);
  padding: var(--mm-space-2) var(--mm-space-3);
  font-size: var(--mm-text-sm);
  font-weight: var(--mm-font-weight-bold);
  display: flex;
  align-items: center;
  gap: var(--mm-space-1);
  box-shadow: var(--mm-shadow-md);
}

.pet-info-section {
  flex: 1;
}

.pet-name {
  font-size: var(--mm-text-3xl);
  font-weight: var(--mm-font-weight-bold);
  color: var(--mm-on-surface);
  margin-bottom: var(--mm-space-4);
}

.pet-details {
  display: flex;
  flex-direction: column;
  gap: var(--mm-space-3);
  margin-bottom: var(--mm-space-6);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--mm-space-3);
  font-size: var(--mm-text-lg);
  color: var(--mm-on-surface-variant);
}

.pet-actions {
  display: flex;
  gap: var(--mm-space-4);
}

/* 반려동물 목록 섹션 */
.pets-section {
  margin-bottom: var(--mm-space-12);
}

.pets-grid {
  margin-bottom: var(--mm-space-8);
}

.pet-card-wrapper {
  min-height: 200px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: var(--mm-space-16) var(--mm-space-8);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-title {
  font-size: var(--mm-text-2xl);
  font-weight: var(--mm-font-weight-bold);
  color: var(--mm-on-surface);
  margin: var(--mm-space-6) 0 var(--mm-space-4);
}

.empty-description {
  font-size: var(--mm-text-lg);
  color: var(--mm-on-surface-variant);
  margin-bottom: var(--mm-space-8);
}

/* 폼 모달 */
.pet-form-dialog {
  border-radius: var(--mm-radius-2xl);
}

.pet-form-card {
  border-radius: var(--mm-radius-2xl);
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mm-space-6) var(--mm-space-8);
  border-bottom: 1px solid var(--mm-border);
}

.form-title {
  display: flex;
  align-items: center;
}

.close-btn {
  padding: var(--mm-space-2);
}

.form-content {
  padding: var(--mm-space-8);
}

/* 삭제 확인 모달 */
.delete-confirm-content {
  text-align: center;
  padding: var(--mm-space-6);
}

.delete-icon-container {
  margin-bottom: var(--mm-space-6);
}

.delete-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mm-on-surface-variant);
  font-size: var(--mm-text-sm);
  font-weight: var(--mm-font-weight-medium);
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: var(--mm-space-4);
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .pets-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .pet-list {
    padding: var(--mm-space-6) var(--mm-space-4);
  }
  
  .pet-list-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--mm-space-6);
  }
  
  .add-pet-btn {
    align-self: flex-start;
  }
  
  .stats-section .mm-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .representative-pet-content {
    flex-direction: column;
    text-align: center;
    gap: var(--mm-space-6);
  }
  
  .pet-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .stats-section .mm-grid {
    grid-template-columns: 1fr;
  }
  
  .pets-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    height: 140px;
  }
  
  .stat-number {
    font-size: var(--mm-text-3xl);
  }
  
  .pet-name {
    font-size: var(--mm-text-2xl);
  }
  
  .form-header {
    flex-direction: column;
    gap: var(--mm-space-4);
    text-align: center;
  }
  
  .form-title {
    justify-content: center;
  }
  
  .close-btn {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .pet-list {
    padding: var(--mm-space-4) var(--mm-space-3);
  }
  
  .pet-list-header {
    margin-bottom: var(--mm-space-8);
  }
  
  .stats-section {
    margin-bottom: var(--mm-space-8);
  }
  
  .section-spacer {
    height: var(--mm-space-8);
  }
  
  .representative-pet-section {
    margin-bottom: var(--mm-space-8);
  }
  
  .pets-section {
    margin-bottom: var(--mm-space-8);
  }
  
  .stat-card {
    padding: var(--mm-space-6);
    height: 120px;
  }
  
  .stat-content {
    gap: var(--mm-space-4);
  }
  
  .stat-icon {
    padding: var(--mm-space-3);
  }
  
  .stat-number {
    font-size: var(--mm-text-2xl);
  }
  
  .stat-label {
    font-size: var(--mm-text-base);
  }
  
  .stat-change {
    font-size: var(--mm-text-xs);
  }
  
  .representative-pet-card {
    padding: var(--mm-space-6);
  }
  
  .pet-avatar {
    width: 100px !important;
    height: 100px !important;
  }
  
  .pet-name {
    font-size: var(--mm-text-xl);
  }
  
  .detail-item {
    font-size: var(--mm-text-base);
  }
  
  .pet-actions {
    flex-direction: column;
    gap: var(--mm-space-3);
  }
  
  .form-header {
    padding: var(--mm-space-4) var(--mm-space-6);
  }
  
  .form-content {
    padding: var(--mm-space-6);
  }
}
</style>
