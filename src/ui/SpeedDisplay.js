import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Beautiful speed indicator display
 */
export class SpeedDisplay {
    constructor() {
        this.container = new PIXI.Container();
        this.speedMultiplier = 1.0;

        // Create background
        this.background = new PIXI.Graphics();
        this.container.addChild(this.background);

        // Create speed icon
        this.iconText = new PIXI.Text({
            text: '⚡',
            style: {
                fontSize: 28,
                fill: '#FFD700'
            }
        });
        this.container.addChild(this.iconText);

        // Create label text
        this.labelText = new PIXI.Text({
            text: i18n.t('game.speed'),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#FFFFFF',
                fontWeight: 'normal'
            }
        });
        this.container.addChild(this.labelText);

        // Create speed value text
        this.valueText = new PIXI.Text({
            text: '1.0x',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: { color: '#1B5E20', width: 3 }
            }
        });
        this.container.addChild(this.valueText);

        // Create speed bars (visual indicator)
        this.speedBars = [];
        for (let i = 0; i < 5; i++) {
            const bar = new PIXI.Graphics();
            this.speedBars.push(bar);
            this.container.addChild(bar);
        }

        // Animation properties
        this.pulseScale = 1.0;
        this.pulseDirection = 1;
        this.glowAlpha = 0.5;

        this.updateDisplay();
        this.updateLayout();
    }

    /**
     * Update the speed multiplier
     * @param {number} multiplier - Speed multiplier
     */
    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
        this.updateDisplay();
    }

    /**
     * Update the display with current speed
     */
    updateDisplay() {
        // Update value text
        this.valueText.text = `${this.speedMultiplier.toFixed(1)}x`;

        // Update color based on speed
        const speedColor = this.getSpeedColor(this.speedMultiplier);
        this.valueText.style.fill = speedColor;

        // Update icon based on speed level
        this.iconText.text = this.getSpeedIcon(this.speedMultiplier);

        // Update speed bars
        this.updateSpeedBars();

        // Redraw background with glow effect
        this.drawBackground();
    }

    /**
     * Get color based on speed
     * @param {number} speed - Speed multiplier
     * @returns {string} Color hex
     */
    getSpeedColor(speed) {
        if (speed >= 2.0) return '#FF6B6B'; // Red - Very fast
        if (speed >= 1.5) return '#FFA500'; // Orange - Fast
        if (speed >= 1.2) return '#FFD700'; // Gold - Medium
        return '#4CAF50'; // Green - Normal
    }

    /**
     * Get icon based on speed
     * @param {number} speed - Speed multiplier
     * @returns {string} Emoji icon
     */
    getSpeedIcon(speed) {
        if (speed >= 2.0) return '🔥'; // Fire - Very fast
        if (speed >= 1.5) return '⚡'; // Lightning - Fast
        if (speed >= 1.2) return '💨'; // Wind - Medium
        return '🌿'; // Leaf - Normal
    }

    /**
     * Update speed bars visual indicator
     */
    updateSpeedBars() {
        const maxSpeed = 2.5;
        const filledBars = Math.ceil((this.speedMultiplier / maxSpeed) * 5);

        for (let i = 0; i < 5; i++) {
            const bar = this.speedBars[i];
            bar.clear();

            const barWidth = 8;
            const barHeight = 15 - (i * 2);
            const barX = 95 + (i * 12);
            const barY = 52;

            if (i < filledBars) {
                // Filled bar
                const color = this.getSpeedColor(this.speedMultiplier);
                bar.roundRect(barX, barY - barHeight, barWidth, barHeight, 2);
                bar.fill({ color: parseInt(color.replace('#', '0x')), alpha: 0.8 });
            } else {
                // Empty bar
                bar.roundRect(barX, barY - barHeight, barWidth, barHeight, 2);
                bar.fill({ color: 0x333333, alpha: 0.3 });
            }
        }
    }

    /**
     * Draw background with glow effect
     */
    drawBackground() {
        this.background.clear();

        const width = 180;
        const height = 70;
        const x = 0;
        const y = 0;

        // Get color based on speed
        const speedColor = this.getSpeedColor(this.speedMultiplier);
        const colorValue = parseInt(speedColor.replace('#', '0x'));

        // Outer glow
        this.background.roundRect(x - 2, y - 2, width + 4, height + 4, 12);
        this.background.fill({ color: colorValue, alpha: 0.2 });

        // Main background
        this.background.roundRect(x, y, width, height, 10);
        this.background.fill({ color: 0x000000, alpha: 0.7 });

        // Border with speed color
        this.background.roundRect(x, y, width, height, 10);
        this.background.stroke({ color: colorValue, width: 2, alpha: 0.8 });
    }

    /**
     * Update layout positions
     */
    updateLayout() {
        const screenWidth = GAME_CONFIG.width;

        // Position in top-right corner
        this.container.x = screenWidth - 200;
        this.container.y = 20;

        // Icon position
        this.iconText.x = 10;
        this.iconText.y = 8;

        // Label position
        this.labelText.x = 45;
        this.labelText.y = 12;

        // Value position
        this.valueText.x = 45;
        this.valueText.y = 32;
    }

    /**
     * Animate the display (pulse effect on speed increase)
     */
    animate(delta = 1) {
        // Pulse animation for high speeds
        if (this.speedMultiplier > 1.5) {
            this.pulseScale += 0.02 * this.pulseDirection * delta;

            if (this.pulseScale > 1.1) {
                this.pulseScale = 1.1;
                this.pulseDirection = -1;
            } else if (this.pulseScale < 1.0) {
                this.pulseScale = 1.0;
                this.pulseDirection = 1;
            }

            this.valueText.scale.set(this.pulseScale);
            this.iconText.scale.set(this.pulseScale);
        } else {
            this.valueText.scale.set(1.0);
            this.iconText.scale.set(1.0);
        }

        // Glow animation
        this.glowAlpha += 0.02 * delta;
        if (this.glowAlpha > 1.0) this.glowAlpha = 0.5;
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
     * Update position (for responsive layout)
     */
    updatePosition() {
        this.updateLayout();
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        this.speedBars.forEach(bar => bar.destroy());
        this.speedBars = [];

        this.iconText.destroy();
        this.labelText.destroy();
        this.valueText.destroy();
        this.background.destroy();
        this.container.destroy({ children: true });
    }
}
