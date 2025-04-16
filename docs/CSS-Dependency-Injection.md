# CSS 依赖注入系统文档

## 概述

CSS 依赖注入系统允许为 Obsidian 插件中的各个视图组件提供独立的样式，并支持在运行时动态切换这些样式。这种方法使得用户可以根据自己的喜好选择不同的主题样式，而无需重新加载插件或应用。

本文档详细介绍了该系统的实现原理、架构设计和使用方法。

## 功能特点

- **视图级别的样式隔离**：每个视图可以拥有自己独立的 CSS 样式
- **运行时样式切换**：无需重新加载即可切换不同的样式主题
- **多主题支持**：默认提供三种主题样式（默认、暗色、彩色）
- **可扩展性**：易于添加新的主题样式
- **无冲突**：不同视图的样式互不干扰

## 系统架构

CSS 依赖注入系统由以下几个主要部分组成：

1. **ViewStyleManager 类**：核心管理类，负责样式的加载、应用和切换
2. **样式文件**：包含各个主题的 SCSS 样式定义
3. **视图组件**：使用样式管理器加载和切换样式的视图组件
4. **主题切换器**：允许用户在不同主题之间切换的 UI 组件

### 核心类：ViewStyleManager

`ViewStyleManager` 是整个系统的核心，它管理样式元素的创建、更新和切换。该类使用单例模式实现，确保整个应用中只有一个样式管理器实例。

```typescript
export class ViewStyleManager {
  private styleElements: Map<string, HTMLStyleElement> = new Map();
  private activeStyles: Map<string, string> = new Map();
  private styleClasses: Map<string, string> = new Map();
  
  // 加载样式
  public loadStyle(viewType: string, cssContent: string, styleName = 'default'): void {
    // 实现样式加载逻辑
  }
  
  // 应用样式
  public applyStyle(viewType: string, styleName: string): boolean {
    // 实现样式应用逻辑
  }
  
  // 获取当前活动样式
  public getActiveStyle(viewType: string): string | undefined {
    // 返回当前活动样式
  }
  
  // 获取可用样式列表
  public getAvailableStyles(viewType: string): string[] {
    // 返回可用样式列表
  }
  
  // 移除样式
  public removeStyle(viewType: string, styleName: string): void {
    // 实现样式移除逻辑
  }
  
  // 移除所有样式
  public removeAllStyles(viewType: string): void {
    // 实现所有样式移除逻辑
  }
  
  // 获取视图容器元素
  private getViewContainer(viewType: string): HTMLElement | null {
    // 实现视图容器查找逻辑
  }
}

// 单例实例
export const viewStyleManager = new ViewStyleManager();
```

## 实现原理

### 1. 样式加载机制

样式加载通过以下步骤实现：

1. 为每个主题创建一个 `<style>` 元素并添加到文档头部
2. 为每个样式分配一个唯一的类名，用于在视图容器上标识当前应用的样式
3. 初始时禁用除默认样式外的所有样式

```typescript
public loadStyle(viewType: string, cssContent: string, styleName = 'default'): void {
  const styleKey = `${viewType}-${styleName}`;
  const styleClass = `${viewType}-style-${styleName}`;
  
  // 存储样式类名
  this.styleClasses.set(styleKey, styleClass);
  
  // 创建样式元素
  if (!this.styleElements.has(styleKey)) {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-view-type', viewType);
    styleEl.setAttribute('data-style-name', styleName);
    document.head.appendChild(styleEl);
    this.styleElements.set(styleKey, styleEl);
  }
  
  // 更新样式内容
  const styleEl = this.styleElements.get(styleKey)!;
  
  if (cssContent) {
    styleEl.textContent = cssContent;
  } else {
    styleEl.textContent = `/* Style for ${viewType} - ${styleName} */`;
  }
  
  // 设置初始状态
  if (!this.activeStyles.has(viewType)) {
    this.activeStyles.set(viewType, styleName);
    styleEl.disabled = false;
  } else {
    styleEl.disabled = true;
  }
}
```

### 2. 样式切换机制

样式切换通过以下步骤实现：

1. 禁用当前活动的样式
2. 从视图容器中移除当前样式的类名
3. 启用新的样式
4. 向视图容器添加新样式的类名

```typescript
public applyStyle(viewType: string, styleName: string): boolean {
  const currentStyle = this.activeStyles.get(viewType);
  
  // 如果样式已经是活动的，不做任何操作
  if (currentStyle === styleName) {
    return true;
  }
  
  const newStyleKey = `${viewType}-${styleName}`;
  const newStyleEl = this.styleElements.get(newStyleKey);
  
  if (!newStyleEl) {
    new Notice(`Style "${styleName}" not found for view "${viewType}"`);
    return false;
  }
  
  // 获取视图容器
  const viewContainer = this.getViewContainer(viewType);
  
  // 禁用当前样式
  if (currentStyle) {
    const currentStyleKey = `${viewType}-${currentStyle}`;
    const currentStyleEl = this.styleElements.get(currentStyleKey);
    if (currentStyleEl) {
      currentStyleEl.disabled = true;
    }
    
    // 移除当前样式类
    if (viewContainer) {
      const currentStyleClass = this.styleClasses.get(currentStyleKey);
      if (currentStyleClass) {
        viewContainer.classList.remove(currentStyleClass);
      }
    }
  }
  
  // 启用新样式
  newStyleEl.disabled = false;
  this.activeStyles.set(viewType, styleName);
  
  // 添加新样式类
  if (viewContainer) {
    const newStyleClass = this.styleClasses.get(newStyleKey);
    if (newStyleClass) {
      viewContainer.classList.add(newStyleClass);
    }
  }
  
  return true;
}
```

### 3. 视图容器查找

为了正确应用样式类，系统需要找到视图的容器元素：

```typescript
private getViewContainer(viewType: string): HTMLElement | null {
  // 首先尝试通过类名查找
  const container = document.querySelector(`.${viewType}`);
  if (container instanceof HTMLElement) {
    return container;
  }
  
  // 如果未找到，尝试通过数据属性查找
  const viewEl = document.querySelector(`[data-type="${viewType}"]`);
  if (viewEl instanceof HTMLElement) {
    // 容器通常是第一个带有 'view-content' 类的子元素
    const content = viewEl.querySelector('.view-content');
    if (content instanceof HTMLElement) {
      return content;
    }
    return viewEl;
  }
  
  return null;
}
```

## 样式文件组织

样式文件按主题分为三个部分：

1. **基础样式 (components.scss)**：包含所有组件的基本样式
2. **暗色主题 (components-dark.scss)**：暗色主题的特定样式
3. **彩色主题 (components-colorful.scss)**：彩色主题的特定样式

每个样式文件使用特定的选择器来确保样式只应用于正确的主题：

```scss
/* 基础样式 - 适用于所有主题 */
.SamplePluginExtended-SampleView .sample-view-container {
  /* 基础样式定义 */
}

/* 暗色主题特定样式 */
.SamplePluginExtended-SampleView.SamplePluginExtended-SampleView-style-dark .sample-view-container {
  /* 暗色主题样式定义 */
}

/* 彩色主题特定样式 */
.SamplePluginExtended-SampleView.SamplePluginExtended-SampleView-style-colorful .sample-view-container {
  /* 彩色主题样式定义 */
}
```

## 在视图中使用

要在视图中使用 CSS 依赖注入系统，需要执行以下步骤：

### 1. 初始化视图容器

确保视图容器具有正确的类名，以便样式管理器可以找到它：

```typescript
public override async onOpen(): Promise<void> {
  // 清空内容元素
  this.contentEl.empty();
  
  // 添加视图类型作为类名，用于 CSS 选择器
  this.contentEl.classList.add(SAMPLE_VIEW_TYPE);
  
  // 创建容器
  this.container = this.contentEl.createDiv({ cls: 'sample-view-container' });
  
  // 创建 UI 组件...
  
  // 加载样式
  this.loadStyles();
  
  await Promise.resolve();
}
```

### 2. 加载样式

加载视图所需的所有样式：

```typescript
private loadStyles(): void {
  try {
    // 加载基础样式
    const baseStyleContent = this.getStyleContent('components.scss');
    viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, baseStyleContent, 'default');
    
    // 加载暗色主题样式
    const darkStyleContent = this.getStyleContent('components-dark.scss');
    viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, darkStyleContent, 'dark');
    
    // 加载彩色主题样式
    const colorfulStyleContent = this.getStyleContent('components-colorful.scss');
    viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, colorfulStyleContent, 'colorful');
    
    // 应用默认样式
    viewStyleManager.applyStyle(SAMPLE_VIEW_TYPE, 'default');
  } catch (error) {
    console.error('Failed to load styles:', error);
  }
}

private getStyleContent(fileName: string): string {
  // 返回样式内容或占位符
  return `.${SAMPLE_VIEW_TYPE} { /* ${fileName} styles */ }`;
}
```

### 3. 创建主题切换器

创建允许用户切换主题的 UI 组件：

```typescript
private createThemeSwitcher(): void {
  const themeSwitcher = this.container.createDiv({ cls: 'theme-switcher' });
  themeSwitcher.createDiv({ cls: 'theme-title', text: 'Switch Component Theme' });
  
  const themeButtons = themeSwitcher.createDiv({ cls: 'theme-buttons' });
  
  // 获取可用主题
  const themes = ['default', 'dark', 'colorful'];
  
  // 获取当前活动主题
  const activeTheme = viewStyleManager.getActiveStyle(SAMPLE_VIEW_TYPE) || 'default';
  
  // 为每个主题创建按钮
  themes.forEach(theme => {
    const button = themeButtons.createEl('button', {
      text: theme.charAt(0).toUpperCase() + theme.slice(1),
      cls: activeTheme === theme ? 'active' : ''
    });
    
    button.addEventListener('click', () => {
      // 应用主题
      const success = viewStyleManager.applyStyle(SAMPLE_VIEW_TYPE, theme);
      
      if (success) {
        // 更新活动按钮
        themeButtons.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        
        new Notice(`Applied ${theme} theme to components`);
      }
    });
  });
}
```

## 添加新主题

要添加新的主题，需要执行以下步骤：

1. 创建新的主题样式文件（例如 `components-new-theme.scss`）
2. 使用正确的选择器定义样式：
   ```scss
   .SamplePluginExtended-SampleView.SamplePluginExtended-SampleView-style-new-theme .sample-view-container {
     /* 新主题样式定义 */
   }
   ```
3. 在 `main.scss` 中导入新主题样式：
   ```scss
   @import "components-new-theme.scss";
   ```
4. 在视图的 `loadStyles` 方法中加载新主题：
   ```typescript
   const newThemeContent = this.getStyleContent('components-new-theme.scss');
   viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, newThemeContent, 'new-theme');
   ```
5. 在主题切换器中添加新主题：
   ```typescript
   const themes = ['default', 'dark', 'colorful', 'new-theme'];
   ```

## 最佳实践

1. **样式隔离**：确保每个主题的样式都使用正确的选择器，避免样式冲突
2. **性能考虑**：避免加载过多的样式，可能会影响性能
3. **用户体验**：提供清晰的主题切换界面，并在切换时提供视觉反馈
4. **默认样式**：始终提供一个默认样式，确保在其他样式加载失败时仍能正常显示
5. **错误处理**：妥善处理样式加载和应用过程中可能出现的错误

## 示例

本系统已在 SampleView 中实现，提供了三种主题样式：

1. **默认主题**：简洁、专业的设计
2. **暗色主题**：深色背景，蓝紫色强调色
3. **彩色主题**：渐变色、阴影和动画效果

用户可以通过主题切换器在这些主题之间切换，体验不同的视觉效果。

## 总结

CSS 依赖注入系统提供了一种灵活、可扩展的方式来管理 Obsidian 插件中视图组件的样式。通过这个系统，开发者可以为用户提供多种主题选择，增强用户体验，同时保持代码的组织性和可维护性。

该系统的核心是 `ViewStyleManager` 类，它负责样式的加载、应用和切换。通过使用 CSS 类和选择器，系统能够在不同主题之间无缝切换，而无需重新加载插件或应用。

---

## 中英文术语对照表

| 中文 | English |
|------|---------|
| CSS 依赖注入 | CSS Dependency Injection |
| 视图级别样式隔离 | View-level Style Isolation |
| 运行时样式切换 | Runtime Style Switching |
| 样式管理器 | Style Manager |
| 主题切换器 | Theme Switcher |
| 样式加载机制 | Style Loading Mechanism |
| 样式切换机制 | Style Switching Mechanism |
| 视图容器 | View Container |
| 基础样式 | Base Styles |
| 暗色主题 | Dark Theme |
| 彩色主题 | Colorful Theme |
