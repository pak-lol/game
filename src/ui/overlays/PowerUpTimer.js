import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config.js';
import { configManager } from '../../managers/ConfigManager.js';
import { i18n } from '../../utils/i18n.js';

/**
 * Beautiful power-up timer display with countdown
 */
export class PowerUpTimer {
    constructor() {
        this.container = new PIXI.Container();
        this.active = false;
        this.duration = 0;
        this.elapsed = 0;
        this.powerUpType = '';

        // Create background
        this.background = new PIXI.Graphics();
        this.container.addChild(this.background);

        // Create icon
        this.iconText = new PIXI.Text({
            text: '🪣',
            style: {
                fontSize: 32,
                fill: '#FFD700'
            }
        });
        this.container.addChild(this.iconText);

        // Create label text
        this.labelText = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        this.container.addChild(this.labelText);

        // Create description text
        this.descriptionText = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: '#FFD700',
                fontWeight: 'normal'
            }
        });
        this.container.addChild(this.descriptionText);

        // Create timer text
        this.timerText = new PIXI.Text({
            text: '5.0',
            style: {
                fontFamily: 'Arial',
                fontSize: 28,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: { color: '#1B5E20', width: 3 }
            }
        });
        this.container.addChild(this.timerText);

        // Create progress bar background
        this.progressBarBg = new PIXI.Graphics();
        this.container.addChild(this.progressBarBg);

        // Create progress bar fill
        this.progressBarFill = new PIXI.Graphics();
        this.container.addChild(this.progressBarFill);

        // Animation properties
        this.pulseScale = 1.0;
        this.pulseDirection = 1;

        this.container.visible = false;
        this.updateLayout();
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
        this.container.visible = true;

        // Set display from config
        this.iconText.text = config.icon || '✨';
        this.labelText.text = i18n.t(config.nameKey);
        this.descriptionText.text = i18n.t(config.descriptionKey);

        this.updateDisplay();
    }

    /**
     * Stop the timer
     */
    stop() {
        this.active = false;
        this.container.visible = false;
    }

    /**
     * Update timer (call in game loop)
     * @param {number} delta - Delta time in milliseconds
     */
    update(delta) {
        if (!this.active) return;

        this.elapsed += delta;

        if (this.elapsed >= this.duration) {
            this.stop();
            return false; // Timer finished
        }

        this.updateDisplay();
        this.animate(delta / 1000); // Convert to seconds for animation
        return true; // Timer still running
    }

    /**
     * Update display with current time
     */
    updateDisplay() {
        const remaining = Math.max(0, this.duration - this.elapsed);
        const seconds = (remaining / 1000).toFixed(1);

        this.timerText.text = seconds + 's';

        // Update color based on remaining time
        const progress = remaining / this.duration;
        if (progress < 0.3) {
            this.timerText.style.fill = '#FF6B6B'; // Red - Almost over
        } else if (progress < 0.6) {
            this.timerText.style.fill = '#FFA500'; // Orange - Half time
        } else {
            this.timerText.style.fill = '#4CAF50'; // Green - Good time
        }

        this.drawProgressBar();
        this.drawBackground();
    }

    /**
     * Draw background with glow
     */
    drawBackground() {
        this.background.clear();

        const width = 200;
        const height = 110;
        const x = 0;
        const y = 0;

        // Outer glow
        this.background.roundRect(x - 2, y - 2, width + 4, height + 4, 12);
        this.background.fill({ color: 0xFFD700, alpha: 0.3 });

        // Main background
        this.background.roundRect(x, y, width, height, 10);
        this.background.fill({ color: 0x000000, alpha: 0.8 });

        // Border
        this.background.roundRect(x, y, width, height, 10);
        this.background.stroke({ color: 0xFFD700, width: 2, alpha: 0.9 });
    }

    /**
     * Draw progress bar
     */
    drawProgressBar() {
        const barWidth = 170;
        const barHeight = 8;
        const barX = 15;
        const barY = 90;

        const progress = 1 - (this.elapsed / this.duration);

        // Background
        this.progressBarBg.clear();
        this.progressBarBg.roundRect(barX, barY, barWidth, barHeight, 4);
        this.progressBarBg.fill({ color: 0x333333, alpha: 0.5 });

        // Fill
        this.progressBarFill.clear();
        const fillWidth = barWidth * progress;

        if (fillWidth > 0) {
            this.progressBarFill.roundRect(barX, barY, fillWidth, barHeight, 4);

            // Color based on progress
            let color = 0x4CAF50; // Green
            if (progress < 0.3) color = 0xFF6B6B; // Red
            else if (progress < 0.6) color = 0xFFA500; // Orange

            this.progressBarFill.fill({ color: color, alpha: 0.9 });
        }
    }

    /**
     * Animate the display
     * @param {number} delta - Delta time in milliseconds
     */
    animate(delta) {
        // Pulse animation (normalized to 60fps)
        const normalizedDelta = delta / 16.67; // Normalize to 60fps frame time
        this.pulseScale += 0.02 * this.pulseDirection * normalizedDelta;

        if (this.pulseScale > 1.1) {
            this.pulseScale = 1.1;
            this.pulseDirection = -1;
        } else if (this.pulseScale < 1.0) {
            this.pulseScale = 1.0;
            this.pulseDirection = 1;
        }

        this.iconText.scale.set(this.pulseScale);
    }

    /**
     * Update layout positions
     */
    updateLayout() {
        const screenWidth = GAME_CONFIG.width;

        // Position in top-center
        this.container.x = (screenWidth / 2) - 100; // Center horizontally
        this.container.y = 20;

        // Icon position
        this.iconText.x = 15;
        this.iconText.y = 8;

        // Label position
        this.labelText.x = 55;
        this.labelText.y = 12;

        // Description position
        this.descriptionText.x = 55;
        this.descriptionText.y = 32;

        // Timer position
        this.timerText.x = 55;
        this.timerText.y = 52;
    }

    /**
     * Update position (for responsive layout)
     */
    updatePosition() {
        this.updateLayout();
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
     * Add to stage
     * @param {PIXI.Container} stage
     */
    addToStage(stage) {
        stage.addChild(this.container);
    }

    /**
     * Remove from stage
     * @param {PIXI.Container} stage
     */
    removeFromStage(stage) {
        stage.removeChild(this.container);
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        this.iconText.destroy();
        this.labelText.destroy();
        this.descriptionText.destroy();
        this.timerText.destroy();
        this.progressBarBg.destroy();
        this.progressBarFill.destroy();
        this.background.destroy();
        this.container.destroy({ children: true });
    }
}
