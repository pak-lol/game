/**
 * EventBus - Global event system for decoupling components
 *
 * Features:
 * - Subscribe to events with callbacks
 * - Event priority support
 * - One-time listeners (once)
 * - Wildcard listeners (all events)
 * - Error handling
 * - Memory leak prevention
 *
 * Usage:
 *   eventBus.on('item:caught', (data) => console.log(data));
 *   eventBus.emit('item:caught', { score: 10 });
 *   eventBus.off('item:caught', callback);  // Unsubscribe
 */
export class EventBus {
    constructor() {
        // Map of event name -> array of {callback, priority, once}
        this.listeners = new Map();

        // Wildcard listeners (called for ALL events)
        this.wildcardListeners = [];

        // Statistics for debugging
        this.stats = {
            totalEmits: 0,
            totalListeners: 0,
            eventCounts: {}
        };

        // Error handler
        this.errorHandler = (error, event, data) => {
            console.error(`[EventBus] Error in listener for "${event}":`, error);
            console.error('[EventBus] Event data:', data);
        };
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {number} priority - Priority (lower = executes first)
     * @returns {Function} Unsubscribe function
     */
    on(event, callback, priority = 50) {
        if (typeof callback !== 'function') {
            console.error('[EventBus] Callback must be a function');
            return () => {};
        }

        // Create listener object
        const listener = {
            callback,
            priority,
            once: false
        };

        // Add to listeners map
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const eventListeners = this.listeners.get(event);
        eventListeners.push(listener);

        // Sort by priority (lower number = higher priority)
        eventListeners.sort((a, b) => a.priority - b.priority);

        this.stats.totalListeners++;

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event (fires only once)
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {number} priority - Priority
     * @returns {Function} Unsubscribe function
     */
    once(event, callback, priority = 50) {
        if (typeof callback !== 'function') {
            console.error('[EventBus] Callback must be a function');
            return () => {};
        }

        const listener = {
            callback,
            priority,
            once: true
        };

        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const eventListeners = this.listeners.get(event);
        eventListeners.push(listener);
        eventListeners.sort((a, b) => a.priority - b.priority);

        this.stats.totalListeners++;

        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners) return;

        const index = eventListeners.findIndex(l => l.callback === callback);
        if (index !== -1) {
            eventListeners.splice(index, 1);
            this.stats.totalListeners--;

            // Remove empty event arrays
            if (eventListeners.length === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Unsubscribe all listeners for an event
     * @param {string} event - Event name
     */
    offAll(event) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners) return;

        this.stats.totalListeners -= eventListeners.length;
        this.listeners.delete(event);
    }

    /**
     * Emit an event to all listeners
     * @param {string} event - Event name
     * @param {*} data - Data to pass to listeners
     */
    emit(event, data = {}) {
        this.stats.totalEmits++;

        // Track event counts
        if (!this.stats.eventCounts[event]) {
            this.stats.eventCounts[event] = 0;
        }
        this.stats.eventCounts[event]++;

        // Get event listeners
        const eventListeners = this.listeners.get(event);
        const listenersToRemove = [];

        // Call event-specific listeners
        if (eventListeners && eventListeners.length > 0) {
            for (let i = 0; i < eventListeners.length; i++) {
                const listener = eventListeners[i];

                try {
                    listener.callback(data, event);

                    // Mark once listeners for removal
                    if (listener.once) {
                        listenersToRemove.push(listener);
                    }
                } catch (error) {
                    this.errorHandler(error, event, data);
                }
            }

            // Remove once listeners
            for (const listener of listenersToRemove) {
                this.off(event, listener.callback);
            }
        }

        // Call wildcard listeners
        for (const wildcard of this.wildcardListeners) {
            try {
                wildcard.callback(data, event);
            } catch (error) {
                this.errorHandler(error, `wildcard(${event})`, data);
            }
        }
    }

    /**
     * Subscribe to ALL events (wildcard)
     * @param {Function} callback - Callback receives (data, eventName)
     * @returns {Function} Unsubscribe function
     */
    onAll(callback) {
        if (typeof callback !== 'function') {
            console.error('[EventBus] Callback must be a function');
            return () => {};
        }

        this.wildcardListeners.push({ callback });
        this.stats.totalListeners++;

        return () => this.offAll(callback);
    }

    /**
     * Unsubscribe from wildcard listening
     * @param {Function} callback - Callback to remove
     */
    offAllWildcard(callback) {
        const index = this.wildcardListeners.findIndex(l => l.callback === callback);
        if (index !== -1) {
            this.wildcardListeners.splice(index, 1);
            this.stats.totalListeners--;
        }
    }

    /**
     * Set custom error handler
     * @param {Function} handler - Error handler function(error, event, data)
     */
    setErrorHandler(handler) {
        if (typeof handler === 'function') {
            this.errorHandler = handler;
        }
    }

    /**
     * Clear all listeners
     */
    clear() {
        this.listeners.clear();
        this.wildcardListeners = [];
        this.stats.totalListeners = 0;
        console.log('[EventBus] All listeners cleared');
    }

    /**
     * Get number of listeners for an event
     * @param {string} event - Event name
     * @returns {number}
     */
    listenerCount(event) {
        const eventListeners = this.listeners.get(event);
        return eventListeners ? eventListeners.length : 0;
    }

    /**
     * Get all registered event names
     * @returns {Array<string>}
     */
    getEvents() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Get statistics
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            activeEvents: this.listeners.size,
            wildcardListeners: this.wildcardListeners.length
        };
    }

    /**
     * Log statistics (for debugging)
     */
    logStats() {
        console.log('[EventBus] Statistics:', this.getStats());
        console.log('[EventBus] Events:', this.getEvents());
    }

    /**
     * Wait for an event (Promise-based)
     * @param {string} event - Event name
     * @param {number} timeout - Timeout in ms (0 = no timeout)
     * @returns {Promise} Resolves with event data
     */
    waitFor(event, timeout = 0) {
        return new Promise((resolve, reject) => {
            let timeoutId = null;
            let unsubscribe = null;

            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (unsubscribe) unsubscribe();
            };

            unsubscribe = this.once(event, (data) => {
                cleanup();
                resolve(data);
            });

            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    cleanup();
                    reject(new Error(`Timeout waiting for event: ${event}`));
                }, timeout);
            }
        });
    }
}

// Create and export global eventBus instance
export const eventBus = new EventBus();
