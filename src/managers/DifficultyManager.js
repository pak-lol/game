import { GAME_CONFIG, DIFFICULTY_CONFIG } from '../config.js';

/**
 * DifficultyManager - Handles game difficulty progression
 * Manages speed increases and spawn rate changes
 */
export class DifficultyManager {
    constructor() {
        this.baseSpeedMultiplier = 1.0; // Base difficulty speed (unaffected by power-ups)
        this.currentSpeedMultiplier = 1.0; // Current effective speed (may be modified by power-ups)
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
    }

    /**
     * Increase difficulty based on score
     * @returns {Object} New difficulty values
     */
    increaseDifficulty() {
        const oldSpeed = this.baseSpeedMultiplier;
        const oldInterval = this.currentSpawnInterval;

        // Increase base speed multiplier
        this.baseSpeedMultiplier = Math.min(
            this.baseSpeedMultiplier + DIFFICULTY_CONFIG.speedIncreasePerScore,
            DIFFICULTY_CONFIG.maxSpeedMultiplier
        );

        // Update current speed if no power-ups are affecting it
        this.currentSpeedMultiplier = this.baseSpeedMultiplier;

        // Decrease spawn interval (spawn faster)
        this.currentSpawnInterval = Math.max(
            this.currentSpawnInterval - DIFFICULTY_CONFIG.spawnRateIncrease,
            DIFFICULTY_CONFIG.minSpawnInterval
        );

        console.log(
            `[Difficulty] Base Speed: ${oldSpeed.toFixed(2)}x -> ${this.baseSpeedMultiplier.toFixed(2)}x | ` +
            `Spawn: ${oldInterval} -> ${this.currentSpawnInterval}`
        );

        return {
            speedMultiplier: this.currentSpeedMultiplier,
            spawnInterval: this.currentSpawnInterval
        };
    }

    /**
     * Set current speed multiplier (used by power-ups)
     * @param {number} multiplier
     */
    setSpeedMultiplier(multiplier) {
        this.currentSpeedMultiplier = multiplier;
    }

    /**
     * Get base speed multiplier (difficulty-based, unaffected by power-ups)
     * @returns {number}
     */
    getBaseSpeedMultiplier() {
        return this.baseSpeedMultiplier;
    }

    /**
     * Get current speed multiplier (may be affected by power-ups)
     * @returns {number}
     */
    getSpeedMultiplier() {
        return this.currentSpeedMultiplier;
    }

    /**
     * Get current spawn interval
     * @returns {number}
     */
    getSpawnInterval() {
        return this.currentSpawnInterval;
    }

    /**
     * Reset to initial difficulty
     */
    reset() {
        this.baseSpeedMultiplier = 1.0;
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;

        console.log('[Difficulty] Reset to initial values');
    }

    /**
     * Get difficulty stats
     * @returns {Object}
     */
    getStats() {
        return {
            baseSpeedMultiplier: this.baseSpeedMultiplier,
            currentSpeedMultiplier: this.currentSpeedMultiplier,
            spawnInterval: this.currentSpawnInterval,
            maxSpeed: DIFFICULTY_CONFIG.maxSpeedMultiplier,
            minSpawnInterval: DIFFICULTY_CONFIG.minSpawnInterval
        };
    }
}
