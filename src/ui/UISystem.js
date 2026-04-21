/**
 * 转刀刀游戏 - UI系统
 * 负责管理游戏用户界面和HUD显示
 */

export class UISystem {
    constructor(game) {
        this.game = game;

        // UI元素引用
        this.uiElements = {
            gameStatus: document.getElementById('game-status'),
            playerHp: document.getElementById('player-hp'),
            redKnives: document.getElementById('red-knives'),
            yellowKnives: document.getElementById('yellow-knives'),
            blueKnives: document.getElementById('blue-knives'),
            defeatedNpcs: document.getElementById('defeated-npcs'),
            gameScore: document.getElementById('game-score'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            restartBtn: document.getElementById('restart-btn')
        };

        // UI配置
        this.config = {
            fontSize: 16,
            fontFamily: 'Courier New, monospace',
            textColor: '#ffffff',
            highlightColor: '#06d6a0',
            warningColor: '#e94560'
        };

        console.log('UI系统初始化完成');
    }

    /**
     * 更新所有统计信息
     */
    updateAllStats() {
        this.updatePlayerStats();
        this.updateKnifeStats();
        this.updateGameStats();
    }

    /**
     * 更新玩家状态
     */
    updatePlayerStats() {
        if (!this.game.player) return;

        const player = this.game.player;
        const hpElement = this.uiElements.playerHp;

        if (hpElement) {
            hpElement.textContent = player.hp;

            // 根据生命值改变颜色
            if (player.hp <= 30) {
                hpElement.style.color = this.config.warningColor;
            } else if (player.hp <= 60) {
                hpElement.style.color = '#ffd166'; // 黄色
            } else {
                hpElement.style.color = this.config.highlightColor;
            }
        }
    }

    /**
     * 更新刀统计
     */
    updateKnifeStats() {
        if (!this.game.player) return;

        const knives = this.game.player.knives;

        if (this.uiElements.redKnives) {
            this.uiElements.redKnives.textContent = knives.red;
        }

        if (this.uiElements.yellowKnives) {
            this.uiElements.yellowKnives.textContent = knives.yellow;
        }

        if (this.uiElements.blueKnives) {
            this.uiElements.blueKnives.textContent = knives.blue;
        }
    }

    /**
     * 更新游戏统计
     */
    updateGameStats() {
        const stats = this.game.stats;

        if (this.uiElements.defeatedNpcs) {
            this.uiElements.defeatedNpcs.textContent = stats.defeatedNpcs;
        }

        if (this.uiElements.gameScore) {
            this.uiElements.gameScore.textContent = stats.score;
        }
    }

    /**
     * 更新游戏状态显示
     */
    updateGameStatus(message) {
        if (this.uiElements.gameStatus) {
            this.uiElements.gameStatus.textContent = message;

            // 根据状态改变颜色
            if (this.game.state === 'gameOver') {
                this.uiElements.gameStatus.style.background = this.config.warningColor;
            } else if (this.game.state === 'won') {
                this.uiElements.gameStatus.style.background = this.config.highlightColor;
            } else {
                this.uiElements.gameStatus.style.background = '#118ab2'; // 蓝色
            }
        }
    }

    /**
     * 更新控制按钮状态
     */
    updateControlButtons() {
        const state = this.game.state;

        if (this.uiElements.startBtn && this.uiElements.pauseBtn && this.uiElements.restartBtn) {
            switch (state) {
                case 'ready':
                    this.uiElements.startBtn.style.display = 'block';
                    this.uiElements.pauseBtn.style.display = 'none';
                    this.uiElements.restartBtn.style.display = 'none';
                    break;

                case 'playing':
                case 'debug':
                    this.uiElements.startBtn.style.display = 'none';
                    this.uiElements.pauseBtn.style.display = 'block';
                    this.uiElements.restartBtn.style.display = 'block';
                    this.uiElements.pauseBtn.textContent = '暂停';
                    break;

                case 'paused':
                    this.uiElements.startBtn.style.display = 'none';
                    this.uiElements.pauseBtn.style.display = 'block';
                    this.uiElements.restartBtn.style.display = 'block';
                    this.uiElements.pauseBtn.textContent = '继续';
                    break;

                case 'gameOver':
                case 'won':
                    this.uiElements.startBtn.style.display = 'none';
                    this.uiElements.pauseBtn.style.display = 'none';
                    this.uiElements.restartBtn.style.display = 'block';
                    break;
            }
        }
    }

    /**
     * 渲染游戏内UI
     */
    render(ctx) {
        this.renderHUD(ctx);
        this.renderGameState(ctx);

        // 调试模式显示额外信息
        if (this.game.state === 'debug') {
            this.renderDebugInfo(ctx);
        }
    }

    /**
     * 渲染HUD界面
     */
    renderHUD(ctx) {
        const player = this.game.player;
        if (!player) return;

        // 生命值条
        this.renderHealthBar(ctx, player);

        // 刀收集状态
        this.renderKnifeStatus(ctx, player);

        // 游戏时间
        this.renderGameTime(ctx);
    }

    /**
     * 渲染生命值条
     */
    renderHealthBar(ctx, player) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = 10;
        const barY = 10;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 生命值填充
        const hpPercent = player.hp / player.maxHp;
        let barColor;

        if (hpPercent > 0.6) {
            barColor = '#06d6a0'; // 绿色
        } else if (hpPercent > 0.3) {
            barColor = '#ffd166'; // 黄色
        } else {
            barColor = '#e94560'; // 红色
        }

        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // 文本
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Courier New';
        ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, barX + 5, barY + 14);
    }

    /**
     * 渲染刀状态
     */
    renderKnifeStatus(ctx, player) {
        const startX = 10;
        const startY = 40;
        const iconSize = 15;
        const spacing = 25;

        ctx.font = '12px Courier New';
        ctx.fillStyle = '#ffffff';

        // 红刀
        ctx.fillStyle = '#e94560';
        ctx.fillRect(startX, startY, iconSize, iconSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`x${player.knives.red}`, startX + iconSize + 5, startY + 12);

        // 黄刀
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(startX, startY + spacing, iconSize, iconSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`x${player.knives.yellow}`, startX + iconSize + 5, startY + spacing + 12);

        // 蓝刀
        ctx.fillStyle = '#118ab2';
        ctx.fillRect(startX, startY + spacing * 2, iconSize, iconSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`x${player.knives.blue}`, startX + iconSize + 5, startY + spacing * 2 + 12);

        // 总加成
        const totalBonus = player.getTotalDamageBonus();
        ctx.fillStyle = '#06d6a0';
        ctx.fillText(`攻击加成: +${(totalBonus * 100).toFixed(0)}%`, startX, startY + spacing * 3 + 5);
    }

    /**
     * 渲染游戏时间
     */
    renderGameTime(ctx) {
        const time = this.game.stats.gameDuration;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Courier New';
        ctx.fillText(`时间: ${minutes}:${seconds.toString().padStart(2, '0')}`, 10, 130);

        // 分数
        ctx.fillText(`分数: ${this.game.stats.score}`, 10, 150);
    }

    /**
     * 渲染游戏状态信息
     */
    renderGameState(ctx) {
        if (this.game.state === 'gameOver' || this.game.state === 'won') {
            this.renderGameOverScreen(ctx);
        } else if (this.game.state === 'paused') {
            this.renderPauseScreen(ctx);
        }
    }

    /**
     * 渲染游戏结束屏幕
     */
    renderGameOverScreen(ctx) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.game.config.canvasWidth, this.game.config.canvasHeight);

        // 标题
        ctx.fillStyle = this.game.state === 'won' ? '#06d6a0' : '#e94560';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';

        const title = this.game.state === 'won' ? '恭喜获胜！' : '游戏结束';
        ctx.fillText(title, this.game.config.canvasWidth / 2, this.game.config.canvasHeight / 2 - 50);

        // 统计信息
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Courier New';

        const stats = [
            `击败NPC: ${this.game.stats.defeatedNpcs}`,
            `收集刀: ${this.game.stats.totalKnivesCollected}`,
            `游戏时间: ${Math.floor(this.game.stats.gameDuration)}秒`,
            `最终分数: ${this.game.stats.score}`
        ];

        stats.forEach((stat, index) => {
            ctx.fillText(stat, this.game.config.canvasWidth / 2, this.game.config.canvasHeight / 2 + index * 30);
        });

        // 提示
        ctx.font = '18px Courier New';
        ctx.fillStyle = '#ffd166';
        ctx.fillText('按 R 键重新开始', this.game.config.canvasWidth / 2, this.game.config.canvasHeight / 2 + 150);

        ctx.textAlign = 'left';
    }

    /**
     * 渲染暂停屏幕
     */
    renderPauseScreen(ctx) {
        // 半透明覆盖层
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.game.config.canvasWidth, this.game.config.canvasHeight);

        // 暂停文本
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', this.game.config.canvasWidth / 2, this.game.config.canvasHeight / 2);

        ctx.font = '18px Courier New';
        ctx.fillText('按 P 键继续游戏', this.game.config.canvasWidth / 2, this.game.config.canvasHeight / 2 + 40);

        ctx.textAlign = 'left';
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo(ctx) {
        const info = [
            `FPS: ${Math.round(1 / this.game.deltaTime)}`,
            `实体数量: ${this.game.npcs.length + this.game.knives.length + 1}`,
            `游戏状态: ${this.game.state}`,
            `内存使用: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`
        ];

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Courier New';

        info.forEach((text, index) => {
            ctx.fillText(text, this.game.config.canvasWidth - 200, 20 + index * 15);
        });
    }

    /**
     * 显示临时消息
     */
    showMessage(text, duration = 3) {
        // 这里可以添加临时消息显示功能
        console.log(`UI消息: ${text}`);

        // 实际实现中可以创建浮动文本效果
    }

    /**
     * 重置UI系统
     */
    reset() {
        this.updateAllStats();
        this.updateGameStatus('准备开始游戏');
        this.updateControlButtons();
        console.log('UI系统重置完成');
    }
}