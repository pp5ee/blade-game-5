# Requirement

我想做一个转刀刀网页游戏，人物可以移动捡刀，然后捡到就变多，可以相互击杀，击杀后掉落对应数量的刀，这个刀也可以被捡起来，取决于刀刀数量也可以自由移动，避免交战，这个是单机页面游戏，其他的都是npc，刀分为3种红黄蓝，拼杀需要拼数量和颜色（不同等级的话有个计算公式扣除刀），红色最厉害，UI风格参考，注意需要人物不是一个圆点 @blade.jpeg(uploads/blade.jpeg)

**AI Understanding:**
我已经看到了您提供的参考图片。这是一个像素风格的UI设计，包含以下元素：
- 顶部有玩家信息显示（HP、MP、等级等）
- 中间是游戏主区域，有角色和武器
- 底部有技能栏和操作按钮
- 整体采用暗色系，有红色、黄色等鲜艳颜色点缀
基于您的描述和图片参考，我理解您想要开发一个**转刀刀网页游戏**，主要功能包括：
**核心玩法：**
- 玩家控制角色移动，在地图上收集刀
- 刀分为红、黄、蓝三种颜色，红色最厉害
- 可以与其他NPC角色战斗，击杀后掉落对方收集的刀
- 战斗机制基于刀的数量和颜色等级计算伤害
- 玩家可以选择战斗或躲避
**技术规格：**
- 单机网页游戏
- 其他角色都是NPC
- UI风格参考图片的像素风格
**需要确认的关键点：**
1. 游戏地图是固定场景还是随机生成？
2. NPC的行为逻辑（主动攻击还是被动防御）？
3. 具体的战斗计算公式（不同颜色刀的伤害加成）？
请确认这些细节，或者如果您觉得需求已经清晰，可以直接说"开始"或"继续"来生成实现计划。

随机生成，主动攻击，颜色刀 2倍伤害差距

**AI Understanding:**
基于您的补充说明，需求已经非常清晰：
**游戏规格确认：**
- 地图：随机生成
- NPC行为：主动攻击玩家
- 战斗系统：红/黄/蓝刀有2倍伤害差距（比如红刀伤害=黄刀×2=蓝刀×4）
**完整功能清单：**
1. 随机生成的地图场景
2. 玩家控制角色移动捡刀
3. 三种颜色刀（红黄蓝）按2倍伤害梯度
4. 主动攻击型NPC敌人
5. 战斗系统基于刀数量和颜色计算伤害
6. 击杀敌人掉落收集的刀
7. 像素风格UI（参考您提供的图片）
如果您确认以上需求准确，请说"开始"或"继续"，我将为您生成详细的实现计划。

---

## Implementation Notes

- For any unspecified details (combat formulas, game balance, UI layout, tech choices, etc.), make reasonable decisions yourself and document them in the plan. Do NOT ask the user for clarification — proceed with sensible defaults.
- If referenced image files exist in the workspace, treat them as visual style references.

## Standard Deliverables (mandatory for every project)

- **README.md** — must be included at the project root with: project title & description, prerequisites, installation steps, usage examples with code snippets, configuration options, and project structure overview.
- **Git commits** — use conventional commit prefix `feat:` for all commits.
