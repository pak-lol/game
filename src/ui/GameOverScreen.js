import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Improved Game Over Screen with leaderboard display
 */
export class GameOverScreen {
    constructor(username, score, scoreData, leaderboard, onRestart) {
        this.container = new PIXI.Container();
        this.username = username;
        this.score = score;
        this.scoreData = scoreData; // Includes rank, totalPlayers
        this.leaderboard = leaderboard || [];
        this.onRestart = onRestart;

        // UI elements references for cleanup
        this.buttons = [];
        this.texts = [];

        this.create();
    }

    /**
     * Create the game over screen UI
     */
    create() {
        const centerX = GAME_CONFIG.width / 2;
        const centerY = GAME_CONFIG.height / 2;
        const baseSize = Math.min(GAME_CONFIG.width, GAME_CONFIG.height);

        // Create overlay
        this.createOverlay();

        // Calculate responsive dimensions
        const panelWidth = Math.min(600, GAME_CONFIG.width * 0.95);
        const panelHeight = Math.min(650, GAME_CONFIG.height * 0.85);

        // Create main panel
        this.createPanel(centerX, centerY, panelWidth, panelHeight);

        // Create content
        let yOffset = this.createHeader(centerX, centerY, panelWidth, panelHeight, baseSize);
        yOffset = this.createScoreInfo(centerX, centerY, panelWidth, panelHeight, baseSize, yOffset);
        yOffset = this.createLeaderboard(centerX, centerY, panelWidth, panelHeight, baseSize, yOffset);
        this.createRestartButton(centerX, centerY, panelWidth, panelHeight, baseSize);
    }

    /**
     * Create dark overlay background
     */
    createOverlay() {
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        overlay.fill({ color: 0x000000, alpha: 0.9 });
        this.container.addChild(overlay);
    }

    /**
     * Create main panel
     */
    createPanel(centerX, centerY, width, height) {
        const panel = new PIXI.Graphics();
        panel.roundRect(
            centerX - width / 2,
            centerY - height / 2,
            width,
            height,
            20
        );
        panel.fill({ color: 0x0F2027, alpha: 0.98 });
        panel.stroke({ color: 0x4CAF50, width: 3 });
        this.container.addChild(panel);
    }

    /**
     * Create header section with title and player name
     * @returns {number} Next Y position
     */
    createHeader(centerX, centerY, panelWidth, panelHeight, baseSize) {
        let yPos = centerY - panelHeight / 2 + 30;

        // Game Over Title
        const titleText = new PIXI.Text({
            text: i18n.t('game.gameOver'),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(40, baseSize / 15),
                fill: '#FF6B6B',
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 4 }
            }
        });
        titleText.anchor.set(0.5);
        titleText.x = centerX;
        titleText.y = yPos;
        this.container.addChild(titleText);
        this.texts.push(titleText);

        yPos += 50;

        // Player name
        const nameText = new PIXI.Text({
            text: this.username,
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(28, baseSize / 20),
                fill: '#FFD700',
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 2 }
            }
        });
        nameText.anchor.set(0.5);
        nameText.x = centerX;
        nameText.y = yPos;
        this.container.addChild(nameText);
        this.texts.push(nameText);

        return yPos + 40;
    }

    /**
     * Create score information section
     * @returns {number} Next Y position
     */
    createScoreInfo(centerX, centerY, panelWidth, panelHeight, baseSize, yPos) {
        // Score label
        const scoreLabel = new PIXI.Text({
            text: i18n.t('game.finalScore'),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(18, baseSize / 30),
                fill: '#CCCCCC',
                fontWeight: 'normal'
            }
        });
        scoreLabel.anchor.set(0.5);
        scoreLabel.x = centerX;
        scoreLabel.y = yPos;
        this.container.addChild(scoreLabel);
        this.texts.push(scoreLabel);

        yPos += 30;

        // Score value
        const scoreText = new PIXI.Text({
            text: this.score.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(48, baseSize / 12),
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: { color: '#1B5E20', width: 4 }
            }
        });
        scoreText.anchor.set(0.5);
        scoreText.x = centerX;
        scoreText.y = yPos;
        this.container.addChild(scoreText);
        this.texts.push(scoreText);

        yPos += 45;

        // Rank information (if available)
        if (this.scoreData && this.scoreData.rank > 0) {
            const rankText = new PIXI.Text({
                text: `${i18n.t('game.yourRank')}: #${this.scoreData.rank} ${i18n.t('game.outOf')} ${this.scoreData.totalPlayers}`,
                style: {
                    fontFamily: 'Arial',
                    fontSize: Math.min(16, baseSize / 35),
                    fill: this.scoreData.rank <= 10 ? '#FFD700' : '#FFFFFF',
                    fontWeight: 'bold'
                }
            });
            rankText.anchor.set(0.5);
            rankText.x = centerX;
            rankText.y = yPos;
            this.container.addChild(rankText);
            this.texts.push(rankText);

            yPos += 30;

            // Special achievement badges
            if (this.scoreData.rank === 1) {
                const recordText = new PIXI.Text({
                    text: `🏆 ${i18n.t('game.newRecord')} 🏆`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: Math.min(18, baseSize / 30),
                        fill: '#FFD700',
                        fontWeight: 'bold'
                    }
                });
                recordText.anchor.set(0.5);
                recordText.x = centerX;
                recordText.y = yPos;
                this.container.addChild(recordText);
                this.texts.push(recordText);
                yPos += 25;
            } else if (this.scoreData.rank <= 10) {
                const topScoreText = new PIXI.Text({
                    text: `⭐ ${i18n.t('game.topScore')} ⭐`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: Math.min(16, baseSize / 35),
                        fill: '#FFD700',
                        fontWeight: 'bold'
                    }
                });
                topScoreText.anchor.set(0.5);
                topScoreText.x = centerX;
                topScoreText.y = yPos;
                this.container.addChild(topScoreText);
                this.texts.push(topScoreText);
                yPos += 25;
            }
        }

        return yPos + 10;
    }

    /**
     * Create leaderboard section
     * @returns {number} Next Y position
     */
    createLeaderboard(centerX, centerY, panelWidth, panelHeight, baseSize, yPos) {
        // Leaderboard title
        const leaderboardTitle = new PIXI.Text({
            text: i18n.t('leaderboard.title'),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(20, baseSize / 25),
                fill: '#4CAF50',
                fontWeight: 'bold'
            }
        });
        leaderboardTitle.anchor.set(0.5);
        leaderboardTitle.x = centerX;
        leaderboardTitle.y = yPos;
        this.container.addChild(leaderboardTitle);
        this.texts.push(leaderboardTitle);

        yPos += 35;

        // Leaderboard container
        const leaderboardHeight = 280;
        const leaderboardY = yPos;

        // Background for leaderboard
        const leaderboardBg = new PIXI.Graphics();
        leaderboardBg.roundRect(
            centerX - (panelWidth - 60) / 2,
            leaderboardY - 10,
            panelWidth - 60,
            leaderboardHeight,
            10
        );
        leaderboardBg.fill({ color: 0x000000, alpha: 0.3 });
        this.container.addChild(leaderboardBg);

        // Display top scores
        if (this.leaderboard.length === 0) {
            const noScoresText = new PIXI.Text({
                text: i18n.t('leaderboard.noScores'),
                style: {
                    fontFamily: 'Arial',
                    fontSize: Math.min(16, baseSize / 35),
                    fill: '#888888',
                    fontStyle: 'italic'
                }
            });
            noScoresText.anchor.set(0.5);
            noScoresText.x = centerX;
            noScoresText.y = leaderboardY + leaderboardHeight / 2;
            this.container.addChild(noScoresText);
            this.texts.push(noScoresText);
        } else {
            const maxEntries = 8;
            const entryHeight = 30;
            const fontSize = Math.min(14, baseSize / 40);

            for (let i = 0; i < Math.min(maxEntries, this.leaderboard.length); i++) {
                const entry = this.leaderboard[i];
                const entryY = leaderboardY + i * entryHeight;
                const isCurrentPlayer = entry.username.toLowerCase() === this.username.toLowerCase() &&
                                      Math.abs(entry.score - this.score) < 0.01;

                // Highlight current player
                if (isCurrentPlayer) {
                    const highlight = new PIXI.Graphics();
                    highlight.roundRect(
                        centerX - (panelWidth - 70) / 2,
                        entryY - 2,
                        panelWidth - 70,
                        entryHeight - 5,
                        5
                    );
                    highlight.fill({ color: 0x4CAF50, alpha: 0.2 });
                    this.container.addChild(highlight);
                }

                // Rank
                const rankText = new PIXI.Text({
                    text: `#${i + 1}`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: fontSize,
                        fill: i < 3 ? '#FFD700' : '#FFFFFF',
                        fontWeight: 'bold'
                    }
                });
                rankText.x = centerX - (panelWidth - 80) / 2;
                rankText.y = entryY;
                this.container.addChild(rankText);
                this.texts.push(rankText);

                // Player name
                let displayName = entry.username;
                if (isCurrentPlayer) {
                    displayName += ` (${i18n.t('leaderboard.you')})`;
                }

                const nameText = new PIXI.Text({
                    text: displayName,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: fontSize,
                        fill: isCurrentPlayer ? '#4CAF50' : '#FFFFFF',
                        fontWeight: isCurrentPlayer ? 'bold' : 'normal'
                    }
                });
                nameText.x = centerX - (panelWidth - 80) / 2 + 45;
                nameText.y = entryY;
                this.container.addChild(nameText);
                this.texts.push(nameText);

                // Score
                const scoreText = new PIXI.Text({
                    text: entry.score.toString(),
                    style: {
                        fontFamily: 'Arial',
                        fontSize: fontSize,
                        fill: isCurrentPlayer ? '#4CAF50' : '#4CAF50',
                        fontWeight: 'bold'
                    }
                });
                scoreText.anchor.set(1, 0);
                scoreText.x = centerX + (panelWidth - 80) / 2;
                scoreText.y = entryY;
                this.container.addChild(scoreText);
                this.texts.push(scoreText);
            }
        }

        return leaderboardY + leaderboardHeight + 20;
    }

    /**
     * Create restart button
     */
    createRestartButton(centerX, centerY, panelWidth, panelHeight, baseSize) {
        const buttonY = centerY + panelHeight / 2 - 60;
        const buttonWidth = Math.min(250, panelWidth - 80);
        const buttonHeight = 45;

        // Button background
        const button = new PIXI.Graphics();
        this.drawButton(button, centerX, buttonY, buttonWidth, buttonHeight, false);
        this.container.addChild(button);
        this.buttons.push(button);

        // Button text
        const buttonText = new PIXI.Text({
            text: i18n.t('game.restart'),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(22, baseSize / 25),
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = centerX;
        buttonText.y = buttonY + buttonHeight / 2;
        this.container.addChild(buttonText);
        this.texts.push(buttonText);

        // Make button interactive
        button.eventMode = 'static';
        button.cursor = 'pointer';
        button.interactive = true;

        button.on('pointerover', () => {
            this.drawButton(button, centerX, buttonY, buttonWidth, buttonHeight, true);
        });

        button.on('pointerout', () => {
            this.drawButton(button, centerX, buttonY, buttonWidth, buttonHeight, false);
        });

        button.on('pointerdown', () => {
            this.onRestart();
        });
    }

    /**
     * Helper to draw button with hover state
     */
    drawButton(graphics, centerX, buttonY, width, height, hover) {
        graphics.clear();
        graphics.roundRect(
            centerX - width / 2,
            buttonY,
            width,
            height,
            10
        );
        graphics.fill({ color: hover ? 0x66BB6A : 0x4CAF50 });
        graphics.stroke({ color: hover ? 0x81C784 : 0x66BB6A, width: 2 });
    }

    /**
     * Add screen to stage
     */
    addToStage(stage) {
        stage.addChild(this.container);
    }

    /**
     * Remove screen from stage and clean up
     */
    removeFromStage(stage) {
        // Clean up event listeners
        this.buttons.forEach(button => {
            button.removeAllListeners();
        });

        stage.removeChild(this.container);
    }

    /**
     * Destroy and clean up resources
     */
    destroy() {
        this.buttons.forEach(button => button.destroy());
        this.texts.forEach(text => text.destroy());
        this.container.destroy({ children: true });

        this.buttons = [];
        this.texts = [];
    }
}
