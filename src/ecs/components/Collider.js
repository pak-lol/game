import { Component } from '../Component.js';

/**
 * Collider Component - Collision bounds
 *
 * Defines collision area for an entity.
 */
export class Collider extends Component {
    constructor(width = 32, height = 32, offsetX = 0, offsetY = 0) {
        super();
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;    // Offset from Transform position
        this.offsetY = offsetY;
        this.isTrigger = false;    // If true, doesn't block movement
        this.enabled = true;
    }

    /**
     * Get collision bounds (AABB)
     * @param {Transform} transform - Entity's transform
     * @returns {Object} { left, right, top, bottom }
     */
    getBounds(transform) {
        const centerX = transform.x + this.offsetX;
        const centerY = transform.y + this.offsetY;

        return {
            left: centerX - this.width / 2,
            right: centerX + this.width / 2,
            top: centerY - this.height / 2,
            bottom: centerY + this.height / 2,
            centerX,
            centerY
        };
    }

    /**
     * Check collision with another collider
     * @param {Transform} thisTransform
     * @param {Collider} otherCollider
     * @param {Transform} otherTransform
     * @returns {boolean}
     */
    intersects(thisTransform, otherCollider, otherTransform) {
        if (!this.enabled || !otherCollider.enabled) return false;

        const a = this.getBounds(thisTransform);
        const b = otherCollider.getBounds(otherTransform);

        return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }

    /**
     * Reset to default values
     */
    reset() {
        this.width = 32;
        this.height = 32;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isTrigger = false;
        this.enabled = true;
    }
}
