/**
 * Entity - Container for components
 *
 * In ECS architecture:
 * - Entity = ID + Components (no logic)
 * - Component = Data (no logic)
 * - System = Logic (operates on entities with specific components)
 *
 * Example:
 *   const entity = new Entity('player_1');
 *   entity.addComponent(new Transform(100, 200));
 *   entity.addComponent(new Physics(5, 0.5));
 *   entity.addComponent(new Sprite('basket'));
 */
export class Entity {
    /**
     * @param {string} id - Unique entity identifier
     */
    constructor(id) {
        this.id = id;
        this.components = new Map(); // componentType -> component instance
        this.active = true;
        this.tags = new Set(); // For quick filtering (e.g., 'player', 'enemy', 'powerup')
    }

    /**
     * Add a component to this entity
     * @param {Object} component - Component instance
     * @returns {Entity} this (for chaining)
     */
    addComponent(component) {
        const type = component.constructor.name;

        if (this.components.has(type)) {
            console.warn(`[Entity] ${this.id} already has ${type}`);
        }

        this.components.set(type, component);
        return this; // Allow chaining
    }

    /**
     * Get a component by type name
     * @param {string} type - Component type name (e.g., 'Transform')
     * @returns {Object|null} Component instance or null
     */
    getComponent(type) {
        return this.components.get(type) || null;
    }

    /**
     * Get a component by class
     * @param {Class} ComponentClass - Component class
     * @returns {Object|null} Component instance or null
     */
    getComponentByClass(ComponentClass) {
        return this.components.get(ComponentClass.name) || null;
    }

    /**
     * Check if entity has a component
     * @param {string} type - Component type name
     * @returns {boolean}
     */
    hasComponent(type) {
        return this.components.has(type);
    }

    /**
     * Check if entity has all specified components
     * @param {Array<string>} types - Component type names
     * @returns {boolean}
     */
    hasComponents(...types) {
        return types.every(type => this.components.has(type));
    }

    /**
     * Remove a component
     * @param {string} type - Component type name
     * @returns {boolean} True if removed
     */
    removeComponent(type) {
        return this.components.delete(type);
    }

    /**
     * Get all components
     * @returns {Array<Object>} Array of components
     */
    getAllComponents() {
        return Array.from(this.components.values());
    }

    /**
     * Add a tag for filtering
     * @param {string} tag - Tag name
     * @returns {Entity} this (for chaining)
     */
    addTag(tag) {
        this.tags.add(tag);
        return this;
    }

    /**
     * Remove a tag
     * @param {string} tag - Tag name
     * @returns {boolean} True if removed
     */
    removeTag(tag) {
        return this.tags.delete(tag);
    }

    /**
     * Check if entity has a tag
     * @param {string} tag - Tag name
     * @returns {boolean}
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }

    /**
     * Get all tags
     * @returns {Array<string>}
     */
    getTags() {
        return Array.from(this.tags);
    }

    /**
     * Set active state
     * @param {boolean} active
     */
    setActive(active) {
        this.active = active;
    }

    /**
     * Check if entity is active
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }

    /**
     * Clone entity (deep copy)
     * @param {string} newId - ID for cloned entity
     * @returns {Entity}
     */
    clone(newId) {
        const cloned = new Entity(newId);

        // Copy components (shallow copy of component data)
        for (const [type, component] of this.components) {
            const ComponentClass = component.constructor;
            const clonedComponent = new ComponentClass();

            // Copy properties
            Object.assign(clonedComponent, component);

            cloned.addComponent(clonedComponent);
        }

        // Copy tags
        for (const tag of this.tags) {
            cloned.addTag(tag);
        }

        cloned.active = this.active;

        return cloned;
    }

    /**
     * Destroy entity (cleanup)
     */
    destroy() {
        this.components.clear();
        this.tags.clear();
        this.active = false;
    }

    /**
     * Debug string
     * @returns {string}
     */
    toString() {
        const componentTypes = Array.from(this.components.keys()).join(', ');
        const tags = Array.from(this.tags).join(', ');
        return `Entity(${this.id}, components:[${componentTypes}], tags:[${tags}], active:${this.active})`;
    }
}
