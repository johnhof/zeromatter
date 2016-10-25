'use strict';

const zquest = require('zquest');
const Zeromatter = require('../lib');

//
// Server
//


let app = Zeromatter();

app.use(function *(next) {
  this.shortId = this.id.split('-')[0];
  console.log(`[${this.shortId}] --> `);
  yield next();
  console.log(`[${this.shortId}] <--`);
});

app.use(function *(next) {
console.log(`[${this.shortId}] ----> `);
yield next();
console.log(`[${this.shortId}] <----`);
});

app.use(function *() {
  console.log(`[${this.shortId}]   ${this.message}`);
  this.response = {
    text: 'Hello World!',
    echo: this.data
  }
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
  zquest.close();
  process.exit();
}).catch((e) => {
  console.log(e)
  app.close();
  zquest.close();
  process.exit();
});
