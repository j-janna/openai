// Playwright configuration - 简单配置用于本项目的 E2E
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: 'test',
  timeout: 30 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
};
