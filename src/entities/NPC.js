// NPC AI和行为逻辑类
class NPC {
    constructor(map, config, player) {
        this.map = map;
        this.config = config;
        this.player = player;

        // NPC位置
        this.position = this.getRandomSpawnPosition();

        // NPC状态
        this.knives = { red: 0, yellow: 0, blue: 0 };
        this.isAlive = true;
        this.lastMoveTime = 0;
        this.moveCooldown = 500; // 移动冷却时间（毫秒）

        // 初始化NPC的刀（随机分配一些刀）
        this.initializeKnives();

        console.log('NPC初始化完成');
    }

    getRandomSpawnPosition() {
        const emptyPositions = [];

        for (let y = 0; y < this.config.mapSize.height; y++) {
            for (let x = 0; x < this.config.mapSize.width; x++) {
                if (this.map[y][x] === 0) { // 可通行区域
                    // 确保NPC不会生成在玩家附近
                    const distanceToPlayer = Math.abs(x - this.player.position.x) +
                                           Math.abs(y - this.player.position.y);

                    if (distanceToPlayer > 3) { // 至少距离玩家3格
                        emptyPositions.push({ x, y });
                    }
                }
            }
        }

        return emptyPositions.length > 0
            ? emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
            : null;
    }

    initializeKnives() {
        // 随机分配一些刀给NPC
        const totalKnives = Math.floor(Math.random() * 5) + 1; // 1-5把刀
        const colors = ['red', 'yellow', 'blue'];

        for (let i = 0; i < totalKnives; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.knives[color]++;
        }
    }

    update() {
        if (!this.isAlive) return;

        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.moveCooldown) {
            return; // 冷却时间未到
        }

        this.lastMoveTime = currentTime;

        // 计算与玩家的距离
        const distanceToPlayer = this.calculateDistanceToPlayer();

        // 根据距离决定行为
        if (distanceToPlayer <= 1) {
            // 在玩家旁边，准备战斗（不移动）
            return;
        } else if (distanceToPlayer <= 5) {
            // 在攻击范围内，主动接近玩家
            this.moveTowardsPlayer();
        } else {
            // 距离较远，随机移动
            this.randomMove();
        }
    }

    calculateDistanceToPlayer() {
        return Math.abs(this.position.x - this.player.position.x) +
               Math.abs(this.position.y - this.player.position.y);
    }

    moveTowardsPlayer() {
        const directions = [];

        // 确定移动方向（优先接近玩家）
        if (this.position.x < this.player.position.x) {
            directions.push('right');
        } else if (this.position.x > this.player.position.x) {
            directions.push('left');
        }

        if (this.position.y < this.player.position.y) {
            directions.push('down');
        } else if (this.position.y > this.player.position.y) {
            directions.push('up');
        }

        // 如果没有明确方向，随机移动
        if (directions.length === 0) {
            this.randomMove();
            return;
        }

        // 随机选择一个方向（增加一些随机性）
        const direction = directions[Math.floor(Math.random() * directions.length)];
        this.moveInDirection(direction);
    }

    randomMove() {
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        this.moveInDirection(direction);
    }

    moveInDirection(direction) {
        let newX = this.position.x;
        let newY = this.position.y;

        switch (direction) {
            case 'up':
                newY--;
                break;
            case 'down':
                newY++;
                break;
            case 'left':
                newX--;
                break;
            case 'right':
                newX++;
                break;
        }

        // 检查移动是否有效
        if (this.isValidMove(newX, newY)) {
            this.position.x = newX;
            this.position.y = newY;
        }
    }

    isValidMove(x, y) {
        // 检查边界
        if (x < 0 || x >= this.config.mapSize.width ||
            y < 0 || y >= this.config.mapSize.height) {
            return false;
        }

        // 检查障碍物
        if (this.map[y][x] !== 0) {
            return false;
        }

        // 检查是否与玩家位置冲突
        if (x === this.player.position.x && y === this.player.position.y) {
            return false;
        }

        // 检查是否与其他NPC位置冲突
        // 注意：这里假设NPC不会互相攻击，所以避免重叠
        return true;
    }

    getTotalKnives() {
        return this.knives.red + this.knives.yellow + this.knives.blue;
    }

    getAttackPower() {
        // 根据刀颜色计算攻击力：红=黄×2=蓝×4
        return (this.knives.red || 0) * 4 + (this.knives.yellow || 0) * 2 + (this.knives.blue || 0);
    }

    getRandomSpawnPosition() {
        if (!this.map) return { x: 0, y: 0 };

        const emptyPositions = [];
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[0].length; x++) {
                if (this.map[y][x] === 0) { // 可通行区域
                    // 检查是否与玩家位置冲突
                    const isPlayerPosition = this.player && this.player.position &&
                                           this.player.position.x === x && this.player.position.y === y;

                    // 检查是否与其他NPC位置冲突
                    const isNPCPosition = this.otherNPCs && this.otherNPCs.some(npc =>
                                         npc.position && npc.position.x === x && npc.position.y === y);

                    if (!isPlayerPosition && !isNPCPosition) {
                        emptyPositions.push({ x, y });
                    }
                }
            }
        }

        return emptyPositions.length > 0
            ? emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
            : { x: 0, y: 0 };
    }

    reset() {
        this.position = this.getRandomSpawnPosition();
        this.knives = { red: 0, yellow: 0, blue: 0 };
        this.isAlive = true;
        this.initializeKnives();
    }
}