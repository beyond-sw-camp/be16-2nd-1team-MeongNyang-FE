<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="pa-6">
          <v-card-title class="text-h1 mb-4">
            404
          </v-card-title>
          <v-card-subtitle class="text-h5 mb-6">
            페이지를 찾을 수 없습니다
          </v-card-subtitle>
          <v-card-text class="text-body-1 mb-6">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              color="primary"
              size="large"
              @click="$router.push('/')"
              class="mr-4"
            >
              홈으로 돌아가기
            </v-btn>
            <v-btn
              outlined
              size="large"
              @click="$router.go(-1)"
            >
              이전 페이지
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
