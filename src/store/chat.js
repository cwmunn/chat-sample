import Logger from 'logger'
import find from 'lodash/find'
import filter from 'lodash/filter'
import trim from 'lodash/trim'
import axios from 'axios'

const logger = new Logger('ChatManager')
const state = {
  channel: {
    name: 'chat',
    state: 'unknown'
  },
  interactions: []
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
  },
  REALTIME_MEDIA_CHAT_INTERACTION_STATE_CHANGED (state, playload) {
    logger.debug('REALTIME_MEDIA_CHAT_INTERACTION_STATE_CHANGED ' + JSON.stringify(playload))
    if (playload && playload.interaction) {
      // first need to find if the interaction already exist in store
      let interaction = find(state.interactions, (i) => {
        return i.id === playload.interaction.id
      })
      if (interaction) {
        let index = state.interactions.indexOf(interaction)
        interaction = Object.assign({}, interaction, playload.interaction)
        state.interactions.splice(index, 1, interaction)
      } else {
        // if not add this one in the interactions array
        state.interactions.push(playload.interaction)
      }
    }
  }
}

const actions = {
  chatAccept ({ commit, rootState }, {id}) {
    logger.debug(`[${id}] accept...`)
    return axios.post(rootState.session.apiPath + `/media/chat/interactions/${id}/accept`, { data: {} }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
      .then((response) => {
        logger.debug(rootState.session.apiPath + `/media/chat/interactions/${id}/accept SUCCEED with:\n` + JSON.stringify(response.data, null, '\t'))
      })
      .catch((error) => {
        logger.error(rootState.session.apiPath + `/media/chat/interactions/${id}/accept FAILED with:\n` + JSON.stringify(error.response, null, '\t'))
        throw error
      })
  },
  chatReject ({ commit, rootState }, {id}) {
    logger.debug(`[${id}] reject...`)
    return axios.post(rootState.session.apiPath + `/media/chat/interactions/${id}/reject`, { data: {} }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
      .then((response) => {
        logger.debug(rootState.session.apiPath + `/media/chat/interactions/${id}/reject SUCCEED with:\n` + JSON.stringify(response.data, null, '\t'))
      })
      .catch((error) => {
        logger.error(rootState.session.apiPath + `/media/chat/interactions/${id}/reject FAILED with:\n` + JSON.stringify(error.response, null, '\t'))
        throw error
      })
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
  },
  getToastedChatInteractions: (state, getters) => () => {
    return filter(state.interactions, (i) => {
      return i.state === 'Invited'
    })
  },
  getActiveChatInteractions: (state, getters) => () => {
    return filter(state.interactions, (i) => {
      return i.state !== 'Invited' && i.state !== 'Revoked' && i.state !== 'Completed'
    })
  },
  getChatContact: (state, getter) => (idChat) => {
    const chat = find(state.interactions, (i) => {
      return i.id === idChat
    })
    if (chat && chat.userData) {
      const firstName = find(chat.userData, (u) => {
        return u.key === 'FirstName'
      })
      const lastName = find(chat.userData, (u) => {
        return u.key === 'LastName'
      })
      const _ln = lastName ? lastName.value || ' ' : ' '
      const _fn = firstName ? firstName.value || ' ' : ' '
      return {displayName: trim(_fn + ' ' + _ln), initial: trim(_fn[0].toUpperCase() + _ln[0].toUpperCase())}
    }
    return {}
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
