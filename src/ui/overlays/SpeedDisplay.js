import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config.js';
import { i18n } from '../../utils/i18n.js';

/**
 * Beautiful speed indicator display
 */
export class SpeedDisplay {
    constructor() {
        this.container = new PIXI.Container();
        this.speedMultiplier = 1.0;

        // Responsive sizing
        const sizes = this.getResponsiveSizes();

        // Create background
        this.background = new PIXI.Graphics();
        this.container.addChild(this.background);

        // Create speed icon
        this.iconText = new PIXI.Text({
            text: '⚡',
            style: {
                fontSize: sizes.iconSize,
                fill: '#FFD700'
            }
        });
        this.container.addChild(this.iconText);

        // Create label text
        this.labelText = new PIXI.Text({
            text: i18n.t('game.speed'),
            style: {
                fontFamily: 'Arial',
                fontSize: sizes.labelSize,
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
                fontSize: sizes.valueSize,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: { color: '#1B5E20', width: 2 }
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

        // Store sizes for later use
        this.sizes = sizes;

        this.updateDisplay();
        this.updateLayout();
    }

    /**
     * Get responsive sizes based on screen width
     */
    getResponsiveSizes() {
        const screenWidth = GAME_CONFIG.width;

        // Small screens (< 360)
        if (screenWidth < 360) {
            return {
                iconSize: 18,
                labelSize: 11,
                valueSize: 16,
                width: 130,
                height: 50
            };
        }
        // Medium screens (360-430)
        if (screenWidth < 430) {
            return {
                iconSize: 20,
                labelSize: 12,
                valueSize: 18,
                width: 145,
                height: 55
            };
        }
        // Large screens (> 430)
        return {
            iconSize: 22,
            labelSize: 13,
            valueSize: 20,
            width: 160,
            height: 60
        };
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

        // Responsive bar sizing
        const barWidth = this.sizes.width < 140 ? 6 : 7;
        const baseHeight = this.sizes.width < 140 ? 12 : 14;
        const barSpacing = this.sizes.width < 140 ? 9 : 10;
        const startX = this.sizes.width < 140 ? 70 : 80;
        const barY = this.sizes.height - 12;

        for (let i = 0; i < 5; i++) {
            const bar = this.speedBars[i];
            bar.clear();

            const barHeight = baseHeight - (i * 2);
            const barX = startX + (i * barSpacing);

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

        const width = this.sizes.width;
        const height = this.sizes.height;
        const x = 0;
        const y = 0;

        // Get color based on speed
        const speedColor = this.getSpeedColor(this.speedMultiplier);
        const colorValue = parseInt(speedColor.replace('#', '0x'));

        // Outer glow
        this.background.roundRect(x - 2, y - 2, width + 4, height + 4, 10);
        this.background.fill({ color: colorValue, alpha: 0.2 });

        // Main background
        this.background.roundRect(x, y, width, height, 8);
        this.background.fill({ color: 0x000000, alpha: 0.7 });

        // Border with speed color
        this.background.roundRect(x, y, width, height, 8);
        this.background.stroke({ color: colorValue, width: 2, alpha: 0.8 });
    }

    /**
     * Update layout positions
     */
    updateLayout() {
        const screenWidth = GAME_CONFIG.width;

        // Position in top-right corner with responsive margin
        const margin = this.sizes.width < 140 ? 10 : 15;
        this.container.x = screenWidth - this.sizes.width - margin;
        this.container.y = 10;

        // Icon position
        this.iconText.x = 8;
        this.iconText.y = 6;

        // Label position
        const labelX = this.sizes.width < 140 ? 30 : 35;
        this.labelText.x = labelX;
        this.labelText.y = this.sizes.height < 55 ? 8 : 10;

        // Value position
        this.valueText.x = labelX;
        this.valueText.y = this.sizes.height < 55 ? 22 : 26;
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
