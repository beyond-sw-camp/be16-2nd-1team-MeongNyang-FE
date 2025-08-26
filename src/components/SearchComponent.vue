<template>
  <div class="search-component">
    <div class="search-container">
      <!-- 검색 타입 선택 -->
      <v-select
        v-model="localSearchType"
        :items="searchTypes"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="comfortable"
        hide-details
        class="search-type-select"
        :menu-props="{ maxHeight: 200 }"
        @update:model-value="handleSearchTypeChange"
      ></v-select>
      
      <!-- 검색 입력 필드 -->
      <div class="search-input-container">
        <v-text-field
          v-model="searchKeyword"
          placeholder="검색어를 입력하세요..."
          variant="outlined"
          density="comfortable"
          hide-details
          class="search-input"
          @keyup.enter="handleSearch"
          @update:model-value="handleSearchInput"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <template v-slot:append>
            <v-icon 
              color="#FF8B8B" 
              size="24"
              class="search-icon"
              @click="handleSearch"
            >
              mdi-magnify
            </v-icon>
          </template>
        </v-text-field>
        
        <!-- 자동완성 드롭다운 -->
        <div v-if="showAutocomplete && autocompleteItems.length > 0" class="autocomplete-dropdown">
          <div 
            v-for="(item, index) in autocompleteItems" 
            :key="index"
            class="autocomplete-item"
            :class="{ 'selected': index === selectedIndex }"
            @click="selectAutocompleteItem(item)"
            @mouseenter="selectedIndex = index"
          >
            <v-icon size="18" color="#FF8B8B" class="autocomplete-icon">
              mdi-magnify
            </v-icon>
            <span class="autocomplete-text">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchComponent',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    searchType: {
      type: String,
      default: 'CONTENT'
    }
  },
  emits: ['update:modelValue', 'update:searchType', 'search', 'clear'],
  data() {
    return {
      searchKeyword: this.modelValue,
      localSearchType: this.searchType,
      searchTypes: [
        { label: '내용', value: 'CONTENT' },
        { label: '사용자', value: 'USER' },
        { label: '해시태그', value: 'HASHTAG' }
      ],
      // 자동완성 관련 데이터
      showAutocomplete: false,
      autocompleteItems: [],
      selectedIndex: -1,
      // 더미 자동완성 데이터
      autocompleteData: {
        CONTENT: [
          '오늘은 정말 행복한 하루였어요',
          '산책하면서 만난 친구들',
          '새로운 장난감을 선물받았어요',
          '병원에서 건강검진을 받았어요',
          '훈련이 잘 되고 있어요',
          '맛있는 간식을 먹었어요',
          '놀이터에서 신나게 놀았어요',
          '잠자리에서 곤히 자고 있어요'
        ],
        USER: [
          '냥냥이맘',
          '강아지사랑',
          '펫파더',
          '동물친구',
          '반려동물전문가',
          '애완동물러버',
          '펫샵매니저',
          '동물병원의사'
        ],
        HASHTAG: [
          '#냥냥이',
          '#강아지',
          '#반려동물',
          '#펫샵',
          '#동물병원',
          '#산책',
          '#훈련',
          '#간식'
        ]
      }
    }
  },
  watch: {
    modelValue(newVal) {
      this.searchKeyword = newVal
    },
    searchType(newVal) {
      this.localSearchType = newVal
    }
  },
  methods: {
    handleSearchTypeChange(newType) {
      this.localSearchType = newType
      this.$emit('update:searchType', newType)
      this.updateAutocomplete()
    },
    handleSearch() {
      if (this.searchKeyword && this.searchKeyword.trim()) {
        this.$emit('search', {
          searchType: this.localSearchType,
          keyword: this.searchKeyword.trim()
        })
        this.hideAutocomplete()
      }
    },
    // 자동완성 관련 메서드들
    updateAutocomplete() {
      if (!this.searchKeyword || this.searchKeyword.trim().length < 1) {
        this.hideAutocomplete()
        return
      }
      
      const keyword = this.searchKeyword.trim().toLowerCase()
      const data = this.autocompleteData[this.localSearchType] || []
      
      this.autocompleteItems = data.filter(item => 
        item.toLowerCase().includes(keyword)
      ).slice(0, 5) // 최대 5개만 표시
      
      this.showAutocomplete = this.autocompleteItems.length > 0
      this.selectedIndex = -1
    },
    selectAutocompleteItem(item) {
      this.searchKeyword = item
      this.$emit('update:modelValue', item)
      this.hideAutocomplete()
      this.handleSearch()
    },
    handleKeydown(event) {
      if (!this.showAutocomplete) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          this.selectedIndex = Math.min(this.selectedIndex + 1, this.autocompleteItems.length - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
          break
        case 'Enter':
          if (this.selectedIndex >= 0) {
            event.preventDefault()
            this.selectAutocompleteItem(this.autocompleteItems[this.selectedIndex])
          }
          break
        case 'Escape':
          this.hideAutocomplete()
          break
      }
    },
    handleFocus() {
      if (this.searchKeyword && this.searchKeyword.trim().length >= 1) {
        this.updateAutocomplete()
      }
    },
    handleBlur() {
      // 약간의 지연을 두어 클릭 이벤트가 처리될 수 있도록 함
      setTimeout(() => {
        this.hideAutocomplete()
      }, 150)
    },
    hideAutocomplete() {
      this.showAutocomplete = false
      this.selectedIndex = -1
    },
    handleSearchInput() {
      this.$emit('update:modelValue', this.searchKeyword)
      this.updateAutocomplete()
      
      // 디바운스 처리
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        if (this.searchKeyword && this.searchKeyword.trim()) {
          this.handleSearch()
        } else if (!this.searchKeyword || !this.searchKeyword.trim()) {
          this.$emit('clear')
        }
      }, 500)
    },
  }
}
</script>

<style scoped>
.search-component {
  margin-bottom: 32px;
  padding: 0 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 1600px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.search-container:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.search-container:focus-within {
  border-color: #FF8B8B;
  box-shadow: 0 6px 20px rgba(255, 139, 139, 0.15);
}

/* 검색 타입 선택 스타일 */
.search-type-select {
  min-width: 80px;
  max-width: 80px;
  flex-shrink: 0;
}

.search-type-select :deep(.v-field) {
  background: #F8FAFC !important;
  border-radius: 10px !important;
  border: 1px solid #E2E8F0 !important;
  font-size: 0.9rem;
  color: #475569;
  box-shadow: none;
  min-height: 48px;
  transition: all 0.3s ease;
}

.search-type-select :deep(.v-field:hover) {
  border-color: #CBD5E1 !important;
  background: #F1F5F9 !important;
}

.search-type-select :deep(.v-field--focused) {
  border-color: #FF8B8B !important;
  background: white !important;
  box-shadow: 0 0 0 3px rgba(255, 139, 139, 0.1);
}

.search-type-select :deep(.v-field__input) {
  color: #475569;
  font-weight: 500;
  padding: 12px 16px;
}

.search-type-select :deep(.v-field__append-inner) {
  color: #64748B;
}

/* 검색 입력 필드 스타일 */
.search-input-container {
  flex: 1;
  position: relative;
  min-width: 0;
}

.search-input {
  flex: 1;
  font-size: 0.95rem;
  min-width: 0;
}

.search-input :deep(.v-field) {
  background: #F8FAFC !important;
  border-radius: 10px !important;
  border: 1px solid #E2E8F0 !important;
  box-shadow: none;
  min-height: 48px;
  transition: all 0.3s ease;
  width: 100%;
}

.search-input :deep(.v-field:hover) {
  border-color: #CBD5E1 !important;
  background: #F1F5F9 !important;
}

.search-input :deep(.v-field--focused) {
  border-color: #FF8B8B !important;
  background: white !important;
  box-shadow: 0 0 0 3px rgba(255, 139, 139, 0.1);
}

.search-input :deep(.v-field__input) {
  color: #1E293B;
  padding: 12px 16px;
  font-weight: 500;
  width: 100%;
}

.search-input :deep(.v-field__input::placeholder) {
  color: #94A3B8;
  font-weight: 400;
}

.search-input :deep(.v-field__append-inner) {
  padding-right: 8px;
}

.search-icon {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
  color: #64748B;
}

.search-icon:hover {
  color: #FF8B8B !important;
  background: rgba(255, 139, 139, 0.1);
  transform: scale(1.05);
}

/* 자동완성 드롭다운 스타일 */
.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
  margin-top: 2px;
}

.autocomplete-item {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #F1F5F9;
}

.autocomplete-item:last-child {
  border-bottom: none;
  border-radius: 0 0 12px 12px;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
  background: #F8FAFC;
  color: #1E293B;
}

.autocomplete-icon {
  margin-right: 14px;
  flex-shrink: 0;
  opacity: 0.6;
  color: #64748B;
}

.autocomplete-text {
  color: #1E293B;
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .search-component {
    padding: 0 20px;
  }
  
  .search-container {
    max-width: 1400px;
    gap: 12px;
    padding: 14px 16px;
  }
}

@media (max-width: 768px) {
  .search-component {
    padding: 0 16px;
    margin-bottom: 24px;
  }
  
  .search-container {
    max-width: 1200px;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 14px;
  }
  
  .search-type-select {
    min-width: 70px;
    max-width: 70px;
  }
  
  .search-type-select :deep(.v-field) {
    min-height: 44px;
  }
  
  .search-type-select :deep(.v-field__input) {
    font-size: 0.85rem;
    padding: 10px 12px;
  }
  
  .search-input :deep(.v-field) {
    min-height: 44px;
  }
  
  .search-input :deep(.v-field__input) {
    font-size: 0.85rem;
    padding: 10px 12px;
  }
  
  .search-input :deep(.v-field__input::placeholder) {
    font-size: 0.85rem;
  }
  
  .search-icon {
    font-size: 20px !important;
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .search-component {
    padding: 0 12px;
    margin-bottom: 20px;
  }
  
  .search-container {
    max-width: 1000px;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
  }
  
  .search-type-select {
    min-width: 60px;
    max-width: 60px;
  }
  
  .search-type-select :deep(.v-field) {
    min-height: 40px;
  }
  
  .search-type-select :deep(.v-field__input) {
    font-size: 0.8rem;
    padding: 8px 10px;
  }
  
  .search-input :deep(.v-field) {
    min-height: 40px;
  }
  
  .search-input :deep(.v-field__input) {
    font-size: 0.8rem;
    padding: 8px 10px;
  }
  
  .search-input :deep(.v-field__input::placeholder) {
    font-size: 0.8rem;
  }
  
  .search-icon {
    font-size: 18px !important;
    padding: 5px;
  }
  
  .autocomplete-item {
    padding: 12px 14px;
  }
  
  .autocomplete-text {
    font-size: 0.85rem;
  }
}
</style>
