// 转刀刀游戏主入口文件

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log('转刀刀游戏开始初始化...');

    // 等待所有脚本加载完成
    setTimeout(() => {
        try {
            // 检查关键类是否已加载
            if (typeof Game === 'undefined') {
                console.error('Game class not found');
                return;
            }
            if (typeof GameUI === 'undefined') {
                console.error('GameUI class not found');
                return;
            }

            // 初始化游戏实例
            const game = new Game();
            const ui = new GameUI(game);

            // 绑定UI事件
            const startBtn = document.getElementById('start-btn');
            const restartBtn = document.getElementById('restart-btn');
            const pauseBtn = document.getElementById('pause-btn');

            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    console.log('开始游戏按钮被点击');
                    game.start();
                    startBtn.disabled = true;
                    if (restartBtn) restartBtn.disabled = false;
                    if (pauseBtn) pauseBtn.disabled = false;
                });
            }

            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    console.log('重新开始按钮被点击');
                    game.stop();
                    game.resetGame();
                    game.start();
                    if (ui) ui.reset();
                });
            }

            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => {
                    console.log('暂停按钮被点击');
                    if (game.isRunning) {
                        game.stop();
                        pauseBtn.textContent = '继续';
                    } else {
                        game.start();
                        pauseBtn.textContent = '暂停';
                    }
                });
            }

            // 将游戏实例保存到全局变量
            window.knifeGame = game;
            window.gameUI = ui;

            console.log('转刀刀游戏初始化完成！');

        } catch (error) {
            console.error('游戏初始化失败:', error);

            // 显示错误信息给用户
            const statusElem = document.getElementById('game-status');
            if (statusElem) {
                statusElem.textContent = '游戏初始化失败，请刷新页面重试';
                statusElem.style.color = 'red';
            }
        }
    }, 100); // 延迟100ms确保所有脚本已加载
});