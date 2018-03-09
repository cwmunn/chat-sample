<template>
  <div id="app">
    <landing-page v-if='!isConnected' />
    <router-view v-else />
  </div>
</template>

<script>
import LandingPage from '@/views/LandingPage.vue'
export default {
  name: 'App',
  components: {
    LandingPage
  },
  computed: {
    isConnected () {
      return this.$store.state.session.isConnected
    }
  },
  mounted () {
    // Automatic login
    setTimeout(() => {
      this.$store.dispatch('login')
    }, 2000)
  }
}
</script>

<style>
#app {
}
</style>
