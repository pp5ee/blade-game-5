// 转刀刀游戏性能优化管理器
class OptimizationManager {
    constructor(game) {
        this.game = game;
        this.performanceMetrics = {
            fps: 0,
            frameTime: 0,
            npcUpdateTime: 0,
            renderTime: 0,
            collisionTime: 0
        };

        this.optimizations = {
            enabled: true,
            maxNPCs: 8,
            updateDistance: 10,
            useDirtyRects: true,
            collisionOptimization: true,
            objectPooling: true
        };

        this.setupOptimizations();
    }

    setupOptimizations() {
        console.log('🚀 初始化性能优化管理器');
        this.setupPerformanceMonitoring();
        this.applyGameOptimizations();
    }

    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();

        const monitorPerformance = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) {
                this.performanceMetrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                this.dynamicOptimization();
            }

            requestAnimationFrame(monitorPerformance);
        };

        monitorPerformance();
    }

    applyGameOptimizations() {
        this.optimizeNPCManagement();
        this.optimizeRendering();
        this.optimizeCollisionDetection();
        this.optimizeMemoryUsage();
    }

    optimizeNPCManagement() {
        const originalGenerateNPCs = this.game.generateNPCs;

        this.game.generateNPCs = () => {
            let targetNpcs = this.game.config.maxNPCs;
            if (this.game.config.dynamicDifficulty.enabled) {
                const playerKnives = this.game.player.getTotalKnives();
                targetNpcs = Math.floor(
                    this.game.config.dynamicDifficulty.minNPCs +
                    playerKnives * this.game.config.dynamicDifficulty.difficultyScale
                );
                targetNpcs = Math.min(targetNpcs, this.optimizations.maxNPCs);
                targetNpcs = Math.max(targetNpcs, this.game.config.dynamicDifficulty.minNPCs);
            }

            if (this.performanceMetrics.fps < 45) {
                targetNpcs = Math.max(3, Math.floor(targetNpcs * 0.7));
            }

            this.game.npcs = [];
            for (let i = 0; i < targetNpcs; i++) {
                const npc = new NPC(this.game.map, this.game.config, this.game.player);
                if (npc.position) {
                    this.game.npcs.push(npc);
                }
            }

            console.log(`🎯 优化NPC数量: ${targetNpcs} (FPS: ${this.performanceMetrics.fps})`);
        };
    }

    optimizeRendering() {
        if (!this.optimizations.useDirtyRects) return;

        this.game.dirtyRects = [];
        const originalRender = this.game.render;

        this.game.render = (ctx) => {
            const startTime = performance.now();

            if (this.game.dirtyRects.length > 0 && this.performanceMetrics.fps < 55) {
                this.renderDirtyRects(ctx);
            } else {
                originalRender.call(this.game, ctx);
            }

            this.performanceMetrics.renderTime = performance.now() - startTime;
        };
    }

    renderDirtyRects(ctx) {
        this.game.dirtyRects.forEach(rect => {
            ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
            this.renderMapArea(ctx, rect);
        });
        this.game.dirtyRects = [];
    }

    optimizeCollisionDetection() {
        if (!this.optimizations.collisionOptimization) return;

        this.game.spatialGrid = new Map();
        const originalUpdate = this.game.update;

        this.game.update = (deltaTime) => {
            const startTime = performance.now();
            this.optimizeCollisionChecks();
            originalUpdate.call(this.game, deltaTime);
            this.performanceMetrics.collisionTime = performance.now() - startTime;
        };
    }

    optimizeCollisionChecks() {
        this.buildSpatialGrid();
        this.checkNearbyCollisions();
    }

    buildSpatialGrid() {
        this.game.spatialGrid.clear();
        const allEntities = [this.game.player, ...this.game.npcs, ...this.game.knives];

        allEntities.forEach(entity => {
            if (entity && entity.position) {
                const gridX = Math.floor(entity.position.x / 5);
                const gridY = Math.floor(entity.position.y / 5);
                const key = `${gridX},${gridY}`;

                if (!this.game.spatialGrid.has(key)) {
                    this.game.spatialGrid.set(key, []);
                }
                this.game.spatialGrid.get(key).push(entity);
            }
        });
    }

    optimizeMemoryUsage() {
        if (!this.optimizations.objectPooling) return;

        this.game.objectPools = {
            npcs: [],
            knives: []
        };

        this.setupObjectPools();
    }

    setupObjectPools() {
        for (let i = 0; i < 10; i++) {
            this.game.objectPools.npcs.push(new NPC(this.game.map, this.game.config, this.game.player));
        }

        for (let i = 0; i < 20; i++) {
            this.game.objectPools.knives.push({
                position: { x: 0, y: 0 },
                color: 'blue',
                collected: false
            });
        }
    }

    dynamicOptimization() {
        const fps = this.performanceMetrics.fps;

        if (fps < 45) {
            this.optimizations.useDirtyRects = true;
            this.optimizations.collisionOptimization = true;
            this.optimizations.maxNPCs = 6;
        } else if (fps < 55) {
            this.optimizations.useDirtyRects = true;
            this.optimizations.collisionOptimization = true;
            this.optimizations.maxNPCs = 8;
        } else {
            this.optimizations.useDirtyRects = false;
            this.optimizations.collisionOptimization = false;
            this.optimizations.maxNPCs = 10;
        }

        console.log(`⚡ 动态优化调整 - FPS: ${fps}, NPC数量限制: ${this.optimizations.maxNPCs}`);
    }

    getPerformanceReport() {
        return {
            fps: this.performanceMetrics.fps,
            frameTime: this.performanceMetrics.frameTime.toFixed(2),
            renderTime: this.performanceMetrics.renderTime.toFixed(2),
            collisionTime: this.performanceMetrics.collisionTime.toFixed(2),
            optimizations: this.optimizations
        };
    }
}