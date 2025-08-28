<template>
  <div class="pet-list">
    <!-- 모던한 헤더 -->
    <div class="header-section">
      <div class="container">
        <div class="header-content">
          <div>
            <h1 class="page-title">반려동물</h1>
            <p class="page-subtitle">우리 가족을 관리하고 추억을 기록하세요</p>
          </div>
          <v-btn
            color="#E87D7D"
            variant="flat"
            prepend-icon="mdi-plus"
            @click="showAddForm = true"
            size="large"
            rounded="xl"
            class="add-button"
          >
            반려동물 추가
          </v-btn>
        </div>
      </div>
    </div>

    <!-- 깔끔한 통계 -->
    <div class="stats-section">
      <div class="container">
        <div class="stats-overview">
          <div class="stat-item">
            <div class="stat-icon">
              <v-icon>mdi-dog</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ getDogCount() }}</div>
              <div class="stat-label">강아지</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <v-icon>mdi-cat</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ getCatCount() }}</div>
              <div class="stat-label">고양이</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <v-icon>mdi-paw</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ pets.length }}</div>
              <div class="stat-label">전체</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 새로운 레이아웃: 좌측 대표동물 + 우측 다른 동물들 -->
    <div class="pets-section">
      <div class="container">
        <div v-if="pets.length > 0" class="pets-layout">
          <!-- 좌측: 대표동물 (전체 정보) -->
          <div class="representative-pet-section">
            <div v-if="representativePet" class="representative-pet-card">
              <div class="representative-header">
                <h3 class="representative-title">대표 반려동물</h3>
                <div class="representative-badge">
                  <v-icon color="amber" size="20">mdi-star</v-icon>
                  <span>대표</span>
                </div>
              </div>
              
              <!-- 대표동물 전체 정보 -->
              <div class="representative-content">
                <div class="pet-image-large">
                  <v-img
                    v-if="representativePet.url && representativePet.url.trim() !== ''"
                    :src="representativePet.url"
                    :alt="representativePet.name"
                    class="large-pet-image"
                    aspect-ratio="1"
                    cover
                  >
                    <template v-slot:error>
                      <div class="large-image-placeholder">
                        <v-icon :size="80" :color="getSpeciesIconColor(representativePet.petOrder)" :icon="getSpeciesIcon(representativePet.petOrder)" />
                      </div>
                    </template>
                  </v-img>
                  <div v-else class="large-image-placeholder">
                    <v-icon :size="80" :color="getSpeciesIconColor(representativePet.petOrder)" :icon="getSpeciesIcon(representativePet.petOrder)" />
                  </div>
                </div>
                
                <div class="pet-details-large">
                  <h2 class="pet-name-large">{{ representativePet.name }}</h2>
                  
                  <!-- 기본 정보 태그들 -->
                  <div class="pet-tags-large">
                    <v-chip 
                      size="medium" 
                      variant="tonal" 
                      :color="getSpeciesIconColor(representativePet.petOrder)"
                      :prepend-icon="getSpeciesIcon(representativePet.petOrder)"
                    >
                      {{ representativePet.species || '알 수 없음' }}
                    </v-chip>
                    
                    <v-chip 
                      size="medium" 
                      variant="tonal" 
                      :color="getGenderColor(representativePet.gender)"
                      :prepend-icon="getGenderIcon(representativePet.gender)"
                    >
                      {{ getGenderLabel(representativePet.gender) }}
                    </v-chip>
                    
                    <v-chip 
                      size="medium" 
                      variant="tonal" 
                      color="orange"
                      prepend-icon="mdi-cake-variant"
                    >
                      {{ representativePet.age }}살
                    </v-chip>
                  </div>
                  
                  <!-- 추가 정보 -->
                  <div class="additional-info-large">
                    <div class="info-row">
                      <v-icon size="20" color="grey-darken-1">mdi-weight</v-icon>
                      <span>{{ representativePet.weight || '알 수 없음' }}kg</span>
                    </div>
                    <div class="info-row">
                      <v-icon size="20" color="grey-darken-1">mdi-calendar</v-icon>
                      <span>{{ formatBirthday(representativePet.birthday) }}</span>
                    </div>
                  </div>
                  
                  <!-- 소개글 -->
                  <div v-if="representativePet.introduce" class="introduction-large">
                    <h4 class="introduction-title">소개글</h4>
                    <p class="introduction-text">{{ representativePet.introduce }}</p>
                  </div>
                  
                  <!-- 액션 버튼들 -->
                  <div class="action-buttons-large">
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="large"
                      color="grey-darken-1"
                      @click="$emit('view-details', representativePet)"
                      density="comfortable"
                    />
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="large"
                      color="error"
                      @click="$emit('delete', representativePet)"
                      density="comfortable"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 대표동물이 없을 때 -->
            <div v-else class="no-representative">
              <div class="no-representative-icon">
                <v-icon size="80" color="grey-lighten-1">mdi-star-outline</v-icon>
              </div>
              <h3 class="no-representative-title">대표 반려동물을 설정해보세요</h3>
              <p class="no-representative-description">
                가장 소중한 가족 구성원을 대표로 설정하면 좌측에 전체 정보가 표시됩니다
              </p>
            </div>
          </div>
          
          <!-- 우측: 다른 동물들 (간단한 PetCard) -->
          <div class="other-pets-section">
            <h3 class="other-pets-title">등록된 다른 동물들</h3>
            <div class="other-pets-grid">
              <div
                v-for="pet in otherPets"
                :key="`pet-${pet.id}-${pet.url || 'no-image'}`"
                class="pet-card-wrapper"
              >
                <PetCard
                  :pet="pet"
                  :representative-pet="representativePet"
                  @set-representative="setAsRepresentative"
                  @view-details="viewPet"
                  @delete="confirmDelete"
                />
              </div>
            </div>
            
            <!-- 다른 동물이 없을 때 -->
            <div v-if="otherPets.length === 0" class="no-other-pets">
              <div class="no-other-pets-icon">
                <v-icon size="60" color="grey-lighten-1">mdi-paw-outline</v-icon>
              </div>
              <p class="no-other-pets-text">등록된 다른 반려동물이 없습니다</p>
            </div>
          </div>
        </div>
        
        <!-- 빈 상태 -->
        <div v-else-if="!loading" class="empty-state">
          <div class="empty-icon">
            <v-icon size="80" color="grey-lighten-1">mdi-paw-outline</v-icon>
          </div>
          <h3 class="empty-title">반려동물을 등록해보세요</h3>
          <p class="empty-description">
            소중한 가족 구성원을 등록하고 추억을 기록해보세요
          </p>
          <v-btn
            color="#E87D7D"
            variant="flat"
            prepend-icon="mdi-plus"
            @click="showAddForm = true"
            size="large"
            rounded="xl"
          >
            첫 반려동물 등록
          </v-btn>
        </div>
      </div>
    </div>

    <!-- 나머지 모달들은 기존과 동일 -->
    <!-- 펫 추가/수정 폼 모달 -->
    <v-dialog
      v-model="showAddForm"
      max-width="800"
      class="pet-form-dialog"
      @click:outside="closeForm"
    >
      <v-card class="pet-form-card" rounded="xl">
        <v-card-title class="form-header">
          <div class="form-title">
            <span class="text-h4">새 반려동물 등록</span>
          </div>
        </v-card-title>
        <v-card-text class="form-content">
          <PetForm
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
            color="grey-darken-1"
            @click="showDeleteConfirm = false"
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
        </div>
      </template>
    </ModalDialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/stores/pet'
import { useSnackbar } from '@/composables/useSnackbar'
import PetCard from './PetCard.vue'
import PetForm from './PetForm.vue'
import ModalDialog from '@/components/ui/organisms/ModalDialog.vue'

export default {
  name: 'PetList',
  components: {
    PetCard,
    PetForm,
    ModalDialog
  },
  emits: ['set-representative', 'view-details', 'delete'],
  setup() {
    const router = useRouter()
    const petStore = usePetStore()
    const { showSnackbar } = useSnackbar()
    
    const showAddForm = ref(false)
    const showDeleteConfirm = ref(false)
    const petToDelete = ref(null)
    const deleting = ref(false)
    
    // 반려동물 데이터
    const pets = computed(() => petStore.pets)
    const loading = computed(() => petStore.loading)
    
    // 대표 반려동물 (PetStore에서 관리)
    const representativePet = computed(() => petStore.representativePet)
    
    // 대표가 아닌 다른 동물들
    const otherPets = computed(() => {
      if (!representativePet.value) return pets.value
      return pets.value.filter(pet => pet.id !== representativePet.value.id)
    })
    
    // 강아지/고양이 수 계산
    const getDogCount = () => pets.value.filter(pet => pet.petOrder === 'DOG').length
    const getCatCount = () => pets.value.filter(pet => pet.petOrder === 'CAT').length
    
    // 생일 포맷팅
    const formatBirthday = (birthday) => {
      if (!birthday) return '알 수 없음'
      try {
        const date = new Date(birthday)
        if (isNaN(date.getTime())) return '알 수 없음'
        return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`
      } catch (error) {
        return '알 수 없음'
      }
    }
    
    // 종 아이콘 관련 함수들
    const getSpeciesIcon = (petOrder) => {
      const icons = {
        DOG: 'mdi-dog',
        CAT: 'mdi-cat',
        OTHER: 'mdi-paw'
      }
      return icons[petOrder] || 'mdi-paw'
    }
    
    const getSpeciesIconColor = (petOrder) => {
      const colors = {
        DOG: '#E87D7D',
        CAT: '#FF6B6B',
        OTHER: '#6B7280'
      }
      return colors[petOrder] || '#6B7280'
    }
    
    const getGenderColor = (gender) => {
      const colors = {
        MALE: '#3B82F6',
        FEMALE: '#EC4899',
        NEUTERED: '#6B7280'
      }
      return colors[gender] || '#6B7280'
    }
    
    const getGenderIcon = (gender) => {
      const icons = {
        MALE: 'mdi-gender-male',
        FEMALE: 'mdi-gender-female',
        NEUTERED: 'mdi-gender-male-female'
      }
      return icons[gender] || 'mdi-gender-male-female'
    }
    
    const getGenderLabel = (gender) => {
      const labels = {
        MALE: '수컷',
        FEMALE: '암컷',
        NEUTERED: '중성'
      }
      return labels[gender] || '알 수 없음'
    }
    
    // 대표 반려동물 설정
    const setAsRepresentative = async (pet) => {
      try {
        await petStore.setRepresentativePet(pet)
        showSnackbar('대표 반려동물이 변경되었습니다.', 'success')
      } catch (error) {
        showSnackbar('대표 반려동물 설정에 실패했습니다.', 'error')
      }
    }
    
    // 반려동물 상세보기
    const viewPet = (pet) => {
      router.push(`/pets/${pet.id}`)
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
        await petStore.deletePet(petToDelete.value.id)
        showSnackbar('반려동물이 삭제되었습니다.', 'success')
        showDeleteConfirm.value = false
        petToDelete.value = null
      } catch (error) {
        showSnackbar('반려동물 삭제에 실패했습니다.', 'error')
      } finally {
        deleting.value = false
      }
    }
    
    // 폼 관련
    const closeForm = () => {
      showAddForm.value = false
    }
    
    const handleFormSuccess = () => {
      showAddForm.value = false
      showSnackbar('반려동물이 성공적으로 등록되었습니다.', 'success')
    }
    
    // 컴포넌트 마운트 시 반려동물 데이터 로드
    onMounted(async () => {
      console.log('🔄 PetList 컴포넌트 마운트 시작')
      
      if (pets.value.length === 0) {
        console.log('📥 반려동물 데이터 로드 시작')
        await petStore.fetchPets()
        console.log('📥 반려동물 데이터 로드 완료')
      }
      
      console.log('🔍 현재 상태 확인:')
      console.log('- pets.value.length:', pets.value.length)
      console.log('- representativePet.value:', representativePet.value)
      console.log('- pets.value:', pets.value)
      
      // 대표 반려동물이 설정되지 않은 경우 첫 번째 펫을 대표로 설정
      if (!representativePet.value && pets.value.length > 0) {
        console.log('⭐ 첫 번째 펫을 대표로 설정')
        await petStore.setRepresentativePet(pets.value[0])
        console.log('⭐ 대표 반려동물 설정 완료')
      }
      
      console.log('🔄 PetList 컴포넌트 마운트 완료')
    })
    
    return {
      showAddForm,
      showDeleteConfirm,
      petToDelete,
      deleting,
      pets,
      loading,
      representativePet,
      otherPets,
      getDogCount,
      getCatCount,
      formatBirthday,
      getSpeciesIcon,
      getSpeciesIconColor,
      getGenderColor,
      getGenderIcon,
      getGenderLabel,
      setAsRepresentative,
      viewPet,
      confirmDelete,
      deletePet,
      closeForm,
      handleFormSuccess
    }
  }
}
</script>

<style scoped>
.pet-list {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 헤더 섹션 */
.header-section {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.add-button {
  background: #E87D7D !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

/* 통계 섹션 */
.stats-section {
  background: white;
  padding: 30px 0;
  border-bottom: 1px solid #e5e7eb;
}

.stats-overview {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .v-icon {
  color: white;
  font-size: 28px;
}

.stat-info {
  text-align: left;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 4px;
}

/* 반려동물 레이아웃 */
.pets-section {
  padding: 40px 0;
}

.pets-layout {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 상단: 대표동물 섹션 */
.representative-pet-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 3px solid #E87D7D;
  width: 100%;
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
}

.introduction-large {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #E87D7D;
}

.introduction-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.introduction-text {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.action-buttons-large {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

/* 대표동물이 없을 때 */
.no-representative {
  text-align: center;
  padding: 60px 20px;
}

.no-representative-icon {
  margin-bottom: 20px;
}

.no-representative-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.no-representative-description {
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
}

/* 하단: 다른 동물들 섹션 */
.other-pets-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.other-pets-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.other-pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.pet-card-wrapper {
  width: 100%;
}

/* 다른 동물이 없을 때 */
.no-other-pets {
  text-align: center;
  padding: 40px 20px;
}

.no-other-pets-icon {
  margin-bottom: 16px;
}

.no-other-pets-text {
  color: #9ca3af;
  margin: 0;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.empty-description {
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .other-pets-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
  
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
  .header-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .stats-overview {
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }
  
  .representative-pet-section,
  .other-pets-section {
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

/* 모달 스타일 */
.pet-form-dialog {
  z-index: 1000;
}

.pet-form-card {
  border-radius: 20px;
}

.form-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
}

.form-title {
  text-align: center;
}

.form-content {
  padding: 24px;
}

/* 삭제 확인 모달 */
.delete-confirm-content {
  text-align: center;
  padding: 20px 0;
}

.delete-icon-container {
  margin-bottom: 20px;
}

.delete-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fef3c7;
  color: #92400e;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.delete-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>

