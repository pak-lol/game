import { ObjectPool } from '../core/ObjectPool.js';
import { FallingItem } from '../entities/FallingItem.js';
import * as PIXI from 'pixi.js';

/**
 * ItemPool - Object pool for FallingItem entities
 * Manages reusable falling items to reduce garbage collection
 */
export class ItemPool {
    /**
     * @param {number} initialSize - Initial number of items to pre-allocate
     * @param {number} maxSize - Maximum pool size
     */
    constructor(initialSize = 30, maxSize = 100) {
        // Create dummy texture for initial objects (will be replaced on init)
        const dummyTexture = PIXI.Texture.WHITE;
        const dummyConfig = {
            id: 'dummy',
            nameKey: 'items.dummy',
            color: '#FFFFFF',
            scoreValue: 0,
            gameOver: false
        };

        // Create pool with factory function
        this.pool = new ObjectPool(
            () => new FallingItem(dummyTexture, dummyConfig, 1.0),
            initialSize,
            maxSize
        );

        console.log('[ItemPool] Initialized with', initialSize, 'items');
    }

    /**
     * Get an item from the pool and initialize it
     * @param {PIXI.Texture} texture - Texture for the item
     * @param {Object} itemConfig - Item configuration
     * @param {number} speedMultiplier - Current game speed multiplier
     * @returns {FallingItem} Initialized falling item
     */
    acquire(texture, itemConfig, speedMultiplier) {
        const item = this.pool.acquire();
        item.init(texture, itemConfig, speedMultiplier);
        return item;
    }

    /**
     * Return an item to the pool
     * @param {FallingItem} item - Item to return
     */
    release(item) {
        // Remove from stage before releasing
        if (item.container && item.container.parent) {
            item.container.parent.removeChild(item.container);
        }

        this.pool.release(item);
    }

    /**
     * Release all items currently in use
     */
    releaseAll() {
        this.pool.releaseAll();
    }

    /**
     * Clear the entire pool
     */
    clear() {
        this.pool.clear();
    }

    /**
     * Get pool statistics
     * @returns {Object} Pool stats
     */
    getStats() {
        return this.pool.getStats();
    }

    /**
     * Log pool statistics
     */
    logStats() {
        console.log('[ItemPool] Statistics:');
        this.pool.logStats();
    }
}
