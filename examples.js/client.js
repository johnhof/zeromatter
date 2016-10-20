'use strict';

const ZMQ = require('zmq');
const _ = require('lodash');
let sock = zmq.socket('req');

const HOST = '127.0.0.1';
const PORT = '3000';
const MESSAGE = 'test';
// const MESSAGE = {
//   test: 'foo'
// };

sock.bindSync(`tcp://${HOST}:${PORT}`);
sock.identity = 'client' + proccess.id;

let msg = _.isString(MESSAGE) ? MESSAGE : JSON.stringify(MESSAGE);
sock.send(msg);
console.log('SENT: ', msg);
