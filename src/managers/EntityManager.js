import { FallingItem } from '../entities/FallingItem.js';
import { GAME_CONFIG, ITEM_CONFIG } from '../config.js';

/**
 * EntityManager - Manages all falling items and score popups
 * Separates entity management from game logic
 * Now uses object pooling for better performance
 */
export class EntityManager {
    constructor(game, itemPool = null) {
        this.game = game;
        this.itemPool = itemPool;  // Optional item pool for performance
        this.fallingItems = [];
        this.scorePopups = [];
    }

    /**
     * Spawn a falling item or power-up
     * @param {Object} itemConfig - Item configuration
     * @param {PIXI.Texture} texture - Item texture
     * @param {number} speedMultiplier - Current speed multiplier
     */
    spawnItem(itemConfig, texture, speedMultiplier) {
        let item;

        // Use pool if available, otherwise create new
        if (this.itemPool) {
            item = this.itemPool.acquire(texture, itemConfig, speedMultiplier);
        } else {
            item = new FallingItem(texture, itemConfig, speedMultiplier);
        }

        item.addToStage(this.game.app.stage);
        this.fallingItems.push(item);

        console.log(`[EntityManager] Spawned ${itemConfig.id} (total: ${this.fallingItems.length})`);
        return item;
    }

    /**
     * Update all falling items
     * @param {number} delta - Delta time
     * @param {Function} collisionCallback - Called when item collides with player
     * @returns {number} Number of items removed
     */
    updateItems(delta, collisionCallback) {
        let removedCount = 0;

        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];

            // Extra validation - skip invalid items
            if (!item || !item.update || !item.container) {
                console.warn('[EntityManager] Invalid item at index', i, '- removing');
                this.fallingItems.splice(i, 1);
                removedCount++;
                continue;
            }

            // Update item with error handling
            try {
                item.update(delta);
            } catch (error) {
                console.error('[EntityManager] Error updating item:', error);
                this.releaseItem(item);
                this.fallingItems.splice(i, 1);
                removedCount++;
                continue;
            }

            // Check collision
            if (collisionCallback && collisionCallback(item, i)) {
                // Item was caught - release to pool
                this.releaseItem(item);
                this.fallingItems.splice(i, 1);
                removedCount++;
                continue;
            }

            // Remove if off screen
            if (item.isOffScreen()) {
                this.releaseItem(item);
                this.fallingItems.splice(i, 1);
                removedCount++;
            }
        }

        return removedCount;
    }

    /**
     * Update all score popups
     * @param {number} delta - Delta time
     * @returns {number} Number of popups removed
     */
    updatePopups(delta) {
        let removedCount = 0;

        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.scorePopups[i];
            if (!popup || !popup.update) continue;

            const stillActive = popup.update(delta);

            if (!stillActive) {
                popup.removeFromStage(this.game.app.stage);
                popup.destroy();
                this.scorePopups.splice(i, 1);
                removedCount++;
            }
        }

        return removedCount;
    }

    /**
     * Update speeds of all falling items
     * @param {number} newSpeedMultiplier - New speed multiplier
     */
    updateAllSpeeds(newSpeedMultiplier) {
        for (const item of this.fallingItems) {
            if (item && item.updateSpeed) {
                item.updateSpeed(newSpeedMultiplier);
            }
        }

        console.log(`[EntityManager] Updated ${this.fallingItems.length} items to speed ${newSpeedMultiplier.toFixed(2)}x`);
    }

    /**
     * Add a score popup
     * @param {Object} popup - Score popup instance
     */
    addPopup(popup) {
        this.scorePopups.push(popup);
    }

    /**
     * Release an item back to pool or destroy it
     * @param {FallingItem} item - Item to release
     */
    releaseItem(item) {
        if (!item) return;

        // Ensure item is removed from stage
        try {
            if (item.container && item.container.parent) {
                item.container.parent.removeChild(item.container);
            }
        } catch (error) {
            console.warn('[EntityManager] Error removing item from stage:', error);
        }

        // Release to pool or destroy
        if (this.itemPool) {
            this.itemPool.release(item);
        } else {
            if (item.removeFromStage) {
                item.removeFromStage(this.game.app.stage);
            }
            if (item.destroy) {
                item.destroy();
            }
        }
    }

    /**
     * Clear all falling items
     */
    clearAllItems() {
        for (const item of this.fallingItems) {
            if (item) {
                this.releaseItem(item);
            }
        }
        this.fallingItems = [];
        console.log('[EntityManager] Cleared all falling items');
    }

    /**
     * Clear all score popups
     */
    clearAllPopups() {
        for (const popup of this.scorePopups) {
            if (popup && popup.removeFromStage) {
                popup.removeFromStage(this.game.app.stage);
                popup.destroy();
            }
        }
        this.scorePopups = [];
        console.log('[EntityManager] Cleared all score popups');
    }

    /**
     * Remove items by filter function
     * @param {Function} filterFn - Function that returns true for items to remove
     * @returns {number} Number of items removed
     */
    removeItemsBy(filterFn) {
        let removedCount = 0;

        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
            if (item && filterFn(item)) {
                this.releaseItem(item);
                this.fallingItems.splice(i, 1);
                removedCount++;
            }
        }

        return removedCount;
    }

    /**
     * Get count of specific item type
     * @param {Function} filterFn - Filter function
     * @returns {number}
     */
    countItems(filterFn) {
        return this.fallingItems.filter(filterFn).length;
    }

    /**
     * Get all items
     * @returns {Array}
     */
    getAllItems() {
        return this.fallingItems;
    }

    /**
     * Get all popups
     * @returns {Array}
     */
    getAllPopups() {
        return this.scorePopups;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.clearAllItems();
        this.clearAllPopups();
    }
}
