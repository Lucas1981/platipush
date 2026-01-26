import { Agent } from "./Agent.js";
import { Hitbox } from "./Hitbox.js";
import * as PIXI from "pixi.js";
import {
  SAFE_CIRCLE_RADIUS,
  SAFE_CIRCLE_CENTER_Y,
  SPRITE_SIZE,
} from "./constants.js";

const ENEMY_SPEED = 5;
const ENEMY_SPRITE_SIZE = 64;
const ENEMY_HITBOX_X = 16;
const ENEMY_HITBOX_Y = 16;
const ENEMY_HITBOX_WIDTH = 32;
const ENEMY_HITBOX_HEIGHT = 32;
const ENEMY_SPAWN_OFFSET = 64;
const ENEMY_DESPAWN_OFFSET = 64;
const ENEMY_SPRITE_RIGHT_X = 256;
const ENEMY_SPRITE_LEFT_X = 320;
const ENEMY_SPRITE_Y = 64;
const ENEMY_FALLBACK_CIRCLE_RADIUS = 32;
const ENEMY_FALLBACK_CIRCLE_DEFAULT_RADIUS = 16;
const ENEMY_FALLBACK_COLOR = 0xff0000;
const DIRECTION_RIGHT = 1;
const DIRECTION_LEFT = -1;
const DIRECTION_PROBABILITY = 0.5;

export class Enemy extends Agent {
  constructor(spritesheet, screenWidth, screenHeight) {
    const enemyHalfHeight = SPRITE_SIZE / 2;
    const minY = SAFE_CIRCLE_CENTER_Y - SAFE_CIRCLE_RADIUS + enemyHalfHeight;
    const maxY = SAFE_CIRCLE_CENTER_Y + SAFE_CIRCLE_RADIUS - enemyHalfHeight;
    const randomY = minY + Math.random() * (maxY - minY);

    const direction =
      Math.random() < DIRECTION_PROBABILITY ? DIRECTION_RIGHT : DIRECTION_LEFT;

    const initialX =
      direction === DIRECTION_RIGHT
        ? -ENEMY_SPAWN_OFFSET
        : screenWidth + ENEMY_SPAWN_OFFSET;

    super(initialX, randomY);

    this.spritesheet = spritesheet;
    this.sprite = null;
    this.container = new PIXI.Container();
    this.direction = direction;
    this.speed = ENEMY_SPEED;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.hitbox = new Hitbox(
      ENEMY_HITBOX_X,
      ENEMY_HITBOX_Y,
      ENEMY_HITBOX_WIDTH,
      ENEMY_HITBOX_HEIGHT,
    );

    this.createSprite();
  }

  createSprite() {
    const spriteX =
      this.direction === DIRECTION_RIGHT
        ? ENEMY_SPRITE_RIGHT_X
        : ENEMY_SPRITE_LEFT_X;
    const spriteY = ENEMY_SPRITE_Y;

    const texture = this.spritesheet.getSprite(
      spriteX,
      spriteY,
      ENEMY_SPRITE_SIZE,
      ENEMY_SPRITE_SIZE,
    );

    if (texture) {
      this.sprite = new PIXI.Sprite(texture);
    } else {
      this.sprite = this.createFallbackRedCircle(ENEMY_FALLBACK_CIRCLE_RADIUS);
    }

    this.updateSpritePosition();

    this.container.addChild(this.sprite);
  }

  createFallbackRedCircle(radius = ENEMY_FALLBACK_CIRCLE_DEFAULT_RADIUS) {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill(ENEMY_FALLBACK_COLOR);
    return graphics;
  }

  updateSpritePosition() {
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }
  }

  update(currentTime) {
    if (!this.getIsActive()) {
      return;
    }

    this.x += this.direction * this.speed;

    if (
      this.x < -ENEMY_DESPAWN_OFFSET ||
      this.x > this.screenWidth + ENEMY_DESPAWN_OFFSET
    ) {
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
