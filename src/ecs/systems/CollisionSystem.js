import { System } from '../System.js';
import { SpatialHash } from '../../utils/SpatialHash.js';
import { eventBus } from '../../core/EventBus.js';
import { GameEvents } from '../../core/GameEvents.js';

/**
 * CollisionSystem - Detects collisions between entities
 *
 * Processes entities with: Transform + Collider
 *
 * Features:
 * - Spatial hash optimization (3-5x faster than brute force)
 * - AABB collision detection
 * - Collision events via EventBus
 * - Tag-based filtering (e.g., only check 'player' vs 'items')
 */
export class CollisionSystem extends System {
    constructor(worldWidth = 800, worldHeight = 600, cellSize = 100) {
        super(['Transform', 'Collider'], 30); // Priority 30 (after physics, before game logic)

        // Spatial hash for optimization
        this.spatialHash = new SpatialHash(worldWidth, worldHeight, cellSize);

        // Collision pairs to check (tag filters)
        this.collisionPairs = []; // { tagA, tagB, callback }
    }

    /**
     * Initialize system
     */
    init(world) {
        this.world = world;
    }

    /**
     * Register a collision pair to check
     * @param {string} tagA - First tag (e.g., 'player')
     * @param {string} tagB - Second tag (e.g., 'item')
     * @param {Function} callback - Callback(entityA, entityB) when collision detected
     */
    registerCollisionPair(tagA, tagB, callback) {
        this.collisionPairs.push({ tagA, tagB, callback });
    }

    /**
     * Process collision detection
     */
    process(entities, delta) {
        // Clear spatial hash
        this.spatialHash.clear();

        // Insert all entities into spatial hash
        for (const entity of entities) {
            const transform = entity.getComponent('Transform');
            const collider = entity.getComponent('Collider');

            if (collider.enabled) {
                this.spatialHash.insert(
                    entity,
                    transform.x,
                    transform.y,
                    collider.width,
                    collider.height
                );
            }
        }

        // Check collisions for registered pairs
        for (const pair of this.collisionPairs) {
            this.checkPairCollisions(pair.tagA, pair.tagB, pair.callback);
        }
    }

    /**
     * Check collisions between two tags
     * @private
     */
    checkPairCollisions(tagA, tagB, callback) {
        // Get entities with tagA
        const entitiesA = this.world.queryEntitiesByTag(tagA);

        for (const entityA of entitiesA) {
            const transformA = entityA.getComponent('Transform');
            const colliderA = entityA.getComponent('Collider');

            if (!colliderA || !colliderA.enabled) continue;

            // Get nearby entities using spatial hash (OPTIMIZATION!)
            const nearby = this.spatialHash.getNearby(
                transformA.x,
                transformA.y,
                Math.max(colliderA.width, colliderA.height)
            );

            // Check collision with nearby entities that have tagB
            for (const entityB of nearby) {
                if (entityB === entityA) continue; // Skip self
                if (!entityB.hasTag(tagB)) continue; // Not the tag we're looking for

                const transformB = entityB.getComponent('Transform');
                const colliderB = entityB.getComponent('Collider');

                if (!colliderB || !colliderB.enabled) continue;

                // AABB collision check
                if (colliderA.intersects(transformA, colliderB, transformB)) {
                    // Collision detected!
                    // Emit event
                    eventBus.emit(GameEvents.COLLISION_DETECTED, {
                        entityA,
                        entityB,
                        position: { x: transformA.x, y: transformA.y }
                    });

                    // Call callback
                    if (callback) {
                        callback(entityA, entityB);
                    }
                }
            }
        }
    }

    /**
     * Manual collision check (for specific entities)
     * @param {Entity} entityA
     * @param {Entity} entityB
     * @returns {boolean}
     */
    checkCollision(entityA, entityB) {
        const transformA = entityA.getComponent('Transform');
        const colliderA = entityA.getComponent('Collider');
        const transformB = entityB.getComponent('Transform');
        const colliderB = entityB.getComponent('Collider');

        if (!transformA || !colliderA || !transformB || !colliderB) {
            return false;
        }

        if (!colliderA.enabled || !colliderB.enabled) {
            return false;
        }

        return colliderA.intersects(transformA, colliderB, transformB);
    }

    /**
     * Get spatial hash statistics
     * @returns {Object}
     */
    getStats() {
        return this.spatialHash.getStats();
    }

    /**
     * Log statistics
     */
    logStats() {
        this.spatialHash.logStats();
    }

    /**
     * Cleanup
     */
    destroy() {
        this.spatialHash.clear();
        this.collisionPairs = [];
        super.destroy();
    }
}
