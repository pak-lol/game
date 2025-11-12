import { System } from '../System.js';

/**
 * LifetimeSystem - Manages entity lifetimes
 *
 * Processes entities with: Lifetime
 *
 * Auto-destroys entities when lifetime expires.
 */
export class LifetimeSystem extends System {
    constructor() {
        super(['Lifetime'], 50); // Priority 50 (normal)
    }

    /**
     * Initialize system
     */
    init(world) {
        this.world = world;
    }

    /**
     * Process entities with lifetime
     */
    process(entities, delta) {
        // Convert delta to milliseconds if needed
        const deltaMs = delta > 100 ? delta : delta * 16.67;

        for (const entity of entities) {
            const lifetime = entity.getComponent('Lifetime');

            // Update lifetime
            const stillAlive = lifetime.update(deltaMs);

            // Destroy if expired
            if (!stillAlive && lifetime.destroyOnExpire) {
                this.world.destroyEntity(entity);
            }
        }
    }
}
