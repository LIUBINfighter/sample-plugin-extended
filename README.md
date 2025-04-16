# Sample Plugin Extended

This is a sample plugin for [Obsidian](https://obsidian.md/), more advanced version of the original [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin/).

## Usage

### Generator (recommended)

It is better to use [Obsidian Plugin Yeoman Generator](https://github.com/mnaoumov/generator-obsidian-plugin) to generate customized version of the plugin.

### Template

You can use `GitHub`'s `Use this template` button to create your copy of this repo.

Don't forget to text search for all `Sample` words and replace them accordingly.

## Features

See [Obsidian Plugin Yeoman Generator](https://github.com/mnaoumov/generator-obsidian-plugin) for detailed list of features.

## Development

### Obsidian Plugin Development File Copying Tool

This plugin includes a tool to automatically copy build files to the Obsidian plugins directory for testing during development.

#### Configuration

The tool now **automatically detects** your Obsidian plugins directory, so in most cases no manual configuration is needed!

1. Simply use one of the following npm commands:

   ```bash
   # Standard development mode (copies to both root and Obsidian plugins directory)
   npm run dev

   # Obsidian-only development mode
   npm run dev:obsidian

   # One-time copy to Obsidian plugins directory
   npm run copy-to-obsidian

   # Watch mode copy to Obsidian plugins directory
   npm run copy-to-obsidian:watch
   ```

For more details, see [Obsidian Development Documentation](docs/ObsidianDevelopment.md).

## 开发说明

### Obsidian 插件开发文件复制工具

本插件包含一个工具，可在开发过程中自动将构建文件复制到 Obsidian 插件目录进行测试。

#### 配置方法

该工具现在可以**自动检测**您的 Obsidian 插件目录，大多数情况下无需手动配置！

1. 直接使用以下 npm 命令之一：

   ```bash
   # 标准开发模式（同时复制到根目录和 Obsidian 插件目录）
   npm run dev

   # 仅复制到 Obsidian 插件目录的开发模式
   npm run dev:obsidian

   # 单次复制到 Obsidian 插件目录
   npm run copy-to-obsidian

   # 监视模式复制到 Obsidian 插件目录
   npm run copy-to-obsidian:watch
   ```

更多详情，请参阅 [Obsidian 开发文档](docs/ObsidianDevelopment.md)。
