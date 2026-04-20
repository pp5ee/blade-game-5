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
            baseDamage: 1, // 基础伤害值
            criticalChance: 0.1, // 暴击概率
            criticalMultiplier: 2 // 暴击倍率
        };
    }

    // 解析战斗结果
    resolveCombat(attacker, defender) {
        if (!attacker.isAlive || !defender.isAlive) {
            return { winner: null, damage: 0, critical: false };
        }

        // 计算双方攻击力
        const attackerPower = this.calculateAttackPower(attacker);
        const defenderPower = this.calculateAttackPower(defender);

        // 计算伤害
        const attackerDamage = this.calculateDamage(attackerPower, defenderPower);
        const defenderDamage = this.calculateDamage(defenderPower, attackerPower);

        // 决定战斗结果
        let winner = null;
        let damageDealt = 0;
        let criticalHit = false;

        if (attackerDamage > defenderDamage) {
            winner = 'attacker';
            damageDealt = attackerDamage - defenderDamage;
            criticalHit = this.isCriticalHit(attackerPower, defenderPower);
        } else if (defenderDamage > attackerDamage) {
            winner = 'defender';
            damageDealt = defenderDamage - attackerDamage;
            criticalHit = this.isCriticalHit(defenderPower, attackerPower);
        } else {
            // 平局，双方都不获胜
            winner = 'draw';
        }

        return {
            winner: winner,
            damage: damageDealt,
            critical: criticalHit,
            attackerPower: attackerPower,
            defenderPower: defenderPower,
            attackerDamage: attackerDamage,
            defenderDamage: defenderDamage
        };
    }

    // 计算实体攻击力
    calculateAttackPower(entity) {
        let totalPower = 0;

        // 根据刀颜色计算攻击力
        for (const color in entity.knives) {
            if (entity.knives.hasOwnProperty(color)) {
                const count = entity.knives[color];
                const multiplier = this.config.damageMultipliers[color] || 1;
                totalPower += count * multiplier * this.config.baseDamage;
            }
        }

        // 如果没有刀，攻击力为0
        if (totalPower === 0) {
            return 0;
        }

        return totalPower;
    }

    // 计算实际伤害
    calculateDamage(attackerPower, defenderPower) {
        if (attackerPower === 0) {
            return 0;
        }

        // 基础伤害计算
        let damage = attackerPower;

        // 防御力减免（简单的线性减免）
        const defenseReduction = Math.min(defenderPower * 0.1, damage * 0.5);
        damage -= defenseReduction;

        // 确保伤害至少为1
        damage = Math.max(1, damage);

        // 随机波动（±10%）
        const randomFactor = 0.9 + Math.random() * 0.2;
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
            baseDamage: this.config.baseDamage
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