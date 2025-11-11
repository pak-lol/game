import * as PIXI from 'pixi.js';

/**
 * Beautiful score popup that shows score gained
 * Animates upward and fades out
 */
export class ScorePopup {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scoreValue - Score value to display
     * @param {string} color - Color of the text
     * @param {string} itemName - Name of the item (optional)
     */
    constructor(x, y, scoreValue, color = '#4CAF50', itemName = '') {
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;

        this.lifetime = 0;
        this.maxLifetime = 120; // Frames (about 2 seconds at 60fps)
        this.active = true;
        this.velocityY = -2; // Move upward

        // Create score text with beautiful styling
        const scoreText = `+${scoreValue}`;

        this.scoreText = new PIXI.Text({
            text: scoreText,
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: color,
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 6 },
                dropShadow: {
                    color: '#000000',
                    blur: 8,
                    angle: Math.PI / 4,
                    distance: 4
                },
                align: 'center'
            }
        });
        this.scoreText.anchor.set(0.5, 0.5);

        // Add glow effect
        this.glowCircle = new PIXI.Graphics();
        this.updateGlow(color);

        this.container.addChild(this.glowCircle);
        this.container.addChild(this.scoreText);

        // If item name provided, show it below
        if (itemName) {
            this.itemText = new PIXI.Text({
                text: itemName.toUpperCase(),
                style: {
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fill: '#FFFFFF',
                    fontWeight: 'bold',
                    stroke: { color: '#000000', width: 3 },
                    align: 'center'
                }
            });
            this.itemText.anchor.set(0.5, 0.5);
            this.itemText.y = 35;
            this.container.addChild(this.itemText);
        }

        // Start with scale animation
        this.container.scale.set(0.5);
        this.scalePhase = 0;
    }

    /**
     * Update glow effect
     * @param {string} color - Hex color
     */
    updateGlow(color) {
        this.glowCircle.clear();

        // Convert hex to number
        const colorNum = parseInt(color.replace('#', ''), 16);

        // Outer glow
        this.glowCircle.circle(0, 0, 40);
        this.glowCircle.fill({ color: colorNum, alpha: 0.3 });

        // Middle glow
        this.glowCircle.circle(0, 0, 25);
        this.glowCircle.fill({ color: colorNum, alpha: 0.2 });

        // Inner glow
        this.glowCircle.circle(0, 0, 15);
        this.glowCircle.fill({ color: colorNum, alpha: 0.1 });
    }

    /**
     * Update animation
     * @param {number} delta - Delta time
     * @returns {boolean} - True if still active
     */
    update(delta = 1) {
        if (!this.active) return false;

        this.lifetime += delta;

        // Scale in animation (first 10 frames)
        if (this.scalePhase < 10) {
            this.scalePhase += delta;
            const scale = this.easeOutBack(Math.min(this.scalePhase / 10, 1));
            this.container.scale.set(scale);
        }

        // Move upward
        this.container.y += this.velocityY * delta;

        // Slow down over time
        this.velocityY *= 0.98;

        // Fade out in last 30 frames
        const fadeStartFrame = this.maxLifetime - 30;
        if (this.lifetime > fadeStartFrame) {
            const fadeProgress = (this.lifetime - fadeStartFrame) / 30;
            this.container.alpha = 1 - fadeProgress;
        }

        // Pulse glow effect
        const pulseScale = 1 + Math.sin(this.lifetime * 0.2) * 0.15;
        this.glowCircle.scale.set(pulseScale);

        // Check if lifetime exceeded
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
            return false;
        }

        return true;
    }

    /**
     * Ease out back function for bounce effect
     */
    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    /**
     * Check if popup is active
     * @returns {boolean}
     */
    isActive() {
        return this.active;
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
        if (this.container.parent === stage) {
            stage.removeChild(this.container);
        }
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        if (this.scoreText) this.scoreText.destroy();
        if (this.itemText) this.itemText.destroy();
        if (this.glowCircle) this.glowCircle.destroy();
        if (this.container) this.container.destroy({ children: true });
    }
}
