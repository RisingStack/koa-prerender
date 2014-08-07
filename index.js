var phantom = require('phantom');
var thunkify = require('thunkify');
var url = require('url');

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

var shouldPrerender = function (options) {
  var hasExtensionToIgnore = extensionsToIgnore.some(function (extension) {
    return options.url.indexOf(extension) !== -1;
  });
  var isBot = crawlerUserAgents.some(function (crawlerUserAgent) {
    return options.userAgent.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1;
  });
  // do not prerend when:
  if (!options.userAgent) {
    return false;
  }

  if (options.method !== 'GET') {
    return false;
  }

  if (hasExtensionToIgnore) {
    return false;
  }

  // do prerender when:
  if (url.parse(options.url, true).query.hasOwnProperty('_escaped_fragment_')) {
    return true;
  }

  if (options.bufferAgent) {
    return true;
  }

  if (isBot) {
    return true;
  }

  return false;
};

module.exports = function (opts) {


  return function *prerender(next) {
    var userAgent = this.get('user-agent');
    var bufferAgent = this.get('x-bufferbot');
    var method = this.method;
    var url = this.url;

    var prerender = shouldPrerender({
      userAgent: userAgent,
      bufferAgent: bufferAgent,
      method: method,
      url: url
    });

    console.log(prerender);

    yield* next;

  };

};
