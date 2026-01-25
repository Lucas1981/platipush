export class Clock {
  constructor() {
    this._startTime = Date.now();
  }

  start() {
    this._startTime = Date.now();
  }

  reset() {
    this._startTime = Date.now();
  }

  getElapsed() {
    return Date.now() - this._startTime;
  }

  getCurrentTime() {
    return Date.now();
  }
}
