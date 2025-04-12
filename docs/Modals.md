# 模态框和对话框

Sample Plugin Extended 插件实现了多种对话框和模态框，展示了如何创建交互式用户界面元素。本文档详细介绍了这些模态框和对话框的实现和用途。

## 模态框和对话框类型

插件实现了两种主要类型的模态框和对话框：

### 自定义模态框

自定义模态框是通过继承 Obsidian 的 `Modal` 类创建的完全自定义的对话框。

**示例：**
- **功能**：`SampleModal` - 自定义模态框示例，可通过命令调用
- **实现方式**：创建继承 `Modal` 类的子类

```typescript
export class SampleModal extends Modal {
  private result: string;

  public constructor(app: App) {
    super(app);
    this.result = '';
  }

  public override onOpen(): void {
    const { contentEl } = this;
    
    contentEl.createEl('h2', { text: 'Sample Modal' });
    
    new Setting(contentEl)
      .setName('Input')
      .setDesc('Enter some text')
      .addText((text) => {
        text.onChange((value) => {
          this.result = value;
        });
      });
      
    new Setting(contentEl)
      .addButton((button) => {
        button.setButtonText('Submit')
          .setCta()
          .onClick(() => {
            new Notice(`You entered: ${this.result}`);
            this.close();
          });
      });
  }

  public override onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

使用自定义模态框：

```typescript
// 注册命令
this.addCommand({
  callback: () => {
    new SampleModal(this.app).open();
  },
  id: 'open-sample-modal',
  name: 'Open Sample Modal'
});
```

### 内置对话框

Obsidian 提供了一些内置的对话框，可以用于常见的用户交互场景。

**示例：**
- **警告框**：显示简单的警告消息
- **确认框**：请求用户确认操作
- **提示框**：请求用户输入文本，带验证功能
- **选择项框**：让用户从列表中选择一项

```typescript
// 警告框
private async showAlert(): Promise<void> {
  await alert({
    app: this.app,
    message: 'Sample alert message',
    title: 'Sample alert title'
  });
}

// 确认框
private async showConfirm(): Promise<void> {
  const confirmed = await confirm({
    app: this.app,
    message: 'Are you sure you want to proceed?',
    title: 'Confirmation'
  });
  
  if (confirmed) {
    new Notice('Action confirmed');
  } else {
    new Notice('Action cancelled');
  }
}

// 提示框
private async showPrompt(): Promise<void> {
  const result = await prompt({
    app: this.app,
    message: 'Enter your name',
    placeholder: 'John Doe',
    title: 'Name Input',
    validator: (value) => {
      if (!value) {
        return 'Name cannot be empty';
      }
      return null;
    }
  });
  
  if (result) {
    new Notice(`Hello, ${result}!`);
  }
}

// 选择项框
private async showSelectItem(): Promise<void> {
  const items = ['Option 1', 'Option 2', 'Option 3'];
  const selected = await selectItem({
    app: this.app,
    items,
    placeholder: 'Select an option',
    title: 'Options'
  });
  
  if (selected) {
    new Notice(`You selected: ${selected}`);
  }
}
```

## 模态框命令注册

模态框命令在插件的 `registerModalCommands` 方法中注册。

```typescript
private registerModalCommands(): void {
  this.addCommand({
    callback: this.showAlert.bind(this),
    id: 'show-alert',
    name: 'Show Alert'
  });

  this.addCommand({
    callback: this.showConfirm.bind(this),
    id: 'show-confirm',
    name: 'Show Confirm'
  });

  this.addCommand({
    callback: this.showPrompt.bind(this),
    id: 'show-prompt',
    name: 'Show Prompt'
  });

  this.addCommand({
    callback: this.showSelectItem.bind(this),
    id: 'show-select-item',
    name: 'Show Select Item'
  });
}
```

## 高级用例

### 表单模态框

可以创建包含多个输入字段的表单模态框。

```typescript
export class FormModal extends Modal {
  private name: string = '';
  private email: string = '';
  private age: number = 0;

  public constructor(app: App) {
    super(app);
  }

  public override onOpen(): void {
    const { contentEl } = this;
    
    contentEl.createEl('h2', { text: 'User Information' });
    
    new Setting(contentEl)
      .setName('Name')
      .addText((text) => {
        text.onChange((value) => {
          this.name = value;
        });
      });
      
    new Setting(contentEl)
      .setName('Email')
      .addText((text) => {
        text.setPlaceholder('example@example.com')
          .onChange((value) => {
            this.email = value;
          });
      });
      
    new Setting(contentEl)
      .setName('Age')
      .addSlider((slider) => {
        slider.setLimits(0, 100, 1)
          .setValue(25)
          .setDynamicTooltip()
          .onChange((value) => {
            this.age = value;
          });
      });
      
    new Setting(contentEl)
      .addButton((button) => {
        button.setButtonText('Submit')
          .setCta()
          .onClick(() => {
            if (this.validateForm()) {
              this.submitForm();
              this.close();
            }
          });
      });
  }

  private validateForm(): boolean {
    if (!this.name) {
      new Notice('Name is required');
      return false;
    }
    
    if (!this.email || !this.email.includes('@')) {
      new Notice('Valid email is required');
      return false;
    }
    
    return true;
  }

  private submitForm(): void {
    new Notice(`Form submitted: ${this.name}, ${this.email}, ${this.age}`);
    // 处理表单数据...
  }

  public override onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

### 进度模态框

可以创建显示操作进度的模态框。

```typescript
export class ProgressModal extends Modal {
  private progressBar: HTMLProgressElement;
  private statusText: HTMLElement;
  private task: Promise<void>;

  public constructor(app: App, task: () => Promise<void>) {
    super(app);
    this.task = task();
  }

  public override async onOpen(): Promise<void> {
    const { contentEl } = this;
    
    contentEl.createEl('h2', { text: 'Operation in Progress' });
    
    this.statusText = contentEl.createEl('div', { cls: 'status', text: 'Starting...' });
    
    this.progressBar = contentEl.createEl('progress', {
      attr: { max: '100', value: '0' }
    });
    
    // 启动任务并更新进度
    this.updateProgress(0, 'Starting...');
    try {
      await this.task;
      this.updateProgress(100, 'Completed!');
      setTimeout(() => this.close(), 1000);
    } catch (error) {
      this.updateProgress(0, `Error: ${error.message}`);
    }
  }

  public updateProgress(percent: number, status: string): void {
    this.progressBar.value = percent;
    this.statusText.textContent = status;
  }

  public override onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

## 最佳实践

在实现模态框和对话框时，建议遵循以下最佳实践：

1. **简洁明了**：模态框应该简洁明了，只包含必要的信息和控件
2. **响应式设计**：确保模态框在不同大小的窗口中都能正常显示
3. **键盘导航**：支持键盘导航和快捷键
4. **错误处理**：提供清晰的错误消息和验证反馈
5. **资源管理**：在 `onClose` 方法中正确清理资源
6. **可访问性**：确保模态框符合可访问性标准

## 相关资源

- [Obsidian API 文档 - 模态框](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [Obsidian API 文档 - 设置](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [返回主文档](Introduction.md)
