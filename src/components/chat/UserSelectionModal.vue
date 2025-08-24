<template>
  <v-dialog v-model="show" max-width="700" @click:outside="closeModal">
    <v-card class="user-selection-dialog">
      <!-- 헤더 -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="28" color="white">mdi-chat-plus</v-icon>
          </div>
          <div class="header-text">
            <h3 class="dialog-title">새 채팅방 만들기</h3>
            <p class="dialog-subtitle">함께 채팅할 사용자를 선택하세요</p>
          </div>
          <v-btn 
            icon 
            variant="outlined"
            @click="closeModal"
            class="close-btn"
            size="large"
            color="white"
          >
            <v-icon size="24">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      
      <div class="selection-content">
        <!-- 탭 메뉴 -->
        <div class="tab-navigation">
          <v-tabs v-model="activeTab" color="primary" class="custom-tabs">
            <v-tab value="followers" class="custom-tab">
              <v-icon size="20" class="mr-2">mdi-account-heart</v-icon>
              팔로워
            </v-tab>
            <v-tab value="followings" class="custom-tab">
              <v-icon size="20" class="mr-2">mdi-account-star</v-icon>
              팔로잉
            </v-tab>
          </v-tabs>
        </div>
        
        <!-- 검색 필터 -->
        <v-text-field
          v-model="searchQuery"
          label="사용자 검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          class="mb-4"
        ></v-text-field>
        
        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
          <p class="mt-2 text-caption text-grey-darken-1">사용자 목록을 불러오는 중...</p>
        </div>
        
        <!-- 에러 상태 -->
        <div v-else-if="error" class="text-center py-8">
          <v-icon size="32" color="error">mdi-alert-circle</v-icon>
          <p class="text-error mt-2">{{ error }}</p>
          <v-btn color="primary" @click="loadUsers" size="small" class="mt-2">다시 시도</v-btn>
        </div>
        
        <!-- 사용자 목록 -->
        <div v-else>
          <div v-if="filteredUsers.length === 0" class="text-center py-8">
            <v-icon size="32" color="grey-lighten-1">mdi-account-off</v-icon>
            <p class="text-grey-lighten-1 mt-2">
              {{ searchQuery ? '검색 결과가 없습니다.' : 
                 activeTab === 'followers' ? '팔로워가 없습니다.' : '팔로잉이 없습니다.' }}
            </p>
          </div>
          
          <v-list v-else density="compact" class="max-height-400">
            <v-list-item
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user)"
              :class="{ 'selected-user': selectedUsers.some(u => u.userEmail === user.userEmail) }"
              class="user-list-item"
            >
              <template v-slot:prepend>
                <v-checkbox
                  :model-value="selectedUsers.some(u => u.userEmail === user.userEmail)"
                  @click.stop="toggleUser(user)"
                  color="primary"
                ></v-checkbox>
              </template>
              
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ user.userName || user.userEmail }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ user.userEmail }}
                </v-list-item-subtitle>
              </v-list-item-content>
              
              <template v-slot:append>
                <v-avatar size="32" class="ml-2">
                  <v-icon>mdi-account-circle</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </div>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="grey-darken-1" 
          variant="text" 
          @click="closeModal"
        >
          취소
        </v-btn>
        <v-btn 
          color="primary" 
          variant="flat" 
          @click="confirmSelection"
          :disabled="selectedUsers.length === 0"
        >
          선택 완료 ({{ selectedUsers.length }}명)
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { userAPI } from '@/services/api'

export default {
  name: 'UserSelectionModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'users-selected'],
  
  setup(props, { emit }) {
    const show = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    const activeTab = ref('followers')
    const searchQuery = ref('')
    const loading = ref(false)
    const error = ref('')
    const users = ref([])
    const selectedUsers = ref([])
    
    // 필터링된 사용자 목록
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value
      
      const query = searchQuery.value.toLowerCase()
      return users.value.filter(user => 
        (user.nickname && user.userName.toLowerCase().includes(query)) ||
        (user.email && user.userEmail.toLowerCase().includes(query))
      )
    })
    
    // 사용자 목록 로드
    const loadUsers = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const pageable = { page: 0, size: 100 } // 충분히 큰 사이즈로 설정
        
        let response
        if (activeTab.value === 'followers') {
          response = await userAPI.getFollowers(pageable)
        } else {
          response = await userAPI.getFollowings(pageable)
        }
        
        users.value = response.data.data.content || []
      } catch (err) {
        console.error('사용자 목록 로드 실패:', err)
        error.value = '사용자 목록을 불러오는데 실패했습니다.'
      } finally {
        loading.value = false
      }
    }
    
    // 사용자 선택/해제
    const toggleUser = (user) => {
      const index = selectedUsers.value.findIndex(u => u.userEmail === user.userEmail)
      if (index > -1) {
        selectedUsers.value.splice(index, 1)
      } else {
        selectedUsers.value.push(user)
      }
    }
    
    // 사용자 선택 (체크박스 외 영역 클릭)
    const selectUser = (user) => {
      toggleUser(user)
    }
    
    // 모달 닫기
    const closeModal = () => {
      show.value = false
      selectedUsers.value = []
      searchQuery.value = ''
    }
    
    // 선택 완료
    const confirmSelection = () => {
      emit('users-selected', selectedUsers.value)
      closeModal()
    }
    
    // 탭 변경 시 사용자 목록 다시 로드
    watch(activeTab, () => {
      loadUsers()
    })
    
    // 모달이 열릴 때 사용자 목록 로드
    watch(show, (newValue) => {
      if (newValue) {
        loadUsers()
      }
    })
    
    return {
      show,
      activeTab,
      searchQuery,
      loading,
      error,
      users,
      selectedUsers,
      filteredUsers,
      loadUsers,
      toggleUser,
      selectUser,
      closeModal,
      confirmSelection
    }
  }
}
</script>

<style scoped>
/* 사용자 선택 모달 스타일 */
.user-selection-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #E87D7D 0%, #FF6B6B 100%);
  padding: 24px;
  color: white;
  position: relative;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-text {
  flex: 1;
  min-width: 0;
}

.dialog-title {
  font-size: var(--mm-text-xl);
  font-weight: 700;
  margin: 0 0 4px 0;
  color: white;
}

.dialog-subtitle {
  font-size: var(--mm-text-sm);
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.close-btn {
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  transition: all var(--mm-transition-normal);
  border-radius: 16px !important;
  min-width: 56px !important;
  height: 56px !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  margin-left: auto;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.close-btn:active {
  transform: scale(0.95);
}

.close-btn .v-icon {
  transition: all var(--mm-transition-fast);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.close-btn:hover .v-icon {
  transform: scale(1.1);
}

.selection-content {
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
}

.tab-navigation {
  margin-bottom: 24px;
}

.custom-tabs {
  background: var(--mm-surface-variant);
  border-radius: 16px;
  padding: 4px;
}

.custom-tab {
  border-radius: 12px !important;
  margin: 4px !important;
  transition: all var(--mm-transition-normal);
}

.custom-tab:hover {
  background: rgba(232, 125, 125, 0.1);
}

.max-height-400 {
  max-height: 400px;
  overflow-y: auto;
}

.user-list-item {
  transition: background-color 0.2s ease-in-out;
  border-radius: 12px;
  margin: 4px 0;
}

.user-list-item:hover {
  background-color: var(--mm-surface-variant);
  transform: translateY(-1px);
  box-shadow: var(--mm-shadow-sm);
}

.selected-user {
  background-color: rgba(232, 125, 125, 0.1);
  border-left: 4px solid #E87D7D;
}

.selected-user:hover {
  background-color: rgba(232, 125, 125, 0.15);
}
</style>

