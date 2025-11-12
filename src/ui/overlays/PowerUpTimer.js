import { configManager } from '../../managers/ConfigManager.js';
import { i18n } from '../../utils/i18n.js';

/**
 * HTML-based power-up timer display with countdown
 * Provides better text handling and responsive design
 */
export class PowerUpTimer {
    constructor() {
        this.active = false;
        this.duration = 0;
        this.elapsed = 0;
        this.powerUpType = '';
        this.animationFrame = null;

        // Create HTML container
        this.element = document.createElement('div');
        this.element.id = 'powerUpTimer';
        this.element.className = 'hidden';
        this.element.innerHTML = `
            <div class="power-up-timer-container">
                <div class="power-up-content">
                    <div class="power-up-icon">✨</div>
                    <div class="power-up-info">
                        <div class="power-up-label"></div>
                        <div class="power-up-description"></div>
                    </div>
                    <div class="power-up-time">5.0s</div>
                </div>
                <div class="power-up-progress-bar">
                    <div class="power-up-progress-fill"></div>
                </div>
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Cache element references
        this.iconElement = this.element.querySelector('.power-up-icon');
        this.labelElement = this.element.querySelector('.power-up-label');
        this.descriptionElement = this.element.querySelector('.power-up-description');
        this.timeElement = this.element.querySelector('.power-up-time');
        this.progressFillElement = this.element.querySelector('.power-up-progress-fill');
    }

    addStyles() {
        if (document.getElementById('powerUpTimerStyles')) return;

        const style = document.createElement('style');
        style.id = 'powerUpTimerStyles';
        style.textContent = `
            #powerUpTimer {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 100;
                pointer-events: none;
                max-width: calc(100% - 40px);
            }

            #powerUpTimer.hidden {
                display: none;
            }

            .power-up-timer-container {
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%);
                border: 2px solid rgba(255, 215, 0, 0.8);
                border-radius: 12px;
                padding: 12px 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 
                            0 0 20px rgba(255, 215, 0, 0.3);
                backdrop-filter: blur(10px);
                min-width: 280px;
                max-width: 100%;
                box-sizing: border-box;
            }

            .power-up-content {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
            }

            .power-up-icon {
                font-size: 36px;
                line-height: 1;
                animation: pulse 1.5s ease-in-out infinite;
                flex-shrink: 0;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .power-up-info {
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }

            .power-up-label {
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: bold;
                color: #FFFFFF;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .power-up-description {
                font-family: Arial, sans-serif;
                font-size: 11px;
                color: #FFD700;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                max-height: 2.6em;
            }

            .power-up-time {
                font-family: Arial, sans-serif;
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50;
                text-shadow: 0 0 10px rgba(76, 175, 80, 0.5),
                            0 2px 4px rgba(0, 0, 0, 0.8);
                flex-shrink: 0;
                min-width: 60px;
                text-align: right;
            }

            .power-up-time.warning {
                color: #FFA500;
            }

            .power-up-time.danger {
                color: #FF6B6B;
                animation: blink 0.5s ease-in-out infinite;
            }

            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }

            .power-up-progress-bar {
                width: 100%;
                height: 6px;
                background: rgba(51, 51, 51, 0.5);
                border-radius: 3px;
                overflow: hidden;
            }

            .power-up-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%);
                border-radius: 3px;
                transition: width 0.1s linear, background 0.3s ease;
                box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
            }

            .power-up-progress-fill.warning {
                background: linear-gradient(90deg, #FFA500 0%, #FFB84D 100%);
                box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
            }

            .power-up-progress-fill.danger {
                background: linear-gradient(90deg, #FF6B6B 0%, #FF8787 100%);
                box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
            }

            /* Responsive adjustments */
            @media (max-width: 400px) {
                .power-up-timer-container {
                    min-width: 240px;
                    padding: 10px 12px;
                }

                .power-up-icon {
                    font-size: 28px;
                }

                .power-up-label {
                    font-size: 12px;
                }

                .power-up-description {
                    font-size: 10px;
                }

                .power-up-time {
                    font-size: 20px;
                    min-width: 50px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Start power-up timer
     * @param {string} powerUpId - Power-up ID from config
     * @param {number} duration - Duration in milliseconds
     */
    start(powerUpId, duration) {
        const config = configManager.getPowerup(powerUpId);
        if (!config) {
            console.error(`[PowerUpTimer] Power-up config not found: ${powerUpId}`);
            return;
        }

        this.active = true;
        this.powerUpType = powerUpId;
        this.duration = duration;
        this.elapsed = 0;

        // Set display from config
        this.iconElement.textContent = config.icon || '✨';
        this.labelElement.textContent = i18n.t(config.nameKey);
        this.descriptionElement.textContent = i18n.t(config.descriptionKey);

        // Show element
        this.element.classList.remove('hidden');

        this.updateDisplay();
    }

    /**
     * Stop the timer
     */
    stop() {
        this.active = false;
        this.element.classList.add('hidden');
    }

    /**
     * Update timer (call in game loop)
     * @param {number} delta - Delta time in milliseconds
     */
    update(delta) {
        if (!this.active) return false;

        this.elapsed += delta;

        if (this.elapsed >= this.duration) {
            this.stop();
            return false; // Timer finished
        }

        this.updateDisplay();
        return true; // Timer still running
    }

    /**
     * Update display with current time
     */
    updateDisplay() {
        const remaining = Math.max(0, this.duration - this.elapsed);
        const seconds = (remaining / 1000).toFixed(1);

        this.timeElement.textContent = seconds + 's';

        // Update color based on remaining time
        const progress = remaining / this.duration;
        
        // Remove all state classes
        this.timeElement.classList.remove('warning', 'danger');
        this.progressFillElement.classList.remove('warning', 'danger');

        if (progress < 0.3) {
            this.timeElement.classList.add('danger');
            this.progressFillElement.classList.add('danger');
        } else if (progress < 0.6) {
            this.timeElement.classList.add('warning');
            this.progressFillElement.classList.add('warning');
        }

        // Update progress bar
        this.progressFillElement.style.width = (progress * 100) + '%';
    }

    /**
     * Update position (for responsive layout)
     */
    updatePosition() {
        // Position is handled by CSS, but this method is kept for compatibility
    }

    /**
     * Check if timer is active
     * @returns {boolean}
     */
    isActive() {
        return this.active;
    }

    /**
     * Get remaining time in milliseconds
     * @returns {number}
     */
    getRemainingTime() {
        return Math.max(0, this.duration - this.elapsed);
    }

    /**
     * Add to stage (attach to DOM)
     * @param {PIXI.Container} stage - Not used, kept for compatibility
     */
    addToStage(stage) {
        // Attach to DOM instead of PIXI stage
        if (!this.element.parentElement) {
            document.body.appendChild(this.element);
        }
    }

    /**
     * Remove from stage (detach from DOM)
     * @param {PIXI.Container} stage - Not used, kept for compatibility
     */
    removeFromStage(stage) {
        this.stop();
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        this.stop();
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
        // Clear element references
        this.iconElement = null;
        this.labelElement = null;
        this.descriptionElement = null;
        this.timeElement = null;
        this.progressFillElement = null;
        this.element = null;
    }
}
