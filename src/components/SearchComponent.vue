<template>
  <div class="search-component">
    <div class="search-container">
              <v-select
          v-model="localSearchType"
          :items="searchTypes"
          item-title="label"
          item-value="value"
          variant="plain"
          density="compact"
          hide-details
          class="search-type-select"
          :menu-props="{ maxHeight: 200 }"
          @update:model-value="handleSearchTypeChange"
        ></v-select>
              <div class="search-input-container">
          <v-text-field
            v-model="searchKeyword"
            placeholder="검색어를 입력하세요..."
            variant="plain"
            density="compact"
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
                color="#94A3B8" 
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
              <v-icon size="16" color="#94A3B8" class="autocomplete-icon">
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
      default: 'TITLE'
    }
  },
  emits: ['update:modelValue', 'update:searchType', 'search', 'clear'],
  data() {
    return {
      searchKeyword: this.modelValue,
      localSearchType: this.searchType,
      searchTypes: [
        { label: '제목', value: 'TITLE' },
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
        TITLE: [
          '냥냥이 일기',
          '강아지 산책',
          '반려동물 건강',
          '펫샵 후기',
          '동물병원 체험',
          '애완동물 훈련',
          '펫 사진',
          '동물 용품 리뷰'
        ],
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
          type: this.localSearchType,
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
  justify-content: flex-end;
  align-items: flex-start;
  padding-right: 20px;
}

@media (max-width: 1200px) {
  .search-component {
    padding: 0 20px;
    justify-content: center;
  }
  
  .search-container {
    width: 100%;
    max-width: 600px;
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .search-component {
    padding: 0 16px;
    margin-bottom: 24px;
  }
  
  .search-container {
    width: 100%;
    max-width: 500px;
  }
  
  .search-type-select {
    min-width: 80px;
    max-width: 80px;
  }
  
  .search-type-select :deep(.v-field__input) {
    font-size: 0.85rem;
    padding: 6px 8px;
  }
  
  .search-input :deep(.v-field__input) {
    font-size: 0.85rem;
    padding: 6px 8px;
  }
  
  .search-input :deep(.v-field__input::placeholder) {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .search-component {
    padding: 0 12px;
    margin-bottom: 20px;
  }
  
  .search-container {
    width: 100%;
    max-width: 400px;
    padding: 2px;
  }
  
  .search-type-select {
    min-width: 70px;
    max-width: 70px;
  }
  
  .search-type-select :deep(.v-field__input) {
    font-size: 0.8rem;
    padding: 4px 6px;
  }
  
  .search-input :deep(.v-field__input) {
    font-size: 0.8rem;
    padding: 4px 6px;
  }
  
  .search-input :deep(.v-field__input::placeholder) {
    font-size: 0.8rem;
  }
  
  .search-icon {
    font-size: 20px !important;
  }
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0;
  width: 600px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-right: -20px;
  margin-left: auto;
  padding: 4px;
}

.search-type-select {
  min-width: 90px;
  max-width: 90px;
  flex-shrink: 0;
  margin-right: 8px;
}

.search-type-select :deep(.v-field) {
  border-radius: 8px;
  background: transparent;
  border: none;
  font-size: 0.9rem;
  color: #1E293B;
  box-shadow: none;
  min-height: 36px;
}

.search-type-select :deep(.v-field:hover) {
  border-color: transparent;
  box-shadow: none;
}

.search-type-select :deep(.v-field--focused) {
  border-color: transparent;
  box-shadow: none;
}

.search-type-select :deep(.v-field__input) {
  color: #1E293B;
  font-weight: 500;
  padding: 8px 12px;
}

.search-input-container {
  flex: 1;
  position: relative;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  font-size: 0.9rem;
}

.search-input :deep(.v-field) {
  border-radius: 8px;
  background: transparent;
  border: none;
  box-shadow: none;
  min-height: 36px;
}

.search-input :deep(.v-field:hover) {
  border-color: transparent;
  box-shadow: none;
}

.search-input :deep(.v-field--focused) {
  border-color: transparent;
  box-shadow: none;
}

.search-input :deep(.v-field__input) {
  color: #1E293B;
  padding: 8px 12px;
}

.search-input :deep(.v-field__input::placeholder) {
  color: #94A3B8;
}

.search-icon {
  cursor: pointer;
  transition: color 0.2s ease;
}

.search-icon:hover {
  color: #1E293B !important;
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
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.autocomplete-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #F1F5F9;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
  background-color: #F8FAFC;
}

.autocomplete-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.autocomplete-text {
  color: #1E293B;
  font-size: 0.9rem;
  flex: 1;
}
</style>
