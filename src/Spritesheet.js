import * as PIXI from "pixi.js";

export class Spritesheet {
  constructor() {
    this.texture = null;
    this.loaded = false;
    this.textureCache = new Map();
  }

  async load(path) {
    try {
      this.texture = await PIXI.Assets.load(path);
      this.loaded = true;
      console.log("Spritesheet loaded successfully");
    } catch (error) {
      console.warn("Could not load spritesheet, using fallback");
      this.loaded = false;
    }
  }

  getCacheKey(x, y, width, height) {
    return `${x},${y},${width},${height}`;
  }

  getSprite(x, y, width, height) {
    if (!this.loaded || !this.texture) {
      return null;
    }

    const cacheKey = this.getCacheKey(x, y, width, height);
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const frame = new PIXI.Rectangle(x, y, width, height);
    const texture = new PIXI.Texture({
      source: this.texture.source,
      frame: frame,
    });

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  createFallbackCircle(radius = 16) {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill(0x00ff00); // Green color
    return graphics;
  }
}
