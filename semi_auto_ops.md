# TimeWaver 半自動出貨流程

這一版的目標只有一個：

- 客戶先填資料
- 綠界付款成功先記錄
- 你人工確認後，手動啟動 21 天寄信

這樣今天就能先避免「付款了但完全沒收到商品」。

## 會用到的檔案

- `n8n_timewaver_payment_intake.json`
- `n8n_ecpay_payment_callback_semi_auto.json`
- `n8n_sleep_prescription_manual_start.json`
- `n8n_sleep_prescription_from_payment.json`

## 1. 匯入付款前資料收集

匯入：

- `n8n_timewaver_payment_intake.json`

功能：

- 接收網站送來的基本資料
- 寫入 Google Sheet `工作表2`
- 狀態先記成 `pending`

網站已經會送到：

```text
https://erick303.app.n8n.cloud/webhook/timewaver-payment-intake
```

工作表2建議欄位：

- `created_at`
- `order_no`
- `buyer_name`
- `buyer_email`
- `buyer_phone`
- `product_code`
- `product_name`
- `trade_amt`
- `payment_url`
- `status`
- `source`

## 2. 匯入綠界付款成功 callback

匯入：

- `n8n_ecpay_payment_callback_semi_auto.json`

這份已經改成吃你現在正式收到的欄位：

- `succ`
- `amount`
- `od_sob`
- `od_hoho`
- `response_msg`
- `allsn`
- `gwsr`

功能：

- 只判斷是否付款成功
- 寫入 `payment_records`
- 保留原始 callback
- 不直接啟動 21 天

因為你現在這種 callback 還是沒有 `buyer_email`

## 3. 人工確認後手動啟動 21 天

匯入：

- `n8n_sleep_prescription_manual_start.json`

操作方式：

1. 打開 workflow
2. 進入 `Set Customer Data`
3. 把工作表2那筆客戶資料貼進去
4. 按 `Execute Workflow`

你要填的欄位：

- `buyer_name`
- `buyer_email`
- `buyer_phone`
- `product_code`
- `product_name`
- `merchant_trade_no`
- `trade_amt`

執行後會：

- 立即寄出 Day 1
- 寫入工作表1
- 後續 Day 3 / 7 / 14 / 21 繼續照排程跑

## 4. 正式 21 天主流程

保留：

- `n8n_sleep_prescription_from_payment.json`

我已經補成同時支援：

- `body.buyer_email`
- `buyer_email`

所以之後不管你是 webhook 交接，還是手動送完整欄位，都能吃。

## 今天的實際操作建議

1. 先匯入 `n8n_timewaver_payment_intake.json`
2. 再匯入 `n8n_ecpay_payment_callback_semi_auto.json`
3. 再匯入 `n8n_sleep_prescription_manual_start.json`
4. 用今天那兩筆已付款客戶，直接跑手動版，把 Day 1 補寄出去

## 這版的限制

- 還不是全自動
- 付款成功後，仍要人工從工作表2找到對應客戶
- 但它已經能先把出貨救起來

## 下一步再做的事

等半自動跑穩，再決定要不要升級成：

- 綠界 API 建單
- 用 `MerchantTradeNo` 或 `CustomField` 精準對單
- 全自動啟動 21 天
