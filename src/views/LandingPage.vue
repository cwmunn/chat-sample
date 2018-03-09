<template>
  <div id="LandingArea">
    <div>
      <div id="AppIcon" class="app-icon"><img :src="appIcon" /></div>
      <div id="AppName" class="app-name">Chat Sample</div>
    </div>
    <div id="LoadingSpinner" class='loading-spinner-area'>
      <img :src="loadingGif" />
      <div id="LoadingText">Loading please wait...</div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      appIcon: 'static/img/genesys-logo-colored.svg?version=' + window.version_number,
      loadingGif: 'static/img/ajax-loader.gif?version=' + window.version_number
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
  #LandingArea {
    display: inline;
    width:430px;
    position: absolute;
    top: 31%;
    left: 50%;
    margin-left: -210px;
  }
  .app-name {
    display:inline-block;
    font-size: 35px;
    margin-left: -30px;
    vertical-align: middle;
  }
  .app-icon {
    display:inline-block;
    width:250px;
    height: 106px;
    margin-left: -10px;
  }
  .loading-spinner-area {
    text-align: center;
    > img {
      height: 60px;
      margin-top: 25px;
      margin-bottom: 25px;
    }
  }
</style>
