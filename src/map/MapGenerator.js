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
            obstacleDensity: 0.15,      // 障碍物密度
            safeZoneRadius: 100,        // 玩家安全区域半径
            terrainTypes: ['grass', 'dirt', 'stone', 'water'],
            structureTypes: ['wall', 'rock', 'tree', 'ruins']
        };

        // 地图数据
        this.mapData = null;
        this.obstacles = [];
        this.terrain = [];
        this.structures = [];

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

        // 重置地图数据
        this.obstacles = [];
        this.terrain = [];
        this.structures = [];

        // 初始化网格
        for (let y = 0; y < gridHeight; y++) {
            this.mapData.grid[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                this.mapData.grid[y][x] = {
                    isObstacle: false,
                    terrainType: 'grass',
                    x: x * this.config.gridSize,
                    y: y * this.config.gridSize
                };
            }
        }

        // 生成地形
        this.generateTerrain();

        // 生成障碍物
        this.generateObstacles();

        // 生成结构
        this.generateStructures();

        console.log(`地图生成完成: ${gridWidth}x${gridHeight} 网格，包含 ${this.obstacles.length} 个障碍物，${this.structures.length} 个结构`);
    }

    /**
     * 生成障碍物
     * 改进为更真实的随机障碍物生成，避免过度聚集
     */
    generateObstacles() {
        const totalCells = this.mapData.gridWidth * this.mapData.gridHeight;
        const obstacleCount = Math.floor(totalCells * this.config.obstacleDensity);

        this.obstacles = [];
        const playerStartPos = this.getPlayerStartPosition();
        const gridPlayerX = Math.floor(playerStartPos.x / this.config.gridSize);
        const gridPlayerY = Math.floor(playerStartPos.y / this.config.gridSize);

        let attempts = 0;
        const maxAttempts = obstacleCount * 2;

        while (this.obstacles.length < obstacleCount && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.mapData.gridWidth);
            const y = Math.floor(Math.random() * this.mapData.gridHeight);

            // 计算与玩家的网格距离
            const gridDistance = Math.sqrt(
                Math.pow(x - gridPlayerX, 2) + Math.pow(y - gridPlayerY, 2)
            );

            // 确保安全区域（玩家周围3格内无障碍物）
            if (gridDistance > 3 && !this.mapData.grid[y][x].isObstacle) {
                // 检查周围是否有障碍物（避免过度聚集）
                const hasNearbyObstacle = this.checkNearbyObstacles(x, y, 2);

                if (!hasNearbyObstacle) {
                    this.mapData.grid[y][x].isObstacle = true;
                    this.obstacles.push({
                        x: x * this.config.gridSize,
                        y: y * this.config.gridSize,
                        width: this.config.gridSize,
                        height: this.config.gridSize
                    });
                }
            }

            attempts++;
        }

        console.log(`生成了 ${this.obstacles.length} 个障碍物（尝试次数: ${attempts}）`);
    }

    /**
     * 检查周围是否有障碍物
     */
    checkNearbyObstacles(x, y, radius) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < this.mapData.gridWidth &&
                    ny >= 0 && ny < this.mapData.gridHeight) {
                    if (this.mapData.grid[ny][nx].isObstacle) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 生成地形
     * 改进为使用简单的噪声算法生成更自然的地形分布
     */
    generateTerrain() {
        const gridWidth = this.mapData.gridWidth;
        const gridHeight = this.mapData.gridHeight;

        // 使用简单的噪声生成更自然的地形
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                // 使用改进的噪声算法
                const noiseValue = this.getNoiseValue(x, y, gridWidth, gridHeight);

                // 根据地形成型分布
                if (noiseValue < 0.5) {
                    this.mapData.grid[y][x].terrainType = 'grass'; // 草地占50%
                } else if (noiseValue < 0.7) {
                    this.mapData.grid[y][x].terrainType = 'dirt';  // 泥土占20%
                } else if (noiseValue < 0.9) {
                    this.mapData.grid[y][x].terrainType = 'stone'; // 石头占20%
                } else {
                    this.mapData.grid[y][x].terrainType = 'water'; // 水占10%
                    this.mapData.grid[y][x].isObstacle = true;     // 水是障碍物
                }

                // 记录地形信息
                this.terrain.push({
                    x: x * this.config.gridSize,
                    y: y * this.config.gridSize,
                    width: this.config.gridSize,
                    height: this.config.gridSize,
                    type: this.mapData.grid[y][x].terrainType
                });
            }
        }

        console.log('地形生成完成');
    }

    /**
     * 获取噪声值（简化版Perlin噪声替代）
     */
    getNoiseValue(x, y, width, height) {
        // 使用简单的多频率噪声来生成更自然的地形
        const frequency1 = 0.1;
        const frequency2 = 0.05;
        const frequency3 = 0.02;

        const noise1 = Math.sin(x * frequency1 + y * frequency1) * 0.5 + 0.5;
        const noise2 = Math.sin(x * frequency2 + y * frequency2) * 0.3 + 0.3;
        const noise3 = Math.sin(x * frequency3 + y * frequency3) * 0.2 + 0.2;

        // 混合不同频率的噪声
        return (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) + Math.random() * 0.1;
    }

    /**
     * 生成结构
     */
    generateStructures() {
        const gridWidth = this.mapData.gridWidth;
        const gridHeight = this.mapData.gridHeight;
        const structureCount = Math.floor((gridWidth * gridHeight) * 0.05); // 5%的格子生成结构

        for (let i = 0; i < structureCount; i++) {
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(Math.random() * gridHeight);

            // 跳过玩家安全区域
            const playerStartPos = this.getPlayerStartPosition();
            const distance = Math.sqrt(
                Math.pow(x * this.config.gridSize - playerStartPos.x, 2) +
                Math.pow(y * this.config.gridSize - playerStartPos.y, 2)
            );

            if (distance > this.config.safeZoneRadius && !this.mapData.grid[y][x].isObstacle) {
                const structureType = this.config.structureTypes[
                    Math.floor(Math.random() * this.config.structureTypes.length)
                ];

                // 标记为障碍物
                this.mapData.grid[y][x].isObstacle = true;

                this.structures.push({
                    x: x * this.config.gridSize,
                    y: y * this.config.gridSize,
                    width: this.config.gridSize,
                    height: this.config.gridSize,
                    type: structureType
                });
            }
        }

        console.log(`生成了 ${this.structures.length} 个结构`);
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
        // 绘制地形
        this.renderTerrain(ctx);

        // 绘制网格（调试模式）
        if (this.game.state === 'debug') {
            this.renderGrid(ctx);
        }

        // 绘制障碍物
        this.renderObstacles(ctx);

        // 绘制结构
        this.renderStructures(ctx);
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

    /**
     * 渲染地形
     */
    renderTerrain(ctx) {
        const terrainColors = {
            grass: '#2a7d2a',
            dirt: '#8b6b3c',
            stone: '#6b6b6b',
            water: '#1e5a8a'
        };

        for (const terrain of this.terrain) {
            ctx.fillStyle = terrainColors[terrain.type] || '#2a7d2a';
            ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);

            // 添加纹理效果
            if (terrain.type === 'grass') {
                ctx.fillStyle = 'rgba(60, 179, 113, 0.3)';
            } else if (terrain.type === 'dirt') {
                ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
            } else if (terrain.type === 'stone') {
                ctx.fillStyle = 'rgba(169, 169, 169, 0.3)';
            } else if (terrain.type === 'water') {
                ctx.fillStyle = 'rgba(30, 144, 255, 0.3)';
            }

            // 添加纹理点
            for (let i = 0; i < 4; i++) {
                const dotX = terrain.x + Math.random() * terrain.width;
                const dotY = terrain.y + Math.random() * terrain.height;
                const dotSize = Math.random() * 3 + 1;
                ctx.fillRect(dotX, dotY, dotSize, dotSize);
            }
        }
    }

    /**
     * 渲染结构
     */
    renderStructures(ctx) {
        const structureColors = {
            wall: '#8b7355',
            rock: '#696969',
            tree: '#228b22',
            ruins: '#a0522d'
        };

        for (const structure of this.structures) {
            ctx.fillStyle = structureColors[structure.type] || '#8b7355';
            ctx.fillRect(structure.x, structure.y, structure.width, structure.height);

            // 添加结构细节
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(structure.x, structure.y, structure.width, structure.height);

            // 根据结构类型添加不同细节
            if (structure.type === 'tree') {
                // 绘制树冠
                ctx.fillStyle = '#006400';
                ctx.beginPath();
                ctx.arc(structure.x + structure.width/2, structure.y + structure.height/3, structure.width/2, 0, Math.PI * 2);
                ctx.fill();
            } else if (structure.type === 'rock') {
                // 岩石纹理
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                for (let i = 0; i < 3; i++) {
                    const rockX = structure.x + Math.random() * structure.width;
                    const rockY = structure.y + Math.random() * structure.height;
                    const rockSize = Math.random() * 5 + 2;
                    ctx.fillRect(rockX, rockY, rockSize, rockSize);
                }
            }
        }
    }
}