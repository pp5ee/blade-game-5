/**
 * 转刀刀游戏 - 刀实体
 * 负责刀的生成、收集和效果管理
 */

export class Knife {
    constructor(game, x, y, type = 'red') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.type = type;

        // 刀属性
        this.isCollected = false;
        this.collectionTimer = 0;
        this.collectionDuration = 0.3; // 收集动画持续时间

        // 视觉效果
        this.setVisuals();
        this.pulseEffect = 0;
        this.pulseSpeed = 3;

        // 漂浮效果
        this.floatOffset = 0;
        this.floatSpeed = 2;
        this.floatAmplitude = 3;

        console.log(`刀 ${type} 生成于 (${x}, ${y})`);
    }

    /**
     * 刀类型定义
     * 按照原始规格：红色刀伤害=黄色刀×2=蓝色刀×4
     */
    static TYPES = {
        red: {
            damageMultiplier: 4.0, // 4倍伤害
            color: '#e94560',      // 红色
            rarity: 0.1,           // 10% 生成概率（最稀有）
            name: '红刀'
        },
        yellow: {
            damageMultiplier: 2.0, // 2倍伤害
            color: '#ffd166',      // 黄色
            rarity: 0.3,           // 30% 生成概率
            name: '黄刀'
        },
        blue: {
            damageMultiplier: 1.0, // 基础伤害
            color: '#118ab2',      // 蓝色
            rarity: 0.6,           // 60% 生成概率（最常见）
            name: '蓝刀'
        }
    };

    /**
     * 设置视觉效果
     */
    setVisuals() {
        const knifeType = Knife.TYPES[this.type];
        this.color = knifeType.color;
        this.glowColor = this.lightenColor(knifeType.color, 0.3);
        this.name = knifeType.name;
        this.damageMultiplier = knifeType.damageMultiplier;
    }

    /**
     * 更新刀状态
     */
    update(deltaTime) {
        if (this.isCollected) {
            this.updateCollectionAnimation(deltaTime);
        } else {
            this.updateFloatEffect(deltaTime);
            this.updatePulseEffect(deltaTime);
            this.checkEntityCollision();
        }
    }

    /**
     * 更新漂浮效果
     */
    updateFloatEffect(deltaTime) {
        this.floatOffset = Math.sin(this.floatSpeed * this.game.gameTime) * this.floatAmplitude;
    }

    /**
     * 更新脉动效果
     */
    updatePulseEffect(deltaTime) {
        this.pulseEffect = (Math.sin(this.pulseSpeed * this.game.gameTime) + 1) / 2;
    }

    /**
     * 检查实体碰撞（玩家和NPC）
     */
    checkEntityCollision() {
        if (this.isCollected) return;

        // 检查玩家碰撞
        const player = this.game.player;
        if (player && this.checkCollision(player)) {
            this.collect(player);
            return;
        }

        // 检查NPC碰撞
        for (const npc of this.game.npcs) {
            if (npc.isAlive && this.checkCollision(npc)) {
                this.collect(npc);
                return;
            }
        }
    }

    /**
     * 碰撞检测
     */
    checkCollision(entity) {
        return this.x < entity.x + entity.width &&
               this.x + this.width > entity.x &&
               this.y < entity.y + entity.height &&
               this.y + this.height > entity.y;
    }

    /**
     * 收集刀
     */
    collect(entity) {
        if (this.isCollected) return false;

        this.isCollected = true;
        this.collectionTimer = 0;

        let collected = false;
        let entityType = '';

        // 判断实体类型并调用相应的收集方法
        if (entity.constructor.name === 'Player') {
            collected = entity.collectKnife(this.type);
            entityType = '玩家';
        } else if (entity.constructor.name === 'NPC') {
            entity.collectKnife(this.type);
            collected = true; // NPC总是成功收集
            entityType = `NPC ${entity.type}`;
        }

        if (collected) {
            console.log(`${entityType} 收集到 ${this.name}`);

            // 播放收集音效（如果有）
            this.playCollectionSound();

            // 显示收集效果
            this.showCollectionEffect();
        }

        return collected;
    }

    /**
     * 更新收集动画
     */
    updateCollectionAnimation(deltaTime) {
        this.collectionTimer += deltaTime;

        // 动画结束后标记为可移除
        if (this.collectionTimer >= this.collectionDuration) {
            this.shouldRemove = true;
        }
    }

    /**
     * 播放收集音效
     */
    playCollectionSound() {
        // 这里可以添加音效播放逻辑
        // 例如：this.game.audioSystem.playSound('knife_collect');
    }

    /**
     * 显示收集效果
     */
    showCollectionEffect() {
        // 这里可以添加粒子效果
        // 例如：this.game.particleSystem.createEffect(this.x, this.y, this.color);
    }

    /**
     * 颜色变亮
     */
    lightenColor(color, amount) {
        // 简单的颜色变亮算法
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);

        const r = Math.min(255, ((num >> 16) & 0xff) + 255 * amount);
        const g = Math.min(255, ((num >> 8) & 0xff) + 255 * amount);
        const b = Math.min(255, (num & 0xff) + 255 * amount);

        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * 渲染刀
     */
    render(ctx) {
        if (this.shouldRemove) return;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + this.floatOffset;

        if (this.isCollected) {
            // 收集动画：缩放和淡出
            const progress = this.collectionTimer / this.collectionDuration;
            const scale = 1 + progress * 0.5;
            const alpha = 1 - progress;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.globalAlpha = alpha;
            this.drawKnifeShape(ctx, -this.width / 2, -this.height / 2);
            ctx.restore();
        } else {
            // 正常渲染：脉动发光效果
            ctx.save();

            // 发光效果
            if (this.pulseEffect > 0) {
                ctx.shadowColor = this.glowColor;
                ctx.shadowBlur = 10 * this.pulseEffect;
            }

            this.drawKnifeShape(ctx, this.x, this.y + this.floatOffset);
            ctx.restore();
        }

        // 调试模式显示碰撞框
        if (this.game.state === 'debug') {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y + this.floatOffset, this.width, this.height);
        }
    }

    /**
     * 绘制刀的形状
     */
    drawKnifeShape(ctx, x, y) {
        // 绘制刀柄
        ctx.fillStyle = '#8b4513'; // 棕色刀柄
        ctx.fillRect(x + 3, y + 4, 4, 8);

        // 绘制刀刃
        ctx.fillStyle = this.color;

        // 刀刃主体
        ctx.fillRect(x + 7, y + 2, 6, 12);

        // 刀尖
        ctx.beginPath();
        ctx.moveTo(x + 13, y + 2);
        ctx.lineTo(x + 16, y + 8);
        ctx.lineTo(x + 13, y + 14);
        ctx.closePath();
        ctx.fill();

        // 刀柄装饰
        ctx.fillStyle = '#daa520'; // 金色装饰
        ctx.fillRect(x + 3, y + 6, 4, 4);
    }

    /**
     * 获取刀的信息
     */
    getInfo() {
        const knifeType = Knife.TYPES[this.type];
        return {
            type: this.type,
            name: knifeType.name,
            damageMultiplier: knifeType.damageMultiplier,
            rarity: knifeType.rarity,
            color: knifeType.color
        };
    }

    /**
     * 重置刀状态
     */
    reset() {
        this.isCollected = false;
        this.collectionTimer = 0;
        this.shouldRemove = false;
        this.pulseEffect = 0;
        this.floatOffset = 0;
    }

    /**
     * 随机生成刀类型
     */
    static getRandomType() {
        const rand = Math.random();
        let cumulative = 0;

        for (const [type, config] of Object.entries(Knife.TYPES)) {
            cumulative += config.rarity;
            if (rand <= cumulative) {
                return type;
            }
        }

        return 'red'; // 默认返回红刀
    }
}