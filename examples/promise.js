'use strict';

const zquest = require('zquest');
const Zeromatter = require('../lib');

//
// Server
//


let app = Zeromatter();

app.use(function (next) {
  return new Promise((resolve, reject) => {
    this.shortId = this.id.split('-')[0];
    console.log(`[${this.shortId}] --> `);
    next().then(() => {
      console.log(`[${this.shortId}] <--`)
      resolve();
    }).catch(reject);
  });
});

app.use(function (next) {
  return new Promise((resolve, reject) => {
    console.log(`[${this.shortId}] ----> `);
    next().then(() => {
      console.log(`[${this.shortId}] <----`)
      resolve();
    }).catch(reject);
  });
});

app.use(function () {
  return new Promise((resolve, reject) => {
    console.log(`[${this.shortId}]   ${this.message}`);
    this.response = {
      text: 'Hello World!',
      echo: this.data
    }
    resolve();
  });
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
