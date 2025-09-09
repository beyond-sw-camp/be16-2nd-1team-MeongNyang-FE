<template>
  <v-card 
    class="pet-card" 
    :class="{ 'is-representative': isRepresentative, 'disabled': disabled }" 
    variant="elevated" 
    rounded="xl"
    @click="handleCardClick"
    :style="{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }"
  >
    <!-- 카드 우상단 대표 설정 버튼 -->
    <div v-if="!isRepresentative" class="card-top-representative-btn">
      <v-btn
        variant="flat"
        prepend-icon="mdi-star"
        size="small"
        rounded="lg"
        class="representative-set-btn"
        @click.stop="$emit('set-representative', pet)"
      >
        대표
      </v-btn>
    </div>
    <!-- 반려동물 이미지 영역 -->
    <div class="pet-image-section">
      <div class="image-container">
        <v-img
          v-if="pet.url && pet.url.trim() !== ''"
          :src="pet.url"
          :alt="pet.name"
          class="pet-image"
          aspect-ratio="1"
          cover
          :key="`pet-image-${pet.id}-${pet.url}`"
        >
          <template v-slot:error>
            <div class="image-placeholder">
              <v-icon :size="60" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
            </div>
          </template>
        </v-img>
        <div v-else class="image-placeholder">
          <v-icon :size="60" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
        </div>
        
        <!-- 대표 반려동물 배지 -->
        <div v-if="isRepresentative" class="representative-badge">
          <v-icon color="white" size="16">mdi-crown</v-icon>
          <span>대표</span>
        </div>
        
        <!-- 이미지 오버레이 그라데이션 -->
        <div class="image-overlay"></div>
      </div>
    </div>

    <!-- 반려동물 정보 영역 -->
    <v-card-text class="pet-info">
      <!-- 펫 이름 -->
      <div class="pet-header">
        <h3 class="pet-name">{{ pet.name }}</h3>
      </div>

      <!-- 반려동물 기본 정보 태그들 -->
      <div class="pet-tags">
        <v-chip 
          size="small" 
          variant="tonal" 
          :color="getSpeciesIconColor(pet.petOrder)"
          :prepend-icon="getSpeciesIcon(pet.petOrder)"
          class="info-chip"
        >
          {{ pet.species || '알 수 없음' }}
        </v-chip>
        
        <v-chip 
          size="small" 
          variant="tonal" 
          :color="getGenderColor(pet.gender)"
          :prepend-icon="getGenderIcon(pet.gender)"
          class="info-chip"
        >
          {{ getGenderLabel(pet.gender) }}
        </v-chip>
        
        <v-chip 
          size="small" 
          variant="tonal" 
          color="orange"
          prepend-icon="mdi-cake-variant"
          class="info-chip"
        >
          {{ pet.age }}살
        </v-chip>
      </div>

      <!-- 추가 정보 -->
      <div class="pet-details">
        <div class="detail-row">
          <div class="detail-icon">
            <v-icon size="18" color="grey-darken-1">mdi-weight</v-icon>
          </div>
          <span class="detail-text">{{ pet.weight || '알 수 없음' }}kg</span>
        </div>
        <div class="detail-row">
          <div class="detail-icon">
            <v-icon size="18" color="grey-darken-1">mdi-calendar-outline</v-icon>
          </div>
          <span class="detail-text">{{ formatBirthday(pet.birthday) }}</span>
        </div>
      </div>
    </v-card-text>

    <!-- 카드 하단 액션 영역 -->
    <v-card-actions class="card-actions">
      <div class="action-buttons">
        <v-btn 
          variant="flat" 
          color="#E87D7D" 
          @click.stop="$emit('view-details', pet)"
          rounded="xl"
          class="action-btn view-details-btn"
          prepend-icon="mdi-eye"
        >
          상세보기
        </v-btn>
        

        
        <v-btn 
          variant="flat" 
          color="#E87D7D" 
          @click.stop="$emit('delete', pet)"
          rounded="xl"
          class="action-btn delete-btn"
          prepend-icon="mdi-delete"
        >
          삭제
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PetCard',
  
  props: {
    pet: {
      type: Object,
      required: true
    },
    representativePet: {
      type: Object,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['view-details', 'edit', 'delete', 'set-representative'],
  
  setup(props) {
    // 계산된 속성
    const isRepresentative = computed(() => {
      // ✅ props로 전달받은 representativePet 사용 (PetList에서 이미 mainPetId 기반으로 계산됨)
      const isMainPet = props.representativePet && props.representativePet.id === props.pet.id
      
      console.log(`Pet ${props.pet.id} isRepresentative:`, isMainPet, 'representativePet ID:', props.representativePet?.id)
      return isMainPet
    })
    
    // 종류에 따른 아이콘 반환 (백엔드 응답의 petOrder 직접 사용)
    const getSpeciesIcon = (petOrder) => {
      if (petOrder === '강아지') return 'mdi-dog'
      if (petOrder === '고양이') return 'mdi-cat'
      return 'mdi-paw'
    }

    // 종류에 따른 아이콘 색상 반환 (백엔드 응답의 petOrder 직접 사용)
    const getSpeciesIconColor = (petOrder) => {
      if (petOrder === '강아지') return 'blue'
      if (petOrder === '고양이') return 'purple'
      return 'grey'
    }

    // 성별에 따른 아이콘 반환
    const getGenderIcon = (gender) => {
      console.log('🔍 Gender 값 확인:', gender, typeof gender)
      
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
      console.log('🎨 Gender 색상 확인:', gender)
      
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

    // 성별 라벨 반환 (중성 처리 포함)
    const getGenderLabel = (gender) => {
      console.log('🏷️ Gender 라벨 확인:', gender)
      
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
      console.warn('⚠️ 예상치 못한 성별 값:', gender, '- 중성으로 처리')
      return '중성'
    }

    const formatBirthday = (birthday) => {
      if (!birthday) return '알 수 없음'
      const date = new Date(birthday)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    }

    // 카드 클릭 처리
    const handleCardClick = () => {
      if (!props.disabled) {
        // 부모 컴포넌트로 view-details 이벤트 emit
        // 이벤트는 부모에서 처리됨
      }
    }

    return {
      isRepresentative,
      getSpeciesIcon,
      getSpeciesIconColor,
      getGenderIcon,
      getGenderColor,
      getGenderLabel,
      formatBirthday,
      handleCardClick
    }
  }
}
</script>

<style scoped>
.pet-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}



.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.pet-card.is-representative {
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.25);
}

.pet-card.is-representative:hover {
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.2);
  transform: translateY(-4px);
}

/* 이미지 섹션 */
.pet-image-section {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.image-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
}

.pet-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  object-fit: cover;
}

.pet-card:hover .pet-image {
  transform: scale(1.02);
}

.image-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
  position: relative;
  margin: 0 auto;
}

.image-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  animation: shimmer-placeholder 2s infinite;
}

@keyframes shimmer-placeholder {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 이미지 오버레이 그라데이션 */
.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
  pointer-events: none;
}

/* 대표 반려동물 배지 */
.representative-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border-radius: 25px;
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
  z-index: 2;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 정보 섹션 */
.pet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px !important;
  background: transparent;
}

.pet-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.pet-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
  text-align: center;
  background: linear-gradient(135deg, #1f2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 태그들 */
.pet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-chip {
  font-weight: 600;
  border-radius: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 상세 정보 */
.pet-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detail-row:hover {
  background: rgba(241, 245, 249, 1);
  transform: translateX(2px);
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.detail-row:hover .detail-icon {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  transform: scale(1.05);
}

.detail-row:hover .detail-icon .v-icon {
  color: white !important;
}

.detail-text {
  font-size: 0.9rem;
  color: #4b5563;
  font-weight: 600;
}

/* 카드 액션 */
.card-actions {
  padding: 16px 24px 24px !important;
  margin-top: auto;
  background: transparent;
}

.action-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-btn {
  flex: 1;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  height: 44px;
  text-transform: none;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.view-details-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
}

.view-details-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  background: linear-gradient(135deg, #FF6B6B, #E87D7D) !important;
}



.delete-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  background: linear-gradient(135deg, #FF6B6B, #E87D7D) !important;
}

.set-representative-btn {
  border-color: #f59e0b !important;
  color: #f59e0b !important;
  background: transparent !important;
}

.set-representative-btn:hover {
  background: #f59e0b !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 대표 설정 버튼 오버레이 */
.representative-set-overlay {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  z-index: 999 !important;
}

.representative-set-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 16px rgba(232, 125, 125, 0.25) !important;
  transition: all 0.3s ease !important;
  min-width: 70px !important;
  height: 36px !important;
  font-size: 12px !important;
  border: none !important;
  backdrop-filter: blur(10px) !important;
}

.representative-set-btn:hover {
  background: linear-gradient(135deg, #FF6B6B, #E87D7D) !important;
  color: white !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.35) !important;
}

/* 카드 우상단 대표 설정 버튼 */
.card-top-representative-btn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pet-info {
    padding: 20px !important;
    gap: 16px;
  }
  
  .pet-name {
    font-size: 1.25rem;
  }
  
  .pet-tags {
    gap: 8px;
  }
  
  .detail-row {
    padding: 6px 10px;
    gap: 10px;
  }
  
  .detail-text {
    font-size: 0.85rem;
  }
  
  .card-actions {
    padding: 12px 20px 20px !important;
  }
  
  .image-container {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .image-container {
    height: 180px;
  }
  
  .pet-info {
    padding: 16px !important;
    gap: 14px;
  }
  
  .pet-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .pet-name {
    font-size: 1.2rem;
    text-align: center;
  }
  
  .pet-actions {
    justify-content: center;
    opacity: 1;
    transform: none;
  }
  
  .pet-tags {
    justify-content: center;
    gap: 6px;
  }
  
  .detail-row {
    justify-content: center;
    padding: 8px 12px;
  }
  
  .detail-text {
    font-size: 0.8rem;
  }
  
  .representative-badge {
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    font-size: 0.75rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    height: 40px;
    font-size: 0.85rem;
  }
}
</style>