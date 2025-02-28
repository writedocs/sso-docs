const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const babel = require('@babel/core');

const backupDir = path.join(__dirname, '../src/backup');
const targetDir = path.join(__dirname, '../src/theme');
const backupFileName = 'RootBackup.jsx';
const targetFileName = 'Root.js';

// Full paths
const backupFilePath = path.join(backupDir, backupFileName);
const targetFilePath = path.join(targetDir, targetFileName);

// Function to restore the original file content
function restoreOriginalFile() {
  try {
    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      console.error(`Backup file not found at ${backupFilePath}`);
      process.exit(1);
    }

    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      // console.log(`Created target directory: ${targetDir}`);
    }

    // Read the backup file content
    const originalContent = fs.readFileSync(backupFilePath, 'utf8');

    // Write the original content to the target file
    fs.writeFileSync(targetFilePath, originalContent, 'utf8');
    // console.log(`Successfully restored ${targetFilePath} from backup.`);
  } catch (error) {
    console.error(`Failed to restore the original file: ${error.message}`);
    process.exit(1); // Exit with a failure code
  }
}

function transpileFile(path) {
  try {
    const result = babel.transformFileSync(path, {
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    });
    fse.ensureFileSync(path);
    fse.writeFileSync(path, result.code, 'utf8');
    // console.log(`Transpiled: ${path} -> ${path}`);
  } catch (error) {
    console.error(`Error transpiling file ${path}:`, error.message);
  }
}

function main() {
  restoreOriginalFile();
  transpileFile(targetFilePath);
}

main();