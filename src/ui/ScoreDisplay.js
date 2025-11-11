import * as PIXI from 'pixi.js';
import { i18n } from '../utils/i18n.js';

export class ScoreDisplay {
    constructor() {
        this.score = 0;
        this.text = new PIXI.Text({
            text: `${i18n.t('game.score')}: 0`,
            style: {
                fontFamily: 'Arial',
                fontSize: 36,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: '#1B5E20',
                strokeThickness: 4,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 3
            }
        });
        this.text.x = 20;
        this.text.y = 20;
    }

    increment() {
        this.score++;
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
