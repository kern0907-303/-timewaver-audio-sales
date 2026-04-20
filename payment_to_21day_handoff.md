# 綠界付款成功 -> 21 天計劃交接方式

這份說明是給你把「綠界付款成功 workflow」接到「21 天 email drip workflow」用的。

## 建議架構

不要讓 21 天 workflow 直接吃綠界原始 callback。

比較穩的做法是：

1. `ECPay to Google Sheet` workflow 收到付款成功通知
2. 寫入付款紀錄
3. Telegram 通知
4. 再用一個 `HTTP Request` 或 `Execute Workflow` 把整理好的資料送到 21 天 workflow

這樣做的好處：

- 21 天 workflow 只吃乾淨欄位，不碰綠界原始格式
- 日後你改金流或加商品，不用重寫整條 drip
- 比較容易做重送、排錯、補單

## 21 天 workflow 建議接收欄位

新版檔案：

[n8n_sleep_prescription_from_payment.json](/Users/erickair/Desktop/timewaver-audio-sales/n8n_sleep_prescription_from_payment.json)

入口 webhook path：

```text
timewaver-21day-start
```

建議送進去的 body：

```json
{
  "buyer_name": "王小明",
  "buyer_email": "test@example.com",
  "buyer_phone": "0912345678",
  "product_code": "A",
  "product_name": "【A劑】斷路器・沉靜頻率",
  "merchant_trade_no": "A-20260408-0001",
  "trade_amt": "299"
}
```

## 在付款 workflow 新增一個 HTTP Request 節點

建議加在：

`Telegram Notify` 之後，`Respond Success` 之前

### Method

`POST`

### URL

```text
https://你的n8n網域/webhook/timewaver-21day-start
```

例如你的網域：

```text
https://erick303.app.n8n.cloud/webhook/timewaver-21day-start
```

### Body Content Type

`JSON`

### JSON Body

```json
{
  "buyer_name": "={{ $json.buyer_name }}",
  "buyer_email": "={{ $json.buyer_email }}",
  "buyer_phone": "={{ $json.buyer_phone }}",
  "product_code": "={{ $json.product_code }}",
  "product_name": "={{ $json.product_name }}",
  "merchant_trade_no": "={{ $json.merchant_trade_no }}",
  "trade_amt": "={{ $json.trade_amt }}"
}
```

## 這份新版 21 天 workflow 已調整的地方

- 入口從表單改成付款交接 webhook
- 新增 `Normalize Payment Payload`
- 後面全部改吃：
  - `client_name`
  - `client_email`
  - `client_phone`
  - `prescription_type`
- A / B / C / D 判斷改用 `product_code`
- Google Sheet 初始紀錄改寫付款啟動資料
- 四種音頻的 Day 3 / 7 / 14 / 21 內容已分開寫

## 你現在要改的地方

1. 匯入 [n8n_sleep_prescription_from_payment.json](/Users/erickair/Desktop/timewaver-audio-sales/n8n_sleep_prescription_from_payment.json)
2. 在新 workflow 裡補：
   - Google Sheets credential
   - SMTP credential
   - Google Sheet ID
3. 在付款 workflow 加一個 `HTTP Request` 節點，把付款資料送到：

```text
https://erick303.app.n8n.cloud/webhook/timewaver-21day-start
```

4. 先用假資料測一次
5. 確認 Day 1 有寄出，再開啟正式版

## 最重要的提醒

現在這條 21 天 workflow 是「付款成功就啟動」。

所以如果你不想重複啟動同一個人：

- 建議在付款 workflow 先檢查 `merchant_trade_no`
- 或在 21 天 workflow 最前面加一段「是否已存在」的去重判斷

這是下一步最值得補的保險。
