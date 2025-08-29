<template>
  <div class="diary-page">
    <!-- 검색 컴포넌트 -->
    <SearchComponent
      v-model="searchKeyword"
      :search-type="searchType"
      @update:search-type="searchType = $event"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-container">
        <!-- 프로필 이미지 -->
        <div class="profile-image-container" @click="showMainPetModal = true">
          <v-avatar size="120" class="profile-avatar">
            <v-img 
              :src="mainPet?.url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=120&fit=crop&crop=center'" 
              :alt="mainPet?.name || '프로필 이미지'"
            ></v-img>
          </v-avatar>
          <div class="edit-hint">
            <v-icon size="16">mdi-pencil</v-icon>
            <span>대표동물 변경</span>
          </div>
        </div>
        
        <!-- 사용자 정보 -->
        <div class="user-info">
          <div class="username-section">
            <h2 class="username">{{ displayUserName }}</h2>
            <div class="badges">
              <v-chip color="light-blue" size="small" class="badge">
                <v-icon size="16" class="me-1">mdi-check</v-icon>
                인증됨
              </v-chip>
              <v-chip color="amber" size="small" class="badge">
                <v-icon size="16" class="me-1">mdi-star</v-icon>
                프리미엄
              </v-chip>
              <v-chip color="light-green" size="small" class="badge">
                <v-icon size="16" class="me-1">mdi-trophy</v-icon>
                활동왕
              </v-chip>
            </div>
          </div>
          
          <!-- 통계 -->
          <div class="stats">
            <span class="stat-item">{{ postsCount }} 게시물</span>
            <span class="stat-item clickable" @click="openFollowModal('followers')">{{ followersCount }} 팔로워</span>
            <span class="stat-item clickable" @click="openFollowModal('followings')">{{ followingsCount }} 팔로잉</span>
          </div>
          
          <!-- 소개 -->
          <p class="bio">{{ petBio }}</p>
        </div>
        
        <!-- 추가 버튼 -->
        <v-btn icon class="add-button" size="large" @click="$router.push('/diarys/create')">
          <v-icon size="32">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>
    
                    <!-- 다이어리 그리드 -->
                <div class="diary-grid">
      <div class="grid-container">
                            <!-- 실제 다이어리 아이템들 -->
                    <div 
                      v-for="(diary, index) in diaryList" 
                      :key="diary.id" 
                      class="diary-item"
                      :class="{ 'featured': index === 0 }"
                      @click="viewDiary(diary.id)"
                    >
                      <v-img 
                        :src="diary.thumbnail || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center'" 
                        class="diary-image"
                        cover
                      ></v-img>
                    </div>
                    
                    <!-- 로딩 인디케이터 -->
                    <div v-if="isLoading" class="loading-indicator">
                      <v-progress-circular indeterminate color="#FF8B8B" size="32"></v-progress-circular>
                    </div>
      </div>
    </div>
    
    <!-- 대표동물 변경 모달 -->
    <v-dialog v-model="showMainPetModal" max-width="400">
      <v-card class="main-pet-modal">
        <v-card-title class="modal-title">
          대표동물 변경
        </v-card-title>
        
        <v-card-text class="modal-content">
          <div class="current-pet-section">
            <v-avatar size="60" class="current-pet-avatar">
              <v-img :src="mainPet?.url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=60&h=60&fit=crop&crop=center'"></v-img>
            </v-avatar>
            <v-select
              v-model="selectedPet"
              :items="userPets"
              item-title="name"
              item-value="name"
              label="대표동물 선택"
              variant="outlined"
              class="pet-select"
            ></v-select>
          </div>
        </v-card-text>
        
        <v-card-actions class="modal-actions">
          <v-btn 
            color="primary" 
            variant="elevated"
            @click="changeMainPet"
            class="change-button"
          >
            변경
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 팔로우/팔로워 모달 -->
    <FollowModal
      :is-visible="isFollowModalVisible"
      :user-id="currentUserId"
      :followers-count="followersCount"
      :followings-count="followingsCount"
      :initial-tab="followModalTab"
      @close="closeFollowModal"
      @follow-updated="handleFollowUpdated"
      @unfollow-updated="handleUnfollowUpdated"
    />
  </div>
</template>

<script>
            import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { validatePetAndRedirect } from '@/utils/petValidation'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { postAPI, userAPI, petAPI } from '@/services/api'
import SearchComponent from '@/components/SearchComponent.vue'
import FollowModal from '@/components/FollowModal.vue'

export default {
  name: 'DiaryListView',
  components: {
    SearchComponent,
    FollowModal
  },
  setup() {
    const $router = useRouter()
    const authStore = useAuthStore()
    const showMainPetModal = ref(false)
    const selectedPetName = ref(null)
    const isFollowModalVisible = ref(false)
    const followModalTab = ref('followers') // 기본값 설정
    
    // 현재 로그인한 사용자 ID
    const currentUserId = computed(() => {
      const user = authStore.user
      if (!user) return null
      
      // 가능한 ID 필드들을 확인
      const possibleIds = [
        user.id,
        user.userId,
        user.memberId,
        user.user_id,
        user.member_id,
        user.member?.id,
        user.member?.userId,
        user.member?.memberId
      ]
      
      return possibleIds.find(id => id != null && id !== undefined)
    })
    
    // 통계 데이터
    const postsCount = ref(0)
    const followersCount = ref(0)
    const followingsCount = ref(0)
    
    // 반려동물 데이터
    const userPets = ref([])
    const userName = ref('')
    
    // 사용자 이름 (반응형으로 표시)
    const displayUserName = computed(() => {
      console.log('displayUserName computed 실행:', userName.value)
      return userName.value || mainPet.value?.name || '사용자'
    })
    
    // 다이어리 데이터
    const diaryList = ref([])
    
    // 대표 반려동물 (여러 방법으로 찾기)
    const mainPet = computed(() => {
      console.log('=== mainPet computed 실행 ===')
      console.log('현재 userPets:', userPets.value)
      
      const foundPet = userPets.value.find(pet => pet.firstPet) || 
                      userPets.value.find(pet => pet.petOrder === 1) ||
                      userPets.value.find(pet => pet.isMain) ||
                      userPets.value.find(pet => pet.mainPet) ||
                      userPets.value[0] // 첫 번째 반려동물을 대표로 사용
      
      console.log('찾은 대표 반려동물:', foundPet)
      console.log('대표 반려동물 이름:', foundPet?.name)
      return foundPet || null
    })
    
    // 모달에서 선택된 펫 (기본값은 현재 대표 펫)
    const selectedPet = computed({
      get: () => selectedPetName.value || mainPet.value?.name || null,
      set: (value) => {
        selectedPetName.value = value
      }
    })
    
    // 대표 반려동물 소개글
    const petBio = computed(() => {
      return mainPet.value?.introduce || '반려동물과 함께하는 특별한 순간들을 기록해보세요!'
    })
    
    // 게시물 개수 가져오기
    const fetchPostsCount = async () => {
      try {
        // 내 일기 목록을 가져와서 개수 계산
        const response = await postAPI.getMyPosts({ page: 0, size: 1000 }) // 충분히 큰 size로 모든 일기 가져오기
        console.log('내 일기 목록 API 응답:', response.data)
        if (response.data && response.data.data) {
          const posts = response.data.data.content || []
          postsCount.value = posts.length
          console.log('계산된 게시물 개수:', postsCount.value)
        }
      } catch (error) {
        console.error('게시물 개수 조회 실패:', error)
        postsCount.value = 0
      }
    }
    
    // 팔로워 개수 가져오기
    const fetchFollowersCount = async () => {
      try {
        console.log('🔍 팔로워 개수 조회 시작')
        const response = await userAPI.getFollowersCount()
        console.log('📥 팔로워 개수 API 응답:', response)
        console.log('📥 팔로워 개수 응답 데이터:', response.data)
        
        if (response.data && response.data.data) {
          followersCount.value = response.data.data.totalElements || 0
          console.log('✅ 설정된 팔로워 개수:', followersCount.value)
        } else {
          console.log('⚠️ 팔로워 개수 데이터가 없음')
          followersCount.value = 0
        }
      } catch (error) {
        console.error('❌ 팔로워 개수 조회 실패:', error)
        console.error('❌ 에러 응답:', error.response?.data)
        followersCount.value = 0
      }
    }
    
    // 팔로잉 개수 가져오기
    const fetchFollowingsCount = async () => {
      try {
        console.log('🔍 팔로잉 개수 조회 시작')
        const response = await userAPI.getFollowingsCount()
        console.log('📥 팔로잉 개수 API 응답:', response)
        console.log('📥 팔로잉 개수 응답 데이터:', response.data)
        
        if (response.data && response.data.data) {
          followingsCount.value = response.data.data.totalElements || 0
          console.log('✅ 설정된 팔로잉 개수:', followingsCount.value)
        } else {
          console.log('⚠️ 팔로잉 개수 데이터가 없음')
          followingsCount.value = 0
        }
      } catch (error) {
        console.error('❌ 팔로잉 개수 조회 실패:', error)
        console.error('❌ 에러 응답:', error.response?.data)
        followingsCount.value = 0
      }
    }
    
    // 반려동물 목록 가져오기
    const fetchUserPets = async () => {
      console.log('=== fetchUserPets 시작 ===')
      try {
        console.log('petAPI.getUserPets() 호출 시작...')
        const response = await petAPI.getUserPets()
        console.log('petAPI.getUserPets() 응답:', response)
        console.log('응답 데이터:', response.data)
        
        if (response.data && response.data.data) {
          console.log('반려동물 데이터:', response.data.data)
          userPets.value = response.data.data.pets || []
          userName.value = response.data.data.userName || ''
          console.log('설정된 userPets:', userPets.value)
          console.log('설정된 userName:', userName.value)
          
          // 반려동물 객체의 모든 필드 확인
          if (userPets.value.length > 0) {
            console.log('첫 번째 반려동물의 모든 필드:', Object.keys(userPets.value[0]))
            console.log('첫 번째 반려동물 상세 데이터:', userPets.value[0])
          }
          
          // 대표 반려동물 확인 (여러 방법 시도)
          const mainPetData = userPets.value.find(pet => pet.firstPet) || 
                             userPets.value.find(pet => pet.petOrder === 1) ||
                             userPets.value.find(pet => pet.isMain) ||
                             userPets.value.find(pet => pet.mainPet) ||
                             userPets.value[0] // 첫 번째 반려동물을 대표로 사용
          console.log('대표 반려동물:', mainPetData)
          console.log('대표 반려동물 이름:', mainPetData?.name)
        } else {
          console.log('응답 데이터 구조가 예상과 다름')
          userPets.value = []
        }
      } catch (error) {
        console.error('반려동물 목록 조회 실패:', error)
        console.log('에러 응답:', error.response)
        console.log('에러 상태:', error.response?.status)
        console.log('에러 데이터:', error.response?.data)
        userPets.value = []
      }
      console.log('=== fetchUserPets 완료 ===')
    }
    
    
                
                // 검색 상태
                const searchType = ref('CONTENT')
                const searchKeyword = ref('')
                
                // 페이지네이션 상태
                const currentPage = ref(0)
                const hasMore = ref(true)
                const isLoading = ref(false)
                
                // 다이어리 목록 가져오기
                const fetchDiaryList = async (page = 0, append = false) => {
                  try {
                    isLoading.value = true
                    
                    let response
                    if (searchKeyword.value.trim()) {
                      // 검색이 있는 경우
                      response = await postAPI.search(searchType.value, searchKeyword.value.trim(), { page, size: 9 })
                    } else {
                      // 내 일기 목록 조회
                      response = await postAPI.getMyPosts({ page, size: 9 })
                    }
                    
                    if (response.data && response.data.data) {
                      const newContent = response.data.data.content || []
                      if (append) {
                        diaryList.value = [...diaryList.value, ...newContent]
                      } else {
                        diaryList.value = newContent
                      }
                      
                      // 더 불러올 데이터가 있는지 확인
                      hasMore.value = !response.data.data.last
                      currentPage.value = page
                    }
                  } catch (error) {
                    console.error('다이어리 목록 조회 실패:', error)
                    if (!append) {
                      diaryList.value = []
                    }
                  } finally {
                    isLoading.value = false
                  }
                }
                

                
                // 무한 스크롤 처리
                const handleScroll = () => {
                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                  const windowHeight = window.innerHeight
                  const documentHeight = document.documentElement.scrollHeight
                  
                  // 스크롤이 하단에 가까워지면 다음 페이지 로드
                  if (scrollTop + windowHeight >= documentHeight - 100 && !isLoading.value && hasMore.value) {
                    fetchDiaryList(currentPage.value + 1, true)
                  }
                }
    
                    // 다이어리 상세 보기
                const viewDiary = (diaryId) => {
                  if (diaryId) {
                    $router.push(`/diary/${diaryId}`)
                  }
                }
                
                // 검색 처리
                const handleSearch = (searchData) => {
                  searchType.value = searchData.searchType
                  searchKeyword.value = searchData.keyword
                  // 검색 시 새로운 검색 페이지로 이동
                  $router.push({
                    path: '/search',
                    query: {
                      searchType: searchData.searchType,
                      keyword: searchData.keyword
                    }
                  })
                }
                
                // 검색 초기화
                const handleClearSearch = () => {
                  searchKeyword.value = ''
                }
                

    

    

    
    const changeMainPet = async () => {
      try {
        if (!selectedPet.value) {
          alert('동물을 선택해주세요')
          return
        }
        
        // 선택된 펫 찾기
        const selectedPetData = userPets.value.find(pet => pet.name === selectedPet.value)
        if (!selectedPetData) {
          alert('선택된 동물을 찾을 수 없습니다')
          return
        }
        
        // 백엔드 API 호출
        await petAPI.setMainPet()
        
        // 성공 메시지
        alert('대표동물이 변경되었습니다!')
        
        // 모달 닫기
        showMainPetModal.value = false
        
        // 선택값 초기화
        selectedPetName.value = null
        
        // 데이터 새로고침
        await fetchUserPets()
        
      } catch (error) {
        console.error('대표동물 변경 실패:', error)
        alert('대표동물 변경에 실패했습니다.')
      }
    }
    
    // 팔로우/팔로워 모달 처리
    const openFollowModal = async (type) => {
      console.log('🔍 DiaryListView openFollowModal 호출됨')
      console.log('🔍 type:', type)
      
      // 모달 열기 전에 팔로우/팔로워 숫자 갱신
      console.log('🔄 모달 열기 전 팔로우/팔로워 숫자 갱신')
      await Promise.all([
        fetchFollowersCount(),
        fetchFollowingsCount()
      ])
      
      // 탭 설정을 먼저 하고 모달 열기
      console.log('🔍 설정할 탭:', type)
      followModalTab.value = type
      
      // 모달 열기
      isFollowModalVisible.value = true
    }

    const closeFollowModal = () => {
      isFollowModalVisible.value = false
    }
    
    // 팔로우 업데이트 처리
    const handleFollowUpdated = async () => {
      console.log('🔄 팔로우 업데이트 - 숫자 재조회')
      await Promise.all([
        fetchFollowersCount(),
        fetchFollowingsCount()
      ])
    }
    
    // 언팔로우 업데이트 처리
    const handleUnfollowUpdated = async () => {
      console.log('🔄 언팔로우 업데이트 - 숫자 재조회')
      await Promise.all([
        fetchFollowersCount(),
        fetchFollowingsCount()
      ])
    }
    
    // 컴포넌트 마운트 시 데이터 가져오기
                onMounted(async () => {
                  console.log('=== DiaryListView onMounted 시작 ===')
                  
                  // 펫 등록 여부 확인
                  console.log('펫 등록 여부 확인 시작...')
                  const hasPet = await validatePetAndRedirect($router)
                  console.log('펫 등록 여부 확인 결과:', hasPet)
                  if (!hasPet) {
                    console.log('펫이 없음 - 컴포넌트 마운트 중단')
                    return
                  }
                  
                  // 초기화를 nextTick으로 지연
                  console.log('nextTick으로 초기화 지연...')
                  nextTick(() => {
                    console.log('nextTick 실행 - API 호출 시작')
                    fetchPostsCount()
                    fetchFollowersCount()
                    fetchFollowingsCount()
                    fetchUserPets()
                    fetchDiaryList()
                    
                    // 스크롤 이벤트 리스너 추가
                    window.addEventListener('scroll', handleScroll)
                    console.log('스크롤 이벤트 리스너 추가 완료')
                  })
                  console.log('=== DiaryListView onMounted 완료 ===')
                })
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
    
                                      return {
                    showMainPetModal,
                    selectedPet,
                    userPets,
                    mainPet,
                    petBio,
                    displayUserName,
                    currentUserId,
                    postsCount,
                    followersCount,
                    followingsCount,
                    diaryList,
                    isLoading,
                    searchType,
                    searchKeyword,
                    isFollowModalVisible,
                    followModalTab,
                    viewDiary,
                    changeMainPet,
                    openFollowModal,
                    closeFollowModal,
                    handleFollowUpdated,
                    handleUnfollowUpdated,
                    handleSearch,
                    handleClearSearch
                  }
  }
}
</script>

<style scoped>
.diary-page {
  background: linear-gradient(135deg, #FFFAF0 0%, #FFF7EC 100%);
  min-height: 100vh;
  padding: 32px;
}

/* 프로필 섹션 */
.profile-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 40px;
}

.profile-image-container {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-image-container:hover {
  transform: scale(1.02);
}

.profile-avatar {
  border: 4px solid #FF8B8B;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.3);
  transition: all 0.3s ease;
}

.profile-image-container:hover .profile-avatar {
  border-color: #FF6B6B;
  box-shadow: 0 12px 32px rgba(255, 139, 139, 0.4);
}

.edit-hint {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748B;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.profile-image-container:hover .edit-hint {
  opacity: 1;
  bottom: -12px;
}

.user-info {
  flex: 1;
}

.username-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.username {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.badges {
  display: flex;
  gap: 10px;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat-item {
  font-size: 0.9rem;
  color: #64748B;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(255, 139, 139, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 139, 139, 0.2);
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  background: rgba(255, 139, 139, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.3);
}

.bio {
  font-size: 0.95rem;
  color: #475569;
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

.add-button {
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(30, 41, 59, 0.3);
  border-radius: 16px;
  transition: all 0.3s ease;
}

            .add-button:hover {
              background: linear-gradient(135deg, #334155 0%, #475569 100%);
              transform: translateY(-4px);
              box-shadow: 0 12px 32px rgba(30, 41, 59, 0.4);
            }

                        .loading-indicator {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
              grid-column: 1 / -1;
            }



            /* 다이어리 그리드 */
.diary-grid {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.diary-item {
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.diary-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.diary-item.featured {
  grid-column: span 1;
  grid-row: span 1;
}

.diary-image {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.diary-item:hover .diary-image {
  transform: scale(1.05);
}

.diary-overlay {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.empty-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border: 2px dashed #CBD5E1;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.empty-placeholder:hover {
  background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
  border-color: #94A3B8;
  transform: scale(1.02);
}

/* 모달 스타일 */
.main-pet-modal {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  padding: 28px 28px 0 28px;
}

.modal-content {
  padding: 28px;
}

.current-pet-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-pet-avatar {
  border: 3px solid #FF8B8B;
  box-shadow: 0 4px 16px rgba(255, 139, 139, 0.3);
}

.pet-select {
  flex: 1;
}

.modal-actions {
  padding: 0 28px 28px 28px;
  justify-content: center;
}

.change-button {
  background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
  color: white;
  font-weight: 600;
  padding: 14px 36px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(255, 139, 139, 0.3);
  transition: all 0.3s ease;
}

.change-button:hover {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8B8B 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.4);
}

/* 반응형 */
@media (max-width: 768px) {
  .diary-page {
    padding: 20px;
  }
  
  .profile-section {
    padding: 28px;
  }
  
  .profile-container {
    flex-direction: column;
    text-align: center;
    gap: 28px;
  }
  
  .username-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .diary-grid {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .diary-page {
    padding: 16px;
  }
  
  .profile-section {
    padding: 24px;
  }
  
  .stats {
    gap: 16px;
  }
  
  .stat-item {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
