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
      @search="handleSearch"
    />
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
    const $router = useRouter()
    
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
      
      // 기존 검색 결과 숨기기
      showSearchResults.value = false
      
      // 검색 조건 업데이트
      searchType.value = searchData.searchType
      searchKeyword.value = searchData.keyword
      
      // URL 업데이트
      const query = { searchType: searchData.searchType, keyword: searchData.keyword }
      $router.push({ path: '/search', query })
      
      // 다음 tick에서 검색 결과 표시 (props 업데이트를 위해)
      nextTick(() => {
        showSearchResults.value = true
      })
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
  background: #FFFAF0;
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
