import { wsService } from './WebSocketService.js';

/**
 * Service for managing scores and leaderboard
 * Uses API when available, falls back to localStorage
 */
export class ScoreService {
    constructor() {
        this.storageKey = 'weedCatcherLeaderboard';
        this.maxLeaderboardSize = 100;
        this.useWS = true; // Try WebSocket first
    }

    /**
     * Save a score
     * @param {string} username - Player username
     * @param {number} score - Player score
     * @param {Object} telegramData - Telegram user data (optional)
     * @returns {Promise<Object>} Score data with rank
     */
    async saveScore(username, score, telegramData = {}) {
        console.log('Saving score:', { username, score });

        // Try WebSocket first
        if (this.useWS && wsService.isConnected()) {
            try {
                const result = await wsService.submitScore(username, score, telegramData);
                console.log('Score saved via WebSocket:', result);
                return {
                    username: result.username,
                    score: result.score,
                    rank: result.rank,
                    timestamp: result.created_at,
                    playerStats: result.playerStats
                };
            } catch (error) {
                console.warn('WebSocket unavailable, falling back to localStorage:', error);
                this.useWS = false; // Disable WS for this session
            }
        }

        // Fallback to localStorage
        return this.saveScoreLocal(username, score);
    }

    /**
     * Save score to localStorage (fallback)
     */
    saveScoreLocal(username, score) {
        const scoreData = {
            username: username,
            score: score,
            timestamp: new Date().toISOString(),
            id: this.generateScoreId()
        };

        try {
            const leaderboard = this.getLeaderboardLocal();
            leaderboard.push(scoreData);

            // Sort by score (highest first)
            leaderboard.sort((a, b) => b.score - a.score);

            // Keep only top scores
            const trimmedLeaderboard = leaderboard.slice(0, this.maxLeaderboardSize);

            // Save back to storage
            localStorage.setItem(this.storageKey, JSON.stringify(trimmedLeaderboard));

            // Calculate player's rank
            const rank = trimmedLeaderboard.findIndex(entry => entry.id === scoreData.id) + 1;

            return {
                ...scoreData,
                rank: rank,
                totalPlayers: trimmedLeaderboard.length
            };
        } catch (error) {
            console.error('Error saving score to localStorage:', error);
            return { ...scoreData, rank: 0, totalPlayers: 0 };
        }
    }

    /**
     * Get leaderboard
     * @param {number} limit - Number of entries to return
     * @returns {Promise<Array>} Leaderboard entries
     */
    async getLeaderboard(limit = 100) {
        // Try WebSocket first
        if (this.useWS && wsService.isConnected()) {
            try {
                const leaderboard = await wsService.getLeaderboard(limit);
                return leaderboard.map(entry => ({
                    username: entry.username,
                    score: entry.score || entry.best_score,
                    gamesPlayed: entry.games_played,
                    timestamp: entry.last_played
                }));
            } catch (error) {
                console.warn('WebSocket unavailable, using localStorage:', error);
                this.useWS = false;
            }
        }

        // Fallback to localStorage
        return this.getLeaderboardLocal().slice(0, limit);
    }

    /**
     * Get leaderboard from localStorage
     */
    getLeaderboardLocal() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading leaderboard from localStorage:', error);
            return [];
        }
    }

    /**
     * Get top N scores
     * @param {number} count - Number of top scores to return
     * @returns {Promise<Array>} Top scores
     */
    async getTopScores(count = 10) {
        const leaderboard = await this.getLeaderboard(count);
        return leaderboard.slice(0, count);
    }

    /**
     * Get player's best score
     * @param {string} username - Player username
     * @returns {Promise<Object|null>} Player's best score or null
     */
    async getPlayerBestScore(username) {
        if (this.useWS && wsService.isConnected()) {
            try {
                return await wsService.getPlayerStats(username);
            } catch (error) {
                console.warn('WebSocket unavailable:', error);
                this.useWS = false;
            }
        }

        // Fallback to localStorage
        const leaderboard = this.getLeaderboardLocal();
        const playerScores = leaderboard.filter(entry => entry.username === username);
        
        if (playerScores.length === 0) return null;

        return playerScores.reduce((best, current) => 
            current.score > best.score ? current : best
        );
    }

    /**
     * Get game statistics
     * @returns {Promise<Object>} Game statistics
     */
    async getStats() {
        if (this.useWS && wsService.isConnected()) {
            try {
                // WebSocket doesn't have stats endpoint yet, use localStorage
                this.useWS = false;
            } catch (error) {
                console.warn('WebSocket unavailable:', error);
                this.useWS = false;
            }
        }

        // Fallback to localStorage stats
        const leaderboard = this.getLeaderboardLocal();
        return {
            totalGames: leaderboard.length,
            totalPlayers: new Set(leaderboard.map(e => e.username)).size,
            highestScore: leaderboard.length > 0 ? leaderboard[0].score : 0,
            averageScore: leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((sum, e) => sum + e.score, 0) / leaderboard.length)
                : 0
        };
    }

    /**
     * Check if score qualifies for top N
     * @param {number} score - Score to check
     * @param {number} topN - Top N threshold
     * @returns {Promise<boolean>} True if score is in top N
     */
    async isTopScore(score, topN = 10) {
        const topScores = await this.getTopScores(topN);
        return topScores.length < topN || score > topScores[topScores.length - 1].score;
    }

    /**
     * Generate unique score ID
     * @returns {string} Unique ID
     */
    generateScoreId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear all scores (for testing)
     */
    clearAllScores() {
        localStorage.removeItem(this.storageKey);
        console.log('All scores cleared');
    }
}
