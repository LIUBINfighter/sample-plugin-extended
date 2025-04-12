# 编辑器扩展

Sample Plugin Extended 插件扩展了 Obsidian 的编辑器功能，展示了如何增强和自定义编辑体验。本文档详细介绍了这些编辑器扩展的实现和用途。

## 编辑器扩展类型

插件实现了三种主要类型的编辑器扩展：

### 编辑器状态字段

编辑器状态字段是 CodeMirror 6 中的一个概念，用于存储和管理编辑器的状态数据。

**示例：**
- **功能**：实现了自定义编辑器状态，提供文档内容的装饰功能
- **实现方式**：创建实现 `StateFieldSpec` 接口的类

```typescript
class SampleStateField implements StateFieldSpec<DecorationSet> {
  public create(): DecorationSet {
    return Decoration.none;
  }

  public provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  }

  public update(_oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const OFFSET = 2;
    const builder = new RangeSetBuilder<Decoration>();

    syntaxTree(transaction.state).iterate({
      enter(node) {
        if (node.type.name.startsWith('list')) {
          const listCharFrom = node.from - OFFSET;

          builder.add(
            listCharFrom,
            listCharFrom + 1,
            Decoration.replace({
              widget: new SampleWidget()
            })
          );
        }
      }
    });

    return builder.finish();
  }
}

export const sampleStateField = StateField.define(new SampleStateField());
```

### 编辑器视图插件

编辑器视图插件是 CodeMirror 6 中的另一个概念，用于向编辑器添加视觉效果和交互功能。

**示例：**
- **功能**：为编辑器添加了自定义视图插件，在列表项前添加自定义小部件
- **实现方式**：创建实现 `PluginValue` 接口的类

```typescript
class SampleViewPlugin implements PluginValue {
  public decorations: DecorationSet;

  public constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  public buildDecorations(view: EditorView): DecorationSet {
    const OFFSET = 2;
    const builder = new RangeSetBuilder<Decoration>();

    for (const { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        enter(node) {
          if (node.type.name.startsWith('list')) {
            const listCharFrom = node.from - OFFSET;

            builder.add(
              listCharFrom,
              listCharFrom + 1,
              Decoration.replace({
                widget: new SampleWidget()
              })
            );
          }
        },
        from,
        to
      });
    }

    return builder.finish();
  }

  public update(update: ViewUpdate): void {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }
}

const pluginSpec: PluginSpec<SampleViewPlugin> = {
  decorations: (value: SampleViewPlugin) => value.decorations
};

export const sampleViewPlugin = ViewPlugin.fromClass(
  SampleViewPlugin,
  pluginSpec
);
```

### 编辑器建议

编辑器建议是 Obsidian 提供的一种机制，用于在用户输入时提供自动完成建议。

**示例：**
- **功能**：实现了自定义的编辑器建议功能，在特定条件下提供自动完成建议
- **实现方式**：创建继承 `EditorSuggest` 类的子类

```typescript
export class SampleEditorSuggest extends EditorSuggest<string> {
  public constructor(app: App) {
    super(app);
  }

  public getSuggestions(context: EditorSuggestContext): string[] | Promise<string[]> {
    const beforeCursor = context.query;
    if (beforeCursor.endsWith('@')) {
      return ['suggestion1', 'suggestion2', 'suggestion3'];
    }
    return [];
  }

  public renderSuggestion(value: string, el: HTMLElement): void {
    el.setText(value);
  }

  public selectSuggestion(value: string): void {
    const { editor, query } = this.context!;
    const cursorPosition = editor.getCursor();
    
    // 替换 @ 符号及之后的内容
    editor.replaceRange(
      value,
      { line: cursorPosition.line, ch: cursorPosition.ch - query.length },
      cursorPosition
    );
  }
}
```

## 编辑器扩展注册

编辑器扩展在插件的 `onloadImpl` 方法中注册，这是插件加载时执行的方法。

```typescript
protected override async onloadImpl(): Promise<void> {
  await super.onloadImpl();
  
  // 注册编辑器扩展
  this.registerEditorExtension([sampleViewPlugin, sampleStateField]);

  // 注册编辑器建议
  this.registerEditorSuggest(new SampleEditorSuggest(this.app));
  
  // 其他初始化代码...
}
```

## 自定义小部件

小部件是可以插入到编辑器中的自定义 UI 元素。

**示例：**
- **功能**：创建一个显示指向表情符号的小部件
- **实现方式**：创建继承 `WidgetType` 类的子类

```typescript
export class SampleWidget extends WidgetType {
  public toDOM(): HTMLElement {
    return createEl('span', { text: '👉' });
  }
}
```

## 编辑器命令

除了上述扩展外，插件还可以添加编辑器命令，用于在编辑器中执行特定操作。

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

## 最佳实践

在实现编辑器扩展时，建议遵循以下最佳实践：

1. **性能考虑**：编辑器扩展会在用户输入时频繁执行，确保它们高效运行
2. **兼容性**：确保扩展与 Obsidian 的不同版本兼容
3. **用户体验**：扩展应该增强而不是干扰用户的编辑体验
4. **错误处理**：添加适当的错误处理，避免扩展错误影响编辑器的基本功能
5. **资源管理**：确保在插件卸载时正确清理资源

## 相关资源

- [Obsidian API 文档 - 编辑器](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [CodeMirror 6 文档](https://codemirror.net/docs/)
- [返回主文档](Introduction.md)
