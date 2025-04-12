# Obsidian 开发模式文件复制工具

本文档详细介绍了 Sample Plugin Extended 插件中的 Obsidian 开发模式文件复制工具，该工具用于在开发过程中自动将构建文件复制到 Obsidian 插件目录。

## 功能概述

在 Obsidian 插件开发过程中，开发者需要频繁地将构建后的文件复制到 Obsidian 的插件目录中进行测试。这个工具通过自动化这一过程，大大提高了开发效率。

主要功能：

- 自动将构建后的文件从 `./dist/dev` 复制到 Obsidian 插件目录
- 支持从 `.env` 文件读取目标目录配置
- 支持监视模式，当文件变化时自动复制
- 只复制必要的文件（main.js, styles.css, manifest.json），排除热重载相关文件
- 自动创建目标目录（如果不存在）

## 工作原理

该工具由两个主要部分组成：

1. **复制脚本** (`scripts/copy-to-obsidian.js`)：
   - 定义要复制的文件列表
   - 设置源目录和目标目录
   - 提供文件复制功能
   - 支持文件变化监视

2. **npm 脚本**：
   - 在 `package.json` 中定义了多个命令，用于不同场景下的文件复制

### 复制流程

1. 脚本首先检查源目录 (`./dist/dev`) 是否存在
2. 然后检查目标目录 (`../.obsidian/plugins/sample-plugin-extended`) 是否存在，如不存在则创建
3. 复制指定的文件（main.js, styles.css, manifest.json）到目标目录
4. 如果启用了监视模式，则持续监视源目录中的文件变化，当指定文件发生变化时自动复制

## 使用方法

### 可用命令

在项目根目录下，可以使用以下 npm 命令：

1. **标准开发模式**：

   ```bash
   npm run dev
   ```

   这个命令会启动开发服务器，并将文件复制到根目录。obsidian-dev-utils 会自动使用 `.env` 文件中的 `OBSIDIAN_CONFIG_FOLDER` 路径复制文件到 Obsidian 插件目录。

2. **仅复制到 Obsidian 插件目录的开发模式**：

   ```bash
   npm run dev:obsidian
   ```

   这个命令仅启动开发服务器，使用 obsidian-dev-utils 内置的复制功能将文件复制到 `.env` 文件中指定的 Obsidian 插件目录。

3. **单次复制到 Obsidian 插件目录**：

   ```bash
   npm run copy-to-obsidian
   ```

   这个命令使用自定义脚本将文件复制到 Obsidian 插件目录，可以在需要手动复制时使用。

4. **监视模式复制到 Obsidian 插件目录**：

   ```bash
   npm run copy-to-obsidian:watch
   ```

   这个命令使用自定义脚本在监视模式下将文件复制到 Obsidian 插件目录，当文件变化时自动复制。

### 配置选项

如需修改脚本的行为，可以编辑 `scripts/copy-to-obsidian.js` 文件或修改 `.env` 文件：

1. **修改要复制的文件**：

   ```javascript
   const filesToCopy = [
     'main.js',
     'styles.css',
     'manifest.json'
     // 可以添加其他需要复制的文件
   ];
   ```

2. **修改目标目录**：
   有两种方式可以修改目标目录：

   a. 修改 `.env` 文件（推荐）：

   ```env
   OBSIDIAN_CONFIG_FOLDER=D:\Path\To\Obsidian\plugins\sample-plugin-extended\
   ```

   b. 直接在脚本中修改默认路径：

   ```javascript
   const obsidianConfigFolder = process.env.OBSIDIAN_CONFIG_FOLDER || path.join('D:', 'CustomPath', 'Obsidian', 'plugins', 'sample-plugin-extended');
   ```

## 故障排除

### 常见问题

1. **找不到源目录**：
   - 确保已运行构建命令，生成了 `./dist/dev` 目录
   - 检查当前工作目录是否为项目根目录

2. **无法创建目标目录**：
   - 检查您是否有足够的权限创建目录
   - 确保父目录路径存在
   - 检查 Obsidian 是否已关闭（有时 Obsidian 会锁定插件目录）

3. **文件复制失败**：
   - 检查文件是否被其他程序锁定
   - 确保目标目录有写入权限
   - 检查磁盘空间是否充足

### 日志输出

脚本在运行过程中会输出详细的日志信息，包括：

- 目录创建状态
- 文件复制状态
- 错误信息（如有）

通过查看这些日志，可以快速定位问题所在。

## 高级用法

### 自定义目标路径

如果您需要将文件复制到不同的位置，可以修改 `scripts/copy-to-obsidian.js` 中的 `destDir` 变量：

```javascript
// 例如，复制到自定义位置
const destDir = path.join('D:', 'CustomPath', 'Obsidian', 'plugins', 'sample-plugin-extended');
```

### 添加更多文件类型

如果您的插件需要复制额外的文件类型，可以修改 `filesToCopy` 数组：

```javascript
const filesToCopy = [
  'main.js',
  'styles.css',
  'manifest.json',
  'data.json',           // 添加额外的配置文件
  'assets/icon.png'      // 添加资源文件
];
```

注意：如果添加了子目录中的文件，需要确保目标目录中也创建了相应的子目录结构。

## 与其他工具的集成

该脚本可以与其他开发工具集成：

1. **与 VSCode 任务集成**：
   可以在 `.vscode/tasks.json` 中添加任务，直接从编辑器运行复制命令

2. **与 CI/CD 流程集成**：
   可以在持续集成流程中使用该脚本，自动部署到测试环境

## 贡献与改进

如果您有改进这个脚本的想法，欢迎：

1. 提交 Issue 描述您的想法
2. 提交 Pull Request 实现您的改进

## 相关资源

- [Obsidian 插件开发文档](https://marcus.se.net/obsidian-plugin-docs/)
- [Node.js 文件系统 API](https://nodejs.org/api/fs.html)
- [返回主文档](Introduction.md)
