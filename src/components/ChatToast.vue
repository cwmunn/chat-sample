<template>
  <div class="toast">
    <div class="toast-header">
      <div class="avatar">
      <span class="lnr lnr-bubble"></span>
      </div>
      <div class="subject">
      <h5>New Incomming Chat</h5>
      </div>
    </div>
    <div class="toast-content">
      {{chat.subject}}
    </div>
    <div class="button-container">
      <b-button variant="secondary" v-on:click='rejectChat()'>
        Reject
      </b-button>
      <b-button variant="primary" v-on:click='acceptChat()'>
        Accept
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatToast',
  props: {
    chat: {
      type: Object,
      required: true
    }
  },
  methods: {
    rejectChat: function () {
      this.$store.dispatch('chatReject', {id: this.chat.id})
    },
    acceptChat: function () {
      this.$store.dispatch('chatAccept', {id: this.chat.id})
    }
  }
}
</script>

<style lang="less" scoped>
  .toast {
    background: #37474f;
    padding: 10px;
    border-top: 3px solid #ff4f1f;
    .avatar {
      font-size: 38px;
      color: #FDFDFD;
      display: inline-block;
      padding: 0 10px;
      vertical-align: middle;
    }
    .subject {
      display: inline-block;
      color: #ff4f1f;
      height: 30px;
      vertical-align: middle;
      h5 {
        margin: 0;
        padding: 0;
      }
    }
    .toast-content {
      padding: 5px 10px;
      color: #FDFDFD;
      white-space: pre;
    }
    .button-container {
      text-align: right;
      margin: 10px 0;
      button {
        width: 150px;
        &:first-child {
          margin-right: 120px;
        }
        &.btn-primary {
          background: #FF4F1F;
          border-color: #FF4F1F;
          &:focus {
            box-shadow: 0 0 0 0.2rem rgba(255, 79, 31, 0.28);
          }
          &:hover {
            background: #FF4F1F;
            border-color: #FF4F1F;
          }
        }
      }
    }
  }
</style>
