/*
 * @module koa-prerender
 *
 * @author Peter Marton, Gergely Nemeth
 * @fork finbox.io
 */

var url = require('url')
var axios = require('axios')
var debug = process.env.DEBUG

var extensions_to_ignore = [
  '.js',
  '.jsx',
  '.css',
  '.xml',
  '.less',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.pdf',
  '.doc',
  '.txt',
  '.ico',
  '.rss',
  '.zip',
  '.mp3',
  '.rar',
  '.exe',
  '.wmv',
  '.doc',
  '.avi',
  '.ppt',
  '.mpg',
  '.mpeg',
  '.tif',
  '.wav',
  '.mov',
  '.psd',
  '.ai',
  '.xls',
  '.mp4',
  '.m4a',
  '.swf',
  '.dat',
  '.dmg',
  '.iso',
  '.flv',
  '.m4v',
  '.torrent'
]

var crawlers = [
  'yandexbot',
  'googlebot',
  'yahoo',
  'bingbot',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'redditbot',
  'Applebot',
  'WhatsApp',
  'flipboard',
  'duckduckbot',
  'sogou',
  'exabot',
  'ia_archiver',
  'facebot'
]

var DEFAULT_PRERENDER = 'http://service.prerender.io/'

/*
 * Should pre-render?
 *
 * @method should_pre_render
 * @param {Object} options
 * @return {Boolean}
 */

function should_pre_render (options) {
  var has_extension_to_ignore = extensions_to_ignore
    .some(function (extension) {
      return ~options.url.indexOf(extension)
    })

  // do not pre-rend when:
  if (!options.userAgent) return false
  if (options.method !== 'GET') return false
  if (options.prerenderAgent) return false
  if (has_extension_to_ignore) return false

  // do pre-render when:
  var query = url.parse(options.url, true).query
  if (query && query['_escaped_fragment_'] !== undefined) return true
  if (options.bufferAgent) return true

  return is_bot(options.userAgent)
}

/*
 * Pre-render middleware
 *
 * @method pre_render_middleware
 * @param {Object} options
 */
module.exports = function pre_render_middleware (options) {
  options = options || {}
  options.prerender = options.prerender || DEFAULT_PRERENDER

  /*
   * Pre-render
   *
   * @method pre_render
   * @param {Generator} next
   */
  return function * pre_render(next) {
    var protocol = options.protocol || this.protocol
    var host = options.host || this.host
    var ua_passthrough = options.user_agent_passthrough
    var headers = { 'User-Agent': this.accept.headers['user-agent'] }

    var token = options.prerender_token || process.env.PRERENDER_TOKEN

    if (token) headers['X-Prerender-Token'] = token

    var yes_pre_render = should_pre_render({
      userAgent: this.get('user-agent'),
      bufferAgent: this.get('x-bufferbot'),
      prerenderAgent: ua_passthrough && this.get('x-prerender'),
      method: this.method,
      url: this.url
    })

    // Pre-render generate the site and return
    if (yes_pre_render) {
      var render_url = protocol + '://' + host + this.url
      var pre_render_url = options.prerender + render_url
      var response = yield axios({
        url: pre_render_url,
        headers: headers
      }).catch(function (e) {
        if (debug) console.error(e.message)
        return { data: '' }
      })

      var body = response.data
      if (!body && debug) console.error('No response received :(')
      if (options.log) console.log('pre-render...%s, %s', render_url, JSON.stringify(headers))

      yield* next

      this.body = body
      this.set('X-Prerender', 'true')
    } else {
      yield* next
      this.set('X-Prerender', 'false')
    }
  }
}

function is_bot (user_agent) {
  return crawlers.some(check_ua(user_agent))
}

function check_ua (user_agent) {
  return function (crawler) {
    return ~user_agent.toLowerCase()
      .indexOf(crawler)
  }
}
