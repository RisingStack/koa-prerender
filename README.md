koa-prerender
=====

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
var prerenderOptions = {
  prerender: PRERENDER_SERVER_URL
};
app.use(require('koa-prerender')(prerenderOptions));
 ```
 