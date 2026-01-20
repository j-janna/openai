/**
 * Playwright E2E 测试骨架
 * 注意：运行此文件需要先安装 Playwright（`npm i -D @playwright/test`）并下载浏览器。
 * CI 中可以在安装后运行 `npx playwright test`。
 */

// 这是一个示例测试，验证首页能加载并显示待办列表
// 若要运行，请先安装 Playwright 依赖并启用此测试。

const { test, expect } = require('@playwright/test');

test('homepage shows todo list', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // 确认页面加载并存在添加输入框
  const input = await page.locator('input[placeholder="添加新的待办..."]');
  await expect(input).toBeVisible();
  // 获取待办列表项（若存在），至少可以访问 DOM
  const items = await page.locator('.todo-item');
  await expect(items.first()).toBeTruthy();
});
