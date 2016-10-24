'use strict';

const _ = require('lodash');
const comise = require('comise')
const co = require('co');
const ZMQ = require('zmq');
const checkpoint = require('../helpers/checkpoint');
const bundle = require('../helpers/bundle');

const Message = require('./message');
const DEFAULTS = require('./defaults.json');

class Zeromatter {

  //
  // Constructor
  //
  constructor (config) {
    this.config = _.defaultsDeep(config || {}, DEFAULTS.config);
    this.middleware = [];
    this.socket = ZMQ.socket('router');
    this.socket.identity = 'subscriber:' + process.pid;
  }

  //
  // On
  //
  on (eventTag, handler) {
    this.socket.on(eventTag, handler);
  }

  //
  // Use
  //
  use (middleware) {
    checkpoint(_.isFunction(middleware), 'Middleware must be a function');
    this.middleware.push(middleware);
  }

  //
  // Use All
  //
  useAll (middleware) {
    _.each(middleware, (m) => this.use(m));
  }

  //
  // Listen
  //
  listen () {
    let self = this;
    self.config = _.defaultsDeep(self.config || {}, DEFAULTS.config);
    self.socket.bindSync('tcp://' + self.config.host + ':' + self.config.port);
    self.socket.on('message', function () {
      self._receiver.apply(self, arguments)
    });
  }

  //
  // Close
  //
  close () {
    this.socket.close();
  }

  //
  // Receiver
  //
  _receiver (message) {
    let self = this;
    let ctx = new Message(arguments);
    co(function *() {
      ctx._response = { envelope: ctx._message.array }
      ctx._response.envelope.pop();
      yield bundle(ctx, self.middleware)();
      ctx.response = ctx.response || 'Not processed';
      if (ctx.id) {
        if (_.isString(ctx.response)) {
          ctx.response = ctx.id + ':' + ctx.response;
        } else {
          ctx.response._request_id = ctx.id;
        }
      }
      let resStr = _.isString(ctx.response) ? ctx.response : JSON.stringify(ctx.response);
      let res = new Buffer(resStr, 'utf8');
      ctx._response.envelope.push(res);
      self.socket.send(ctx._response.envelope);
    }).catch((e) => {
      console.log(e.stack);
      let envelope = ctx._message.array;
      envelope.pop();
      let prefix = ctx.id ? ctx.id + ':' : '';
      envelope.push(`${prefix}Internal server error`);
      self.socket.send(envelope);
    });
  }
};

module.exports = Zeromatter;
