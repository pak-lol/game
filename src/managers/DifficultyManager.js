import { GAME_CONFIG, DIFFICULTY_CONFIG } from '../config.js';

/**
 * DifficultyManager - Handles game difficulty progression
 * Manages speed increases and spawn rate changes
 */
export class DifficultyManager {
    constructor() {
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.baseSpeedMultiplier = 1.0; // Used when power-ups are active
    }

    /**
     * Increase difficulty based on score
     * @returns {Object} New difficulty values
     */
    increaseDifficulty() {
        const oldSpeed = this.currentSpeedMultiplier;
        const oldInterval = this.currentSpawnInterval;

        // Increase speed multiplier
        this.currentSpeedMultiplier = Math.min(
            this.currentSpeedMultiplier + DIFFICULTY_CONFIG.speedIncreasePerScore,
            DIFFICULTY_CONFIG.maxSpeedMultiplier
        );

        // Decrease spawn interval (spawn faster)
        this.currentSpawnInterval = Math.max(
            this.currentSpawnInterval - DIFFICULTY_CONFIG.spawnRateIncrease,
            DIFFICULTY_CONFIG.minSpawnInterval
        );

        console.log(
            `[Difficulty] Speed: ${oldSpeed.toFixed(2)}x -> ${this.currentSpeedMultiplier.toFixed(2)}x | ` +
            `Spawn: ${oldInterval} -> ${this.currentSpawnInterval}`
        );

        return {
            speedMultiplier: this.currentSpeedMultiplier,
            spawnInterval: this.currentSpawnInterval
        };
    }

    /**
     * Set speed multiplier (used by power-ups)
     * @param {number} multiplier
     */
    setSpeedMultiplier(multiplier) {
        this.currentSpeedMultiplier = multiplier;
    }

    /**
     * Get current speed multiplier
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
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.baseSpeedMultiplier = 1.0;

        console.log('[Difficulty] Reset to initial values');
    }

    /**
     * Get difficulty stats
     * @returns {Object}
     */
    getStats() {
        return {
            speedMultiplier: this.currentSpeedMultiplier,
            spawnInterval: this.currentSpawnInterval,
            maxSpeed: DIFFICULTY_CONFIG.maxSpeedMultiplier,
            minSpawnInterval: DIFFICULTY_CONFIG.minSpawnInterval
        };
    }
}
