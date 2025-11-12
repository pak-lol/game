import { Component } from '../Component.js';

/**
 * Lifetime Component - Auto-destroy after time
 *
 * Entity will be destroyed after lifetime expires.
 * Useful for particles, projectiles, temporary effects.
 */
export class Lifetime extends Component {
    constructor(duration = 1000) {
        super();
        this.duration = duration;      // Total lifetime in milliseconds
        this.elapsed = 0;              // Time elapsed
        this.destroyOnExpire = true;   // Auto-destroy when expired
    }

    /**
     * Update lifetime
     * @param {number} delta - Delta time in milliseconds
     * @returns {boolean} True if still alive
     */
    update(delta) {
        this.elapsed += delta;
        return this.elapsed < this.duration;
    }

    /**
     * Check if expired
     * @returns {boolean}
     */
    isExpired() {
        return this.elapsed >= this.duration;
    }

    /**
     * Get remaining time
     * @returns {number} Milliseconds remaining
     */
    getRemainingTime() {
        return Math.max(0, this.duration - this.elapsed);
    }

    /**
     * Get progress (0 to 1)
     * @returns {number}
     */
    getProgress() {
        return Math.min(1, this.elapsed / this.duration);
    }

    /**
     * Reset to default values
     */
    reset() {
        this.duration = 1000;
        this.elapsed = 0;
        this.destroyOnExpire = true;
    }
}
