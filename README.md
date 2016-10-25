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
