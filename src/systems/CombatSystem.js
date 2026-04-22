/**
 * 转刀刀游戏 - 战斗系统
 * 负责处理战斗相关的计算和碰撞检测
 */

export class CombatSystem {
    constructor(game) {
        this.game = game;

        // 战斗配置
        this.config = {
            playerBaseDamage: 12,
            criticalChance: 0.12,      // 12%暴击概率
            criticalMultiplier: 2.2,   // 暴击2.2倍伤害
            collisionDamage: 6,        // 碰撞基础伤害
            damageReduction: 0.1       // 伤害减免系数
        };

        console.log('战斗系统初始化完成');
    }

    /**
     * 检查玩家与NPC的碰撞
     */
    checkCollision(player, npc) {
        if (!player.isAlive || !npc.isAlive) return;

        // 简单的矩形碰撞检测
        if (this.isColliding(player, npc)) {
            this.handleCollision(player, npc);
        }
    }

    /**
     * 矩形碰撞检测
     */
    isColliding(entity1, entity2) {
        return entity1.x < entity2.x + entity2.width &&
               entity1.x + entity1.width > entity2.x &&
               entity1.y < entity2.y + entity2.height &&
               entity1.y + entity1.height > entity2.y;
    }

    /**
     * 处理碰撞
     */
    handleCollision(player, npc) {
        // 玩家对NPC造成伤害
        const playerDamage = this.calculatePlayerDamage(player);
        const npcSurvived = npc.takeDamage(playerDamage);

        // NPC对玩家造成伤害
        if (npcSurvived) {
            const npcDamage = this.calculateNpcDamage(npc);
            player.takeDamage(npcDamage);

            // 显示伤害数字（可选）
            this.showDamageNumbers(player, npc, playerDamage, npcDamage);
        }

        // 碰撞后弹开
        this.applyKnockback(player, npc);
    }

    /**
     * 计算玩家伤害（基于刀颜色和数量）
     * 按照计划要求：战斗基于刀的数量和颜色等级计算伤害
     */
    calculatePlayerDamage(player) {
        // 基础伤害
        let damage = this.config.playerBaseDamage;

        // 刀颜色和数量加成（直接使用倍率，而不是百分比加成）
        const knifeMultiplier = player.getTotalDamageBonus();
        damage *= knifeMultiplier;

        // 暴击判定
        if (Math.random() < this.config.criticalChance) {
            damage *= this.config.criticalMultiplier;
            console.log('暴击！伤害:', damage.toFixed(1));
        }

        return Math.round(damage);
    }

    /**
     * 计算NPC伤害（基于NPC收集的刀）
     * NPC也使用刀颜色和数量计算伤害
     */
    calculateNpcDamage(npc) {
        // 基础伤害
        let damage = npc.damage;

        // NPC收集的刀加成（使用与玩家相同的倍率系统）
        const knifeCount = npc.getKnifeCount();
        const knifeMultiplier = (knifeCount.red * 4) + (knifeCount.yellow * 2) + (knifeCount.blue * 1);
        damage *= Math.max(1, knifeMultiplier);

        // 根据NPC类型调整伤害
        switch (npc.type) {
            case 'fast':
                damage *= 0.8;  // 快速NPC伤害较低
                break;
            case 'strong':
                damage *= 1.2;  // 强力NPC伤害较高
                break;
        }

        // 随机伤害波动 (±10%)
        const variance = 0.1;
        const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
        damage *= randomFactor;

        return Math.round(damage);
    }

    /**
     * 应用击退效果
     */
    applyKnockback(player, npc) {
        // 计算碰撞方向
        const dx = player.x + player.width / 2 - (npc.x + npc.width / 2);
        const dy = player.y + player.height / 2 - (npc.y + npc.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // 标准化方向
            const dirX = dx / distance;
            const dirY = dy / distance;

            // 应用击退（玩家和NPC向相反方向移动）
            const knockbackForce = 10;

            player.x += dirX * knockbackForce;
            player.y += dirY * knockbackForce;

            npc.x -= dirX * knockbackForce * 0.8; // NPC击退较弱
            npc.y -= dirY * knockbackForce * 0.8;

            // 确保不超出边界
            this.ensureWithinBounds(player);
            this.ensureWithinBounds(npc);
        }
    }

    /**
     * 确保实体在边界内
     */
    ensureWithinBounds(entity) {
        const canvasWidth = this.game.config.canvasWidth;
        const canvasHeight = this.game.config.canvasHeight;

        // 左边界
        if (entity.x < 0) {
            entity.x = 0;
        }

        // 右边界
        if (entity.x + entity.width > canvasWidth) {
            entity.x = canvasWidth - entity.width;
        }

        // 上边界
        if (entity.y < 0) {
            entity.y = 0;
        }

        // 下边界
        if (entity.y + entity.height > canvasHeight) {
            entity.y = canvasHeight - entity.height;
        }
    }

    /**
     * 显示伤害数字和刀加成信息
     */
    showDamageNumbers(player, npc, playerDamage, npcDamage) {
        // 显示伤害数字效果
        if (this.game.state === 'debug') {
            const playerKnifeDesc = player.getKnifeDamageDescription();
            const npcKnifeCount = npc.getKnifeCount();
            const npcKnifeMultiplier = (npcKnifeCount.red * 4) + (npcKnifeCount.yellow * 2) + (npcKnifeCount.blue * 1);

            console.log(`玩家伤害: ${playerDamage} (红刀×${playerKnifeDesc.red} + 黄刀×${playerKnifeDesc.yellow} + 蓝刀×${playerKnifeDesc.blue} = 总倍率×${playerKnifeDesc.total})`);
            console.log(`NPC伤害: ${npcDamage} (红刀×${npcKnifeCount.red} + 黄刀×${npcKnifeCount.yellow} + 蓝刀×${npcKnifeCount.blue} = 总倍率×${npcKnifeMultiplier})`);
        }

        // 这里可以添加视觉伤害数字显示效果
        // 例如：创建漂浮的伤害数字文本
    }

    /**
     * 获取战斗统计信息（显示刀颜色加成）
     */
    getCombatStats() {
        const player = this.game.player;
        if (!player) return null;

        const knifeDesc = player.getKnifeDamageDescription();

        return {
            baseDamage: this.config.playerBaseDamage,
            knifeMultiplier: knifeDesc.total,
            knifeDetails: knifeDesc,
            criticalChance: this.config.criticalChance,
            criticalMultiplier: this.config.criticalMultiplier,
            estimatedDamage: this.calculatePlayerDamage(player)
        };
    }

    /**
     * 重置战斗系统
     */
    reset() {
        console.log('战斗系统重置');
    }
}