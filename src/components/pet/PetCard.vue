<template>
  <div class="pet-card mm-card mm-hover-lift" :class="{ 'is-representative': isRepresentative }">
    <!-- 반려동물 이미지 영역 -->
    <div class="pet-image-section">
      <div class="image-container">
        <v-img
          v-if="pet.url"
          :src="pet.url"
          :alt="pet.name"
          cover
          class="pet-image"
        />
        <div v-else class="image-placeholder">
          <v-icon :size="48" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
        </div>
        
        <!-- 대표 반려동물 배지 -->
        <div v-if="isRepresentative" class="representative-badge">
          <v-icon color="amber" size="16">mdi-star</v-icon>
          <span>대표</span>
        </div>
      </div>
    </div>

    <!-- 반려동물 정보 영역 -->
    <div class="pet-info-section">
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
            class="action-btn"
            aria-label="대표 반려동물로 설정"
          />
          <v-btn
            icon="mdi-eye"
            variant="text"
            size="small"
            color="primary"
            @click="$emit('view-details', pet)"
            class="action-btn"
            aria-label="반려동물 상세보기"
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
        <div class="detail-item">
          <div class="detail-icon">
            <v-icon :size="18" :color="getSpeciesIconColor(pet.petOrder)" :icon="getSpeciesIcon(pet.petOrder)" />
          </div>
          <span class="detail-text">{{ pet.species || '알 수 없음' }}</span>
        </div>
        
        <!-- 성별 -->
        <div class="detail-item">
          <div class="detail-icon">
            <v-icon 
              size="18" 
              :color="pet.gender === 'MALE' ? 'blue' : 'red'" 
              :icon="pet.gender === 'MALE' ? 'mdi-gender-male' : 'mdi-gender-female'" 
            />
          </div>
          <span class="detail-text">{{ pet.gender === 'MALE' ? '수컷' : '암컷' }}</span>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">
            <v-icon size="18" color="orange">mdi-cake-variant</v-icon>
          </div>
          <span class="detail-text">{{ pet.age }}살</span>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">
            <v-icon size="18" color="teal">mdi-weight</v-icon>
          </div>
          <span class="detail-text">{{ pet.weight }}kg</span>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">
            <v-icon size="18" color="indigo">mdi-calendar</v-icon>
          </div>
          <span class="detail-text">{{ formatBirthday(pet.birthday) }}</span>
        </div>
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
  
  emits: ['view-details', 'edit', 'delete', 'set-representative'],
  
  setup(props) {
    // 계산된 속성
    const isRepresentative = computed(() => {
      return props.representativePet && props.representativePet.id === props.pet.id
    })
    
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

    const formatBirthday = (birthday) => {
      if (!birthday) return '알 수 없음'
      const date = new Date(birthday)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    }

    return {
      isRepresentative,
      getSpeciesIcon,
      getSpeciesIconColor,
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
  overflow: hidden;
  position: relative;
  transition: all var(--mm-transition-normal);
}

.pet-card.is-representative {
  border: 2px solid var(--v-theme-primary);
  box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.2);
}

/* 이미지 섹션 */
.pet-image-section {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--mm-transition-normal);
}

.pet-card:hover .pet-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mm-surface-variant), var(--mm-border-light));
  color: var(--mm-on-surface-variant);
}

/* 대표 반려동물 배지 */
.representative-badge {
  position: absolute;
  top: var(--mm-space-3);
  right: var(--mm-space-3);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  border-radius: var(--mm-radius-full);
  padding: var(--mm-space-2) var(--mm-space-3);
  font-size: var(--mm-text-xs);
  font-weight: var(--mm-font-weight-bold);
  display: flex;
  align-items: center;
  gap: var(--mm-space-1);
  box-shadow: var(--mm-shadow-md);
  z-index: 2;
}

/* 정보 섹션 */
.pet-info-section {
  flex: 1;
  padding: var(--mm-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--mm-space-4);
}

.pet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--mm-space-3);
}

.pet-name {
  font-size: var(--mm-text-xl);
  font-weight: var(--mm-font-weight-bold);
  color: var(--mm-on-surface);
  margin: 0;
  line-height: 1.2;
  flex: 1;
}

.pet-actions {
  display: flex;
  gap: var(--mm-space-1);
  flex-shrink: 0;
}

.action-btn {
  padding: var(--mm-space-1);
  border-radius: var(--mm-radius-md);
  transition: all var(--mm-transition-fast);
}

.action-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.1);
}

/* 상세 정보 */
.pet-details {
  display: flex;
  flex-direction: column;
  gap: var(--mm-space-3);
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--mm-space-3);
  font-size: var(--mm-text-sm);
  color: var(--mm-on-surface-variant);
}

.detail-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: var(--mm-radius-md);
  flex-shrink: 0;
}

.detail-text {
  font-weight: var(--mm-font-weight-medium);
  line-height: 1.2;
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .pet-image-section {
    height: 180px;
  }
  
  .pet-info-section {
    padding: var(--mm-space-5);
    gap: var(--mm-space-3);
  }
  
  .pet-name {
    font-size: var(--mm-text-lg);
  }
  
  .detail-item {
    font-size: var(--mm-text-xs);
    gap: var(--mm-space-2);
  }
  
  .detail-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 768px) {
  .pet-image-section {
    height: 160px;
  }
  
  .pet-info-section {
    padding: var(--mm-space-4);
  }
  
  .pet-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--mm-space-2);
  }
  
  .pet-actions {
    justify-content: center;
    gap: var(--mm-space-2);
  }
  
  .action-btn {
    padding: var(--mm-space-2);
  }
  
  .detail-item {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pet-image-section {
    height: 140px;
  }
  
  .pet-info-section {
    padding: var(--mm-space-3);
    gap: var(--mm-space-2);
  }
  
  .pet-name {
    font-size: var(--mm-text-base);
    text-align: center;
  }
  
  .pet-actions {
    gap: var(--mm-space-1);
  }
  
  .action-btn {
    padding: var(--mm-space-1);
  }
  
  .detail-item {
    font-size: var(--mm-text-xs);
    gap: var(--mm-space-1);
  }
  
  .detail-icon {
    width: 18px;
    height: 18px;
  }
  
  .representative-badge {
    top: var(--mm-space-2);
    right: var(--mm-space-2);
    padding: var(--mm-space-1) var(--mm-space-2);
    font-size: 0.6rem;
  }
  
  .representative-badge .v-icon {
    font-size: 12px;
  }
}
</style>
