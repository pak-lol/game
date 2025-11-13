/**
 * PowerUpEffectManager - Manages all power-up effects in a clean, extensible way
 *
 * How to add a new effect type:
 * 1. Add effect handler method (e.g., applyInvisibilityEffect)
 * 2. Add restore method (e.g., removeInvisibilityEffect)
 * 3. Register in effectHandlers map
 * 4. Add to powerups.json with the new effectType
 */
export class PowerUpEffectManager {
    constructor(game) {
        this.game = game;

        // Active effects tracking
        this.activeEffects = new Map(); // effectType -> { config, startTime, endTime }

        // Effect handlers registry
        this.effectHandlers = new Map([
            ['speed_multiplier', {
                apply: (config) => this.applySpeedMultiplier(config),
                remove: () => this.removeSpeedMultiplier()
            }],
            ['score_multiplier', {
                apply: (config) => this.applyScoreMultiplier(config),
                remove: () => this.removeScoreMultiplier()
            }],
            ['clear_chimke', {
                apply: (config) => this.applyClearChimke(config),
                remove: () => this.removeClearChimke()
            }],
            ['invincibility', {
                apply: (config) => this.applyInvincibility(config),
                remove: () => this.removeInvincibility()
            }],
            ['freeze_items', {
                apply: (config) => this.applyFreezeItems(config),
                remove: () => this.removeFreezeItems()
            }],
            ['double_points', {
                apply: (config) => this.applyDoublePoints(config),
                remove: () => this.removeDoublePoints()
            }]
        ]);

        // Saved states for restoration
        this.savedStates = {
            speedMultiplier: 1.0,
            scoreMultiplier: 1.0,
            invincible: false,
            chimkeBlocked: false,
            itemsFrozen: false
        };
    }

    /**
     * Apply a power-up effect
     * @param {Object} config - Power-up configuration
     */
    applyEffect(config) {
        const effectType = config.effectType;
        const handler = this.effectHandlers.get(effectType);

        console.log('[PowerUpEffects] applyEffect called:', {
            effectType,
            hasHandler: !!handler,
            hasPowerUpDisplay: !!this.game.powerUpDisplay,
            config
        });

        if (!handler) {
            console.error(`[PowerUpEffects] Unknown effect type: ${effectType}`);
            return false;
        }

        // Check if same effect type is already active
        const existingEffect = this.activeEffects.get(effectType);

        if (existingEffect) {
            // Restart timer for existing effect
            console.log(`[PowerUpEffects] ${effectType} already active - restarting timer`);
            existingEffect.endTime = Date.now() + config.duration;

            // Update display UI (new multi-power-up display)
            if (this.game.powerUpDisplay) {
                console.log('[PowerUpEffects] Updating existing power-up in display');
                this.game.powerUpDisplay.addPowerUp(effectType, config, config.duration);
            } else {
                console.warn('[PowerUpEffects] powerUpDisplay not available!');
            }

            return true;
        }

        // Apply new effect
        console.log(`[PowerUpEffects] Applying ${effectType} for ${config.duration}ms`);

        try {
            handler.apply(config);

            // Track active effect
            this.activeEffects.set(effectType, {
                config,
                startTime: Date.now(),
                endTime: Date.now() + config.duration
            });

            // Add to display UI (new multi-power-up display)
            if (this.game.powerUpDisplay) {
                console.log('[PowerUpEffects] Adding power-up to display');
                this.game.powerUpDisplay.addPowerUp(effectType, config, config.duration);
            } else {
                console.warn('[PowerUpEffects] powerUpDisplay not available!');
            }

            return true;
        } catch (error) {
            console.error(`[PowerUpEffects] Error applying ${effectType}:`, error);
            return false;
        }
    }

    /**
     * Update active effects (call every frame)
     * @param {number} currentTime - Current timestamp
     */
    update(currentTime) {
        const expiredEffects = [];

        // Check for expired effects
        for (const [effectType, effect] of this.activeEffects) {
            if (currentTime >= effect.endTime) {
                expiredEffects.push(effectType);
            }
        }

        // Remove expired effects
        for (const effectType of expiredEffects) {
            this.removeEffect(effectType);
        }
    }

    /**
     * Remove an effect
     * @param {string} effectType
     */
    removeEffect(effectType) {
        const effect = this.activeEffects.get(effectType);
        if (!effect) return;

        console.log(`[PowerUpEffects] Removing ${effectType}`);

        const handler = this.effectHandlers.get(effectType);
        if (handler && handler.remove) {
            try {
                handler.remove();
            } catch (error) {
                console.error(`[PowerUpEffects] Error removing ${effectType}:`, error);
            }
        }

        // Remove from display
        if (this.game.powerUpDisplay) {
            this.game.powerUpDisplay.removePowerUp(effectType);
        }

        this.activeEffects.delete(effectType);
    }

    /**
     * Check if an effect is active
     * @param {string} effectType
     * @returns {boolean}
     */
    isEffectActive(effectType) {
        return this.activeEffects.has(effectType);
    }

    /**
     * Clear all active effects
     */
    clearAll() {
        for (const effectType of this.activeEffects.keys()) {
            this.removeEffect(effectType);
        }

        // Clear display
        if (this.game.powerUpDisplay) {
            this.game.powerUpDisplay.clearAll();
        }
    }

    // ============================================================
    // EFFECT IMPLEMENTATIONS
    // ============================================================

    /**
     * Speed Multiplier Effect - Slows down falling items
     */
    applySpeedMultiplier(config) {
        // Save current base speed from difficulty manager
        if (this.game.difficultyManager) {
            this.savedStates.speedMultiplier = this.game.difficultyManager.getBaseSpeedMultiplier();
        } else {
            this.savedStates.speedMultiplier = this.game.currentSpeedMultiplier;
        }

        // Apply slowdown to base difficulty speed
        const newSpeed = this.savedStates.speedMultiplier * config.effectValue;
        this.game.currentSpeedMultiplier = newSpeed;
        
        // Update difficulty manager's current speed
        if (this.game.difficultyManager) {
            this.game.difficultyManager.setSpeedMultiplier(newSpeed);
        }

        // Update all existing items
        this.game.updateFallingItemsSpeeds();

        // Update UI
        if (this.game.speedDisplay) {
            this.game.speedDisplay.setSpeed(this.game.currentSpeedMultiplier);
        }

        console.log(`[PowerUpEffects] Speed: ${this.savedStates.speedMultiplier.toFixed(2)}x -> ${this.game.currentSpeedMultiplier.toFixed(2)}x`);
    }

    removeSpeedMultiplier() {
        // Restore to current base difficulty speed (which may have increased during power-up)
        if (this.game.difficultyManager) {
            const currentBaseSpeed = this.game.difficultyManager.getBaseSpeedMultiplier();
            this.game.currentSpeedMultiplier = currentBaseSpeed;
            this.game.difficultyManager.setSpeedMultiplier(currentBaseSpeed);
        } else {
            this.game.currentSpeedMultiplier = this.savedStates.speedMultiplier;
        }
        
        this.game.updateFallingItemsSpeeds();

        if (this.game.speedDisplay) {
            this.game.speedDisplay.setSpeed(this.game.currentSpeedMultiplier);
        }

        console.log(`[PowerUpEffects] Speed restored to ${this.game.currentSpeedMultiplier.toFixed(2)}x`);
    }

    /**
     * Score Multiplier Effect - Multiplies all scores
     */
    applyScoreMultiplier(config) {
        this.savedStates.scoreMultiplier = this.game.currentScoreMultiplier;
        this.game.currentScoreMultiplier = config.effectValue;

        console.log(`[PowerUpEffects] Score multiplier: x${config.effectValue}`);
    }

    removeScoreMultiplier() {
        this.game.currentScoreMultiplier = this.savedStates.scoreMultiplier;
        console.log(`[PowerUpEffects] Score multiplier restored to x${this.game.currentScoreMultiplier}`);
    }

    /**
     * Clear Chimke Effect - Removes all chimke and prevents spawning
     */
    applyClearChimke(config) {
        this.savedStates.chimkeBlocked = this.game.chimkeBlockActive;
        this.game.chimkeBlockActive = true;

        // Clear all existing chimke from screen
        this.clearAllChimke();

        console.log(`[PowerUpEffects] Chimke cleared and blocked for ${config.duration}ms`);
    }

    removeClearChimke() {
        // Always restore to false (default state) - chimke should spawn after effect ends
        this.game.chimkeBlockActive = false;
        console.log(`[PowerUpEffects] Chimke spawning restored (chimkeBlockActive = false)`);
    }

    clearAllChimke() {
        // Get list of chimke items to remove
        const itemsToRemove = [];

        for (const item of this.game.fallingItems) {
            // Extra validation to ensure item is valid
            if (!item || !item.getConfig || !item.isGameOver || !item.getPosition) {
                console.warn('[PowerUpEffects] Invalid item encountered, skipping');
                continue;
            }

            if (item.isGameOver()) {
                itemsToRemove.push(item);
            }
        }

        // Remove items and create effects
        for (const item of itemsToRemove) {
            const position = item.getPosition();
            const config = item.getConfig();

            // Clean up any temporary properties before removal
            if (item._savedSpeed !== undefined) {
                delete item._savedSpeed;
            }

            // Ensure item is fully stopped
            item.speed = 0;

            // Create particle effect (if valid config)
            if (config && config.particleColor) {
                this.game.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);
            }
        }

        // Now remove all marked items using EntityManager
        const clearedCount = this.game.entityManager.removeItemsBy(item => {
            return itemsToRemove.includes(item);
        });

        console.log(`[PowerUpEffects] Cleared ${clearedCount} chimke items`);
    }

    /**
     * Invincibility Effect - Can't die from chimke
     */
    applyInvincibility(config) {
        this.savedStates.invincible = this.game.invincible || false;
        this.game.invincible = true;

        // Visual feedback - make player glow/flash
        if (this.game.player && this.game.player.sprite) {
            this.startInvincibilityVisual();
        }

        console.log(`[PowerUpEffects] Invincibility activated for ${config.duration}ms`);
    }

    removeInvincibility() {
        this.game.invincible = false;

        // Remove visual effect
        if (this.game.player && this.game.player.sprite) {
            this.stopInvincibilityVisual();
        }

        console.log(`[PowerUpEffects] Invincibility removed`);
    }

    startInvincibilityVisual() {
        const sprite = this.game.player.sprite;
        if (!sprite) return;

        // Store original tint
        if (!sprite._originalTint) {
            sprite._originalTint = sprite.tint;
        }

        // Create flashing effect
        sprite.tint = 0xFFD700; // Gold color
        sprite.alpha = 0.8;
    }

    stopInvincibilityVisual() {
        const sprite = this.game.player.sprite;
        if (!sprite) return;

        // Restore original appearance
        sprite.tint = sprite._originalTint || 0xFFFFFF;
        sprite.alpha = 1.0;
    }

    /**
     * Freeze Items Effect - Stops all items from falling
     */
    applyFreezeItems(config) {
        this.savedStates.itemsFrozen = this.game.itemsFrozen || false;
        this.game.itemsFrozen = true;

        // Save current speeds and set to 0
        for (const item of this.game.fallingItems) {
            if (item && item.speed !== undefined) {
                if (!item._savedSpeed) {
                    item._savedSpeed = item.speed;
                }
                item.speed = 0;
            }
        }

        console.log(`[PowerUpEffects] All items frozen for ${config.duration}ms`);
    }

    removeFreezeItems() {
        this.game.itemsFrozen = false;

        // Restore speeds with safety checks
        for (const item of this.game.fallingItems) {
            if (item && item._savedSpeed !== undefined) {
                // Ensure saved speed is valid
                if (item._savedSpeed > 0 && isFinite(item._savedSpeed)) {
                    item.speed = item._savedSpeed;
                } else {
                    // Fallback to current speed multiplier if saved speed is invalid
                    const baseSpeed = 2.5; // Default base speed
                    item.speed = baseSpeed * this.game.currentSpeedMultiplier;
                }
                delete item._savedSpeed;
            } else if (item && (item.speed === 0 || !isFinite(item.speed))) {
                // Fix any items that got stuck with zero speed
                const baseSpeed = 2.5;
                item.speed = baseSpeed * this.game.currentSpeedMultiplier;
            }
        }

        console.log(`[PowerUpEffects] Items unfrozen`);
    }

    /**
     * Double Points Effect - Same as score_multiplier but can be separate powerup
     */
    applyDoublePoints(config) {
        this.applyScoreMultiplier({ ...config, effectValue: 2.0 });
    }

    removeDoublePoints() {
        this.removeScoreMultiplier();
    }

    /**
     * Cleanup
     */
    destroy() {
        this.clearAll();
        this.effectHandlers.clear();
        this.activeEffects.clear();
    }
}
