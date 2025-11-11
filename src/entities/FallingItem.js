import * as PIXI from 'pixi.js';
import { GAME_CONFIG, ITEM_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * FallingItem class - represents a falling item or power-up
 * Now uses item configuration for easy extensibility
 */
export class FallingItem {
    /**
     * @param {PIXI.Texture} texture - The texture to display
     * @param {Object} itemConfig - Item configuration object from ITEMS_CONFIG or POWERUPS_CONFIG
     * @param {number} speedMultiplier - Current game speed multiplier
     */
    constructor(texture, itemConfig, speedMultiplier = 1.0) {
        this.itemConfig = itemConfig;
        this.type = itemConfig.id;
        this.container = new PIXI.Container();
        this.speedMultiplier = speedMultiplier;

        // Create sprite
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 0.5);

        const scale =
            Math.random() * (ITEM_CONFIG.maxScale - ITEM_CONFIG.minScale) +
            ITEM_CONFIG.minScale;
        this.sprite.scale.set(scale);

        // Get label from item config
        const label = i18n.t(itemConfig.nameKey);
        const textColor = itemConfig.color;

        this.text = new PIXI.Text({
            text: label.toUpperCase(),
            style: {
                fontFamily: 'Arial',
                fontSize: ITEM_CONFIG.getFontSize(),
                fill: textColor,
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 5,
                align: 'center',
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 6,
                dropShadowDistance: 2,
                dropShadowAngle: Math.PI / 4
            }
        });
        this.text.anchor.set(0.5, 0.5);
        this.text.y = 40;
        
        this.container.addChild(this.sprite);
        this.container.addChild(this.text);
        
        // Set initial position
        this.container.x = Math.random() * (GAME_CONFIG.width - 80) + 40;
        this.container.y = -50;
        
        // Movement properties with speed multiplier applied
        const baseSpeed = Math.random() * (ITEM_CONFIG.baseMaxSpeed - ITEM_CONFIG.baseMinSpeed) + ITEM_CONFIG.baseMinSpeed;
        this.speed = baseSpeed * this.speedMultiplier;
        this.sprite.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * (ITEM_CONFIG.maxRotationSpeed - ITEM_CONFIG.minRotationSpeed) + ITEM_CONFIG.minRotationSpeed;
        
        // Swing animation properties
        this.swingOffset = Math.random() * Math.PI * 2;
        this.swingSpeed = Math.random() * (ITEM_CONFIG.maxSwingSpeed - ITEM_CONFIG.minSwingSpeed) + ITEM_CONFIG.minSwingSpeed;
        this.swingAmount = Math.random() * (ITEM_CONFIG.maxSwingAmount - ITEM_CONFIG.minSwingAmount) + ITEM_CONFIG.minSwingAmount;
    }

    update(delta) {
        this.container.y += this.speed * delta;
        
        // Rotate only the sprite, not the text
        this.sprite.rotation += this.rotationSpeed * delta;
        
        // Swing animation
        this.swingOffset += this.swingSpeed * delta;
        this.container.x += Math.sin(this.swingOffset) * 0.5;
    }

    isOffScreen() {
        return this.container.y > GAME_CONFIG.height + 50;
    }

    getBounds() {
        return this.container.getBounds();
    }

    addToStage(stage) {
        stage.addChild(this.container);
    }

    removeFromStage(stage) {
        stage.removeChild(this.container);
    }

    getPosition() {
        return { x: this.container.x, y: this.container.y };
    }

    /**
     * Check if this item gives score
     * @returns {boolean}
     */
    isScoreable() {
        return this.itemConfig.scoreValue > 0;
    }

    /**
     * Get the score value of this item
     * @returns {number}
     */
    getScoreValue() {
        return this.itemConfig.scoreValue || 0;
    }

    /**
     * Check if catching this item ends the game
     * @returns {boolean}
     */
    isGameOver() {
        return this.itemConfig.gameOver || false;
    }

    /**
     * Get item configuration
     * @returns {Object}
     */
    getConfig() {
        return this.itemConfig;
    }

    /**
     * Update item speed (for power-up effects)
     * @param {number} newSpeedMultiplier - New speed multiplier
     */
    updateSpeed(newSpeedMultiplier) {
        const baseSpeed = this.speed / this.speedMultiplier; // Get base speed
        this.speedMultiplier = newSpeedMultiplier;
        this.speed = baseSpeed * this.speedMultiplier; // Apply new multiplier
    }
}
