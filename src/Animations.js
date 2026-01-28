import framesData from "./assets/frames.json";
import animationsData from "./assets/animations.json";

const PLAYER_SPRITE_SIZE = 64;
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

export class Animations {
  constructor(spritesheet) {
    this.spritesheet = spritesheet;
    this.frames = framesData;
    this.animationsConfig = animationsData;
    this.animationTexturesByKey = {};
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.lastAnimationUpdate = 0;
    this.animationSpeed = PLAYER_ANIMATION_SPEED_MS;
    this._loadAnimationTextures();
  }

  _loadAnimationTextures() {
    this.animationTexturesByKey = {};
    const keys = Object.keys(this.animationsConfig);
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      const animationsForKey = this.animationsConfig[key];
      const texturesForKey = [];
      for (let i = 0; i < animationsForKey.length; i++) {
        const animation = animationsForKey[i];
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
        texturesForKey.push(textures);
      }
      this.animationTexturesByKey[key] = texturesForKey;
    }
  }

  _getAnimationIndex(direction, state) {
    const baseIndex = {
      [DIRECTION_DOWN]: ANIMATION_INDEX_DOWN,
      [DIRECTION_RIGHT]: ANIMATION_INDEX_RIGHT,
      [DIRECTION_LEFT]: ANIMATION_INDEX_LEFT,
      [DIRECTION_UP]: ANIMATION_INDEX_UP,
    };

    const offset =
      state === PLAYER_STATE_WALKING ? ANIMATION_WALKING_OFFSET : 0;
    return baseIndex[direction] + offset;
  }

  update({ currentTime, direction, state, animationKey }) {
    const texturesForKey = this.animationTexturesByKey[animationKey];
    if (!texturesForKey) {
      throw new Error(`Unknown animation key: ${animationKey}`);
    }

    const animationIndex = this._getAnimationIndex(direction, state);
    const newAnimation = texturesForKey[animationIndex];

    if (!newAnimation || newAnimation.length === 0) {
      return null;
    }

    if (this.currentAnimation !== newAnimation) {
      this.currentAnimation = newAnimation;
      this.currentFrameIndex = 0;
      this.lastAnimationUpdate = currentTime;
      return newAnimation[0];
    }

    if (currentTime - this.lastAnimationUpdate >= this.animationSpeed) {
      this.lastAnimationUpdate = currentTime;
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.currentAnimation.length;
      return this.currentAnimation[this.currentFrameIndex];
    }

    return null;
  }
}

