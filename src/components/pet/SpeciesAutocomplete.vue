<template>
  <div class="species-autocomplete">
    <FormField
      v-model="searchQuery"
      :label="label"
      :placeholder="placeholder"
      :rules="rules"
      :required="required"
      :disabled="disabled"
      :loading="loading"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #prepend>
        <v-icon>mdi-magnify</v-icon>
      </template>
    </FormField>

    <!-- 검색 결과 드롭다운 -->
    <v-card
      v-if="showDropdown && filteredSpecies.length > 0"
      class="species-dropdown"
      elevation="4"
    >
      <v-list>
        <v-list-item
          v-for="species in filteredSpecies"
          :key="species.id"
          @click="selectSpecies(species)"
          class="species-item"
          :class="{ 'selected': selectedSpeciesId === species.id }"
        >
          <template #prepend>
            <v-icon color="primary">mdi-paw</v-icon>
          </template>
          
          <v-list-item-title class="species-name">
            {{ species.species }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="species-details">
            {{ species.petOrder }} • {{ getSizeLabel(species.size) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- 선택된 종류 표시 -->
    <div v-if="selectedSpecies && !showDropdown" class="selected-species">
      <v-chip
        color="primary"
        variant="outlined"
        closable
        @click:close="clearSelection"
      >
        <v-icon start>mdi-paw</v-icon>
        {{ selectedSpecies.species }}
        <span class="ml-1 text-caption">({{ selectedSpecies.petOrder }})</span>
      </v-chip>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-indicator">
      <v-progress-circular
        indeterminate
        size="20"
        color="primary"
      />
      <span class="ml-2 text-caption">검색 중...</span>
    </div>

    <!-- 검색 결과 없음 -->
    <div v-if="showDropdown && !loading && filteredSpecies.length === 0 && searchQuery" class="no-results">
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-center text-grey">
            검색 결과가 없습니다
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePetStore } from '@/stores/pet'
import FormField from '@/components/ui/molecules/FormField.vue'

export default {
  name: 'SpeciesAutocomplete',
  components: {
    FormField
  },
  
  props: {
    modelValue: {
      type: [Number, String],
      default: null
    },
    label: {
      type: String,
      default: '반려동물 종류'
    },
    placeholder: {
      type: String,
      default: '종류를 검색하세요'
    },
    rules: {
      type: Array,
      default: () => []
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['update:modelValue', 'change'],
  
  setup(props, { emit }) {
    const petStore = usePetStore()
    
    // 반응형 데이터
    const searchQuery = ref('')
    const showDropdown = ref(false)
    const loading = ref(false)
    const debounceTimer = ref(null)
    const filteredSpecies = ref([])
    
    // 계산된 속성
    const selectedSpeciesId = computed(() => props.modelValue)
    
    const selectedSpecies = computed(() => {
      if (!selectedSpeciesId.value) return null
      return petStore.getSpecies.find(species => species.id === selectedSpeciesId.value)
    })
    
    // 크기 라벨 변환
    const getSizeLabel = (size) => {
      const sizeMap = {
        'SMALL': '소형',
        'MEDIUM': '중형',
        'LARGE': '대형'
      }
      return sizeMap[size] || size
    }
    
    // 입력 처리 (debounce 적용)
    const handleInput = () => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      
      debounceTimer.value = setTimeout(async () => {
        if (searchQuery.value.trim()) {
          await searchSpecies()
        } else {
          filteredSpecies.value = []
          showDropdown.value = false
        }
      }, 300) // 300ms debounce
    }
    
    // 종류 검색
    const searchSpecies = async () => {
      if (!searchQuery.value.trim()) return
      
      try {
        loading.value = true
        showDropdown.value = true
        
        const searchParams = {
          ...props.searchParams,
          species: searchQuery.value.trim()
        }
        
        const results = await petStore.searchSpecies(searchParams)
        filteredSpecies.value = results
      } catch (error) {
        console.error('Species search error:', error)
        filteredSpecies.value = []
      } finally {
        loading.value = false
      }
    }
    
    // 종류 선택
    const selectSpecies = (species) => {
      console.log('=== 종류 선택 상세 정보 ===')
      console.log('전체 species 객체:', species)
      console.log('species의 모든 키:', Object.keys(species))
      console.log('species.id:', species.id)
      console.log('species.speciesId:', species.speciesId)
      console.log('species.species:', species.species)
      
      // 백엔드 응답 구조에 따라 올바른 ID 필드 사용
      const speciesId = species.id || species.speciesId
      console.log('사용할 speciesId:', speciesId)
      
      emit('update:modelValue', speciesId)
      emit('change', species)
      searchQuery.value = species.species
      showDropdown.value = false
    }
    
    // 선택 해제
    const clearSelection = () => {
      emit('update:modelValue', null)
      emit('change', null)
      searchQuery.value = ''
      showDropdown.value = false
    }
    
    // 포커스 처리
    const handleFocus = () => {
      if (searchQuery.value.trim()) {
        showDropdown.value = true
      }
    }
    
    // 블러 처리
    const handleBlur = () => {
      // 드롭다운 클릭을 위한 지연
      setTimeout(() => {
        showDropdown.value = false
      }, 200)
    }
    
    // 외부 클릭 감지
    const handleClickOutside = (event) => {
      if (!event.target.closest('.species-autocomplete')) {
        showDropdown.value = false
      }
    }
    
    // 키보드 네비게이션
    const handleKeydown = (event) => {
      if (!showDropdown.value || filteredSpecies.value.length === 0) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          // TODO: 키보드 네비게이션 구현
          break
        case 'ArrowUp':
          event.preventDefault()
          // TODO: 키보드 네비게이션 구현
          break
        case 'Enter':
          event.preventDefault()
          // TODO: 첫 번째 항목 선택
          break
        case 'Escape':
          showDropdown.value = false
          break
      }
    }
    
    // 선택된 종류가 변경될 때 검색어 업데이트
    watch(selectedSpecies, (newSpecies) => {
      if (newSpecies) {
        searchQuery.value = newSpecies.species
      }
    })
    
    // 컴포넌트 마운트 시 종류 목록 로드
    onMounted(async () => {
      if (petStore.getSpecies.length === 0) {
        await petStore.fetchSpecies()
      }
      
      // 선택된 종류가 있다면 검색어 설정
      if (selectedSpecies.value) {
        searchQuery.value = selectedSpecies.value.species
      }
      
      // 이벤트 리스너 등록
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeydown)
    })
    
    // 컴포넌트 언마운트 시 정리
    onUnmounted(() => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    })
    
    return {
      searchQuery,
      showDropdown,
      loading,
      filteredSpecies,
      selectedSpeciesId,
      selectedSpecies,
      getSizeLabel,
      handleInput,
      handleFocus,
      handleBlur,
      selectSpecies,
      clearSelection
    }
  }
}
</script>

<style scoped>
.species-autocomplete {
  position: relative;
  width: 100%;
}

.species-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  margin-top: 4px;
}

.species-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.species-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.species-item.selected {
  background-color: rgba(var(--v-theme-primary), 0.2);
}

.species-name {
  font-weight: 500;
  color: var(--v-theme-on-surface);
}

.species-details {
  color: var(--v-theme-on-surface-variant);
  font-size: 0.875rem;
}

.selected-species {
  margin-top: 8px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: var(--v-theme-on-surface-variant);
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  border-radius: 8px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .species-dropdown {
    max-height: 250px;
  }
}
</style>
