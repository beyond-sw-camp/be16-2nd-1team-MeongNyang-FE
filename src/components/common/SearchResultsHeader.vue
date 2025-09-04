<template>
  <div class="search-results-header">
    <h2 class="search-results-title">
      '{{ searchKeyword }}'에 대한 검색결과 <span class="result-count">{{ resultCount }}</span>건
    </h2>
  </div>
</template>

<script>
export default {
  name: 'SearchResultsHeader',
  props: {
    searchKeyword: {
      type: String,
      required: true
    },
    resultCount: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped>
.search-results-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  width: 100%;
}

.search-results-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.result-count {
  color: #FF8B8B;
  font-weight: 700;
}

/* 반응형 */
@media (max-width: 768px) {
  .search-results-header {
    padding: 16px;
  }
  
  .search-results-title {
    font-size: 1.2rem;
  }
}
</style>


