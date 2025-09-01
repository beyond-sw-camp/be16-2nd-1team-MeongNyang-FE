<template>
  <div class="search-component">
    <div class="search-container">
      <!-- 검색 타입 선택 -->
      <v-select
        v-model="searchType"
        :items="searchTypes"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        class="search-type-select"
        :menu-props="{ maxHeight: 200 }"
      ></v-select>
      
      <!-- 검색 입력 필드 -->
      <div class="search-input-container">
        <v-text-field
          v-model="searchKeyword"
          placeholder="검색어를 입력하세요..."
          variant="outlined"
          density="compact"
          hide-details
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template v-slot:append>
            <v-icon 
              color="#FF8B8B" 
              size="20"
              class="search-icon"
              @click="handleSearch"
            >
              mdi-magnify
            </v-icon>
          </template>
        </v-text-field>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  emits: ['search'],
  data() {
    return {
      searchKeyword: '',
      searchType: 'CONTENT',
      searchTypes: [
        { label: '내용', value: 'CONTENT' },
        { label: '사용자', value: 'USER' },
        { label: '해시태그', value: 'HASHTAG' }
      ]
    }
  },
  methods: {
    handleSearch() {
      if (this.searchKeyword && this.searchKeyword.trim()) {
        this.$emit('search', {
          searchType: this.searchType,
          keyword: this.searchKeyword.trim()
        })
      }
    }
  }
}
</script>

<style scoped>
.search-component {
  margin-bottom: 20px;
  padding: 0;
  width: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  min-width: 70px;
  max-width: 70px;
  flex-shrink: 0;
}

.search-type-select :deep(.v-field) {
  background: #F8FAFC !important;
  border-radius: 8px !important;
  border: 1px solid #E2E8F0 !important;
  font-size: 0.8rem;
  color: #475569;
  box-shadow: none;
  min-height: 36px;
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
  padding: 8px 10px;
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
  border-radius: 8px !important;
  border: 1px solid #E2E8F0 !important;
  box-shadow: none;
  min-height: 36px;
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
  padding: 8px 12px;
  font-weight: 500;
  width: 100%;
  font-size: 0.85rem;
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
  padding: 6px;
  border-radius: 6px;
  color: #64748B;
}

.search-icon:hover {
  color: #FF8B8B !important;
  background: rgba(255, 139, 139, 0.1);
  transform: scale(1.05);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .search-container {
    gap: 6px;
    padding: 10px;
  }
  
  .search-type-select {
    min-width: 65px;
    max-width: 65px;
  }
  
  .search-type-select :deep(.v-field) {
    min-height: 32px;
  }
  
  .search-type-select :deep(.v-field__input) {
    font-size: 0.75rem;
    padding: 6px 8px;
  }
  
  .search-input :deep(.v-field) {
    min-height: 32px;
  }
  
  .search-input :deep(.v-field__input) {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
  
  .search-icon {
    font-size: 18px !important;
    padding: 4px;
  }
}

@media (max-width: 480px) {
  .search-component {
    margin-bottom: 16px;
  }
  
  .search-container {
    gap: 4px;
    padding: 8px;
    border-radius: 10px;
  }
  
  .search-type-select {
    min-width: 60px;
    max-width: 60px;
  }
  
  .search-type-select :deep(.v-field) {
    min-height: 28px;
  }
  
  .search-type-select :deep(.v-field__input) {
    font-size: 0.7rem;
    padding: 4px 6px;
  }
  
  .search-input :deep(.v-field) {
    min-height: 28px;
  }
  
  .search-input :deep(.v-field__input) {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
  
  .search-icon {
    font-size: 16px !important;
    padding: 3px;
  }
}
</style>
