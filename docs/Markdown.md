# Markdown 处理

Sample Plugin Extended 插件提供了 Markdown 内容处理功能，展示了如何扩展和自定义 Obsidian 的 Markdown 渲染。本文档详细介绍了这些 Markdown 处理功能的实现和用途。

## Markdown 处理类型

插件实现了两种主要类型的 Markdown 处理：

### 代码块处理器

代码块处理器用于处理特定语言的代码块，可以自定义这些代码块的渲染方式。

**示例：**
- **语言标识符**：`sample-code-block-processor`
- **功能**：将代码块内容替换为自定义文本
- **实现方式**：使用 `registerMarkdownCodeBlockProcessor` 方法

```typescript
this.registerMarkdownCodeBlockProcessor('sample-code-block-processor', this.handleSampleCodeBlockProcessor.bind(this));

private handleSampleCodeBlockProcessor(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext): void {
  el.empty();
  el.createEl('div', { text: `Processed code block: ${source}` });
}
```

使用示例：

````markdown
```sample-code-block-processor
This is a sample code block.
It will be processed by the plugin.
```
````

渲染结果：

```
Processed code block: This is a sample code block.
It will be processed by the plugin.
```

### Markdown 后处理器

Markdown 后处理器用于处理 Markdown 渲染后的 HTML 内容，可以修改或增强已渲染的内容。

**示例：**
- **功能**：处理 Markdown 渲染后的 HTML 内容，修改特定类的元素内容
- **实现方式**：使用 `registerMarkdownPostProcessor` 方法

```typescript
this.registerMarkdownPostProcessor(this.handleSampleMarkdownPostProcessor.bind(this));

private handleSampleMarkdownPostProcessor(el: HTMLElement): void {
  // 查找所有的标题元素
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  // 为每个标题添加一个图标
  headings.forEach((heading) => {
    const icon = document.createElement('span');
    icon.innerHTML = '🔍 ';
    heading.prepend(icon);
  });
}
```

## Markdown 处理注册

Markdown 处理器在插件的 `onloadImpl` 方法中注册，这是插件加载时执行的方法。

```typescript
protected override async onloadImpl(): Promise<void> {
  await super.onloadImpl();
  
  // 注册代码块处理器
  this.registerMarkdownCodeBlockProcessor('sample-code-block-processor', this.handleSampleCodeBlockProcessor.bind(this));

  // 注册 Markdown 后处理器
  this.registerMarkdownPostProcessor(this.handleSampleMarkdownPostProcessor.bind(this));
  
  // 其他初始化代码...
}
```

## 高级用例

### 交互式代码块

可以创建交互式代码块，允许用户与渲染的内容交互。

```typescript
private handleInteractiveCodeBlockProcessor(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext): void {
  el.empty();
  
  // 解析代码块内容
  const data = JSON.parse(source);
  
  // 创建交互式元素
  const button = el.createEl('button', { text: data.buttonText || 'Click me' });
  const output = el.createEl('div', { cls: 'output' });
  
  // 添加事件监听器
  button.addEventListener('click', () => {
    output.textContent = `Button clicked at ${new Date().toLocaleTimeString()}`;
  });
}
```

### 自定义语法高亮

可以为自定义语言实现语法高亮。

```typescript
private handleCustomSyntaxHighlighting(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext): void {
  el.empty();
  
  // 创建预格式化文本元素
  const pre = el.createEl('pre');
  const code = pre.createEl('code');
  
  // 应用自定义语法高亮
  const tokens = this.tokenize(source);
  tokens.forEach(token => {
    const span = code.createEl('span', {
      cls: `token-${token.type}`,
      text: token.text
    });
    
    // 根据令牌类型设置样式
    if (token.type === 'keyword') {
      span.style.color = 'blue';
    } else if (token.type === 'string') {
      span.style.color = 'green';
    }
    // 其他类型...
  });
}

private tokenize(source: string): Array<{ type: string, text: string }> {
  // 实现自定义语言的词法分析
  // 这只是一个简化的示例
  const tokens = [];
  // ...
  return tokens;
}
```

## 最佳实践

在实现 Markdown 处理时，建议遵循以下最佳实践：

1. **性能考虑**：Markdown 处理器会在每次渲染 Markdown 时执行，确保它们高效运行
2. **安全性**：处理用户输入时注意安全性，避免 XSS 攻击
3. **可访问性**：确保生成的 HTML 内容符合可访问性标准
4. **主题兼容性**：确保生成的内容在不同主题下都能正常显示
5. **错误处理**：添加适当的错误处理，避免处理器错误影响整个文档的渲染

## 相关资源

- [Obsidian API 文档 - Markdown 处理](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [Markdown 指南](https://www.markdownguide.org/)
- [返回主文档](Introduction.md)
