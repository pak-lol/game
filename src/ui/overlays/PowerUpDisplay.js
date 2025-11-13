import { configManager } from '../../managers/ConfigManager.js';
import { i18n } from '../../utils/i18n.js';

/**
 * PowerUpDisplay - Beautiful multi-power-up indicator with individual timers
 * Supports showing multiple active power-ups simultaneously
 */
export class PowerUpDisplay {
    constructor() {
        this.activePowerUps = new Map(); // effectType -> { config, endTime, element }

        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'powerUpDisplay';
        this.container.className = 'power-up-display-container';

        // Add styles
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('powerUpDisplayStyles')) return;

        const style = document.createElement('style');
        style.id = 'powerUpDisplayStyles';
        style.textContent = `
            .power-up-display-container {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 100;
                pointer-events: none;
                display: flex;
                flex-direction: row;
                gap: 6px;
                flex-wrap: wrap;
                justify-content: flex-end;
                max-width: 200px;
            }

            .power-up-card {
                background: linear-gradient(135deg,
                    rgba(0, 0, 0, 0.9) 0%,
                    rgba(20, 20, 20, 0.9) 100%);
                border: 2px solid;
                border-radius: 10px;
                padding: 6px 8px;
                box-shadow:
                    0 2px 8px rgba(0, 0, 0, 0.5),
                    0 0 12px var(--glow-color);
                backdrop-filter: blur(8px);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 3px;
                animation: slideIn 0.25s ease-out;
                position: relative;
                min-width: 50px;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: scale(0.5);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .power-up-card.removing {
                animation: slideOut 0.2s ease-out forwards;
            }

            @keyframes slideOut {
                to {
                    opacity: 0;
                    transform: scale(0.5);
                }
            }

            .power-up-icon-container {
                font-size: 24px;
                line-height: 1;
                flex-shrink: 0;
                filter: drop-shadow(0 0 4px var(--glow-color));
            }

            .power-up-time-text {
                font-family: 'Courier New', monospace;
                font-size: 11px;
                font-weight: bold;
                color: var(--timer-color);
                text-shadow:
                    0 0 4px var(--glow-color),
                    0 1px 2px rgba(0, 0, 0, 0.8);
                white-space: nowrap;
            }

            .power-up-time-text.warning {
                --timer-color: #FFA500;
            }

            .power-up-time-text.danger {
                --timer-color: #FF6B6B;
            }

            .power-up-progress-ring {
                width: 40px;
                height: 40px;
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                pointer-events: none;
            }

            .power-up-progress-circle {
                fill: none;
                stroke: var(--progress-color-start);
                stroke-width: 2;
                stroke-dasharray: 113;
                stroke-dashoffset: 0;
                transform: rotate(-90deg);
                transform-origin: 50% 50%;
                transition: stroke-dashoffset 0.1s linear;
                filter: drop-shadow(0 0 2px var(--glow-color));
            }

            /* Power-up specific colors */
            .power-up-card[data-effect="speed_multiplier"] {
                --glow-color: rgba(255, 215, 0, 0.4);
                --timer-color: #FFD700;
                --progress-color-start: #FFD700;
                --progress-color-end: #FFA500;
                border-color: rgba(255, 215, 0, 0.8);
            }

            .power-up-card[data-effect="score_multiplier"] {
                --glow-color: rgba(255, 107, 107, 0.4);
                --timer-color: #FF6B6B;
                --progress-color-start: #FF6B6B;
                --progress-color-end: #FF1744;
                border-color: rgba(255, 107, 107, 0.8);
            }

            .power-up-card[data-effect="clear_chimke"] {
                --glow-color: rgba(255, 82, 82, 0.5);
                --timer-color: #FF5252;
                --progress-color-start: #FF5252;
                --progress-color-end: #E91E63;
                border-color: rgba(255, 82, 82, 0.8);
            }

            .power-up-card[data-effect="invincibility"] {
                --glow-color: rgba(76, 175, 80, 0.4);
                --timer-color: #4CAF50;
                --progress-color-start: #4CAF50;
                --progress-color-end: #66BB6A;
                border-color: rgba(76, 175, 80, 0.8);
            }

            .power-up-card[data-effect="freeze_items"] {
                --glow-color: rgba(33, 150, 243, 0.4);
                --timer-color: #2196F3;
                --progress-color-start: #2196F3;
                --progress-color-end: #42A5F5;
                border-color: rgba(33, 150, 243, 0.8);
            }

            .power-up-card[data-effect="double_points"] {
                --glow-color: rgba(156, 39, 176, 0.4);
                --timer-color: #9C27B0;
                --progress-color-start: #9C27B0;
                --progress-color-end: #AB47BC;
                border-color: rgba(156, 39, 176, 0.8);
            }

            /* Responsive design */
            @media (max-width: 400px) {
                .power-up-display-container {
                    top: 8px;
                    right: 8px;
                    gap: 5px;
                    max-width: 160px;
                }

                .power-up-card {
                    padding: 5px 7px;
                    min-width: 46px;
                    border-radius: 8px;
                }

                .power-up-icon-container {
                    font-size: 22px;
                }

                .power-up-time-text {
                    font-size: 10px;
                }

                .power-up-progress-ring {
                    width: 36px;
                    height: 36px;
                }
            }

            @media (max-width: 350px) {
                .power-up-display-container {
                    top: 6px;
                    right: 6px;
                    gap: 4px;
                    max-width: 140px;
                }

                .power-up-card {
                    padding: 4px 6px;
                    min-width: 42px;
                }

                .power-up-icon-container {
                    font-size: 20px;
                }

                .power-up-time-text {
                    font-size: 9px;
                }

                .power-up-progress-ring {
                    width: 32px;
                    height: 32px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Add or update a power-up
     * @param {string} effectType - Effect type (e.g., 'speed_multiplier')
     * @param {Object} config - Power-up configuration
     * @param {number} duration - Duration in milliseconds
     */
    addPowerUp(effectType, config, duration) {
        console.log('[PowerUpDisplay] Adding power-up:', effectType, config.nameKey);
        const endTime = Date.now() + duration;

        // If power-up already exists, update it
        if (this.activePowerUps.has(effectType)) {
            console.log('[PowerUpDisplay] Power-up already active, updating timer');
            const existing = this.activePowerUps.get(effectType);
            existing.endTime = endTime;
            existing.config = config;
            existing.duration = duration;
            this.updatePowerUpDisplay(effectType);
            return;
        }

        // Create new power-up card
        const card = this.createPowerUpCard(effectType, config);
        this.container.appendChild(card);

        this.activePowerUps.set(effectType, {
            config,
            endTime,
            element: card,
            startTime: Date.now(),
            duration
        });

        console.log('[PowerUpDisplay] Power-up card created and added, total active:', this.activePowerUps.size);
    }

    /**
     * Create a power-up card element
     * @param {string} effectType - Effect type
     * @param {Object} config - Power-up configuration
     * @returns {HTMLElement} Card element
     */
    createPowerUpCard(effectType, config) {
        const card = document.createElement('div');
        card.className = 'power-up-card';
        card.setAttribute('data-effect', effectType);
        card.innerHTML = `
            <svg class="power-up-progress-ring" viewBox="0 0 40 40">
                <circle class="power-up-progress-circle" cx="20" cy="20" r="18"></circle>
            </svg>
            <div class="power-up-icon-container">${config.icon || '✨'}</div>
            <div class="power-up-time-text">5s</div>
        `;
        return card;
    }

    /**
     * Update display for a specific power-up
     * @param {string} effectType - Effect type to update
     */
    updatePowerUpDisplay(effectType) {
        const powerUp = this.activePowerUps.get(effectType);
        if (!powerUp) return;

        const remaining = Math.max(0, powerUp.endTime - Date.now());
        const progress = remaining / powerUp.duration;
        const seconds = Math.ceil(remaining / 1000);

        const timeElement = powerUp.element.querySelector('.power-up-time-text');
        const progressCircle = powerUp.element.querySelector('.power-up-progress-circle');

        // Update time (whole seconds only for compact display)
        timeElement.textContent = seconds + 's';

        // Update state classes
        timeElement.classList.remove('warning', 'danger');
        if (progress < 0.3) {
            timeElement.classList.add('danger');
        } else if (progress < 0.6) {
            timeElement.classList.add('warning');
        }

        // Update circular progress (113 is the circumference of r=18 circle)
        const offset = 113 * (1 - progress);
        progressCircle.style.strokeDashoffset = offset;
    }

    /**
     * Remove a power-up
     * @param {string} effectType - Effect type to remove
     */
    removePowerUp(effectType) {
        const powerUp = this.activePowerUps.get(effectType);
        if (!powerUp) return;

        // Animate removal
        powerUp.element.classList.add('removing');

        setTimeout(() => {
            if (powerUp.element.parentElement) {
                powerUp.element.parentElement.removeChild(powerUp.element);
            }
            this.activePowerUps.delete(effectType);
        }, 300);
    }

    /**
     * Update all active power-ups (call in game loop)
     * @param {number} currentTime - Current timestamp
     */
    update(currentTime) {
        const toRemove = [];

        for (const [effectType, powerUp] of this.activePowerUps) {
            if (currentTime >= powerUp.endTime) {
                toRemove.push(effectType);
            } else {
                this.updatePowerUpDisplay(effectType);
            }
        }

        // Remove expired power-ups (handled by PowerUpEffectManager)
        // Just update the display here
    }

    /**
     * Clear all power-ups
     */
    clearAll() {
        for (const effectType of this.activePowerUps.keys()) {
            this.removePowerUp(effectType);
        }
    }

    /**
     * Check if any power-ups are active
     * @returns {boolean}
     */
    hasActivePowerUps() {
        return this.activePowerUps.size > 0;
    }

    /**
     * Get count of active power-ups
     * @returns {number}
     */
    getCount() {
        return this.activePowerUps.size;
    }

    /**
     * Add to stage (attach to DOM)
     * @param {PIXI.Container} stage - Not used, kept for compatibility
     */
    addToStage(stage) {
        if (!this.container.parentElement) {
            // Append to gameContainer instead of body for proper positioning
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.appendChild(this.container);
                console.log('[PowerUpDisplay] Added to gameContainer');
            } else {
                // Fallback to body if gameContainer not found
                document.body.appendChild(this.container);
                console.log('[PowerUpDisplay] Added to body (fallback)');
            }
        }
    }

    /**
     * Remove from stage (detach from DOM)
     */
    removeFromStage() {
        this.clearAll();
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        this.clearAll();
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        this.container = null;
        this.activePowerUps.clear();
    }
}
