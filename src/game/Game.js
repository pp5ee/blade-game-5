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

        // 性能优化
        this.optimizationManager = null;

        // 游戏配置
        this.config = {
            mapSize: { width: 20, height: 15 }, // 20x15网格
            cellSize: 40, // 每个网格40像素
            maxNPCs: 5,
            maxKnives: 15,
            npcSpawnRate: 0.3,
            knifeSpawnRate: 0.6,
            debugMode: false, // 性能调试模式
            
            // 刀生成概率配置
            knifeProbabilities: {
                red: 0.1,   // 红色刀10%概率
                yellow: 0.3, // 黄色刀30%概率
                blue: 0.6   // 蓝色刀60%概率
            },
            
            // 动态难度配置
            dynamicDifficulty: {
                enabled: true,
                minNPCs: 3,
                maxNPCs: 8,
                difficultyScale: 0.1 // 每收集一把刀，NPC数量增加0.1
            }
        };

        // 初始化游戏
        this.initializeGame();

        // 初始化性能优化管理器
        this.optimizationManager = new OptimizationManager(this);
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
        
        // 动态调整NPC数量
        let targetNpcs = this.config.maxNPCs;
        if (this.config.dynamicDifficulty.enabled) {
            const playerKnives = this.player.getTotalKnives();
            targetNpcs = Math.floor(
                this.config.dynamicDifficulty.minNPCs + 
                playerKnives * this.config.dynamicDifficulty.difficultyScale
            );
            targetNpcs = Math.min(targetNpcs, this.config.dynamicDifficulty.maxNPCs);
            targetNpcs = Math.max(targetNpcs, this.config.dynamicDifficulty.minNPCs);
        }

        for (let i = 0; i < targetNpcs; i++) {
            const npc = new NPC(this.map, this.config, this.player);
            if (npc.position) {
                this.npcs.push(npc);
            }
        }
    }

    generateKnives() {
        this.knives = [];
        const colors = ['red', 'yellow', 'blue'];
        const probabilities = this.config.knifeProbabilities;

        for (let i = 0; i < this.config.maxKnives; i++) {
            // 根据概率分布选择刀颜色
            const rand = Math.random();
            let color = 'blue'; // 默认蓝色
            
            if (rand < probabilities.red) {
                color = 'red';
            } else if (rand < probabilities.red + probabilities.yellow) {
                color = 'yellow';
            }

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
        console.log('游戏开始');

        // 绑定键盘事件
        this.bindInputEvents();

        // 启动游戏循环
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        console.log('游戏停止');
    }

    update() {
        if (!this.isRunning) return;

        // 更新游戏状态
        this.updateEntities();
        this.checkCollisions();
        this.checkCombat();
        this.render();

        // 继续游戏循环
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    updateEntities() {
        // 更新玩家
        if (this.player) {
            this.player.update();
        }

        // 更新NPC
        this.npcs.forEach(npc => {
            if (npc) {
                npc.update();
            }
        });

        // 性能优化监控
        if (this.optimizationManager) {
            this.optimizationManager.monitorPerformance();
        }
    }

    checkCollisions() {
        // 检查玩家与刀的碰撞
        this.knives.forEach(knife => {
            if (!knife.collected && this.player && this.player.position &&
                knife.position && this.player.position.x === knife.position.x &&
                this.player.position.y === knife.position.y) {

                this.player.collectKnife(knife.color);
                knife.collected = true;
                console.log(`玩家收集到${knife.color}色刀`);
            }
        });

        // 移除已收集的刀
        this.knives = this.knives.filter(knife => !knife.collected);

        // 如果刀数量不足，补充生成
        if (this.knives.length < this.config.maxKnives / 2) {
            this.generateAdditionalKnives();
        }
    }

    checkCombat() {
        if (!this.player || !this.combatSystem || !this.player.isAlive) return;

        // 检查玩家与NPC的战斗
        for (let i = this.npcs.length - 1; i >= 0; i--) {
            const npc = this.npcs[i];

            if (npc && npc.position && this.player.position &&
                npc.position.x === this.player.position.x &&
                npc.position.y === this.player.position.y &&
                npc.isAlive) {

                console.log('战斗开始：玩家 vs NPC');
                const result = this.combatSystem.resolveCombat(this.player, npc);

                if (result.winner === 'attacker' && result.playerWon) {
                    // 玩家获胜，获得NPC的刀
                    for (const color in npc.knives) {
                        if (npc.knives.hasOwnProperty(color)) {
                            this.player.knives[color] += npc.knives[color];
                        }
                    }
                    npc.isAlive = false;
                    this.npcs.splice(i, 1);
                    console.log('玩家击败NPC，获得战利品');

                    // 更新UI
                    if (window.gameUI) {
                        window.gameUI.updatePlayerStats(this.player);
                    }

                } else if (result.winner === 'defender' && !result.playerWon) {
                    // NPC获胜，游戏结束
                    this.player.isAlive = false;
                    this.gameState = 'gameOver';
                    this.stop();
                    console.log('游戏结束：玩家被击败');

                    // 更新UI显示游戏结束
                    if (window.gameUI) {
                        window.gameUI.updateGameStatus('游戏结束 - 你被击败了！');
                    }
                    break;
                }
            }
        }

        // 如果NPC数量不足，补充生成
        if (this.npcs.length < this.config.dynamicDifficulty.minNPCs) {
            this.generateAdditionalNPCs();
        }
    }

    generateAdditionalKnives() {
        const neededKnives = this.config.maxKnives - this.knives.length;
        for (let i = 0; i < neededKnives; i++) {
            const knife = this.createRandomKnife();
            if (knife) {
                this.knives.push(knife);
            }
        }
    }

    generateAdditionalNPCs() {
        const neededNpcs = Math.floor(this.config.dynamicDifficulty.minNPCs - this.npcs.length);
        for (let i = 0; i < neededNpcs; i++) {
            const npc = new NPC(this.map, this.config, this.player);
            if (npc.position) {
                this.npcs.push(npc);
            }
        }
    }

    createRandomKnife() {
        const colors = ['red', 'yellow', 'blue'];
        const probabilities = this.config.knifeProbabilities;

        const rand = Math.random();
        let color = 'blue';

        if (rand < probabilities.red) {
            color = 'red';
        } else if (rand < probabilities.red + probabilities.yellow) {
            color = 'yellow';
        }

        const position = this.getRandomEmptyPosition();
        if (!position) return null;

        return {
            position: position,
            color: color,
            collected: false
        };
    }

    bindInputEvents() {
        document.addEventListener('keydown', (event) => {
            if (this.player) {
                this.player.handleInput(event);
            }
        });
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 渲染地图
        this.renderMap();

        // 渲染刀
        this.renderKnives();

        // 渲染NPC
        this.renderNPCs();

        // 渲染玩家
        if (this.player) {
            this.player.render(this.ctx);
        }

        // 渲染UI
        if (window.gameUI) {
            window.gameUI.render(this.player, this.gameState);
        }
    }

    renderMap() {
        const cellSize = this.config.cellSize;

        for (let y = 0; y < this.config.mapSize.height; y++) {
            for (let x = 0; x < this.config.mapSize.width; x++) {
                const tileType = this.map[y][x];
                const xPos = x * cellSize;
                const yPos = y * cellSize;

                // 绘制地面或障碍物
                if (tileType === 0) { // 可通行区域
                    this.ctx.fillStyle = '#2a2a2a';
                } else { // 障碍物
                    this.ctx.fillStyle = '#555555';
                }

                this.ctx.fillRect(xPos, yPos, cellSize, cellSize);
                this.ctx.strokeStyle = '#444444';
                this.ctx.strokeRect(xPos, yPos, cellSize, cellSize);
            }
        }
    }

    renderKnives() {
        const cellSize = this.config.cellSize;

        this.knives.forEach(knife => {
            if (!knife.collected && knife.position) {
                const xPos = knife.position.x * cellSize + cellSize / 2;
                const yPos = knife.position.y * cellSize + cellSize / 2;
                const radius = cellSize / 4;

                // 根据颜色设置刀的外观
                switch (knife.color) {
                    case 'red':
                        this.ctx.fillStyle = '#ff4444';
                        break;
                    case 'yellow':
                        this.ctx.fillStyle = '#ffff44';
                        break;
                    case 'blue':
                        this.ctx.fillStyle = '#4444ff';
                        break;
                }

                this.ctx.beginPath();
                this.ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
                this.ctx.fill();

                // 添加刀柄效果
                this.ctx.fillStyle = '#888888';
                this.ctx.fillRect(xPos - radius/2, yPos - radius/2, radius, radius/3);
            }
        });
    }

    renderNPCs() {
        this.npcs.forEach(npc => {
            if (npc && npc.position) {
                npc.render(this.ctx);
            }
        });
    }

    resetGame() {
        this.stop();
        this.initializeGame();
        this.gameState = 'playing';
        console.log('游戏重置');
    }
}

