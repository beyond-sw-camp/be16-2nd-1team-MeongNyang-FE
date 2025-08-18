<template>
  <div class="pet-card" :class="{ 'is-representative': isRepresentative }">
    <!-- 반려동물 사진 영역 -->
    <div class="pet-image-container">
      <div class="pet-image-placeholder">
        <v-icon size="48" color="primary" class="pet-icon">mdi-dog</v-icon>
      </div>
      <div class="pet-status-badges">
        <v-chip
          v-if="isRepresentative"
          size="small"
          color="primary"
          variant="elevated"
          class="representative-badge"
        >
          <v-icon size="16" class="me-1">mdi-star</v-icon>
          대표
        </v-chip>
      </div>
    </div>

    <!-- 반려동물 정보 영역 -->
    <div class="pet-info">
      <div class="pet-header">
        <h3 class="pet-name">{{ pet.name }}</h3>
        <div class="pet-actions">
          <v-btn
            v-if="!isRepresentative"
            icon="mdi-star-outline"
            variant="text"
            size="small"
            color="primary"
            @click="$emit('set-representative', pet)"
            class="action-btn"
            aria-label="대표 반려동물로 설정"
          />
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            color="secondary"
            :disabled="!pet.id"
            @click="$emit('edit', pet)"
            class="action-btn"
            aria-label="반려동물 수정"
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            :disabled="!pet.id"
            @click="$emit('delete', pet)"
            class="action-btn"
            aria-label="반려동물 삭제"
          />
        </div>
      </div>

      <div class="pet-details">
        <div class="detail-row">
          <v-icon size="16" color="primary" class="detail-icon">mdi-dog</v-icon>
          <span class="detail-text">{{ getSpeciesName(pet.speciesId, pet.species) }}</span>
        </div>
        
        <div class="detail-row">
          <v-icon size="16" color="secondary" class="detail-icon">
            {{ pet.gender === 'MALE' ? 'mdi-gender-male' : 'mdi-gender-female' }}
          </v-icon>
          <span class="detail-text">{{ pet.gender === 'MALE' ? '수컷' : '암컷' }}</span>
        </div>
        
        <div class="detail-row">
          <v-icon size="16" color="info" class="detail-icon">mdi-cake-variant</v-icon>
          <span class="detail-text">{{ pet.age }}살</span>
        </div>
        
        <div class="detail-row">
          <v-icon size="16" color="warning" class="detail-icon">mdi-weight</v-icon>
          <span class="detail-text">{{ pet.weight }}kg</span>
        </div>
        
        <div class="detail-row">
          <v-icon size="16" color="success" class="detail-icon">mdi-calendar</v-icon>
          <span class="detail-text">{{ formatBirthday(pet.birthday) }}</span>
        </div>
      </div>
    </div>

    <!-- 호버 오버레이 -->
    <div class="pet-card-overlay">
      <div class="overlay-content">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          @click="$emit('view-details', pet)"
          class="view-details-btn"
        >
          <v-icon class="me-2">mdi-eye</v-icon>
          상세보기
        </v-btn>
      </div>
    </div>
  </div>
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
  
  emits: ['set-representative', 'edit', 'delete', 'view-details'],
  
  setup(props) {
    const isRepresentative = computed(() => {
      return props.representativePet && props.pet.id === props.representativePet.id
    })

    const getSpeciesName = (speciesId, petSpecies = null) => {
      if (speciesId) {
        // TODO: store에서 species 조회
        return petSpecies || '알 수 없음'
      }
      return petSpecies || '알 수 없음'
    }

    const formatBirthday = (birthday) => {
      if (!birthday) return '알 수 없음'
      const date = new Date(birthday)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    }

    return {
      isRepresentative,
      getSpeciesName,
      formatBirthday
    }
  }
}
</script>

<style scoped>
.pet-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;
}

.pet-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15), 0 8px 16px rgba(15, 23, 42, 0.1);
  border-color: rgba(99, 102, 241, 0.4);
}

.pet-card.is-representative {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.pet-card.is-representative::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366F1, #818CF8, #A5B4FC);
}

/* 반려동물 사진 영역 */
.pet-image-container {
  position: relative;
  margin-bottom: 16px;
}

.pet-image-placeholder {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #CBD5E1;
  transition: all 0.3s ease;
}

.pet-card:hover .pet-image-placeholder {
  border-color: #6366F1;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
}

.pet-status-badges {
  position: absolute;
  top: 8px;
  right: 8px;
}

.representative-badge {
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* 반려동물 정보 영역 */
.pet-info {
  flex: 1;
}

.pet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.pet-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  line-height: 1.2;
}

.pet-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pet-card:hover .pet-actions {
  opacity: 1;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* 반려동물 상세 정보 */
.pet-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-icon {
  flex-shrink: 0;
}

.detail-text {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

/* 호버 오버레이 */
.pet-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(129, 140, 248, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
}

.pet-card:hover .pet-card-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
}

.view-details-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #6366F1;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.view-details-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .pet-card {
    padding: 16px;
    border-radius: 16px;
  }
  
  .pet-name {
    font-size: 1.125rem;
  }
  
  .pet-image-placeholder {
    height: 100px;
  }
  
  .pet-actions {
    opacity: 1;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .pet-card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .pet-name {
    color: #F8FAFC;
  }
  
  .detail-text {
    color: #CBD5E1;
  }
  
  .pet-image-placeholder {
    background: linear-gradient(135deg, #334155 0%, #475569 100%);
    border-color: #64748B;
  }
  
  .pet-card:hover .pet-image-placeholder {
    background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
    border-color: #6366F1;
  }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .pet-card,
  .pet-card:hover,
  .pet-card-overlay,
  .action-btn,
  .view-details-btn {
    transition: none;
    transform: none;
  }
}
</style>
