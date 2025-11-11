import * as PIXI from 'pixi.js';
import { GAME_CONFIG, ITEMS_CONFIG, POWERUPS_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Modern Items Information Screen
 */
export class ItemsInfoScreen {
    constructor(onBack) {
        this.container = new PIXI.Container();
        this.onBack = onBack;
        this.scrollOffset = 0;
        this.create();
    }

    create() {
        const screenWidth = GAME_CONFIG.width;
        const screenHeight = GAME_CONFIG.height;

        // Background with gradient
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, screenWidth, screenHeight);
        bg.fill({ color: 0x0F2027 });
        this.container.addChild(bg);

        // Add gradient overlay
        const gradientOverlay = new PIXI.Graphics();
        gradientOverlay.rect(0, 0, screenWidth, screenHeight);
        gradientOverlay.fill({
            color: 0x000000,
            alpha: 0.4
        });
        this.container.addChild(gradientOverlay);

        // Title with glow
        const title = new PIXI.Text({
            text: '📋 ' + i18n.t('menu.itemsInfo'),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(48, screenWidth * 0.1),
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: { color: '#1B5E20', width: 5 },
                dropShadow: {
                    color: '#4CAF50',
                    blur: 20,
                    angle: Math.PI / 4,
                    distance: 0,
                    alpha: 0.5
                }
            }
        });
        title.anchor.set(0.5, 0);
        title.x = screenWidth / 2;
        title.y = 25;
        this.container.addChild(title);

        // Content container
        const contentY = 90;
        const cardWidth = Math.min(380, screenWidth - 40);
        const cardX = screenWidth / 2;

        let currentY = contentY;

        // Items section
        const items = Object.values(ITEMS_CONFIG);
        items.forEach((item, index) => {
            const card = this.createModernItemCard(item, cardX, currentY, cardWidth);
            this.container.addChild(card);
            currentY += 110;
        });

        // Spacing
        currentY += 20;

        // Power-ups section
        const powerups = Object.values(POWERUPS_CONFIG);
        powerups.forEach((powerup) => {
            const card = this.createModernPowerUpCard(powerup, cardX, currentY, cardWidth);
            this.container.addChild(card);
            currentY += 110;
        });

        // Back button
        this.createModernBackButton(screenWidth, screenHeight);
    }

    createModernItemCard(item, x, y, width) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        const height = 90;

        // Card background with gradient
        const card = new PIXI.Graphics();
        card.roundRect(-width/2, 0, width, height, 15);

        // Gradient effect
        const colorNum = parseInt(item.color.replace('#', ''), 16);
        card.fill({ color: 0x1a1a1a, alpha: 0.9 });

        // Border with item color
        card.roundRect(-width/2, 0, width, height, 15);
        card.stroke({ color: colorNum, width: 3, alpha: 0.6 });

        // Glow effect for good items
        if (item.scoreValue > 0) {
            card.roundRect(-width/2 - 2, -2, width + 4, height + 4, 15);
            card.stroke({ color: colorNum, width: 1, alpha: 0.3 });
        }

        container.addChild(card);

        // Item name
        const nameText = new PIXI.Text({
            text: i18n.t(item.nameKey).toUpperCase(),
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: item.color,
                fontWeight: 'bold',
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    distance: 2
                }
            }
        });
        nameText.anchor.set(0, 0.5);
        nameText.x = -width/2 + 20;
        nameText.y = 30;
        container.addChild(nameText);

        // Score or effect badge
        const badgeWidth = 80;
        const badgeHeight = 35;
        const badgeX = width/2 - badgeWidth - 15;
        const badgeY = 25;

        const badge = new PIXI.Graphics();
        badge.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);

        if (item.gameOver) {
            badge.fill({ color: 0xFF0000, alpha: 0.2 });
            badge.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
            badge.stroke({ color: 0xFF6B6B, width: 2 });
        } else {
            badge.fill({ color: colorNum, alpha: 0.2 });
            badge.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
            badge.stroke({ color: colorNum, width: 2 });
        }
        container.addChild(badge);

        let badgeText = '';
        let badgeColor = item.color;
        if (item.gameOver) {
            badgeText = '☠️ -1';
            badgeColor = '#FF6B6B';
        } else if (item.scoreValue) {
            badgeText = `+${item.scoreValue}`;
        }

        const badgeLabel = new PIXI.Text({
            text: badgeText,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: badgeColor,
                fontWeight: 'bold'
            }
        });
        badgeLabel.anchor.set(0.5, 0.5);
        badgeLabel.x = badgeX + badgeWidth/2;
        badgeLabel.y = badgeY + badgeHeight/2;
        container.addChild(badgeLabel);

        // Rarity indicator
        const rarityText = this.getRarityText(item.rarity);
        const rarity = new PIXI.Text({
            text: rarityText,
            style: {
                fontFamily: 'Arial',
                fontSize: 13,
                fill: this.getRarityColor(item.rarity),
                fontWeight: 'bold'
            }
        });
        rarity.anchor.set(0, 0.5);
        rarity.x = -width/2 + 20;
        rarity.y = 60;
        container.addChild(rarity);

        return container;
    }

    createModernPowerUpCard(powerup, x, y, width) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        const height = 90;
        const colorNum = parseInt(powerup.color.replace('#', ''), 16);

        // Card with glow
        const card = new PIXI.Graphics();

        // Outer glow
        card.roundRect(-width/2 - 3, -3, width + 6, height + 6, 15);
        card.fill({ color: colorNum, alpha: 0.15 });

        // Main card
        card.roundRect(-width/2, 0, width, height, 15);
        card.fill({ color: 0x1a1a1a, alpha: 0.95 });

        // Border
        card.roundRect(-width/2, 0, width, height, 15);
        card.stroke({ color: colorNum, width: 3, alpha: 0.8 });

        container.addChild(card);

        // Icon and name
        const nameText = new PIXI.Text({
            text: `${powerup.icon} ${i18n.t(powerup.nameKey).toUpperCase()}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: powerup.color,
                fontWeight: 'bold',
                dropShadow: {
                    color: powerup.color,
                    blur: 10,
                    distance: 0,
                    alpha: 0.5
                }
            }
        });
        nameText.anchor.set(0, 0.5);
        nameText.x = -width/2 + 20;
        nameText.y = 28;
        container.addChild(nameText);

        // Description
        const desc = new PIXI.Text({
            text: i18n.t(powerup.descriptionKey),
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#CCCCCC',
                wordWrap: true,
                wordWrapWidth: width - 40
            }
        });
        desc.anchor.set(0, 0.5);
        desc.x = -width/2 + 20;
        desc.y = 58;
        container.addChild(desc);

        // Chance badge
        const chanceText = `${(powerup.spawnChance * 100).toFixed(0)}%`;
        const chanceBadge = new PIXI.Text({
            text: chanceText,
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#FFD700',
                fontWeight: 'bold'
            }
        });
        chanceBadge.anchor.set(1, 0.5);
        chanceBadge.x = width/2 - 20;
        chanceBadge.y = 28;
        container.addChild(chanceBadge);

        return container;
    }

    getRarityText(rarity) {
        if (rarity >= 50) return 'Dažnas';
        if (rarity >= 20) return 'Vidutinis';
        if (rarity >= 10) return 'Retas';
        return 'Labai retas';
    }

    getRarityColor(rarity) {
        if (rarity >= 50) return '#888888';
        if (rarity >= 20) return '#4CAF50';
        if (rarity >= 10) return '#2196F3';
        return '#FFD700';
    }

    createModernBackButton(screenWidth, screenHeight) {
        const buttonWidth = 160;
        const buttonHeight = 55;

        const button = new PIXI.Graphics();

        // Button shadow
        button.roundRect(screenWidth/2 - buttonWidth/2 + 2, screenHeight - 75 + 2, buttonWidth, buttonHeight, 12);
        button.fill({ color: 0x000000, alpha: 0.3 });

        // Button background
        button.roundRect(screenWidth/2 - buttonWidth/2, screenHeight - 75, buttonWidth, buttonHeight, 12);
        button.fill({ color: 0x2196F3, alpha: 0.9 });

        // Button border
        button.roundRect(screenWidth/2 - buttonWidth/2, screenHeight - 75, buttonWidth, buttonHeight, 12);
        button.stroke({ color: 0x42A5F5, width: 3 });

        const buttonText = new PIXI.Text({
            text: '← ' + i18n.t('menu.back'),
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: '#FFFFFF',
                fontWeight: 'bold',
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    distance: 2
                }
            }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = screenWidth/2;
        buttonText.y = screenHeight - 75 + buttonHeight/2;
        button.addChild(buttonText);

        button.interactive = true;
        button.cursor = 'pointer';

        button.on('pointerdown', () => {
            button.scale.set(0.95);
        });

        button.on('pointerup', () => {
            button.scale.set(1);
            if (this.onBack) this.onBack();
        });

        button.on('pointerupoutside', () => {
            button.scale.set(1);
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
