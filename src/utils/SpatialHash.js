/**
 * SpatialHash - Grid-based spatial partitioning for fast collision detection
 *
 * Instead of checking ALL entities against ALL entities (O(n²)),
 * we only check entities in nearby grid cells (O(n)).
 *
 * Example:
 *   100 entities × 100 entities = 10,000 checks ❌
 *   100 entities, ~5 per cell = 500 checks ✅ (20x faster!)
 *
 * Usage:
 *   const spatialHash = new SpatialHash(800, 600, 100);
 *   spatialHash.insert(entity, x, y, width, height);
 *   const nearby = spatialHash.getNearby(x, y, radius);
 */
export class SpatialHash {
    /**
     * @param {number} worldWidth - World width
     * @param {number} worldHeight - World height
     * @param {number} cellSize - Size of each grid cell (e.g., 100px)
     */
    constructor(worldWidth, worldHeight, cellSize = 100) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(worldWidth / cellSize);
        this.rows = Math.ceil(worldHeight / cellSize);

        // Grid storage: Map<cellKey, Set<entity>>
        this.grid = new Map();

        // Statistics
        this.stats = {
            totalInserts: 0,
            totalQueries: 0,
            avgItemsPerQuery: 0
        };
    }

    /**
     * Get cell key from coordinates
     * @private
     */
    _getCellKey(col, row) {
        return `${col},${row}`;
    }

    /**
     * Get cell coordinates from world position
     * @private
     */
    _getCellCoords(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return { col, row };
    }

    /**
     * Get cells occupied by a bounding box
     * @private
     */
    _getCellsForBounds(x, y, width, height) {
        const minX = x - width / 2;
        const maxX = x + width / 2;
        const minY = y - height / 2;
        const maxY = y + height / 2;

        const minCol = Math.max(0, Math.floor(minX / this.cellSize));
        const maxCol = Math.min(this.cols - 1, Math.floor(maxX / this.cellSize));
        const minRow = Math.max(0, Math.floor(minY / this.cellSize));
        const maxRow = Math.min(this.rows - 1, Math.floor(maxY / this.cellSize));

        const cells = [];
        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow; row++) {
                cells.push(this._getCellKey(col, row));
            }
        }

        return cells;
    }

    /**
     * Insert an entity into the spatial hash
     * @param {*} entity - Entity or object to insert
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} width - Width of bounding box
     * @param {number} height - Height of bounding box
     */
    insert(entity, x, y, width, height) {
        const cells = this._getCellsForBounds(x, y, width, height);

        for (const cellKey of cells) {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, new Set());
            }
            this.grid.get(cellKey).add(entity);
        }

        this.stats.totalInserts++;
    }

    /**
     * Get nearby entities (within radius of a point)
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Search radius
     * @returns {Array} Array of entities
     */
    getNearby(x, y, radius) {
        const cells = this._getCellsForBounds(x, y, radius * 2, radius * 2);
        const nearby = new Set();

        for (const cellKey of cells) {
            const cellEntities = this.grid.get(cellKey);
            if (cellEntities) {
                for (const entity of cellEntities) {
                    nearby.add(entity);
                }
            }
        }

        const result = Array.from(nearby);
        this.stats.totalQueries++;
        this.stats.avgItemsPerQuery =
            (this.stats.avgItemsPerQuery * (this.stats.totalQueries - 1) + result.length) /
            this.stats.totalQueries;

        return result;
    }

    /**
     * Get entities in a specific cell
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Array}
     */
    getCell(x, y) {
        const { col, row } = this._getCellCoords(x, y);
        const cellKey = this._getCellKey(col, row);
        const cellEntities = this.grid.get(cellKey);
        return cellEntities ? Array.from(cellEntities) : [];
    }

    /**
     * Clear all entities from the grid
     */
    clear() {
        this.grid.clear();
    }

    /**
     * Get statistics
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            totalCells: this.cols * this.rows,
            occupiedCells: this.grid.size,
            occupancyRate: ((this.grid.size / (this.cols * this.rows)) * 100).toFixed(1) + '%'
        };
    }

    /**
     * Log statistics
     */
    logStats() {
        console.log('[SpatialHash] Stats:', this.getStats());
    }
}
