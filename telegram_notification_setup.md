# Telegram 付款成功通知設定

這份設定是接在你現有的 `ECPay to Google Sheet` workflow 後面。

建議流程：

`Google Sheets (Append Payment)` -> `Telegram 通知` -> `Respond Success`

## 先準備 Telegram Bot

1. 在 Telegram 搜尋 `@BotFather`
2. 輸入 `/newbot`
3. 建立完成後會拿到一組 Bot Token
4. 把你的 bot 加進你要收通知的個人聊天室或群組
5. 傳一則任意訊息給 bot

## 取得 Chat ID

在瀏覽器打開下面網址，把 `YOUR_BOT_TOKEN` 換成你的 token：

```text
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```

回傳 JSON 裡找到：

- 個人聊天：`message.chat.id`
- 群組聊天：`message.chat.id`，通常是負數

這就是你的 `chat_id`

## 在 n8n 新增節點

在 `Google Sheets (Append Payment)` 後面新增一個 `HTTP Request` 節點。

### 節點名稱

`Telegram Notify`

### Parameters

- Method: `POST`
- URL:

```text
=https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage
```

- Send Body: `On`
- Body Content Type: `Form URL Encoded`

### Body Parameters

1. `chat_id`

```text
YOUR_CHAT_ID
```

2. `text`

用 expression：

```text
=🟢 綠界付款成功

商品：{{ $json.product_name || '未知商品' }}
商品代碼：{{ $json.product_code || '' }}
金額：NT${{ $json.trade_amt || '' }}
訂單編號：{{ $json.merchant_trade_no || '' }}
交易編號：{{ $json.trade_no || '' }}
姓名：{{ $json.buyer_name || '' }}
Email：{{ $json.buyer_email || '' }}
電話：{{ $json.buyer_phone || '' }}
時間：{{ $json.created_at || '' }}
```

3. `parse_mode`

```text
HTML
```

## Connections

把連線改成：

`Google Sheets (Append Payment)` -> `Telegram Notify` -> `Respond Success`

也就是說：

- 原本 `Google Sheets (Append Payment)` 直接連到 `Respond Success`
- 現在改成先連 `Telegram Notify`
- `Telegram Notify` 再連到 `Respond Success`

## 測試方式

1. 先用 `webhook-test` 送假資料
2. 確認 Google Sheet 有新增一列
3. 確認 Telegram 有收到通知
4. 最後再把 workflow 設成 `Active`

## 注意

- `YOUR_BOT_TOKEN` 不要放到公開 repo
- 如果你要推 GitHub，建議在 n8n UI 直接填，不要把真實 token 存進 JSON
- 如果是群組，先確認 bot 已被加入群組，且有發言權限
