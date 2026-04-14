## ADDED Requirements

### Requirement: 基于网格单元的卡片尺寸
卡片宽度和高度SHALL基于占用的网格单元计算：宽度 = (cellsX × 100px) + ((cellsX - 1) × 20px)，高度 = (cellsY × 100px) + ((cellsY - 1) × 20px)。

#### Scenario: 单单元格卡片尺寸
- **WHEN** 卡片占用1×1网格单元
- **THEN** 卡片以100px × 100px尺寸渲染

#### Scenario: 多单元格卡片尺寸
- **WHEN** 卡片占用2×3网格单元
- **THEN** 卡片以220px宽度（2×100 + 1×20）和340px高度（3×100 + 2×20）渲染

### Requirement: 卡片样式
卡片SHALL具有一致的样式：白色背景，16px圆角半径，微妙的阴影，以及可选的背景模糊效果。

#### Scenario: 卡片视觉外观
- **WHEN** 卡片被渲染
- **THEN** 它以白色背景、16px圆角和微妙的阴影显示

### Requirement: 卡片头部
每个卡片SHALL具有头部区域，显示小组件标题和拖拽手柄。

#### Scenario: 卡片头部显示
- **WHEN** 卡片被渲染
- **THEN** 顶部显示头部区域，包含小组件标题和拖拽手柄图标

### Requirement: 卡片调整大小手柄
卡片在编辑模式时SHALL在角落或边缘显示调整大小手柄。

#### Scenario: 调整大小手柄可见
- **WHEN** 仪表板处于编辑模式
- **THEN** 卡片角落出现调整大小手柄

### Requirement: 卡片内容区域
卡片SHALL具有内容区域，用于渲染特定小组件的UI。

#### Scenario: 小组件内容渲染
- **WHEN** 卡片包含小组件
- **THEN** 小组件UI在卡片头部下方的内容区域中渲染