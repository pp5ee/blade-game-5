/**
 * 转刀刀游戏综合测试套件
 * 包含11+个测试用例，覆盖游戏核心功能
 */

class GameTestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    // 测试工具方法
    assert(condition, message) {
        if (condition) {
            console.log(`✅ ${message}`);
            this.passed++;
        } else {
            console.error(`❌ ${message}`);
            this.failed++;
        }
    }

    assertEquals(actual, expected, message) {
        this.assert(actual === expected, `${message} (期望: ${expected}, 实际: ${actual})`);
    }

    assertNotEquals(actual, expected, message) {
        this.assert(actual !== expected, `${message} (不应为: ${expected})`);
    }

    assertTrue(condition, message) {
        this.assert(condition, message);
    }

    assertFalse(condition, message) {
        this.assert(!condition, message);
    }

    // 测试用例 1: 游戏初始化测试
    testGameInitialization() {
        console.log('\n🧪 测试 1: 游戏初始化');
        const game = new Game();

        this.assertNotNull(game, '游戏实例应成功创建');
        this.assertFalse(game.isRunning, '游戏初始状态应为未运行');
        this.assertNotNull(game.player, '玩家实例应被创建');
        this.assertNotNull(game.map, '地图实例应被创建');
        this.assertEquals(game.npcs.length, 0, '初始NPC列表应为空');
        this.assertEquals(game.knives.length, 0, '初始刀具列表应为空');
    }

    // 测试用例 2: 玩家移动测试
    testPlayerMovement() {
        console.log('\n🧪 测试 2: 玩家移动');
        const game = new Game();
        const initialX = game.player.x;
        const initialY = game.player.y;

        // 测试向右移动
        game.player.moveRight();
        this.assertEquals(game.player.x, initialX + 1, '玩家应向右移动一格');
        this.assertEquals(game.player.y, initialY, '玩家Y坐标应保持不变');

        // 测试向下移动
        game.player.moveDown();
        this.assertEquals(game.player.y, initialY + 1, '玩家应向下移动一格');
    }

    // 测试用例 3: 地图生成测试
    testMapGeneration() {
        console.log('\n🧪 测试 3: 地图生成');
        const map = new MapGenerator({ width: 10, height: 10 }).generate();

        this.assertNotNull(map, '地图应成功生成');
        this.assertEquals(map.length, 10, '地图高度应为10');
        this.assertEquals(map[0].length, 10, '地图宽度应为10');

        // 检查地图包含合法地形
        let hasObstacle = false;
        let hasOpenSpace = false;

        for (let row of map) {
            for (let cell of row) {
                if (cell === 1) hasObstacle = true;
                if (cell === 0) hasOpenSpace = true;
            }
        }

        this.assertTrue(hasObstacle, '地图应包含障碍物');
        this.assertTrue(hasOpenSpace, '地图应包含开放空间');
    }

    // 测试用例 4: NPC生成和移动测试
    testNPCSpawnAndMovement() {
        console.log('\n🧪 测试 4: NPC生成和移动');
        const game = new Game();

        // 生成NPC
        const npc = new NPC(game, 5, 5);
        game.npcs.push(npc);

        this.assertNotNull(npc, 'NPC实例应成功创建');
        this.assertEquals(npc.x, 5, 'NPC初始X坐标应为5');
        this.assertEquals(npc.y, 5, 'NPC初始Y坐标应为5');

        // 测试NPC移动
        const initialX = npc.x;
        npc.update();
        this.assertNotEquals(npc.x, initialX, 'NPC应在更新后移动');
    }

    // 测试用例 5: 刀具生成和收集测试
    testKnifeSpawnAndCollection() {
        console.log('\n🧪 测试 5: 刀具生成和收集');
        const game = new Game();

        // 生成刀具
        const knife = new Knife(game, 3, 3, 'red');
        game.knives.push(knife);

        this.assertNotNull(knife, '刀具实例应成功创建');
        this.assertEquals(knife.type, 'red', '刀具类型应为红色');

        // 测试刀具收集
        game.player.x = 3;
        game.player.y = 3;
        const initialCount = game.player.knives.length;
        knife.collect(game.player);

        this.assertEquals(game.player.knives.length, initialCount + 1, '玩家刀具数量应增加');
        this.assertEquals(game.knives.length, 0, '刀具应从游戏中移除');
    }

    // 测试用例 6: 碰撞检测测试
    testCollisionDetection() {
        console.log('\n🧪 测试 6: 碰撞检测');
        const game = new Game();

        // 设置玩家和NPC在同一位置
        game.player.x = 5;
        game.player.y = 5;
        const npc = new NPC(game, 5, 5);
        game.npcs.push(npc);

        // 测试碰撞检测
        const collision = game.checkCollisions();
        this.assertTrue(collision, '玩家和NPC在同一位置时应检测到碰撞');
    }

    // 测试用例 7: 游戏状态管理测试
    testGameStateManagement() {
        console.log('\n🧪 测试 7: 游戏状态管理');
        const game = new Game();

        this.assertEquals(game.gameState, 'playing', '初始游戏状态应为playing');

        // 测试游戏结束
        game.endGame('gameOver');
        this.assertEquals(game.gameState, 'gameOver', '游戏状态应变为gameOver');

        // 测试游戏胜利
        game.endGame('won');
        this.assertEquals(game.gameState, 'won', '游戏状态应变为won');
    }

    // 测试用例 8: 性能优化测试
    testPerformanceOptimization() {
        console.log('\n🧪 测试 8: 性能优化');
        const game = new Game();

        this.assertNotNull(game.optimizationManager, '性能优化管理器应存在');

        const metrics = game.optimizationManager.getMetrics();
        this.assertNotNull(metrics, '应能获取性能指标');
        this.assertNotNull(metrics.fps, 'FPS指标应存在');
        this.assertNotNull(metrics.renderTime, '渲染时间指标应存在');
    }

    // 测试用例 9: 动态难度调整测试
    testDynamicDifficulty() {
        console.log('\n🧪 测试 9: 动态难度调整');
        const game = new Game();

        this.assertTrue(game.config.dynamicDifficulty.enabled, '动态难度应启用');

        // 测试难度调整逻辑
        const initialMaxNPCs = game.config.maxNPCs;
        game.adjustDifficulty();

        this.assertNotEquals(game.config.maxNPCs, initialMaxNPCs, '最大NPC数量应被调整');
    }

    // 测试用例 10: 刀具概率分布测试
    testKnifeProbabilityDistribution() {
        console.log('\n🧪 测试 10: 刀具概率分布');
        const game = new Game();

        const probabilities = game.config.knifeProbabilities;
        const totalProbability = probabilities.red + probabilities.yellow + probabilities.blue;

        this.assertEquals(totalProbability, 1, '刀具概率总和应为1');
        this.assertTrue(probabilities.red > 0, '红色刀具概率应大于0');
        this.assertTrue(probabilities.yellow > 0, '黄色刀具概率应大于0');
        this.assertTrue(probabilities.blue > 0, '蓝色刀具概率应大于0');
    }

    // 测试用例 11: UI更新测试
    testUIUpdates() {
        console.log('\n🧪 测试 11: UI更新');
        const game = new Game();
        const ui = new GameUI(game);

        this.assertNotNull(ui, 'UI实例应成功创建');

        // 测试UI更新
        ui.updateGameStatus('测试状态');
        ui.updateKnifeCounts(1, 2, 3);
        ui.updateButtonStates();

        // UI应成功更新而不抛出错误
        this.assertTrue(true, 'UI更新操作应成功执行');
    }

    // 测试用例 12: 边界条件测试
    testBoundaryConditions() {
        console.log('\n🧪 测试 12: 边界条件');
        const game = new Game();

        // 测试地图边界
        game.player.x = 0;
        game.player.y = 0;
        game.player.moveLeft(); // 尝试向左移动超出边界
        this.assertEquals(game.player.x, 0, '玩家不应移动到负坐标');

        game.player.y = game.config.mapSize.height - 1;
        game.player.moveDown(); // 尝试向下移动超出边界
        this.assertEquals(game.player.y, game.config.mapSize.height - 1, '玩家不应移动超出地图高度');
    }

    // 测试用例 13: 游戏循环测试
    testGameLoop() {
        console.log('\n🧪 测试 13: 游戏循环');
        const game = new Game();

        // 测试游戏启动
        game.start();
        this.assertTrue(game.isRunning, '游戏启动后应处于运行状态');

        // 测试游戏暂停
        game.pause();
        this.assertFalse(game.isRunning, '游戏暂停后应处于非运行状态');

        // 测试游戏恢复
        game.resume();
        this.assertTrue(game.isRunning, '游戏恢复后应重新处于运行状态');
    }

    // 运行所有测试
    runAllTests() {
        console.log('🚀 开始运行转刀刀游戏测试套件 (13个测试用例)\n');

        this.testGameInitialization();
        this.testPlayerMovement();
        this.testMapGeneration();
        this.testNPCSpawnAndMovement();
        this.testKnifeSpawnAndCollection();
        this.testCollisionDetection();
        this.testGameStateManagement();
        this.testPerformanceOptimization();
        this.testDynamicDifficulty();
        this.testKnifeProbabilityDistribution();
        this.testUIUpdates();
        this.testBoundaryConditions();
        this.testGameLoop();

        console.log(`\n📊 测试结果总结:`);
        console.log(`✅ 通过: ${this.passed}`);
        console.log(`❌ 失败: ${this.failed}`);
        console.log(`📋 总计: ${this.passed + this.failed}`);

        if (this.failed === 0) {
            console.log('🎉 所有测试通过！游戏功能正常。');
        } else {
            console.log('⚠️  存在测试失败，请检查相关功能。');
        }

        return this.failed === 0;
    }
}

// 导出测试套件供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameTestSuite;
}