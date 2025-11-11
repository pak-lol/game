import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Modern Menu Leaderboard Screen
 */
export class MenuLeaderboardScreen {
    constructor(scoreService, onBack) {
        this.container = new PIXI.Container();
        this.scoreService = scoreService;
        this.onBack = onBack;
        this.create();
    }

    create() {
        const screenWidth = GAME_CONFIG.width;
        const screenHeight = GAME_CONFIG.height;

        // Background
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, screenWidth, screenHeight);
        bg.fill({ color: 0x0F2027 });
        this.container.addChild(bg);

        // Gradient overlay
        const gradientOverlay = new PIXI.Graphics();
        gradientOverlay.rect(0, 0, screenWidth, screenHeight);
        gradientOverlay.fill({ color: 0x000000, alpha: 0.4 });
        this.container.addChild(gradientOverlay);

        // Title with glow
        const title = new PIXI.Text({
            text: '🏆 ' + i18n.t('leaderboard.title'),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(48, screenWidth * 0.1),
                fill: '#FFD700',
                fontWeight: 'bold',
                stroke: { color: '#B8860B', width: 5 },
                dropShadow: {
                    color: '#FFD700',
                    blur: 20,
                    distance: 0,
                    alpha: 0.6
                }
            }
        });
        title.anchor.set(0.5, 0);
        title.x = screenWidth / 2;
        title.y = 25;
        this.container.addChild(title);

        // Get leaderboard data
        const leaderboard = this.scoreService.getTopScores(10);

        if (leaderboard.length === 0) {
            this.createEmptyState(screenWidth, screenHeight);
        } else {
            this.createModernLeaderboard(leaderboard, screenWidth, screenHeight);
        }

        // Back button
        this.createModernBackButton(screenWidth, screenHeight);
    }

    createEmptyState(screenWidth, screenHeight) {
        const emptyContainer = new PIXI.Container();
        emptyContainer.x = screenWidth / 2;
        emptyContainer.y = screenHeight / 2;

        const emptyIcon = new PIXI.Text({
            text: '🎮',
            style: {
                fontSize: 80
            }
        });
        emptyIcon.anchor.set(0.5);
        emptyIcon.y = -40;
        emptyContainer.addChild(emptyIcon);

        const emptyText = new PIXI.Text({
            text: i18n.t('leaderboard.noScores'),
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: '#888888',
                fontStyle: 'italic'
            }
        });
        emptyText.anchor.set(0.5);
        emptyText.y = 30;
        emptyContainer.addChild(emptyText);

        const playText = new PIXI.Text({
            text: 'Pradėk žaisti ir būk pirmas!',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#4CAF50'
            }
        });
        playText.anchor.set(0.5);
        playText.y = 60;
        emptyContainer.addChild(playText);

        this.container.addChild(emptyContainer);
    }

    createModernLeaderboard(leaderboard, screenWidth, screenHeight) {
        const contentWidth = Math.min(400, screenWidth - 40);
        const startY = 95;

        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const entryCard = this.createModernEntry(entry, rank, screenWidth/2, startY + index * 68, contentWidth);
            this.container.addChild(entryCard);
        });
    }

    createModernEntry(entry, rank, x, y, width) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        const height = 60;

        // Card background with special effects for top 3
        const card = new PIXI.Graphics();

        let bgColor = 0x1a1a1a;
        let borderColor = 0x333333;
        let glowAlpha = 0;

        if (rank === 1) {
            bgColor = 0x2a2000;
            borderColor = 0xFFD700;
            glowAlpha = 0.3;
        } else if (rank === 2) {
            bgColor = 0x2a2a2a;
            borderColor = 0xC0C0C0;
            glowAlpha = 0.2;
        } else if (rank === 3) {
            bgColor = 0x2a1a0a;
            borderColor = 0xCD7F32;
            glowAlpha = 0.15;
        }

        // Glow for top 3
        if (glowAlpha > 0) {
            card.roundRect(-width/2 - 3, -3, width + 6, height + 6, 12);
            card.fill({ color: borderColor, alpha: glowAlpha });
        }

        // Main card
        card.roundRect(-width/2, 0, width, height, 12);
        card.fill({ color: bgColor, alpha: 0.95 });

        // Border
        card.roundRect(-width/2, 0, width, height, 12);
        card.stroke({ color: borderColor, width: rank <= 3 ? 3 : 2, alpha: rank <= 3 ? 0.8 : 0.3 });

        container.addChild(card);

        // Rank badge
        let rankText = `#${rank}`;
        let rankEmoji = '';
        if (rank === 1) rankEmoji = '🥇';
        else if (rank === 2) rankEmoji = '🥈';
        else if (rank === 3) rankEmoji = '🥉';

        const rankDisplay = new PIXI.Text({
            text: rankEmoji || rankText,
            style: {
                fontFamily: 'Arial',
                fontSize: rankEmoji ? 32 : 20,
                fill: rank <= 3 ? '#FFD700' : '#888888',
                fontWeight: 'bold'
            }
        });
        rankDisplay.anchor.set(0.5, 0.5);
        rankDisplay.x = -width/2 + 35;
        rankDisplay.y = height/2;
        container.addChild(rankDisplay);

        // Player name
        const maxNameLength = 12;
        let displayName = entry.username;
        if (displayName.length > maxNameLength) {
            displayName = displayName.substring(0, maxNameLength) + '...';
        }

        const playerName = new PIXI.Text({
            text: displayName,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: '#FFFFFF',
                fontWeight: rank <= 3 ? 'bold' : 'normal',
                dropShadow: rank <= 3 ? {
                    color: '#000000',
                    blur: 4,
                    distance: 2
                } : undefined
            }
        });
        playerName.anchor.set(0, 0.5);
        playerName.x = -width/2 + 70;
        playerName.y = height/2;
        container.addChild(playerName);

        // Score with badge
        const scoreBadge = new PIXI.Graphics();
        const badgeWidth = 75;
        const badgeHeight = 36;
        const badgeX = width/2 - badgeWidth - 10;
        const badgeY = (height - badgeHeight) / 2;

        scoreBadge.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
        scoreBadge.fill({ color: 0x4CAF50, alpha: 0.2 });
        scoreBadge.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
        scoreBadge.stroke({ color: 0x4CAF50, width: 2, alpha: 0.6 });
        container.addChild(scoreBadge);

        const scoreDisplay = new PIXI.Text({
            text: entry.score.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: '#4CAF50',
                fontWeight: 'bold',
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    distance: 2
                }
            }
        });
        scoreDisplay.anchor.set(0.5, 0.5);
        scoreDisplay.x = badgeX + badgeWidth/2;
        scoreDisplay.y = badgeY + badgeHeight/2;
        container.addChild(scoreDisplay);

        return container;
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
        button.fill({ color: 0xFF9800, alpha: 0.9 });

        // Button border
        button.roundRect(screenWidth/2 - buttonWidth/2, screenHeight - 75, buttonWidth, buttonHeight, 12);
        button.stroke({ color: 0xFFB74D, width: 3 });

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
