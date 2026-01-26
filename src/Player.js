import { Agent } from "./Agent.js";
import { Hitbox } from "./Hitbox.js";
import * as PIXI from "pixi.js";
import framesData from "./assets/frames.json";
import animationsData from "./assets/animations.json";

export class Player extends Agent {
  constructor(x, y, spritesheet, inputHandler, screenWidth, screenHeight, sounds) {
    super(x, y);
    this.spritesheet = spritesheet;
    this.inputHandler = inputHandler;
    this.sounds = sounds;
    this.sprite = null;
    this.container = new PIXI.Container();
    this.speed = 3;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.spriteSize = 64;

    this.hitbox = new Hitbox(16, 16, 32, 32);
    this.hit = false;

    this.direction = "DOWN";
    this.state = "STANDING";
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.lastAnimationUpdate = Date.now();
    this.animationSpeed = 200;

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
          const texture = this.spritesheet.getSprite(x, y, 64, 64);
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
      DOWN: 0,
      RIGHT: 2,
      LEFT: 4,
      UP: 6,
    };

    const offset = this.state === "WALKING" ? 1 : 0;
    return baseIndex[this.direction] + offset;
  }

  updateAnimation() {
    if (!this.animationTextures || this.animationTextures.length === 0) {
      return;
    }

    const animationIndex = this.getAnimationIndex();
    const newAnimation = this.animationTextures[animationIndex];

    if (this.currentAnimation !== newAnimation) {
      this.currentAnimation = newAnimation;
      this.currentFrameIndex = 0;
      this.lastAnimationUpdate = Date.now();

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

  update() {
    if (this.inputHandler) {
      const movement = this.inputHandler.getMovementVector();

      if (movement.x > 0) {
        this.direction = "RIGHT";
      } else if (movement.x < 0) {
        this.direction = "LEFT";
      } else if (movement.y > 0) {
        this.direction = "DOWN";
      } else if (movement.y < 0) {
        this.direction = "UP";
      }

      const isMoving = movement.x !== 0 || movement.y !== 0;
      this.state = isMoving ? "WALKING" : "STANDING";

      this.updateAnimation();

      if (this.currentAnimation && this.currentAnimation.length > 0) {
        const currentTime = Date.now();
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
          this.sounds.enqueue("hit");
        }
      }
    } else {
      this.hit = false;
    }
  }

  destroy() {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
  }
}
