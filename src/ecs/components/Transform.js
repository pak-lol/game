import { Component } from '../Component.js';

/**
 * Transform Component - Position, rotation, scale
 *
 * Every visual entity should have this component.
 */
export class Transform extends Component {
    constructor(x = 0, y = 0, rotation = 0, scale = 1) {
        super();
        this.x = x;
        this.y = y;
        this.rotation = rotation; // In radians
        this.scale = scale;
    }

    /**
     * Set position
     * @param {number} x
     * @param {number} y
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Translate (move relative)
     * @param {number} dx - Delta X
     * @param {number} dy - Delta Y
     */
    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Reset to default values
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scale = 1;
    }
}
