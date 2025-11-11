import { modalManager } from '../components/Modal.js';
import { wsService } from '../../services/WebSocketService.js';

/**
 * Leaderboard Modal - Beautiful real-time leaderboard
 */
export class LeaderboardModal {
    constructor() {
        this.leaderboard = [];
        this.loading = true;
    }

    async show(onClose) {
        // Fetch leaderboard data
        await this.fetchLeaderboard();
        
        const content = this.createContent();
        
        modalManager.show({
            title: '🏆 Lyderių Lentelė',
            content: content,
            onClose: onClose
        });

        setTimeout(() => this.setupEventListeners(), 0);
        
        // Setup real-time updates
        this.setupRealtimeUpdates();
    }

    async fetchLeaderboard() {
        try {
            this.loading = true;
            this.leaderboard = await wsService.getLeaderboard(50);
            this.loading = false;
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            this.leaderboard = [];
            this.loading = false;
        }
    }

    createContent() {
        if (this.loading) {
            return this.createLoadingState();
        }

        if (this.leaderboard.length === 0) {
            return this.createEmptyState();
        }

        return this.createLeaderboardContent();
    }

    createLoadingState() {
        return `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
                <p class="text-gray-400 mt-4">Kraunama...</p>
            </div>
        `;
    }

    createEmptyState() {
        return `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="text-6xl mb-4">🎮</div>
                <p class="text-gray-400 text-lg">Dar nėra rezultatų</p>
                <p class="text-gray-500 text-sm mt-2">Būk pirmas!</p>
            </div>
        `;
    }

    createLeaderboardContent() {
        const topThree = this.leaderboard.slice(0, 3);
        const rest = this.leaderboard.slice(3);

        return `
            <div class="space-y-4">
                <!-- Top 3 Podium -->
                ${topThree.length > 0 ? this.createPodium(topThree) : ''}

                <!-- Rest of leaderboard -->
                <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    ${rest.map((entry, index) => this.createLeaderboardEntry(entry, index + 4)).join('')}
                </div>

                <!-- Stats -->
                <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                            border-2 border-emerald-800/40 
                            rounded-xl p-4 
                            backdrop-blur-sm shadow-lg shadow-black/50">
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold text-emerald-400">${this.leaderboard.length}</div>
                            <div class="text-xs text-gray-400">Žaidėjai</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-emerald-400">${this.leaderboard[0]?.score || 0}</div>
                            <div class="text-xs text-gray-400">Geriausias</div>
                        </div>
                    </div>
                </div>

                <!-- Close Button -->
                <button id="leaderboardBackBtn" 
                        class="w-full px-6 py-3 rounded-xl font-bold text-base
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
                    <span>←</span>
                    <span>Uždaryti</span>
                </button>
            </div>
        `;
    }

    createPodium(topThree) {
        const [first, second, third] = topThree;

        return `
            <div class="grid grid-cols-3 gap-2 mb-6">
                <!-- Second Place -->
                ${second ? `
                    <div class="flex flex-col items-center pt-8">
                        <div class="text-4xl mb-2">🥈</div>
                        <div class="bg-gradient-to-br from-gray-700/80 to-gray-800/80
                                    border-2 border-gray-500/50
                                    rounded-xl p-3 w-full text-center
                                    shadow-lg shadow-gray-500/20">
                            <div class="text-sm font-bold text-white truncate">${this.escapeHtml(second.username)}</div>
                            <div class="text-xl font-bold text-gray-300 mt-1">${second.score}</div>
                            <div class="text-xs text-gray-400 mt-1">${second.games_played || 1} žaidimai</div>
                        </div>
                    </div>
                ` : '<div></div>'}

                <!-- First Place -->
                ${first ? `
                    <div class="flex flex-col items-center">
                        <div class="text-5xl mb-2 animate-bounce">🥇</div>
                        <div class="bg-gradient-to-br from-yellow-600/80 to-yellow-700/80
                                    border-2 border-yellow-400/60
                                    rounded-xl p-4 w-full text-center
                                    shadow-lg shadow-yellow-500/30
                                    transform scale-110">
                            <div class="text-base font-bold text-white truncate">${this.escapeHtml(first.username)}</div>
                            <div class="text-2xl font-bold text-yellow-200 mt-1">${first.score}</div>
                            <div class="text-xs text-yellow-300 mt-1">${first.games_played || 1} žaidimai</div>
                        </div>
                    </div>
                ` : '<div></div>'}

                <!-- Third Place -->
                ${third ? `
                    <div class="flex flex-col items-center pt-12">
                        <div class="text-3xl mb-2">🥉</div>
                        <div class="bg-gradient-to-br from-orange-700/80 to-orange-800/80
                                    border-2 border-orange-600/50
                                    rounded-xl p-3 w-full text-center
                                    shadow-lg shadow-orange-500/20">
                            <div class="text-sm font-bold text-white truncate">${this.escapeHtml(third.username)}</div>
                            <div class="text-xl font-bold text-orange-300 mt-1">${third.score}</div>
                            <div class="text-xs text-orange-400 mt-1">${third.games_played || 1} žaidimai</div>
                        </div>
                    </div>
                ` : '<div></div>'}
            </div>
        `;
    }

    createLeaderboardEntry(entry, rank) {
        return `
            <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                        border-2 border-emerald-800/40 
                        rounded-xl p-3 
                        backdrop-blur-sm shadow-lg shadow-black/50
                        hover:from-emerald-900/50 hover:to-emerald-800/30
                        hover:border-emerald-700/60
                        transition-all duration-200
                        flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="text-lg font-bold text-gray-400 w-8 text-center flex-shrink-0">
                        #${rank}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-white font-bold truncate">${this.escapeHtml(entry.username)}</div>
                        <div class="text-xs text-gray-400">${entry.games_played || 1} žaidimai</div>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <div class="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-1">
                        <div class="text-emerald-400 font-bold">${entry.score}</div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const backBtn = document.getElementById('leaderboardBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.cleanup();
                modalManager.close();
            });
        }
    }

    setupRealtimeUpdates() {
        // Listen for leaderboard updates from WebSocket
        this.updateHandler = (payload) => {
            console.log('Leaderboard updated:', payload);
            this.leaderboard = payload;
            // Could refresh the modal content here if needed
        };

        wsService.on('LEADERBOARD_UPDATE', this.updateHandler);
    }

    cleanup() {
        if (this.updateHandler) {
            wsService.off('LEADERBOARD_UPDATE', this.updateHandler);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
