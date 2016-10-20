'use strict';

const _ = require('lodash');
const comise = require('comise')
const ZMQ = require('zmq');
const checkpoint = require('../helpers/checkpoint');
const bundle = require('../helpers/bundle');

class Zeromatter {

  //
  // Constructor
  //
  constructor (config) {
    this.config = _.defaultsDeep(this.config || {}, DEFAULT_CONFIG);
    this.middleware = [];
    this.socket = zmq.socket('router');
    this.socket.identity = 'subscriber:' + process.pid;
  }

  //
  // On
  //
  on (eventTag, handler) {
    this.socket.on(eventTag, (fd, ep) => {
      co(function *() {
        yield handler(fd, ep);
      }):
    })).catch((e) => console.log(e));
  }

  // Handle monitor
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
    co(function *() {

    });
  }

  //
  // Listen
  //
  listen () {
    return comise(function *() {
      this.config = _.defaultsDeep(this.config || {}, DEFAULT_CONFIG);
      this.socket.connect('tcp://' + this.config.host + ':' + this.config.port);
      this.on('message', this.receiver);
    });
  }
};

module.exports = Zeromatter;
