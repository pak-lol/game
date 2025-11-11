import * as PIXI from 'pixi.js';
import { GAME_CONFIG, ITEM_CONFIG } from '../config.js';

export class FallingItem {
    constructor(texture, type, label) {
        this.type = type;
        this.container = new PIXI.Container();
        
        // Create sprite
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 0.5);
        
        const scale =
            Math.random() * (ITEM_CONFIG.maxScale - ITEM_CONFIG.minScale) +
            ITEM_CONFIG.minScale;
        this.sprite.scale.set(scale);
        
        // Create text label with better visibility
        const isGoodItem = type === GAME_CONFIG.itemTypes.VORINIO_DUMAI;
        this.text = new PIXI.Text({
            text: label.toUpperCase(),
            style: {
                fontFamily: 'Arial',
                fontSize: ITEM_CONFIG.getFontSize(),
                fill: isGoodItem ? '#00FF00' : '#FF6B6B',
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
        
        // Movement properties
        this.speed = Math.random() * (ITEM_CONFIG.maxSpeed - ITEM_CONFIG.minSpeed) + ITEM_CONFIG.minSpeed;
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

    isScoreable() {
        return this.type === GAME_CONFIG.itemTypes.VORINIO_DUMAI;
    }
}
