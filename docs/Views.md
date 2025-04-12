# 视图系统

Sample Plugin Extended 插件实现了多种自定义视图，展示了如何在 Obsidian 中创建和管理自定义内容视图。本文档详细介绍了这些视图的实现和用途。

## 视图类型

插件实现了两种主要类型的视图：

### 基础视图

基础视图是使用 Obsidian 原生 API 实现的简单视图，不依赖外部框架。

**示例：**
- **视图类型**：`SamplePluginExtended-SampleView`
- **显示内容**：简单的标题 "Sample view"
- **实现方式**：继承 Obsidian 的 `ItemView` 类

```typescript
export class SampleView extends ItemView {
  public static readonly VIEW_TYPE = 'SamplePluginExtended-SampleView';

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  public override getDisplayText(): string {
    return 'Sample view';
  }

  public override getIcon(): string {
    return 'dice';
  }

  public override getViewType(): string {
    return SampleView.VIEW_TYPE;
  }

  public override async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h4', { text: 'Sample view' });
  }
}
```

### React 视图

React 视图使用 React 框架实现，允许使用 React 组件和功能来创建更复杂的交互式视图。

**示例：**
- **视图类型**：`sample-plugin-extended-SampleReactView`
- **功能**：展示了如何在 Obsidian 中集成 React 组件
- **组件特性**：
  - 计数器功能（可增加数字）
  - 显示当前 vault 名称
  - 使用 React Hooks 和上下文
- **实现方式**：继承 Obsidian 的 `ItemView` 类，并在其中渲染 React 组件

```typescript
export class SampleReactView extends ItemView {
  public static readonly VIEW_TYPE = 'sample-plugin-extended-SampleReactView';
  private readonly reactComponent: ReactComponent;

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.reactComponent = new ReactComponent(this.containerEl.children[1]);
  }

  public override getDisplayText(): string {
    return 'Sample React view';
  }

  public override getIcon(): string {
    return 'dice';
  }

  public override getViewType(): string {
    return SampleReactView.VIEW_TYPE;
  }

  public override async onOpen(): Promise<void> {
    this.reactComponent.render();
  }

  public override async onClose(): Promise<void> {
    this.reactComponent.unmount();
  }
}
```

React 组件实现：

```tsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function App({ vaultName }: { vaultName: string }): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h4>Sample React View</h4>
      <p>Current vault: {vaultName}</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export class ReactComponent {
  private readonly container: Element;
  private root: Root | null = null;

  public constructor(container: Element) {
    this.container = container;
  }

  public render(): void {
    this.root = createRoot(this.container);
    this.root.render(
      <App vaultName={app.vault.getName()} />
    );
  }

  public unmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
```

## 视图注册

视图在插件的 `onloadImpl` 方法中注册，这是插件加载时执行的方法。

```typescript
protected override async onloadImpl(): Promise<void> {
  await super.onloadImpl();
  
  // 注册视图
  this.registerView(
    SampleView.VIEW_TYPE,
    (leaf) => new SampleView(leaf)
  );
  
  this.registerView(
    SampleReactView.VIEW_TYPE,
    (leaf) => new SampleReactView(leaf)
  );
  
  // 其他初始化代码...
}
```

## 视图打开

视图可以通过以下方式打开：

```typescript
protected override async onLayoutReady(): Promise<void> {
  await super.onLayoutReady();
  
  // 打开视图
  await this.openView(SampleView.VIEW_TYPE);
  await this.openView(SampleReactView.VIEW_TYPE);
}

private async openView(viewType: string): Promise<void> {
  const { workspace } = this.app;
  
  // 检查视图是否已经打开
  const existingView = workspace.getLeavesOfType(viewType)[0];
  if (existingView) {
    // 如果已经打开，激活它
    workspace.revealLeaf(existingView);
    return;
  }
  
  // 如果没有打开，创建新的视图
  await workspace.getRightLeaf(false).setViewState({
    type: viewType,
    active: true
  });
}
```

## 视图生命周期

视图有以下生命周期方法：

1. **构造函数**：初始化视图
2. **onOpen**：视图打开时调用，用于设置视图内容
3. **onClose**：视图关闭时调用，用于清理资源
4. **onResize**：视图大小改变时调用
5. **onUnload**：插件卸载时调用，用于最终清理

## 最佳实践

在实现视图时，建议遵循以下最佳实践：

1. **视图类型唯一性**：确保视图类型在整个 Obsidian 环境中是唯一的，通常使用插件 ID 作为前缀
2. **资源管理**：在 `onClose` 和 `onUnload` 方法中正确清理资源
3. **响应式设计**：确保视图在不同大小的窗口中都能正常显示
4. **主题兼容性**：确保视图在明暗主题下都能正常显示
5. **性能考虑**：避免在视图中执行耗时操作，考虑使用异步加载

## 相关资源

- [Obsidian API 文档 - 视图](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [React 文档](https://reactjs.org/docs/getting-started.html)
- [返回主文档](Introduction.md)
