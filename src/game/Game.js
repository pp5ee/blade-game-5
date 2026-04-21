/**
 * 转刀刀游戏 - 主游戏类
 * 负责游戏的整体控制、状态管理和系统协调
 */

import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Knife } from '../entities/Knife.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { MapGenerator } from '../map/MapGenerator.js';
import { UISystem } from '../ui/UISystem.js';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // 游戏配置
        this.config = {
            canvasWidth: 800,
            canvasHeight: 600,
            fps: 60,
            maxNpcs: 8,
            maxKnives: 20,
            npcSpawnInterval: 3,
            knifeSpawnInterval: 5
        };

        // 游戏状态
        this.state = 'ready'; // ready, playing, paused, gameOver, won
        this.gameTime = 0;
        this.lastTime = 0;
        this.deltaTime = 0;

        // 游戏实体
        this.player = null;
        this.npcs = [];
        this.knives = [];

        // 游戏系统
        this.combatSystem = null;
        this.mapGenerator = null;
        this.uiSystem = null;
        this.performanceOptimizer = null;

        // 输入控制
        this.keys = {};

        // 游戏统计
        this.stats = {
            score: 0,
            defeatedNpcs: 0,
            totalKnivesCollected: 0,
            gameStartTime: 0,
            gameDuration: 0
        };

        // 初始化游戏
        this.init();
    }

    /**
     * 初始化游戏
     */
    init() {
        console.log('初始化转刀刀游戏...');

        // 设置画布尺寸
        this.canvas.width = this.config.canvasWidth;
        this.canvas.height = this.config.canvasHeight;

        // 初始化系统
        this.combatSystem = new CombatSystem(this);
        this.mapGenerator = new MapGenerator(this);
        this.uiSystem = new UISystem(this);
        this.performanceOptimizer = new PerformanceOptimizer(this);

        // 初始化实体
        this.initEntities();

        // 设置事件监听
        this.setupEventListeners();

        // 开始游戏循环
        this.startGameLoop();

        console.log('游戏初始化完成！');
    }

    /**
     * 初始化游戏实体
     */
    initEntities() {
        // 创建玩家
        const playerStartPos = this.mapGenerator.getPlayerStartPosition();
        this.player = new Player(this, playerStartPos.x, playerStartPos.y);

        // 创建初始NPC
        this.spawnInitialNpcs();

        // 创建初始刀
        this.spawnInitialKnives();
    }

    /**
     * 生成初始NPC
     */
    spawnInitialNpcs() {
        const npcCount = Math.min(4, this.config.maxNpcs);

        for (let i = 0; i < npcCount; i++) {
            const npcPos = this.mapGenerator.getNpcSpawnPosition();
            const npcType = this.getRandomNpcType();

            const npc = new NPC(this, npcPos.x, npcPos.y, npcType);
            this.npcs.push(npc);
        }

        console.log(`生成了 ${npcCount} 个初始NPC`);
    }

    /**
     * 生成初始刀
     */
    spawnInitialKnives() {
        const knifeCount = Math.min(6, this.config.maxKnives);

        for (let i = 0; i < knifeCount; i++) {
            const knifePos = this.mapGenerator.getKnifeSpawnPosition();
            const knifeType = Knife.getRandomType();

            const knife = new Knife(this, knifePos.x, knifePos.y, knifeType);
            this.knives.push(knife);
        }

        console.log(`生成了 ${knifeCount} 把初始刀`);
    }

    /**
     * 获取随机NPC类型
     */
    getRandomNpcType() {
        const types = ['normal', 'fast', 'strong'];
        const weights = [0.6, 0.3, 0.1]; // 普通:60%, 快速:30%, 强力:10%

        const rand = Math.random();
        let cumulative = 0;

        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (rand <= cumulative) {
                return types[i];
            }
        }

        return 'normal';
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 窗口事件
        window.addEventListener('blur', () => {
            if (this.state === 'playing') {
                this.pause();
            }
        });

        // 按钮事件
        this.setupButtonEvents();
    }

    /**
     * 设置按钮事件
     */
    setupButtonEvents() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }
    }

    /**
     * 处理按键事件
     */
    handleKeyPress(e) {
        switch (e.code) {
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyR':
                if (this.state === 'gameOver' || this.state === 'won') {
                    this.restart();
                }
                break;
            case 'KeyD':
                if (e.ctrlKey) {
                    this.toggleDebugMode();
                }
                break;
            case 'Space':
                if (this.state === 'ready') {
                    this.start();
                }
                break;
        }
    }

    /**
     * 开始游戏
     */
    start() {
        if (this.state !== 'ready') return;

        this.state = 'playing';
        this.stats.gameStartTime = performance.now();

        // 更新UI按钮状态
        this.uiSystem.updateControlButtons();
        this.uiSystem.updateGameStatus('游戏进行中');

        console.log('游戏开始！');
    }

    /**
     * 暂停/继续游戏
     */
    togglePause() {
        if (this.state === 'playing') {
            this.pause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }

    /**
     * 暂停游戏
     */
    pause() {
        if (this.state !== 'playing') return;

        this.state = 'paused';
        this.uiSystem.updateGameStatus('游戏暂停');
        console.log('游戏暂停');
    }

    /**
     * 继续游戏
     */
    resume() {
        if (this.state !== 'paused') return;

        this.state = 'playing';
        this.uiSystem.updateGameStatus('游戏进行中');
        console.log('游戏继续');
    }

    /**
     * 重新开始游戏
     */
    restart() {
        console.log('重新开始游戏...');

        // 重置游戏状态
        this.state = 'ready';
        this.gameTime = 0;
        this.stats = {
            score: 0,
            defeatedNpcs: 0,
            totalKnivesCollected: 0,
            gameStartTime: 0,
            gameDuration: 0
        };

        // 清空实体
        this.npcs = [];
        this.knives = [];

        // 重新初始化实体
        this.initEntities();

        // 更新UI
        this.uiSystem.updateControlButtons();
        this.uiSystem.updateGameStatus('准备开始游戏');
        this.uiSystem.updateAllStats();

        console.log('游戏重置完成！');
    }

    /**
     * 切换调试模式
     */
    toggleDebugMode() {
        if (this.state === 'debug') {
            this.state = 'playing';
            console.log('调试模式关闭');
        } else {
            this.state = 'debug';
            console.log('调试模式开启');
        }
    }

    /**
     * 开始游戏循环
     */
    startGameLoop() {
        const gameLoop = (currentTime) => {
            // 计算时间增量
            if (this.lastTime === 0) {
                this.lastTime = currentTime;
            }
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            // 更新游戏时间
            if (this.state === 'playing' || this.state === 'debug') {
                this.gameTime += this.deltaTime;
                this.stats.gameDuration = this.gameTime;
            }

            // 更新游戏状态
            this.update();

            // 渲染游戏画面
            this.render();

            // 继续游戏循环
            requestAnimationFrame(gameLoop);
        };

        // 启动游戏循环
        requestAnimationFrame(gameLoop);
    }

    /**
     * 更新游戏逻辑
     */
    update() {
        if (this.state !== 'playing' && this.state !== 'debug') return;

        // 更新玩家
        if (this.player) {
            this.player.update(this.deltaTime);
        }

        // 更新NPC
        this.npcs.forEach((npc, index) => {
            npc.update(this.deltaTime);

            // 检查碰撞
            if (npc.isAlive && this.player && this.player.isAlive) {
                this.combatSystem.checkCollision(this.player, npc);
            }
        });

        // 更新刀
        this.knives.forEach((knife, index) => {
            knife.update(this.deltaTime);

            // 移除已收集的刀
            if (knife.shouldRemove) {
                this.knives.splice(index, 1);
            }
        });

        // 生成新NPC和刀
        this.spawnEntities();

        // 检查游戏状态
        this.checkGameState();

        // 更新性能优化
        this.performanceOptimizer.update(this.deltaTime);

        // 更新UI
        this.uiSystem.updateAllStats();
    }

    /**
     * 生成新实体
     */
    spawnEntities() {
        // 生成NPC
        if (this.npcs.length < this.config.maxNpcs &&
            this.gameTime % this.config.npcSpawnInterval < this.deltaTime) {

            const npcPos = this.mapGenerator.getNpcSpawnPosition();
            const npcType = this.getRandomNpcType();

            const npc = new NPC(this, npcPos.x, npcPos.y, npcType);
            this.npcs.push(npc);
        }

        // 生成刀
        if (this.knives.length < this.config.maxKnives &&
            this.gameTime % this.config.knifeSpawnInterval < this.deltaTime) {

            const knifePos = this.mapGenerator.getKnifeSpawnPosition();
            const knifeType = Knife.getRandomType();

            const knife = new Knife(this, knifePos.x, knifePos.y, knifeType);
            this.knives.push(knife);
        }
    }

    /**
     * 检查游戏状态
     */
    checkGameState() {
        // 检查玩家是否死亡
        if (this.player && !this.player.isAlive && this.state === 'playing') {
            this.gameOver();
            return;
        }

        // 检查是否击败所有NPC
        const aliveNpcs = this.npcs.filter(npc => npc.isAlive);
        if (aliveNpcs.length === 0 && this.npcs.length > 0 && this.state === 'playing') {
            this.win();
            return;
        }

        // 检查游戏时间限制（可选）
        if (this.gameTime > 300) { // 5分钟限制
            this.gameOver('时间到！');
        }
    }

    /**
     * 游戏结束
     */
    gameOver(reason = '玩家被击败！') {
        this.state = 'gameOver';
        this.uiSystem.updateGameStatus(reason);
        this.uiSystem.updateControlButtons();
        console.log(`游戏结束: ${reason}`);
    }

    /**
     * 游戏胜利
     */
    win() {
        this.state = 'won';

        // 计算最终分数
        this.stats.score += Math.floor(this.stats.defeatedNpcs * 100 + this.stats.totalKnivesCollected * 50);

        this.uiSystem.updateGameStatus('恭喜获胜！');
        this.uiSystem.updateControlButtons();
        console.log('游戏胜利！');
    }

    /**
     * NPC被击败事件
     */
    onNpcDefeated(npc) {
        this.stats.defeatedNpcs++;
        this.stats.score += 50;

        // NPC死亡时有概率掉落刀
        if (Math.random() < 0.4) { // 40%概率掉落
            const knifeType = Knife.getRandomType();
            const knife = new Knife(this, npc.x, npc.y, knifeType);
            this.knives.push(knife);
        }

        console.log(`NPC被击败！当前击败数: ${this.stats.defeatedNpcs}`);
    }

    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

        // 渲染地图
        this.mapGenerator.render(this.ctx);

        // 渲染刀
        this.knives.forEach(knife => knife.render(this.ctx));

        // 渲染NPC
        this.npcs.forEach(npc => npc.render(this.ctx));

        // 渲染玩家
        if (this.player) {
            this.player.render(this.ctx);
        }

        // 渲染UI
        this.uiSystem.render(this.ctx);

        // 调试信息
        if (this.state === 'debug') {
            this.renderDebugInfo();
        }
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';

        const debugInfo = [
            `FPS: ${Math.round(1 / this.deltaTime)}`,
            `游戏时间: ${this.gameTime.toFixed(1)}s`,
            `NPC数量: ${this.npcs.length}`,
            `刀数量: ${this.knives.length}`,
            `玩家HP: ${this.player ? this.player.hp : 0}`,
            `击败NPC: ${this.stats.defeatedNpcs}`
        ];

        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 10, 20 + index * 15);
        });
    }

    /**
     * 清理资源
     */
    destroy() {
        console.log('清理游戏资源...');

        // 移除事件监听器
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('keyup', this.handleKeyPress);

        // 清空实体
        this.npcs = [];
        this.knives = [];

        console.log('游戏资源清理完成');
    }
}