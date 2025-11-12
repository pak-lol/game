import { Entity } from './Entity.js';

/**
 * World - ECS World Manager
 *
 * Manages:
 * - All entities in the game
 * - All systems that process entities
 * - Entity lifecycle (create, destroy)
 * - System execution order
 *
 * Usage:
 *   const world = new World();
 *   world.addSystem(new PhysicsSystem());
 *   world.addSystem(new RenderSystem());
 *
 *   const entity = world.createEntity('player_1');
 *   entity.addComponent(new Transform(100, 200));
 *
 *   world.update(delta);
 */
export class World {
    constructor() {
        // Entity storage
        this.entities = new Map(); // id -> Entity
        this.entitiesToDestroy = new Set(); // Deferred destruction

        // System storage
        this.systems = [];

        // Entity ID counter
        this.nextEntityId = 1;

        // Statistics
        this.stats = {
            entityCount: 0,
            systemCount: 0,
            updateCalls: 0
        };
    }

    /**
     * Create a new entity
     * @param {string} id - Optional custom ID, auto-generated if not provided
     * @returns {Entity}
     */
    createEntity(id = null) {
        // Generate ID if not provided
        if (!id) {
            id = `entity_${this.nextEntityId++}`;
        }

        // Check for duplicate ID
        if (this.entities.has(id)) {
            console.warn(`[World] Entity with ID "${id}" already exists`);
            return this.entities.get(id);
        }

        // Create entity
        const entity = new Entity(id);
        this.entities.set(id, entity);
        this.stats.entityCount++;

        return entity;
    }

    /**
     * Get entity by ID
     * @param {string} id - Entity ID
     * @returns {Entity|null}
     */
    getEntity(id) {
        return this.entities.get(id) || null;
    }

    /**
     * Get all entities
     * @returns {Array<Entity>}
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    /**
     * Get active entities only
     * @returns {Array<Entity>}
     */
    getActiveEntities() {
        return this.getAllEntities().filter(e => e.isActive());
    }

    /**
     * Query entities by component types
     * @param {Array<string>} componentTypes - Required component types
     * @returns {Array<Entity>}
     */
    queryEntities(...componentTypes) {
        return this.getActiveEntities().filter(entity =>
            entity.hasComponents(...componentTypes)
        );
    }

    /**
     * Query entities by tag
     * @param {string} tag - Tag to filter by
     * @returns {Array<Entity>}
     */
    queryEntitiesByTag(tag) {
        return this.getActiveEntities().filter(entity => entity.hasTag(tag));
    }

    /**
     * Destroy an entity (deferred until end of frame)
     * @param {string|Entity} entityOrId - Entity or entity ID
     */
    destroyEntity(entityOrId) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
        this.entitiesToDestroy.add(id);
    }

    /**
     * Immediately destroy an entity (use with caution)
     * @param {string|Entity} entityOrId - Entity or entity ID
     */
    destroyEntityImmediate(entityOrId) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
        const entity = this.entities.get(id);

        if (entity) {
            entity.destroy();
            this.entities.delete(id);
            this.stats.entityCount--;
        }
    }

    /**
     * Process deferred entity destructions
     * @private
     */
    _processDestroyQueue() {
        for (const id of this.entitiesToDestroy) {
            this.destroyEntityImmediate(id);
        }
        this.entitiesToDestroy.clear();
    }

    /**
     * Add a system to the world
     * @param {System} system - System instance
     */
    addSystem(system) {
        this.systems.push(system);

        // Sort by priority (lower number = higher priority = runs first)
        this.systems.sort((a, b) => a.priority - b.priority);

        // Initialize system
        system.init(this);

        this.stats.systemCount++;

        console.log(`[World] Added system: ${system.name} (priority: ${system.priority})`);
    }

    /**
     * Remove a system
     * @param {System} system - System instance
     */
    removeSystem(system) {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            system.destroy();
            this.systems.splice(index, 1);
            this.stats.systemCount--;
        }
    }

    /**
     * Get system by name
     * @param {string} name - System name
     * @returns {System|null}
     */
    getSystem(name) {
        return this.systems.find(s => s.name === name) || null;
    }

    /**
     * Update all systems
     * @param {number} delta - Delta time
     */
    update(delta) {
        const entities = this.getActiveEntities();

        // Update all enabled systems
        for (const system of this.systems) {
            if (system.isEnabled()) {
                system.update(entities, delta);
            }
        }

        // Process deferred entity destructions
        this._processDestroyQueue();

        this.stats.updateCalls++;
    }

    /**
     * Clear all entities
     */
    clearEntities() {
        for (const entity of this.entities.values()) {
            entity.destroy();
        }
        this.entities.clear();
        this.entitiesToDestroy.clear();
        this.stats.entityCount = 0;
        this.nextEntityId = 1;
    }

    /**
     * Clear all systems
     */
    clearSystems() {
        for (const system of this.systems) {
            system.destroy();
        }
        this.systems = [];
        this.stats.systemCount = 0;
    }

    /**
     * Get world statistics
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            activeEntities: this.getActiveEntities().length,
            totalEntities: this.entities.size,
            pendingDestroys: this.entitiesToDestroy.size
        };
    }

    /**
     * Log world statistics
     */
    logStats() {
        console.log('[World] Statistics:', this.getStats());
    }

    /**
     * Destroy world (cleanup)
     */
    destroy() {
        this.clearEntities();
        this.clearSystems();
        console.log('[World] Destroyed');
    }
}
