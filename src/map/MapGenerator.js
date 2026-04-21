/**
 * 转刀刀游戏 - 地图生成器
 * 负责生成随机地图和实体位置
 */

export class MapGenerator {
    constructor(game) {
        this.game = game;

        // 地图配置
        this.config = {
            gridSize: 50,
            obstacleDensity: 0.15,  // 障碍物密度
            safeZoneRadius: 100      // 玩家安全区域半径
        };

        // 地图数据
        this.mapData = null;
        this.obstacles = [];

        // 生成初始地图
        this.generateMap();

        console.log('地图生成器初始化完成');
    }

    /**
     * 生成随机地图
     */
    generateMap() {
        const gridWidth = Math.ceil(this.game.config.canvasWidth / this.config.gridSize);
        const gridHeight = Math.ceil(this.game.config.canvasHeight / this.config.gridSize);

        this.mapData = {
            gridWidth: gridWidth,
            gridHeight: gridHeight,
            grid: []
        };

        // 初始化网格
        for (let y = 0; y < gridHeight; y++) {
            this.mapData.grid[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                this.mapData.grid[y][x] = {
                    isObstacle: false,
                    x: x * this.config.gridSize,
                    y: y * this.config.gridSize
                };
            }
        }

        // 生成障碍物
        this.generateObstacles();

        console.log(`地图生成完成: ${gridWidth}x${gridHeight} 网格`);
    }

    /**
     * 生成障碍物
     */
    generateObstacles() {
        const totalCells = this.mapData.gridWidth * this.mapData.gridHeight;
        const obstacleCount = Math.floor(totalCells * this.config.obstacleDensity);

        this.obstacles = [];

        for (let i = 0; i < obstacleCount; i++) {
            const x = Math.floor(Math.random() * this.mapData.gridWidth);
            const y = Math.floor(Math.random() * this.mapData.gridHeight);

            // 跳过玩家安全区域
            const playerStartPos = this.getPlayerStartPosition();
            const distance = Math.sqrt(
                Math.pow(x * this.config.gridSize - playerStartPos.x, 2) +
                Math.pow(y * this.config.gridSize - playerStartPos.y, 2)
            );

            if (distance > this.config.safeZoneRadius) {
                this.mapData.grid[y][x].isObstacle = true;
                this.obstacles.push({
                    x: x * this.config.gridSize,
                    y: y * this.config.gridSize,
                    width: this.config.gridSize,
                    height: this.config.gridSize
                });
            }
        }

        console.log(`生成了 ${this.obstacles.length} 个障碍物`);
    }

    /**
     * 获取玩家起始位置
     */
    getPlayerStartPosition() {
        // 玩家出生在屏幕中心区域
        const centerX = this.game.config.canvasWidth / 2;
        const centerY = this.game.config.canvasHeight / 2;

        return {
            x: centerX - 15, // 减去玩家宽度的一半
            y: centerY - 15  // 减去玩家高度的一半
        };
    }

    /**
     * 获取NPC生成位置
     */
    getNpcSpawnPosition() {
        // 确保NPC生成在玩家安全区域外
        const playerPos = this.getPlayerStartPosition();
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const x = Math.random() * (this.game.config.canvasWidth - 30);
            const y = Math.random() * (this.game.config.canvasHeight - 30);

            // 检查距离玩家是否足够远
            const distance = Math.sqrt(
                Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2)
            );

            if (distance > this.config.safeZoneRadius && !this.isPositionBlocked(x, y)) {
                return { x: x, y: y };
            }

            attempts++;
        }

        // 如果找不到合适位置，返回地图边缘
        return {
            x: Math.random() < 0.5 ? 50 : this.game.config.canvasWidth - 80,
            y: Math.random() < 0.5 ? 50 : this.game.config.canvasHeight - 80
        };
    }

    /**
     * 获取刀生成位置
     */
    getKnifeSpawnPosition() {
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            const x = Math.random() * (this.game.config.canvasWidth - 20);
            const y = Math.random() * (this.game.config.canvasHeight - 20);

            if (!this.isPositionBlocked(x, y)) {
                return { x: x, y: y };
            }

            attempts++;
        }

        // 默认位置
        return {
            x: Math.random() * (this.game.config.canvasWidth - 20),
            y: Math.random() * (this.game.config.canvasHeight - 20)
        };
    }

    /**
     * 检查位置是否被阻挡
     */
    isPositionBlocked(x, y) {
        // 检查是否与障碍物重叠
        for (const obstacle of this.obstacles) {
            if (x < obstacle.x + obstacle.width &&
                x + 20 > obstacle.x &&
                y < obstacle.y + obstacle.height &&
                y + 20 > obstacle.y) {
                return true;
            }
        }

        // 检查是否与现有实体太近
        const entities = [...this.game.npcs, ...this.game.knives];
        for (const entity of entities) {
            const distance = Math.sqrt(
                Math.pow(x - entity.x, 2) + Math.pow(y - entity.y, 2)
            );

            if (distance < 40) { // 最小间距
                return true;
            }
        }

        return false;
    }

    /**
     * 获取可行走路径
     */
    getWalkablePath(startX, startY, endX, endY) {
        // 简单的A*路径查找算法（简化版）
        // 这里实现一个简化的版本，实际游戏中可能需要更复杂的路径查找

        const path = [];
        let currentX = startX;
        let currentY = startY;

        // 简单的直线移动，遇到障碍物时绕行
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const steps = Math.ceil(distance / 10);
            const stepX = dx / steps;
            const stepY = dy / steps;

            for (let i = 0; i <= steps; i++) {
                const nextX = startX + stepX * i;
                const nextY = startY + stepY * i;

                // 检查是否遇到障碍物
                if (!this.isPositionBlocked(nextX, nextY)) {
                    path.push({ x: nextX, y: nextY });
                } else {
                    // 遇到障碍物，尝试绕行
                    const alternative = this.findAlternativePath(currentX, currentY, nextX, nextY);
                    path.push(...alternative);
                }

                currentX = nextX;
                currentY = nextY;
            }
        }

        return path;
    }

    /**
     * 寻找替代路径
     */
    findAlternativePath(fromX, fromY, toX, toY) {
        const alternatives = [];

        // 尝试四个方向的绕行
        const directions = [
            { x: 1, y: 0 },  // 右
            { x: -1, y: 0 }, // 左
            { x: 0, y: 1 },  // 下
            { x: 0, y: -1 }  // 上
        ];

        for (const dir of directions) {
            const testX = fromX + dir.x * this.config.gridSize;
            const testY = fromY + dir.y * this.config.gridSize;

            if (!this.isPositionBlocked(testX, testY)) {
                alternatives.push({ x: testX, y: testY });
                break;
            }
        }

        return alternatives.length > 0 ? alternatives : [{ x: fromX, y: fromY }];
    }

    /**
     * 渲染地图
     */
    render(ctx) {
        // 绘制网格（调试模式）
        if (this.game.state === 'debug') {
            this.renderGrid(ctx);
        }

        // 绘制障碍物
        this.renderObstacles(ctx);
    }

    /**
     * 渲染网格
     */
    renderGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // 绘制垂直线
        for (let x = 0; x <= this.game.config.canvasWidth; x += this.config.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.game.config.canvasHeight);
            ctx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= this.game.config.canvasHeight; y += this.config.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.game.config.canvasWidth, y);
            ctx.stroke();
        }
    }

    /**
     * 渲染障碍物
     */
    renderObstacles(ctx) {
        ctx.fillStyle = '#2a2d3e';
        ctx.strokeStyle = '#3a3d4e';
        ctx.lineWidth = 2;

        for (const obstacle of this.obstacles) {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // 障碍物纹理
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const dotSize = 2;
                    const dotX = obstacle.x + i * (obstacle.width / 3) + (obstacle.width / 6) - dotSize / 2;
                    const dotY = obstacle.y + j * (obstacle.height / 3) + (obstacle.height / 6) - dotSize / 2;
                    ctx.fillRect(dotX, dotY, dotSize, dotSize);
                }
            }
            ctx.fillStyle = '#2a2d3e';
        }
    }

    /**
     * 重置地图
     */
    reset() {
        this.generateMap();
        console.log('地图重置完成');
    }
}