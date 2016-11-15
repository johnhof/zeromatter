'use strict';

const zquest = require('zquest');
const Zeromatter = require('../lib');

//
// Server
//


let app = Zeromatter();

app.use(function *(ctx, next) {
  ctx.shortId = ctx.id.split('-')[0];
  console.log(`[${ctx.shortId}] --> `);
  yield next();
  console.log(`[${ctx.shortId}] <--`);
});

app.use(function *(ctx, next) {
console.log(`[${ctx.shortId}] ----> `);
yield next();
console.log(`[${ctx.shortId}] <----`);
});

app.use(function *(ctx) {
  console.log(`[${ctx.shortId}]   ${ctx.message}`);
  ctx.response = {
    text: 'Hello World!',
    echo: ctx.data
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
