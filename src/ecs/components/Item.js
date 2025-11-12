import { Component } from '../Component.js';

/**
 * Item Component - Game item data
 *
 * Holds item-specific properties (score, type, etc.)
 */
export class Item extends Component {
    constructor(itemConfig = null) {
        super();
        this.config = itemConfig;       // Item configuration from config.js
        this.scoreValue = 0;
        this.gameOver = false;          // If true, ends game when caught
        this.isPowerUp = false;
        this.caught = false;            // Flag for caught state
    }

    /**
     * Check if item gives score
     * @returns {boolean}
     */
    isScoreable() {
        return this.scoreValue > 0;
    }

    /**
     * Check if item ends game
     * @returns {boolean}
     */
    isGameOver() {
        return this.gameOver;
    }

    /**
     * Reset to default values
     */
    reset() {
        this.config = null;
        this.scoreValue = 0;
        this.gameOver = false;
        this.isPowerUp = false;
        this.caught = false;
    }
}
