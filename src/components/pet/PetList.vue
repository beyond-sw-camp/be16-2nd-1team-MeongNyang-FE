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
            color="primary"
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



    <!-- 반려동물 목록 -->
    <div class="pets-section">
      <div class="container">
        <div v-if="filteredPets.length > 0" class="pets-grid">
          <div
            v-for="pet in filteredPets"
            :key="`pet-${pet.id}-${pet.url || 'no-image'}`"
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
        <div v-else-if="!loading" class="empty-state">
          <div class="empty-icon">
            <v-icon size="80" color="grey-lighten-1">mdi-paw-outline</v-icon>
          </div>
          <h3 class="empty-title">반려동물을 등록해보세요</h3>
          <p class="empty-description">
            소중한 가족 구성원을 등록하고 추억을 기록해보세요
          </p>
          <v-btn
            color="primary"
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
            rounded="pill"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            @click="deletePet"
            :loading="deleting"
            size="large"
            rounded="pill"
            prepend-icon="mdi-delete"
          >
            삭제
          </v-btn>
        </div>
      </template>
    </ModalDialog>
  </div>
</template>

<script>
// script 부분은 기존과 동일
import { ref, computed, onMounted, nextTick } from 'vue'
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
      // ✅ authStore의 mainPetId를 우선으로 사용
      const mainPetId = authStore.myPageInfo?.mainPetId
      if (mainPetId) {
        const mainPet = pets.value.find(pet => pet.id === mainPetId)
        if (mainPet) {
          console.log('✅ mainPetId 기반 대표 반려동물:', mainPet)
          return mainPet
        }
      }
      
      // fallback: 첫 번째 펫 사용
      const fallbackPet = pets.value[0] || null
      console.log('⚠️ fallback 대표 반려동물:', fallbackPet)
      return fallbackPet
    })
    const loading = computed(() => petStore.isLoading)
    
    // 반려동물 목록 (필터링 없음)
    const filteredPets = computed(() => pets.value)
    
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

    // 성별에 따른 아이콘 반환
    const getGenderIcon = (gender) => {
      console.log('🔍 PetList Gender 아이콘 확인:', gender, typeof gender)
      
      // 다양한 중성 표현 방식 체크 (알 수 없음도 중성으로 처리)
      if (!gender || 
          gender === 'UNKNOWN' || 
          gender === 'NEUTERED' || 
          gender === 'NEUTRAL' ||
          gender === 'NEUTRALITY' ||  // 🔥 실제 백엔드 값 추가!
          gender === '중성' ||
          gender === '알 수 없음' ||
          gender === 'N' ||
          gender === null ||
          gender === undefined) {
        return 'mdi-circle-outline'  // 원형 아이콘
      }
      return gender === 'MALE' || gender === '수컷' || gender === 'M' ? 'mdi-gender-male' : 'mdi-gender-female'
    }

    // 성별에 따른 색상 반환
    const getGenderColor = (gender) => {
      console.log('🎨 PetList Gender 색상 확인:', gender)
      
      // 다양한 중성 표현 방식 체크 (알 수 없음도 중성으로 처리)
      if (!gender || 
          gender === 'UNKNOWN' || 
          gender === 'NEUTERED' || 
          gender === 'NEUTRAL' ||
          gender === 'NEUTRALITY' ||  // 🔥 실제 백엔드 값 추가!
          gender === '중성' ||
          gender === '알 수 없음' ||
          gender === 'N' ||
          gender === null ||
          gender === undefined) {
        return 'grey'
      }
      return gender === 'MALE' || gender === '수컷' || gender === 'M' ? 'blue' : 'pink'
    }

    const getGenderLabel = (gender) => {
      console.log('🏷️ PetList Gender 라벨 확인:', gender)
      
      // 다양한 중성 표현 방식 체크 (알 수 없음도 중성으로 처리)
      if (!gender || 
          gender === 'UNKNOWN' || 
          gender === 'NEUTERED' || 
          gender === 'NEUTRAL' ||
          gender === 'NEUTRALITY' ||  // 🔥 실제 백엔드 값 추가!
          gender === '중성' ||
          gender === '알 수 없음' ||
          gender === 'N' ||
          gender === null ||
          gender === undefined) {
        return '중성'
      }
      
      if (gender === 'MALE' || gender === '수컷' || gender === 'M') return '수컷'
      if (gender === 'FEMALE' || gender === '암컷' || gender === 'F') return '암컷'
      
      // 예상치 못한 값이 올 경우도 중성으로 처리
      console.warn('⚠️ PetList 예상치 못한 성별 값:', gender, '- 중성으로 처리')
      return '중성'
    }

    // 펫 상세보기
    const viewPet = (pet) => {
      router.push(`/pets/${pet.id}`)
    }
    
    // 통계 카드용 계산된 속성들 (백엔드 응답의 petOrder 직접 사용)
    const dogCount = computed(() => {
      return pets.value.filter(pet => pet.petOrder === '강아지').length
    })
    
    const catCount = computed(() => {
      return pets.value.filter(pet => pet.petOrder === '고양이').length
    })
    
    // 호환성을 위한 함수들 (템플릿에서 함수 호출로 사용)
    const getDogCount = () => dogCount.value
    const getCatCount = () => catCount.value
    
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
      console.log('🔄 editPet 호출됨')
      console.log('편집할 펫 데이터:', pet)
      console.log('펫 ID:', pet.id)
      console.log('펫 이미지 URL:', pet.url)
      
      if (!pet.id) {
        showSnackbar('ID가 없어 수정할 수 없습니다. 백엔드 관리자에게 문의하세요.', 'error')
        return
      }
      
      console.log('✅ editingPet 설정 전 상태:', editingPet.value)
      editingPet.value = pet
      console.log('✅ editingPet 설정 후 상태:', editingPet.value)
      
      showAddForm.value = true
      console.log('✅ 수정 폼 모달 열림')
    }
    
    const setAsRepresentative = async (pet) => {
      try {
        console.log('🔄 대표 반려동물 설정 시작:', pet.id)
        
        // ✅ 중복 호출 방지
        if (pet.id === authStore.myPageInfo?.mainPetId) {
          console.log('⚠️ 이미 대표 반려동물로 설정되어 있음')
          showSnackbar('이미 대표 반려동물로 설정되어 있습니다.', 'info')
          return
        }
        
        // ✅ petStore의 setRepresentativePet 사용 (이미 백엔드 API 호출 포함)
        console.log('📞 petStore.setRepresentativePet 호출 시작')
        const result = await petStore.setRepresentativePet(pet)
        console.log('📞 petStore.setRepresentativePet 호출 완료, 결과:', result)
        
        if (result.success) {
          console.log('✅ 대표 반려동물 설정 성공')
          
          // ✅ UI 즉시 반영
          await nextTick()
          console.log('✅ UI 업데이트 완료')
          
          showSnackbar('대표 반려동물이 설정되었습니다.', 'success')
        } else {
          console.error('❌ 대표 반려동물 설정 실패:', result.message)
          showSnackbar(result.message || '대표 반려동물 설정에 실패했습니다.', 'error')
        }
      } catch (error) {
        console.error('❌ 대표 반려동물 설정 에러:', error)
        console.error('❌ 에러 상세:', error.response?.data)
        console.error('❌ 에러 상태:', error.response?.status)
        console.error('❌ 에러 메시지:', error.message)
        console.error('❌ 에러 스택:', error.stack)
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
      console.log('🔄 closeForm 호출됨')
      console.log('폼 닫기 전 editingPet:', editingPet.value)
      
      showAddForm.value = false
      editingPet.value = null
      
      console.log('✅ 폼 닫기 완료')
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
      getGenderIcon,
      getGenderColor,
      getGenderLabel,
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
/* 🎨 완전히 새로운 모던 디자인 */
.pet-list {
  background: #fafafa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ✨ 헤더 섹션 */
.header-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 40px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.add-button {
  font-weight: 600;
  text-transform: none;
  letter-spacing: -0.01em;
}

/* 📊 통계 섹션 */
.stats-section {
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #e5e7eb;
}

.stats-overview {
  display: flex;
  gap: 32px;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f9fafb;
  border-radius: 12px;
  min-width: 120px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.stat-info {
  text-align: left;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* 🐾 펫 목록 섹션 */
.pets-section {
  padding: 40px 0;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.pet-card-wrapper {
  transition: transform 0.2s ease;
}

.pet-card-wrapper:hover {
  transform: translateY(-2px);
}

/* 😊 빈 상태 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

/* 📱 반응형 디자인 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .header-section {
    padding: 24px 0;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .page-title {
    font-size: 1.875rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .stats-overview {
    flex-direction: column;
    gap: 16px;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .stat-item {
    justify-content: center;
  }
  
  .pets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .empty-state {
    padding: 60px 20px;
  }
}

/* 🧹 기존 스타일 정리 완료 - 모던한 디자인만 남김 */
</style>
