// scripts/publish-report.js
const ghpages = require('gh-pages');
const path = require('path');

const srcDir = path.resolve('.playwright-report');

ghpages.publish(
  srcDir,
  {
    branch: 'gh-pages',
    message: 'publish: latest Playwright report',
    dotfiles: true,
    add: false, // overwrite each run
  },
  (err) => {
    if (err) {
      console.error('❌ Report publish failed:', err);
      process.exit(1);
    } else {
      const url = 'https://dgavero.github.io/playwright-automation-template/index.html';
      console.log(`✅ Report published: ${url}`);
    }
  }
);
