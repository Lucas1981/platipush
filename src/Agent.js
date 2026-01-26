export class Agent {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isActive = true;
    this.hitbox = null;
  }

  getIsActive() {
    return this.isActive;
  }

  update(currentTime) {
    throw new Error("update() method must be implemented by subclasses");
  }

  draw(parentContainer) {
    throw new Error("draw() method must be implemented by subclasses");
  }

  intersects(other) {
    if (!this.hitbox || !other.hitbox) {
      return false;
    }

    const thisLeft = this.x + this.hitbox.x;
    const thisRight = thisLeft + this.hitbox.width;
    const thisTop = this.y + this.hitbox.y;
    const thisBottom = thisTop + this.hitbox.height;

    const otherLeft = other.x + other.hitbox.x;
    const otherRight = otherLeft + other.hitbox.width;
    const otherTop = other.y + other.hitbox.y;
    const otherBottom = otherTop + other.hitbox.height;

    return (
      thisLeft < otherRight &&
      thisRight > otherLeft &&
      thisTop < otherBottom &&
      thisBottom > otherTop
    );
  }
}
