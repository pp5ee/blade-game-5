// 随机地图生成算法类
class MapGenerator {
    constructor(mapSize = { width: 20, height: 15 }) {
        this.mapSize = mapSize;
        this.map = [];
    }

    generate() {
        // 初始化空地图（全部为可通行区域）
        this.initializeEmptyMap();

        // 生成障碍物
        this.generateObstacles();

        // 确保地图有足够的可通行区域
        this.ensureAccessibility();

        console.log('随机地图生成完成');
        return this.map;
    }

    initializeEmptyMap() {
        this.map = [];
        for (let y = 0; y < this.mapSize.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapSize.width; x++) {
                this.map[y][x] = 0; // 0表示可通行区域
            }
        }
    }

    generateObstacles() {
        // 障碍物密度（0-1之间的值，表示障碍物占地图的比例）
        const obstacleDensity = 0.2;
        const totalCells = this.mapSize.width * this.mapSize.height;
        const targetObstacles = Math.floor(totalCells * obstacleDensity);

        let obstaclesPlaced = 0;

        // 随机放置障碍物
        while (obstaclesPlaced < targetObstacles) {
            const x = Math.floor(Math.random() * this.mapSize.width);
            const y = Math.floor(Math.random() * this.mapSize.height);

            // 确保不在边界上放置障碍物（避免完全封闭区域）
            if (x > 0 && x < this.mapSize.width - 1 &&
                y > 0 && y < this.mapSize.height - 1 &&
                this.map[y][x] === 0) {

                this.map[y][x] = 1; // 1表示障碍物
                obstaclesPlaced++;
            }
        }

        // 添加一些墙壁边界（可选，但保留边界可通行）
        this.addBorderWalls();
    }

    addBorderWalls() {
        // 在地图边缘添加一些墙壁，但保持可通行性
        for (let x = 0; x < this.mapSize.width; x++) {
            // 顶部和底部边界
            if (Math.random() < 0.3) {
                this.map[0][x] = 1; // 顶部边界
            }
            if (Math.random() < 0.3) {
                this.map[this.mapSize.height - 1][x] = 1; // 底部边界
            }
        }

        for (let y = 0; y < this.mapSize.height; y++) {
            // 左侧和右侧边界
            if (Math.random() < 0.3) {
                this.map[y][0] = 1; // 左侧边界
            }
            if (Math.random() < 0.3) {
                this.map[y][this.mapSize.width - 1] = 1; // 右侧边界
            }
        }
    }

    ensureAccessibility() {
        // 使用洪水填充算法检查地图连通性
        const visited = Array(this.mapSize.height).fill().map(
            () => Array(this.mapSize.width).fill(false)
        );

        // 找到一个可通行的起始点
        let startX, startY;
        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                if (this.map[y][x] === 0) {
                    startX = x;
                    startY = y;
                    break;
                }
            }
            if (startX !== undefined) break;
        }

        if (startX === undefined) {
            // 如果没有可通行区域，重置地图
            this.initializeEmptyMap();
            return;
        }

        // 洪水填充
        const queue = [{ x: startX, y: startY }];
        visited[startY][startX] = true;
        let accessibleCells = 1;

        while (queue.length > 0) {
            const current = queue.shift();
            const directions = [
                { dx: 0, dy: -1 }, // 上
                { dx: 0, dy: 1 },  // 下
                { dx: -1, dy: 0 }, // 左
                { dx: 1, dy: 0 }   // 右
            ];

            for (const dir of directions) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;

                if (newX >= 0 && newX < this.mapSize.width &&
                    newY >= 0 && newY < this.mapSize.height &&
                    !visited[newY][newX] &&
                    this.map[newY][newX] === 0) {

                    visited[newY][newX] = true;
                    queue.push({ x: newX, y: newY });
                    accessibleCells++;
                }
            }
        }

        // 检查是否至少有60%的地图是可访问的
        const totalCells = this.mapSize.width * this.mapSize.height;
        const accessibilityRatio = accessibleCells / totalCells;

        if (accessibilityRatio < 0.6) {
            // 可访问区域不足，重新生成地图
            console.log(`地图可访问性不足 (${(accessibilityRatio * 100).toFixed(1)}%)，重新生成...`);
            this.generate();
        } else {
            console.log(`地图可访问性: ${(accessibilityRatio * 100).toFixed(1)}%`);
        }
    }

    // 获取可通行区域的数量
    getPassableCells() {
        let count = 0;
        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                if (this.map[y][x] === 0) {
                    count++;
                }
            }
        }
        return count;
    }

    // 检查特定位置是否可通行
    isPassable(x, y) {
        if (x < 0 || x >= this.mapSize.width || y < 0 || y >= this.mapSize.height) {
            return false;
        }
        return this.map[y][x] === 0;
    }
}