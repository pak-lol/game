/**
 * Component - Base class for all components
 *
 * Components are pure data containers with NO logic.
 * Systems operate on entities that have specific components.
 *
 * Example components:
 * - Transform: { x, y, rotation, scale }
 * - Physics: { velocityX, velocityY, gravity }
 * - Sprite: { texture, tint, alpha }
 * - Collider: { width, height, offset }
 */
export class Component {
    constructor() {
        // Base component has no data
        // Subclasses will add their own properties
    }

    /**
     * Reset component to default values (for object pooling)
     */
    reset() {
        // Override in subclasses
    }

    /**
     * Clone component (deep copy)
     * @returns {Component}
     */
    clone() {
        const ComponentClass = this.constructor;
        const cloned = new ComponentClass();
        Object.assign(cloned, this);
        return cloned;
    }

    /**
     * Serialize component to JSON
     * @returns {Object}
     */
    toJSON() {
        return { ...this };
    }

    /**
     * Deserialize component from JSON
     * @param {Object} data - JSON data
     */
    fromJSON(data) {
        Object.assign(this, data);
    }
}
