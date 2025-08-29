<template>
  <div v-if="isVisible" class="follow-modal-overlay" @click="closeModal">
    <div class="follow-modal" @click.stop>
      <!-- 헤더 -->
      <div class="modal-header">
        <div class="tab-container">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'followers' }"
            @click="activeTab = 'followers'"
          >
            팔로워 {{ followersCount }}
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'followings' }"
            @click="activeTab = 'followings'"
          >
            팔로잉 {{ followingsCount }}
          </div>
        </div>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-arrow-left"></i>
        </button>
      </div>

      <!-- 검색바 -->
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="검색..." 
          class="search-input"
        />
        <i class="fas fa-search search-icon"></i>
      </div>

      <!-- 사용자 목록 -->
      <div class="user-list">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>목록을 불러오는 중...</p>
        </div>
        
        <!-- 사용자 목록 -->
        <div 
          v-else-if="filteredUsers.length > 0"
          v-for="user in filteredUsers" 
          :key="user.userId || user.id" 
          class="user-item"
        >
          <div class="user-info" @click="goToUserDiary(user.userId || user.id)">
            <img 
              :src="user.profileImage || '/default-avatar.png'" 
              :alt="user.petName"
              class="user-avatar"
            />
            <span class="username">{{ user.userName || user.petName || '익명' }}</span>
          </div>
          <div class="action-buttons">
            <!-- 팔로잉 목록에서 언팔로우 버튼 (내 팔로잉 목록일 때만) -->
            <button 
              v-if="activeTab === 'followings' && props.userId == null"
              class="action-btn delete-btn" 
              @click="handleUnfollow(user.userId || user.id)"
            >
              언팔로우
            </button>
            
            <!-- 팔로워 목록에서 팔로우/언팔로우 버튼 (내 팔로워 목록일 때만) -->
            <button 
              v-if="activeTab === 'followers' && props.userId == null && !user.isFollowing"
              class="action-btn follow-btn" 
              @click="handleFollow(user.userId || user.id)"
            >
              팔로우
            </button>
            <button 
              v-if="activeTab === 'followers' && props.userId == null && user.isFollowing"
              class="action-btn delete-btn" 
              @click="handleUnfollow(user.userId || user.id)"
            >
              언팔로우
            </button>
            
            <!-- 차단 버튼 (내 목록일 때만) -->
            <button 
              v-if="props.userId == null"
              class="action-btn block-btn"
            >
              차단
            </button>
          </div>
        </div>
        
        <!-- 빈 목록 -->
        <div v-else class="empty-container">
          <p>{{ activeTab === 'followers' ? '팔로워가 없습니다.' : '팔로잉이 없습니다.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { userAPI } from '@/services/api'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: [String, Number],
    required: true
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingsCount: {
    type: Number,
    default: 0
  },
  initialTab: {
    type: String,
    default: 'followers'
  }
})

// Emits
const emit = defineEmits(['close', 'follow-updated', 'unfollow-updated'])

// Reactive data
const activeTab = ref(props.initialTab)
const searchQuery = ref('')

// 실제 데이터
const followers = ref([])
const followings = ref([])
const isLoading = ref(false)


// Computed
const filteredUsers = computed(() => {
  const users = activeTab.value === 'followers' ? followers.value : followings.value
  console.log('🔍 필터링 전 사용자 목록:', users)
  
  if (!searchQuery.value) {
    console.log('✅ 검색어 없음 - 전체 목록 반환')
    return users
  }
  
  const filtered = users.filter(user => {
    const searchTarget = (user.userName || user.petName || '').toLowerCase()
    return searchTarget.includes(searchQuery.value.toLowerCase())
  })
  console.log('🔍 검색어:', searchQuery.value, '필터링 결과:', filtered)
  return filtered
})

// Methods
const closeModal = () => {
  emit('close')
}

// 사용자 다이어리로 이동하는 메서드
const goToUserDiary = (userId) => {
  if (userId) {
    // 모달을 닫고 해당 사용자의 다이어리로 이동
    closeModal()
    // 라우터를 사용하여 페이지 이동
    window.location.href = `/diarys/${userId}`
  }
}

// 팔로우 처리
const handleFollow = async (id) => {
  try {
    console.log('👆 팔로우 버튼 클릭 - userId:', id)
    
    // id가 undefined인지 확인
    if (!id) {
      console.error('❌ id가 undefined입니다!')
      alert('사용자 정보를 찾을 수 없습니다.')
      return
    }
    
    // 사용자 ID로 팔로우 (path variable 형식)
    console.log('📡 팔로우 API 호출:', id)
    await userAPI.follow(id)
    
    // 성공 시 현재 탭에 따라 목록 다시 조회
    console.log('✅ 팔로우 성공 - 현재 탭 목록 재조회')
    if (activeTab.value === 'followers') {
      await fetchFollowers()
    } else if (activeTab.value === 'followings') {
      await fetchFollowings()
    }
    
    // 부모 컴포넌트에 팔로우 업데이트 이벤트 발생
    emit('follow-updated')
    
  } catch (error) {
    console.error('❌ 팔로우 실패:', error)
    // 에러 메시지 표시
    alert('팔로우에 실패했습니다.')
  }
}

// 언팔로우 처리
const handleUnfollow = async (id) => {
  try {
    console.log('👆 언팔로우 버튼 클릭 - userId:', id)
    
    // id가 undefined인지 확인
    if (!id) {
      console.error('❌ id가 undefined입니다!')
      alert('사용자 정보를 찾을 수 없습니다.')
      return
    }
    
    // 사용자 ID로 언팔로우 (path variable 형식)
    console.log('📡 언팔로우 API 호출:', id)
    await userAPI.unfollow(id)
    
    // 성공 시 현재 탭에 따라 목록 다시 조회
    console.log('✅ 언팔로우 성공 - 현재 탭 목록 재조회')
    if (activeTab.value === 'followers') {
      await fetchFollowers()
    } else if (activeTab.value === 'followings') {
      await fetchFollowings()
    }
    
    // 부모 컴포넌트에 언팔로우 업데이트 이벤트 발생
    emit('unfollow-updated')
    
  } catch (error) {
    console.error('❌ 언팔로우 실패:', error)
    // 에러 메시지 표시
    alert('언팔로우에 실패했습니다.')
  }
}

// 팔로워 목록 가져오기
const fetchFollowers = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    console.log('🔍 팔로워 목록 조회 시작 - userId:', props.userId, '타입:', typeof props.userId)
    console.log('🔍 props.userId가 유효한지:', props.userId && props.userId > 0)
    let response;
    if (props.userId == null) {
      response = await userAPI.getMyFollowers();
    } else {
      response = await userAPI.getFollowers(props.userId);
    }
    console.log('📥 팔로워 API 응답:', response)
    
    if (response.data && response.data.data) {
      const fetchedFollowers = response.data.data.content || [];

      // Get the list of users the current user is following
      const myFollowingsResponse = await userAPI.getMyFollowings();
      const myFollowings = myFollowingsResponse.data?.data?.content || [];
      const myFollowingIds = new Set(myFollowings.map(u => u.userId || u.id));

      // Set the isFollowing status for each follower
      followers.value = fetchedFollowers.map(follower => ({
        ...follower,
        isFollowing: myFollowingIds.has(follower.userId || follower.id)
      }));
      
      
    } else {
      console.log('⚠️ 팔로워 데이터가 없습니다.')
      followers.value = []
    }
  } catch (error) {
    console.error('❌ 팔로워 목록 조회 실패:', error)
    followers.value = []
  } finally {
    isLoading.value = false
  }
}

// 팔로잉 목록 가져오기
const fetchFollowings = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    console.log('🔍 팔로잉 목록 조회 시작 - userId:', props.userId, '타입:', typeof props.userId)
    console.log('🔍 props.userId가 유효한지:', props.userId && props.userId > 0)
    let response;
    if (props.userId == null) {
      response = await userAPI.getMyFollowings();
    } else {
      response = await userAPI.getFollowings(props.userId);
    }
    console.log('📥 팔로잉 API 응답:', response)
    
    if (response.data && response.data.data) {
      followings.value = response.data.data.content || []
      console.log('✅ 팔로잉 목록 데이터:', followings.value)
      console.log('🔍 팔로잉 첫 번째 사용자 데이터 구조:', followings.value[0])
      console.log('🔍 팔로잉 사용자들의 id 필드 확인:', followings.value.map(user => ({ id: user.id, userId: user.userId, userEmail: user.userEmail })))
    } else {
      console.log('⚠️ 팔로잉 데이터가 없습니다.')
      followings.value = []
    }
  } catch (error) {
    console.error('❌ 팔로잉 목록 조회 실패:', error)
    followings.value = []
  } finally {
    isLoading.value = false
  }
}

// Watch for tab changes to load data
watch(activeTab, (newTab) => {
  console.log('🔄 탭 변경:', newTab)
  if (props.isVisible) {
    if (newTab === 'followers') {
      console.log('📋 팔로워 탭으로 변경 - 데이터 로드 시작')
      fetchFollowers()
    } else if (newTab === 'followings') {
      console.log('📋 팔로잉 탭으로 변경 - 데이터 로드 시작')
      fetchFollowings()
    }
  }
})

// Watch for modal visibility to load initial data
watch(() => props.isVisible, (isVisible) => {
  console.log('🚪 모달 상태 변경:', isVisible)
  if (isVisible) {
    console.log('🎯 모달 열림 - 초기 탭:', props.initialTab)
    // 초기 탭 설정
    activeTab.value = props.initialTab
    // 초기 데이터 로드
    if (activeTab.value === 'followers') {
      console.log('📋 초기 팔로워 데이터 로드')
      fetchFollowers()
    } else if (activeTab.value === 'followings') {
      console.log('📋 초기 팔로잉 데이터 로드')
      fetchFollowings()
    }
  } else {
    console.log('🚪 모달 닫힘')
  }
})
</script>

<style scoped>
.follow-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.follow-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.tab-container {
  display: flex;
  gap: 20px;
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: white;
  color: #333;
}

.tab.active {
  background: #ff4757;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #333;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #f1f1f1;
}

.search-container {
  position: relative;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #ff4757;
}

.search-icon {
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.user-list {
  max-height: 400px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background-color: #f9f9f9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.user-info:hover {
  background-color: #f0f0f0;
  transform: translateY(-1px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.user-info:hover .user-avatar {
  border-color: #FF8B8B;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.2);
}

.username {
  font-weight: 500;
  color: #333;
  transition: color 0.2s ease;
}

.user-info:hover .username {
  color: #FF8B8B;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn {
  background-color: #ff4757;
  color: white;
}

.delete-btn:hover {
  background-color: #ff3742;
}

.follow-btn {
  background-color: #2ed573;
  color: white;
}

.follow-btn:hover {
  background-color: #26d0ce;
}

.block-btn {
  background-color: #ff4757;
  color: white;
}

.block-btn:hover {
  background-color: #ff3742;
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff4757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 빈 상태 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  font-style: italic;
}

/* 스크롤바 스타일링 */
.user-list::-webkit-scrollbar {
  width: 6px;
}

.user-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.user-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.user-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
