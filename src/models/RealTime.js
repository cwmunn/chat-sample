import _ from 'lodash'
import CometDHelper from '@/models/CometdHelper'
import Logger from 'logger'

export default class {
  constructor (config, store) {
    this.cometDHelper = new CometDHelper({
      'system.notif.threshold-defense-multiple-clients': 5,
      'APIRootServerPath': config.APIRootServerPath,
      'apiPath': (config.APIRootServerPath + config.api.substring(config.api.indexOf('/api'))).replace(config.APIRootServerPath, ''),
      'system.cometd.timeout': 60000,
      'system.cometd.log-level': 'info',
      'system.cometd.enabled-override-trace-format': true,
      'system.notif.enabled-websocket': false,
      'system.notif.reload-extension.is-enabled': true,
      'system.notif.reload-extension.max-age': 15,
      'locationOrigin': config.APIRootServerPath,
      'logger': new Logger('COMETD_INSTANCE')
    })
    this.subsriptions = {}
    if (store) {
      this.store = store
    }
    const _addListener = this.cometDHelper.addListener
    this.cometDHelper.addListener = _.bind((channel, callback, deferred) => {
      if (channel && !this.subsriptions[channel] && this.store) {
        this.subsriptions[channel] = _addListener.call(this.cometDHelper, channel, (msg) => {
          let key = 'REALTIME_' + channel.toUpperCase()
          if (msg && msg.data && msg.data.messageType) {
            key = key + '_' + _.camelCase(msg.data.messageType).replace(/([A-Z])/g, ($1) => { return '_' + $1.toLowerCase() }).toUpperCase()
          }
          this.passToStore(key, msg && msg.data ? msg.data : msg)
        })
      }
      if (callback) {
        return _addListener.call(this.cometDHelper, channel, callback, deferred)
      }
    }, this)
    const _removeListener = this.cometDHelper.addListener
    this.cometDHelper.removeListener = _.bind((channel, cookie) => {
      if (channel && this.subsriptions[channel]) {
        _removeListener.call(this.cometDHelper, this.subsriptions[channel])
        delete this.subsriptions[channel]
      }
      if (cookie) {
        return _removeListener.call(this.cometDHelper, cookie)
      }
      return true
    }, this)
    const _disconnect = this.cometDHelper.disconnect
    this.cometDHelper.disconnect = _.bind(() => {
      for (let key in this.subsriptions) {
        this.cometDHelper.removeListener(key)
      }
      return _disconnect.call(this.cometDHelper)
    }, this)
  }

  addListener (channel, callback, deferred) {
    return this.cometDHelper.addListener(channel, callback, deferred)
  }

  removeListener (channel, cookie) {
    return this.cometDHelper.removeListener(channel, cookie)
  }

  onNotifConnected (callback) {
    return this.cometDHelper.onNotifConnected(callback)
  }

  connect () {
    return this.cometDHelper.connect()
  }

  passToStore (event, payload) {
    if (!event.startsWith('REALTIME_')) {
      return
    }
    this.store.commit(event, payload)
  }
}
