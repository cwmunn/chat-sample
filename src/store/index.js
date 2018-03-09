import Vue from 'vue'
import Vuex from 'vuex'
import session from './session'
import chat from './chat'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    session,
    chat
  }
})
