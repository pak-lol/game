import { eventBus } from '../core/EventBus.js';
import { GameEvents } from '../core/GameEvents.js';

/**
 * SceneManager - Manages game scenes and transitions
 *
 * Features:
 * - Register and switch between scenes
 * - Pass data between scenes
 * - Handle scene lifecycle (init, enter, exit, destroy)
 * - Pause/resume scenes
 * - Scene stack for overlays (pause menu over game)
 *
 * Usage:
 *   sceneManager.register('menu', new MenuScene());
 *   sceneManager.register('game', new GameScene());
 *   sceneManager.switchTo('menu');
 *   sceneManager.switchTo('game', { difficulty: 'hard' });
 */
export class SceneManager {
    /**
     * @param {PIXI.Application} app - PixiJS application
     * @param {Object} services - Game services to pass to scenes
     */
    constructor(app, services = {}) {
        this.app = app;
        this.services = services;

        // Registered scenes
        this.scenes = new Map();

        // Scene stack (for overlays like pause menu)
        this.sceneStack = [];

        // Current active scene
        this.currentScene = null;

        // Transition state
        this.transitioning = false;

        console.log('[SceneManager] Initialized');
    }

    /**
     * Register a scene
     * @param {string} name - Scene name (unique identifier)
     * @param {Scene} scene - Scene instance
     */
    register(name, scene) {
        if (this.scenes.has(name)) {
            console.warn(`[SceneManager] Scene "${name}" already registered`);
            return;
        }

        this.scenes.set(name, scene);

        // Initialize scene
        if (!scene.initialized) {
            scene.init(this.app, this.services);
        }

        console.log(`[SceneManager] Registered scene: ${name}`);
    }

    /**
     * Unregister a scene
     * @param {string} name - Scene name
     */
    unregister(name) {
        const scene = this.scenes.get(name);
        if (!scene) {
            console.warn(`[SceneManager] Scene "${name}" not found`);
            return;
        }

        // Exit and destroy if active
        if (scene.isActive()) {
            scene.exit();
        }
        scene.destroy();

        this.scenes.delete(name);
        console.log(`[SceneManager] Unregistered scene: ${name}`);
    }

    /**
     * Switch to a different scene
     * @param {string} name - Scene name
     * @param {Object} data - Optional data to pass to new scene
     * @returns {boolean} Success
     */
    switchTo(name, data = {}) {
        const newScene = this.scenes.get(name);

        if (!newScene) {
            console.error(`[SceneManager] Scene "${name}" not found`);
            return false;
        }

        if (this.transitioning) {
            console.warn('[SceneManager] Already transitioning');
            return false;
        }

        this.transitioning = true;

        // Exit current scene
        if (this.currentScene) {
            console.log(`[SceneManager] Exiting scene: ${this.currentScene.getName()}`);
            const exitData = this.currentScene.exit();

            // Merge exit data with passed data
            data = { ...exitData, ...data, previousScene: this.currentScene.getName() };

            // Remove from ticker
            if (this.currentScene._updateBound) {
                this.app.ticker.remove(this.currentScene._updateBound);
            }
        }

        // Clear scene stack
        this.sceneStack = [];

        // Enter new scene
        console.log(`[SceneManager] Entering scene: ${name}`);
        this.currentScene = newScene;
        newScene.enter(data);

        // Add to ticker
        newScene._updateBound = (delta) => {
            if (newScene.isActive()) {
                newScene.update(delta);
            }
        };
        this.app.ticker.add(newScene._updateBound);

        this.transitioning = false;

        return true;
    }

    /**
     * Push a scene onto the stack (for overlays like pause menu)
     * Current scene remains active in background
     * @param {string} name - Scene name
     * @param {Object} data - Optional data
     * @returns {boolean} Success
     */
    push(name, data = {}) {
        const newScene = this.scenes.get(name);

        if (!newScene) {
            console.error(`[SceneManager] Scene "${name}" not found`);
            return false;
        }

        // Pause current scene (don't exit)
        if (this.currentScene) {
            console.log(`[SceneManager] Pausing scene: ${this.currentScene.getName()}`);
            this.sceneStack.push(this.currentScene);

            // Remove from ticker (paused)
            if (this.currentScene._updateBound) {
                this.app.ticker.remove(this.currentScene._updateBound);
            }
        }

        // Enter new scene
        console.log(`[SceneManager] Pushing scene: ${name}`);
        this.currentScene = newScene;
        newScene.enter(data);

        // Add to ticker
        newScene._updateBound = (delta) => {
            if (newScene.isActive()) {
                newScene.update(delta);
            }
        };
        this.app.ticker.add(newScene._updateBound);

        return true;
    }

    /**
     * Pop the current scene and return to previous
     * @returns {boolean} Success
     */
    pop() {
        if (this.sceneStack.length === 0) {
            console.warn('[SceneManager] No scenes to pop');
            return false;
        }

        // Exit current scene
        if (this.currentScene) {
            console.log(`[SceneManager] Popping scene: ${this.currentScene.getName()}`);
            this.currentScene.exit();

            // Remove from ticker
            if (this.currentScene._updateBound) {
                this.app.ticker.remove(this.currentScene._updateBound);
            }
        }

        // Resume previous scene
        const previousScene = this.sceneStack.pop();
        console.log(`[SceneManager] Resuming scene: ${previousScene.getName()}`);
        this.currentScene = previousScene;

        // Re-enter previous scene
        previousScene.enter({ resumed: true });

        // Add back to ticker
        previousScene._updateBound = (delta) => {
            if (previousScene.isActive()) {
                previousScene.update(delta);
            }
        };
        this.app.ticker.add(previousScene._updateBound);

        return true;
    }

    /**
     * Get current active scene
     * @returns {Scene|null}
     */
    getCurrentScene() {
        return this.currentScene;
    }

    /**
     * Get current scene name
     * @returns {string|null}
     */
    getCurrentSceneName() {
        return this.currentScene ? this.currentScene.getName() : null;
    }

    /**
     * Check if a scene exists
     * @param {string} name - Scene name
     * @returns {boolean}
     */
    hasScene(name) {
        return this.scenes.has(name);
    }

    /**
     * Get scene by name
     * @param {string} name - Scene name
     * @returns {Scene|null}
     */
    getScene(name) {
        return this.scenes.get(name) || null;
    }

    /**
     * Get all registered scene names
     * @returns {Array<string>}
     */
    getSceneNames() {
        return Array.from(this.scenes.keys());
    }

    /**
     * Handle window resize (propagate to current scene)
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        if (this.currentScene) {
            this.currentScene.resize(width, height);
        }
    }

    /**
     * Cleanup and destroy all scenes
     */
    destroy() {
        // Exit current scene
        if (this.currentScene) {
            this.currentScene.exit();
            if (this.currentScene._updateBound) {
                this.app.ticker.remove(this.currentScene._updateBound);
            }
        }

        // Destroy all scenes
        for (const [name, scene] of this.scenes) {
            scene.destroy();
        }

        this.scenes.clear();
        this.sceneStack = [];
        this.currentScene = null;

        console.log('[SceneManager] Destroyed');
    }
}
