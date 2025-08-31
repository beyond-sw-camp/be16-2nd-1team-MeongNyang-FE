<template>
  <div class="pet-list">
    <div class="pet-container">
      <!-- 헤더 (배경 위에 직접) -->
      <div class="page-header">
            <h1 class="page-title">반려동물</h1>
            <p class="page-subtitle">우리 가족을 관리하고 추억을 기록하세요</p>
    </div>

      <!-- 통계 패널 (반려동물 추가 버튼 포함) -->
      <div class="stats-panel">
        <div class="stats-overview">
            <div class="stats-left">
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
            <div class="add-button-container">
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

    <!-- 콘텐츠 -->
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
                  <div class="introduction-large">
                    <h4 class="introduction-title">소개글</h4>
                    <p v-if="representativePet.introduce" class="introduction-text">{{ representativePet.introduce }}</p>
                    <p v-else class="introduction-text no-introduction">소개글이 등록되지 않았습니다.</p>
                  </div>
                  
                  <!-- 액션 버튼들 -->
                  <div class="action-buttons-large">
                    <v-btn
                      color="#E87D7D"
                      variant="flat"
                      prepend-icon="mdi-eye"
                      @click="viewPet(representativePet)"
                      size="large"
                      rounded="xl"
                      class="view-details-btn"
                    >
                      상세보기
                    </v-btn>
                    <v-btn
                      color="#E87D7D"
                      variant="flat"
                      prepend-icon="mdi-delete"
                      @click="$emit('delete', representativePet)"
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
                :is-edit="false"
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

      <!-- 반려동물 상세 모달 -->
      <v-dialog
        v-model="showDetailModal"
        max-width="1400"
        class="pet-detail-dialog"
        @click:outside="closeDetailModal"
        persistent
      >
        <v-card class="pet-detail-card" rounded="xl">
          <v-card-title class="detail-header">
            <div class="detail-title">
              <span class="text-h4">{{ selectedPet?.name }}</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="closeDetailModal"
              color="white"
              class="close-btn"
            />
          </v-card-title>
          <v-card-text class="detail-content">
            <div class="pet-image-detail">
              <v-img
                v-if="selectedPet?.url && selectedPet.url.trim() !== ''"
                :src="selectedPet.url"
                :alt="selectedPet.name"
                class="detail-pet-image"
                aspect-ratio="1"
                cover
              >
                <template v-slot:error>
                  <div class="detail-image-placeholder">
                    <v-icon :size="80" :color="getSpeciesIconColor(selectedPet?.petOrder)" :icon="getSpeciesIcon(selectedPet?.petOrder)" />
                  </div>
                </template>
              </v-img>
              <div v-else class="detail-image-placeholder">
                <v-icon :size="80" :color="getSpeciesIconColor(selectedPet?.petOrder)" :icon="getSpeciesIcon(selectedPet?.petOrder)" />
              </div>
            </div>

            <div class="pet-details-detail">
              <div class="detail-section">
                <h4 class="section-title">기본 정보</h4>
                <div class="info-grid">
                  <div class="info-item species-item">
                    <v-icon size="24" :color="getSpeciesIconColor(selectedPet?.petOrder)">{{ getSpeciesIcon(selectedPet?.petOrder) }}</v-icon>
                    <span class="info-label">종류</span>
                    <span class="info-value">{{ selectedPet?.species || '알 수 없음' }}</span>
                    <span class="species-detail">{{ selectedPet?.petOrder || '기타' }}</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-gender-male-female</v-icon>
                    <span class="info-label">성별</span>
                    <span class="info-value">{{ getGenderLabel(selectedPet?.gender) }}</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-cake-variant</v-icon>
                    <span class="info-label">나이</span>
                    <span class="info-value">{{ selectedPet?.age }}살</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-weight</v-icon>
                    <span class="info-label">체중</span>
                    <span class="info-value">{{ selectedPet?.weight || '알 수 없음' }}kg</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-calendar</v-icon>
                    <span class="info-label">생일</span>
                    <span class="info-value">{{ formatBirthday(selectedPet?.birthday) }}</span>
                  </div>
                </div>
              </div>

              <div class="introduction-detail">
                <h4 class="introduction-title">소개글</h4>
                <div class="introduction-content">
                  <p v-if="selectedPet?.introduce && selectedPet.introduce.trim() !== ''" class="introduction-text">
                    {{ selectedPet.introduce }}
                  </p>
                  <p v-else class="introduction-text no-introduction">
                    소개글이 등록되지 않았습니다.
                  </p>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="detail-actions">
            <v-btn
              color="#E87D7D"
              variant="flat"
              prepend-icon="mdi-pencil"
              @click="openEditForm"
              size="large"
              rounded="xl"
              class="edit-btn"
            >
              수정
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              prepend-icon="mdi-delete"
              @click="confirmDeleteFromModal"
              size="large"
              rounded="xl"
              class="delete-btn"
            >
              삭제
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 반려동물 수정 폼 모달 -->
      <v-dialog
        v-model="showEditForm"
        max-width="1200"
        class="edit-form-dialog"
        @click:outside="closeEditForm"
        persistent
      >
        <v-card class="edit-form-card" rounded="xl">
          <v-card-title class="edit-form-header">
            <div class="edit-form-title">
              <span class="text-h4">{{ selectedPet?.name }} 수정</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="closeEditForm"
              color="white"
            />
          </v-card-title>
          <v-card-text class="edit-form-content">
            <PetForm
              :pet="selectedPet"
              :is-edit="true"
              @close="closeEditForm"
              @success="handlePetUpdate"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
            </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
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
    const petStore = usePetStore()
    const { showSnackbar } = useSnackbar()
    
    const showAddForm = ref(false)
    const showDeleteConfirm = ref(false)
    const petToDelete = ref(null)
    const deleting = ref(false)
    const showDetailModal = ref(false)
    const selectedPet = ref(null)
    const showEditForm = ref(false)

    
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
    const getDogCount = () => pets.value.filter(pet => pet.petOrder === '강아지').length
    const getCatCount = () => pets.value.filter(pet => pet.petOrder === '고양이').length
    
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
      console.log('🔍 viewPet 함수 호출됨:', pet)
      selectedPet.value = pet
      showDetailModal.value = true
      console.log('🔍 모달 상태:', { selectedPet: selectedPet.value, showDetailModal: showDetailModal.value })
    }
    
    // 모달 닫기
    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedPet.value = null
    }
    
    // 펫 업데이트 처리
    const handlePetUpdate = async (updatedPet) => {
      try {
        console.log('🔄 펫 수정 시작:', updatedPet)
        
        // 펫 정보 업데이트
        await petStore.updatePet(updatedPet)
        
        // 성공 메시지
        console.log('✅ 펫 수정 완료')
        
        // 수정 폼 모달 닫기
        showEditForm.value = false
        
        // 상세보기 모달도 닫기
        closeDetailModal()
        
        // 펫 목록 새로고침
        await petStore.fetchPets()
        
        // selectedPet 업데이트 (상세보기 모달에서 수정된 정보 반영)
        if (selectedPet.value && selectedPet.value.id === updatedPet.id) {
          selectedPet.value = { ...selectedPet.value, ...updatedPet }
        }
        
        // 성공 알림 표시
        showSnackbar('반려동물 정보가 성공적으로 수정되었습니다.', 'success')
        
      } catch (error) {
        console.error('❌ 펫 수정 실패:', error)
        showSnackbar('펫 정보 수정에 실패했습니다.', 'error')
      }
    }
    
    // 펫 삭제 처리
    const handlePetDelete = async (petId) => {
      try {
        await petStore.deletePet(petId)
        showSnackbar('반려동물이 삭제되었습니다.', 'success')
        closeDetailModal()
      } catch (error) {
        showSnackbar('반려동물 삭제에 실패했습니다.', 'error')
      }
    }
    
    // 수정 폼 열기
    const openEditForm = () => {
      console.log('🔄 수정 폼 열기 시작')
      console.log('selectedPet:', selectedPet.value)
      console.log('showEditForm 현재값:', showEditForm.value)
      
      if (!selectedPet.value) {
        console.error('❌ selectedPet이 없습니다!')
        showSnackbar('펫 정보를 찾을 수 없습니다.', 'error')
        return
      }
      
      showEditForm.value = true
      
      console.log('✅ showEditForm 설정됨:', showEditForm.value)
      console.log('수정 폼 모달 열림 완료')
      
      // 모달이 열렸는지 확인
      setTimeout(() => {
        console.log('⏰ 모달 상태 재확인:', {
          showEditForm: showEditForm.value,
          showDetailModal: showDetailModal.value
        })
      }, 100)
    }
    
    // 수정 폼 닫기
    const closeEditForm = () => {
      showEditForm.value = false
    }
    
    // 모달에서 삭제 확인
    const confirmDeleteFromModal = () => {
      if (selectedPet.value) {
        petToDelete.value = selectedPet.value
        showDeleteConfirm.value = true
        closeDetailModal() // 상세보기 모달 닫기
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
      showDetailModal,
      selectedPet,
      showEditForm,
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
      closeDetailModal,
      openEditForm,
      handlePetUpdate,
      handlePetDelete,
      closeEditForm,
      confirmDeleteFromModal,
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
  background: var(--v-theme-surface-light);
}

.pet-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

/* 페이지 헤더 (배경 위에 직접) */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
}

/* 통계 패널 */
.stats-panel {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin: 0 auto 32px auto;
  min-height: 120px;
  display: flex;
  align-items: center;
  max-width: 1120px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.stats-left {
  display: flex;
  gap: 40px;
  align-items: center;
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

/* 반려동물 추가 버튼 */
.add-button-container {
  display: flex;
  align-items: center;
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



/* 반려동물 레이아웃 */
.pets-section {
  padding: 0;
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
  border: 1px solid #e9ecef;
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

.view-details-btn {
  background: #E87D7D !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
  background: linear-gradient(135deg, #FF6B6B, #E87D7D) !important;
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

/* 반려동물 상세 모달 */
.pet-detail-dialog {
  z-index: 1000;
}

.pet-detail-dialog .v-dialog {
  max-height: 90vh;
  overflow-y: auto;
}

.pet-detail-card {
  border-radius: 20px;
}

.detail-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-title .text-h4 {
  font-size: 2.5rem !important;
  font-weight: 700 !important;
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}



.close-btn {
  color: white !important;
}

.detail-content {
  padding: 32px;
  display: flex;
  gap: 48px;
  align-items: flex-start;
}

.pet-image-detail {
  flex-shrink: 0;
}

.detail-pet-image {
  width: 500px;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.detail-image-placeholder {
  width: 500px;
  height: 500px;
  border-radius: 20px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
}

.pet-details-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: start;
}

/* 종류 항목은 전체 너비 사용 */
.info-grid .species-item {
  grid-column: 1 / -1;
  margin-bottom: 8px;
}

/* 나머지 항목들은 2열로 정렬 */
.info-grid .info-item:not(.species-item) {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

/* 종류 항목은 특별한 레이아웃 */
.species-item {
  background: linear-gradient(135deg, #fef7f7, #fef2f2) !important;
  border-color: #E87D7D !important;
  padding: 24px !important;
}

.species-item .info-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.species-item .species-detail {
  margin-left: auto;
  font-size: 12px;
  color: #E87D7D;
  font-weight: 600;
  background: rgba(232, 125, 125, 0.1);
  padding: 6px 12px;
  border-radius: 10px;
  white-space: nowrap;
}

.info-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #E87D7D;
}

.info-label {
  font-weight: 600;
  color: #64748b;
  min-width: 60px;
  font-size: 14px;
}

.info-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
}

/* 종 정보 특별 스타일 */
.species-item .v-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}



.detail-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 1rem;
}

.introduction-detail {
  background: #f8fafc;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.introduction-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.introduction-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  border-radius: 2px;
}

.introduction-text {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.no-introduction {
  font-style: italic;
  color: #9ca3af;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 24px;
}

/* 수정 폼 모달 */
.edit-form-dialog {
  z-index: 1000;
}

.edit-form-dialog .v-dialog {
  max-height: 90vh;
  overflow-y: auto;
}

.edit-form-card {
  border-radius: 20px;
}

.edit-form-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-form-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-form-content {
  padding: 24px;
}
</style>

