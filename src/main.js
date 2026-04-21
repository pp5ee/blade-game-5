/**
 * 转刀刀游戏 - 主入口文件
 * 负责游戏初始化和启动
 */

import { Game } from './game/Game.js';

// 游戏实例
let game = null;

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log('转刀刀游戏正在初始化...');

    try {
        // 创建游戏实例
        game = new Game('game-canvas');

        // 显示初始化完成消息
        console.log('游戏初始化完成！');
        console.log('游戏控制：');
        console.log('- 移动: WASD 或 方向键');
        console.log('- 暂停/继续: P 键');
        console.log('- 重新开始: R 键');
        console.log('- 调试模式: Ctrl + D');

        // 添加全局错误处理
        window.addEventListener('error', (event) => {
            console.error('游戏运行时错误:', event.error);
            alert('游戏出现错误，请刷新页面重试。错误信息：' + event.error.message);
        });

        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            if (game) {
                game.destroy();
            }
        });

    } catch (error) {
        console.error('游戏初始化失败:', error);
        alert('游戏初始化失败，请检查浏览器控制台获取详细信息。');
    }
});

// 导出游戏实例供调试使用
window.game = game;