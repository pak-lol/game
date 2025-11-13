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
                top: 80px;
                right: 10px;
                z-index: 100;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-width: 320px;
            }

            .power-up-card {
                background: linear-gradient(135deg,
                    rgba(0, 0, 0, 0.95) 0%,
                    rgba(30, 30, 30, 0.95) 100%);
                border: 2px solid;
                border-radius: 16px;
                padding: 12px;
                box-shadow:
                    0 8px 24px rgba(0, 0, 0, 0.6),
                    0 0 20px var(--glow-color);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 200px;
                max-width: 300px;
                animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .power-up-card.removing {
                animation: slideOut 0.3s ease-out forwards;
            }

            @keyframes slideOut {
                to {
                    opacity: 0;
                    transform: translateX(100%) scale(0.8);
                }
            }

            .power-up-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg,
                    transparent 0%,
                    var(--glow-color) 50%,
                    transparent 100%);
                opacity: 0.1;
                animation: shimmer 3s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            .power-up-icon-container {
                font-size: 40px;
                line-height: 1;
                animation: float 2s ease-in-out infinite;
                flex-shrink: 0;
                filter: drop-shadow(0 0 8px var(--glow-color));
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }

            .power-up-details {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .power-up-name {
                font-family: Arial, sans-serif;
                font-size: 13px;
                font-weight: bold;
                color: #FFFFFF;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
            }

            .power-up-timer-display {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .power-up-time-text {
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
                color: var(--timer-color);
                text-shadow:
                    0 0 8px var(--glow-color),
                    0 2px 4px rgba(0, 0, 0, 0.8);
                min-width: 50px;
            }

            .power-up-time-text.warning {
                --timer-color: #FFA500;
                animation: pulse-warning 0.8s ease-in-out infinite;
            }

            .power-up-time-text.danger {
                --timer-color: #FF6B6B;
                animation: pulse-danger 0.5s ease-in-out infinite;
            }

            @keyframes pulse-warning {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.9; }
            }

            @keyframes pulse-danger {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }

            .power-up-progress-container {
                flex: 1;
                height: 6px;
                background: rgba(51, 51, 51, 0.5);
                border-radius: 3px;
                overflow: hidden;
                position: relative;
            }

            .power-up-progress-bar {
                height: 100%;
                background: linear-gradient(90deg,
                    var(--progress-color-start) 0%,
                    var(--progress-color-end) 100%);
                border-radius: 3px;
                transition: width 0.1s linear;
                box-shadow: 0 0 8px var(--glow-color);
                position: relative;
            }

            .power-up-progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.3) 50%,
                    transparent 100%);
                animation: progressShine 2s infinite;
            }

            @keyframes progressShine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
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
                    top: 60px;
                    right: 5px;
                    gap: 6px;
                    max-width: 260px;
                }

                .power-up-card {
                    padding: 10px;
                    gap: 10px;
                    min-width: 180px;
                }

                .power-up-icon-container {
                    font-size: 32px;
                }

                .power-up-name {
                    font-size: 11px;
                }

                .power-up-time-text {
                    font-size: 16px;
                    min-width: 45px;
                }

                .power-up-progress-container {
                    height: 5px;
                }
            }

            @media (max-width: 350px) {
                .power-up-display-container {
                    top: 50px;
                    max-width: 220px;
                }

                .power-up-card {
                    min-width: 160px;
                    padding: 8px;
                }

                .power-up-icon-container {
                    font-size: 28px;
                }

                .power-up-name {
                    font-size: 10px;
                }

                .power-up-time-text {
                    font-size: 14px;
                    min-width: 40px;
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
            <div class="power-up-icon-container">${config.icon || '✨'}</div>
            <div class="power-up-details">
                <div class="power-up-name">${i18n.t(config.nameKey)}</div>
                <div class="power-up-timer-display">
                    <div class="power-up-time-text">5.0s</div>
                    <div class="power-up-progress-container">
                        <div class="power-up-progress-bar" style="width: 100%"></div>
                    </div>
                </div>
            </div>
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
        const seconds = (remaining / 1000).toFixed(1);

        const timeElement = powerUp.element.querySelector('.power-up-time-text');
        const progressBar = powerUp.element.querySelector('.power-up-progress-bar');

        // Update time
        timeElement.textContent = seconds + 's';

        // Update state classes
        timeElement.classList.remove('warning', 'danger');
        if (progress < 0.3) {
            timeElement.classList.add('danger');
        } else if (progress < 0.6) {
            timeElement.classList.add('warning');
        }

        // Update progress bar
        progressBar.style.width = (progress * 100) + '%';
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
