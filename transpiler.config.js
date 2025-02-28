const fs = require('fs-extra');
const path = require('path');
const babel = require('@babel/core');

// Get the directory of the current script
const scriptDir = __dirname;

// Step 1: Transpile the source files using Babel programmatically
function transpileFile(inputPath, outputPath) {
  try {
    const result = babel.transformFileSync(inputPath, {
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    });
    fs.ensureFileSync(outputPath);
    fs.writeFileSync(outputPath, result.code, 'utf8');
    // console.log(`Transpiled: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error transpiling file ${inputPath}:`, error.message);
  }
}

function transpileDirectory(srcDir, libDir) {
  fs.readdirSync(srcDir).forEach(file => {
    const srcFilePath = path.join(srcDir, file);

    // Skip 'RootBackup.jsx' files
    if (path.basename(file) === 'RootBackup.jsx') {
      return;
    }

    const libFilePath = path.join(libDir, file.replace(/\.jsx?$/, '.js'));

    if (fs.statSync(srcFilePath).isDirectory()) {
      transpileDirectory(srcFilePath, libFilePath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      transpileFile(srcFilePath, libFilePath);
    } else {
      fs.copySync(srcFilePath, libFilePath);
    }
  });
}

// Step 2: Delete corresponding .jsx files in the src directory
function deleteJSXFiles(libDir, srcDir) {
  if (!fs.existsSync(srcDir)) return;

  fs.readdirSync(libDir).forEach(file => {
    const libFilePath = path.join(libDir, file);
    const srcFilePathJSX = path.join(srcDir, file.replace(/\.js$/, '.jsx'));

    if (fs.statSync(libFilePath).isDirectory()) {
      deleteJSXFiles(libFilePath, path.join(srcDir, file));
    } else if (file.endsWith('.js') && fs.existsSync(srcFilePathJSX)) {
      // Skip 'RootBackup.js' files
      if (path.basename(file) === 'RootBackup.jsx') {
      } else {
        fs.removeSync(srcFilePathJSX);
        // console.log(`Deleted: ${srcFilePathJSX}`);
      }
    }
  });
}

// Step 3: Copy transpiled files from lib to src
function copyLibToSrc() {
  const srcDir = path.join(scriptDir, 'src');
  const libDir = path.join(scriptDir, 'lib');

  deleteJSXFiles(libDir, srcDir);

  // Copy the transpiled files from lib to src, excluding 'RootBackup.js'
  fs.copySync(libDir, srcDir, {
    filter: (src, dest) => {
      if (path.basename(src) === 'RootBackup.jsx') {
        return false;
      }
      return true;
    }
  });
  // console.log('Files moved from lib to src.');
}

// Main function to run the steps
function main() {
  const srcDir = path.join(scriptDir, 'src');
  const libDir = path.join(scriptDir, 'lib');

  transpileDirectory(srcDir, libDir);
  copyLibToSrc();
}

// Execute the script
main();
