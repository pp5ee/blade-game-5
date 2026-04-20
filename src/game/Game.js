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

    // 其他方法保持不变...
}
