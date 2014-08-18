koa-prerender [![Build Status](https://travis-ci.org/RisingStack/koa-prerender.svg)](https://travis-ci.org/RisingStack/koa-prerender)
=====

[![NPM](https://nodei.co/npm/koa-prerender.png)](https://nodei.co/npm/koa-prerender/)

**KOA middleware for prerendering javascript-rendered pages on the fly for SEO**

This middleware intercepts requests to your Node.js website from crawlers, and then makes a call to the (external)
[Prerender](https://prerender.io/) Service to get the static HTML instead of the javascript for that page.

Setup
-----

### Prerequisite:

Install the [Prerender server](https://github.com/prerender/prerender) on a server of your choice

### Install koa-prerender

1. `npm install koa-prerender --save`
2. Use it as a middleware

```
// Options
var prerenderOptions = {
  prerender: PRERENDER_SERVER_URL   // optional, default:'http://service.prerender.io/'
  protocol: 'http',                 // optional, default: this.protocol
  host: 'www.risingstack.com'       // optional, default: this.host,
  prerenderToken: ''                // optional or process.env.PRERENDER_TOKEN
};

// Use as middleware
app.use(require('koa-prerender')(prerenderOptions));
```
