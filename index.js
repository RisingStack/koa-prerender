/*
 * @module koa-prerender
 *
 * @author Peter Marton, Gergely Nemeth
 */

var url = require('url');

var request = require('request');
var thunkify = require('thunkify-wrap');

// Turn callback into a thunk
var requestGet = thunkify(request.get);

var crawlerUserAgents = [
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
  'developers.google.com/+/web/snippet'
];

var extensionsToIgnore = [
  '.js',
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
];

var DEFAULT_PRERENDER = 'http://service.prerender.io/';


/*
 * Should pre-render?
 *
 * @method shouldPreRender
 * @param {Object} options
 * @return {Boolean}
 */
function shouldPreRender (options) {
  var hasExtensionToIgnore = extensionsToIgnore.some(function (extension) {
    return options.url.indexOf(extension) !== -1;
  });

  var isBot = crawlerUserAgents.some(function (crawlerUserAgent) {
    return options.userAgent.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1;
  });

  // do not pre-rend when:
  if (!options.userAgent) {
    return false;
  }

  if (options.method !== 'GET') {
    return false;
  }

  if (hasExtensionToIgnore) {
    return false;
  }

  // do pre-render when:
  var query = url.parse(options.url, true).query;
  if (query && query.hasOwnProperty('_escaped_fragment_')) {
    return true;
  }

  if (options.bufferAgent) {
    return true;
  }

  return isBot;
}


/*
 * Pre-render middleware
 *
 * @method preRenderMiddleware
 * @param {Object} options
 */
module.exports = function preRenderMiddleware (options) {
  options = options || {};
  options.prerender = options.prerender || DEFAULT_PRERENDER;

  /*
   * Pre-render
   *
   * @method preRender
   * @param {Generator} next
   */
  return function *preRender(next) {
    var protocol = options.protocol || this.protocol;
    var host = options.host || this.host;
    var headers = {
      'User-Agent': this.accept.headers['user-agent']
    };

    var prePreRenderToken = options.prerenderToken || process.env.PRERENDER_TOKEN;

    if(prePreRenderToken) {
      headers['X-Prerender-Token'] = prePreRenderToken;
    }

    var isPreRender = shouldPreRender({
      userAgent: this.get('user-agent'),
      bufferAgent: this.get('x-bufferbot'),
      method: this.method,
      url: this.url
    });

    var body = '';

    var renderUrl;
    var preRenderUrl;
    var response;

    // Pre-render generate the site and return
    if (isPreRender) {
      renderUrl = protocol + '://' + host + this.url;
      preRenderUrl = options.prerender + renderUrl;
      response = yield requestGet({
        url: preRenderUrl,
        headers: headers,
        gzip: true
      });

      body = response[1] || '';

      yield* next;

      this.body = body.toString();
      this.set('X-Prerender', 'true');
    } else {
      yield* next;
      this.set('X-Prerender', 'false');
    }
  };
};
