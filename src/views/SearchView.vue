<template>
  <div class="search-page">
    <!-- 검색 컴포넌트 -->
    <SearchComponent
      v-model="searchKeyword"
      :search-type="searchType"
      @update:search-type="searchType = $event"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

                    <!-- 검색 결과 컴포넌트 -->
                <SearchResultsComponent
                  v-if="showSearchResults"
                  :search-keyword="searchKeyword"
                  :search-type="searchType"
                  :show-results="showSearchResults"
                  :search-results="searchResults"
                  :is-loading="isLoading"
                  :has-more="hasMore"
                  @result-click="handleSearchResultClick"
                />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SearchComponent from '@/components/SearchComponent.vue'
import SearchResultsComponent from '@/components/SearchResultsComponent.vue'
import { postAPI } from '@/services/api'
import { handleApiError } from '@/utils/errorHandler'

export default {
  name: 'SearchView',
  components: {
    SearchComponent,
    SearchResultsComponent
  },
  setup() {
    const $router = useRouter()
    const $route = useRoute()
    
                    // 검색 상태
                const searchType = ref('CONTENT')
                const searchKeyword = ref('')
                const showSearchResults = ref(false)
                const searchResults = ref([])
                const isLoading = ref(false)
                const currentPage = ref(0)
                const hasMore = ref(true)
    
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
                    performSearch(searchType.value, searchKeyword.value)
                  }
                  
                  // 스크롤 이벤트 리스너 추가
                  window.addEventListener('scroll', handleScroll)
                })
                
                onUnmounted(() => {
                  // 스크롤 이벤트 리스너 제거
                  window.removeEventListener('scroll', handleScroll)
                })
    
                    // 실제 검색 수행
                const performSearch = async (searchType, keyword) => {
                  try {
                    console.log('=== 검색 실행 ===')
                    console.log('검색 타입:', searchType, typeof searchType)
                    console.log('검색어:', keyword, typeof keyword)
                    
                    isLoading.value = true
                    searchResults.value = []
                    currentPage.value = 0
                    
                    const response = await postAPI.search(searchType, keyword, { page: 0, size: 20 })
                    console.log('검색 응답:', response)
                    
                    if (response.data && response.data.data) {
                      let searchData = []
                      
                      if (response.data.data.content) {
                        // Page 구조: response.data.data.content
                        searchData = response.data.data.content
                      } else if (Array.isArray(response.data.data)) {
                        // 직접 배열 구조
                        searchData = response.data.data
                      } else {
                        searchData = response.data.data
                      }
                      
                      console.log('추출된 검색 데이터:', searchData)
                      searchResults.value = Array.isArray(searchData) ? searchData : []
                    } else {
                      console.log('검색 결과 데이터가 없음')
                      searchResults.value = []
                    }
                  } catch (error) {
                    console.error('검색 실패:', error)
                    searchResults.value = []
                    handleApiError(error, $router, '검색에 실패했습니다.')
                  } finally {
                    isLoading.value = false
                  }
                }
                
                // 무한 스크롤용 검색 (추가 페이지)
                const performSearchMore = async (page) => {
                  try {
                    console.log('=== 무한 스크롤 검색 실행 ===')
                    console.log('페이지:', page)
                    
                    isLoading.value = true
                    
                    const response = await postAPI.search(searchType.value, searchKeyword.value, { page, size: 20 })
                    console.log('무한 스크롤 검색 응답:', response)
                    
                    if (response.data && response.data.data) {
                      let searchData = []
                      
                      if (response.data.data.content) {
                        // Page 구조: response.data.data.content
                        searchData = response.data.data.content
                      } else if (Array.isArray(response.data.data)) {
                        // 직접 배열 구조
                        searchData = response.data.data
                      } else {
                        searchData = response.data.data
                      }
                      
                      console.log('추출된 무한 스크롤 검색 데이터:', searchData)
                      
                      // 기존 결과에 추가
                      searchResults.value = [...searchResults.value, ...(Array.isArray(searchData) ? searchData : [])]
                      
                      // 더 불러올 데이터가 있는지 확인
                      hasMore.value = !response.data.data.last
                      currentPage.value = page
                    } else {
                      console.log('무한 스크롤 검색 결과 데이터가 없음')
                      hasMore.value = false
                    }
                  } catch (error) {
                    console.error('무한 스크롤 검색 실패:', error)
                    hasMore.value = false
                    handleApiError(error, $router, '추가 검색에 실패했습니다.')
                  } finally {
                    isLoading.value = false
                  }
                }
                
                // 검색 처리
                const handleSearch = (searchData) => {
                  searchType.value = searchData.searchType
                  searchKeyword.value = searchData.keyword
                  showSearchResults.value = true
                  currentPage.value = 0
                  hasMore.value = true
                  
                  // URL 쿼리 파라미터 업데이트
                  $router.push({
                    path: '/search',
                    query: {
                      searchType: searchData.searchType,
                      keyword: searchData.keyword
                    }
                  })
                  
                  performSearch(searchType.value, searchKeyword.value)
                }
    
                    // 검색 초기화
                const handleClearSearch = () => {
                  searchKeyword.value = ''
                  showSearchResults.value = false
                  searchResults.value = []
                  currentPage.value = 0
                  hasMore.value = true
                  
                  // URL 쿼리 파라미터 제거
                  $router.push({
                    path: '/search',
                    query: {}
                  })
                }
    
                    // 검색 결과 클릭 처리
                const handleSearchResultClick = (result) => {
                  // 검색 결과에서 다이어리 상세로 이동
                  $router.push(`/diary/${result.id}`)
                }
                
                // 무한 스크롤 처리
                const handleScroll = () => {
                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                  const windowHeight = window.innerHeight
                  const documentHeight = document.documentElement.scrollHeight
                  
                  if (scrollTop + windowHeight >= documentHeight - 100 && !isLoading.value && hasMore.value) {
                    // 무한 스크롤 시 다음 페이지 검색
                    performSearchMore(currentPage.value + 1)
                  }
                }
    
                    return {
                  searchType,
                  searchKeyword,
                  showSearchResults,
                  searchResults,
                  isLoading,
                  hasMore,
                  handleSearch,
                  handleClearSearch,
                  handleSearchResultClick,
                  handleScroll,
                  performSearchMore
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
  width: 100%;
}

/* 검색 컴포넌트를 가운데 정렬 */
.search-page > :first-child {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 32px;
}
</style>
