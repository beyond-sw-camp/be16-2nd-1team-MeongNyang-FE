<template>
  <div class="search-page">
    <!-- 검색 컴포넌트 -->
    <div class="search-container">
      <SearchBar
        @search="handleSearch"
      />
    </div>

    <!-- 검색 결과 컴포넌트 -->
    <SearchResultsView
      v-if="showSearchResults"
      :search-keyword="searchKeyword"
      :search-type="searchType"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SearchBar from '@/components/common/SearchBar.vue'
import SearchResultsView from '@/components/SearchResultsView.vue'

export default {
  name: 'SearchView',
  components: {
    SearchBar,
    SearchResultsView
  },
  setup() {
    const $route = useRoute()
    
    // 검색 상태
    const searchType = ref('CONTENT')
    const searchKeyword = ref('')
    const showSearchResults = ref(false)
    
    // URL 쿼리 파라미터에서 초기 검색어 설정
    onMounted(() => {
      console.log('SearchView - URL 쿼리 파라미터:', $route.query)
      
      if ($route.query.searchType) {
        searchType.value = $route.query.searchType
        console.log('SearchView - 설정된 searchType:', searchType.value)
      }
      if ($route.query.keyword) {
        searchKeyword.value = $route.query.keyword
        console.log('SearchView - 설정된 keyword:', searchKeyword.value)
        showSearchResults.value = true
      }
    })
    
    // 검색 처리
    const handleSearch = (searchData) => {
      console.log('SearchView - 검색 데이터 수신:', searchData)
      searchType.value = searchData.searchType
      searchKeyword.value = searchData.keyword
      showSearchResults.value = true
    }
    
    return {
      searchType,
      searchKeyword,
      showSearchResults,
      handleSearch
    }
  }
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-container {
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .search-container {
    padding: 0 16px;
    margin-bottom: 24px;
  }
}

@media (max-width: 480px) {
  .search-container {
    padding: 0 12px;
    margin-bottom: 20px;
  }
}
</style>
