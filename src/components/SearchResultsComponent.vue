<template>
  <div class="search-results-component">
    <!-- 검색 결과 헤더 -->
    <div class="search-results-header">
      <h2 class="search-results-title">
        '{{ searchKeyword }}'에 대한 검색결과 <span class="result-count">{{ results.length }}</span>건
      </h2>
    </div>
    
    <!-- 검색 결과 그리드 -->
    <div class="search-results-grid">
      <div class="grid-container">
        <!-- 실제 검색 결과 아이템들 -->
        <div 
          v-for="(result, index) in results" 
          :key="result.id || index"
          class="diary-item"
          :class="{ 'featured': index === 0 }"
          @click="handleResultClick(result)"
        >
          <v-img 
            :src="result.thumbnail || result.petProfile || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center'" 
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
      // 다이어리 상세 페이지로 이동
      if (result.id) {
        this.$router.push(`/diary/${result.id}`)
      }
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

.search-results-grid {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 1400px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.diary-item {
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 300px;
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

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  grid-column: 1 / -1;
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

/* 반응형 */
@media (max-width: 1200px) {
  .search-results-component {
    padding: 0 20px;
  }
  
  .search-results-header {
    max-width: 1200px;
  }
  
  .search-results-grid {
    max-width: 1200px;
  }
  
  .no-results {
    max-width: 1200px;
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
  
  .search-results-grid {
    padding: 24px;
    max-width: 100%;
  }
  
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .diary-item {
    min-height: 250px;
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
  
  .search-results-grid {
    padding: 16px;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .diary-item {
    min-height: 200px;
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
