import * as PIXI from "pixi.js";

export class Spritesheet {
  constructor() {
    this.texture = null;
    this.loaded = false;
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

  getSprite(x, y, width, height) {
    if (!this.loaded || !this.texture) {
      return null;
    }

    // Create a texture from the specific region of the spritesheet
    const frame = new PIXI.Rectangle(x, y, width, height);
    return new PIXI.Texture({
      source: this.texture.source,
      frame: frame,
    });
  }

  createFallbackCircle(radius = 16) {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill(0x00ff00); // Green color
    return graphics;
  }
}
