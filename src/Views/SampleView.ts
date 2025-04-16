import { ItemView, Notice, TFile, setIcon } from 'obsidian';
import { viewStyleManager } from '../styles/ViewStyleManager.ts';

export const SAMPLE_VIEW_TYPE = 'SamplePluginExtended-SampleView';

export class SampleView extends ItemView {
  private container!: HTMLElement;
  private selectedFile: TFile | null = null;
  private sliderValue = 50;
  private stepSliderValue = 50;

  public override getDisplayText(): string {
    return 'Component Examples';
  }

  public override getViewType(): string {
    return SAMPLE_VIEW_TYPE;
  }

  public override getIcon(): string {
    return 'layout';
  }

  public override async onOpen(): Promise<void> {
    // Load the different CSS styles for this view
    this.loadStyles();

    // Create the main container
    this.contentEl.empty();
    this.container = this.contentEl.createDiv({ cls: 'sample-view-container' });

    // Create the header
    this.container.createEl('h4', { text: 'Obsidian UI Components' });

    // Create all component sections
    this.createButtonComponents();
    this.createFileSearchComponent();
    this.createToggleSwitchComponents();
    this.createSliderComponents();
    this.createFileMetadataComponents();

    // Create theme switcher
    this.createThemeSwitcher();

    await Promise.resolve();
  }

  private loadStyles(): void {
    try {
      // 获取基础样式内容
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

      console.log('Styles loaded successfully');
    } catch (error) {
      console.error('Failed to load styles:', error);
    }
  }

  private getStyleContent(fileName: string): string {
    try {
      // 这里我们直接返回一个包含CSS选择器的字符串，确保它能被正确应用
      // 实际上，这些样式已经通过main.scss和webpack加载到了页面中
      // 我们只需要确保ViewStyleManager能够正确地启用/禁用它们
      return `.${SAMPLE_VIEW_TYPE} { /* ${fileName} styles */ }`;
    } catch (error) {
      console.error(`Failed to load style ${fileName}:`, error);
      return '';
    }
  }

  private createButtonComponents(): void {
    const section = this.createComponentSection('Button Components');

    // Standard button
    const standardBtn = section.createEl('button', {
      cls: 'standard-button',
      text: 'Standard Button'
    });
    standardBtn.addEventListener('click', () => {
      new Notice('Standard button clicked');
    });

    // Button with icon
    const iconBtn = section.createEl('button', {
      cls: 'standard-button icon-button',
      text: 'Icon Button'
    });
    const iconSpan = iconBtn.createSpan({ cls: 'icon' });
    setIcon(iconSpan, 'star');
    iconBtn.addEventListener('click', () => {
      new Notice('Icon button clicked');
    });

    // Danger button
    const dangerBtn = section.createEl('button', {
      cls: 'danger-button',
      text: 'Danger Button'
    });
    dangerBtn.addEventListener('click', () => {
      new Notice('Danger button clicked');
    });

    // Disabled button
    const disabledBtn = section.createEl('button', {
      cls: 'standard-button disabled-button',
      text: 'Disabled Button'
    });
    disabledBtn.disabled = true;

    // Extra button (small icon button)
    const extraBtn = section.createEl('button', { cls: 'extra-button' });
    setIcon(extraBtn, 'settings');
    extraBtn.addEventListener('click', () => {
      new Notice('Extra button clicked');
    });
  }

  private createFileSearchComponent(): void {
    const section = this.createComponentSection('File Search Component');

    // Create search container
    const searchContainer = section.createDiv({ cls: 'file-search-container' });

    // Create search input
    const searchInput = searchContainer.createEl('input', {
      cls: 'search-input',
      attr: {
        type: 'text',
        placeholder: 'Search for files...'
      }
    });

    // Create search results container
    const searchResults = searchContainer.createDiv({ cls: 'search-results' });
    searchResults.style.display = 'none';

    // Create file actions container
    const fileActions = searchContainer.createDiv({ cls: 'file-actions' });

    // Create open button
    const openBtn = fileActions.createEl('button', {
      cls: 'standard-button',
      text: 'Open'
    });
    openBtn.disabled = true;
    openBtn.addEventListener('click', () => {
      if (this.selectedFile) {
        this.app.workspace.getLeaf().openFile(this.selectedFile);
        new Notice(`Opened file: ${this.selectedFile.name}`);
      }
    });

    // Create reveal button
    const revealBtn = fileActions.createEl('button', {
      cls: 'standard-button',
      text: 'Reveal in Explorer'
    });
    revealBtn.disabled = true;
    revealBtn.addEventListener('click', () => {
      if (this.selectedFile) {
        // Use alternative method since revealInFolder might not be available
        new Notice(`File path: ${this.selectedFile.path}`);
        new Notice(`Revealed file: ${this.selectedFile.name}`);
      }
    });

    // Handle search input
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();

      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }

      // Get matching files
      const files = this.app.vault.getMarkdownFiles()
        .filter(file => file.name.toLowerCase().includes(query))
        .slice(0, 5); // Limit to 5 results

      // Display results
      searchResults.empty();

      if (files.length === 0) {
        searchResults.createDiv({
          cls: 'no-results',
          text: 'No files found'
        });
      } else {
        files.forEach(file => {
          const resultItem = searchResults.createDiv({ cls: 'search-result-item' });
          setIcon(resultItem.createSpan(), 'file-text');
          resultItem.createSpan({ text: file.name });

          resultItem.addEventListener('click', () => {
            // Select this file
            this.selectedFile = file;

            // Update UI
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
              item.classList.remove('selected');
            });
            resultItem.classList.add('selected');

            // Enable buttons
            openBtn.disabled = false;
            revealBtn.disabled = false;

            // Update search input
            searchInput.value = file.name;
          });
        });
      }

      searchResults.style.display = 'block';
    });

    // Hide results when clicking outside
    document.addEventListener('click', (event) => {
      if (!searchContainer.contains(event.target as Node)) {
        searchResults.style.display = 'none';
      }
    });
  }

  private createToggleSwitchComponents(): void {
    const section = this.createComponentSection('Toggle Switch Components');

    // Create toggle container
    const toggleContainer = section.createDiv({ cls: 'toggle-container' });

    // Basic toggle
    this.createToggleSwitch(toggleContainer, 'Basic Toggle', false);

    // Default on toggle
    this.createToggleSwitch(toggleContainer, 'Default On Toggle', true);

    // Toggle with help icon
    this.createToggleSwitch(toggleContainer, 'Toggle with Help', false, true);
  }

  private createToggleSwitch(container: HTMLElement, label: string, defaultValue: boolean, showHelp = false): void {
    const toggleItem = container.createDiv({ cls: 'toggle-item' });

    // Create the toggle switch
    const toggleSwitch = toggleItem.createDiv({ cls: 'toggle-switch' });
    const input = toggleSwitch.createEl('input', {
      attr: {
        type: 'checkbox',
        checked: defaultValue ? 'checked' : null
      }
    });
    toggleSwitch.createDiv({ cls: 'toggle-slider' });

    // Create the label
    toggleItem.createDiv({
      cls: 'toggle-label',
      text: label
    });

    // Add help icon if needed
    if (showHelp) {
      const helpIcon = toggleItem.createSpan({ cls: 'help-icon' });
      setIcon(helpIcon, 'help-circle');
      helpIcon.addEventListener('click', () => {
        new Notice(`Help for ${label}`);
      });
    }

    // Handle toggle change
    input.addEventListener('change', () => {
      new Notice(`${label} is now ${input.checked ? 'ON' : 'OFF'}`);
    });
  }

  private createSliderComponents(): void {
    const section = this.createComponentSection('Slider Components');

    // Create slider container
    const sliderContainer = section.createDiv({ cls: 'slider-container' });

    // Basic slider
    this.createBasicSlider(sliderContainer);

    // Slider with steps
    this.createStepSlider(sliderContainer);
  }

  private createBasicSlider(container: HTMLElement): void {
    const sliderItem = container.createDiv({ cls: 'slider-item' });

    // Create label with value display
    const sliderLabel = sliderItem.createDiv({ cls: 'slider-label' });
    sliderLabel.createSpan({ text: 'Basic Slider' });
    const valueDisplay = sliderLabel.createSpan({
      cls: 'slider-value',
      text: this.sliderValue.toString()
    });

    // Create the slider input
    const slider = sliderItem.createEl('input', {
      cls: 'slider-input',
      attr: {
        type: 'range',
        min: '0',
        max: '100',
        value: this.sliderValue.toString(),
        step: '1'
      }
    });

    // Handle slider change
    slider.addEventListener('input', () => {
      this.sliderValue = parseInt(slider.value);
      valueDisplay.setText(this.sliderValue.toString());
    });
  }

  private createStepSlider(container: HTMLElement): void {
    const sliderItem = container.createDiv({ cls: 'slider-item' });

    // Create label with value display
    const sliderLabel = sliderItem.createDiv({ cls: 'slider-label' });
    sliderLabel.createSpan({ text: 'Step Slider (step=5)' });
    const valueDisplay = sliderLabel.createSpan({
      cls: 'slider-value',
      text: this.stepSliderValue.toString()
    });

    // Create the slider input
    const slider = sliderItem.createEl('input', {
      cls: 'slider-input',
      attr: {
        type: 'range',
        min: '0',
        max: '100',
        value: this.stepSliderValue.toString(),
        step: '5'
      }
    });

    // Handle slider change
    slider.addEventListener('input', () => {
      this.stepSliderValue = parseInt(slider.value);
      valueDisplay.setText(this.stepSliderValue.toString());
    });
  }

  private createFileMetadataComponents(): void {
    const section = this.createComponentSection('File Metadata Components');

    // Create metadata container
    const metadataContainer = section.createDiv({ cls: 'file-metadata-container' });

    // Get the active file
    const activeFile = this.app.workspace.getActiveFile();

    if (!activeFile) {
      metadataContainer.createDiv({
        text: 'No active file. Open a file to see metadata.',
        cls: 'no-file-message'
      });
      return;
    }

    // Basic file info
    this.createMetadataSection(metadataContainer, 'Basic File Info', [
      { key: 'Path', value: activeFile.path },
      { key: 'Size', value: `${Math.round(activeFile.stat.size / 1024)} KB` },
      { key: 'Created', value: new Date(activeFile.stat.ctime).toLocaleString() },
      { key: 'Modified', value: new Date(activeFile.stat.mtime).toLocaleString() }
    ]);

    // Get file cache to access frontmatter and other metadata
    const fileCache = this.app.metadataCache.getFileCache(activeFile);

    if (fileCache) {
      // Frontmatter
      if (fileCache.frontmatter) {
        const frontmatterItems = Object.entries(fileCache.frontmatter)
          .filter(([key]) => key !== 'position')
          .map(([key, value]) => ({
            key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value)
          }));

        if (frontmatterItems.length > 0) {
          this.createMetadataSection(metadataContainer, 'Frontmatter',
            frontmatterItems.map(item => ({
              key: item.key,
              value: String(item.value)
            })));
        }
      }

      // Tags
      if (fileCache.tags && fileCache.tags.length > 0) {
        this.createMetadataSection(metadataContainer, 'Tags', [
          { key: 'Count', value: fileCache.tags.length.toString() },
          { key: 'Tags', value: fileCache.tags.map(tag => tag.tag).join(', ') }
        ]);
      }

      // Headings
      if (fileCache.headings && fileCache.headings.length > 0) {
        this.createMetadataSection(metadataContainer, 'Headings', [
          { key: 'Count', value: fileCache.headings.length.toString() },
          ...fileCache.headings.slice(0, 3).map(heading => ({
            key: `H${heading.level}`,
            value: heading.heading
          }))
        ]);
      }

      // Links
      if (fileCache.links && fileCache.links.length > 0) {
        this.createMetadataSection(metadataContainer, 'Links', [
          { key: 'Count', value: fileCache.links.length.toString() },
          ...fileCache.links.slice(0, 3).map((link, index) => ({
            key: `Link ${index + 1}`,
            value: link.link
          }))
        ]);
      }
    }
  }

  private createMetadataSection(container: HTMLElement, title: string, items: Array<{key: string, value: string}>): void {
    const section = container.createDiv({ cls: 'metadata-section' });
    section.createDiv({ cls: 'metadata-title', text: title });

    const content = section.createDiv({ cls: 'metadata-content' });

    items.forEach(item => {
      const metadataItem = content.createDiv({ cls: 'metadata-item' });
      metadataItem.createDiv({ cls: 'metadata-key', text: item.key });
      metadataItem.createDiv({ cls: 'metadata-value', text: item.value });
    });
  }

  private createThemeSwitcher(): void {
    const themeSwitcher = this.container.createDiv({ cls: 'theme-switcher' });
    themeSwitcher.createDiv({ cls: 'theme-title', text: 'Switch Component Theme' });

    const themeButtons = themeSwitcher.createDiv({ cls: 'theme-buttons' });

    // Get available themes
    const themes = ['default', 'dark', 'colorful'];

    // Create a button for each theme
    themes.forEach(theme => {
      const button = themeButtons.createEl('button', {
        text: theme.charAt(0).toUpperCase() + theme.slice(1),
        cls: viewStyleManager.getActiveStyle(SAMPLE_VIEW_TYPE) === theme ? 'active' : ''
      });

      button.addEventListener('click', () => {
        // Apply the theme
        viewStyleManager.applyStyle(SAMPLE_VIEW_TYPE, theme);

        // Update active button
        themeButtons.querySelectorAll('button').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');

        new Notice(`Applied ${theme} theme to components`);
      });
    });
  }

  private createComponentSection(title: string): HTMLElement {
    const section = this.container.createDiv({ cls: 'component-section' });
    section.createDiv({ cls: 'section-title', text: title });
    return section.createDiv({ cls: 'section-content' });
  }

  public override async onClose(): Promise<void> {
    // Clean up event listeners if needed
    this.contentEl.empty();
    await Promise.resolve();
  }
}
