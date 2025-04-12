# 命令系统

Sample Plugin Extended 插件提供了多种类型的命令，展示了 Obsidian 命令 API 的不同用法。本文档详细介绍了这些命令的实现和用途。

## 命令类型

插件实现了三种主要类型的命令：

### 普通命令

普通命令是最基本的命令类型，执行时会触发一个简单的操作。

**示例：**
- **命令名称**：Sample command
- **命令 ID**：`sample-command`
- **功能**：执行时显示一个通知
- **实现方式**：使用 `addCommand` 方法，提供 `callback` 函数

```typescript
this.addCommand({
  callback: this.runSampleCommand.bind(this),
  id: 'sample-command',
  name: 'Sample command'
});

private runSampleCommand(): void {
  new Notice('Sample command');
}
```

### 编辑器命令

编辑器命令是在编辑器上下文中执行的命令，可以操作当前编辑器的内容。

**示例：**
- **命令名称**：Sample editor command
- **命令 ID**：`sample-editor-command`
- **功能**：在当前选择位置插入 "Sample Editor Command" 文本
- **实现方式**：使用 `addCommand` 方法，提供 `editorCallback` 函数

```typescript
this.addCommand({
  editorCallback: this.runSampleEditorCommand.bind(this),
  id: 'sample-editor-command',
  name: 'Sample editor command'
});

private runSampleEditorCommand(editor: Editor): void {
  editor.replaceSelection('Sample Editor Command');
}
```

### 条件命令

条件命令只在满足特定条件时才可用，通过检查函数确定命令是否应该显示和启用。

**示例：**
- **命令名称**：Sample command with check
- **命令 ID**：`sample-command-with-check`
- **功能**：只在打开 Markdown 视图时可用
- **实现方式**：使用 `addCommand` 方法，提供 `checkCallback` 函数

```typescript
this.addCommand({
  checkCallback: this.runSampleCommandWithCheck.bind(this),
  id: 'sample-command-with-check',
  name: 'Sample command with check'
});

private runSampleCommandWithCheck(checking: boolean): boolean {
  const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
  if (!markdownView) {
    return false;
  }

  if (!checking) {
    new Notice('Sample command with check');
  }

  return true;
}
```

## 命令注册

命令在插件的 `onloadImpl` 方法中注册，这是插件加载时执行的方法。

```typescript
protected override async onloadImpl(): Promise<void> {
  await super.onloadImpl();
  
  // 注册命令
  this.addCommand({
    callback: this.runSampleCommand.bind(this),
    id: 'sample-command',
    name: 'Sample command'
  });

  this.addCommand({
    editorCallback: this.runSampleEditorCommand.bind(this),
    id: 'sample-editor-command',
    name: 'Sample editor command'
  });

  this.addCommand({
    checkCallback: this.runSampleCommandWithCheck.bind(this),
    id: 'sample-command-with-check',
    name: 'Sample command with check'
  });
  
  // 其他初始化代码...
}
```

## 命令执行

命令可以通过以下方式执行：

1. **命令面板**：用户可以通过 Obsidian 的命令面板（Ctrl+P 或 Cmd+P）搜索并执行命令
2. **快捷键**：用户可以在 Obsidian 设置中为命令分配快捷键
3. **编程方式**：插件可以通过代码调用命令

## 最佳实践

在实现命令时，建议遵循以下最佳实践：

1. **命令 ID 唯一性**：确保命令 ID 在整个 Obsidian 环境中是唯一的，通常使用插件 ID 作为前缀
2. **命令名称清晰**：命令名称应该清晰描述命令的功能
3. **适当的命令类型**：根据命令的用途选择合适的命令类型（普通、编辑器或条件）
4. **错误处理**：在命令执行过程中添加适当的错误处理
5. **性能考虑**：命令应该快速执行，避免长时间运行的操作阻塞用户界面

## 相关资源

- [Obsidian API 文档 - 命令](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [返回主文档](Introduction.md)
