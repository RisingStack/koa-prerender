var prerender = require('./');
var request = require('supertest');
var koa = require('koa');
var assert = require('assert');
var expect = require('chai').expect;

describe('Koa prerender middleware', function() {

  it('exists', function () {
    expect(prerender).to.be.ok;
  });

});
