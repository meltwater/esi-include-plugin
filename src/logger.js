module.exports = class Logger {
  static instance;

  constructor(options) {
    if (instance && options === undefined) {
      return instance;
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