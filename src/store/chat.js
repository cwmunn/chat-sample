const state = {
}

const mutations = {
}

const actions = {
  chatAccept ({ commit }, {id}) {
    console.log(`[${id}] accept...`)
  },
  chatReject ({ commit }, {id}) {
    console.log(`[${id}] reject...`)
  },
  chatLeave ({ commit }, {id}) {
    console.log(`[${id}] leave...`)
  },
  chatComplete ({ commit }, {id}) {
    console.log(`[${id}] complete...`)
  },
  chatSendMessage ({ commit }, {id, msg}) {
    console.log(`[${id}] send-message: ${msg}...`)
  },
  chatTypingStarted ({ commit }, {id}) {
    console.log(`[${id}] typing started...`)
  },
  chatTypingStopped ({ commit }, {id}) {
    console.log(`[${id}] typing stopped...`)
  }
}

const getters = {

}

export default {
  state,
  getters,
  mutations,
  actions
}
