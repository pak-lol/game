import { eventBus } from '../core/EventBus.js';
import { GameEvents } from '../core/GameEvents.js';
import { GAME_CONFIG } from '../config.js';

/**
 * InputManager - Centralized input handling
 *
 * Features:
 * - Unified touch/mouse API
 * - Coordinate normalization (handles device pixel ratio)
 * - Event-driven (emits input events)
 * - Keyboard support (for future desktop version)
 * - Input state tracking
 *
 * Usage:
 *   inputManager.init(canvas);
 *   inputManager.on('pointerMove', (data) => { ... });
 *   const pos = inputManager.getPointerPosition();
 */
export class InputManager {
    constructor() {
        // Input state
        this.pointerDown = false;
        this.pointerPosition = { x: 0, y: 0 };
        this.previousPointerPosition = { x: 0, y: 0 };

        // Keyboard state
        this.keysDown = new Set();
        this.keysPressed = new Map(); // Key -> timestamp

        // Canvas reference
        this.canvas = null;

        // Event listeners (for cleanup)
        this.eventListeners = [];

        // Enabled state
        this.enabled = true;
    }

    /**
     * Initialize input manager
     * @param {HTMLCanvasElement} canvas - Canvas element to attach listeners to
     */
    init(canvas) {
        if (this.canvas) {
            console.warn('[InputManager] Already initialized');
            return;
        }

        this.canvas = canvas;

        // Setup mouse listeners
        this.setupMouseListeners();

        // Setup touch listeners
        this.setupTouchListeners();

        // Setup keyboard listeners
        this.setupKeyboardListeners();

        console.log('[InputManager] Initialized');
    }

    /**
     * Setup mouse event listeners
     */
    setupMouseListeners() {
        const onMouseDown = (e) => this.handlePointerDown(e.clientX, e.clientY, e);
        const onMouseMove = (e) => this.handlePointerMove(e.clientX, e.clientY, e);
        const onMouseUp = (e) => this.handlePointerUp(e.clientX, e.clientY, e);

        this.canvas.addEventListener('mousedown', onMouseDown);
        this.canvas.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp); // Window for when mouse leaves canvas

        this.eventListeners.push(
            { element: this.canvas, event: 'mousedown', handler: onMouseDown },
            { element: this.canvas, event: 'mousemove', handler: onMouseMove },
            { element: window, event: 'mouseup', handler: onMouseUp }
        );
    }

    /**
     * Setup touch event listeners
     */
    setupTouchListeners() {
        const onTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handlePointerDown(touch.clientX, touch.clientY, e);
        };

        const onTouchMove = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handlePointerMove(touch.clientX, touch.clientY, e);
        };

        const onTouchEnd = (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.handlePointerUp(touch.clientX, touch.clientY, e);
        };

        this.canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', onTouchEnd, { passive: false });

        this.eventListeners.push(
            { element: this.canvas, event: 'touchstart', handler: onTouchStart },
            { element: this.canvas, event: 'touchmove', handler: onTouchMove },
            { element: this.canvas, event: 'touchend', handler: onTouchEnd }
        );
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardListeners() {
        const onKeyDown = (e) => {
            if (!this.enabled) return;

            const key = e.key.toLowerCase();

            if (!this.keysDown.has(key)) {
                this.keysDown.add(key);
                this.keysPressed.set(key, Date.now());

                // Emit event
                eventBus.emit(GameEvents.INPUT_KEY_DOWN, {
                    key,
                    code: e.code,
                    originalEvent: e
                });
            }
        };

        const onKeyUp = (e) => {
            const key = e.key.toLowerCase();
            this.keysDown.delete(key);
            this.keysPressed.delete(key);

            // Emit event
            eventBus.emit(GameEvents.INPUT_KEY_UP, {
                key,
                code: e.code,
                originalEvent: e
            });
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        this.eventListeners.push(
            { element: window, event: 'keydown', handler: onKeyDown },
            { element: window, event: 'keyup', handler: onKeyUp }
        );
    }

    /**
     * Handle pointer down (unified mouse/touch)
     */
    handlePointerDown(clientX, clientY, originalEvent) {
        if (!this.enabled) return;

        this.pointerDown = true;

        // Convert to game coordinates
        const gamePos = this.clientToGameCoordinates(clientX, clientY);
        this.pointerPosition = gamePos;
        this.previousPointerPosition = { ...gamePos };

        // Emit event
        eventBus.emit(GameEvents.POINTER_DOWN, {
            x: gamePos.x,
            y: gamePos.y,
            originalEvent
        });
    }

    /**
     * Handle pointer move (unified mouse/touch)
     */
    handlePointerMove(clientX, clientY, originalEvent) {
        if (!this.enabled) return;

        // Convert to game coordinates
        const gamePos = this.clientToGameCoordinates(clientX, clientY);
        this.previousPointerPosition = { ...this.pointerPosition };
        this.pointerPosition = gamePos;

        // Emit event
        eventBus.emit(GameEvents.POINTER_MOVE, {
            x: gamePos.x,
            y: gamePos.y,
            deltaX: gamePos.x - this.previousPointerPosition.x,
            deltaY: gamePos.y - this.previousPointerPosition.y,
            originalEvent
        });
    }

    /**
     * Handle pointer up (unified mouse/touch)
     */
    handlePointerUp(clientX, clientY, originalEvent) {
        if (!this.enabled) return;

        this.pointerDown = false;

        // Convert to game coordinates
        const gamePos = this.clientToGameCoordinates(clientX, clientY);
        this.pointerPosition = gamePos;

        // Emit event
        eventBus.emit(GameEvents.POINTER_UP, {
            x: gamePos.x,
            y: gamePos.y,
            originalEvent
        });
    }

    /**
     * Convert client coordinates to game coordinates
     * Handles canvas scaling and device pixel ratio
     * @param {number} clientX - Client X coordinate
     * @param {number} clientY - Client Y coordinate
     * @returns {Object} {x, y} in game coordinates
     */
    clientToGameCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();

        // CRITICAL: Use GAME_CONFIG dimensions, not canvas dimensions
        // Canvas may be scaled due to device pixel ratio
        const scaleX = GAME_CONFIG.width / rect.width;
        const scaleY = GAME_CONFIG.height / rect.height;

        const gameX = (clientX - rect.left) * scaleX;
        const gameY = (clientY - rect.top) * scaleY;

        return { x: gameX, y: gameY };
    }

    /**
     * Get current pointer position (in game coordinates)
     * @returns {Object} {x, y}
     */
    getPointerPosition() {
        return { ...this.pointerPosition };
    }

    /**
     * Check if pointer is down
     * @returns {boolean}
     */
    isPointerDown() {
        return this.pointerDown;
    }

    /**
     * Check if a key is currently down
     * @param {string} key - Key name (e.g., 'a', 'arrowup', 'space')
     * @returns {boolean}
     */
    isKeyDown(key) {
        return this.keysDown.has(key.toLowerCase());
    }

    /**
     * Check if a key was just pressed (this frame)
     * @param {string} key - Key name
     * @param {number} threshold - Time threshold in ms (default 100ms)
     * @returns {boolean}
     */
    isKeyPressed(key, threshold = 100) {
        const pressTime = this.keysPressed.get(key.toLowerCase());
        if (!pressTime) return false;

        return (Date.now() - pressTime) < threshold;
    }

    /**
     * Get all keys currently down
     * @returns {Array<string>}
     */
    getKeysDown() {
        return Array.from(this.keysDown);
    }

    /**
     * Enable/disable input
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;

        if (!enabled) {
            // Reset state
            this.pointerDown = false;
            this.keysDown.clear();
            this.keysPressed.clear();
        }

        console.log(`[InputManager] ${enabled ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Update (call each frame to clean up old key presses)
     */
    update() {
        // Clean up old key presses (older than 200ms)
        const now = Date.now();
        for (const [key, timestamp] of this.keysPressed) {
            if (now - timestamp > 200) {
                this.keysPressed.delete(key);
            }
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        // Remove all event listeners
        for (const { element, event, handler } of this.eventListeners) {
            element.removeEventListener(event, handler);
        }

        this.eventListeners = [];
        this.canvas = null;
        this.keysDown.clear();
        this.keysPressed.clear();

        console.log('[InputManager] Destroyed');
    }
}
