'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;
const zquest = require('zquest');
const _ = require('lodash');

const DEFAULTS = require('../lib/zeromatter/defaults.json');

let zeromatter = require('../lib');
let Zeromatter = require('../lib/zeromatter');

describe('server', () => {
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

  it('should listen on a default host/port and respond to all messages', function *() {
    let app = zeromatter();
    yield app.listen();
    console.log('request')
    let res = yield zquest({ data: 'TEST' });
    console.log(res);
  });
});
