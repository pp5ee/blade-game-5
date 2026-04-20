// 游戏界面显示类
class GameUI {
    constructor(game) {
        this.game = game;
        this.gameStatusElem = document.getElementById('game-status');
        this.redKnivesElem = document.getElementById('red-knives');
        this.yellowKnivesElem = document.getElementById('yellow-knives');
        this.blueKnivesElem = document.getElementById('blue-knives');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');

        // 初始化UI
        this.initializeUI();

        console.log('游戏UI初始化完成');
    }

    initializeUI() {
        // 设置初始状态
        this.updateGameStatus('准备开始');
        this.updateKnifeCounts(0, 0, 0);

        // 绑定按钮事件
        this.bindButtonEvents();
    }

    bindButtonEvents() {
        // 开始按钮事件已经在main.js中处理
        // 这里主要处理UI相关的更新
    }

    update() {
        if (!this.game) return;

        // 更新游戏状态显示
        this.updateGameStatus(this.getStatusText());

        // 更新刀数量显示
        if (this.game.player) {
            this.updateKnifeCounts(
                this.game.player.knives.red,
                this.game.player.knives.yellow,
                this.game.player.knives.blue
            );
        }

        // 更新按钮状态
        this.updateButtonStates();
    }

    updateGameStatus(status) {
        if (this.gameStatusElem) {
            this.gameStatusElem.textContent = status;

            // 根据状态更新样式
            this.gameStatusElem.className = 'stat-value';
            if (status.includes('游戏结束')) {
                this.gameStatusElem.classList.add('status-game-over');
            } else if (status.includes('胜利')) {
                this.gameStatusElem.classList.add('status-won');
            } else {
                this.gameStatusElem.classList.add('status-playing');
            }
        }
    }

    updateKnifeCounts(red, yellow, blue) {
        if (this.redKnivesElem) this.redKnivesElem.textContent = red;
        if (this.yellowKnivesElem) this.yellowKnivesElem.textContent = yellow;
        if (this.blueKnivesElem) this.blueKnivesElem.textContent = blue;
    }

    updateButtonStates() {
        if (this.startBtn && this.restartBtn) {
            const isRunning = this.game.isRunning;
            const gameState = this.game.gameState;

            // 开始按钮：游戏未运行时可用
            this.startBtn.disabled = isRunning;

            // 重新开始按钮：游戏结束时可用
            this.restartBtn.disabled = !(gameState === 'gameOver' || gameState === 'won');
        }
    }

    getStatusText() {
        if (!this.game) return '准备开始';

        switch (this.game.gameState) {
            case 'playing':
                const remainingNPCs = this.game.npcs.filter(npc => npc.isAlive).length;
                return `游戏中 - 剩余NPC: ${remainingNPCs}`;

            case 'gameOver':
                return '游戏结束 - 你被击败了！';

            case 'won':
                return '胜利！你击败了所有NPC！';

            default:
                return '准备开始';
        }
    }

    // 显示战斗信息
    showCombatInfo(attacker, defender, result) {
        const combatLog = this.formatCombatLog(attacker, defender, result);
        console.log('战斗信息:', combatLog);

        // 可以在这里添加战斗动画或特效
        this.showCombatAnimation(result);
    }

    formatCombatLog(attacker, defender, result) {
        const attackerName = attacker === this.game.player ? '玩家' : 'NPC';
        const defenderName = defender === this.game.player ? '玩家' : 'NPC';

        let log = `⚔️ 战斗开始: ${attackerName} vs ${defenderName}\n`;
        log += `🗡️ 攻击力: ${result.attackerPower} vs ${result.defenderPower}\n`;
        log += `💥 伤害: ${result.attackerDamage} vs ${result.defenderDamage}\n`;

        if (result.winner === 'attacker') {
            log += `🎯 胜利者: ${attackerName}`;
            if (result.critical) {
                log += ' 💥暴击!';
            }
        } else if (result.winner === 'defender') {
            log += `🎯 胜利者: ${defenderName}`;
            if (result.critical) {
                log += ' 💥暴击!';
            }
        } else {
            log += '🤝 战斗平局';
        }

        return log;
    }

    showCombatAnimation(result) {
        // 简单的战斗动画效果
        const canvas = this.game.canvas;
        const ctx = this.game.ctx;

        // 在画布上显示战斗文本（临时效果）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 20, 200, 40);

        ctx.fillStyle = 'white';
        ctx.font = '16px Courier New';
        ctx.textAlign = 'center';

        let text = '';
        if (result.winner === 'attacker') {
            text = result.critical ? '暴击！' : '攻击成功！';
        } else if (result.winner === 'defender') {
            text = result.critical ? '被暴击！' : '被攻击！';
        } else {
            text = '平局！';
        }

        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        // 1秒后清除文本
        setTimeout(() => {
            this.game.render(); // 重新渲染游戏画面
        }, 1000);
    }

    // 显示游戏提示
    showGameTip(message, duration = 3000) {
        console.log('游戏提示:', message);

        // 可以在这里添加更复杂的提示显示逻辑
        // 例如在屏幕上显示浮动提示文字
    }

    // 重置UI
    reset() {
        this.updateGameStatus('准备开始');
        this.updateKnifeCounts(0, 0, 0);
        this.updateButtonStates();
    }

    // 销毁UI（游戏结束时清理）
    destroy() {
        // 清理事件监听器等资源
        this.game = null;
    }
}