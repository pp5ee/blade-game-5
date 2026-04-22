/**
 * 转刀刀游戏 - NPC角色
 * 负责NPC的AI行为、移动和状态管理
 */

export class NPC {
    constructor(game, x, y, type = 'normal') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.type = type;

        // 根据类型设置属性
        this.setTypeAttributes();

        // AI状态
        this.state = 'wander'; // wander, chase, attack, flee
        this.stateTimer = 0;
        this.stateChangeInterval = 5; // 每5秒可能改变状态

        // 移动
        this.direction = { x: 0, y: 0 };
        this.moveTimer = 0;
        this.moveInterval = 2; // 每2秒改变移动方向

        // 战斗
        this.attackRange = 50;
        this.attackCooldown = 0;
        this.attackInterval = 1; // 攻击间隔1秒

        // 刀收集系统
        this.collectedKnives = {
            red: 0,
            yellow: 0,
            blue: 0
        };

        // 视觉效果
        this.setVisuals();
        this.hitEffect = 0;

        console.log(`NPC ${type} 初始化完成`);
    }

    /**
     * 根据类型设置属性
     */
    setTypeAttributes() {
        switch (this.type) {
            case 'fast':
                this.maxHp = 30;
                this.hp = this.maxHp;
                this.speed = 4;
                this.damage = 6;
                break;
            case 'strong':
                this.maxHp = 100;
                this.hp = this.maxHp;
                this.speed = 1.5;
                this.damage = 12;
                break;
            default: // normal
                this.maxHp = 50;
                this.hp = this.maxHp;
                this.speed = 2;
                this.damage = 8;
        }

        this.isAlive = true;
    }

    /**
     * 设置视觉效果
     */
    setVisuals() {
        switch (this.type) {
            case 'fast':
                this.color = '#ffd166'; // 黄色
                this.borderColor = '#ff9e00';
                break;
            case 'strong':
                this.color = '#ef476f'; // 红色
                this.borderColor = '#d90429';
                break;
            default: // normal
                this.color = '#118ab2'; // 蓝色
                this.borderColor = '#073b4c';
        }
    }

    /**
     * 更新NPC状态
     */
    update(deltaTime) {
        if (!this.isAlive) return;

        this.updateTimers(deltaTime);
        this.updateAI();
        this.move(deltaTime);
        this.checkBoundaries();
        this.updateHitEffect();
        this.updateAttackCooldown(deltaTime);
    }

    /**
     * 更新计时器
     */
    updateTimers(deltaTime) {
        this.stateTimer += deltaTime;
        this.moveTimer += deltaTime;
    }

    /**
     * 更新AI行为
     * 按照原始规格：NPC会主动向玩家移动并攻击
     */
    updateAI() {
        // 生命值低于25%时逃跑
        if (this.hp / this.maxHp < 0.25 && this.state !== 'flee') {
            this.state = 'flee';
            return;
        }

        // 如果正在逃跑且生命值恢复，返回攻击状态
        if (this.state === 'flee' && this.hp / this.maxHp > 0.5) {
            this.state = 'attack';
        }

        // 主动检测玩家位置并决定行为
        const player = this.game.player;
        if (!player || !player.isAlive) {
            this.wanderBehavior();
            return;
        }

        // 计算与玩家的距离
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // NPC始终主动追逐玩家，除非正在逃跑
        if (this.state === 'flee') {
            this.fleeBehavior();
        } else if (distance <= this.attackRange) {
            this.attackBehavior();
        } else {
            // 始终追逐玩家，无论距离多远
            this.chaseBehavior();
        }
    }

    /**
     * 游荡行为
     */
    wanderBehavior() {
        // 每2秒改变移动方向
        if (this.moveTimer >= this.moveInterval) {
            this.direction.x = Math.random() * 2 - 1;
            this.direction.y = Math.random() * 2 - 1;
            this.moveTimer = 0;
        }

        // 检测玩家是否在附近
        if (this.isPlayerNearby(150)) {
            this.state = 'chase';
        }
    }

    /**
     * 追逐行为
     */
    chaseBehavior() {
        const player = this.game.player;
        if (!player || !player.isAlive) {
            this.state = 'wander';
            return;
        }

        // 计算朝向玩家的方向
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 标准化方向
        if (distance > 0) {
            this.direction.x = dx / distance;
            this.direction.y = dy / distance;
        }

        // 进入攻击范围
        if (distance <= this.attackRange) {
            this.state = 'attack';
        }

        // 玩家离开追逐范围
        if (distance > 200) {
            this.state = 'wander';
        }
    }

    /**
     * 攻击行为
     */
    attackBehavior() {
        const player = this.game.player;
        if (!player || !player.isAlive) {
            this.state = 'wander';
            return;
        }

        // 计算与玩家的距离
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 停止移动
        this.direction.x = 0;
        this.direction.y = 0;

        // 攻击冷却结束且玩家在攻击范围内
        if (this.attackCooldown <= 0 && distance <= this.attackRange) {
            this.attackPlayer();
        }

        // 玩家离开攻击范围
        if (distance > this.attackRange) {
            this.state = 'chase';
        }
    }

    /**
     * 逃跑行为
     */
    fleeBehavior() {
        const player = this.game.player;
        if (!player || !player.isAlive) {
            this.state = 'attack';
            return;
        }

        // 计算远离玩家的方向
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 标准化方向（取反）
        if (distance > 0) {
            this.direction.x = -dx / distance;
            this.direction.y = -dy / distance;
        }

        // 生命值恢复后返回攻击状态
        if (this.hp / this.maxHp > 0.5) {
            this.state = 'attack';
        }
    }

    /**
     * 寻找玩家行为
     * NPC会主动向玩家大致方向移动
     */
    seekPlayerBehavior() {
        const player = this.game.player;
        if (!player || !player.isAlive) {
            this.wanderBehavior();
            return;
        }

        // 计算大致朝向玩家的方向（添加一些随机性）
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // 添加一些随机性使NPC移动更自然
            const randomX = (Math.random() * 0.4 - 0.2);
            const randomY = (Math.random() * 0.4 - 0.2);

            this.direction.x = (dx / distance) + randomX;
            this.direction.y = (dy / distance) + randomY;
        }

        // 每2秒微调方向
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
        }
    }

    /**
     * 改变状态
     */
    changeState() {
        const states = ['wander', 'chase'];
        const randomIndex = Math.floor(Math.random() * states.length);
        this.state = states[randomIndex];
    }

    /**
     * 移动NPC
     */
    move(deltaTime) {
        this.x += this.direction.x * this.speed * (deltaTime * 60);
        this.y += this.direction.y * this.speed * (deltaTime * 60);
    }

    /**
     * 检查边界
     */
    checkBoundaries() {
        // 左边界
        if (this.x < 0) {
            this.x = 0;
            this.direction.x *= -1;
        }

        // 右边界
        if (this.x + this.width > this.game.config.canvasWidth) {
            this.x = this.game.config.canvasWidth - this.width;
            this.direction.x *= -1;
        }

        // 上边界
        if (this.y < 0) {
            this.y = 0;
            this.direction.y *= -1;
        }

        // 下边界
        if (this.y + this.height > this.game.config.canvasHeight) {
            this.y = this.game.config.canvasHeight - this.height;
            this.direction.y *= -1;
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
     * 更新攻击冷却
     */
    updateAttackCooldown(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }

    /**
     * 攻击玩家
     */
    attackPlayer() {
        const player = this.game.player;
        if (player && player.isAlive) {
            player.takeDamage(this.damage);
            this.attackCooldown = this.attackInterval;
            console.log(`NPC ${this.type} 对玩家造成 ${this.damage} 点伤害`);
        }
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        if (!this.isAlive) return;

        this.hp -= damage;
        this.hitEffect = 1;

        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            console.log(`NPC ${this.type} 被击败`);

            // NPC死亡事件
            this.game.onNpcDefeated(this);
        }

        return this.isAlive;
    }

    /**
     * 检测玩家是否在附近
     */
    isPlayerNearby(range) {
        const player = this.game.player;
        if (!player || !player.isAlive) return false;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= range;
    }

    /**
     * 收集刀
     */
    collectKnife(knifeType) {
        if (this.collectedKnives.hasOwnProperty(knifeType)) {
            this.collectedKnives[knifeType]++;
            console.log(`NPC ${this.type} 收集了 ${knifeType} 刀，当前数量: ${this.collectedKnives[knifeType]}`);
        }
    }

    /**
     * 获取收集的刀数量
     */
    getKnifeCount() {
        return {
            red: this.collectedKnives.red,
            yellow: this.collectedKnives.yellow,
            blue: this.collectedKnives.blue
        };
    }

    /**
     * 重置NPC状态
     */
    reset() {
        this.hp = this.maxHp;
        this.isAlive = true;
        this.state = 'wander';
        this.stateTimer = 0;
        this.hitEffect = 0;
        this.attackCooldown = 0;

        // 清空收集的刀
        this.collectedKnives = {
            red: 0,
            yellow: 0,
            blue: 0
        };
    }

    /**
     * 渲染NPC
     */
    render(ctx) {
        // 受击效果闪烁
        if (this.hitEffect > 0) {
            ctx.fillStyle = `rgba(255, 100, 100, ${this.hitEffect})`;
        } else {
            ctx.fillStyle = this.color;
        }

        // 绘制NPC主体
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制边框
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 绘制生命值条
        const hpBarWidth = this.width;
        const hpBarHeight = 4;
        const hpPercent = this.hp / this.maxHp;

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 8, hpBarWidth, hpBarHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 8, hpBarWidth * hpPercent, hpBarHeight);

        // 调试模式显示状态和碰撞框
        if (this.game.state === 'debug') {
            // 状态文本
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.fillText(this.state, this.x, this.y - 12);

            // 碰撞框
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // 攻击范围（仅攻击状态）
            if (this.state === 'attack') {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.attackRange,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
        }
    }
}