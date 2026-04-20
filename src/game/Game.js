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
            knifeSpawnRate: 0.6
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

        const gameLoop = () => {
            if (!this.isRunning) return;

            this.update();
            this.render();

            requestAnimationFrame(gameLoop);
        };

        this.gameLoop = gameLoop;
        gameLoop();
    }

    stop() {
        this.isRunning = false;
        this.gameLoop = null;
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