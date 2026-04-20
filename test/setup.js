// 测试环境设置
import { JSDOM } from 'jsdom';

// 设置DOM环境
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="game-canvas"></canvas></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// 模拟requestAnimationFrame
global.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
};

// 模拟performance
global.performance = {
    now: () => Date.now()
};

// 模拟console.log以避免测试输出干扰
console.log = () => {};
console.error = () => {};