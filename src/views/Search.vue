<template>
  <div class="search-container">
    <v-container fluid class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold text-primary mb-6">검색</h1>
          
          <!-- 검색 입력 -->
          <v-card class="mb-6">
            <v-card-text class="pa-6">
              <v-text-field
                v-model="searchQuery"
                label="검색어를 입력하세요"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                append-inner-icon="mdi-close"
                @click:append-inner="clearSearch"
                @keyup.enter="performSearch"
                class="mb-4"
              ></v-text-field>
              
              <v-btn
                color="primary"
                size="large"
                block
                @click="performSearch"
                :loading="searching"
              >
                <v-icon left>mdi-magnify</v-icon>
                검색
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- 검색 결과 -->
          <div v-if="searchResults.length > 0">
            <h2 class="text-h5 font-weight-medium mb-4">검색 결과</h2>
            <v-card v-for="result in searchResults" :key="result.id" class="mb-4">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar size="40" class="mr-3">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-medium mb-1">{{ result.title }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-2">{{ result.content }}</p>
                    <div class="d-flex align-center">
                      <span class="text-caption text-grey-darken-1">{{ result.author }}</span>
                      <v-spacer></v-spacer>
                      <span class="text-caption text-grey-darken-1">{{ result.date }}</span>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- 검색 결과 없음 -->
          <div v-else-if="hasSearched" class="text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-magnify</v-icon>
            <h3 class="text-h5 font-weight-medium mb-2">검색 결과가 없습니다</h3>
            <p class="text-body-1 text-grey-darken-1">다른 검색어를 시도해보세요</p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'SearchPage',
  data() {
    return {
      searchQuery: '',
      searching: false,
      hasSearched: false,
      searchResults: []
    }
  },
  methods: {
    performSearch() {
      if (!this.searchQuery.trim()) return
      
      this.searching = true
      this.hasSearched = true
      
      // 임시 검색 결과 (실제로는 API 호출)
      setTimeout(() => {
        this.searchResults = [
          {
            id: 1,
            title: '강아지 산책 팁',
            content: '강아지와 함께하는 즐거운 산책 방법을 공유합니다...',
            author: '반려인1',
            date: '2시간 전'
          },
          {
            id: 2,
            title: '고양이 건강 관리',
            content: '고양이의 건강을 위한 관리 방법에 대해 알아보세요...',
            author: '반려인2',
            date: '5시간 전'
          }
        ]
        this.searching = false
      }, 1000)
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.searchResults = []
      this.hasSearched = false
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  min-height: calc(100vh - 68px);
  background: linear-gradient(135deg, rgba(255, 154, 139, 0.05) 0%, rgba(168, 230, 207, 0.05) 100%);
}
</style>
