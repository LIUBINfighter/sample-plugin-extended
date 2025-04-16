# CSS Dependency Injection System Documentation

## Overview

The CSS Dependency Injection System allows for independent styling of individual view components in Obsidian plugins, with support for dynamically switching these styles at runtime. This approach enables users to choose different theme styles according to their preferences without needing to reload the plugin or application.

This documentation details the implementation principles, architecture design, and usage methods of the system.

## Features

- **View-level Style Isolation**: Each view can have its own independent CSS styles
- **Runtime Style Switching**: Switch between different style themes without reloading
- **Multi-theme Support**: Three theme styles provided by default (default, dark, colorful)
- **Extensibility**: Easy to add new theme styles
- **No Conflicts**: Styles for different views do not interfere with each other

## System Architecture

The CSS Dependency Injection System consists of the following main components:

1. **ViewStyleManager Class**: Core management class responsible for loading, applying, and switching styles
2. **Style Files**: SCSS style definitions for various themes
3. **View Components**: View components that use the style manager to load and switch styles
4. **Theme Switcher**: UI component that allows users to switch between different themes

### Core Class: ViewStyleManager

`ViewStyleManager` is the core of the entire system, managing the creation, updating, and switching of style elements. This class is implemented using the singleton pattern to ensure there is only one style manager instance throughout the application.

```typescript
export class ViewStyleManager {
  private styleElements: Map<string, HTMLStyleElement> = new Map();
  private activeStyles: Map<string, string> = new Map();
  private styleClasses: Map<string, string> = new Map();
  
  // Load style
  public loadStyle(viewType: string, cssContent: string, styleName = 'default'): void {
    // Style loading logic implementation
  }
  
  // Apply style
  public applyStyle(viewType: string, styleName: string): boolean {
    // Style application logic implementation
  }
  
  // Get current active style
  public getActiveStyle(viewType: string): string | undefined {
    // Return current active style
  }
  
  // Get available styles list
  public getAvailableStyles(viewType: string): string[] {
    // Return available styles list
  }
  
  // Remove style
  public removeStyle(viewType: string, styleName: string): void {
    // Style removal logic implementation
  }
  
  // Remove all styles
  public removeAllStyles(viewType: string): void {
    // All styles removal logic implementation
  }
  
  // Get view container element
  private getViewContainer(viewType: string): HTMLElement | null {
    // View container finding logic implementation
  }
}

// Singleton instance
export const viewStyleManager = new ViewStyleManager();
```

## Implementation Principles

### 1. Style Loading Mechanism

Style loading is implemented through the following steps:

1. Create a `<style>` element for each theme and add it to the document head
2. Assign a unique class name to each style, used to identify the currently applied style on the view container
3. Initially disable all styles except the default style

```typescript
public loadStyle(viewType: string, cssContent: string, styleName = 'default'): void {
  const styleKey = `${viewType}-${styleName}`;
  const styleClass = `${viewType}-style-${styleName}`;
  
  // Store style class name
  this.styleClasses.set(styleKey, styleClass);
  
  // Create style element
  if (!this.styleElements.has(styleKey)) {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-view-type', viewType);
    styleEl.setAttribute('data-style-name', styleName);
    document.head.appendChild(styleEl);
    this.styleElements.set(styleKey, styleEl);
  }
  
  // Update style content
  const styleEl = this.styleElements.get(styleKey)!;
  
  if (cssContent) {
    styleEl.textContent = cssContent;
  } else {
    styleEl.textContent = `/* Style for ${viewType} - ${styleName} */`;
  }
  
  // Set initial state
  if (!this.activeStyles.has(viewType)) {
    this.activeStyles.set(viewType, styleName);
    styleEl.disabled = false;
  } else {
    styleEl.disabled = true;
  }
}
```

### 2. Style Switching Mechanism

Style switching is implemented through the following steps:

1. Disable the currently active style
2. Remove the class name of the current style from the view container
3. Enable the new style
4. Add the class name of the new style to the view container

```typescript
public applyStyle(viewType: string, styleName: string): boolean {
  const currentStyle = this.activeStyles.get(viewType);
  
  // If the style is already active, do nothing
  if (currentStyle === styleName) {
    return true;
  }
  
  const newStyleKey = `${viewType}-${styleName}`;
  const newStyleEl = this.styleElements.get(newStyleKey);
  
  if (!newStyleEl) {
    new Notice(`Style "${styleName}" not found for view "${viewType}"`);
    return false;
  }
  
  // Get view container
  const viewContainer = this.getViewContainer(viewType);
  
  // Disable current style
  if (currentStyle) {
    const currentStyleKey = `${viewType}-${currentStyle}`;
    const currentStyleEl = this.styleElements.get(currentStyleKey);
    if (currentStyleEl) {
      currentStyleEl.disabled = true;
    }
    
    // Remove current style class
    if (viewContainer) {
      const currentStyleClass = this.styleClasses.get(currentStyleKey);
      if (currentStyleClass) {
        viewContainer.classList.remove(currentStyleClass);
      }
    }
  }
  
  // Enable new style
  newStyleEl.disabled = false;
  this.activeStyles.set(viewType, styleName);
  
  // Add new style class
  if (viewContainer) {
    const newStyleClass = this.styleClasses.get(newStyleKey);
    if (newStyleClass) {
      viewContainer.classList.add(newStyleClass);
    }
  }
  
  return true;
}
```

### 3. View Container Finding

To correctly apply style classes, the system needs to find the container element of the view:

```typescript
private getViewContainer(viewType: string): HTMLElement | null {
  // First try to find by class name
  const container = document.querySelector(`.${viewType}`);
  if (container instanceof HTMLElement) {
    return container;
  }
  
  // If not found, try to find by data attribute
  const viewEl = document.querySelector(`[data-type="${viewType}"]`);
  if (viewEl instanceof HTMLElement) {
    // The container is usually the first child with 'view-content' class
    const content = viewEl.querySelector('.view-content');
    if (content instanceof HTMLElement) {
      return content;
    }
    return viewEl;
  }
  
  return null;
}
```

## Style Files Organization

Style files are divided into three parts by theme:

1. **Base Styles (components.scss)**: Contains basic styles for all components
2. **Dark Theme (components-dark.scss)**: Specific styles for the dark theme
3. **Colorful Theme (components-colorful.scss)**: Specific styles for the colorful theme

Each style file uses specific selectors to ensure styles are only applied to the correct theme:

```scss
/* Base styles - applicable to all themes */
.SamplePluginExtended-SampleView .sample-view-container {
  /* Base style definitions */
}

/* Dark theme specific styles */
.SamplePluginExtended-SampleView.SamplePluginExtended-SampleView-style-dark .sample-view-container {
  /* Dark theme style definitions */
}

/* Colorful theme specific styles */
.SamplePluginExtended-SampleView.SamplePluginExtended-SampleView-style-colorful .sample-view-container {
  /* Colorful theme style definitions */
}
```

## Usage in Views

To use the CSS Dependency Injection System in a view, follow these steps:

### 1. Initialize View Container

Ensure the view container has the correct class name so the style manager can find it:

```typescript
public override async onOpen(): Promise<void> {
  // Clear content element
  this.contentEl.empty();
  
  // Add view type as class name for CSS selectors
  this.contentEl.classList.add(SAMPLE_VIEW_TYPE);
  
  // Create container
  this.container = this.contentEl.createDiv({ cls: 'sample-view-container' });
  
  // Create UI components...
  
  // Load styles
  this.loadStyles();
  
  await Promise.resolve();
}
```

### 2. Load Styles

Load all styles needed for the view:

```typescript
private loadStyles(): void {
  try {
    // Load base style
    const baseStyleContent = this.getStyleContent('components.scss');
    viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, baseStyleContent, 'default');
    
    // Load dark theme style
    const darkStyleContent = this.getStyleContent('components-dark.scss');
    viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, darkStyleContent, 'dark');
    
    // Load colorful theme style
    const colorfulStyleContent = this.getStyleContent('components-colorful.scss');
    viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, colorfulStyleContent, 'colorful');
    
    // Apply default style
    viewStyleManager.applyStyle(SAMPLE_VIEW_TYPE, 'default');
  } catch (error) {
    console.error('Failed to load styles:', error);
  }
}

private getStyleContent(fileName: string): string {
  // Return style content or placeholder
  return `.${SAMPLE_VIEW_TYPE} { /* ${fileName} styles */ }`;
}
```

### 3. Create Theme Switcher

Create a UI component that allows users to switch themes:

```typescript
private createThemeSwitcher(): void {
  const themeSwitcher = this.container.createDiv({ cls: 'theme-switcher' });
  themeSwitcher.createDiv({ cls: 'theme-title', text: 'Switch Component Theme' });
  
  const themeButtons = themeSwitcher.createDiv({ cls: 'theme-buttons' });
  
  // Get available themes
  const themes = ['default', 'dark', 'colorful'];
  
  // Get current active theme
  const activeTheme = viewStyleManager.getActiveStyle(SAMPLE_VIEW_TYPE) || 'default';
  
  // Create a button for each theme
  themes.forEach(theme => {
    const button = themeButtons.createEl('button', {
      text: theme.charAt(0).toUpperCase() + theme.slice(1),
      cls: activeTheme === theme ? 'active' : ''
    });
    
    button.addEventListener('click', () => {
      // Apply theme
      const success = viewStyleManager.applyStyle(SAMPLE_VIEW_TYPE, theme);
      
      if (success) {
        // Update active button
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

## Adding New Themes

To add a new theme, follow these steps:

1. Create a new theme style file (e.g., `components-new-theme.scss`)
2. Define styles using the correct selector:
   ```scss
   .SamplePluginExtended-SampleView.SamplePluginExtended-SampleView-style-new-theme .sample-view-container {
     /* New theme style definitions */
   }
   ```
3. Import the new theme style in `main.scss`:
   ```scss
   @import "components-new-theme.scss";
   ```
4. Load the new theme in the view's `loadStyles` method:
   ```typescript
   const newThemeContent = this.getStyleContent('components-new-theme.scss');
   viewStyleManager.loadStyle(SAMPLE_VIEW_TYPE, newThemeContent, 'new-theme');
   ```
5. Add the new theme to the theme switcher:
   ```typescript
   const themes = ['default', 'dark', 'colorful', 'new-theme'];
   ```

## Best Practices

1. **Style Isolation**: Ensure styles for each theme use the correct selectors to avoid style conflicts
2. **Performance Considerations**: Avoid loading too many styles, which may affect performance
3. **User Experience**: Provide a clear theme switching interface and visual feedback when switching
4. **Default Style**: Always provide a default style to ensure normal display if other styles fail to load
5. **Error Handling**: Properly handle errors that may occur during style loading and application

## Example

This system has been implemented in SampleView, providing three theme styles:

1. **Default Theme**: Clean, professional design
2. **Dark Theme**: Dark background with blue-purple accent colors
3. **Colorful Theme**: Gradients, shadows, and animation effects

Users can switch between these themes using the theme switcher to experience different visual effects.

## Summary

The CSS Dependency Injection System provides a flexible, extensible way to manage styles for view components in Obsidian plugins. Through this system, developers can offer users multiple theme choices, enhancing the user experience while maintaining code organization and maintainability.

The core of the system is the `ViewStyleManager` class, which is responsible for loading, applying, and switching styles. By using CSS classes and selectors, the system can seamlessly switch between different themes without needing to reload the plugin or application.
