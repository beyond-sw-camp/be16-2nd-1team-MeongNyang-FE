<template>
  <v-dialog v-model="show" max-width="600" persistent>
    <v-card>
      <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
        <span>채팅 상대 선택</span>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <!-- 탭 메뉴 -->
        <v-tabs v-model="activeTab" color="primary" class="mb-4">
          <v-tab value="followers">팔로워</v-tab>
          <v-tab value="followings">팔로잉</v-tab>
        </v-tabs>
        
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
      </v-card-text>
      
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
.max-height-400 {
  max-height: 400px;
  overflow-y: auto;
}

.user-list-item {
  transition: background-color 0.2s ease-in-out;
}

.user-list-item:hover {
  background-color: #f5f5f5;
}

.selected-user {
  background-color: #e3f2fd;
}

.selected-user:hover {
  background-color: #bbdefb;
}
</style>

