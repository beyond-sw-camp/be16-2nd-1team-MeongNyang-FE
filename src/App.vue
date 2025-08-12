<template>
  <v-app>
    <!-- header, footer를 제외한 실질적인 화면의 내용은 v-main안에 들어감 -->
    <HeaderComponent />

    <v-main>
      <router-view />
    </v-main>

    <FooterComponent />
  </v-app>
</template>

<script>
  import HeaderComponent from './components/HeaderComponent.vue';
  import FooterComponent from './components/FooterComponent.vue';

  export default {
    name: 'App',
    components: {
      HeaderComponent,
      FooterComponent
    }
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
