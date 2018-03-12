<template id='sidebar-nav'>
  <div id="sidebar-nav-container" v-bind:class="open ? 'nav-open' : 'nav-closed'">
    <transition name="left-nav">
      <div id="vue-sidebar">
        <slot name="sidebar-content"></slot>
      </div>
    </transition>
    <div id="vue-navcontent">
      <slot name="main-content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideBarNavigation',
  props: {
    open: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="less">
  #vue-sidebar {
    position: relative;
    height: 100%;
    background-color: #37474F;
    color: white;
    float: left;
    transition-property: width;
    transition-duration: 0.5s;
    transition-timing-function: ease;
    .nav-item {
      padding-top: 5px 0;
      color: lightgray;
      &:first-child {
        margin-top: 20px;
      }

      &:hover {
        background-color: #4e6571;
      }

      &.active  {
        color: white;
      }

      i { font-size: 1.2em; }
    }
  }

  #vue-navcontent {
    position: relative;
    height: 100%;
  }

  #sidebar-nav-container {
    position: absolute;
    width: 100%;
    left: 0px;
    height: 100%;
  }

  .nav-open {
    #vue-navcontent {
      left: 300px;
      width: ~"calc(100% - 300px)";
      animation: content-open 0.5s ease;
    }
    #vue-sidebar {
      width: 300px;
    }
  }

  .nav-closed {
    #vue-sidebar {
      width: 70px;
    }
    #vue-navcontent {
      left: 70px;
      width: ~"calc(100% - 70px)";
      animation: content-close 0.5s ease;
    }
  }

  .left-nav-enter,
  .left-nav-leave-to {
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
  }

  .left-nav-enter-active,
  .left-nav-leave-active {
    transition: all .3s ease;
  }

  @keyframes content-close {
    from {
      width: ~"calc(100% - 300px)";
      left: 300px;
    }
    to {
      width: ~"calc(100% - 70px)";
      left: 70px;
    }
  }

  @keyframes content-open {
    from {
      width: ~"calc(100% - 70px)";
      left: 70px;
    }
    to {
      width: ~"calc(100% - 300px)";
      left: 300px;
    }
  }
</style>
