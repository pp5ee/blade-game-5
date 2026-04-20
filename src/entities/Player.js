// 玩家控制逻辑类
class Player {
    constructor(map, config) {
        this.map = map;
        this.config = config;

        // 玩家位置
        this.position = this.getRandomSpawnPosition();

        // 玩家状态
        this.knives = { red: 0, yellow: 0, blue: 0 };
        this.isAlive = true;

        // 键盘控制状态
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        // 绑定键盘事件
        this.bindKeyboardEvents();

        console.log('玩家初始化完成');
    }

    getRandomSpawnPosition() {
        const emptyPositions = [];

        for (let y = 0; y < this.config.mapSize.height; y++) {
            for (let x = 0; x < this.config.mapSize.width; x++) {
                if (this.map[y][x] === 0) { // 可通行区域
                    emptyPositions.push({ x, y });
                }
            }
        }

        return emptyPositions.length > 0
            ? emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
            : { x: 1, y: 1 }; // 默认位置
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.keys.up = true;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.keys.down = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = true;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.keys.up = false;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.keys.down = false;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = false;
                    break;
            }
        });
    }

    update() {
        if (!this.isAlive) return;

        let newX = this.position.x;
        let newY = this.position.y;

        // 处理移动输入
        if (this.keys.up && newY > 0) {
            newY--;
        }
        if (this.keys.down && newY < this.config.mapSize.height - 1) {
            newY++;
        }
        if (this.keys.left && newX > 0) {
            newX--;
        }
        if (this.keys.right && newX < this.config.mapSize.width - 1) {
            newX++;
        }

        // 检查移动是否有效（不在障碍物上）
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
        return this.map[y][x] === 0;
    }

    collectKnife(color) {
        if (this.knives.hasOwnProperty(color)) {
            this.knives[color]++;

            // 更新UI显示
            this.updateUI();

            return true;
        }
        return false;
    }

    updateUI() {
        // 更新刀数量显示
        const redKnivesElem = document.getElementById('red-knives');
        const yellowKnivesElem = document.getElementById('yellow-knives');
        const blueKnivesElem = document.getElementById('blue-knives');

        if (redKnivesElem) redKnivesElem.textContent = this.knives.red;
        if (yellowKnivesElem) yellowKnivesElem.textContent = this.knives.yellow;
        if (blueKnivesElem) blueKnivesElem.textContent = this.knives.blue;
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
                    emptyPositions.push({ x, y });
                }
            }
        }

        return emptyPositions.length > 0
            ? emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
            : { x: 0, y: 0 };
    }

    updateUI() {
        // UI更新逻辑 - 委托给GameUI类
        if (window.gameUI) {
            window.gameUI.updatePlayerStats(this);
        }
    }

    reset() {
        this.position = this.getRandomSpawnPosition();
        this.knives = { red: 0, yellow: 0, blue: 0 };
        this.isAlive = true;
        this.updateUI();
    }
}