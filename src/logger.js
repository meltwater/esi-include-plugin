module.exports = class Logger {
  static instance;

  constructor(options) {
    if (instance && options === undefined) {
      return instance;
    }
    if(!options || !options.verbose) {
      options.verbose = false;
    }
    this.isVerbose = options.verbose;
    this.instance = this;
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