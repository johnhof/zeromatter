'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;
const zquest = require('zquest');
const _ = require('lodash');

const DEFAULTS = require('../lib/zeromatter/defaults.json');

let zeromatter = require('../lib');
let Zeromatter = require('../lib/zeromatter');

describe('server', () => {
  describe('initialization', () => {
    it('should initialize a server instance', function *() {
      let app = zeromatter();
      expect(app).to.be.instanceof(Zeromatter);
      expect(app.config).to.be.an('object');
      expect(app.middleware).to.be.an('array');
      expect(app.socket).to.not.be.undefined;
      expect(app.socket.identity).to.be.a('string');
    });

    it('should apply configuration when initialized', function *() {
      let override = { host: 'localhost', port: 1991 };
      let app = zeromatter(override);
      expect(app.config.protocol).to.equal(DEFAULTS.config.protocol);
      expect(app.config.username).to.equal(DEFAULTS.config.username);
      expect(app.config.password).to.equal(DEFAULTS.config.password);
      expect(app.config.host).to.equal(override.host);
      expect(app.config.port).to.equal(override.port);
    });

    it('should listen on a default host/port and respond to all string messages', function *() {
      let app = zeromatter();
      app.listen();
      let res = yield zquest({ data: 'TEST' });
      expect(res).to.be.a('string');
      app.close();
    });

    it('should listen on a default host/port and respond to all json messages', function *() {
      let app = zeromatter();
      app.listen();
      let res = yield zquest({ data: { text: 'TEST' } });
      expect(res).to.be.a('string');
      app.close();
    });
  });

  describe('middleware', () => {
    describe('.use', () => {
      it('should allow addition of a generator', function *() {
        let expected = 'test';
        let i = 0;
        let o = 0;
        let app = zeromatter();
        app.use(function *(next) { i++; yield next(); o++; });
        app.use(function *() { i++; this.response = expected; o++; });
        app.listen();
        let res = yield zquest({ data: 'TEST' });
        expect(i).to.equal(2);
        expect(o).to.equal(2);
        expect(res).to.equal(expected);
        app.close();
      })

      it('should allow addition of a promise', function *() {
        let expected = 'test';
        let i = 0;
        let o = 0;
        let app = zeromatter();
        app.use(function (next) {
          return new Promise((resolve, reject) => {
            i++; next().then(() => {
              o++; resolve();
            });
          });
        });
        app.use(function () {
          return new Promise((resolve, reject) => {
            i++; this.response = expected; o++; resolve();
          });
        });
        app.listen();
        let res = yield zquest({ data: 'TEST' });
        expect(i).to.equal(2);
        expect(o).to.equal(2);
        expect(res).to.equal(expected);
        app.close();
      });
    });

    describe('.useAll', () => {
      it('should allow addition of a generator', function *() {
        let expected = 'test';
        let i = 0;
        let o = 0;
        let app = zeromatter();
        app.useAll([
          function *(next) { i++; yield next(); o++; },
          function *() { i++; this.response = expected; o++; }
        ]);
        app.listen();
        let res = yield zquest({ data: 'TEST' });
        expect(i).to.equal(2);
        expect(o).to.equal(2);
        expect(res).to.equal(expected);
        app.close();
      })

      it('should allow addition of a promise', function *() {
        let expected = 'test';
        let i = 0;
        let o = 0;
        let app = zeromatter();
        app.useAll([
          function (next) {
            return new Promise((resolve, reject) => {
              i++; next().then(() => {
                o++; resolve();
              });
            });
          },
          function () {
            return new Promise((resolve, reject) => {
              i++; this.response = expected; o++; resolve();
            });
          }
        ]);
        app.listen();
        let res = yield zquest({ data: 'TEST' });
        expect(i).to.equal(2);
        expect(o).to.equal(2);
        expect(res).to.equal(expected);
        app.close();
      })
    });
  });

  describe('error handling', () => {
    it('should bubble errors up the stack (generator)', (done) => {
      let app = zeromatter();
      let noop = function *(next) { yield next(); };
      let fin = (e) => {
        app.close();
        zquest.close();
        done(e);
      }
      app.use(function *(next) {
        let error = false;
        try { yield next() } catch(e) {
          error = e;
        }
        expect(error).to.not.be.false;
      });
      app.use(noop);
      app.use(noop);
      app.use(noop);
      app.use(function *() { throw Error('ERROR'); });
      app.listen();
      zquest({
        data: 'test'
      }).then((rep) => fin()).catch(fin);
    });

    it('should bubble errors up the stack (promise)', (done) => {
      let error = false;
      let fin = (e, r) => {
        app.close();
        zquest.close();
        expect(error).to.not.be.false;
        expect(r).to.equal('CAUGHT');
        done(e);
      }
      let app = zeromatter();
      let noop = function (next) {
        return new Promise((resolve, reject) => { next().then(resolve).catch(reject); });
      };
      app.use(function (next) {
        return new Promise((resolve, reject) => {
          next().then(resolve).catch((e) => {
            error = e;
            this.response = 'CAUGHT';
            resolve();
          });
        });
      });
      app.use(noop);
      app.use(noop);
      app.use(noop);
      app.use(function () { return new Promise((resolve, reject) => reject(Error('ERROR'))); });
      app.listen();
      zquest({
        data: 'test'
      }).then((rep) => fin(null, rep)).catch(fin);
    });

    it('should have a default error handler (generator)', (done) => {
      let app = zeromatter();
      let fin = (e, r) => {
        app.close();
        zquest.close();
        expect(r).to.equal('Internal server error');
        done(e);
      }
      app.use(function *() { throw Error('ERROR'); });
      app.listen();
      zquest({
        data: 'test'
      }).then((rep) => fin(null, rep)).catch(fin);
    });

    it('should have a default error handler (promise)', (done) => {
      let app = zeromatter();
      let fin = (e, r) => {
        app.close();
        zquest.close();
        expect(r).to.equal('Internal server error');
        done(e);
      }
      app.use(function () { return new Promise((resolve, reject) => reject(Error('ERROR'))); });
      app.listen();
      zquest({
        data: 'test'
      }).then((rep) => fin(null, rep)).catch(fin);
    });

    it('should have a default unhandled message', (done) => {
      let app = zeromatter();
      let fin = (e, r) => {
        app.close();
        zquest.close();
        expect(r).to.equal('Not processed');
        done(e);
      }
      app.listen();
      zquest({
        data: 'test'
      }).then((rep) => fin(null, rep)).catch(fin);
    });
  });

  describe('scale', () => {
    it('should handle concurrent requests', function (done) {
      this.timeout(5000);
      let count = 100;
      let errors = 0;
      let app = zeromatter();
      app.use(function () {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.response = this.data;
            resolve();
          }, 1000);
        });
      });
      let fin = (e) => {
        app.close();
        done(e)
      }
      app.listen();
      for (let i = 0; i < count; i++) {
        zquest({ data: i }).then((res) => {
          expect(res).to.equal(`${i}`);
          if (i+1 === count) fin();
        }).catch(fin);
      }
    });
  });
});
