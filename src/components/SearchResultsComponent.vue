<template>
  <div class="search-results-component">
    <!-- 검색 결과 헤더 -->
    <div class="search-results-header">
      <h2 class="search-results-title">
        '{{ searchKeyword }}'에 대한 검색결과 <span class="result-count">{{ results.length }}</span>건
      </h2>
    </div>
    
    <!-- 검색 결과 목록 -->
    <div class="search-results-list">
      <div 
        v-for="(result, index) in results" 
        :key="result.id || index"
        class="search-result-item"
        @click="handleResultClick(result)"
      >
        <!-- 프로필 섹션 -->
        <div class="profile-section">
          <v-avatar 
            size="56" 
            class="profile-avatar clickable"
            @click.stop="goToUserDiary(result.userId)"
          >
            <v-img 
              :src="result.petProfile" 
              :alt="result.petName"
              cover
            ></v-img>
          </v-avatar>
        </div>
        
        <!-- 메인 콘텐츠 -->
        <div class="main-content">
          <!-- 헤더 정보 -->
          <div class="content-header">
            <div class="user-info">
              <div class="username">{{ result.petName }}</div>
              <div class="date">{{ formatDate(result.createdAt) }}</div>
            </div>
            <div class="action-buttons">
              <v-btn
                icon="mdi-heart-outline"
                size="small"
                variant="text"
                color="#64748B"
                class="action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-share-variant-outline"
                size="small"
                variant="text"
                color="#64748B"
                class="action-btn"
              ></v-btn>
            </div>
          </div>
          
          <!-- 포스트 내용 -->
          <div class="post-content">
            <div class="post-title">{{ result.title }}</div>
            <div class="post-text">{{ result.content }}</div>
          </div>
          
          <!-- 태그 섹션 -->
          <div class="tags-section">
            <v-chip
              v-for="tag in extractHashtags(result.content)"
              :key="tag"
              size="small"
              variant="outlined"
              color="#FF8B8B"
              class="tag-chip"
            >
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </div>
      
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section">
        <v-progress-circular
          indeterminate
          color="#FF8B8B"
          size="40"
        ></v-progress-circular>
        <p class="loading-text">검색 중...</p>
      </div>
    </div>
    
    <!-- 결과가 없을 때 -->
    <div v-if="results.length === 0 && !isLoading" class="no-results">
      <div class="no-results-icon">
        <v-icon size="64" color="#FF8B8B">mdi-magnify</v-icon>
      </div>
      <p class="no-results-text">검색 결과가 없습니다.</p>
      <p class="no-results-subtext">다른 검색어를 시도해보세요.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResultsComponent',
  props: {
    searchKeyword: {
      type: String,
      default: ''
    },
    searchType: {
      type: String,
      default: 'TITLE'
    },
    showResults: {
      type: Boolean,
      default: false
    },
    searchResults: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: true
    }
  },
  emits: ['result-click'],
  data() {
    return {
      // 더미 검색 결과 데이터
      dummyResults: {
        TITLE: [
          {
            id: 1,
            username: 'cuteCat',
            date: '2025년 5월 21일',
            title: '냥냥냥냥',
            content: '집사는 뭘 그렇게 열심히 보는걸까..... 냐옹',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          },
          {
            id: 2,
            username: 'fluffyKitty',
            date: '2025년 5월 20일',
            title: '냥냥이 일기',
            content: '오늘은 정말 행복한 하루였어요. 집사가 새로운 장난감을 사줬어요!',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          },
          {
            id: 3,
            username: 'meowMaster',
            date: '2025년 5월 19일',
            title: '냥냥이 산책',
            content: '그만 보고 날 놀아줘라 냥냥. 산책 가자고!',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          },
          {
            id: 4,
            username: 'catLover',
            date: '2025년 5월 18일',
            title: '냥냥이 건강',
            content: '오늘 병원에서 건강검진을 받았어요. 모두 정상이라고 해요!',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          }
        ],
        CONTENT: [
          {
            id: 5,
            username: 'happyCat',
            date: '2025년 5월 21일',
            title: '오늘의 일기',
            content: '냥냥냥냥 오늘은 정말 재미있었어요!',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          },
          {
            id: 6,
            username: 'sleepyCat',
            date: '2025년 5월 20일',
            title: '잠자는 고양이',
            content: '냥냥냥냥 곤히 자고 있어요...',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          }
        ],
        USER: [
          {
            id: 7,
            username: '냥냥이맘',
            date: '2025년 5월 21일',
            title: '우리 아이들',
            content: '냥냥이들이 너무 귀여워요!',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          },
          {
            id: 8,
            username: '강아지사랑',
            date: '2025년 5월 20일',
            title: '강아지와 고양이',
            content: '냥냥이와 함께하는 시간이에요!',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          }
        ],
        HASHTAG: [
          {
            id: 9,
            username: 'hashtagLover',
            date: '2025년 5월 21일',
            title: '#냥냥이 #고양이',
            content: '냥냥이 해시태그 모음!',
            profileImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=center'
          }
        ]
      }
    }
  },
  computed: {
    results() {
      return this.searchResults
    }
  },
  methods: {
    handleResultClick(result) {
      this.$emit('result-click', result)
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    // 사용자 다이어리로 이동하는 메서드
    goToUserDiary(userId) {
      if (userId) {
        this.$router.push(`/diarys/${userId}`)
      }
    },
    // 해시태그 추출 메서드
    extractHashtags(content) {
      if (!content) return []
      const hashtagRegex = /#\w+/g
      return content.match(hashtagRegex) || []
    }
  }
}
</script>

<style scoped>
.search-results-component {
  margin-top: 32px;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.search-results-header {
  margin-bottom: 32px;
  width: 100%;
  max-width: 900px;
  text-align: center;
}

.search-results-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

.result-count {
  color: white;
  background: #FF8B8B;
  padding: 4px 12px;
  border-radius: 16px;
  margin-left: 8px;
  font-size: 1.4rem;
  box-shadow: 0 2px 8px rgba(255, 139, 139, 0.2);
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 900px;
  align-items: center;
}

.search-result-item {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #F1F5F9;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.search-result-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF8B8B, #FF6B6B);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.search-result-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
  border-color: #E2E8F0;
}

.search-result-item:hover::before {
  opacity: 1;
}

.profile-section {
  flex-shrink: 0;
}

.profile-avatar {
  border: 3px solid #FF8B8B;
  box-shadow: 0 6px 20px rgba(255, 139, 139, 0.2);
  transition: all 0.3s ease;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.3);
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 4px;
  line-height: 1.3;
}

.date {
  font-size: 0.85rem;
  color: #64748B;
  line-height: 1.3;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: #FF8B8B !important;
  transform: scale(1.1);
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-text {
  font-size: 1rem;
  color: #475569;
  line-height: 1.6;
  word-break: break-word;
  font-weight: 500;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-chip {
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.2);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.no-results-icon {
  margin-bottom: 24px;
  padding: 20px;
  background: #FF8B8B;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(255, 139, 139, 0.2);
}

.no-results-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 12px 0;
}

.no-results-subtext {
  font-size: 1rem;
  color: #64748B;
  margin: 0;
  font-weight: 500;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  width: 100%;
  max-width: 900px;
}

.loading-text {
  margin-top: 20px;
  font-size: 1rem;
  color: #64748B;
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 1200px) {
  .search-results-component {
    padding: 0 20px;
  }
  
  .search-results-header {
    max-width: 800px;
  }
  
  .search-results-list {
    max-width: 800px;
  }
  
  .no-results {
    max-width: 800px;
  }
  
  .loading-section {
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .search-results-component {
    padding: 0 16px;
    margin-top: 24px;
  }
  
  .search-results-header {
    margin-bottom: 24px;
  }
  
  .search-results-title {
    font-size: 1.4rem;
  }
  
  .result-count {
    font-size: 1.2rem;
    padding: 3px 10px;
  }
  
  .search-result-item {
    padding: 20px;
    gap: 16px;
    border-radius: 16px;
  }
  
  .profile-avatar {
    width: 48px !important;
    height: 48px !important;
    border-width: 2px;
  }
  
  .username {
    font-size: 1rem;
  }
  
  .date {
    font-size: 0.8rem;
  }
  
  .post-title {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  
  .post-text {
    font-size: 0.95rem;
  }
  
  .no-results {
    padding: 60px 20px;
    border-radius: 16px;
  }
  
  .no-results-icon {
    padding: 16px;
  }
  
  .no-results-text {
    font-size: 1.2rem;
  }
  
  .no-results-subtext {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .search-results-component {
    padding: 0 12px;
    margin-top: 20px;
  }
  
  .search-results-header {
    margin-bottom: 20px;
  }
  
  .search-results-title {
    font-size: 1.2rem;
  }
  
  .result-count {
    font-size: 1.1rem;
    padding: 2px 8px;
  }
  
  .search-result-item {
    padding: 16px;
    gap: 12px;
    border-radius: 14px;
  }
  
  .profile-avatar {
    width: 40px !important;
    height: 40px !important;
    border-width: 2px;
  }
  
  .username {
    font-size: 0.95rem;
  }
  
  .date {
    font-size: 0.75rem;
  }
  
  .post-title {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  
  .post-text {
    font-size: 0.9rem;
  }
  
  .no-results {
    padding: 40px 16px;
    border-radius: 14px;
  }
  
  .no-results-icon {
    padding: 12px;
  }
  
  .no-results-text {
    font-size: 1.1rem;
  }
  
  .no-results-subtext {
    font-size: 0.9rem;
  }
}
</style>
