## ADDED Requirements

### Requirement: 鼠标拖拽重新定位
用户SHALL能够通过卡片头部拖拽卡片，在网格内重新定位。

#### Scenario: 拖拽卡片到新位置
- **WHEN** 用户点击并拖拽卡片头部
- **THEN** 卡片随鼠标光标移动，释放时对齐到网格

### Requirement: 通过拖拽手柄调整卡片大小
用户SHALL能够通过拖拽卡片角落/边缘的调整大小手柄来调整卡片大小。

#### Scenario: 调整卡片尺寸
- **WHEN** 用户拖拽调整大小手柄
- **THEN** 卡片在拖拽方向上调整大小，并对齐到网格增量

### Requirement: 平滑拖拽动画
拖拽和调整大小操作SHALL使用平滑动画，持续时间不超过0.3秒。

#### Scenario: 拖拽期间的动画
- **WHEN** 用户释放被拖拽的卡片
- **THEN** 卡片以≤0.3秒的过渡动画移动到最终位置

### Requirement: 拖拽期间的视觉反馈
系统SHALL在拖拽操作期间提供视觉反馈（透明度变化、高程）。

#### Scenario: 拖拽反馈可见
- **WHEN** 用户拖拽卡片
- **THEN** 卡片显示视觉反馈（略微增加的透明度或阴影）

### Requirement: 取消拖拽操作
用户SHALL能够通过按Escape键取消拖拽/调整大小操作。

#### Scenario: 使用Escape取消
- **WHEN** 用户在拖拽操作期间按Escape键
- **THEN** 卡片返回到原始位置/大小

### Requirement: 拖拽期间的网格对齐
在拖拽操作期间，卡片SHALL显示视觉引导线，指示对齐位置。

#### Scenario: 对齐引导线显示
- **WHEN** 用户将卡片拖拽到网格线附近
- **THEN** 出现视觉引导线，显示潜在的对齐位置