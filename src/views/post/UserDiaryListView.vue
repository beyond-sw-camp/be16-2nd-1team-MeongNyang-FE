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
        <div class="profile-image-container">
          <v-avatar size="120" class="profile-avatar">
            <v-img 
              :src="mainPet?.url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=120&fit=crop&crop=center'" 
              :alt="mainPet?.name || '프로필 이미지'"
            ></v-img>
          </v-avatar>
        </div>
        
        <!-- 사용자 정보 -->
        <div class="user-info">
          <div class="username-section">
            <h2 class="username">{{ mainPet?.name || userName || '사용자' }}</h2>
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
            <span 
              v-if="!isFollowing"
              class="stat-item follow-stat clickable"
              @click="handleFollow"
            >
              팔로우
            </span>
            <span 
              v-else
              class="stat-item unfollow-stat clickable"
              @click="handleUnfollow"
            >
              언팔로우
            </span>
          </div>
          
          <!-- 소개 -->
          <p class="bio">{{ petBio }}</p>
        </div>
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

    <!-- 팔로우/팔로워 모달 -->
    <FollowModal
      :is-visible="isFollowModalVisible"
      :user-id="userId"
      :followers-count="followersCount"
      :followings-count="followingsCount"
      :initial-tab="followModalTab"
      @close="closeFollowModal"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postAPI, userAPI, petAPI } from '@/services/api'
import SearchComponent from '@/components/SearchComponent.vue'
import FollowModal from '@/components/FollowModal.vue'

export default {
  name: 'UserDiaryListView',
  components: {
    SearchComponent,
    FollowModal
  },
  setup() {
    const $router = useRouter()
    const $route = useRoute()
    
    // 사용자 ID (라우트 파라미터에서 가져옴)
    const userId = computed(() => $route.params.userId)
    
    // 팔로우 상태
    const isFollowing = ref(false)
    const followLoading = ref(false)
    const isFollowModalVisible = ref(false)
    const followModalTab = ref('followers')
    
    // 반려동물 데이터
    const userPets = ref([])
    const userName = ref('')
    
    // 통계 데이터
    const postsCount = ref(0)
    const followersCount = ref(0)
    const followingsCount = ref(0)
    
    // 다이어리 데이터
    const diaryList = ref([])
    
    // 검색 상태
    const searchType = ref('TITLE')
    const searchKeyword = ref('')
    
    // 페이지네이션 상태
    const currentPage = ref(0)
    const hasMore = ref(true)
    const isLoading = ref(false)
    
    // 대표 반려동물 (firstPet이 true인 동물)
    const mainPet = computed(() => {
      return userPets.value.find(pet => pet.firstPet) || null
    })
    
    // 대표 반려동물 소개글
    const petBio = computed(() => {
      return mainPet.value?.introduce || '반려동물과 함께하는 특별한 순간들을 기록하고 있어요!'
    })
    
    // 반려동물 목록 가져오기
    const fetchUserPets = async () => {
      try {
        const response = await petAPI.getOtherUserPets(userId.value)
        if (response.data && response.data.data) {
          userPets.value = response.data.data.pets || []
          userName.value = response.data.data.userName || ''
        }
        
        // 팔로우 상태 확인
        await checkFollowStatus()
        
      } catch (error) {
        console.error('반려동물 목록 조회 실패:', error)
        userPets.value = []
        userName.value = ''
      }
    }
    
    // 팔로우 상태 확인
    const checkFollowStatus = async () => {
      try {
        const response = await userAPI.checkFollowStatus(userId.value)
        if (response.data && response.data.data) {
          isFollowing.value = response.data.data.isFollowing || false
        }
      } catch (error) {
        console.error('팔로우 상태 확인 실패:', error)
        isFollowing.value = false
      }
    }
    
    // 게시물 개수 가져오기
    const fetchPostsCount = async () => {
      try {
        const response = await userAPI.getUserPostsCount(userId.value)
        if (response.data && response.data.data) {
          postsCount.value = response.data.data.totalElements || 0
        }
      } catch (error) {
        console.error('게시물 개수 조회 실패:', error)
        postsCount.value = 0
      }
    }
    
    // 팔로워 개수 가져오기
    const fetchFollowersCount = async () => {
      try {
        const response = await userAPI.getUserFollowersCount(userId.value)
        if (response.data && response.data.data) {
          followersCount.value = response.data.data.totalElements || 0
        }
      } catch (error) {
        console.error('팔로워 개수 조회 실패:', error)
        followersCount.value = 0
      }
    }
    
    // 팔로잉 개수 가져오기
    const fetchFollowingsCount = async () => {
      try {
        const response = await userAPI.getUserFollowingsCount(userId.value)
        if (response.data && response.data.data) {
          followingsCount.value = response.data.data.totalElements || 0
        }
      } catch (error) {
        console.error('팔로잉 개수 조회 실패:', error)
        followingsCount.value = 0
      }
    }
    
    // 팔로우 처리
    const handleFollow = async () => {
      try {
        followLoading.value = true
        
        await userAPI.follow(userId.value)
        
        isFollowing.value = true
        followersCount.value += 1
        
        // 성공 메시지
        alert('팔로우했습니다!')
        
      } catch (error) {
        console.error('팔로우 실패:', error)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('팔로우에 실패했습니다.')
        }
      } finally {
        followLoading.value = false
      }
    }
    
    // 언팔로우 처리
    const handleUnfollow = async () => {
      try {
        followLoading.value = true
        
        await userAPI.unfollow(userId.value)
        
        isFollowing.value = false
        followersCount.value = Math.max(0, followersCount.value - 1)
        
        // 성공 메시지
        alert('언팔로우했습니다.')
        
      } catch (error) {
        console.error('언팔로우 실패:', error)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('언팔로우에 실패했습니다.')
        }
      } finally {
        followLoading.value = false
      }
    }
    
    // 다이어리 목록 가져오기
    const fetchDiaryList = async (page = 0, append = false) => {
      try {
        isLoading.value = true
        
        let response
        if (searchKeyword.value.trim()) {
          // 검색이 있는 경우 - 현재는 일반 목록 조회로 처리
          response = await postAPI.getUserPosts(userId.value, { page, size: 9 })
        } else {
          // 일반 목록 조회
          response = await postAPI.getUserPosts(userId.value, { page, size: 9 })
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
      searchType.value = searchData.type
      searchKeyword.value = searchData.keyword
      // 검색 시 새로운 검색 페이지로 이동
      $router.push({
        path: '/search',
        query: {
          type: searchData.type,
          keyword: searchData.keyword
        }
      })
    }
    
    // 검색 초기화
    const handleClearSearch = () => {
      searchKeyword.value = ''
    }

    // 팔로우/팔로워 모달 처리
    const openFollowModal = (type) => {
      isFollowModalVisible.value = true
      // 모달이 열린 후 탭 설정을 위해 nextTick 사용
      nextTick(() => {
        // FollowModal 컴포넌트의 activeTab을 설정
        if (type === 'followers' || type === 'followings') {
          // 모달 컴포넌트에 탭 정보 전달
          followModalTab.value = type
        }
      })
    }

    const closeFollowModal = () => {
      isFollowModalVisible.value = false
    }
    
    // 컴포넌트 마운트 시 데이터 가져오기
    onMounted(() => {
      // 초기화를 nextTick으로 지연
      nextTick(() => {
        fetchUserPets()
        fetchPostsCount()
        fetchFollowersCount()
        fetchFollowingsCount()
        fetchDiaryList()
        
        // 스크롤 이벤트 리스너 추가
        window.addEventListener('scroll', handleScroll)
      })
    })
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
    
    return {
      mainPet,
      userPets,
      userName,
      petBio,
      isFollowing,
      followLoading,
      isFollowModalVisible,
      followModalTab,
      postsCount,
      followersCount,
      followingsCount,
      diaryList,
      isLoading,
      searchType,
      searchKeyword,
      viewDiary,
      handleFollow,
      handleUnfollow,
      openFollowModal,
      closeFollowModal,
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
}

.profile-avatar {
  border: 4px solid #FF8B8B;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.3);
  transition: all 0.3s ease;
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

.follow-stat {
  background: linear-gradient(135deg, #FF8B8B 0%, #FFC1C1 100%);
  color: white;
  border: 1px solid #FF8B8B;
  transition: all 0.3s ease;
}

.follow-stat:hover {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8B8B 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.3);
}

.unfollow-stat {
  background: rgba(100, 116, 139, 0.1);
  color: #64748B;
  border: 1px solid #64748B;
  transition: all 0.3s ease;
}

.unfollow-stat:hover {
  background: rgba(100, 116, 139, 0.2);
  color: #475569;
  border-color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);
}

.bio {
  font-size: 0.95rem;
  color: #475569;
  margin: 0 0 24px 0;
  line-height: 1.6;
  font-style: italic;
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

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  grid-column: 1 / -1;
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
