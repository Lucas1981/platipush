import { Agent } from "./Agent.js";
import { Hitbox } from "./Hitbox.js";
import * as PIXI from "pixi.js";
import {
  SAFE_CIRCLE_RADIUS,
  SAFE_CIRCLE_CENTER_Y,
  SPRITE_SIZE,
} from "./constants.js";

const SPEED = 5;

export class Enemy extends Agent {
  constructor(spritesheet, screenWidth, screenHeight) {
    const enemyHalfHeight = SPRITE_SIZE / 2;
    const minY = SAFE_CIRCLE_CENTER_Y - SAFE_CIRCLE_RADIUS + enemyHalfHeight;
    const maxY = SAFE_CIRCLE_CENTER_Y + SAFE_CIRCLE_RADIUS - enemyHalfHeight;
    const randomY = minY + Math.random() * (maxY - minY);

    const direction = Math.random() < 0.5 ? 1 : -1;

    const initialX = direction === 1 ? -64 : screenWidth + 64;

    super(initialX, randomY);

    this.spritesheet = spritesheet;
    this.sprite = null;
    this.container = new PIXI.Container();
    this.direction = direction;
    this.speed = SPEED;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.hitbox = new Hitbox(16, 16, 32, 32);

    this.createSprite();
  }

  createSprite() {
    const spriteX = this.direction === 1 ? 256 : 320;
    const spriteY = 64;

    const texture = this.spritesheet.getSprite(spriteX, spriteY, 64, 64);

    if (texture) {
      this.sprite = new PIXI.Sprite(texture);
    } else {
      this.sprite = this.createFallbackRedCircle(32);
    }

    this.updateSpritePosition();

    this.container.addChild(this.sprite);
  }

  createFallbackRedCircle(radius = 16) {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill(0xff0000);
    return graphics;
  }

  updateSpritePosition() {
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }
  }

  update() {
    if (!this.getIsActive()) {
      return;
    }

    this.x += this.direction * this.speed;

    if (this.x < -64 || this.x > this.screenWidth + 64) {
      this.isActive = false;
      this.destroy();
      return;
    }

    this.updateSpritePosition();
  }

  draw(parentContainer) {
    if (!parentContainer.children.includes(this.container)) {
      parentContainer.addChild(this.container);
    }
  }

  destroy() {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
  }

  getDirection() {
    return this.direction;
  }
}
