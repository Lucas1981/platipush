import * as PIXI from 'pixi.js';

/**
 * Spritesheet manager for handling sprite textures
 */
export class Spritesheet {
    constructor() {
        this.texture = null;
        this.loaded = false;
    }

    /**
     * Load the spritesheet texture
     * @param {string} path - Path to the spritesheet image
     */
    async load(path) {
        try {
            this.texture = await PIXI.Assets.load(path);
            this.loaded = true;
            console.log('Spritesheet loaded successfully');
        } catch (error) {
            console.warn('Could not load spritesheet, using fallback');
            this.loaded = false;
        }
    }

    /**
     * Get a sprite from the spritesheet
     * @param {number} x - X position on the spritesheet
     * @param {number} y - Y position on the spritesheet
     * @param {number} width - Width of the sprite
     * @param {number} height - Height of the sprite
     * @returns {PIXI.Texture} The sprite texture
     */
    getSprite(x, y, width, height) {
        if (!this.loaded || !this.texture) {
            return null;
        }

        // Create a texture from the specific region of the spritesheet
        const frame = new PIXI.Rectangle(x, y, width, height);
        return new PIXI.Texture({
            source: this.texture.source,
            frame: frame
        });
    }

    /**
     * Create a fallback green circle texture
     * @param {number} radius - Radius of the circle
     * @returns {PIXI.Graphics} A green circle graphic
     */
    createFallbackCircle(radius = 16) {
        const graphics = new PIXI.Graphics();
        graphics.circle(0, 0, radius);
        graphics.fill(0x00FF00); // Green color
        return graphics;
    }
}