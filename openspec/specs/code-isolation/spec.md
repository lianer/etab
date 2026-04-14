## ADDED Requirements

### Requirement: 隔离执行环境
自定义卡片代码SHALL在隔离环境中执行，防止访问主应用程序的DOM、JavaScript和CSS。

#### Scenario: 卡片隔离
- **WHEN** 自定义卡片代码尝试访问主页面上的`document.querySelector`
- **THEN** 操作失败或返回空结果

### Requirement: 基于iframe的沙箱
系统SHALL使用具有适当`sandbox`属性的iframe来隔离自定义卡片代码。

#### Scenario: iframe沙箱属性
- **WHEN** 自定义卡片被渲染
- **THEN** 它在iframe中运行，具有`sandbox="allow-scripts allow-same-origin"`属性，且没有`allow-top-navigation`

### Requirement: 安全通信通道
系统SHALL使用`postMessage`在隔离的卡片和主机应用程序之间提供安全通信通道。

#### Scenario: 卡片-主机通信
- **WHEN** 卡片需要向主机发送数据
- **THEN** 它使用具有适当来源验证的`postMessage` API

### Requirement: CSS隔离
卡片CSSSHALL限定在卡片的iframe内，不影响其他卡片或主机应用程序。

#### Scenario: CSS作用域限定
- **WHEN** 卡片定义CSS样式
- **THEN** 这些样式仅适用于卡片的iframe内部

### Requirement: JavaScript安全
系统SHALL防止恶意卡片代码执行危险操作（XSS、网络钓鱼、加密货币挖矿）。

#### Scenario: 恶意代码预防
- **WHEN** 卡片包含`eval("alert('xss')")`
- **THEN** 代码在沙箱内执行，无法影响主机页面

### Requirement: 资源限制
系统SHALL对卡片执行实施资源限制（内存、CPU、网络）。

#### Scenario: 资源约束
- **WHEN** 卡片代码进入无限循环
- **THEN** 系统检测并在超时后终止脚本

### Requirement: 卡片API
系统SHALL提供受控的API，供卡片与仪表板交互（获取/设置数据、事件）。

#### Scenario: 卡片使用API
- **WHEN** 卡片调用`dashboardAPI.setData(key, value)`
- **THEN** 数据被存储，并且卡片在未来的会话中可以访问
