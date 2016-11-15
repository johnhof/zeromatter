'use strict';

const zquest = require('zquest');
const Zeromatter = require('../lib');

//
// Server
//


let app = Zeromatter();

app.use((ctx, next) => {
  ctx.shortId = ctx.id.split('-')[0];
  console.log(`[${ctx.shortId}] --> `);
  return next().then(() => console.log(`[${ctx.shortId}] <--`));
});

app.use((ctx, next) => {
  console.log(`[${ctx.shortId}] ----> `);
  return next().then(() => console.log(`[${ctx.shortId}] <----`));
});

app.use((ctx, next) => new Promise((resolve, reject) => {
  console.log(`[${ctx.shortId}]   ${ctx.message}`);
  ctx.response = {
    text: 'Hello World!',
    echo: ctx.data
  }
  resolve();
}));

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
