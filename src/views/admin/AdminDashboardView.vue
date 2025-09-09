<template>
  <v-container>
    <v-card>
      <v-card-title>관리자 대시보드</v-card-title>
      <v-card-text>
        <p>관리자 대시보드 페이지입니다.</p>
        <v-btn @click="$router.push('/dashboard')">일반 대시보드로 돌아가기</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'AdminDashboardView'
}
</script>
