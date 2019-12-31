"use strict";
let instance = null;
module.exports = class Logger {

  constructor(options) {
    if (instance && options === undefined) {
      return instance;
    }
    if(!options) {
      options = {};
    }
    if(!options.verbose) {
      options.verbose = false;
    }
    this.isVerbose = options.verbose;
    instance = this;
  }

  // bonus getInstance, does same as new really but could be more readable
  static getInstance(options) {
    if (instance) {
      return instance;
    } else {
      instance = new Logger(options);
      return instance;
    }
  }

  verbose(msg) {
    if (this.isVerbose) {
      console.log(msg);
    }
  }
  log(msg) {
    console.log(msg);
  }
  warn(msg) {
    console.warn(msg);
  }
}