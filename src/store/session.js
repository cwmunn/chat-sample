import Logger from 'logger'
import RealTime from '@/models/RealTime'
import axios from 'axios'

const config = require('@/config.json')
const logger = new Logger('SessionManager')
const queryParamsRegexp = /^([^#]*\?)(([^#]*)&)?code(=[^&#]*)?(&|#|$)/
const redirectUri = window.location.href.replace(queryParamsRegexp, '$1$3$5').replace(/^([^#]*)((\?)&|\?(#|$))/, '$1$3$4')

const extractUrlParams = () => {
  const t = location.search.substring(1).split('&')
  let f = []
  for (let i = 0; i < t.length; i++) {
    let x = t[i].split('=')
    f[x[0]] = x[1]
  }
  return f
}

const token = extractUrlParams()['code']

const createCometDInstance = (store) => {
  let cometDInstance = new RealTime(config, store)
  cometDInstance.onNotifConnected(() => {
    cometDInstance.addListener('initialization')
    cometDInstance.addListener('media')
    cometDInstance.addListener('media/chat')
  })
  state.cometDInstance = cometDInstance
  return cometDInstance.connect()
}

const state = {
  isConnected: false,
  apiPath: config.APIRootServerPath + config.api.substring(config.api.indexOf('/api')),
  error: '',
  user: {},
  cometDInstance: null
}

const mutations = {
  REALTIME_INITIALIZATION_WORKSPACE_INITIALIZATION_COMPLETE (state, playload) {
    if (playload.data) {
      state.user = Object.assign({}, state.user, playload.data.user)
    }
  },
  REALTIME_INITIALIZATION_WORKSPACE_INITIALIZATION_FAILED (state, playload) {
    state.isConnected = false
    state.error = playload.data && playload.data.errors ? playload.data.errors.map((e) => {
      try {
        if (e.statusCode && e.statusCode === 7511) {
          // var regExp = /\[([^)]+)\]/
          // var matches = regExp.exec(e.message)
          return 'to do'
          // return _.template(i18n.login_roles_error)({username: matches.length && matches.length > 1 ? matches[1] : ''})
        } else {
          return e.message
        }
      } catch (_e) {
        return e.message
      }
    }).join(' ') : ''
    if (playload.data) {
      state.user = Object.assign({}, state.user, playload.data.user)
    }
  },
  ACTIVATE_CHANNELS_SUCCEED (state, playload) {
    state.isConnected = true
  }
}

const actions = {
  login (store) {
    logger.debug('login function')
    return axios.get(state.apiPath + '/current-session')
      .then((response) => {
        logger.debug(state.apiPath + '/current-session SUCCEED with:\n' + JSON.stringify(response.data, null, '\t'))
        var data = response.data
        if (data && data['pending-login-async'] && data['pending-login-async'].state === 'Failed') {
          store.dispatch('logout')
        } else if (data && data['pending-login-async'] && data['pending-login-async'].state !== 'Complete') {
          return store.dispatch('initCometD').catch((error) => {
            logger.error('login function ' + error)
            store.dispatch('logout')
          })
        } else if (store) {
          store.commit('REALTIME_INITIALIZATION_WORKSPACE_INITIALIZATION_COMPLETE', data)
          if (data && data.data && data.data.user && data.data.user.activeSession) {
            store.commit('ACTIVATE_CHANNELS_SUCCEED')
            store.commit('REALTIME_MEDIA_CHANNEL_STATE_CHANGED_MESSAGE', data.data.user.activeSession)
          }
          return store.dispatch('initCometD').catch((error) => {
            logger.error('login function ' + error)
            store.dispatch('logout')
          })
        }
      })
      .catch((error) => {
        logger.debug(state.apiPath + '/current-session  FAILED with:\n' + JSON.stringify(error.response, null, '\t'))
        // if not try to see if there is a token or anything in the url and call initialize workspace
        if (token && token !== localStorage.getItem('chat-sample.token')) { // there is a token in the url but different from the storage (first redirect ?)
          return store.dispatch('initializeWorkspace', {token: token})
        } else { // there is no token in the url neither in the storage redirect to login page
          window.location.href = state.apiPath + '/login?redirect_uri=' + redirectUri
        }
      })
  },

  initializeWorkspace (store, context) {
    let _token = context.token || token
    logger.debug('initializeWorkspace function')
    return axios.post(state.apiPath + '/initialize-workspace?code=' + _token + '&redirect_uri=' + redirectUri)
      .then((response) => {
        logger.debug(state.apiPath + '/initialize-workspace SUCCEED with:\n' + JSON.stringify(response.data, null, '\t'))
        localStorage.setItem('chat-sample.token', _token)
        // initialize Workspace works so we need to open cometD connection and wait the initialized event
        return store.dispatch('initCometD')
      })
      .catch((error) => {
        logger.error(state.apiPath + '/initialize-workspace  FAILED with:\n' + JSON.stringify(error.response, null, '\t'))
        throw error
      })
  },

  logout (store, context) {
    logger.debug('logout function')
    return axios.post(state.apiPath + '/logout', null, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
      .then((response) => {
        logger.debug(state.apiPath + '/logout SUCCEED with:\n' + JSON.stringify(response.data, null, '\t'))
        // if (state.cometDInstance) {
        //   state.cometDInstance.disconnect()
        // }
        localStorage.removeItem('chat-sample.ressources')
        logger.debug('logout succeeded')
        location.reload()
      })
      .catch((error) => {
        logger.error(state.apiPath + '/logout  FAILED with:\n' + JSON.stringify(error.response, null, '\t'))
        throw error
      })
  },

  promptLogout ({ commit }, context) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 10000, 'foo')
    })
  },

  initCometD (store, context) {
    if (state.cometDInstance) {
      return state.cometDInstance
    }
    createCometDInstance(store)
    return state.cometDInstance
  },

  activateChannelChatForUser (store, context) {
    return axios.post(state.apiPath + '/activate-channels', { data: { placeName: context.placeName, channels: ['chat'] } }, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })
      .then((response) => {
        logger.debug(state.apiPath + '/activate-channels SUCCEED with:\n' + JSON.stringify(response.data, null, '\t'))
        store.commit('ACTIVATE_CHANNELS_SUCCEED')
      })
      .catch((error) => {
        logger.error(state.apiPath + '/activate-channels  FAILED with:\n' + JSON.stringify(error.response, null, '\t'))
        throw error
      })
  }
}

const getters = {
  getUserFullName: (state, getters) => () => {
    return state.user ? state.user.firstName + ' ' + state.user.lastName : ''
  },
  getUser: (state, getters) => () => {
    return state.user
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
