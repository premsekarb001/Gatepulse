const fs = require('fs');
const path = require('path');
const { runGitAutoSync } = require('./auto-sync');

const WATCH_DIRS = ['apps', 'services', 'packages'];
const ROOT_DIR = path.resolve(__dirname, '..');
const DEBOUNCE_DELAY_MS = 5000;

let debounceTimer = null;

console.log('👀 [Auto-Sync Watcher] Active! Monitoring file changes across /apps, /services, /packages...');

function triggerDebouncedSync(filePath) {
  // Ignore node_modules, .git, .next, dist, .expo
  if (filePath.includes('node_modules') || 
      filePath.includes('.git') || 
      filePath.includes('.next') || 
      filePath.includes('dist') || 
      filePath.includes('.expo') ||
      filePath.includes('package-lock.json')) {
    return;
  }

  console.log(`[File Modified] ${filePath}`);
  
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    console.log('\n⏱️ [Debounce Triggered] Executing Git Auto-Sync & Push...');
    runGitAutoSync();
  }, DEBOUNCE_DELAY_MS);
}

WATCH_DIRS.forEach((dirName) => {
  const dirPath = path.join(ROOT_DIR, dirName);
  if (fs.existsSync(dirPath)) {
    fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        triggerDebouncedSync(path.join(dirName, filename));
      }
    });
  }
});
