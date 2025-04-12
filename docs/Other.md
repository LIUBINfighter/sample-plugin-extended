# 其他功能

Sample Plugin Extended 插件还包含其他多种功能，展示了 Obsidian 插件开发的更多可能性。本文档详细介绍了这些其他功能的实现和用途。

## 功能类型

插件实现了三种主要类型的其他功能：

### 协议处理

协议处理允许插件响应特定的 URI 协议，使得可以通过链接打开插件功能。

**示例：**
- **协议**：`obsidian://sample-action`
- **功能**：处理 `obsidian://sample-action` 协议，显示协议参数信息
- **实现方式**：使用 `registerObsidianProtocolHandler` 方法

```typescript
this.registerObsidianProtocolHandler('sample-action', this.handleSampleObsidianProtocolHandler.bind(this));

private handleSampleObsidianProtocolHandler(params: ObsidianProtocolData): void {
  const paramString = Object.entries(params)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
    
  new Notice(`Protocol parameters:\n${paramString}`);
}
```

使用示例：

```
obsidian://sample-action?param1=value1&param2=value2
```

当用户点击上述链接时，插件将显示一个通知，列出所有参数。

### 文件扩展关联

文件扩展关联允许插件处理特定扩展名的文件。

**示例：**
- **扩展名**：`sample-extension-1` 和 `sample-extension-2`
- **功能**：将这些扩展名关联到示例视图
- **实现方式**：使用 `registerExtensions` 方法

```typescript
this.registerExtensions(['sample-extension-1', 'sample-extension-2'], SAMPLE_VIEW_TYPE);
```

当用户打开具有这些扩展名的文件时，Obsidian 将使用关联的视图打开它们。

### 悬停链接源

悬停链接源允许插件为特定类型的链接提供自定义悬停预览。

**示例：**
- **功能**：为示例视图注册了悬停链接源，自定义链接悬停行为
- **实现方式**：使用 `registerHoverLinkSource` 方法

```typescript
this.registerHoverLinkSource(SAMPLE_VIEW_TYPE, {
  defaultMod: true,
  display: this.manifest.name
});
```

当用户将鼠标悬停在指向示例视图的链接上时，将显示自定义的悬停预览。

## 功能注册

这些功能在插件的 `onloadImpl` 方法中注册，这是插件加载时执行的方法。

```typescript
protected override async onloadImpl(): Promise<void> {
  await super.onloadImpl();
  
  // 注册协议处理器
  this.registerObsidianProtocolHandler('sample-action', this.handleSampleObsidianProtocolHandler.bind(this));

  // 注册文件扩展关联
  this.registerExtensions(['sample-extension-1', 'sample-extension-2'], SAMPLE_VIEW_TYPE);

  // 注册悬停链接源
  this.registerHoverLinkSource(SAMPLE_VIEW_TYPE, {
    defaultMod: true,
    display: this.manifest.name
  });
  
  // 其他初始化代码...
}
```

## 高级用例

### 自定义 URI 协议处理

可以创建更复杂的 URI 协议处理器，执行各种操作。

```typescript
private handleAdvancedProtocolHandler(params: ObsidianProtocolData): void {
  const { action, target, options } = params;
  
  switch (action) {
    case 'open':
      // 打开特定文件或视图
      if (target) {
        const targetFile = this.app.vault.getAbstractFileByPath(target);
        if (targetFile instanceof TFile) {
          this.app.workspace.openLinkText(target, '', options === 'new-tab');
        }
      }
      break;
      
    case 'search':
      // 执行搜索
      if (target) {
        this.app.internalPlugins.getPluginById('global-search').instance.openGlobalSearch(target);
      }
      break;
      
    case 'command':
      // 执行命令
      if (target) {
        const command = this.app.commands.commands[target];
        if (command) {
          this.app.commands.executeCommandById(target);
        }
      }
      break;
      
    default:
      new Notice(`Unknown action: ${action}`);
  }
}
```

使用示例：

```
obsidian://sample-action?action=open&target=path/to/file.md&options=new-tab
obsidian://sample-action?action=search&target=query
obsidian://sample-action?action=command&target=command-id
```

### 自定义文件格式

可以实现对自定义文件格式的支持。

```typescript
export class CustomFileFormat {
  public static readonly EXTENSION = 'sample-format';
  
  public static parse(content: string): any {
    try {
      // 解析自定义格式
      const lines = content.split('\n');
      const result = {};
      
      for (const line of lines) {
        const [key, value] = line.split('=');
        if (key && value) {
          result[key.trim()] = value.trim();
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing custom format', error);
      return null;
    }
  }
  
  public static stringify(data: any): string {
    try {
      // 将数据转换为自定义格式
      return Object.entries(data)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    } catch (error) {
      console.error('Error stringifying custom format', error);
      return '';
    }
  }
}
```

## 最佳实践

在实现这些其他功能时，建议遵循以下最佳实践：

1. **协议安全性**：在处理 URI 协议时注意安全性，验证和清理参数
2. **文件扩展名唯一性**：确保自定义文件扩展名不与其他插件冲突
3. **错误处理**：添加适当的错误处理，提供用户友好的错误消息
4. **性能考虑**：确保功能高效运行，特别是处理大文件时
5. **用户体验**：提供清晰的反馈，让用户知道操作的结果

## 相关资源

- [Obsidian API 文档 - 协议](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [Obsidian API 文档 - 文件扩展](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [Obsidian URI 文档](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI)
- [返回主文档](Introduction.md)
