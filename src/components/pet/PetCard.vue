<template>
  <v-card class="pet-card" :class="{ 'is-representative': isRepresentative }" variant="elevated" rounded="xl">
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
          <v-icon color="white" size="14">mdi-crown</v-icon>
          <span>대표</span>
        </div>
      </div>
    </div>

    <!-- 반려동물 정보 영역 -->
    <v-card-text class="pet-info">
      <!-- 펫 이름과 액션 버튼들 -->
      <div class="pet-header">
        <h3 class="pet-name">{{ pet.name }}</h3>
        <div class="pet-actions">
          <v-btn
            v-if="!isRepresentative"
            icon="mdi-star-outline"
            variant="text"
            size="small"
            color="amber"
            @click="$emit('set-representative', pet)"
            density="comfortable"
          />

          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            color="grey-darken-1"
            :disabled="!pet.id"
            @click="$emit('edit', pet)"
            density="comfortable"
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            :disabled="!pet.id"
            @click="$emit('delete', pet)"
            density="comfortable"
          />
        </div>
      </div>

      <!-- 반려동물 기본 정보 태그들 -->
      <div class="pet-tags">
        <v-chip 
          size="small" 
          variant="tonal" 
          :color="getSpeciesIconColor(pet.petOrder)"
          :prepend-icon="getSpeciesIcon(pet.petOrder)"
        >
          {{ pet.species || '알 수 없음' }}
        </v-chip>
        
        <v-chip 
          size="small" 
          variant="tonal" 
          :color="getGenderColor(pet.gender)"
          :prepend-icon="getGenderIcon(pet.gender)"
        >
          {{ getGenderLabel(pet.gender) }}
        </v-chip>
        
        <v-chip 
          size="small" 
          variant="tonal" 
          color="orange"
          prepend-icon="mdi-cake-variant"
        >
          {{ pet.age }}살
        </v-chip>
      </div>

      <!-- 추가 정보 -->
      <div class="pet-details">
        <div class="detail-row">
          <v-icon size="16" color="grey">mdi-weight</v-icon>
          <span>{{ pet.weight }}kg</span>
        </div>
        <div class="detail-row">
          <v-icon size="16" color="grey">mdi-calendar-outline</v-icon>
          <span>{{ formatBirthday(pet.birthday) }}</span>
        </div>
      </div>
    </v-card-text>

    <!-- 카드 하단 액션 영역 (상세보기 버튼) -->
    <v-card-actions class="card-actions">
      <v-btn 
        variant="text" 
        color="primary" 
        @click="$emit('view-details', pet)"
        block
        rounded="lg"
      >
        상세보기
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
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

    return {
      isRepresentative,
      getSpeciesIcon,
      getSpeciesIconColor,
      getGenderIcon,
      getGenderColor,
      getGenderLabel,
      formatBirthday
    }
  }
}
</script>

<style scoped>
.pet-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.pet-card.is-representative {
  border: 2px solid #f59e0b;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);
}

.pet-card.is-representative:hover {
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.25);
}

/* 이미지 섹션 */
.pet-image-section {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.pet-card:hover .pet-image {
  transform: scale(1.02);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #64748b;
}

/* 대표 반려동물 배지 */
.representative-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

/* 정보 섹션 */
.pet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px !important;
}

.pet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.pet-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.pet-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.pet-card:hover .pet-actions {
  opacity: 1;
}

/* 태그들 */
.pet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 상세 정보 */
.pet-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* 카드 액션 */
.card-actions {
  padding: 12px 20px 20px !important;
  margin-top: auto;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pet-info {
    padding: 16px !important;
    gap: 12px;
  }
  
  .pet-name {
    font-size: 1.125rem;
  }
  
  .pet-tags {
    gap: 6px;
  }
  
  .detail-row {
    font-size: 0.8rem;
  }
  
  .card-actions {
    padding: 8px 16px 16px !important;
  }
}

@media (max-width: 480px) {
  .image-placeholder {
    height: 160px;
  }
  
  .pet-info {
    padding: 12px !important;
    gap: 10px;
  }
  
  .pet-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .pet-name {
    font-size: 1rem;
    text-align: center;
  }
  
  .pet-actions {
    justify-content: center;
    opacity: 1;
  }
  
  .pet-tags {
    justify-content: center;
    gap: 4px;
  }
  
  .detail-row {
    justify-content: center;
    font-size: 0.75rem;
  }
  
  .representative-badge {
    top: 8px;
    right: 8px;
    padding: 3px 8px;
    font-size: 0.7rem;
  }
}
</style>