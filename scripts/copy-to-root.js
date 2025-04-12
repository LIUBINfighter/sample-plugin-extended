// This script copies files from dist/dev to the root directory
import fs from 'fs';
import path from 'path';

// Files to copy from dist/dev to root
const filesToCopy = [
  'main.js',
  'styles.css',
  'manifest.json'
];

// Source and destination directories
const sourceDir = path.join(process.cwd(), 'dist', 'dev');
const destDir = process.cwd();

/**
 * Copy files from dist/dev to root directory
 */
function copyFiles() {
  // Ensure the source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory ${sourceDir} does not exist!`);
    return;
  }

  // Copy each file
  filesToCopy.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);

    // Check if the source file exists
    if (fs.existsSync(sourcePath)) {
      // Copy the file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} from dist/dev to root directory`);
    } else {
      console.warn(`Source file ${sourcePath} does not exist, skipping`);
    }
  });

  console.log('File copying complete!');
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
      console.log(`File ${filename} changed, copying to root directory...`);
      const sourcePath = path.join(sourceDir, filename);
      const destPath = path.join(destDir, filename);

      // Copy the file
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${filename} from dist/dev to root directory`);
      }
    }
  });
}
