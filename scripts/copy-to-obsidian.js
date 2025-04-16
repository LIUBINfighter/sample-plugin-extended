// This script copies files from dist/dev to the Obsidian plugins directory
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import os from 'os';
import { execSync } from 'child_process';

// Load environment variables from .env file
config();

// Get plugin name from manifest.json
let pluginName = 'sample-plugin-extended';
try {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    pluginName = manifest.id || pluginName;
  }
} catch (error) {
  console.warn(`Could not read plugin name from manifest.json: ${error.message}`);
}

// Files to copy from dist/dev to Obsidian plugins directory (excluding hotreload)
const filesToCopy = [
  'main.js',
  'styles.css',
  'manifest.json'
];

// Source directory
const sourceDir = path.join(process.cwd(), 'dist', 'dev');

/**
 * Auto-detect Obsidian plugins directory based on OS
 * @returns {string|null} The detected Obsidian plugins directory or null if not found
 */
function detectObsidianPluginsDir() {
  const homedir = os.homedir();
  let obsidianConfigDir = null;
  let obsidianDir = null;

  // Define possible Obsidian config locations based on OS
  const platform = process.platform;

  if (platform === 'win32') {
    // Windows
    obsidianDir = path.join(homedir, 'AppData', 'Local', 'Obsidian');
    // Also check for potential Obsidian installations in other drives
    const drives = [];

    // Try to get available drives on Windows
    try {
      const drivesOutput = execSync('wmic logicaldisk get caption').toString();
      const driveLetters = drivesOutput.match(/[A-Z]:/g) || [];
      drives.push(...driveLetters);
    } catch (error) {
      console.warn(`Could not detect drives: ${error.message}`);
      // Fallback to common drive letters
      drives.push('C:', 'D:', 'E:', 'F:');
    }

    // Check for .obsidian folder in common locations
    for (const drive of drives) {
      const possibleLocations = [
        path.join(drive, 'Users', os.userInfo().username, '.obsidian'),
        path.join(drive, '.obsidian'),
        path.join(drive, 'Obsidian'),
        path.join(drive, 'Documents', '.obsidian'),
        path.join(drive, 'Documents', 'Obsidian')
      ];

      for (const location of possibleLocations) {
        if (fs.existsSync(location)) {
          obsidianConfigDir = location;
          break;
        }
      }

      if (obsidianConfigDir) break;
    }
  } else if (platform === 'darwin') {
    // macOS
    obsidianConfigDir = path.join(homedir, 'Library', 'Application Support', 'obsidian');
    if (!fs.existsSync(obsidianConfigDir)) {
      obsidianConfigDir = path.join(homedir, '.obsidian');
    }
  } else {
    // Linux and others
    obsidianConfigDir = path.join(homedir, '.obsidian');
    if (!fs.existsSync(obsidianConfigDir)) {
      obsidianConfigDir = path.join(homedir, '.config', 'obsidian');
    }
  }

  // If we found Obsidian config dir, look for plugins directory
  if (obsidianConfigDir && fs.existsSync(obsidianConfigDir)) {
    // Check for vaults
    const vaults = [];

    // First check if the config dir itself is a vault
    if (fs.existsSync(path.join(obsidianConfigDir, 'plugins'))) {
      vaults.push(obsidianConfigDir);
    }

    // Then check if there are subdirectories that might be vaults
    try {
      const items = fs.readdirSync(obsidianConfigDir);
      for (const item of items) {
        const itemPath = path.join(obsidianConfigDir, item);
        if (fs.statSync(itemPath).isDirectory() && fs.existsSync(path.join(itemPath, 'plugins'))) {
          vaults.push(itemPath);
        }
      }
    } catch (error) {
      console.warn(`Error reading Obsidian config directory: ${error.message}`);
    }

    // If we found vaults, use the first one or let user choose
    if (vaults.length > 0) {
      // For simplicity, we'll use the first vault found
      // In a more advanced version, we could prompt the user to choose
      return path.join(vaults[0], 'plugins', pluginName);
    }
  }

  // If Obsidian directory was found but no vaults, check for plugins directly
  if (obsidianDir && fs.existsSync(obsidianDir)) {
    const pluginsDir = path.join(obsidianDir, 'plugins');
    if (fs.existsSync(pluginsDir)) {
      return path.join(pluginsDir, pluginName);
    }
  }

  return null;
}

// Determine destination directory
let destDir;

// First try to use the OBSIDIAN_CONFIG_FOLDER from .env
if (process.env.OBSIDIAN_CONFIG_FOLDER) {
  destDir = process.env.OBSIDIAN_CONFIG_FOLDER.endsWith(path.sep)
    ? process.env.OBSIDIAN_CONFIG_FOLDER.slice(0, -1)
    : process.env.OBSIDIAN_CONFIG_FOLDER;
} else {
  // Try to auto-detect Obsidian plugins directory
  const detectedDir = detectObsidianPluginsDir();

  if (detectedDir) {
    destDir = detectedDir;
    console.log(`Auto-detected Obsidian plugins directory: ${destDir}`);
    console.log(`Tip: To use a different directory, create a .env file with OBSIDIAN_CONFIG_FOLDER=your/path`);
  } else {
    // Fallback to default path
    destDir = path.join(process.cwd(), '..', '.obsidian', 'plugins', pluginName);
    console.warn(`Could not auto-detect Obsidian plugins directory. Using default: ${destDir}`);
    console.warn(`Tip: Create a .env file with OBSIDIAN_CONFIG_FOLDER=your/path to specify the directory`);
  }
}

/**
 * Copy files from dist/dev to Obsidian plugins directory
 */
function copyFiles() {
  // Ensure the source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory ${sourceDir} does not exist!`);
    return;
  }

  // Ensure the destination directory exists
  if (!fs.existsSync(destDir)) {
    try {
      fs.mkdirSync(destDir, { recursive: true });
      console.log(`Created destination directory ${destDir}`);
    } catch (error) {
      console.error(`Failed to create destination directory ${destDir}:`, error);
      return;
    }
  }

  // Copy each file
  filesToCopy.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);

    // Check if the source file exists
    if (fs.existsSync(sourcePath)) {
      try {
        // Copy the file
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} from dist/dev to Obsidian plugins directory`);
      } catch (error) {
        console.error(`Failed to copy ${file}:`, error);
      }
    } else {
      console.warn(`Source file ${sourcePath} does not exist, skipping`);
    }
  });

  console.log('File copying to Obsidian plugins directory complete!');
}

// Check if we should watch for changes
const shouldWatch = process.argv.includes('--watch');

// Copy files immediately
copyFiles();

// If watch mode is enabled, set up file watchers
if (shouldWatch) {
  console.log('Watching for changes in dist/dev directory...');

  // Create the watcher
  fs.watch(sourceDir, (eventType, filename) => {
    if (filesToCopy.includes(filename)) {
      console.log(`File ${filename} changed, copying to Obsidian plugins directory...`);
      const sourcePath = path.join(sourceDir, filename);
      const destPath = path.join(destDir, filename);

      // Copy the file
      if (fs.existsSync(sourcePath)) {
        try {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied ${filename} from dist/dev to Obsidian plugins directory`);
        } catch (error) {
          console.error(`Failed to copy ${filename}:`, error);
        }
      }
    }
  });
}
