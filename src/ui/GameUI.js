/**
 * 转刀刀游戏 - 用户界面模块
 * 负责游戏UI显示、状态更新和交互
 */

export class GameUI {
    constructor(game) {
        this.game = game;

        // UI元素引用
        this.elements = {
            playerHp: document.getElementById('player-hp'),
            redKnives: document.getElementById('red-knives'),
            yellowKnives: document.getElementById('yellow-knives'),
            blueKnives: document.getElementById('blue-knives'),
            defeatedNpcs: document.getElementById('defeated-npcs'),
            gameStatus: document.getElementById('game-status'),
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn'),
            pauseBtn: document.getElementById('pause-btn')
        };

        // UI状态
        this.isVisible = true;
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // 100ms更新间隔

        console.log('游戏UI初始化完成');
    }

    /**
     * 更新UI显示
     */
    update() {
        const currentTime = Date.now();

        // 限制更新频率
        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            return;
        }

        this.lastUpdateTime = currentTime;

        // 更新玩家状态
        this.updatePlayerStats();

        // 更新刀收集统计
        this.updateKnifeStats();

        // 更新游戏状态
        this.updateGameStatus();

        // 更新控制按钮
        this.updateControlButtons();
    }

    /**
     * 更新玩家状态显示
     */
    updatePlayerStats() {
        if (this.elements.playerHp && this.game.player) {
            const player = this.game.player;
            this.elements.playerHp.textContent = `${player.hp}/${player.maxHp}`;

            // 根据生命值设置颜色
            const hpPercent = player.hp / player.maxHp;
            if (hpPercent > 0.5) {
                this.elements.playerHp.style.color = '#06d6a0';
            } else if (hpPercent > 0.25) {
                this.elements.playerHp.style.color = '#ffd166';
            } else {
                this.elements.playerHp.style.color = '#e94560';
            }
        }
    }

    /**
     * 更新刀收集统计
     */
    updateKnifeStats() {
        if (this.game.player) {
            const knives = this.game.player.knives;

            if (this.elements.redKnives) {
                this.elements.redKnives.textContent = knives.red;
            }

            if (this.elements.yellowKnives) {
                this.elements.yellowKnives.textContent = knives.yellow;
            }

            if (this.elements.blueKnives) {
                this.elements.blueKnives.textContent = knives.blue;
            }
        }
    }

    /**
     * 更新游戏状态显示
     */
    updateGameStatus() {
        if (this.elements.gameStatus) {
            let statusText = '';
            let statusColor = '#e94560';

            switch (this.game.state) {
                case 'ready':
                    statusText = '准备开始游戏';
                    statusColor = '#118ab2';
                    break;
                case 'playing':
                    statusText = '游戏进行中';
                    statusColor = '#06d6a0';
                    break;
                case 'paused':
                    statusText = '游戏暂停';
                    statusColor = '#ffd166';
                    break;
                case 'gameOver':
                    statusText = '游戏结束 - 你被击败了！';
                    statusColor = '#e94560';
                    break;
                case 'won':
                    statusText = '恭喜！你获得了胜利！';
                    statusColor = '#06d6a0';
                    break;
                default:
                    statusText = '未知状态';
            }

            this.elements.gameStatus.textContent = statusText;
            this.elements.gameStatus.style.background = statusColor;
        }
    }

    /**
     * 更新控制按钮状态
     */
    updateControlButtons() {
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = this.game.state === 'playing' || this.game.state === 'paused';
        }

        if (this.elements.restartBtn) {
            this.elements.restartBtn.disabled = this.game.state === 'ready';
        }

        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = this.game.state !== 'playing' && this.game.state !== 'paused';
            this.elements.pauseBtn.textContent = this.game.state === 'paused' ? '继续' : '暂停';
        }
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info', duration = 3000) {
        console.log(`[UI消息] ${type}: ${message}`);

        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `ui-message ui-message-${type}`;
        messageDiv.textContent = message;

        // 设置样式
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${this.getMessageColor(type)};
            color: white;
            padding: 15px 30px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        `;

        // 添加到页面
        document.body.appendChild(messageDiv);

        // 自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, duration);
    }

    /**
     * 根据消息类型获取颜色
     */
    getMessageColor(type) {
        const colors = {
            info: '#118ab2',
            success: '#06d6a0',
            warning: '#ffd166',
            error: '#e94560'
        };
        return colors[type] || colors.info;
    }

    /**
     * 显示游戏日志
     */
    showGameLog(message) {
        console.log(`[游戏日志] ${message}`);

        // 游戏日志显示逻辑将在后续任务中实现
        // 可以添加到游戏日志面板或控制台
    }

    /**
     * 切换UI可见性
     */
    toggleVisibility() {
        this.isVisible = !this.isVisible;

        const uiElements = document.querySelectorAll('.game-info, .game-controls');
        uiElements.forEach(element => {
            element.style.display = this.isVisible ? 'flex' : 'none';
        });

        console.log(`UI ${this.isVisible ? '显示' : '隐藏'}`);
    }

    /**
     * 显示游戏结束画面
     */
    showGameOverScreen() {
        this.showMessage('游戏结束！点击重新开始', 'error', 5000);
    }

    /**
     * 显示胜利画面
     */
    showVictoryScreen() {
        this.showMessage('恭喜！你获得了胜利！', 'success', 5000);
    }

    /**
     * 重置UI
     */
    reset() {
        this.updatePlayerStats();
        this.updateKnifeStats();
        this.updateGameStatus();
        this.updateControlButtons();
        console.log('UI已重置');
    }

    /**
     * 销毁UI
     */
    destroy() {
        // 清理事件监听器等资源
        console.log('UI已销毁');
    }
}