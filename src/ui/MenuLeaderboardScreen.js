import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Main Menu Leaderboard Screen
 * Shows top scores from the main menu
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

        // Background overlay
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, screenWidth, screenHeight);
        overlay.fill({ color: 0x000000, alpha: 0.95 });
        this.container.addChild(overlay);

        // Title
        const title = new PIXI.Text({
            text: '🏆 ' + i18n.t('leaderboard.title'),
            style: {
                fontFamily: 'Arial',
                fontSize: 42,
                fill: '#FFD700',
                fontWeight: 'bold',
                stroke: { color: '#B8860B', width: 4 },
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

        // Get leaderboard data
        const leaderboard = this.scoreService.getTopScores(10);

        if (leaderboard.length === 0) {
            this.createEmptyState(screenWidth, screenHeight);
        } else {
            this.createLeaderboard(leaderboard, screenWidth, screenHeight);
        }

        // Back button
        this.createBackButton(screenWidth, screenHeight);
    }

    createEmptyState(screenWidth, screenHeight) {
        const emptyText = new PIXI.Text({
            text: i18n.t('leaderboard.noScores'),
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#888888',
                fontStyle: 'italic'
            }
        });
        emptyText.anchor.set(0.5);
        emptyText.x = screenWidth / 2;
        emptyText.y = screenHeight / 2;
        this.container.addChild(emptyText);
    }

    createLeaderboard(leaderboard, screenWidth, screenHeight) {
        let yPos = 100;

        // Header
        const header = this.createHeader(screenWidth / 2, yPos);
        this.container.addChild(header);
        yPos += 50;

        // Leaderboard entries
        leaderboard.forEach((entry, index) => {
            const entryDisplay = this.createEntry(entry, index + 1, screenWidth / 2, yPos);
            this.container.addChild(entryDisplay);
            yPos += 55;
        });
    }

    createHeader(x, y) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        const headerBg = new PIXI.Graphics();
        headerBg.roundRect(-200, -20, 400, 40, 5);
        headerBg.fill({ color: 0x333333, alpha: 0.8 });
        container.addChild(headerBg);

        const rank = new PIXI.Text({
            text: i18n.t('leaderboard.rank'),
            style: { fontFamily: 'Arial', fontSize: 18, fill: '#FFD700', fontWeight: 'bold' }
        });
        rank.anchor.set(0.5, 0.5);
        rank.x = -140;
        rank.y = 0;
        container.addChild(rank);

        const player = new PIXI.Text({
            text: i18n.t('leaderboard.player'),
            style: { fontFamily: 'Arial', fontSize: 18, fill: '#FFD700', fontWeight: 'bold' }
        });
        player.anchor.set(0.5, 0.5);
        player.x = 0;
        player.y = 0;
        container.addChild(player);

        const score = new PIXI.Text({
            text: i18n.t('leaderboard.score'),
            style: { fontFamily: 'Arial', fontSize: 18, fill: '#FFD700', fontWeight: 'bold' }
        });
        score.anchor.set(0.5, 0.5);
        score.x = 140;
        score.y = 0;
        container.addChild(score);

        return container;
    }

    createEntry(entry, rank, x, y) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        // Background
        const bg = new PIXI.Graphics();
        bg.roundRect(-200, -20, 400, 45, 5);

        // Top 3 get special colors
        let bgColor = 0x1a1a1a;
        if (rank === 1) bgColor = 0xFFD700; // Gold
        else if (rank === 2) bgColor = 0xC0C0C0; // Silver
        else if (rank === 3) bgColor = 0xCD7F32; // Bronze

        bg.fill({ color: bgColor, alpha: rank <= 3 ? 0.3 : 0.5 });
        container.addChild(bg);

        // Rank
        let rankText = `#${rank}`;
        if (rank === 1) rankText = '🥇';
        else if (rank === 2) rankText = '🥈';
        else if (rank === 3) rankText = '🥉';

        const rankDisplay = new PIXI.Text({
            text: rankText,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: rank <= 3 ? '#FFD700' : '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        rankDisplay.anchor.set(0.5, 0.5);
        rankDisplay.x = -140;
        rankDisplay.y = 2;
        container.addChild(rankDisplay);

        // Player name
        const playerName = new PIXI.Text({
            text: entry.username,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: '#FFFFFF',
                fontWeight: rank <= 3 ? 'bold' : 'normal'
            }
        });
        playerName.anchor.set(0.5, 0.5);
        playerName.x = 0;
        playerName.y = 2;
        container.addChild(playerName);

        // Score
        const scoreDisplay = new PIXI.Text({
            text: entry.score.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: '#4CAF50',
                fontWeight: 'bold'
            }
        });
        scoreDisplay.anchor.set(0.5, 0.5);
        scoreDisplay.x = 140;
        scoreDisplay.y = 2;
        container.addChild(scoreDisplay);

        return container;
    }

    createBackButton(screenWidth, screenHeight) {
        const button = new PIXI.Graphics();
        button.roundRect(0, 0, 200, 60, 10);
        button.fill({ color: 0xFF9800, alpha: 0.9 });
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
