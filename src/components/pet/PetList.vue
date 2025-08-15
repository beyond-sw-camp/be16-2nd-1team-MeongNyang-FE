<template>
  <div class="pet-list">
    <!-- 헤더 섹션 -->
    <div class="pet-list-header">
      <div class="header-content">
        <h2 class="text-h4 mb-2">내 반려동물</h2>
        <p class="text-body-1 text-grey-darken-1">
          {{ pets.length }}마리의 반려동물이 있습니다
        </p>
      </div>
      
      <BaseButton
        color="primary"
        prepend-icon="mdi-plus"
        @click="showAddForm = true"
      >
        반려동물 추가
      </BaseButton>
    </div>

    <!-- 검색 및 필터 섹션 -->
    <div class="search-filter-section">
      <v-row>
        <v-col cols="12" md="6">
          <FormField
            v-model="searchQuery"
            label="반려동물 검색"
            placeholder="이름으로 검색하세요"
            prepend-icon="mdi-magnify"
            clearable
          />
        </v-col>
        
        <v-col cols="12" md="3">
          <FormField
            v-model="filterGender"
            label="성별 필터"
            prepend-icon="mdi-gender-male-female"
          >
            <template #default>
              <v-select
                v-model="filterGender"
                :items="genderOptions"
                item-title="label"
                item-value="value"
                placeholder="성별 선택"
                clearable
                hide-details
              />
            </template>
          </FormField>
        </v-col>
        
        <v-col cols="12" md="3">
          <FormField
            v-model="filterSpecies"
            label="종류 필터"
            prepend-icon="mdi-dog"
          >
            <template #default>
              <v-select
                v-model="filterSpecies"
                :items="speciesOptions"
                item-title="label"
                item-value="value"
                placeholder="종류 선택"
                clearable
                hide-details
              />
            </template>
          </FormField>
        </v-col>
      </v-row>
    </div>

    <!-- 대표 반려동물 섹션 -->
    <div v-if="representativePet" class="representative-pet-section">
      <v-card class="representative-pet-card" color="primary" variant="tonal">
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-star</v-icon>
          대표 반려동물
        </v-card-title>
        
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar :size="60" class="mr-3">
              <v-img
                v-if="representativePet.url"
                :src="representativePet.url"
                :alt="representativePet.name"
              />
              <v-icon v-else size="32" color="white">mdi-paw</v-icon>
            </v-avatar>
            
            <div class="flex-grow-1">
              <h3 class="text-h6 mb-1">{{ representativePet.name }}</h3>
              <p class="text-body-2 mb-0">
                {{ getSpeciesName(representativePet.speciesId) }} • 
                {{ representativePet.age }}살 • 
                {{ getGenderLabel(representativePet.gender) }}
              </p>
            </div>
            
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="editPet(representativePet)"
              aria-label="대표 반려동물 수정"
            />
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- 반려동물 목록 -->
    <div class="pets-grid">
      <v-row>
        <v-col
          v-for="pet in filteredPets"
          :key="pet.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <BaseCard
            :clickable="true"
            @click="selectPet(pet)"
            class="pet-card"
            :class="{ 'representative': pet.id === representativePet?.id }"
          >
            <template #title>
              <div class="d-flex align-center justify-space-between">
                <span class="text-h6">{{ pet.name }}</span>
                <div class="pet-actions">
                  <v-btn
                    v-if="pet.id !== representativePet?.id"
                    icon="mdi-star-outline"
                    variant="text"
                    size="small"
                    @click.stop="setAsRepresentative(pet)"
                    aria-label="대표 반려동물로 설정"
                  />
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click.stop="editPet(pet)"
                    aria-label="반려동물 수정"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click.stop="confirmDelete(pet)"
                    aria-label="반려동물 삭제"
                  />
                </div>
              </div>
            </template>
            
            <template #default>
              <div class="pet-card-content">
                <div class="text-center mb-3">
                  <v-avatar :size="80" class="mb-2">
                    <v-img
                      v-if="pet.url"
                      :src="pet.url"
                      :alt="pet.name"
                    />
                    <v-icon v-else size="40" color="grey">mdi-paw</v-icon>
                  </v-avatar>
                </div>
                
                <div class="pet-info">
                  <div class="info-row">
                    <v-icon size="16" color="primary">mdi-dog</v-icon>
                    <span>{{ getSpeciesName(pet.speciesId) }}</span>
                  </div>
                  
                  <div class="info-row">
                    <v-icon size="16" color="primary">mdi-gender-male-female</v-icon>
                    <span>{{ getGenderLabel(pet.gender) }}</span>
                  </div>
                  
                  <div class="info-row">
                    <v-icon size="16" color="primary">mdi-calendar</v-icon>
                    <span>{{ pet.age }}살</span>
                  </div>
                  
                  <div class="info-row">
                    <v-icon size="16" color="primary">mdi-weight</v-icon>
                    <span>{{ pet.weight }}kg</span>
                  </div>
                  
                  <div v-if="pet.birthday" class="info-row">
                    <v-icon size="16" color="primary">mdi-cake-variant</v-icon>
                    <span>{{ formatDate(pet.birthday) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </BaseCard>
        </v-col>
      </v-row>
    </div>

    <!-- 빈 상태 -->
    <div v-if="!loading && filteredPets.length === 0" class="empty-state">
      <v-card class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-paw</v-icon>
        <h3 class="text-h5 mb-2">반려동물이 없습니다</h3>
        <p class="text-body-1 text-grey-darken-1 mb-4">
          {{ searchQuery || filterGender || filterSpecies ? '검색 조건에 맞는 반려동물이 없습니다.' : '첫 번째 반려동물을 등록해보세요!' }}
        </p>
        <BaseButton
          v-if="!searchQuery && !filterGender && !filterSpecies"
          color="primary"
          @click="showAddForm = true"
        >
          반려동물 등록하기
        </BaseButton>
      </v-card>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <v-card class="text-center pa-8">
        <v-progress-circular
          indeterminate
          size="48"
          color="primary"
          class="mb-4"
        />
        <p class="text-body-1">반려동물 목록을 불러오는 중...</p>
      </v-card>
    </div>

    <!-- 반려동물 등록/수정 폼 모달 -->
    <ModalDialog
      v-model="showAddForm"
      :title="editingPet ? '반려동물 수정' : '반려동물 등록'"
      max-width="800px"
    >
      <PetForm
        :pet="editingPet"
        :is-edit="!!editingPet"
        @close="closeForm"
        @success="handleFormSuccess"
      />
    </ModalDialog>

    <!-- 삭제 확인 모달 -->
    <ModalDialog
      v-model="showDeleteConfirm"
      title="반려동물 삭제"
      max-width="400px"
    >
      <div class="text-center pa-4">
        <v-icon size="48" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <h3 class="text-h6 mb-2">정말 삭제하시겠습니까?</h3>
        <p class="text-body-1 text-grey-darken-1 mb-4">
          "{{ petToDelete?.name }}"을(를) 삭제하면 복구할 수 없습니다.
        </p>
        
        <div class="d-flex justify-center gap-3">
          <v-btn
            variant="outlined"
            @click="showDeleteConfirm = false"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            @click="deletePet"
            :loading="loading"
          >
            삭제
          </v-btn>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { usePetStore } from '@/stores/pet'
import { useSnackbar } from '@/composables/useSnackbar'
import BaseButton from '@/components/ui/atoms/BaseButton.vue'
import BaseCard from '@/components/ui/atoms/BaseCard.vue'
import FormField from '@/components/ui/molecules/FormField.vue'
import ModalDialog from '@/components/ui/organisms/ModalDialog.vue'
import PetForm from './PetForm.vue'

export default {
  name: 'PetList',
  components: {
    BaseButton,
    BaseCard,
    FormField,
    ModalDialog,
    PetForm
  },
  
  setup() {
    const petStore = usePetStore()
    const { showSnackbar } = useSnackbar()
    
    // 반응형 데이터
    const searchQuery = ref('')
    const filterGender = ref('')
    const filterSpecies = ref('')
    const showAddForm = ref(false)
    const showDeleteConfirm = ref(false)
    const editingPet = ref(null)
    const petToDelete = ref(null)
    
    // 계산된 속성
    const pets = computed(() => petStore.getPets)
    const representativePet = computed(() => petStore.getRepresentativePet)
    const loading = computed(() => petStore.isLoading)
    
    // 필터링된 반려동물 목록
    const filteredPets = computed(() => {
      let filtered = pets.value
      
      // 검색 필터
      if (searchQuery.value) {
        filtered = filtered.filter(pet =>
          pet.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }
      
      // 성별 필터
      if (filterGender.value) {
        filtered = filtered.filter(pet => pet.gender === filterGender.value)
      }
      
      // 종류 필터
      if (filterSpecies.value) {
        filtered = filtered.filter(pet => pet.speciesId === filterSpecies.value)
      }
      
      return filtered
    })
    
    // 옵션 데이터
    const genderOptions = [
      { value: 'MALE', label: '수컷' },
      { value: 'FEMALE', label: '암컷' }
    ]
    
    const speciesOptions = computed(() => {
      return petStore.getSpecies.map(species => ({
        value: species.id,
        label: species.species
      }))
    })
    
    // 유틸리티 함수
    const getGenderLabel = (gender) => {
      const option = genderOptions.find(opt => opt.value === gender)
      return option ? option.label : gender
    }
    
    const getSpeciesName = (speciesId) => {
      const species = petStore.getSpeciesById(speciesId)
      return species ? species.species : '알 수 없음'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR')
    }
    
    // 이벤트 핸들러
    const selectPet = (pet) => {
      petStore.selectPet(pet)
      // TODO: 상세 페이지로 이동 또는 상세 모달 표시
    }
    
    const editPet = (pet) => {
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
    
    const handleFormSuccess = (message) => {
      showSnackbar(message, 'success')
      closeForm()
    }
    
    // 컴포넌트 마운트 시 데이터 로드
    onMounted(async () => {
      await petStore.fetchPets()
      await petStore.fetchSpecies()
    })
    
    return {
      // 반응형 데이터
      searchQuery,
      filterGender,
      filterSpecies,
      showAddForm,
      showDeleteConfirm,
      editingPet,
      petToDelete,
      
      // 계산된 속성
      pets,
      representativePet,
      loading,
      filteredPets,
      genderOptions,
      speciesOptions,
      
      // 메서드
      getGenderLabel,
      getSpeciesName,
      formatDate,
      selectPet,
      editPet,
      setAsRepresentative,
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
  padding: 24px;
}

.pet-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.search-filter-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: var(--v-theme-surface);
  border-radius: 12px;
  border: 1px solid var(--v-border-color);
}

.representative-pet-section {
  margin-bottom: 24px;
}

.representative-pet-card {
  border-left: 4px solid var(--v-theme-primary);
}

.pets-grid {
  margin-bottom: 24px;
}

.pet-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.pet-card.representative {
  border: 2px solid var(--v-theme-primary);
}

.pet-card-content {
  padding: 16px;
}

.pet-actions {
  display: flex;
  gap: 4px;
}

.pet-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--v-theme-on-surface-variant);
}

.empty-state,
.loading-state {
  margin-top: 48px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pet-list {
    padding: 16px;
  }
  
  .pet-list-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-filter-section {
    padding: 16px;
  }
}
</style>
