import log4javascript from 'log4javascript'

// //////////////////////
// Log4javascript logger
var Log4javascriptLevelByLevel = {
  // log4javascript.Level.ALL,
  trace: log4javascript.Level.TRACE,
  debug: log4javascript.Level.DEBUG,
  info: log4javascript.Level.INFO,
  warn: log4javascript.Level.WARN,
  error: log4javascript.Level.ERROR,
  // log4javascript.Level.FATAL,
  off: log4javascript.Level.OFF
}

var Log4javascriptLevelByShortLevel = {
  trac: 'trace',
  debu: 'debug',
  info: 'info',
  warn: 'warn',
  erro: 'error',
  off: 'off'
}

var log4javascriptRootLogger = log4javascript.getRootLogger()
log4javascript.BrowserConsoleAppender.prototype.threshold = log4javascript.Level.TRACE
var log4javascriptBrowserConsoleAppender = new log4javascript.BrowserConsoleAppender()
log4javascriptRootLogger.addAppender(log4javascriptBrowserConsoleAppender)

var log4javascriptLayout = new log4javascript.PatternLayout('%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5p] [%c] %m')
log4javascriptBrowserConsoleAppender.setLayout(log4javascriptLayout)

log4javascriptRootLogger.debug('Initialize log4javascript')

/**
 * Create a new logger that is bound to the given module name.
 * @constructor Main.Log4javascriptLogger
 * @memberof Main
 * @param {String} The module name.
 * @ignore
 */
var Log4javascriptLogger = function (module) {
  this.module = module
  this.log4javascript = log4javascript.getLogger(module)
}

/**
 * Get the internal Logger engine object.
 * @return {log4javascript.Logger} The internal Logger engine object.
 */
Log4javascriptLogger.getLog4javascript = function () {
  return log4javascript
}

/**
 * Set the global log level.
 * @param {String} newLogLevel The new log level to set.
 */
Log4javascriptLogger.setLevel = function (newLogLevel) {
  newLogLevel = newLogLevel.toLowerCase()
  Log4javascriptLogger.prototype.level = newLogLevel
  var log4javascriptLevel = Log4javascriptLevelByLevel[newLogLevel] || log4javascript.Level.ALL
  log4javascriptRootLogger.setLevel(log4javascriptLevel)
}

/**
 * Set the the log level for one category.
 * @param {String} category The category.
 * @param {String} newLogLevel The new log level to set.
 */
Log4javascriptLogger.setLevelByCategory = function (category, newLogLevel) {
  newLogLevel = newLogLevel.toLowerCase()
  var log4javascriptLogger = log4javascript.getLogger(category)
  var log4javascriptLevel = Log4javascriptLevelByLevel[newLogLevel] || log4javascript.Level.ALL
  log4javascriptLogger.setLevel(log4javascriptLevel)
}

/**
 * Set the the log level for several categories.
 * @param {String[]} categoriesAndLevels The categories with a selected log level to set.
 */
Log4javascriptLogger.setLevels = function (categoriesAndLevels) {
  if (categoriesAndLevels) {
    for (var i = 0; i < categoriesAndLevels.length; i++) {
      var categoryAndLevel = categoriesAndLevels[i]
      if (categoryAndLevel) {
        var categoryAndLevelArray = categoryAndLevel.split(':')
        if (categoryAndLevelArray && categoryAndLevelArray.length === 2) {
          var level = categoryAndLevelArray[1].trim().toLowerCase().substring(0, 4)
          Log4javascriptLogger.setLevelByCategory(categoryAndLevelArray[0].trim(), Log4javascriptLevelByShortLevel[level])
        }
      }
    }
  }
}

Log4javascriptLogger.prototype =
/** @lends Main.Log4javascriptLogger# */
{
  /**
   * Filters log messages. Only messages equally or more severe than this
   * level will be logged. Default is "info". Setting this to "off"
   * disables all logging.
   */
  level: 'info',
  /**
   * Set the log level of this category of logger.
   * @param {String} newLogLevel The new log level to set.
   */
  setLevel: function (newLogLevel) {
    this.level = newLogLevel
    var log4javascriptLevel = Log4javascriptLevelByLevel[newLogLevel] || log4javascript.Level.ALL
    this.log4javascript.setLevel(log4javascriptLevel)
  },
  trace: function () {
    this.log4javascript.trace.apply(this.log4javascript, arguments)
    return this
  },
  debug: function () {
    this.log4javascript.debug.apply(this.log4javascript, arguments)
    return this
  },
  info: function () {
    this.log4javascript.info.apply(this.log4javascript, arguments)
    return this
  },
  warn: function () {
    this.log4javascript.warn.apply(this.log4javascript, arguments)
    return this
  },
  error: function () {
    this.log4javascript.error.apply(this.log4javascript, arguments)
    return this
  }
}

export default Log4javascriptLogger
