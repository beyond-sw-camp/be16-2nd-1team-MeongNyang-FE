<template>
  <div class="pet-list-view">
    <v-container fluid>
      <PetList />
    </v-container>
  </div>
</template>

<script>
import PetList from '@/components/pet/PetList.vue'

export default {
  name: 'PetListView',
  components: {
    PetList
  }
}
</script>

<style scoped>
.pet-list-view {
  min-height: 100vh;
  background-color: var(--v-theme-background);
}
</style>
