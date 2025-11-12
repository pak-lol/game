/**
 * System - Base class for all systems
 *
 * Systems contain the logic and operate on entities with specific components.
 * Each system queries entities that match its requirements.
 *
 * Example systems:
 * - PhysicsSystem: Updates entities with Transform + Physics
 * - RenderSystem: Draws entities with Transform + Sprite
 * - CollisionSystem: Checks entities with Transform + Collider
 */
export class System {
    /**
     * @param {Array<string>} requiredComponents - Component types this system needs
     * @param {number} priority - Update priority (lower = earlier)
     */
    constructor(requiredComponents = [], priority = 50) {
        this.requiredComponents = requiredComponents;
        this.priority = priority;
        this.enabled = true;
        this.name = this.constructor.name;
    }

    /**
     * Check if an entity matches this system's requirements
     * @param {Entity} entity - Entity to check
     * @returns {boolean}
     */
    matches(entity) {
        if (!entity.isActive()) return false;
        return this.requiredComponents.every(type => entity.hasComponent(type));
    }

    /**
     * Update system (called every frame)
     * @param {Array<Entity>} entities - All entities in the world
     * @param {number} delta - Delta time
     */
    update(entities, delta) {
        // Filter entities that match requirements
        const matchingEntities = entities.filter(e => this.matches(e));

        // Process matching entities
        this.process(matchingEntities, delta);
    }

    /**
     * Process matching entities (override in subclasses)
     * @param {Array<Entity>} entities - Entities that match requirements
     * @param {number} delta - Delta time
     */
    process(entities, delta) {
        // Override in subclasses
    }

    /**
     * Enable/disable system
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Check if system is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Initialize system (called once)
     * @param {World} world - ECS world
     */
    init(world) {
        // Override in subclasses if needed
    }

    /**
     * Cleanup system
     */
    destroy() {
        this.enabled = false;
    }
}
