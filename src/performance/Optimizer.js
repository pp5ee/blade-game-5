/**
 * 转刀刀游戏 - 性能优化模块
 * 负责游戏性能监控、优化和调试
 */

export class Optimizer {
    constructor(game) {
        this.game = game;

        // 性能监控
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.frameTimes = [];

        // 性能统计
        this.stats = {
            totalFrames: 0,
            averageFps: 0,
            minFps: Infinity,
            maxFps: 0,
            frameTime: 0
        };

        // 优化配置
        this.config = {
            enableOptimizations: true,
            targetFps: 60,
            maxFrameTime: 16.67, // 60FPS对应的每帧时间
            objectPoolSize: 100
        };

        // 对象池
        this.objectPools = new Map();

        console.log('性能优化器初始化完成');
    }

    /**
     * 更新性能监控
     */
    update(currentTime) {
        // 更新FPS计算
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;

            // 更新统计信息
            this.updateStats();

            // 性能警告
            this.checkPerformance();
        }

        // 记录帧时间
        const frameTime = currentTime - (this.lastFrameTime || currentTime);
        this.lastFrameTime = currentTime;

        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }
    }

    /**
     * 更新性能统计
     */
    updateStats() {
        this.stats.totalFrames++;
        this.stats.averageFps = (this.stats.averageFps * (this.stats.totalFrames - 1) + this.fps) / this.stats.totalFrames;
        this.stats.minFps = Math.min(this.stats.minFps, this.fps);
        this.stats.maxFps = Math.max(this.stats.maxFps, this.fps);

        // 计算平均帧时间
        if (this.frameTimes.length > 0) {
            this.stats.frameTime = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
        }
    }

    /**
     * 检查性能并发出警告
     */
    checkPerformance() {
        if (this.fps < this.config.targetFps * 0.8) {
            console.warn(`性能警告: FPS较低 (${this.fps})，建议优化`);
        }

        if (this.stats.frameTime > this.config.maxFrameTime * 1.5) {
            console.warn(`性能警告: 帧时间过长 (${this.stats.frameTime.toFixed(2)}ms)`);
        }
    }

    /**
     * 获取对象池中的对象
     */
    getFromPool(objectType) {
        if (!this.objectPools.has(objectType)) {
            this.objectPools.set(objectType, []);
        }

        const pool = this.objectPools.get(objectType);

        if (pool.length > 0) {
            return pool.pop();
        }

        // 池为空，创建新对象
        return this.createObject(objectType);
    }

    /**
     * 将对象返回到对象池
     */
    returnToPool(objectType, object) {
        if (!this.objectPools.has(objectType)) {
            this.objectPools.set(objectType, []);
        }

        const pool = this.objectPools.get(objectType);

        if (pool.length < this.config.objectPoolSize) {
            // 重置对象状态
            this.resetObject(object);
            pool.push(object);
        }
    }

    /**
     * 创建新对象
     */
    createObject(objectType) {
        // 根据对象类型创建新实例
        // 这里需要根据实际游戏对象来实现
        switch (objectType) {
            case 'knife':
                return { type: 'knife', x: 0, y: 0, collected: false };
            case 'npc':
                return { type: 'npc', x: 0, y: 0, hp: 50 };
            default:
                return {};
        }
    }

    /**
     * 重置对象状态
     */
    resetObject(object) {
        // 重置对象到初始状态
        if (object.type === 'knife') {
            object.collected = false;
            object.x = 0;
            object.y = 0;
        } else if (object.type === 'npc') {
            object.hp = 50;
            object.x = 0;
            object.y = 0;
        }
    }

    /**
     * 优化渲染性能
     */
    optimizeRendering() {
        if (!this.config.enableOptimizations) return;

        // 实现渲染优化策略
        this.optimizeCanvasRendering();
        this.reduceOverdraw();
        this.batchRenderingOperations();
    }

    /**
     * 优化Canvas渲染
     */
    optimizeCanvasRendering() {
        const ctx = this.game.ctx;

        // 批量设置渲染状态
        ctx.imageSmoothingEnabled = false;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // 使用离屏Canvas进行复杂绘制
        this.useOffscreenCanvas();
    }

    /**
     * 使用离屏Canvas
     */
    useOffscreenCanvas() {
        // 离屏Canvas优化将在后续任务中实现
        // 用于缓存静态背景、重复元素等
    }

    /**
     * 减少过度绘制
     */
    reduceOverdraw() {
        // 实现减少过度绘制的策略
        // 例如：只绘制可见区域、使用脏矩形等
    }

    /**
     * 批量渲染操作
     */
    batchRenderingOperations() {
        // 实现批量渲染优化
        // 例如：批量绘制相同颜色的图形
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            currentFps: this.fps,
            averageFps: this.stats.averageFps.toFixed(1),
            minFps: this.stats.minFps,
            maxFps: this.stats.maxFps,
            frameTime: this.stats.frameTime.toFixed(2),
            totalFrames: this.stats.totalFrames,
            objectPools: this.getPoolStats()
        };
    }

    /**
     * 获取对象池统计
     */
    getPoolStats() {
        const stats = {};
        for (const [type, pool] of this.objectPools) {
            stats[type] = {
                poolSize: pool.length,
                maxSize: this.config.objectPoolSize
            };
        }
        return stats;
    }

    /**
     * 显示性能面板
     */
    showPerformancePanel() {
        const report = this.getPerformanceReport();

        console.log('=== 性能报告 ===');
        console.log(`当前FPS: ${report.currentFps}`);
        console.log(`平均FPS: ${report.averageFps}`);
        console.log(`最小FPS: ${report.minFps}, 最大FPS: ${report.maxFps}`);
        console.log(`平均帧时间: ${report.frameTime}ms`);
        console.log(`总帧数: ${report.totalFrames}`);

        console.log('对象池统计:');
        for (const [type, stat] of Object.entries(report.objectPools)) {
            console.log(`  ${type}: ${stat.poolSize}/${stat.maxSize}`);
        }
    }

    /**
     * 重置性能监控
     */
    reset() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.frameTimes = [];
        this.stats = {
            totalFrames: 0,
            averageFps: 0,
            minFps: Infinity,
            maxFps: 0,
            frameTime: 0
        };

        console.log('性能监控已重置');
    }

    /**
     * 销毁优化器
     */
    destroy() {
        // 清理对象池
        this.objectPools.clear();
        console.log('性能优化器已销毁');
    }
}