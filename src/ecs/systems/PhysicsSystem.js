import { System } from '../System.js';

/**
 * PhysicsSystem - Updates entity positions based on physics
 *
 * Processes entities with: Transform + Physics
 *
 * Features:
 * - Velocity-based movement
 * - Gravity
 * - Friction
 * - Max velocity clamping
 */
export class PhysicsSystem extends System {
    constructor() {
        super(['Transform', 'Physics'], 20); // Priority 20 (after input, before collision)
    }

    /**
     * Process entities with physics
     */
    process(entities, delta) {
        for (const entity of entities) {
            const transform = entity.getComponent('Transform');
            const physics = entity.getComponent('Physics');

            // Apply gravity
            if (physics.gravity !== 0) {
                physics.velocityY += physics.gravity * delta;
            }

            // Apply friction
            if (physics.friction > 0) {
                physics.velocityX *= (1 - physics.friction);
                physics.velocityY *= (1 - physics.friction);
            }

            // Clamp to max velocity
            if (physics.maxVelocity !== Infinity) {
                const speed = Math.sqrt(physics.velocityX ** 2 + physics.velocityY ** 2);
                if (speed > physics.maxVelocity) {
                    const scale = physics.maxVelocity / speed;
                    physics.velocityX *= scale;
                    physics.velocityY *= scale;
                }
            }

            // Update position
            transform.x += physics.velocityX * delta;
            transform.y += physics.velocityY * delta;
        }
    }
}
