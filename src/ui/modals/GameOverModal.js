import { modalManager } from '../components/Modal.js';

/**
 * Game Over Modal - Beautiful HTML-based game over screen
 */
export class GameOverModal {
    constructor(username, score, scoreData, leaderboard, onRestart) {
        this.username = username;
        this.score = score;
        this.scoreData = scoreData;
        this.leaderboard = leaderboard || [];
        this.onRestart = onRestart;
    }

    show() {
        const content = this.createContent();
        
        modalManager.show({
            title: this.getTitle(),
            content: content,
            onClose: () => {
                if (this.onRestart) this.onRestart();
            }
        });

        setTimeout(() => this.setupEventListeners(), 0);
    }

    getTitle() {
        const rank = this.scoreData?.rank || 0;
        
        if (rank === 1) {
            return '🥇 Naujas Rekordas!';
        } else if (rank <= 3) {
            return '🎉 Puikus Rezultatas!';
        } else if (rank <= 10) {
            return '🎮 Top 10!';
        }
        return '💀 Žaidimas Baigtas';
    }

    createContent() {
        const rank = this.scoreData?.rank || 0;
        const isTopScore = rank > 0 && rank <= 10;

        return `
            <div class="space-y-4">
                <!-- Score Card -->
                <div class="relative bg-gradient-to-br from-emerald-950/60 to-emerald-900/40 
                            border-2 border-emerald-500/40 
                            rounded-2xl p-6 
                            backdrop-blur-xl shadow-2xl shadow-emerald-500/20
                            overflow-hidden">
                    <!-- Shimmer effect -->
                    <div class="absolute inset-0 opacity-20 animate-shimmer" 
                         style="background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent); background-size: 200% 100%;"></div>
                    
                    <div class="relative text-center">
                        <div class="text-gray-400 text-sm uppercase tracking-wider mb-2">Tavo Rezultatas</div>
                        <div class="text-6xl font-bold text-emerald-400 mb-2 drop-shadow-lg">${this.score}</div>
                        ${rank > 0 ? `
                            <div class="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-4 py-2 mt-2">
                                <span class="text-2xl">${this.getRankEmoji(rank)}</span>
                                <span class="text-emerald-300 font-bold">#${rank} Vieta</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Achievement Badges -->
                ${isTopScore ? this.createAchievementBadges(rank) : ''}

                <!-- Player Stats -->
                ${this.scoreData?.playerStats ? this.createPlayerStats() : ''}

                <!-- Mini Leaderboard -->
                ${this.leaderboard.length > 0 ? this.createMiniLeaderboard() : ''}

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 gap-3">
                    <button id="gameOverRestartBtn" 
                            class="px-6 py-4 rounded-xl font-bold text-base
                                   bg-gradient-to-br from-emerald-600 to-emerald-700
                                   border-2 border-emerald-500/40
                                   text-white uppercase tracking-wide
                                   hover:from-emerald-500 hover:to-emerald-600
                                   hover:border-emerald-400/60
                                   hover:shadow-lg hover:shadow-emerald-500/30
                                   active:scale-[0.97]
                                   transition-all duration-200
                                   flex items-center justify-center gap-2
                                   shadow-lg shadow-black/50">
                        <span class="text-xl">🔄</span>
                        <span>Dar Kartą</span>
                    </button>
                    
                    <button id="gameOverMenuBtn" 
                            class="px-6 py-4 rounded-xl font-bold text-base
                                   bg-gradient-to-br from-emerald-950/40 to-emerald-900/20
                                   border-2 border-emerald-800/40
                                   text-gray-300 uppercase tracking-wide
                                   hover:from-emerald-900/50 hover:to-emerald-800/30
                                   hover:border-emerald-700/60
                                   hover:text-white
                                   hover:shadow-lg hover:shadow-emerald-500/20
                                   active:scale-[0.97]
                                   transition-all duration-200
                                   flex items-center justify-center gap-2
                                   shadow-lg shadow-black/50 backdrop-blur-sm">
                        <span class="text-xl">🏠</span>
                        <span>Meniu</span>
                    </button>
                </div>
            </div>
        `;
    }

    createAchievementBadges(rank) {
        const badges = [];
        
        if (rank === 1) {
            badges.push({ icon: '👑', text: 'Čempionas!', color: 'from-yellow-600 to-yellow-700 border-yellow-400' });
        } else if (rank === 2) {
            badges.push({ icon: '🥈', text: 'Sidabras!', color: 'from-gray-600 to-gray-700 border-gray-400' });
        } else if (rank === 3) {
            badges.push({ icon: '🥉', text: 'Bronza!', color: 'from-orange-600 to-orange-700 border-orange-400' });
        } else if (rank <= 10) {
            badges.push({ icon: '⭐', text: 'Top 10!', color: 'from-purple-600 to-purple-700 border-purple-400' });
        }

        if (badges.length === 0) return '';

        return `
            <div class="flex flex-wrap gap-2 justify-center">
                ${badges.map(badge => `
                    <div class="bg-gradient-to-br ${badge.color}/80
                                border-2 ${badge.color.split(' ')[2]}/60
                                rounded-xl px-4 py-2
                                shadow-lg
                                flex items-center gap-2
                                animate-slide-up">
                        <span class="text-2xl">${badge.icon}</span>
                        <span class="text-white font-bold">${badge.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createPlayerStats() {
        const stats = this.scoreData.playerStats;
        
        return `
            <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                        border-2 border-emerald-800/40 
                        rounded-xl p-4 
                        backdrop-blur-sm shadow-lg shadow-black/50">
                <div class="text-center text-gray-400 text-sm uppercase tracking-wider mb-3">Tavo Statistika</div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-emerald-400">${stats.best_score || stats.score}</div>
                        <div class="text-xs text-gray-400 mt-1">Geriausias</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-emerald-400">${stats.games_played || 1}</div>
                        <div class="text-xs text-gray-400 mt-1">Žaidimai</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-emerald-400">#${stats.rank || this.scoreData.rank}</div>
                        <div class="text-xs text-gray-400 mt-1">Vieta</div>
                    </div>
                </div>
            </div>
        `;
    }

    createMiniLeaderboard() {
        const topFive = this.leaderboard.slice(0, 5);
        
        return `
            <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                        border-2 border-emerald-800/40 
                        rounded-xl p-4 
                        backdrop-blur-sm shadow-lg shadow-black/50">
                <div class="text-center text-gray-400 text-sm uppercase tracking-wider mb-3">Top 5 Lyderiai</div>
                <div class="space-y-2">
                    ${topFive.map((entry, index) => this.createMiniLeaderboardEntry(entry, index + 1)).join('')}
                </div>
            </div>
        `;
    }

    createMiniLeaderboardEntry(entry, rank) {
        const isCurrentPlayer = entry.username === this.username;
        
        return `
            <div class="flex items-center justify-between p-2 rounded-lg
                        ${isCurrentPlayer ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-black/20'}">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span class="text-lg ${rank <= 3 ? 'text-2xl' : ''}">${this.getRankEmoji(rank)}</span>
                    <span class="text-white font-bold truncate ${isCurrentPlayer ? 'text-emerald-400' : ''}">${this.escapeHtml(entry.username)}</span>
                </div>
                <span class="text-emerald-400 font-bold">${entry.score}</span>
            </div>
        `;
    }

    getRankEmoji(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    }

    setupEventListeners() {
        const restartBtn = document.getElementById('gameOverRestartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                modalManager.close();
                if (this.onRestart) this.onRestart();
            });
        }

        const menuBtn = document.getElementById('gameOverMenuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                modalManager.close();
                // Reload page to go back to menu
                window.location.reload();
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
