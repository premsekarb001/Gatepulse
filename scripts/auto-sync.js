const { execSync } = require('child_process');

function runGitAutoSync() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (!status) {
      console.log('[Auto-Sync] No changes detected in workspace. Skipping commit.');
      return;
    }

    console.log('[Auto-Sync] Changes detected. Staging files...');
    execSync('git add .', { stdio: 'inherit' });

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const commitMsg = `auto: updates and changes saved (${timestamp})`;
    
    console.log(`[Auto-Sync] Committing: "${commitMsg}"...`);
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });

    console.log('[Auto-Sync] Pushing to GitHub origin main...');
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('✅ [Auto-Sync] Workspace successfully saved and pushed to GitHub!');
  } catch (error) {
    console.error('❌ [Auto-Sync Error]:', error.message || error);
  }
}

if (require.main === module) {
  runGitAutoSync();
}

module.exports = { runGitAutoSync };
