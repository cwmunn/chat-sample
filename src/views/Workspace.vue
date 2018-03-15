<template>
  <div id="Workspace">
    <b-navbar toggleable="md" type="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand v-on:click='toogleSideBar' >Chat Sample</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <!-- Using button-content slot -->
            <template slot="button-content">
              <em>{{getUserFullName()}}</em>
            </template>
            <b-dropdown-item v-on:click='logout'>Signout</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <side-bar-navigation v-bind:open="open">
      <div slot="sidebar-content">
        <div id='user-menu'>
          <i class="lnr lnr-user"></i> <span>{{getUserFullName()}}</span>
          <div class='global-info'>
            <b-dropdown id="ddown1" :text="getChatChannelState()">
              <b-dropdown-item v-on:click='changeChatChannelState("ready")'>Ready</b-dropdown-item>
              <b-dropdown-item v-on:click='changeChatChannelState("not-ready")'>Not Ready</b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link">
              <i>TP</i> <span>Thomas Pariaud</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link">
              <i>CM</i> <span>Chris Munn</span>
            </a>
          </li>
        </ul>
      </div>
      <div slot="main-content">
        <div class="container-fluid">
        </div>
      </div>
    </side-bar-navigation>
    <div class="toast-container">
      <chat-toast v-for="interaction in getToastedChatInteractions()" v-bind:chat="interaction" v-bind:key="interaction.id"></chat-toast>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SideBarNavigation from '@/components/SideBarNavigation'
import ChatToast from '@/components/ChatToast'
export default {
  components: {
    SideBarNavigation,
    ChatToast
  },
  data () {
    return {
      open: true
    }
  },
  computed: {
    ...mapGetters([
      'getUserFullName',
      'getChatChannelState',
      'getToastedChatInteractions'
    ])
  },
  mounted () {
  },
  methods: {
    toogleSideBar () {
      this.open = !this.open
    },
    logout () {
      this.$store.dispatch('logout')
    },
    changeChatChannelState (state) {
      this.$store.dispatch('chatChannelChangeState', {state: state})
    }
  }
}
</script>

<style lang="less" scoped>
  #sidebar-nav-container {
    top: 56px;
    bottom: 0px;
    height: auto;
    .nav-link {
      display: block;
      padding: 0.5rem 0;
      white-space: nowrap;
      cursor: pointer;
      overflow: hidden;
      i {
        width: 70px;
        display: inline-block;
        text-align: center;
      }
    }
  }
  .navbar {
    background-color: #FF4F1F!important;
    z-index: 1000;
    .navbar-brand {
      cursor: pointer;
    }
  }
  .toast-container {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 450px;
  }
</style>
<style lang="less">
  #user-menu {
    white-space: nowrap;
    overflow: hidden;
    padding: 10px 0;
    border-bottom: 1px solid;
    margin: 10px;
    i {
      width: 50px;
      font-size: 24px;
      display: inline-block;
      text-align: center;
    }
  }
  .global-info {
    padding: 10px;
    height: 50px;
    .b-dropdown {
      position: absolute;
      button {
        width: 260px;
      }
      .dropdown-menu {
        width: 260px;
      }
    }
  }
  .nav-closed {
    .global-info {
      display: none;
    }
  }
</style>
