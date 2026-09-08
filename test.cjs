// Setup: npm install --no-save playwright && npx playwright install chromium
// Run: node test.cjs (optionally CHROMIUM_PATH=/path/to/chromium)
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}, locale:'ru-RU'});
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
    assert.equal(await page.locator('.service').count(),10);
    assert.equal(await page.locator('.master').count(),4);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.locator('[data-book="s0"]').click();
    await page.locator('[data-pick-master="any"]').click();
    assert.equal(await page.locator('[data-time="11:00"]').count(),0);
    assert.equal(await page.locator('[data-time="13:00"]').count(),0);
    await page.locator('[data-time]').first().click();
    await page.locator('#slot-next').click();
    await page.locator('[name="name"]').fill('Тест');
    await page.locator('[name="code"]').fill('1234');
    await page.locator('[name="consent"]').check();
    await page.locator('#auth-form [type="submit"]').click();
    await page.locator('#promo').fill('ПРИВЕТ');
    await page.locator('[data-action="apply-promo"]').click();
    assert.match(await page.locator('.summary').innerText(),/2\s?465/);
    await page.locator('#booking-consent').check();
    await page.locator('#confirm-form [type="submit"]').click();
    assert.match(await page.locator('#modal-title').innerText(),/Время для себя/);
    await page.reload();
    await page.locator('header [data-action="account"]').click();
    await page.locator('[data-cancel]').click();
    await page.locator('[data-confirm-cancel]').click();
    assert.match(await page.locator('#modal-content').innerText(),/Отменена/);
    assert.deepEqual(errors,[]);
    console.log('PASS: layout, services, masters, slots, login, promo, booking, persistence, cancellation.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
