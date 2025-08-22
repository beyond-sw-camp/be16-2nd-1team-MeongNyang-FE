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
                    <!-- 프로필 이미지 -->
                    <div class="profile-section">
                      <v-avatar 
                        size="40" 
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
                    
                    <!-- 사용자 정보 -->
                    <div class="user-info">
                      <div class="username">{{ result.petName }}</div>
                      <div class="date">{{ formatDate(result.createdAt) }}</div>
                    </div>
                    
                    <!-- 포스트 내용 -->
                    <div class="post-content">
                      <div class="post-title">{{ result.title }}</div>
                      <div class="post-text">{{ result.content }}</div>
                    </div>
                  </div>
                  
                  <!-- 로딩 상태 -->
                  <div v-if="isLoading" class="loading-section">
                    <v-progress-circular
                      indeterminate
                      color="#FF8B8B"
                      size="32"
                    ></v-progress-circular>
                    <p class="loading-text">검색 중...</p>
                  </div>
    </div>
    
    <!-- 결과가 없을 때 -->
    <div v-if="results.length === 0" class="no-results">
      <v-icon size="48" color="#CBD5E1">mdi-magnify</v-icon>
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
                }
              }
}
</script>

<style scoped>
.search-results-component {
  margin-top: 24px;
  padding: 0 40px;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.search-results-header {
  margin-bottom: 24px;
  width: 600px;
  text-align: left;
  margin-right: -20px;
  margin-left: 390px;
}

.search-results-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  line-height: 1.4;
  text-align: left;
}

.result-count {
  color: #FF8B8B;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 600px;
  align-items: flex-start;
  margin-left: 390px;
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  width: 100%;
}

.search-result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.profile-section {
  flex-shrink: 0;
}

.profile-avatar {
  border: 3px solid #FF8B8B;
  box-shadow: 0 4px 12px rgba(255, 139, 139, 0.25);
}

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.user-info {
  flex-shrink: 0;
  min-width: 120px;
  max-width: 120px;
  margin-right: 16px;
}

.username {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 4px;
  line-height: 1.3;
}

.date {
  font-size: 0.8rem;
  color: #64748B;
  line-height: 1.3;
}

.post-content {
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 200px);
}

.post-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 8px;
  line-height: 1.4;
}

.post-text {
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
  word-break: break-word;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.no-results-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748B;
  margin: 16px 0 8px 0;
}

.no-results-subtext {
  font-size: 0.9rem;
  color: #94A3B8;
  margin: 0;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  width: 600px;
}

.loading-text {
  margin-top: 16px;
  font-size: 0.9rem;
  color: #64748B;
}

/* 반응형 */
@media (max-width: 1200px) {
  .search-results-component {
    padding: 0 20px;
  }
  
  .search-results-header {
    width: 100%;
    max-width: 600px;
    margin-left: 0;
  }
  
  .search-results-list {
    width: 100%;
    max-width: 600px;
    align-items: flex-start;
    margin-left: 390px;
  }
  
  .no-results {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .search-results-component {
    padding: 0 16px;
  }
  
  .search-results-header {
    margin-bottom: 20px;
    margin-left: 0;
  }
  
  .search-results-title {
    font-size: 1.2rem;
  }
  
      .search-result-item {
      padding: 16px;
      gap: 12px;
      border-radius: 16px;
      min-height: 100px;
    }
  
  .user-info {
    min-width: 100px;
    margin-right: 12px;
  }
  
  .username {
    font-size: 0.9rem;
  }
  
  .date {
    font-size: 0.75rem;
  }
  
  .post-title {
    font-size: 0.95rem;
  }
  
  .post-text {
    font-size: 0.85rem;
  }
  
  .no-results {
    padding: 40px 20px;
    margin: 0 auto;
  }
  
  .no-results-text {
    font-size: 1rem;
  }
  
  .no-results-subtext {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .search-results-component {
    padding: 0 12px;
  }
  
  .search-results-header {
    margin-bottom: 16px;
  }
  
  .search-results-title {
    font-size: 1.1rem;
  }
  
      .search-result-item {
      padding: 12px;
      gap: 10px;
      border-radius: 12px;
      min-height: 80px;
    }
  
  .profile-avatar {
    width: 32px !important;
    height: 32px !important;
  }
  
  .user-info {
    min-width: 80px;
    margin-right: 8px;
  }
  
  .username {
    font-size: 0.85rem;
  }
  
  .date {
    font-size: 0.7rem;
  }
  
  .post-title {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
  
  .post-text {
    font-size: 0.8rem;
  }
  
  .no-results {
    padding: 30px 16px;
    margin: 0 auto;
  }
  
  .no-results-text {
    font-size: 0.95rem;
  }
  
  .no-results-subtext {
    font-size: 0.8rem;
  }
}
</style>
