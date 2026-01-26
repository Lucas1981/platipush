import { Agent } from "./Agent.js";
import { Hitbox } from "./Hitbox.js";
import * as PIXI from "pixi.js";
import framesData from "./assets/frames.json";
import animationsData from "./assets/animations.json";

const PLAYER_SPEED = 3;
const PLAYER_SPRITE_SIZE = 64;
const PLAYER_HITBOX_X = 16;
const PLAYER_HITBOX_Y = 16;
const PLAYER_HITBOX_WIDTH = 32;
const PLAYER_HITBOX_HEIGHT = 32;
const PLAYER_ANIMATION_SPEED_MS = 200;

const DIRECTION_DOWN = "DOWN";
const DIRECTION_UP = "UP";
const DIRECTION_LEFT = "LEFT";
const DIRECTION_RIGHT = "RIGHT";

const PLAYER_STATE_STANDING = "STANDING";
const PLAYER_STATE_WALKING = "WALKING";

const ANIMATION_INDEX_DOWN = 0;
const ANIMATION_INDEX_RIGHT = 2;
const ANIMATION_INDEX_LEFT = 4;
const ANIMATION_INDEX_UP = 6;
const ANIMATION_WALKING_OFFSET = 1;

const SOUND_NAME_HIT = "hit";

export class Player extends Agent {
  constructor(
    x,
    y,
    spritesheet,
    inputHandler,
    screenWidth,
    screenHeight,
    sounds,
  ) {
    super(x, y);
    this.spritesheet = spritesheet;
    this.inputHandler = inputHandler;
    this.sounds = sounds;
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
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.lastAnimationUpdate = 0;
    this.animationSpeed = PLAYER_ANIMATION_SPEED_MS;

    this.frames = null;
    this.animations = null;
    this.animationTextures = [];

    this.createSprite();
  }

  loadAnimationData() {
    try {
      this.frames = framesData;
      this.animations = animationsData;

      this.animationTextures = [];
      for (let i = 0; i < this.animations.length; i++) {
        const animation = this.animations[i];
        const textures = [];
        for (let j = 0; j < animation.length; j++) {
          const frameIndex = animation[j];
          const [x, y] = this.frames[frameIndex];
          const texture = this.spritesheet.getSprite(
            x,
            y,
            PLAYER_SPRITE_SIZE,
            PLAYER_SPRITE_SIZE,
          );
          if (texture) {
            textures.push(texture);
          }
        }
        this.animationTextures.push(textures);
      }

      this.updateAnimation();
    } catch (error) {
      console.warn("Could not load animation data:", error);
    }
  }

  getAnimationIndex() {
    const baseIndex = {
      [DIRECTION_DOWN]: ANIMATION_INDEX_DOWN,
      [DIRECTION_RIGHT]: ANIMATION_INDEX_RIGHT,
      [DIRECTION_LEFT]: ANIMATION_INDEX_LEFT,
      [DIRECTION_UP]: ANIMATION_INDEX_UP,
    };

    const offset =
      this.state === PLAYER_STATE_WALKING ? ANIMATION_WALKING_OFFSET : 0;
    return baseIndex[this.direction] + offset;
  }

  updateAnimation(currentTime) {
    if (!this.animationTextures || this.animationTextures.length === 0) {
      return;
    }

    const animationIndex = this.getAnimationIndex();
    const newAnimation = this.animationTextures[animationIndex];

    if (this.currentAnimation !== newAnimation) {
      this.currentAnimation = newAnimation;
      this.currentFrameIndex = 0;
      if (currentTime !== undefined) {
        this.lastAnimationUpdate = currentTime;
      } else if (this.lastAnimationUpdate === 0) {
        this.lastAnimationUpdate = Date.now();
      }

      if (this.sprite && newAnimation.length > 0) {
        this.sprite.texture = newAnimation[0];
      }
    }
  }

  createSprite() {
    this.sprite = new PIXI.Sprite();
    this.updateSpritePosition();
    this.container.addChild(this.sprite);

    this.loadAnimationData();
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

      this.updateAnimation(currentTime);

      if (this.currentAnimation && this.currentAnimation.length > 0) {
        if (currentTime - this.lastAnimationUpdate >= this.animationSpeed) {
          this.lastAnimationUpdate = currentTime;
          this.currentFrameIndex =
            (this.currentFrameIndex + 1) % this.currentAnimation.length;
          if (this.sprite) {
            this.sprite.texture = this.currentAnimation[this.currentFrameIndex];
          }
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
    this.updateAnimation(currentTime);
  }

  destroy() {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
  }
}
