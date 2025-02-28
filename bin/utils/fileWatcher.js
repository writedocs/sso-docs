const path = require('path');
const chokidar = require('chokidar');
const { processFileOnUpdate } = require('./processFile');

const startFileWatcher = (projectRoot) => {
  const mdxFilesPath = path.join(projectRoot, 'docs');
  const watcher = chokidar.watch(mdxFilesPath, {
    ignored: /node_modules/,
    persistent: true,
  });

  // Event handlers
  watcher
    .on('add', (filePath) => {
      processFileOnUpdate(projectRoot, filePath);
    })
    .on('change', (filePath) => {
      processFileOnUpdate(projectRoot, filePath);
    })
    .on('error', (error) => {
      console.error(`Error: ${error}`);
    });
};

module.exports = {
  startFileWatcher
}