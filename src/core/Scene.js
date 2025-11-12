import { eventBus } from './EventBus.js';
import { GameEvents } from './GameEvents.js';

/**
 * Base Scene class - represents a game screen/state
 *
 * Scenes manage their own:
 * - Entities and game objects
 * - Update loop
 * - UI elements
 * - Lifecycle (enter/exit)
 *
 * Examples: MenuScene, GameScene, PauseScene, GameOverScene
 */
export class Scene {
    /**
     * @param {string} name - Scene name (unique identifier)
     */
    constructor(name) {
        this.name = name;
        this.app = null;
        this.services = null;
        this.active = false;
        this.initialized = false;

        // Event listeners registered by this scene (for cleanup)
        this.eventListeners = [];
    }

    /**
     * Initialize scene (called once when scene is first created)
     * @param {PIXI.Application} app - PixiJS application
     * @param {Object} services - Game services (audioManager, scoreService, etc.)
     */
    init(app, services) {
        if (this.initialized) {
            console.warn(`[Scene] ${this.name} already initialized`);
            return;
        }

        this.app = app;
        this.services = services;
        this.initialized = true;

        console.log(`[Scene] ${this.name} initialized`);
    }

    /**
     * Called when scene becomes active
     * @param {Object} data - Optional data passed from previous scene
     */
    enter(data = {}) {
        if (!this.initialized) {
            console.error(`[Scene] ${this.name} not initialized! Call init() first.`);
            return;
        }

        this.active = true;
        console.log(`[Scene] ${this.name} entered`, data);

        // Emit scene enter event
        eventBus.emit(GameEvents.STATE_CHANGED, {
            newState: this.name,
            oldState: data.previousScene || null
        });
    }

    /**
     * Called when leaving this scene
     * @returns {Object} Optional data to pass to next scene
     */
    exit() {
        this.active = false;
        console.log(`[Scene] ${this.name} exited`);

        // Clean up event listeners
        this.removeAllEventListeners();

        return {}; // Override to return data
    }

    /**
     * Update loop (called every frame while scene is active)
     * @param {number} delta - Delta time from PixiJS ticker
     */
    update(delta) {
        // Override in subclasses
    }

    /**
     * Handle window resize
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        // Override in subclasses
    }

    /**
     * Register an event listener (will be cleaned up on exit)
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {number} priority - Event priority
     * @returns {Function} Unsubscribe function
     */
    on(event, callback, priority = 50) {
        const unsubscribe = eventBus.on(event, callback, priority);
        this.eventListeners.push({ event, callback, unsubscribe });
        return unsubscribe;
    }

    /**
     * Register a one-time event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {number} priority - Event priority
     * @returns {Function} Unsubscribe function
     */
    once(event, callback, priority = 50) {
        const unsubscribe = eventBus.once(event, callback, priority);
        this.eventListeners.push({ event, callback, unsubscribe });
        return unsubscribe;
    }

    /**
     * Remove all event listeners registered by this scene
     */
    removeAllEventListeners() {
        for (const listener of this.eventListeners) {
            listener.unsubscribe();
        }
        this.eventListeners = [];
    }

    /**
     * Check if scene is active
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }

    /**
     * Get scene name
     * @returns {string}
     */
    getName() {
        return this.name;
    }

    /**
     * Cleanup and destroy scene
     */
    destroy() {
        this.exit();
        this.app = null;
        this.services = null;
        this.initialized = false;
        console.log(`[Scene] ${this.name} destroyed`);
    }
}
