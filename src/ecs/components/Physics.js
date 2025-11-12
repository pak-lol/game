import { Component } from '../Component.js';

/**
 * Physics Component - Velocity, gravity, friction
 *
 * Entities with this component will move according to physics.
 */
export class Physics extends Component {
    constructor(velocityX = 0, velocityY = 0, gravity = 0, friction = 0) {
        super();
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.gravity = gravity;       // Constant downward acceleration
        this.friction = friction;     // Velocity decay (0 = no friction, 1 = instant stop)
        this.maxVelocity = Infinity;  // Max speed
    }

    /**
     * Set velocity
     * @param {number} vx
     * @param {number} vy
     */
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
    }

    /**
     * Add to velocity
     * @param {number} dvx
     * @param {number} dvy
     */
    addVelocity(dvx, dvy) {
        this.velocityX += dvx;
        this.velocityY += dvy;
    }

    /**
     * Reset to default values
     */
    reset() {
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0;
        this.friction = 0;
        this.maxVelocity = Infinity;
    }
}
