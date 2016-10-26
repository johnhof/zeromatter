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

app.use(function *(next) {
  this.shortId = this.id.split('-')[0];
  console.log(`[${this.shortId}] --> `);
  yield next();
  console.log(`[${this.shortId}] <--`);
});

app.use(function *() {
  console.log(`[${this.shortId}]   ${this.message}`);
  this.response = {
    text: 'Hello World!',
    echo: this.data
  }
});

app.listen();
```

#### Promise

```javascript
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
```

## Key

- [Examples](#example)
  - [Generator](#generator)
  - [Promise](#promise)
- [Documentation](#)
  - [Defaults](#defaults)
  - [`zeromatter(opts)`](#zeromatteropts)
  - [`app.use(func)`](#appfunc)
  - [`app.useAll(func)`](#appfunc)
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
  - Promise || Generator
    - Accept promise `next` representing the next step in the middleware
    - Errors or rejecting a promise will bubble up the middleware
    - The value of `this.response` when the final promise is resolved will be the value returned to the client
    - The context of `this` is an instance of [Message](https://github.com/johnhof/zeromatter/blob/master/lib/zeromatter/message.js)

```javascript
app.use(function *(next) {
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

app.use(function (next) {
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

    yield next().then(() => {
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
  function *(next) { yield next(); },
  function *(next) { yield next(); },
  function (next) {
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
