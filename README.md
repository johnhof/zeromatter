# Zeromatter

[![Build Status](https://travis-ci.org/johnhof/zeromatter.svg?branch=master)](https://travis-ci.org/johnhof/zeromatter)

Framework for [ØMQ](http://zeromq.org/) request-response modeled servers.

Best used in tandem with the [zquest](https://www.npmjs.com/package/zquest) client.

## Usage

Zeromatter is influenced heavily by the [koa](http://koajs.com/) framework, and is used best in tandem with the [zquest](https://www.npmjs.com/package/zquest) client. It is designed to be a drop-in replacement for existing http frameworks utilizing [ØMQ](http://zeromq.org/) as the means of communication. The framework is designed to use request-router communication, but supports intermediary routers for load balancing purposes.

## Examples

#### Generator

```javascript
let zeromatter = require('zeromatter');
let app = zeromatter();

app.use(function *(ctx, next) {
  ctx.shortId = ctx.id.split('-')[0];
  console.log(`[${ctx.shortId}] --> `);
  yield next();
  console.log(`[${ctx.shortId}] <--`);
});

app.use(function *(ctx) {
  console.log(`[${ctx.shortId}]   ${ctx.message}`);
  ctx.response = {
    text: 'Hello World!',
    echo: ctx.data
  }
});

app.listen();
```

#### Promise

```javascript
let app = Zeromatter();

app.use((ctx, next) => {
  ctx.shortId = ctx.id.split('-')[0];
  console.log(`[${ctx.shortId}] --> `);
  return next().then(() => {
    console.log(`[${ctx.shortId}] <--`);
  });
});

app.use(function () {
  return new Promise((resolve, reject) => {
    console.log(`[${ctx.shortId}]   ${ctx.message}`);
    ctx.response = {
      text: 'Hello World!',
      echo: ctx.data
    };
    resolve();
  });
});

app.listen();
```

## Key

- [Examples](#example)
  - [Generator](#generator)
  - [Promise](#promise)
- [Documentation](#)
  - [Defaults](#defaults)
  - [`zeromatter(opts)`](#zeromatteropts)
  - [`app.use(func)`](#appfunc)
  - [`app.useAll(func)`](#appuseallfunc)
  - [`app.listen(opts)`](#appopts)
  - [`app.close()`](#appclose)


## Documentation

### Defaults

defaults used by zeromatter

```javascript
{
  protocol: "amqp", // protocol for comm (SHOULD NOT CHANGE)
  host: "127.0.0.1", // host to bind to
  port: 5555 // port to bind to
}
```

### zeromatter(opts)

- Application builder
- Accepts
  - Object to override [defaults](#defaults)
- Returns
  - instance of zeromatter

```javascript
let app = zeromatter({
  host: 'localhost',
  port: '1991'
});
```

### app.use(func)

- Push middleware function onto the chain of execution
- Accepts
  - Generator || Function returning Promise
    - Accept promise `next` representing the next step in the middleware
    - Errors or rejecting a promise will bubble up the middleware
    - The value of `ctx.response` when the final promise is resolved will be the value returned to the client
    - The context of `ctx` is an instance of [Message](https://github.com/johnhof/zeromatter/blob/master/lib/zeromatter/message.js)

```javascript
app.use(function *(ctx, next) {
  console.log(this);
  // {
  //   message: String || Object // message content, parsed if json. aliases: body, data
  //   data: String || Object // // message content, parsed if json. aliases: message, data
  //   body: String || Object // // message content, parsed if json. aliases: body, message
  //   id: String // request UUID
  //   raw: Buffer // encoded buffer content of the message
  //   res: String || Object // Value to be stringified and sent to the client. alias: response
  //   response: String || Object // Value to be stringified and sent to the client. alias res
  // }

  yield next();
  this.response = this.response || 'Hello World!';
});

// OR

app.use(function (ctx, next) {
  return new Promise((resolve, reject) => {
    console.log(this);
    // {
    //   message: String || Object // message content, parsed if json. aliases: body, data
    //   data: String || Object // message content, parsed if json. aliases: message, data
    //   body: String || Object // message content, parsed if json. aliases: body, message
    //   id: String // request UUID
    //   raw: Buffer // encoded buffer content of the message
    //   res: String || Object // Value to be stringified and sent to the client. alias: response
    //   response: String || Object // Value to be stringified and sent to the client. alias res
    // }

    next().then(() => {
      this.response = this.response || 'Hello World!';
      resolve();
    }).catch(reject);
  });
});
```

### app.useAll(func)

- Push array of middleware function onto the chain of execution
- Accepts
  - Array of functions to be passed to [app.use(func)](appusefunc)

```javascript
app.useAll([
  function *(ctx, next) { yield next(); },
  function *(ctx, next) { yield next(); },
  function (ctx, next) {
    return new Promise((resolve, reject) => {
      this.response = 'Hello World';
      resolve();
    });
  }
])
```

### app.listen(opts)

- Bind the server and listen for messages
- Accepts
  - Object to override [defaults](#defaults)

```javascript
app.listen({
  host: 'localhost',
  port: '1991'
});
```

### app.close()

- Close the bound socket

```javascript
app.close();
```

## Authors

- [John Hofrichter](https://github.com/johnhof)
