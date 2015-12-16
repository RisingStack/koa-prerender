var prerender = require('./');
var request = require('supertest');
var koa = require('koa');
var expect = require('chai').expect;

describe('Koa prerender middleware', function() {
  this.timeout(5000);

  it('exists', function () {
    expect(prerender).to.be.ok;
  });

  describe('prerenders when', function() {

    it('url contains _escaped_fragment_', function (done) {
      var app = koa();

      app.use(prerender());

      request(app.listen())
        .get('/?_escaped_fragment_')
        .expect('X-Prerender', 'true')
        .expect(200, done);
    });

    it('user-agent looks like a bot', function (done) {
      var app = koa();

      app.use(prerender());

      request(app.listen())
        .get('/')
        .set('user-agent', 'twitterbot')
        .expect('X-Prerender', 'true')
        .expect(200, done);
    });

    it('x-bufferbot is set in options', function (done) {
      var app = koa();

      app.use(prerender());

      request(app.listen())
        .get('/')
        .set('x-bufferbot', 'whatever')
        .expect('X-Prerender', 'true')
        .expect(200, done);

    });

  });

  describe('when prerenders', function() {
    describe('calls hooks', function () {
      it('when beforePrerender is defined', function (done) {
        var app = koa();
        app.use(prerender({
          'beforePrerender': function *() {
            this.body = 'foo'
          }
        }));

        request(app.listen())
          .get('/?_escaped_fragment_')
          .expect('X-Prerender', 'true')
          .expect(200, 'foo', done)
      });

      it('when afterPrerender is defined', function (done) {
        var app = koa();
        app.use(prerender({
          'afterPrerender': function *() {
            this.body = 'foo'
          }
        }));

        request(app.listen())
          .get('/?_escaped_fragment_')
          .expect('X-Prerender', 'true')
          .expect(200, 'foo', done)
      })
    });

    it('does not yield', function (done) {
      var app = koa();
      app.use(prerender());
      app.use(function *() {
        throw new Error('It yielded.');
      });
      request(app.listen())
        .get('/?_escaped_fragment_')
        .expect(200, done)
    });
  });
  describe('when does not prerender', function() {
    it('does not call hooks', function(done) {
      var app = koa();
      app.use(prerender({
        'beforePrerender': function *() {
          this.body = 'foo'
        },
        'afterPrerender': function *() {
          this.body = 'bar'
        }
      }));

      request(app.listen())
        .get('/')
        .expect('X-Prerender', 'false')
        .expect(404, done)
    });

    it('yields', function(done) {
      var app = koa();
      app.use(prerender());
      app.use(function *() {
        this.body = 'foo'
      });
      request(app.listen())
        .get('/')
        .expect('X-Prerender', 'false')
        .expect(200, 'foo', done)
    })
  });

});
