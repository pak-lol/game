/**
 * Generic Object Pool - Reduces garbage collection by reusing objects
 *
 * Usage:
 *   const pool = new ObjectPool(() => new MyObject(), 20);
 *   const obj = pool.acquire();  // Get from pool
 *   obj.init(params);            // Reset state
 *   pool.release(obj);           // Return to pool
 */
export class ObjectPool {
    /**
     * @param {Function} factory - Function that creates new objects
     * @param {number} initialSize - Initial pool size
     * @param {number} maxSize - Maximum pool size (prevents memory leaks)
     */
    constructor(factory, initialSize = 20, maxSize = 100) {
        this.factory = factory;
        this.maxSize = maxSize;

        // Pool storage
        this.available = [];
        this.inUse = new Set();

        // Statistics
        this.stats = {
            totalCreated: 0,
            totalAcquired: 0,
            totalReleased: 0,
            peakUsage: 0
        };

        // Pre-allocate initial objects
        this.preallocate(initialSize);
    }

    /**
     * Pre-allocate objects to avoid allocation spikes during gameplay
     * @param {number} count - Number of objects to create
     */
    preallocate(count) {
        for (let i = 0; i < count; i++) {
            const obj = this.factory();
            this.available.push(obj);
            this.stats.totalCreated++;
        }
        console.log(`[ObjectPool] Pre-allocated ${count} objects`);
    }

    /**
     * Get an object from the pool
     * @returns {Object} Object from pool or newly created
     */
    acquire() {
        let obj;

        // Try to reuse from pool
        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            // Create new if pool is empty
            obj = this.factory();
            this.stats.totalCreated++;
            console.log(`[ObjectPool] Pool empty - created new object (total: ${this.stats.totalCreated})`);
        }

        this.inUse.add(obj);
        this.stats.totalAcquired++;

        // Track peak usage
        if (this.inUse.size > this.stats.peakUsage) {
            this.stats.peakUsage = this.inUse.size;
        }

        return obj;
    }

    /**
     * Return an object to the pool
     * @param {Object} obj - Object to return
     */
    release(obj) {
        // Silent return if object not in use (prevents double-release errors)
        if (!this.inUse.has(obj)) {
            // This can happen if an object is released multiple times
            // Just ignore it silently - not a critical error
            return;
        }

        this.inUse.delete(obj);
        this.stats.totalReleased++;

        // Reset object state if it has a reset method
        if (typeof obj.reset === 'function') {
            obj.reset();
        }

        // Return to pool if not exceeding max size
        if (this.available.length < this.maxSize) {
            this.available.push(obj);
        } else {
            // Destroy if pool is full (prevents memory leaks)
            if (typeof obj.destroy === 'function') {
                obj.destroy();
            }
            console.log(`[ObjectPool] Pool full - destroyed object (max: ${this.maxSize})`);
        }
    }

    /**
     * Release all objects in use (useful for scene cleanup)
     */
    releaseAll() {
        const objectsToRelease = Array.from(this.inUse);
        for (const obj of objectsToRelease) {
            this.release(obj);
        }
        console.log(`[ObjectPool] Released all ${objectsToRelease.length} objects`);
    }

    /**
     * Clear the pool completely
     */
    clear() {
        // Destroy all available objects
        for (const obj of this.available) {
            if (typeof obj.destroy === 'function') {
                obj.destroy();
            }
        }

        // Clear all in-use objects
        for (const obj of this.inUse) {
            if (typeof obj.destroy === 'function') {
                obj.destroy();
            }
        }

        this.available = [];
        this.inUse.clear();

        console.log('[ObjectPool] Cleared all objects');
    }

    /**
     * Get pool statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            totalCreated: this.stats.totalCreated,
            totalAcquired: this.stats.totalAcquired,
            totalReleased: this.stats.totalReleased,
            peakUsage: this.stats.peakUsage,
            reuseRate: this.stats.totalAcquired > 0
                ? ((this.stats.totalAcquired - this.stats.totalCreated) / this.stats.totalAcquired * 100).toFixed(1) + '%'
                : '0%'
        };
    }

    /**
     * Log pool statistics (useful for debugging)
     */
    logStats() {
        const stats = this.getStats();
        console.log('[ObjectPool] Stats:', stats);
    }
}
