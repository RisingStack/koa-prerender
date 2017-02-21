var prerender = require('./')
var request = require('supertest')
var koa = require('koa')
var expect = require('chai').expect

describe('Koa prerender middleware', function() {
  this.timeout(5000)

  it('exists', function () {
    expect(prerender).to.be.ok
  })

  describe('prerenders when', function() {
    it('url contains _escaped_fragment_', function (done) {
      var app = koa()
      app.use(prerender())

      var server = app.listen()
      request(server)
        .get('/?_escaped_fragment_')
        .expect('X-Prerender', 'true')
        .expect(200, function () {
          server.close()
          done()
        })
    })

    it('user-agent looks like a bot', function (done) {
      var app = koa()
      app.use(prerender())

      var server = app.listen()
      request(server)
        .get('/')
        .set('user-agent', 'slackbot')
        .expect('X-Prerender', 'true')
        .expect(200, function () {
          request(server)
            .get('/')
            .set('user-agent', 'YandexBot')
            .expect('X-Prerender', 'true')
            .expect(200, function () {
              server.close()
              done()
            })
        })
    })

    it('x-bufferbot is set in options', function (done) {
      var app = koa()
      app.use(prerender())

      var server = app.listen()
      request(server)
        .get('/')
        .set('x-bufferbot', 'whatever')
        .expect('X-Prerender', 'true')
        .expect(200, function () {
          server.close()
          done()
        })
    })
  })
})
