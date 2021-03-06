'use strict';

let comise = require('comise');

// !!
// deprecated
// !!
module.exports = (ctx, middleware, controller) => {
  // set bundle core to be the controller
  let bundle = () => {
    // wrap in comise for generator support
    return comise(function *() {  if (controller) yield controller.call(ctx); });
  };
  // iteratively wrap the bundle
  for (let i = middleware.length-1; i >=0; i--) {
    let oldBundle = bundle;
    let newBundle = function () {
       // wrap in comise for generator support
      return comise(function *() { yield middleware[i].call(ctx, oldBundle); });
    };
    bundle = newBundle;
  }
  return bundle;
}

module.exports.wrap = (middleware) => {
  let bundle = () => new Promise((r) => r()); // noop
  for (let m of middleware.reverse()) {
    let oldB = bundle;
    let newB = function promiseWrap (ctx) {
      ctx = ctx || this;
      return comise(function *() { yield m.call(ctx, ctx, oldB.bind(ctx)); });
    }
    bundle = newB;
  }

  return bundle;
}
