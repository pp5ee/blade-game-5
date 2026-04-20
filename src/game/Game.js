// 游戏主循环和状态管理类
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 游戏状态
        this.isRunning = false;
        this.gameLoop = null;
        this.gameState = 'playing'; // playing, gameOver, won

        // 游戏实体
        this.map = null;
        this.player = null;
        this.npcs = [];
        this.knives = [];

        // 游戏配置
        this.config = {
            mapSize: { width: 20, height: 15 }, // 20x15网格
            cellSize: 40, // 每个网格40像素
            maxNPCs: 5,
            maxKnives: 15,
            npcSpawnRate: 0.3,
            knifeSpawnRate: 0.6,
            debugMode: false // 性能调试模式
        };

        // 初始化游戏
        this.initializeGame();
    }

    initializeGame() {
        // 生成随机地图
        this.map = new MapGenerator(this.config.mapSize).generate();

        // 创建玩家
        this.player = new Player(this.map, this.config);

        // 生成NPC
        this.generateNPCs();

        // 生成刀
        this.generateKnives();

        // 初始化战斗系统
        this.combatSystem = new CombatSystem();

        console.log('游戏初始化完成');
    }

    generateNPCs() {
        this.npcs = [];
        for (let i = 0; i < this.config.maxNPCs; i++) {
            const npc = new NPC(this.map, this.config, this.player);
            if (npc.position) {
                this.npcs.push(npc);
            }
        }
    }

    generateKnives() {
        this.knives = [];
        const colors = ['red', 'yellow', 'blue'];

        for (let i = 0; i < this.config.maxKnives; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const knife = {
                position: this.getRandomEmptyPosition(),
                color: color,
                collected: false
            };

            if (knife.position) {
                this.knives.push(knife);
            }
        }
    }

    getRandomEmptyPosition() {
        const emptyPositions = [];

        for (let y = 0; y < this.config.mapSize.height; y++) {
            for (let x = 0; x < this.config.mapSize.width; x++) {
                if (this.map[y][x] === 0) { // 可通行区域
                    const position = { x, y };

                    // 检查是否与现有实体冲突
                    const isOccupied = [
                        this.player?.position,
                        ...this.npcs.map(npc => npc.position),
                        ...this.knives.map(knife => knife.position)
                    ].some(pos => pos && pos.x === x && pos.y === y);

                    if (!isOccupied) {
                        emptyPositions.push(position);
                    }
                }
            }
        }

        return emptyPositions.length > 0
            ? emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
            : null;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.gameState = 'playing';
        this.lastFrameTime = performance.now();
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        const gameLoop = (currentTime) => {
            if (!this.isRunning) return;

            // 控制帧率 - 确保稳定60FPS
            const deltaTime = currentTime - this.lastFrameTime;
            const minFrameTime = 1000 / 60; // 16.67ms per frame for 60FPS

            if (deltaTime < minFrameTime) {
                requestAnimationFrame(gameLoop);
                return;
            }

            this.lastFrameTime = currentTime;

            // 更新性能统计
            this.updatePerformanceStats(currentTime);

            // 优化更新：使用性能优化的更新方法
            this.optimizedUpdate();
            this.optimizedRender();

            requestAnimationFrame(gameLoop);
        };

        this.gameLoop = gameLoop;
        requestAnimationFrame(gameLoop);
    }

    stop() {
        this.isRunning = false;
        this.gameLoop = null;
    }

    reset() {
        // 停止当前游戏
        this.stop();

        // 重置游戏状态
        this.gameState = 'playing';

        // 重新初始化游戏
        this.initializeGame();

        console.log('游戏重置完成');
    }

    // 性能优化方法
    optimizedUpdate() {
        // 更新玩家
        this.player.update();

        // 优化NPC更新：减少不必要的计算
        this.npcs.forEach(npc => {
            if (npc.isAlive) {
                // 简单的距离检查，避免更新太远的NPC
                const distanceToPlayer = Math.abs(npc.position.x - this.player.position.x) +
                                       Math.abs(npc.position.y - this.player.position.y);

                if (distanceToPlayer <= 10) { // 只更新距离玩家10格以内的NPC
                    npc.update();
                }
            }
        });

        // 优化碰撞检测
        this.optimizedCheckCollisions();
        this.checkCombat();
        this.checkGameEnd();
    }

    optimizedCheckCollisions() {
        // 玩家收集刀 - 优化检查逻辑
        const playerX = this.player.position.x;
        const playerY = this.player.position.y;

        this.knives.forEach(knife => {
            if (!knife.collected &&
                knife.position.x === playerX &&
                knife.position.y === playerY) {

                knife.collected = true;
                this.player.collectKnife(knife.color);
                console.log(`玩家收集了${knife.color}色刀`);
            }
        });

        // 移除已收集的刀
        this.knives = this.knives.filter(knife => !knife.collected);
    }

    optimizedRender() {
        // 清空画布
        this.ctx.fillStyle = '#0d1930';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 渲染地图
        this.renderMap();

        // 渲染刀
        this.renderKnives();

        // 渲染NPC
        this.renderNPCs();

        // 渲染玩家
        this.renderPlayer();

        // 渲染性能信息（调试用）
        this.renderPerformanceInfo();
    }

    updatePerformanceStats(currentTime) {
        this.frameCount++;

        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    renderPerformanceInfo() {
        // 在开发模式下显示性能信息
        if (this.config.debugMode) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Courier New';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
            this.ctx.fillText(`NPCs: ${this.npcs.filter(npc => npc.isAlive).length}`, 10, 35);
            this.ctx.fillText(`Knives: ${this.knives.length}`, 10, 50);
        }
    }

    // 增强的位置验证方法
    isValidPosition(x, y) {
        // 检查边界
        if (x < 0 || x >= this.config.mapSize.width ||
            y < 0 || y >= this.config.mapSize.height) {
            return false;
        }

        // 检查障碍物
        if (this.map[y][x] !== 0) {
            return false;
        }

        // 检查实体冲突
        return !this.isPositionOccupied(x, y);
    }

    isPositionOccupied(x, y) {
        // 检查玩家位置
        if (this.player && this.player.position.x === x && this.player.position.y === y) {
            return true;
        }

        // 检查NPC位置
        for (const npc of this.npcs) {
            if (npc.isAlive && npc.position.x === x && npc.position.y === y) {
                return true;
            }
        }

        // 检查刀位置
        for (const knife of this.knives) {
            if (!knife.collected && knife.position.x === x && knife.position.y === y) {
                return true;
            }
        }

        return false;
    }

    update() {
        // 更新玩家
        this.player.update();

        // 更新NPC
        this.npcs.forEach(npc => npc.update());

        // 检查碰撞
        this.checkCollisions();

        // 检查战斗
        this.checkCombat();

        // 检查游戏结束条件
        this.checkGameEnd();
    }

    checkCollisions() {
        // 玩家收集刀
        this.knives.forEach(knife => {
            if (!knife.collected &&
                this.player.position.x === knife.position.x &&
                this.player.position.y === knife.position.y) {

                knife.collected = true;
                this.player.collectKnife(knife.color);
                console.log(`玩家收集了${knife.color}色刀`);
            }
        });

        // 移除已收集的刀
        this.knives = this.knives.filter(knife => !knife.collected);
    }

    checkCombat() {
        // 检查玩家与NPC的战斗
        this.npcs.forEach(npc => {
            if (npc.isAlive &&
                this.player.position.x === npc.position.x &&
                this.player.position.y === npc.position.y) {

                const result = this.combatSystem.resolveCombat(this.player, npc);

                if (result.winner === 'player') {
                    npc.isAlive = false;
                    this.player.knives = { ...this.player.knives, ...npc.knives };
                    console.log('玩家击败了NPC！');
                } else if (result.winner === 'npc') {
                    this.gameState = 'gameOver';
                    this.isRunning = false;
                    console.log('玩家被击败！游戏结束。');
                }
            }
        });

        // 移除死亡的NPC
        this.npcs = this.npcs.filter(npc => npc.isAlive);
    }

    checkGameEnd() {
        // 检查是否所有NPC都被击败
        if (this.npcs.length === 0 && this.gameState === 'playing') {
            this.gameState = 'won';
            this.isRunning = false;
            console.log('恭喜！你击败了所有NPC！');
        }
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#0d1930';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 渲染地图
        this.renderMap();

        // 渲染刀
        this.renderKnives();

        // 渲染NPC
        this.renderNPCs();

        // 渲染玩家
        this.renderPlayer();
    }

    renderMap() {
        const { cellSize } = this.config;

        for (let y = 0; y < this.config.mapSize.height; y++) {
            for (let x = 0; x < this.config.mapSize.width; x++) {
                const tileX = x * cellSize;
                const tileY = y * cellSize;

                if (this.map[y][x] === 0) { // 可通行区域
                    this.ctx.fillStyle = '#1a1a2e';
                } else { // 障碍物
                    this.ctx.fillStyle = '#0f3460';
                }

                this.ctx.fillRect(tileX, tileY, cellSize, cellSize);

                // 网格线
                this.ctx.strokeStyle = '#16213e';
                this.ctx.strokeRect(tileX, tileY, cellSize, cellSize);
            }
        }
    }

    renderKnives() {
        const { cellSize } = this.config;

        this.knives.forEach(knife => {
            if (!knife.collected) {
                const x = knife.position.x * cellSize + cellSize / 2;
                const y = knife.position.y * cellSize + cellSize / 2;

                // 绘制刀（简单的圆形表示）
                this.ctx.fillStyle = knife.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, cellSize / 4, 0, Math.PI * 2);
                this.ctx.fill();

                // 刀柄（白色小点）
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(x, y, cellSize / 8, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    renderNPCs() {
        const { cellSize } = this.config;

        this.npcs.forEach(npc => {
            if (npc.isAlive) {
                const x = npc.position.x * cellSize + cellSize / 2;
                const y = npc.position.y * cellSize + cellSize / 2;

                // 绘制NPC（红色方块）
                this.ctx.fillStyle = '#e94560';
                this.ctx.fillRect(
                    x - cellSize / 3,
                    y - cellSize / 3,
                    cellSize * 2 / 3,
                    cellSize * 2 / 3
                );

                // NPC眼睛（白色小点）
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(x - 5, y - 5, 2, 0, Math.PI * 2);
                this.ctx.arc(x + 5, y - 5, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    renderPlayer() {
        const { cellSize } = this.config;
        const x = this.player.position.x * cellSize + cellSize / 2;
        const y = this.player.position.y * cellSize + cellSize / 2;

        // 绘制玩家（绿色圆形）
        this.ctx.fillStyle = '#06d6a0';
        this.ctx.beginPath();
        this.ctx.arc(x, y, cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();

        // 玩家方向指示器（白色三角形）
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - cellSize / 4);
        this.ctx.lineTo(x - 3, y - cellSize / 8);
        this.ctx.lineTo(x + 3, y - cellSize / 8);
        this.ctx.closePath();
        this.ctx.fill();
    }
}