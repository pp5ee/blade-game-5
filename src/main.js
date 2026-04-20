// 转刀刀游戏主入口文件
class KnifeGame {
    constructor() {
        this.game = null;
        this.ui = null;

        // 绑定UI事件
        this.bindEvents();

        console.log('转刀刀游戏初始化完成');
    }

    bindEvents() {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');

        startBtn.addEventListener('click', () => {
            this.startGame();
            startBtn.disabled = true;
            restartBtn.disabled = false;
        });

        restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        // 初始化游戏实例
        this.game = new Game();
        this.ui = new GameUI(this.game);

        // 开始游戏循环
        this.game.start();

        console.log('游戏开始！');
    }

    restartGame() {
        if (this.game) {
            this.game.stop();
        }

        this.startGame();

        console.log('游戏重新开始！');
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.knifeGame = new KnifeGame();
});