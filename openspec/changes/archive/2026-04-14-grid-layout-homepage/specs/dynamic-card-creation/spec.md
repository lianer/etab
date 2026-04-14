## ADDED Requirements

### Requirement: 添加卡片按钮
仪表板SHALL具有"Add Card"按钮，用于打开卡片创建界面。

#### Scenario: 添加卡片按钮可见
- **WHEN** 仪表板加载
- **THEN** "Add Card"按钮可见

### Requirement: 卡片创建对话框
点击"Add Card"SHALL打开对话框，提供创建预置卡片或基于代码的自定义卡片的选项。

#### Scenario: 创建对话框打开
- **WHEN** 用户点击"Add Card"按钮
- **THEN** 打开包含卡片类型选择的对话框

### Requirement: 预置卡片选择
创建对话框SHALL允许从预置卡片（日历、时钟、待办事项）中选择。

#### Scenario: 选择预置卡片
- **WHEN** 用户选择预置卡片类型
- **THEN** 卡片以默认位置添加到仪表板

### Requirement: 自定义卡片创建
创建对话框SHALL提供代码编辑器，用于使用JavaScript、HTML和CSS创建自定义卡片。

#### Scenario: 打开自定义卡片编辑器
- **WHEN** 用户选择"Custom Card"选项
- **THEN** 打开包含JavaScript、HTML和CSS标签页的代码编辑器

### Requirement: 预览自定义卡片
系统SHALL提供自定义卡片代码的实时预览。

#### Scenario: 实时预览更新
- **WHEN** 用户在自定义卡片编辑器中编辑代码
- **THEN** 预览窗格更新以显示渲染的卡片

### Requirement: 保存自定义卡片
用户SHALL能够将自定义卡片保存到仪表板。

#### Scenario: 保存自定义卡片
- **WHEN** 用户在自定义卡片编辑器中点击"Save"
- **THEN** 卡片在隔离环境中添加到仪表板

### Requirement: 卡片配置
对于预置卡片，系统SHALL提供配置选项（例如，时钟格式、日历视图）。

#### Scenario: 配置卡片
- **WHEN** 用户添加预置卡片
- **THEN** 显示特定于该卡片的配置选项
