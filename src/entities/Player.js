/**
 * 转刀刀游戏 - 玩家角色
 * 负责玩家控制、移动和状态管理
 */

export class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;

        // 玩家属性
        this.speed = 5;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.isAlive = true;

        // 刀收集状态
        this.knives = {
            red: 0,
            yellow: 0,
            blue: 0
        };

        // 移动状态
        this.moving = false;
        this.direction = { x: 0, y: 0 };

        // 视觉效果
        this.color = '#06d6a0';
        this.hitEffect = 0;

        console.log('玩家角色初始化完成');
    }

    /**
     * 更新玩家状态
     */
    update(deltaTime) {
        if (!this.isAlive) return;

        this.handleInput();
        this.move(deltaTime);
        this.checkBoundaries();
        this.updateHitEffect();
    }

    /**
     * 处理键盘输入
     */
    handleInput() {
        const keys = this.game.keys;

        // 重置移动状态
        this.direction.x = 0;
        this.direction.y = 0;
        this.moving = false;

        // 水平移动
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.direction.x = -1;
            this.moving = true;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.direction.x = 1;
            this.moving = true;
        }

        // 垂直移动
        if (keys['KeyW'] || keys['ArrowUp']) {
            this.direction.y = -1;
            this.moving = true;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            this.direction.y = 1;
            this.moving = true;
        }

        // 对角线移动速度修正
        if (this.direction.x !== 0 && this.direction.y !== 0) {
            this.direction.x *= 0.707;
            this.direction.y *= 0.707;
        }
    }

    /**
     * 移动玩家
     */
    move(deltaTime) {
        if (this.moving) {
            this.x += this.direction.x * this.speed * (deltaTime * 60);
            this.y += this.direction.y * this.speed * (deltaTime * 60);
        }
    }

    /**
     * 检查边界
     */
    checkBoundaries() {
        // 左边界
        if (this.x < 0) {
            this.x = 0;
        }

        // 右边界
        if (this.x + this.width > this.game.config.canvasWidth) {
            this.x = this.game.config.canvasWidth - this.width;
        }

        // 上边界
        if (this.y < 0) {
            this.y = 0;
        }

        // 下边界
        if (this.y + this.height > this.game.config.canvasHeight) {
            this.y = this.game.config.canvasHeight - this.height;
        }
    }

    /**
     * 更新受击效果
     */
    updateHitEffect() {
        if (this.hitEffect > 0) {
            this.hitEffect -= 0.1;
        }
    }

    /**
     * 收集刀
     */
    collectKnife(knifeType) {
        if (this.knives.hasOwnProperty(knifeType)) {
            this.knives[knifeType]++;

            // 更新UI显示
            this.game.uiSystem.updateKnifeStats();

            console.log(`收集到 ${knifeType}刀，当前数量: ${this.knives[knifeType]}`);

            return true;
        }
        return false;
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        if (!this.isAlive) return;

        this.hp -= damage;
        this.hitEffect = 1;

        // 触发受击效果
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            console.log('玩家被击败！');
        }

        // 更新UI显示
        this.game.uiSystem.updatePlayerStats();

        return this.isAlive;
    }

    /**
     * 获取总攻击力加成（基于刀颜色和数量）
     * 按照计划要求：红色刀伤害=黄色刀×2=蓝色刀×4
     */
    getTotalDamageBonus() {
        // 按照计划要求：红刀=4倍，黄刀=2倍，蓝刀=1倍
        const redMultiplier = 4;    // 红刀伤害倍率
        const yellowMultiplier = 2; // 黄刀伤害倍率
        const blueMultiplier = 1;   // 蓝刀伤害倍率

        // 计算总伤害倍率
        const totalMultiplier = (this.knives.red * redMultiplier) +
                               (this.knives.yellow * yellowMultiplier) +
                               (this.knives.blue * blueMultiplier);

        // 返回倍率（1表示无加成，2表示2倍伤害等）
        return Math.max(1, totalMultiplier);
    }

    /**
     * 获取刀颜色伤害加成描述
     */
    getKnifeDamageDescription() {
        return {
            red: this.knives.red * 4,
            yellow: this.knives.yellow * 2,
            blue: this.knives.blue * 1,
            total: this.getTotalDamageBonus()
        };
    }

    /**
     * 重置玩家状态
     */
    reset() {
        this.hp = this.maxHp;
        this.isAlive = true;
        this.knives = { red: 0, yellow: 0, blue: 0 };
        this.hitEffect = 0;
    }

    /**
     * 渲染玩家
     */
    render(ctx) {
        // 受击效果闪烁
        if (this.hitEffect > 0) {
            ctx.fillStyle = `rgba(255, 100, 100, ${this.hitEffect})`;
        } else {
            ctx.fillStyle = this.color;
        }

        // 绘制玩家主体
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制玩家眼睛（表示方向）
        ctx.fillStyle = '#ffffff';
        const eyeSize = 6;
        const eyeOffset = 8;

        // 根据移动方向调整眼睛位置
        let eyeX1 = this.x + eyeOffset;
        let eyeY1 = this.y + eyeOffset;
        let eyeX2 = this.x + this.width - eyeOffset - eyeSize;
        let eyeY2 = this.y + eyeOffset;

        if (this.moving) {
            if (this.direction.x > 0) {
                eyeX1 += 2;
                eyeX2 += 2;
            } else if (this.direction.x < 0) {
                eyeX1 -= 2;
                eyeX2 -= 2;
            }

            if (this.direction.y > 0) {
                eyeY1 += 2;
                eyeY2 += 2;
            } else if (this.direction.y < 0) {
                eyeY1 -= 2;
                eyeY2 -= 2;
            }
        }

        ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
        ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);

        // 调试模式显示碰撞框
        if (this.game.state === 'debug') {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}