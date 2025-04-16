import { Notice } from 'obsidian';

/**
 * Manages CSS styles for individual views
 */
export class ViewStyleManager {
  private styleElements: Map<string, HTMLStyleElement> = new Map();
  private activeStyles: Map<string, string> = new Map();
  private styleClasses: Map<string, string> = new Map();

  /**
   * Loads a CSS style for a specific view
   * @param viewType The view type identifier
   * @param cssContent The CSS content to load (can be empty for styles loaded via main.scss)
   * @param styleName Optional name for the style (defaults to 'default')
   */
  public loadStyle(viewType: string, cssContent: string, styleName = 'default'): void {
    const styleKey = `${viewType}-${styleName}`;
    const styleClass = `${viewType}-style-${styleName}`;

    // Store the style class for this style
    this.styleClasses.set(styleKey, styleClass);

    // Create style element if it doesn't exist
    if (!this.styleElements.has(styleKey)) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-view-type', viewType);
      styleEl.setAttribute('data-style-name', styleName);
      document.head.appendChild(styleEl);
      this.styleElements.set(styleKey, styleEl);
    }

    // Update the style content
    const styleEl = this.styleElements.get(styleKey)!;

    // If cssContent is provided, use it. Otherwise, create a placeholder style
    // that will enable the correct CSS class on the view container
    if (cssContent) {
      styleEl.textContent = cssContent;
    } else {
      styleEl.textContent = `/* Style for ${viewType} - ${styleName} */`;
    }

    // If this is the first style for this view, make it active
    if (!this.activeStyles.has(viewType)) {
      this.activeStyles.set(viewType, styleName);
      styleEl.disabled = false;
    } else {
      // Otherwise disable it initially
      styleEl.disabled = true;
    }
  }

  /**
   * Applies a specific style to a view
   * @param viewType The view type identifier
   * @param styleName The name of the style to apply
   * @returns True if the style was applied, false if it doesn't exist
   */
  public applyStyle(viewType: string, styleName: string): boolean {
    const currentStyle = this.activeStyles.get(viewType);

    // Don't do anything if the style is already active
    if (currentStyle === styleName) {
      return true;
    }

    const newStyleKey = `${viewType}-${styleName}`;
    const newStyleEl = this.styleElements.get(newStyleKey);

    if (!newStyleEl) {
      new Notice(`Style "${styleName}" not found for view "${viewType}"`);
      return false;
    }

    // Disable the current style if it exists
    if (currentStyle) {
      const currentStyleKey = `${viewType}-${currentStyle}`;
      const currentStyleEl = this.styleElements.get(currentStyleKey);
      if (currentStyleEl) {
        currentStyleEl.disabled = true;
      }
    }

    // Enable the new style
    newStyleEl.disabled = false;
    this.activeStyles.set(viewType, styleName);

    return true;
  }

  /**
   * Gets the currently active style for a view
   * @param viewType The view type identifier
   * @returns The name of the active style, or undefined if none is active
   */
  public getActiveStyle(viewType: string): string | undefined {
    return this.activeStyles.get(viewType);
  }

  /**
   * Gets all available styles for a view
   * @param viewType The view type identifier
   * @returns Array of style names available for the view
   */
  public getAvailableStyles(viewType: string): string[] {
    const styles: string[] = [];

    for (const key of this.styleElements.keys()) {
      if (key.startsWith(`${viewType}-`)) {
        const styleName = key.substring(viewType.length + 1);
        styles.push(styleName);
      }
    }

    return styles;
  }

  /**
   * Removes a style from a view
   * @param viewType The view type identifier
   * @param styleName The name of the style to remove
   */
  public removeStyle(viewType: string, styleName: string): void {
    const styleKey = `${viewType}-${styleName}`;
    const styleEl = this.styleElements.get(styleKey);

    if (styleEl) {
      // If this is the active style, switch to another one if available
      if (this.activeStyles.get(viewType) === styleName) {
        const availableStyles = this.getAvailableStyles(viewType)
          .filter(style => style !== styleName);

        if (availableStyles.length > 0) {
          this.applyStyle(viewType, availableStyles[0]);
        } else {
          this.activeStyles.delete(viewType);
        }
      }

      // Remove the style element
      styleEl.remove();
      this.styleElements.delete(styleKey);
    }
  }

  /**
   * Removes all styles for a view
   * @param viewType The view type identifier
   */
  public removeAllStyles(viewType: string): void {
    for (const [key, styleEl] of this.styleElements.entries()) {
      if (key.startsWith(`${viewType}-`)) {
        styleEl.remove();
        this.styleElements.delete(key);
      }
    }

    this.activeStyles.delete(viewType);
  }
}

// Singleton instance
export const viewStyleManager = new ViewStyleManager();
