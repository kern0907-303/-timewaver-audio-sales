import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("installs ABL analytics page view tracking", () => {
  assert.match(html, /ABL_ANALYTICS_SITE_ID\s*=\s*["']timewaver_audio_sales["']/);
  assert.match(html, /trackAblEvent\(["']page_view["']\)/);
});

test("tracks purchase click and possible payment success return", () => {
  assert.match(html, /trackAblEvent\(["']audio_purchase_click["']/);
  assert.match(html, /trackAblEvent\(["']payment_success["']/);
});

test("supports result-aware product highlighting from assessment links", () => {
  assert.match(html, /data-product-card="A"/);
  assert.match(html, /data-product-card="B"/);
  assert.match(html, /data-product-card="C"/);
  assert.match(html, /data-product-card="D"/);
  assert.match(html, /highlightRecommendedProduct/);
  assert.match(html, /URLSearchParams\(window\.location\.search\)/);
});

test("sales page acknowledges visitors coming from the sleep checkpoint test", () => {
  assert.match(html, /如果你剛完成睡前卡點檢測/);
  assert.match(html, /先看對應你的那一款/);
});
