import { eventBus } from '../core/EventBus.js';
import { GameEvents } from '../core/GameEvents.js';

/**
 * Game state enumeration
 */
export const GameState = {
    LOADING: 'loading',
    START_SCREEN: 'start_screen',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

/**
 * Manages game state transitions and state-based logic
 * Now integrated with global EventBus for better decoupling
 */
export class GameStateManager {
    constructor() {
        this.currentState = GameState.LOADING;
        this.previousState = null;
        this.listeners = new Map();  // Kept for backward compatibility
    }

    /**
     * Change game state and notify listeners
     * @param {string} newState - New game state from GameState enum
     */
    setState(newState) {
        if (!Object.values(GameState).includes(newState)) {
            console.error(`Invalid game state: ${newState}`);
            return;
        }

        if (this.currentState === newState) {
            return;
        }

        this.previousState = this.currentState;
        this.currentState = newState;

        console.log(`Game state changed: ${this.previousState} -> ${this.currentState}`);

        // Emit event via EventBus
        eventBus.emit(GameEvents.STATE_CHANGED, {
            newState,
            oldState: this.previousState
        });

        // Also notify old-style listeners (backward compatibility)
        this.notifyListeners(newState, this.previousState);
    }

    /**
     * Get current game state
     * @returns {string} Current state
     */
    getState() {
        return this.currentState;
    }

    /**
     * Check if game is in specific state
     * @param {string} state - State to check
     * @returns {boolean}
     */
    isState(state) {
        return this.currentState === state;
    }

    /**
     * Check if game is playing
     * @returns {boolean}
     */
    isPlaying() {
        return this.currentState === GameState.PLAYING;
    }

    /**
     * Add state change listener
     * @param {string} id - Unique listener ID
     * @param {Function} callback - Callback function (newState, oldState)
     */
    addListener(id, callback) {
        this.listeners.set(id, callback);
    }

    /**
     * Remove state change listener
     * @param {string} id - Listener ID to remove
     */
    removeListener(id) {
        this.listeners.delete(id);
    }

    /**
     * Notify all listeners of state change
     * @private
     */
    notifyListeners(newState, oldState) {
        this.listeners.forEach(callback => {
            try {
                callback(newState, oldState);
            } catch (error) {
                console.error('Error in state change listener:', error);
            }
        });
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.setState(GameState.START_SCREEN);
    }

    /**
     * Clean up all listeners
     */
    destroy() {
        this.listeners.clear();
    }
}
