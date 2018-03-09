import _ from 'lodash'
import Deferred from 'es6-deferred'

// Obtain the CometD APIs.
var CometD = require('cometd')

var ReloadExtension = require('cometd/ReloadExtension')

function Broadcast () {
  this.callbacks = []
}

Broadcast.prototype.add = function (callback) {
  if (typeof callback === 'function') {
    this.callbacks.push(callback)
  }
}

Broadcast.prototype.empty = function (callback) {
  this.callbacks.splice(0, this.callbacks.length)
}

Broadcast.prototype.fire = function () {
  var args = arguments
  this.callbacks.forEach(function (callback) {
    callback.apply(null, args)
  })
}

var State = {
  UNKNOWN: 0,
  CONNECTED: 1,
  DISCONNECTED: 2,
  DOWN: 3,
  DOWN_MULTICLIENTS: 4
}

var cometd = new CometD.CometD(name)
cometd.unregisterTransports()
// Registration order is important.
if (window.WebSocket) {
  cometd.registerTransport('websocket', new CometD.WebSocketTransport())
}
cometd.registerTransport('long-polling', new CometD.LongPollingTransport())
cometd.registerTransport('callback-polling', new CometD.CallbackPollingTransport())

/**
 * This class is an abstraction layer above a CometD implementation.
 * @constructor Main.CometDHelper
 * @memberof Main
 * @param {object} context Information to tune the realtime channel.
 * @param {string} context.htccToken Token used by GWS to protect about CRSF attack.
 * @param {string} [context.maxMultipleClientsCounter] Define the threshold for the defense for multiple clients situation(5 by default).
 * @param {string} [context.apiPath] Path to the GWS API(/api/v1 by default).
 * @param {integer} [context.timeout] Specifies the duration, in milli-seconds, before the session is considered closed when the connection with the server is lost(60000 by default).
 * @param {boolean} [context.enabledWebsocket Enable the websocket transport(false by default).
 * @ignore
*/
var CometDHelper = function (context) {
  this.masterCometDHelper = null
  this.reloadExtensionEnabled = false
  if (window.chatSample && window.chatSample.common && window.chatSample.common.masterCometDHelper) {
    this.masterCometDHelper = window.chatSample.common.masterCometDHelper
  } else {
    try {
      if ((window !== window.parent) && window.parent.chatSample && window.parent.chatSample.common && window.parent.chatSample.common.masterCometDHelper) {
        this.masterCometDHelper = window.parent.chatSample.common.masterCometDHelper
      }
    } catch (e) {}
  }
  if (this.masterCometDHelper) {
    this.masterCometDHelper.onNotifDown(this.triggerOnNotifDown)
    this.masterCometDHelper.onNotifConnected(this.triggerOnNotifConnected)
    this.masterCometDHelper.onNotifDisconnected(this.triggerOnNotifDisconnected)
    this.masterCometDHelper.onNotifReconnected(this.triggerOnNotifReconnected)
    this.masterCometDHelper.onNotifMultipleClients(this.triggerOnNotifMultipleClients)
    this.masterCometDHelper.onNotifMultipleClientsFixed(this.triggerOnNotifMultipleClientsFixed)
    this.masterCometDHelper.onNotifDownMultiClients(this.triggerOnNotifDownMultiClients)
    this.masterCometDHelper.onNotifReleased(this.triggerOnNotifReleased)
  } else {
    window.chatSample = window.chatSample || {}
    window.chatSample.common = window.chatSample.common || {}
    window.chatSample.common.masterCometDHelper = window.chatSample.common.masterCometDHelper || this
    if (context.reloadExtensionEnabled === false) {
      this.reloadExtensionEnabled = context.reloadExtensionEnabled
    } else {
      this.reloadExtensionEnabled = true
    }
    if (this.reloadExtensionEnabled) {
      if (context.reloadExtensionMaxAge) {
        this.reloadExtensionMaxAge = context.reloadExtensionMaxAge
      } else {
        this.reloadExtensionMaxAge = 15
      }
      var reloadExtension = new ReloadExtension()
      reloadExtension.configure({
        name: 'chatSample.common.commetd-helper.reload'
      })
      cometd.registerExtension('reload', reloadExtension)
    }
  }
  this.logger = context.logger
  this.state = State.UNKNOWN
  this.multipleClientsCounter = 0
  this.deferredResult = new Deferred()
  this.htccToken = context.htccToken
  if (context.maxMultipleClientsCounter) {
    this.maxMultipleClientsCounter = context.maxMultipleClientsCounter
  } else {
    this.maxMultipleClientsCounter = 5
  }
  if (context.apiPath) {
    this.apiPath = context.apiPath
  } else {
    this.apiPath = '/workspace/v3'
  }
  if (context.locationOrigin) {
    this.locationOrigin = context.locationOrigin
  }
  if (context.cometDLogLevel) {
    this.cometDLogLevel = context.cometDLogLevel
  } else {
    this.cometDLogLevel = 'info'
  }
  if (context.cometDEnabledOverrideTraceFormat) {
    this.cometDEnabledOverrideTraceFormat = context.cometDEnabledOverrideTraceFormat
  } else {
    this.cometDEnabledOverrideTraceFormat = false
  }
  if (context.timeout) {
    this.timeout = context.timeout
  } else {
    this.timeout = 60000
  }
  if (context.enabledWebsocket) {
    this.enabledWebsocket = context.enabledWebsocket
  } else {
    this.enabledWebsocket = false
  }
  // TODO reimplement
  this.onNotifDownCallbacks = new Broadcast()
  this.onNotifConnectedCallbacks = new Broadcast()
  this.onNotifDisconnectedCallbacks = new Broadcast()
  this.onNotifReconnectedCallbacks = new Broadcast()
  this.onNotifMultipleClientsCallbacks = new Broadcast()
  this.onNotifMultipleClientsFixedCallbacks = new Broadcast()
  this.onNotifDownMultiClientsCallbacks = new Broadcast()
  this.onNotifReleasedCallbacks = new Broadcast()
  if (this.cometDEnabledOverrideTraceFormat) {
    cometd._debug = function () {
      context.logMsg('debug', arguments)
    }
    cometd._info = function () {
      context.logMsg('info', arguments)
    }
    cometd._warn = function () {
      context.logMsg('warn', arguments)
    }
  }
}

CometDHelper.prototype =
/** @lends Main.CometDHelper# */
{
  constructor: CometDHelper,
  /**
   * Connect to a comet server.
   * @return {CometDHelper} Itself.
   */
  connect: function () {
    if (this.masterCometDHelper) {
      return this.deferredResult
    }
    if (this.reloadExtensionEnabled) {
      this.unloadCallback = _.bind(this.reload, this)
    }
    window.addEventListener('unload', this.unloadCallback)
    var api = this.apiPath
    if (!this.locationOrigin) {
      if (!window.location.origin) {
        window.location.origin = window.location.protocol + '//' + window.location.hostname
        if (window.location.port && (window.location.port !== '')) {
          window.location.origin += ':' + window.location.port
        }
      }
      this.locationOrigin = window.location.origin
    }
    if (api.indexOf('http') !== 0) {
      api = this.locationOrigin + api
    }
    // Configure cometd
    if (this.htccToken) {
      cometd.configure({
        url: api + '/notifications',
        logLevel: this.cometDLogLevel,
        requestHeaders: {'X-CSRF-TOKEN': this.htccToken}
      })
    } else {
      cometd.configure({
        url: api + '/notifications',
        logLevel: this.cometDLogLevel
      })
    }
    if (!this.enabledWebsocket) {
      cometd.unregisterTransport('websocket')
    }
    this.cometSubscriptionHandshake = cometd.addListener('/meta/handshake', _.bind(this.handshakeHandler, this))
    this.cometSubscriptionConnect = cometd.addListener('/meta/connect', _.bind(this.connectHandler, this))
    this.cometSubscriptionSubscribe = cometd.addListener('/meta/subscribe', _.bind(function (message) {
      this.logger.debug('subscribe ' + JSON.stringify(message, null, '\t'))
    }, this))
    this.cometSubscriptionSessionReset = cometd.addListener('/notifications/services', _.bind(this.sessionResetHandler, this))
    cometd.handshake()
    // return this;
    return this.deferredResult
  },

  /**
   * Check handshake message
   * @private
   */
  handshakeHandler: function (message) {
    this.logger.debug('Notif on handshakeHandler ' + JSON.stringify(message, null, '\t'))
    if (!message.successful) {
      if (this.state === State.UNKNOWN) {
        if (message.request && !_.contains(message.request.supportedConnectionTypes, 'websocket')) {
          this.disconnect()
          this.deferredResult.reject()
        }
      } else if (message.advice && message.advice.reconnect === 'none') {
        this.state = State.Down
        try {
          this.disconnect(true)
          this.triggerOnNotifDown()
        } catch (e) {
          this.logger.error('Trigger notifDown failed: ' + e)
        }
      }
    } else {
      this.resolePromise()
      this.state = State.CONNECTED
      this.cometdClientId = message.clientId
      try {
        this.triggerOnNotifConnected()
      } catch (e) {
        this.logger.error('Trigger notifConnected failed: ' + e)
      }
    }
  },

  /**
   * Check connect message
   * @private
   */
  connectHandler: function (message) {
    // RC Stop log pollution this.logger.debug('connect ' + JSON.stringify(message, null, '\t'));
    if (this.state === State.DISCONNECTED) {
      this.logger.debug('Notif on connectHandler(state is DISCONNECTED) ' + JSON.stringify(message, null, '\t'))
      if (this.disconnectionTime && Date.now() - this.disconnectionTime > this.timeout) {
        this.state = State.Down
        try {
          this.disconnect(true)
          this.triggerOnNotifDown()
        } catch (e) {
          this.logger.error('Trigger notifDown failed: ' + e)
        }
        return
      }
    }
    if (message.successful) {
      if (this.state === State.UNKNOWN) {
        this.logger.debug('Notif on connectHandler (state is UNKNOWN)' + JSON.stringify(message, null, '\t'))
        this.resolePromise()
        this.state = State.CONNECTED
        try {
          this.triggerOnNotifConnected()
        } catch (e) {
          this.logger.error('Trigger notifConnected failed: ' + e)
        }
      } else if (this.state === State.DISCONNECTED) {
        this.logger.debug('connect ' + JSON.stringify(message, null, '\t'))
        this.disconnectionTime = null
        this.state = State.CONNECTED
        try {
          this.triggerOnNotifReconnected()
        } catch (e) {
          this.logger.error('Trigger notifReconnected failed: ' + e)
        }
      }
      if (message.advice && (message.advice['multiple-clients'] === true)) {
        if (++this.multipleClientsCounter >= this.maxMultipleClientsCounter) {
          try {
            this.triggerOnNotifMultipleClients()
          } catch (e) {
            this.logger.error('Trigger notifMultipleClients failed: ' + e)
          }
        }
      } else {
        if (this.multipleClientsCounter >= this.maxMultipleClientsCounter) {
          try {
            this.triggerOnNotifMultipleClientsFixed()
          } catch (e) {
            this.logger.error('Trigger notifMultipleClientsFixed failed: ' + e)
          }
        }
        this.multipleClientsCounter = 0
      }
    } else if (message.advice && (message.advice['multiple-clients'] === true)) {
      this.state = State.DOWN_MULTICLIENTS
      try {
        this.triggerOnNotifDownMultiClients()
      } catch (e) {
        this.logger.error('Trigger notifDownMultiClients failed: ' + e)
      }
    } else if (this.state === State.CONNECTED) {
      this.logger.debug('Notif on connectHandler (state is CONNECTED) ' + JSON.stringify(message, null, '\t'))
      this.logger.debug('x-csrf-token : ' + this.htccToken)
      this.disconnectionTime = Date.now()
      this.state = State.DISCONNECTED
      try {
        this.triggerOnNotifDisconnected()
      } catch (e) {
        this.logger.error('Trigger notifDisconnected failed: ' + e)
      }
    }
  },

  rejectPromise: function () {
    this.deferredResult.reject()
  },
  resolePromise: function () {
    this.deferredResult.resolve()
  },
  messageHandler: function (message) {
    this.logger.debug('onMessage\n' + JSON.stringify(message))
  },
  /**
   * Check session reset message
   */
  sessionResetHandler: function (message) {
    this.logger.debug('Notif on sessionResetHandler ' + JSON.stringify(message, null, '\t'))
    if ((message.data) &&
      (message.data.messageType === 'ServiceStateChangeMessage') &&
      (message.data.service) &&
      (message.data.service.name === 'sessionReset') &&
      (message.data.service.type === 'SessionManagement') &&
      (message.data.service.state === 'Active')) {
      try {
        this.triggerOnNotifReconnected()
      } catch (e) {
        this.logger.error('Trigger notifReconnected failed: ' + e)
      }
    }
  },
  /**
   * Disconnect from the comet server.
   * @return {CometDHelper} Itself.
   */
  disconnect: function (keepCallbackAndMaster) {
    if (this.masterCometDHelper) {
      return this.deferredResult
    }
    try {
      this.triggerOnNotifReleased()
    } catch (e) {
      this.logger.error('Trigger notifReleased failed: ' + e)
    }
    this.logger.debug('Unsubscribe from cometd')
    if (this.cometSubscriptionHandshake) {
      cometd.removeListener(this.cometSubscriptionHandshake)
      this.cometSubscriptionHandshake = null
    }
    if (this.cometSubscriptionConnect) {
      cometd.removeListener(this.cometSubscriptionConnect)
      this.cometSubscriptionConnect = null
    }
    if (this.cometSubscriptionSubscribe) {
      cometd.removeListener(this.cometSubscriptionSubscribe)
      this.cometSubscriptionSubscribe = null
    }
    if (this.cometSubscriptionSessionReset) {
      cometd.removeListener(this.cometSubscriptionSessionReset)
      this.cometSubscriptionSessionReset = null
    }
    this.logger.debug('Disconnect cometd')
    cometd.disconnect()
    if (keepCallbackAndMaster !== true) {
      this.cleanCallbacks()
      window.chatSample.common.masterCometDHelper = null
    }
    return this
  },

  /**
   * Attachs a listener.
   * @param {string} channel The channel name.
   * @param {function} callback The callback function which receive the message.
   * @return {object} A cookie identifying the subscrition.
   */
  addListener: function (channel, callback, deferred) {
    if (this.masterCometDHelper) {
      return this.masterCometDHelper.addListener(this.apiPath + '/' + channel, callback, deferred)
    }
    var result = null
    try {
      result = cometd.addListener(this.apiPath + '/' + channel, callback)
      if (deferred) { // addListener is synchronous in CometD
        deferred.resolve()
      }
    } catch (e) {
      this.logger.error('AddListener error: ' + e)
      if (deferred) {
        deferred.reject()
      }
    }
    return result
  },

  /**
   * Detachs the listener.
   * @param {object} cookie The cookie identifying the subscrition.
   */
  removeListener: function (cookie) {
    if (this.masterCometDHelper) {
      return this.masterCometDHelper.removeListener(cookie)
    }
    return cometd.removeListener(cookie)
  },

  triggerOnNotifDown: function () {
    this.onNotifDownCallbacks.fire()
    this.cleanCallbacks()
    window.chatSample.common.masterCometDHelper = null
  },
  triggerOnNotifConnected: function () {
    this.onNotifConnectedCallbacks.fire()
  },
  triggerOnNotifDisconnected: function () {
    this.onNotifDisconnectedCallbacks.fire()
  },
  triggerOnNotifReconnected: function () {
    this.onNotifReconnectedCallbacks.fire()
  },
  triggerOnNotifMultipleClients: function () {
    this.onNotifMultipleClientsCallbacks.fire()
  },
  triggerOnNotifMultipleClientsFixed: function () {
    this.onNotifMultipleClientsFixedCallbacks.fire()
  },
  triggerOnNotifDownMultiClients: function () {
    this.deferredResult.reject('downMultiClients')
    this.onNotifDownMultiClientsCallbacks.fire()
    this.cleanCallbacks()
    window.chatSample.common.masterCometDHelper = null
  },
  triggerOnNotifReleased: function () {
    this.onNotifReleasedCallbacks.fire()
  },
  cleanCallbacks: function () {
    this.onNotifDownCallbacks.empty()
    this.onNotifConnectedCallbacks.empty()
    this.onNotifDisconnectedCallbacks.empty()
    this.onNotifReconnectedCallbacks.empty()
    this.onNotifMultipleClientsCallbacks.empty()
    this.onNotifMultipleClientsFixedCallbacks.empty()
    this.onNotifDownMultiClientsCallbacks.empty()
    this.onNotifReleasedCallbacks.empty()
    this.unloadCallback()
    window.removeEventListener('unload', this.unloadCallback)
  },
  /**
   * Methods to override to be notified when the realtime channel is down.
   */
  onNotifDown: function (callback) {
    this.onNotifDownCallbacks.add(callback)
  },
  /**
   * Methods to override to be notified when the realtime channel is connected.
   */
  onNotifConnected: function (callback) {
    this.onNotifConnectedCallbacks.add(callback)
  },
  /**
   * Methods to override to be notified when the realtime channel is disconnected.
   */
  onNotifDisconnected: function (callback) {
    this.onNotifDisconnectedCallbacks.add(callback)
  },
  /**
   * Methods to override to be notified when the realtime channel is reconnected.
   */
  onNotifReconnected: function (callback) {
    this.onNotifReconnectedCallbacks.add(callback)
  },
  /**
   * Methods to override to be notified when the realtime channel is in multi-clients situations.
   */
  onNotifMultipleClients: function (callback) {
    this.onNotifMultipleClientsCallbacks.add(callback)
  },
  /**
   * Methods to override to be notified when multi-clients situation is fixed in the realtime channel.
   */
  onNotifMultipleClientsFixed: function (callback) {
    this.onNotifMultipleClientsFixedCallbacks.add(callback)
  },
  /**
   * Methods to override to be notified when the realtime channel is down due to a multi-clients situations.
   */
  onNotifDownMultiClients: function (callback) {
    this.onNotifDownMultiClientsCallbacks.add(callback)
  },
  /**
   * Methods to override to be notified when the realtime channel is released.
   */
  onNotifReleased: function (callback) {
    this.onNotifReleasedCallbacks.add(callback)
  },
  reload: function () {
    if (!this.reloadExtensionEnabled) {
      return
    }
    if (this.state !== State.CONNECTED) {
      return
    }
    cometd.reload()
  }
}

export default CometDHelper
