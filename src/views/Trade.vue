<template>
  <div class="trade-container">
    <v-container fluid class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="10">
          <h1 class="text-h4 font-weight-bold text-primary mb-6">반려용품 거래</h1>
          <p class="text-body-1 text-grey-darken-1 mb-8">
            중고 반려용품을 안전하게 거래하세요
          </p>
          
          <!-- 임시 거래글 목록 -->
          <v-row>
            <v-col cols="12" md="4" v-for="i in 6" :key="i">
              <v-card class="trade-card" elevation="4">
                <v-img
                  src="https://picsum.photos/400/300?random={{ i + 10 }}"
                  height="200"
                  cover
                ></v-img>
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium mb-2">강아지 장난감 세트</h3>
                  <p class="text-body-2 text-grey-darken-1 mb-3">
                    거의 새것 같은 강아지 장난감입니다. 사용감 거의 없어요!
                  </p>
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-h6 font-weight-bold text-primary">₩15,000</span>
                    <v-chip color="success" size="small">판매중</v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'TradePage'
}
</script>

<style lang="scss" scoped>
.trade-container {
  min-height: calc(100vh - 68px);
  background: linear-gradient(135deg, rgba(255, 154, 139, 0.05) 0%, rgba(168, 230, 207, 0.05) 100%);
}

.trade-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
