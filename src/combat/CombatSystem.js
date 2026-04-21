// 战斗伤害计算系统类
class CombatSystem {
    constructor() {
        // 战斗配置
        this.config = {
            damageMultipliers: {
                red: 4,    // 红色刀伤害倍率
                yellow: 2, // 黄色刀伤害倍率
                blue: 1    // 蓝色刀伤害倍率
            },
            baseDamage: 0.5, // 基础伤害值调整为0.5，使伤害计算更平滑
            criticalChance: 0.1, // 暴击概率
            criticalMultiplier: 2, // 暴击倍率
            damageDecayFactor: 0.9, // 伤害衰减系数（每增加一把刀，边际伤害减少10%）
            maxKnivesForDecay: 10, // 伤害衰减的最大刀数量限制
            minDamageMultiplier: 0.3 // 最小伤害倍率
        };
    }

    // 解析战斗结果
    resolveCombat(attacker, defender) {
        if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
            console.log('战斗无效：至少一方已死亡或不存在');
            return {
                winner: null,
                damage: 0,
                critical: false,
                attackerPower: 0,
                defenderPower: 0,
                attackerDamage: 0,
                defenderDamage: 0
            };
        }

        // 计算双方攻击力
        const attackerPower = this.calculateAttackPower(attacker);
        const defenderPower = this.calculateAttackPower(defender);

        console.log(`战斗开始 - 攻击方力量: ${attackerPower}, 防御方力量: ${defenderPower}`);

        // 计算伤害
        const attackerDamage = this.calculateDamage(attackerPower, defenderPower);
        const defenderDamage = this.calculateDamage(defenderPower, attackerPower);

        // 决定战斗结果
        let winner = null;
        let damageDealt = 0;
        let criticalHit = false;
        let playerWon = false;

        if (attackerDamage > defenderDamage) {
            winner = 'attacker';
            damageDealt = attackerDamage - defenderDamage;
            criticalHit = this.isCriticalHit(attackerPower, defenderPower);
            playerWon = (attacker === window.knifeGame?.player);

            // 应用伤害结果
            if (defender === window.knifeGame?.player) {
                // 玩家被攻击
                console.log(`玩家受到 ${damageDealt} 点伤害`);
                if (criticalHit) console.log('暴击！');
            } else {
                // NPC被攻击
                console.log(`NPC被击败，掉落刀`);
            }

        } else if (defenderDamage > attackerDamage) {
            winner = 'defender';
            damageDealt = defenderDamage - attackerDamage;
            criticalHit = this.isCriticalHit(defenderPower, attackerPower);
            playerWon = (defender === window.knifeGame?.player);

            // 应用伤害结果
            if (attacker === window.knifeGame?.player) {
                // 玩家攻击失败
                console.log(`玩家攻击失败，受到 ${damageDealt} 点反击伤害`);
            } else {
                // NPC攻击失败
                console.log(`NPC攻击失败`);
            }

        } else {
            // 平局，双方都不获胜
            winner = 'draw';
            console.log('战斗平局');
        }

        const result = {
            winner: winner,
            damage: damageDealt,
            critical: criticalHit,
            playerWon: playerWon,
            attackerPower: attackerPower,
            defenderPower: defenderPower,
            attackerDamage: attackerDamage,
            defenderDamage: defenderDamage
        };

        // 显示战斗信息
        if (window.gameUI) {
            window.gameUI.showCombatInfo(attacker, defender, result);
        }

        return result;
    }

    // 计算实体攻击力（带伤害衰减）
    calculateAttackPower(entity) {
        let totalPower = 0;
        const totalKnives = entity.getTotalKnives();

        // 计算伤害衰减因子
        const decayFactor = this.calculateDecayFactor(totalKnives);

        // 根据刀颜色计算攻击力
        for (const color in entity.knives) {
            if (entity.knives.hasOwnProperty(color)) {
                const count = entity.knives[color];
                const multiplier = this.config.damageMultipliers[color] || 1;
                
                // 应用伤害衰减
                const colorPower = count * multiplier * this.config.baseDamage * decayFactor;
                totalPower += colorPower;
            }
        }

        // 如果没有刀，攻击力为0
        if (totalPower === 0) {
            return 0;
        }

        return Math.round(totalPower * 10) / 10; // 保留一位小数
    }

    // 计算伤害衰减因子
    calculateDecayFactor(totalKnives) {
        if (totalKnives <= 1) {
            return 1.0; // 第一把刀没有衰减
        }

        // 指数衰减：每增加一把刀，边际伤害减少
        const knivesForDecay = Math.min(totalKnives - 1, this.config.maxKnivesForDecay);
        const decayFactor = Math.pow(this.config.damageDecayFactor, knivesForDecay);
        
        // 确保最小伤害倍率
        return Math.max(decayFactor, this.config.minDamageMultiplier);
    }

    // 计算实际伤害
    calculateDamage(attackerPower, defenderPower) {
        if (attackerPower === 0) {
            return 0;
        }

        // 基础伤害计算
        let damage = attackerPower;

        // 防御力减免（基于双方力量对比的曲线减免）
        const powerRatio = defenderPower / (attackerPower + defenderPower);
        const defenseReduction = damage * (0.1 + powerRatio * 0.3); // 10%-40%的减免
        damage -= defenseReduction;

        // 确保伤害至少为1
        damage = Math.max(1, damage);

        // 随机波动（±15%）
        const randomFactor = 0.85 + Math.random() * 0.3;
        damage = Math.round(damage * randomFactor);

        return damage;
    }

    // 检查是否暴击
    isCriticalHit(attackerPower, defenderPower) {
        // 暴击概率基于攻击力优势
        const advantage = attackerPower / (attackerPower + defenderPower);
        const criticalChance = this.config.criticalChance * advantage;

        return Math.random() < criticalChance;
    }

    // 获取伤害倍率信息（用于UI显示）
    getDamageMultiplierInfo() {
        return {
            red: this.config.damageMultipliers.red,
            yellow: this.config.damageMultipliers.yellow,
            blue: this.config.damageMultipliers.blue,
            baseDamage: this.config.baseDamage,
            decayFactor: this.config.damageDecayFactor
        };
    }

    // 格式化战斗日志
    formatCombatLog(attacker, defender, result) {
        const attackerName = attacker === window.knifeGame?.game?.player ? '玩家' : 'NPC';
        const defenderName = defender === window.knifeGame?.game?.player ? '玩家' : 'NPC';

        let log = `${attackerName} vs ${defenderName}\n`;
        log += `攻击力: ${result.attackerPower} vs ${result.defenderPower}\n`;
        log += `伤害: ${result.attackerDamage} vs ${result.defenderDamage}\n`;

        if (result.winner === 'attacker') {
            log += `胜利者: ${attackerName}`;
            if (result.critical) {
                log += ' (暴击!)';
            }
        } else if (result.winner === 'defender') {
            log += `胜利者: ${defenderName}`;
            if (result.critical) {
                log += ' (暴击!)';
            }
        } else {
            log += '战斗平局';
        }

        return log;
    }

    // 重置战斗系统（用于游戏重置）
    reset() {
        // 战斗系统无状态，不需要重置
    }
}
