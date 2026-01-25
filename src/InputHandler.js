/**
 * InputHandler class to manage keyboard input states
 */
export class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        
        this.setupEventListeners();
    }

    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        // Handle keydown events
        window.addEventListener('keydown', (event) => {
            if (event.code in this.keys) {
                event.preventDefault(); // Prevent default browser behavior (scrolling)
                this.keys[event.code] = true;
            }
        });

        // Handle keyup events
        window.addEventListener('keyup', (event) => {
            if (event.code in this.keys) {
                event.preventDefault();
                this.keys[event.code] = false;
            }
        });
    }

    /**
     * Check if a key is currently pressed
     * @param {string} keyCode - The key code to check
     * @returns {boolean} True if the key is pressed
     */
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    /**
     * Get movement vector based on arrow key states
     * @returns {Object} Object with x and y movement values (-1, 0, or 1)
     */
    getMovementVector() {
        let x = 0;
        let y = 0;

        if (this.isKeyPressed('ArrowLeft')) x -= 1;
        if (this.isKeyPressed('ArrowRight')) x += 1;
        if (this.isKeyPressed('ArrowUp')) y -= 1;
        if (this.isKeyPressed('ArrowDown')) y += 1;

        return { x, y };
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}