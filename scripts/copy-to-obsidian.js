// This script copies files from dist/dev to the Obsidian plugins directory
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Files to copy from dist/dev to Obsidian plugins directory (excluding hotreload)
const filesToCopy = [
  'main.js',
  'styles.css',
  'manifest.json'
];

// Source and destination directories
const sourceDir = path.join(process.cwd(), 'dist', 'dev');

// Use the OBSIDIAN_CONFIG_FOLDER environment variable if available, otherwise use the default path
const obsidianConfigFolder = process.env.OBSIDIAN_CONFIG_FOLDER || path.join(process.cwd(), '..', '.obsidian', 'plugins', 'sample-plugin-extended');

// Remove trailing slash if present
const destDir = obsidianConfigFolder.endsWith(path.sep)
  ? obsidianConfigFolder.slice(0, -1)
  : obsidianConfigFolder;

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
