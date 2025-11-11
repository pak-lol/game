import * as PIXI from 'pixi.js';
import { GAME_CONFIG, ITEMS_CONFIG, POWERUPS_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Items Information Screen
 * Shows all items and power-ups with their effects
 */
export class ItemsInfoScreen {
    constructor(onBack) {
        this.container = new PIXI.Container();
        this.onBack = onBack;
        this.create();
    }

    create() {
        const screenWidth = GAME_CONFIG.width;
        const screenHeight = GAME_CONFIG.height;

        // Background overlay
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, screenWidth, screenHeight);
        overlay.fill({ color: 0x000000, alpha: 0.95 });
        this.container.addChild(overlay);

        // Title
        const title = new PIXI.Text({
            text: i18n.t('menu.itemsInfo'),
            style: {
                fontFamily: 'Arial',
                fontSize: 42,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: { color: '#1B5E20', width: 4 },
                dropShadow: {
                    color: '#000000',
                    blur: 6,
                    angle: Math.PI / 4,
                    distance: 4
                }
            }
        });
        title.anchor.set(0.5, 0);
        title.x = screenWidth / 2;
        title.y = 30;
        this.container.addChild(title);

        // Items section
        let yPos = 100;
        const sectionTitle = this.createSectionTitle('📦 DAIKTAI', screenWidth / 2, yPos);
        this.container.addChild(sectionTitle);
        yPos += 50;

        // Display all items
        const items = Object.values(ITEMS_CONFIG);
        for (const item of items) {
            const itemDisplay = this.createItemDisplay(item, screenWidth / 2, yPos);
            this.container.addChild(itemDisplay);
            yPos += 90;
        }

        // Power-ups section
        yPos += 20;
        const powerUpTitle = this.createSectionTitle('⚡ GALIŲ DAIKTAI', screenWidth / 2, yPos);
        this.container.addChild(powerUpTitle);
        yPos += 50;

        // Display all power-ups
        const powerups = Object.values(POWERUPS_CONFIG);
        for (const powerup of powerups) {
            const powerupDisplay = this.createPowerUpDisplay(powerup, screenWidth / 2, yPos);
            this.container.addChild(powerupDisplay);
            yPos += 90;
        }

        // Back button
        this.createBackButton(screenWidth, screenHeight);
    }

    createSectionTitle(text, x, y) {
        const title = new PIXI.Text({
            text: text,
            style: {
                fontFamily: 'Arial',
                fontSize: 28,
                fill: '#FFD700',
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 3 }
            }
        });
        title.anchor.set(0.5, 0);
        title.x = x;
        title.y = y;
        return title;
    }

    createItemDisplay(item, x, y) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        // Background
        const bg = new PIXI.Graphics();
        bg.roundRect(-180, -30, 360, 70, 10);
        bg.fill({ color: 0x1a1a1a, alpha: 0.8 });
        bg.roundRect(-180, -30, 360, 70, 10);
        bg.stroke({ color: parseInt(item.color.replace('#', ''), 16), width: 2, alpha: 0.8 });
        container.addChild(bg);

        // Name and emoji
        const nameText = new PIXI.Text({
            text: i18n.t(item.nameKey).toUpperCase(),
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: item.color,
                fontWeight: 'bold'
            }
        });
        nameText.anchor.set(0, 0.5);
        nameText.x = -170;
        nameText.y = 0;
        container.addChild(nameText);

        // Score or effect
        let infoText = '';
        if (item.gameOver) {
            infoText = '💀 ŽAIDIMAS BAIGSIS';
        } else if (item.scoreValue) {
            infoText = `+${item.scoreValue} ${i18n.t('game.score')}`;
        }

        const info = new PIXI.Text({
            text: infoText,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        info.anchor.set(1, 0.5);
        info.x = 170;
        info.y = 0;
        container.addChild(info);

        // Rarity indicator
        const rarityText = this.getRarityText(item.rarity);
        const rarity = new PIXI.Text({
            text: rarityText,
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#AAAAAA'
            }
        });
        rarity.anchor.set(1, 0.5);
        rarity.x = 170;
        rarity.y = 15;
        container.addChild(rarity);

        return container;
    }

    createPowerUpDisplay(powerup, x, y) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        // Background
        const bg = new PIXI.Graphics();
        bg.roundRect(-180, -30, 360, 70, 10);
        bg.fill({ color: 0x1a1a1a, alpha: 0.8 });
        bg.roundRect(-180, -30, 360, 70, 10);
        bg.stroke({ color: parseInt(powerup.color.replace('#', ''), 16), width: 2, alpha: 0.8 });
        container.addChild(bg);

        // Icon and name
        const nameText = new PIXI.Text({
            text: `${powerup.icon} ${i18n.t(powerup.nameKey).toUpperCase()}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: powerup.color,
                fontWeight: 'bold'
            }
        });
        nameText.anchor.set(0, 0.5);
        nameText.x = -170;
        nameText.y = -5;
        container.addChild(nameText);

        // Description
        const desc = new PIXI.Text({
            text: i18n.t(powerup.descriptionKey),
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#CCCCCC'
            }
        });
        desc.anchor.set(0, 0.5);
        desc.x = -170;
        desc.y = 15;
        container.addChild(desc);

        // Spawn chance
        const chance = new PIXI.Text({
            text: `${(powerup.spawnChance * 100).toFixed(0)}% šansas`,
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#AAAAAA'
            }
        });
        chance.anchor.set(1, 0.5);
        chance.x = 170;
        chance.y = 0;
        container.addChild(chance);

        return container;
    }

    getRarityText(rarity) {
        if (rarity >= 50) return '⭐ Dažnas';
        if (rarity >= 20) return '⭐⭐ Vidutinis';
        if (rarity >= 10) return '⭐⭐⭐ Retas';
        return '⭐⭐⭐⭐ Labai retas';
    }

    createBackButton(screenWidth, screenHeight) {
        const button = new PIXI.Graphics();
        button.roundRect(0, 0, 200, 60, 10);
        button.fill({ color: 0x4CAF50, alpha: 0.9 });
        button.x = screenWidth / 2 - 100;
        button.y = screenHeight - 80;

        const buttonText = new PIXI.Text({
            text: i18n.t('menu.back'),
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = 100;
        buttonText.y = 30;
        button.addChild(buttonText);

        button.interactive = true;
        button.cursor = 'pointer';
        button.on('pointerdown', () => {
            if (this.onBack) this.onBack();
        });

        this.container.addChild(button);
    }

    addToStage(stage) {
        stage.addChild(this.container);
    }

    removeFromStage(stage) {
        stage.removeChild(this.container);
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
