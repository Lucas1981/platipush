export class InputHandler {
  constructor() {
    this.keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      Enter: false,
    };
    this.handleKeyDown = (event) => {
      if (event.code in this.keys) {
        event.preventDefault();
        this.keys[event.code] = true;
      }
    };
    this.handleKeyUp = (event) => {
      if (event.code in this.keys) {
        event.preventDefault();
        this.keys[event.code] = false;
      }
    };
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  isKeyPressed(keyCode) {
    return this.keys[keyCode] || false;
  }

  getMovementVector() {
    let x = 0;
    let y = 0;

    if (this.isKeyPressed("ArrowLeft")) x -= 1;
    if (this.isKeyPressed("ArrowRight")) x += 1;
    if (this.isKeyPressed("ArrowUp")) y -= 1;
    if (this.isKeyPressed("ArrowDown")) y += 1;

    return { x, y };
  }

  clearKey(keyCode) {
    if (keyCode in this.keys) {
      this.keys[keyCode] = false;
    }
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}