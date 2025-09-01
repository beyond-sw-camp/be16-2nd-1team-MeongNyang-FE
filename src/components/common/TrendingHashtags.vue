<template>
  <v-card class="insight-card">
    <div class="insight-header">
      <v-icon color="#FF8B8B" size="24">mdi-pound</v-icon>
      <div class="insight-title">인기 해시태그</div>
    </div>
    
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="#FF8B8B" size="24"></v-progress-circular>
      <span class="loading-text">해시태그를 불러오는 중...</span>
    </div>
    
    <!-- 해시태그 목록 -->
    <div v-else-if="hashtags.length > 0" class="hashtag-list">
      <div class="hashtag-item" v-for="tag in hashtags" :key="tag.tagName">
        <span class="hashtag-text">#{{ tag.tagName }}</span>
        <span class="hashtag-count">{{ tag.tagCount }}회</span>
      </div>
    </div>
    
    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <v-icon size="32" color="grey">mdi-pound</v-icon>
      <span class="empty-text">인기 해시태그가 없습니다</span>
    </div>

    <!-- 마지막 업데이트 시간 -->
    <div v-if="lastUpdated" class="last-updated">
      <v-icon size="12" color="grey">mdi-clock-outline</v-icon>
      <span class="updated-text">{{ formatLastUpdated() }}</span>
    </div>
  </v-card>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { postAPI } from '@/services/api'

export default {
  name: 'TrendingHashtags',
  setup() {
    const hashtags = ref([])
    const loading = ref(false)
    const error = ref(null)
    const lastUpdated = ref(null)
    let pollingTimer = null
    
    // 5분 = 5 * 60 * 1000 밀리초
    const POLLING_INTERVAL = 5 * 60 * 1000

    // 인기 해시태그 가져오기
    const fetchTrendingHashtags = async () => {
      loading.value = true
      error.value = null
      
      try {
        console.log('인기 해시태그 조회 시작')
        const response = await postAPI.getTrendingHashtags()
        console.log('인기 해시태그 API 응답:', response)
        
        if (response.data && response.data.isSuccess && response.data.data) {
          hashtags.value = response.data.data
          lastUpdated.value = new Date()
          console.log('설정된 인기 해시태그:', hashtags.value)
        } else {
          console.log('인기 해시태그 데이터가 없습니다')
          hashtags.value = []
        }
      } catch (err) {
        console.error('인기 해시태그 조회 실패:', err)
        error.value = err.message || '해시태그를 불러오는데 실패했습니다'
        hashtags.value = []
      } finally {
        loading.value = false
      }
    }

    // polling 시작
    const startPolling = () => {
      console.log(`Polling 시작 - ${POLLING_INTERVAL}ms 간격 (5분)`)
      pollingTimer = setInterval(async () => {
        console.log('Polling으로 해시태그 새로고침')
        await fetchTrendingHashtags()
      }, POLLING_INTERVAL)
    }

    // polling 중지
    const stopPolling = () => {
      if (pollingTimer) {
        console.log('Polling 중지')
        clearInterval(pollingTimer)
        pollingTimer = null
      }
    }

    // 마지막 업데이트 시간 포맷팅
    const formatLastUpdated = () => {
      if (!lastUpdated.value) return ''
      
      const now = new Date()
      const diff = now - lastUpdated.value
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes < 1) return '방금 전'
      if (minutes < 60) return `${minutes}분 전`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}시간 전`
      
      const days = Math.floor(hours / 24)
      return `${days}일 전`
    }

    // 컴포넌트 마운트 시 데이터 가져오기 및 polling 시작
    onMounted(async () => {
      await fetchTrendingHashtags()
      startPolling()
    })

    // 컴포넌트 언마운트 시 polling 중지
    onUnmounted(() => {
      stopPolling()
    })

    return {
      hashtags,
      loading,
      error,
      lastUpdated,
      formatLastUpdated
    }
  }
}
</script>

<style scoped>
/* 인사이트 카드 */
.insight-card {
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.insight-card:last-child {
  margin-bottom: 0;
}

.insight-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.insight-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  margin-left: 12px;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #6B7280;
}

.loading-text {
  font-size: 0.875rem;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #9CA3AF;
}

.empty-text {
  font-size: 0.875rem;
}

/* 해시태그 리스트 */
.hashtag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hashtag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.hashtag-text {
  font-size: 0.875rem;
  color: #FF8B8B;
  font-weight: 500;
}

.hashtag-count {
  font-size: 0.75rem;
  color: #6B7280;
  background: #F1F5F9;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 마지막 업데이트 시간 */
.last-updated {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.updated-text {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .hashtag-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
