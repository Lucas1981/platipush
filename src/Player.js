import { Agent } from "./Agent.js";
import { Hitbox } from "./Hitbox.js";
import * as PIXI from "pixi.js";

const PLAYER_SPEED = 3;
const PLAYER_SPRITE_SIZE = 64;
const PLAYER_HITBOX_X = 16;
const PLAYER_HITBOX_Y = 16;
const PLAYER_HITBOX_WIDTH = 32;
const PLAYER_HITBOX_HEIGHT = 32;

const DIRECTION_DOWN = "DOWN";
const DIRECTION_UP = "UP";
const DIRECTION_LEFT = "LEFT";
const DIRECTION_RIGHT = "RIGHT";

const PLAYER_STATE_STANDING = "STANDING";
const PLAYER_STATE_WALKING = "WALKING";

const SOUND_NAME_HIT = "hit";
const PLAYER_ANIMATION_KEY = "player";

export class Player extends Agent {
  constructor(
    x,
    y,
    inputHandler,
    screenWidth,
    screenHeight,
    sounds,
    animations,
  ) {
    super(x, y);
    this.inputHandler = inputHandler;
    this.sounds = sounds;
    this.animations = animations;
    this.sprite = null;
    this.container = new PIXI.Container();
    this.speed = PLAYER_SPEED;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.spriteSize = PLAYER_SPRITE_SIZE;

    this.hitbox = new Hitbox(
      PLAYER_HITBOX_X,
      PLAYER_HITBOX_Y,
      PLAYER_HITBOX_WIDTH,
      PLAYER_HITBOX_HEIGHT,
    );
    this.hit = false;

    this.direction = DIRECTION_DOWN;
    this.state = PLAYER_STATE_STANDING;
    this.createSprite();
  }

  createSprite() {
    this.sprite = new PIXI.Sprite();
    this.updateSpritePosition();
    this.container.addChild(this.sprite);
  }

  updateSpritePosition() {
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }
  }

  update(currentTime) {
    if (this.inputHandler) {
      const movement = this.inputHandler.getMovementVector();

      if (movement.x > 0) {
        this.direction = DIRECTION_RIGHT;
      } else if (movement.x < 0) {
        this.direction = DIRECTION_LEFT;
      } else if (movement.y > 0) {
        this.direction = DIRECTION_DOWN;
      } else if (movement.y < 0) {
        this.direction = DIRECTION_UP;
      }

      const isMoving = movement.x !== 0 || movement.y !== 0;
      this.state = isMoving ? PLAYER_STATE_WALKING : PLAYER_STATE_STANDING;

      if (this.animations && this.sprite) {
        const texture = this.animations.update({
          currentTime,
          direction: this.direction,
          state: this.state,
          animationKey: PLAYER_ANIMATION_KEY,
        });
        if (texture) {
          this.sprite.texture = texture;
        }
      }

      let newX = this.x + movement.x * this.speed;
      let newY = this.y + movement.y * this.speed;

      newX = Math.max(
        this.spriteSize / 2,
        Math.min(this.screenWidth - this.spriteSize / 2, newX),
      );
      newY = Math.max(
        this.spriteSize / 2,
        Math.min(this.screenHeight - this.spriteSize / 2, newY),
      );

      this.x = Math.round(newX);
      this.y = Math.round(newY);

      this.updateSpritePosition();
    }
  }

  draw(parentContainer) {
    if (!parentContainer.children.includes(this.container)) {
      parentContainer.addChild(this.container);
    }
  }

  handleHit(wasHit) {
    if (wasHit) {
      if (!this.hit) {
        this.hit = true;
        if (this.sounds) {
          this.sounds.enqueue(SOUND_NAME_HIT);
        }
      }
    } else {
      this.hit = false;
    }
  }

  resetState(currentTime) {
    this.direction = DIRECTION_DOWN;
    this.state = PLAYER_STATE_STANDING;
    if (this.animations && this.sprite) {
      const texture = this.animations.update({
        currentTime,
        direction: this.direction,
        state: this.state,
        animationKey: PLAYER_ANIMATION_KEY,
      });
      if (texture) {
        this.sprite.texture = texture;
      }
    }
  }

  destroy() {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
  }
}
