import Logger from 'logger'
import find from 'lodash/find'
import axios from 'axios'

const logger = new Logger('ChatManager')
const state = {
  channel: {
    name: 'chat',
    state: 'unknown'
  }
}

const mutations = {
  REALTIME_MEDIA_CHANNEL_STATE_CHANGED_MESSAGE (state, playload) {
    logger.debug('REALTIME_MEDIA_CHANNEL_STATE_CHANGED_MESSAGE ' + JSON.stringify(playload))
    if (playload && playload.media && playload.media.channels) {
      let media = find(playload.media.channels, (c) => {
        return c.name === 'chat'
      })
      if (media) {
        state.channel.state = media.state
      }
    }
  }
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
  },
  chatChannelChangeState ({ commit, rootState }, {state}) {
    logger.debug('chatChannelChangeState')
    return axios.post(rootState.session.apiPath + `/media/chat/${state}`, { data: {} }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
      .then((response) => {
        logger.debug(rootState.session.apiPath + `/media/chat/${state} SUCCEED with:\n` + JSON.stringify(response.data, null, '\t'))
      })
      .catch((error) => {
        logger.error(rootState.session.apiPath + `/media/chat/${state} FAILED with:\n` + JSON.stringify(error.response, null, '\t'))
        throw error
      })
  }
}

const getters = {
  getChatChannelState: (state, getters) => () => {
    return state.channel.state
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
