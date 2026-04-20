# 转刀刀游戏 (Knife Throw Game)

一个基于HTML5 Canvas的2D动作游戏，玩家控制角色在地图上收集不同颜色的刀，并与NPC进行战斗。

## 游戏特色

- 🎮 **简单易上手的操作** - 方向键移动，空格键收集刀
- 🎯 **多样化的刀系统** - 红、黄、蓝三种颜色的刀，每种有不同的攻击力
- 🤖 **智能NPC系统** - NPC会在地图上巡逻并与玩家互动
- 🗺️ **随机生成地图** - 每次游戏都有不同的地图体验
- ⚡ **性能优化** - 动态调整游戏性能，确保流畅体验
- 🎨 **精美的视觉效果** - 使用Canvas进行流畅的2D渲染

## 游戏规则

### 目标
- 收集所有颜色的刀（红、黄、蓝）
- 避免被NPC击败
- 在有限的地图空间内生存

### 刀系统
- **红色刀**：攻击力最高（4倍基础攻击力）
- **黄色刀**：中等攻击力（2倍基础攻击力）  
- **蓝色刀**：基础攻击力（1倍）

### NPC行为
- NPC会在地图上随机巡逻
- 当玩家靠近时，NPC会主动攻击
- 每个NPC都有不同数量的刀和攻击力

## 快速开始

### 安装依赖
```bash
npm install
```

### 运行游戏
```bash
npm start
```

### 运行测试
```bash
npm test
```

### 构建项目
```bash
npm run build
```

## 项目结构

```
src/
├── entities/          # 游戏实体
│   ├── Player.js     # 玩家类
│   └── NPC.js        # NPC类
├── game/             # 游戏核心
│   └── Game.js       # 游戏主类
├── map/              # 地图系统
│   └── MapGenerator.js # 地图生成器
├── combat/           # 战斗系统
│   └── CombatSystem.js # 战斗逻辑
├── performance/      # 性能优化
│   └── OptimizationManager.js # 性能管理器
└── ui/               # 用户界面
    └── UIManager.js  # UI管理器

test/                 # 测试文件
├── Game.test.js      # 游戏测试
├── MapGenerator.test.js # 地图生成测试
└── jest.config.js    # Jest配置
```

## 核心类说明

### Game类
游戏主控制器，负责：
- 游戏循环管理
- 实体生成和更新
- 碰撞检测
- 游戏状态管理

### Player类
玩家角色，包含：
- 位置和移动逻辑
- 刀收集系统
- 生命值和攻击力计算

### NPC类
非玩家角色，包含：
- 巡逻行为
- 攻击逻辑
- 刀掉落系统

### MapGenerator类
地图生成器，提供：
- 随机地图生成
- 障碍物放置
- 可通行区域验证

### CombatSystem类
战斗系统，处理：
- 攻击力计算
- 战斗结果判定
- 伤害计算

## 开发指南

### 添加新功能
1. 在对应的模块目录下创建新文件
2. 实现功能逻辑
3. 编写单元测试
4. 更新文档

### 性能优化
游戏包含自动性能优化功能：
- 动态NPC数量调整
- 脏矩形渲染优化
- 空间分割碰撞检测
- 对象池技术

### 测试
项目使用Jest进行测试：
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式运行测试
npm run test:watch
```

## 配置选项

游戏支持多种配置选项，可以在`Game.js`中修改：

```javascript
// 游戏配置示例
config: {
    mapSize: { width: 20, height: 15 },    // 地图大小
    cellSize: 40,                          // 网格大小
    maxNPCs: 5,                           // 最大NPC数量
    maxKnives: 15,                        // 最大刀数量
    npcSpawnRate: 0.3,                    // NPC生成率
    knifeSpawnRate: 0.6,                  // 刀生成率
    
    // 动态难度配置
    dynamicDifficulty: {
        enabled: true,                    // 启用动态难度
        minNPCs: 3,                       // 最小NPC数量
        maxNPCs: 8,                       // 最大NPC数量
        difficultyScale: 0.1              // 难度缩放系数
    }
}
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 更新日志

### v1.0.0 (2024-01-20)
- 初始版本发布
- 基础游戏功能实现
- 性能优化系统
- 完整的测试覆盖