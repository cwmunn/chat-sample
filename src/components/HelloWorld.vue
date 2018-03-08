<template>
  <div>
    <h2>Chat Sample</h2>
    <button v-on:click="accept">Accept</button>
  </div>
</template>

<script>
import chatApi from '@/api/ChatApi'
export default {
  name: 'ChatSample',
  data () {
    return {}
  },
  methods: {
    accept: function () {
      chatApi.accept('123')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
