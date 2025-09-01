<template>
  <div class="search-page">
    <!-- 검색 컴포넌트 -->
    <div class="search-container">
      <SearchBar
        @search="handleSearch"
      />
    </div>

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
import SearchBar from '@/components/common/SearchBar.vue'
import SearchResultsComponent from '@/components/SearchResultsComponent.vue'
import { postAPI, userAPI } from '@/services/api'
import { handleApiError } from '@/utils/errorHandler'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'SearchView',
  components: {
    SearchBar,
    SearchResultsComponent
  },
  setup() {
    const $router = useRouter()
    const $route = useRoute()
    const authStore = useAuthStore()
    
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
                      
                      // 검색 결과에 댓글 수와 팔로우 상태 추가
                      if (searchResults.value.length > 0) {
                        await Promise.all([
                          fetchAllCommentsCount(),
                          fetchAllFollowStatus()
                        ])
                      }
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
                
                // 모든 포스트의 댓글 수 조회
                const fetchAllCommentsCount = async () => {
                  try {
                    console.log('=== 모든 포스트 댓글 수 조회 시작 ===')
                    
                    const promises = searchResults.value.map(async (post) => {
                      try {
                        console.log(`=== 포스트 ${post.id} 댓글 수 조회 ===`)
                        const response = await postAPI.getCommentsCount(post.id)
                        console.log(`포스트 ${post.id} 댓글 수 API 응답:`, response)
                        
                        const commentsCount = response.data?.data?.commentsCount || 0
                        console.log(`포스트 ${post.id} 댓글 수 추출:`, commentsCount)
                        
                        // 검색 결과에서 해당 포스트 업데이트
                        const postIndex = searchResults.value.findIndex(p => p.id === post.id)
                        if (postIndex !== -1) {
                          searchResults.value[postIndex].commentsCount = commentsCount
                        }
                        
                        return { postId: post.id, commentsCount }
                      } catch (error) {
                        console.error(`포스트 ${post.id} 댓글 수 조회 실패:`, error)
                        return { postId: post.id, commentsCount: 0 }
                      }
                    })
                    
                    const results = await Promise.all(promises)
                    console.log('=== 모든 포스트 댓글 수 조회 완료 ===', results)
                    
                  } catch (error) {
                    console.error('전체 댓글 수 조회 실패:', error)
                  }
                }

                // 모든 포스트의 팔로우 상태 가져오기
                const fetchAllFollowStatus = async () => {
                  try {
                    console.log('=== 모든 포스트 팔로우 상태 조회 시작 ===')
                    
                    // 현재 로그인한 사용자가 있는 경우에만 실행
                    const currentUserId = authStore.user?.userId || authStore.user?.id
                    if (!currentUserId) {
                      console.log('로그인한 사용자가 없어 팔로우 상태 조회 건너뜀')
                      return
                    }
                    
                    // 현재 로드된 모든 포스트에 대해 팔로우 상태 조회
                    const promises = searchResults.value.map(async (post) => {
                      // 내 게시글이면 팔로우 상태 조회 불필요
                      if (post.userId === currentUserId) {
                        return { postId: post.id, isFollowing: null }
                      }
                      
                      try {
                        console.log(`=== 포스트 ${post.id} 팔로우 상태 조회 ===`)
                        console.log('post 객체:', post)
                        console.log('post.userId:', post.userId, '타입:', typeof post.userId)
                        console.log('post.userId 값이 유효한지:', post.userId && post.userId > 0)
                        
                        if (!post.userId || post.userId <= 0) {
                          console.error(`포스트 ${post.id}의 userId가 유효하지 않음:`, post.userId)
                          return { postId: post.id, isFollowing: false }
                        }
                        
                        console.log(`API 호출 시작: userAPI.checkFollowStatus(${post.userId})`)
                        const response = await userAPI.checkFollowStatus(post.userId)
                        console.log(`포스트 ${post.id} 팔로우 상태 API 응답:`, response)
                        console.log(`포스트 ${post.id} 팔로우 상태 API 응답 데이터:`, response.data)
                        console.log(`포스트 ${post.id} 팔로우 상태 API 응답 전체 구조:`, JSON.stringify(response, null, 2))
                        
                        const isFollowing = response.data?.data?.isFollowing || false
                        console.log(`포스트 ${post.id} 팔로우 상태 추출:`, isFollowing)
                        console.log(`response.data?.data?.isFollowing 값:`, response.data?.data?.isFollowing)
                        
                        // 검색 결과에서 해당 포스트 업데이트
                        const postIndex = searchResults.value.findIndex(p => p.id === post.id)
                        if (postIndex !== -1) {
                          searchResults.value[postIndex].isFollowing = isFollowing
                        }
                        
                        return { postId: post.id, isFollowing }
                      } catch (error) {
                        console.error(`포스트 ${post.id} 팔로우 상태 조회 실패:`, error)
                        return { postId: post.id, isFollowing: false }
                      }
                    })
                    
                    const results = await Promise.all(promises)
                    console.log('=== 모든 포스트 팔로우 상태 조회 완료 ===', results)
                    
                  } catch (error) {
                    console.error('전체 팔로우 상태 조회 실패:', error)
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
                      const newResults = Array.isArray(searchData) ? searchData : []
                      searchResults.value = [...searchResults.value, ...newResults]
                      
                      // 새로 추가된 결과에 댓글 수와 팔로우 상태 추가
                      if (newResults.length > 0) {
                        await Promise.all([
                          fetchAllCommentsCount(),
                          fetchAllFollowStatus()
                        ])
                      }
                      
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
                  console.log('SearchView - 검색 데이터 수신:', searchData)
                  searchType.value = searchData.searchType
                  searchKeyword.value = searchData.keyword
                  showSearchResults.value = true
                  currentPage.value = 0
                  hasMore.value = true
                  performSearch(searchType.value, searchKeyword.value)
                }
    
                    // 검색 초기화
                const handleClearSearch = () => {
                  searchKeyword.value = ''
                  showSearchResults.value = false
                  searchResults.value = []
                  currentPage.value = 0
                  hasMore.value = true
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
