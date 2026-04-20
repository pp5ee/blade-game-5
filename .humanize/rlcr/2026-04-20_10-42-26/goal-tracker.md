# Goal Tracker

<!--
This file tracks the ultimate goal, acceptance criteria, and plan evolution.
It prevents goal drift by maintaining a persistent anchor across all rounds.

RULES:
- IMMUTABLE SECTION: Do not modify after initialization
- MUTABLE SECTION: Update each round, but document all changes
- Every task must be in one of: Active, Completed, or Deferred
- Deferred items require explicit justification
-->

## IMMUTABLE SECTION
<!-- Do not modify after initialization -->

### Ultimate Goal
实现一个单机网页游戏，玩家控制角色在随机生成的地图上收集不同颜色的刀（红/黄/蓝），与主动攻击的NPC进行战斗，战斗基于刀的数量和颜色等级计算伤害，击杀NPC后掉落对方收集的刀，玩家可以选择战斗或躲避。

## Acceptance Criteria

### Acceptance Criteria
<!-- Each criterion must be independently verifiable -->
<!-- Claude must extract or define these in Round 0 -->


Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: 游戏核心机制 - 角色移动和刀收集
  - Positive Tests (expected to PASS):
    - 玩家可以使用键盘方向键控制角色在地图上移动
    - 角色可以移动到刀的位置并自动收集
    - 收集后角色的刀数量相应增加
    - 不同颜色的刀分别计数
  - Negative Tests (expected to FAIL):
    - 角色无法移动到地图边界外
    - 角色不能同时收集多个刀（一次只能收集一个）
    - 空地图位置无法收集刀

- AC-2: 刀系统 - 颜色和伤害机制
  - Positive Tests (expected to PASS):
    - 红/黄/蓝三种刀分别计数显示
    - 红色刀伤害=黄色刀×2=蓝色刀×4
    - 战斗时根据刀颜色和数量计算总伤害
    - 颜色刀伤害梯度正确应用
  - Negative Tests (expected to FAIL):
    - 不存在的颜色刀无法被收集
    - 伤害计算不会出现负数或溢出
    - 空手状态无法造成伤害

---

## MUTABLE SECTION
<!-- Update each round with justification for changes -->

### Plan Version: 1 (Updated: Round 0)

#### Plan Evolution Log
<!-- Document any changes to the plan with justification -->
| Round | Change | Reason | Impact on AC |
|-------|--------|--------|--------------|
| 0 | Initial plan | - | - |

#### Active Tasks
<!-- Map each task to its target Acceptance Criterion and routing tag -->
| Task | Target AC | Status | Tag | Owner | Notes |
|------|-----------|--------|-----|-------|-------|
| task1: 创建项目基础结构和HTML文件 | AC-5 | pending | coding | claude | - |
| task2: 实现Canvas渲染系统和游戏循环 | AC-1, AC-5 | pending | coding | claude | - |
| task3: 实现角色移动和键盘控制 | AC-1 | pending | coding | claude | - |
| task4: 实现刀实体和收集系统 | AC-1, AC-2 | pending | coding | claude | - |
| task5: 实现NPC基础行为和移动 | AC-3 | pending | coding | claude | - |
| task6: 实现战斗伤害计算系统 | AC-2, AC-3 | pending | coding | claude | - |
| task7: 实现随机地图生成算法 | AC-4 | pending | coding | claude | - |
| task8: 实现像素风格UI界面 | AC-5 | pending | coding | claude | - |
| task9: 实现游戏状态管理和重新开始 | AC-5 | pending | coding | claude | - |
| task10: 游戏平衡分析和优化建议 | All | pending | analyze | codex | - |
| task11: 性能优化和错误修复 | All | pending | coding | claude | - |
| task12: 创建项目文档和README | Standard | pending | coding | claude | - |

### Completed and Verified
<!-- Only move tasks here after Codex verification -->
| AC | Task | Completed Round | Verified Round | Evidence |
|----|------|-----------------|----------------|----------|

### Explicitly Deferred
<!-- Items here require strong justification -->
| Task | Original AC | Deferred Since | Justification | When to Reconsider |
|------|-------------|----------------|---------------|-------------------|

### Open Issues
<!-- Issues discovered during implementation -->
| Issue | Discovered Round | Blocking AC | Resolution Path |
|-------|-----------------|-------------|-----------------|
