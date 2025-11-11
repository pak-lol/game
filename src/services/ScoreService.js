/**
 * Service for managing scores and leaderboard persistence
 */
export class ScoreService {
    constructor() {
        this.storageKey = 'weedCatcherLeaderboard';
        this.maxLeaderboardSize = 100;
    }

    /**
     * Save a score to the leaderboard
     * @param {string} username - Player username
     * @param {number} score - Player score
     * @returns {Object} Score data with rank
     */
    saveScore(username, score) {
        const scoreData = {
            username: username,
            score: score,
            timestamp: new Date().toISOString(),
            id: this.generateScoreId()
        };

        console.log('Saving score:', scoreData);

        try {
            const leaderboard = this.getLeaderboard();
            leaderboard.push(scoreData);

            // Sort by score (highest first)
            leaderboard.sort((a, b) => b.score - a.score);

            // Keep only top scores
            const trimmedLeaderboard = leaderboard.slice(0, this.maxLeaderboardSize);

            // Save back to storage
            localStorage.setItem(this.storageKey, JSON.stringify(trimmedLeaderboard));

            // Calculate player's rank
            const rank = trimmedLeaderboard.findIndex(entry => entry.id === scoreData.id) + 1;

            console.log('Score saved successfully! Rank:', rank);

            return {
                ...scoreData,
                rank: rank,
                totalPlayers: trimmedLeaderboard.length
            };
        } catch (error) {
            console.error('Error saving score:', error);
            return {
                ...scoreData,
                rank: -1,
                totalPlayers: 0
            };
        }
    }

    /**
     * Get the full leaderboard
     * @param {number} limit - Maximum number of entries to return
     * @returns {Array} Leaderboard entries
     */
    getLeaderboard(limit = this.maxLeaderboardSize) {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) {
                return [];
            }

            const leaderboard = JSON.parse(stored);
            return leaderboard.slice(0, limit);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return [];
        }
    }

    /**
     * Get top N scores
     * @param {number} count - Number of top scores to get
     * @returns {Array} Top scores
     */
    getTopScores(count = 10) {
        return this.getLeaderboard(count);
    }

    /**
     * Get player's rank for a specific score
     * @param {number} score - Score to check
     * @returns {number} Rank (1-based)
     */
    getRank(score) {
        const leaderboard = this.getLeaderboard();

        // Find how many scores are higher
        const betterScores = leaderboard.filter(entry => entry.score > score);
        return betterScores.length + 1;
    }

    /**
     * Get player's best score
     * @param {string} username - Player username
     * @returns {Object|null} Best score entry or null
     */
    getPlayerBestScore(username) {
        const leaderboard = this.getLeaderboard();
        const playerScores = leaderboard.filter(entry =>
            entry.username.toLowerCase() === username.toLowerCase()
        );

        if (playerScores.length === 0) {
            return null;
        }

        // Already sorted by score, so first one is best
        return playerScores[0];
    }

    /**
     * Get statistics about the leaderboard
     * @returns {Object} Statistics
     */
    getStats() {
        const leaderboard = this.getLeaderboard();

        if (leaderboard.length === 0) {
            return {
                totalPlayers: 0,
                highestScore: 0,
                averageScore: 0,
                totalGames: 0
            };
        }

        const scores = leaderboard.map(entry => entry.score);
        const total = scores.reduce((sum, score) => sum + score, 0);

        return {
            totalPlayers: leaderboard.length,
            highestScore: Math.max(...scores),
            averageScore: Math.round(total / scores.length),
            totalGames: leaderboard.length
        };
    }

    /**
     * Clear the entire leaderboard
     */
    clearLeaderboard() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Leaderboard cleared');
        } catch (error) {
            console.error('Error clearing leaderboard:', error);
        }
    }

    /**
     * Generate unique ID for score entry
     * @private
     * @returns {string} Unique ID
     */
    generateScoreId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check if score makes it to top N
     * @param {number} score - Score to check
     * @param {number} topN - Top N positions to check
     * @returns {boolean}
     */
    isTopScore(score, topN = 10) {
        const topScores = this.getTopScores(topN);

        if (topScores.length < topN) {
            return true;
        }

        return score > topScores[topScores.length - 1].score;
    }
}
