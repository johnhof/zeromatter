'use strict';

const zquest = require('zquest');
const Zeromatter = require('../lib');

//
// Server
//


let app = Zeromatter();

app.use(function *(next) {
  console.log('  --> 1');
  yield next;
  console.log('  <-- 1');
});

app.use(function *() {
  console.log('  --> 2');
  yield next;
  console.log('  <-- 2');
});

app.use(function *() {
  console.log(this.message);
});

app.listen();

//
// Client
//

zquest({
  data: 'Test'
}).then((res) => {
  console.log('RETURNED: ', res);
  return zquest({ data: 'Test2'});
}).then((res) => {
  console.log('RETURNED: ', res);
  app.close();
}).catch((e) => {
  console.log(e)
  app.close();
});
