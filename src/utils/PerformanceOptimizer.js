/**
 * 转刀刀游戏 - 性能优化器
 * 负责监控和优化游戏性能
 */

export class PerformanceOptimizer {
    constructor(game) {
        this.game = game;

        // 性能统计
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastFpsUpdate: 0,
            averageFps: 0,
            fpsSamples: [],
            maxSamples: 60
        };

        // 优化设置
        this.config = {
            targetFps: 60,
            qualityLevel: 'high', // high, medium, low
            enableDynamicQuality: true,
            minFpsThreshold: 45,
            maxFpsThreshold: 55
        };

        // 性能监控
        this.performanceMetrics = {
            updateTime: 0,
            renderTime: 0,
            frameTime: 0,
            entityCount: 0
        };

        console.log('性能优化器初始化完成');
    }

    /**
     * 更新性能统计
     */
    update(deltaTime) {
        this.updateFpsStats(deltaTime);
        this.monitorPerformance();
        this.optimizeQuality();
        this.checkMemoryUsage();
    }

    /**
     * 更新FPS统计
     */
    updateFpsStats(deltaTime) {
        this.stats.frameCount++;
        this.stats.lastFpsUpdate += deltaTime;

        // 每秒更新一次FPS
        if (this.stats.lastFpsUpdate >= 1) {
            this.stats.fps = this.stats.frameCount;
            this.stats.frameCount = 0;
            this.stats.lastFpsUpdate = 0;

            // 计算平均FPS
            this.stats.fpsSamples.push(this.stats.fps);
            if (this.stats.fpsSamples.length > this.stats.maxSamples) {
                this.stats.fpsSamples.shift();
            }

            this.stats.averageFps = this.stats.fpsSamples.reduce((a, b) => a + b, 0) / this.stats.fpsSamples.length;
        }
    }

    /**
     * 监控性能指标
     */
    monitorPerformance() {
        // 实体数量统计
        this.performanceMetrics.entityCount =
            this.game.npcs.length +
            this.game.knives.length +
            1; // 玩家

        // 帧时间统计（简化版）
        this.performanceMetrics.frameTime = 1000 / (this.stats.fps || 60);
    }

    /**
     * 优化质量设置
     */
    optimizeQuality() {
        if (!this.config.enableDynamicQuality) return;

        // 根据FPS动态调整质量
        if (this.stats.averageFps < this.config.minFpsThreshold) {
            this.lowerQuality();
        } else if (this.stats.averageFps > this.config.maxFpsThreshold && this.config.qualityLevel !== 'high') {
            this.increaseQuality();
        }
    }

    /**
     * 降低质量
     */
    lowerQuality() {
        if (this.config.qualityLevel === 'high') {
            this.config.qualityLevel = 'medium';
            this.applyMediumQualitySettings();
            console.log('质量调整为: 中等');
        } else if (this.config.qualityLevel === 'medium') {
            this.config.qualityLevel = 'low';
            this.applyLowQualitySettings();
            console.log('质量调整为: 低');
        }
    }

    /**
     * 提高质量
     */
    increaseQuality() {
        if (this.config.qualityLevel === 'low') {
            this.config.qualityLevel = 'medium';
            this.applyMediumQualitySettings();
            console.log('质量调整为: 中等');
        } else if (this.config.qualityLevel === 'medium') {
            this.config.qualityLevel = 'high';
            this.applyHighQualitySettings();
            console.log('质量调整为: 高');
        }
    }

    /**
     * 应用高质量设置
     */
    applyHighQualitySettings() {
        // 高质量设置
        this.game.config.fps = 60;

        // 启用所有视觉效果
        if (this.game.mapGenerator) {
            this.game.mapGenerator.config.obstacleDensity = 0.15;
        }
    }

    /**
     * 应用中等质量设置
     */
    applyMediumQualitySettings() {
        // 中等质量设置
        this.game.config.fps = 45;

        // 减少视觉效果
        if (this.game.mapGenerator) {
            this.game.mapGenerator.config.obstacleDensity = 0.1;
        }
    }

    /**
     * 应用低质量设置
     */
    applyLowQualitySettings() {
        // 低质量设置
        this.game.config.fps = 30;

        // 最小化视觉效果
        if (this.game.mapGenerator) {
            this.game.mapGenerator.config.obstacleDensity = 0.05;
        }
    }

    /**
     * 检查内存使用
     */
    checkMemoryUsage() {
        if (performance.memory) {
            const usedMemory = performance.memory.usedJSHeapSize;
            const totalMemory = performance.memory.totalJSHeapSize;

            // 内存使用率超过80%时警告
            if (usedMemory / totalMemory > 0.8) {
                console.warn('内存使用率过高，考虑清理资源');
                this.cleanupResources();
            }
        }
    }

    /**
     * 清理资源
     */
    cleanupResources() {
        // 清理已收集的刀
        this.game.knives = this.game.knives.filter(knife => !knife.shouldRemove);

        // 清理死亡NPC
        this.game.npcs = this.game.npcs.filter(npc => npc.isAlive);

        console.log('资源清理完成');
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            fps: this.stats.fps,
            averageFps: this.stats.averageFps,
            qualityLevel: this.config.qualityLevel,
            entityCount: this.performanceMetrics.entityCount,
            frameTime: this.performanceMetrics.frameTime,
            memoryUsage: performance.memory ?
                Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A'
        };
    }

    /**
     * 启用/禁用动态质量调整
     */
    setDynamicQuality(enabled) {
        this.config.enableDynamicQuality = enabled;
        console.log(`动态质量调整: ${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 设置目标质量级别
     */
    setQualityLevel(level) {
        if (['high', 'medium', 'low'].includes(level)) {
            this.config.qualityLevel = level;

            switch (level) {
                case 'high':
                    this.applyHighQualitySettings();
                    break;
                case 'medium':
                    this.applyMediumQualitySettings();
                    break;
                case 'low':
                    this.applyLowQualitySettings();
                    break;
            }

            console.log(`质量级别设置为: ${level}`);
        }
    }

    /**
     * 重置性能优化器
     */
    reset() {
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastFpsUpdate: 0,
            averageFps: 0,
            fpsSamples: [],
            maxSamples: 60
        };

        this.performanceMetrics = {
            updateTime: 0,
            renderTime: 0,
            frameTime: 0,
            entityCount: 0
        };

        console.log('性能优化器重置完成');
    }
}