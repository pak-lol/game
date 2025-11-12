import { Component } from '../Component.js';

/**
 * Sprite Component - Visual representation
 *
 * Holds reference to PIXI sprite and visual properties.
 */
export class Sprite extends Component {
    constructor(texture = null, tint = 0xFFFFFF, alpha = 1.0) {
        super();
        this.texture = texture;       // PIXI.Texture or texture name
        this.sprite = null;           // PIXI.Sprite instance (created by RenderSystem)
        this.tint = tint;             // Color tint
        this.alpha = alpha;           // Transparency
        this.visible = true;
        this.anchor = { x: 0.5, y: 0.5 }; // Sprite anchor point
    }

    /**
     * Set texture
     * @param {*} texture - PIXI.Texture or texture name
     */
    setTexture(texture) {
        this.texture = texture;
        if (this.sprite) {
            this.sprite.texture = texture;
        }
    }

    /**
     * Set visibility
     * @param {boolean} visible
     */
    setVisible(visible) {
        this.visible = visible;
        if (this.sprite) {
            this.sprite.visible = visible;
        }
    }

    /**
     * Reset to default values
     */
    reset() {
        this.texture = null;
        this.sprite = null;
        this.tint = 0xFFFFFF;
        this.alpha = 1.0;
        this.visible = true;
        this.anchor = { x: 0.5, y: 0.5 };
    }
}
