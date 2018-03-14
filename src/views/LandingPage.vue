<template>
  <div id="LandingArea">
    <div>
      <div id="AppIcon" class="app-icon"><img :src="appIcon" /></div>
      <div id="AppName" class="app-name">Chat Sample</div>
    </div>
    <div id="LoadingSpinner" class='loading-spinner-area' v-if='this.isUserLoggedIn()'>
      <img :src="loadingGif" />
      <div id="LoadingText">Loading please wait...</div>
    </div>
    <div id="SelectPlace" class='select-place-area' v-else>
      <label>Welcome {{getUserFullName()}}</label>
      <b-form-input v-model="place" type="text" id="placeInput"
        placeholder="Enter your place"></b-form-input>
      <b-button variant="primary" v-on:click='activateChannel'>
        Continue
      </b-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isempty'
export default {
  data () {
    return {
      appIcon: 'static/img/genesys-logo-colored.svg?version=' + window.version_number,
      loadingGif: 'static/img/ajax-loader.gif?version=' + window.version_number
    }
  },
  computed: {
    ...mapGetters([
      'getUser',
      'getUserFullName'
    ]),
    place () {
      return isEmpty(this.getUser()) ? '' : this.getUser().defaultPlace
    }
  },
  mounted () {
  },
  methods: {
    isUserLoggedIn () {
      return isEmpty(this.getUser())
    },
    activateChannel () {
      this.$store.dispatch('activateChannelChatForUser', {placeName: this.place}).catch(() => {
        // display the error somewhere
      })
    }
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
  .select-place-area {
    padding: 10px 60px;
    label {
      font-weight: lighter;
      font-size: 23px;
    }
    button {
      margin-top: 20px;
      margin-left: 42px;
      width: 213px;
    }
  }
</style>
