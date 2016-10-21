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

  receiver (message) {
    let self = this;
    let ctx = new Message(arguments);
    co(function *() {
      console.log(ctx)
      this.response = this.response || 'Not Processed';
      if (ctx.id) {
        if (_.isString(this.response)) {
          this.response = ctx.id + ':' + this.response;
        } else {
          this.response._request_id = ctx.id;
        }
      }
      console.log(this.response)
      self.socket.send(this.response);
    });
  }

  //
  // Listen
  //
  listen () {
    let self = this;
    return comise(function *() {
      self.config = _.defaultsDeep(self.config || {}, DEFAULTS.config);
      self.socket.bindSync('tcp://' + self.config.host + ':' + self.config.port);
      self.on('message', self.receiver);
    });
  }
};

module.exports = Zeromatter;
