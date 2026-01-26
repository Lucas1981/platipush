export class Clock {
  constructor() {
    this._startTime = Date.now();
  }

  reset() {
    this._startTime = Date.now();
  }

  getElapsed(currentTime) {
    return currentTime - this._startTime;
  }
}
