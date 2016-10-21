'use strict';

let parse = require('../helpers/parse');

class Message {
  constructor (rawArgs) {
    let args = Array.apply(null, rawArgs);
    let last = args.length-1;
    let message = args[last].toString();
    let parsed = parse.message(message);
    this.message = parsed.data || message;
    this.data = this.message;
    this.body = this.message;
    this.id = parsed._request_id || null;
    this.raw = args[last];
    this._message = {
      original: rawArgs,
      array: args,
      envelope: args.slice(0, last),
      payload: {
        raw: this.raw,
        parsed: message,
        processed: parsed
      }
    };
  }
}

module.exports = Message;
