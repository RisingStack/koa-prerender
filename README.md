# koa-prerender [![Build Status](https://travis-ci.org/RisingStack/koa-prerender.svg)](https://travis-ci.org/RisingStack/koa-prerender)

[![NPM](https://nodei.co/npm/koa-prerender.png)](https://nodei.co/npm/koa-prerender/)

**KOA middleware for prerendering javascript-rendered pages on the fly for SEO**

This [koa](https://koajs.com) middleware intercepts requests to your Node.js website from crawlers, and then makes a call to the (external)
[Prerender](https://prerender.io/) service to get the static HTML instead of the javascript for that page.

## Setup

### Prerequisites

Install [Prerender](https://github.com/prerender/prerender) on a server of your choice.

### Install

Install the [package](https://npmjs.org/package/koa-prerender) with [npm](https://npmjs.org):

```sh
$ npm install koa-prerender`
```

### Usage

```js
var prerender = require('koa-prerender');

// Options
var options = {
  prerender: PRERENDER_SERVER_URL   // optional, default:'http://service.prerender.io/'
  protocol: 'http',                 // optional, default: this.protocol
  host: 'www.risingstack.com'       // optional, default: this.host,
  prerenderToken: ''                // optional or process.env.PRERENDER_TOKEN
  beforePrerender: function *() {   // optional before hook
    this.body = 'foo';
  },
  afterPrerender: function *() {    // optional after hook
    this.body = 'bar';
  }
};

// Use as middleware
app.use(prerender(options));

```
> When prerendering happens the request will not yield further down the stack but return the rendered page instead.


#### Hooks

If `beforePrerender` or `afterPrerender` is set in the options, they will be called
before and after the prerendering is supposed to happen. If `beforePrerender` sets a
body, it will be used and the actual prerender server will **not be called** for that
request.

This makes it possible to reliably tell when a request was or is going to be prerendered and therefore the perfect place
to handle caching if needed.


## License

ISC
