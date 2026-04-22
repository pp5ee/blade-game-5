/**
 * 转刀刀游戏 - 战斗系统模块
 * 负责伤害计算、战斗效果和特殊能力
 */

export class CombatSystem {
    constructor(game) {
        this.game = game;

        // 战斗配置
        this.config = {
            baseDamage: 10,
            criticalChance: 0.1,
            criticalMultiplier: 2,
            dodgeChance: 0.05,
            comboMultiplier: 1.0
        };

        // 战斗状态
        this.comboCount = 0;
        this.lastComboTime = 0;
        this.comboTimeout = 3000; // 3秒连击超时

        console.log('战斗系统初始化完成');
    }

    /**
     * 计算伤害
     * 按照原始规格：战斗基于刀的数量和颜色等级计算伤害
     */
    calculateDamage(attacker, target, knifeType = null) {
        // 基础伤害为10
        let damage = 10;

        // 根据刀类型应用伤害梯度：红色刀=黄色刀×2=蓝色刀×4
        if (knifeType) {
            damage *= this.getKnifeMultiplier(knifeType);
        }

        // 根据收集的刀数量增加伤害（每把刀增加1点伤害）
        if (attacker.knives) {
            const totalKnives = attacker.knives.red + attacker.knives.yellow + attacker.knives.blue;
            damage += totalKnives;
        }

        // 确保最小伤害
        damage = Math.max(1, Math.round(damage));

        console.log(`造成 ${damage} 点伤害（刀类型: ${knifeType || '无'}）`);
        return damage;
    }

    /**
     * 根据刀类型获取伤害倍率
     * 按照原始规格：红色刀伤害=黄色刀×2=蓝色刀×4
     * 修正为：蓝色刀=1x，黄色刀=2x，红色刀=4x
     */
    getKnifeMultiplier(knifeType) {
        const multiplierMap = {
            blue: 1.0,    // 蓝色刀：基础伤害
            yellow: 2.0,  // 黄色刀：2倍伤害
            red: 4.0     // 红色刀：4倍伤害
        };
        return multiplierMap[knifeType] || 1.0;
    }

    /**
     * 处理攻击
     */
    handleAttack(attacker, target, knifeType = null) {
        // 计算伤害
        const damage = this.calculateDamage(attacker, target, knifeType);

        if (damage > 0) {
            // 应用伤害
            target.takeDamage(damage);

            // 更新连击
            this.updateCombo();

            // 播放攻击效果
            this.playAttackEffect(attacker, target, damage);

            return damage;
        }

        return 0;
    }

    /**
     * 更新连击计数
     */
    updateCombo() {
        const currentTime = Date.now();

        // 检查连击是否超时
        if (currentTime - this.lastComboTime > this.comboTimeout) {
            this.comboCount = 0;
            this.config.comboMultiplier = 1.0;
        }

        // 增加连击计数
        this.comboCount++;
        this.lastComboTime = currentTime;

        // 更新连击倍率
        this.config.comboMultiplier = 1.0 + (this.comboCount * 0.1);

        console.log(`连击: ${this.comboCount}, 伤害倍率: ${this.config.comboMultiplier.toFixed(1)}x`);
    }

    /**
     * 播放攻击效果
     */
    playAttackEffect(attacker, target, damage) {
        // 攻击效果逻辑将在后续任务中实现
        console.log(`攻击效果: ${attacker.constructor.name} → ${target.constructor.name}, 伤害: ${damage}`);

        // 显示伤害数字
        this.showDamageNumber(target, damage);

        // 播放攻击动画
        this.playAttackAnimation(attacker, target);
    }

    /**
     * 显示伤害数字
     */
    showDamageNumber(target, damage) {
        // 伤害数字显示逻辑将在后续任务中实现
        console.log(`在 ${target.x}, ${target.y} 显示伤害数字: ${damage}`);
    }

    /**
     * 播放攻击动画
     */
    playAttackAnimation(attacker, target) {
        // 攻击动画逻辑将在后续任务中实现
        console.log(`播放 ${attacker.constructor.name} 攻击动画`);
    }

    /**
     * 处理特殊能力
     */
    handleSpecialAbility(attacker, abilityType) {
        const abilities = {
            red: this.redKnifeAbility.bind(this),
            yellow: this.yellowKnifeAbility.bind(this),
            blue: this.blueKnifeAbility.bind(this)
        };

        if (abilities[abilityType]) {
            abilities[abilityType](attacker);
        }
    }

    /**
     * 红色刀特殊能力 - 狂暴
     */
    redKnifeAbility(attacker) {
        console.log('红色刀能力激活: 狂暴');
        // 增加攻击速度或攻击力
        attacker.attackPower *= 1.5;
        // 效果持续一段时间后恢复
        setTimeout(() => {
            attacker.attackPower /= 1.5;
            console.log('狂暴效果结束');
        }, 5000);
    }

    /**
     * 黄色刀特殊能力 - 穿透
     */
    yellowKnifeAbility(attacker) {
        console.log('黄色刀能力激活: 穿透');
        // 攻击可以穿透多个目标
        // 实现逻辑将在后续任务中完善
    }

    /**
     * 蓝色刀特殊能力 - 冰冻
     */
    blueKnifeAbility(attacker) {
        console.log('蓝色刀能力激活: 冰冻');
        // 减速或冰冻目标
        // 实现逻辑将在后续任务中完善
    }

    /**
     * 重置战斗系统
     */
    reset() {
        this.comboCount = 0;
        this.lastComboTime = 0;
        this.config.comboMultiplier = 1.0;
        console.log('战斗系统已重置');
    }

    /**
     * 获取当前连击信息
     */
    getComboInfo() {
        return {
            count: this.comboCount,
            multiplier: this.config.comboMultiplier,
            timeout: this.comboTimeout - (Date.now() - this.lastComboTime)
        };
    }
}