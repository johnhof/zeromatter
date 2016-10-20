'use strict';

const ZEROMATTER = require('../lib');

let service = ZEROMATTER();

service.use(function *(next) {
  console.log('  --> 1');
  yield next;
  console.log('  <-- 1');
});

service.use(function *() {
  console.log('  --> 2');
  yield next;
  console.log('  <-- 2');
});

service.use(function *() {
  console.log(this.message);
});

service.listen();
