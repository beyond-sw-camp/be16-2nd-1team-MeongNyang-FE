<template>
  <div class="search-component">
    <div class="search-container">
      <!-- 통합된 검색 입력 필드 -->
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
          <template v-slot:prepend-inner>
            <!-- 검색 타입 선택 버튼 -->
            <div class="search-type-selector">
              <v-btn
                variant="text"
                size="small"
                class="search-type-btn"
                :class="{ 'active': showTypeMenu }"
                @click.stop="toggleTypeMenu"
              >
                <span class="search-type-text">{{ getCurrentTypeLabel() }}</span>
                <v-icon size="16" class="search-type-icon">mdi-chevron-down</v-icon>
              </v-btn>
            </div>
          </template>
          
          <template v-slot:append-inner>
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
        
        <!-- 검색 타입 드롭다운 메뉴 -->
        <div v-if="showTypeMenu" class="search-type-dropdown">
          <div 
            v-for="type in searchTypes"
            :key="type.value"
            class="search-type-item"
            :class="{ 'selected': localSearchType === type.value }"
            @click="selectSearchType(type.value)"
          >
            {{ type.label }}
          </div>
        </div>
        
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
    },
    disableUserSearch: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:searchType', 'search', 'clear'],
  data() {
    return {
      searchKeyword: this.modelValue,
      localSearchType: this.searchType,
      allSearchTypes: [
        { label: '내용', value: 'CONTENT' },
        { label: '사용자', value: 'USER' },
        { label: '해시태그', value: 'HASHTAG' }
      ],
      // 자동완성 관련 데이터
      showAutocomplete: false,
      autocompleteItems: [],
      selectedIndex: -1,
      showTypeMenu: false, // 검색 타입 메뉴 상태
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
  computed: {
    searchTypes() {
      if (this.disableUserSearch) {
        return this.allSearchTypes.filter(type => type.value !== 'USER')
      }
      return this.allSearchTypes
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
        this.showTypeMenu = false
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
    // 검색 타입 선택 관련 메서드
    selectSearchType(type) {
      this.localSearchType = type
      this.showTypeMenu = false
      this.$emit('update:searchType', type)
      this.updateAutocomplete()
    },
    toggleTypeMenu() {
      this.showTypeMenu = !this.showTypeMenu
    },
    getCurrentTypeLabel() {
      const type = this.searchTypes.find(t => t.value === this.localSearchType)
      return type ? type.label : '내용' // 기본값
    }
  }
}
</script>

<style scoped>
/* 검색 컴포넌트 전체 스타일 */
.search-component {
  width: 100%;
  padding: 0;
  margin: 0;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 500px);
  max-width: 1100px;
  margin: 0;
  margin-left: -20px;
  margin-right: 100px;
  padding: 16px 20px;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.search-container:hover {
  box-shadow: none;
  transform: none;
}

.search-container:focus-within {
  border-color: #E2E8F0;
  box-shadow: none;
}

/* 통합된 검색 입력 필드 스타일 */
.search-input-container {
  flex: 1;
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  flex: 1;
  min-width: 0;
}

.search-input :deep(.v-field) {
  background: white !important;
  border: none !important;
  border-radius: 15px !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-height: auto !important;
  transition: none !important;
}

.search-input :deep(.v-field:hover) {
  border: none !important;
  background: white !important;
  box-shadow: none !important;
  transform: none !important;
}

.search-input :deep(.v-field--focused) {
  border: none !important;
  background: white !important;
  box-shadow: none !important;
  transform: none !important;
}

.search-input :deep(.v-field__input) {
  padding: 12px 16px;
  color: #1E293B;
  font-size: 1rem;
  background: white;
}

.search-input :deep(.v-field__prepend-inner) {
  padding-left: 16px;
  padding-right: 8px;
  border-right: none !important;
  background: transparent !important;
}

.search-input :deep(.v-field__append-inner) {
  padding-right: 16px;
  padding-left: 8px;
  border-left: none !important;
  background: transparent !important;
}

.search-input :deep(.v-field__outline) {
  display: none !important;
}

.search-input :deep(.v-field__field) {
  border: none !important;
  background: transparent !important;
}

.search-type-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-type-btn {
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  font-size: 0.85rem;
  color: #64748B;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
  min-width: auto !important;
  height: auto !important;
  text-transform: none;
  box-shadow: none !important;
  margin: 0 !important;
  line-height: 1;
  background: transparent !important;
}

.search-type-btn:hover {
  background-color: transparent !important;
  color: #FF8B8B;
  box-shadow: none !important;
  transform: none !important;
}

.search-type-btn.active {
  background-color: transparent !important;
  color: #FF8B8B;
  box-shadow: none !important;
}

.search-type-btn:focus {
  box-shadow: none !important;
  outline: none !important;
}

.search-type-btn:active {
  transform: none !important;
  box-shadow: none !important;
}

/* Vuetify 버튼 스타일 완전 덮어쓰기 */
.search-type-btn :deep(.v-btn__content) {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.search-type-btn :deep(.v-btn__prepend) {
  margin: 0 !important;
  padding: 0 !important;
}

.search-type-btn :deep(.v-btn__append) {
  margin: 0 !important;
  padding: 0 !important;
}

.search-type-text {
  white-space: nowrap;
  font-size: 0.85rem;
}

.search-type-icon {
  color: inherit;
  transition: transform 0.2s ease;
}

.search-type-btn.active .search-type-icon {
  transform: rotate(180deg);
}

.search-type-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  min-width: 120px;
  z-index: 999;
  overflow: hidden;
}

.search-type-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-type-item:hover {
  background-color: #F8FAFC;
}

.search-type-item.selected {
  background-color: #FF8B8B;
  color: white;
}

.search-type-item.selected .search-type-text {
  color: white;
  font-weight: 500;
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
  border-radius: 0 0 15px 15px;
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
  .search-container {
    max-width: 100%;
    padding: 12px 16px;
    gap: 8px;
  }
  
  .search-input :deep(.v-field__input) {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  
  .search-input :deep(.v-field__prepend-inner) {
    padding-left: 12px;
    padding-right: 6px;
  }
  
  .search-input :deep(.v-field__append-inner) {
    padding-right: 12px;
    padding-left: 6px;
  }
  
  .search-type-btn {
    padding: 3px 6px;
    font-size: 0.8rem;
  }
  
  .search-type-text {
    font-size: 0.8rem;
  }
  
  .search-type-icon {
    font-size: 14px !important;
  }
  
  .search-type-dropdown {
    min-width: 100px;
  }
  
  .search-type-item {
    padding: 8px 12px;
    min-height: 36px;
  }
  
  .search-icon {
    font-size: 20px !important;
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
  
  .search-type-btn {
    padding: 5px 8px;
    font-size: 0.75rem;
  }
  
  .search-type-text {
    font-size: 0.75rem;
  }
  
  .search-type-icon {
    font-size: 14px !important;
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
