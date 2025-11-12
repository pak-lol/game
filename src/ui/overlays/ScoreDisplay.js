import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config.js';
import { i18n } from '../../utils/i18n.js';

export class ScoreDisplay {
    constructor() {
        this.score = 0;

        // Responsive font size based on screen width
        const fontSize = this.getResponsiveFontSize();

        this.text = new PIXI.Text({
            text: `${i18n.t('game.score')}: 0`,
            style: {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: '#1B5E20',
                strokeThickness: 2,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 3,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 2
            }
        });
        this.text.x = 10;
        this.text.y = 10;
    }

    /**
     * Get responsive font size based on screen width
     */
    getResponsiveFontSize() {
        const screenWidth = GAME_CONFIG.width;
        // Small screens (< 360): 20px
        // Medium screens (360-430): 24px
        // Large screens (> 430): 28px
        if (screenWidth < 360) return 20;
        if (screenWidth < 430) return 24;
        return 28;
    }

    increment() {
        this.score++;
        this.updateDisplay();
    }

    add(amount) {
        this.score += amount;
        this.updateDisplay();
    }

    updateDisplay() {
        this.text.text = `${i18n.t('game.score')}: ${this.score}`;
    }

    reset() {
        this.score = 0;
        this.updateDisplay();
    }

    addToStage(stage) {
        stage.addChild(this.text);
    }
}
